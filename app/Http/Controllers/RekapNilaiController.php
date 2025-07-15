<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\JadwalUjian;
use App\Models\Pengerjaan;
use App\Models\Penjadwalan;
use App\Models\Peserta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Exports\NilaiExport;
use Maatwebsite\Excel\Facades\Excel;

class RekapNilaiController extends Controller
{
    public function index(Request $request)
    {
        $pages = $request->query('pages', 10);
        $search = $request->query('search', null);

        // Eager load relationships for better performance
        $query = Penjadwalan::with(['event', 'jenis_ujian']);

        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('jenis_ujian', function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%");
                })
                ->orWhereHas('event', function ($q) use ($search) {
                    $q->where('nama_event', 'like', "%{$search}%");
                })
                ->orWhere('jenis_ujian', 'like', "%{$search}%");
            });
        }

        $ujianList = $query->paginate((int)$pages)->withQueryString();

        // Transform the data to match the expected format in the frontend
        $ujianList->getCollection()->transform(function ($item) {
            return [
                'id' => $item->id_penjadwalan,
                'tipe' => is_object($item->jenis_ujian) ? $item->jenis_ujian->nama : $item->tipe_ujian,
                'paket' => $item->event ? $item->event->nama_event : $item->paket_ujian,
                'tanggal' => $item->tanggal ? $item->tanggal->format('d/m/Y') : null,
                'mulai' => $item->mulai,
                'selesai' => $item->selesai,
                'kuota' => $item->kuota,
                'status' => $this->getUjianStatus($item),
            ];
        });

        return Inertia::render('rekap-nilai', [
            'initialData' => $ujianList,
            'filters' => [
                'search' => $search,
                'pages' => $pages,
            ],
        ]);
    }

    public function show(Request $request, $id)
    {
        try {
            $penjadwalan = Penjadwalan::with(['event', 'jenis_ujian'])->findOrFail($id);
            $perPage = (int)$request->input('studentEntriesPerPage', 10);
            $page = (int)$request->input('page', 1);
            $search = $request->input('search');

            // Get the JadwalUjian for this Penjadwalan
            $jadwalUjian = JadwalUjian::where('id_penjadwalan', $id)->first();

            if (!$jadwalUjian) {
                return response()->json([
                    'error' => 'Jadwal ujian tidak ditemukan'
                ], 404);
            }

            // Get base query tanpa relasi jawaban
            $query = Pengerjaan::with(['peserta'])
                ->where('id_jadwal', $jadwalUjian->id_ujian);

            // Apply search if provided
            if ($search) {
                $query->whereHas('peserta', function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%");
                });
            }

            // Get total count before pagination
            $totalRecords = $query->count();

            // Get all completed tests for average calculations
            $completedTests = $query->whereNotNull('nilai')->where('nilai', '>=', 0)->get();

            // Inisialisasi array untuk statistik
            $benarArr = [];
            $salahArr = [];
            $scoreArr = [];
            foreach ($completedTests as $test) {
                $benar = (int)($test->jawaban_benar ?? 0);
                $total = (int)($test->total_soal ?? 0);
                $salah = $total - $benar;
                $benarArr[] = $benar;
                $salahArr[] = $salah;
                $scoreArr[] = round($test->nilai ?? 0);
            }
            $count = count($completedTests);
            $averages = [
                'benar' => $count ? round(array_sum($benarArr) / $count) : 0,
                'salah' => $count ? round(array_sum($salahArr) / $count) : 0,
                'score' => $count ? round(array_sum($scoreArr) / $count) : 0
            ];
            $maxScore = $count ? max($scoreArr) : 0;
            $minScore = $count ? min($scoreArr) : 0;

            // Get paginated data
            $query = Pengerjaan::with(['peserta'])
                ->where('id_jadwal', $jadwalUjian->id_ujian)
                ->skip(($page - 1) * $perPage)
                ->take($perPage);

            if ($search) {
                $query->whereHas('peserta', function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%");
                });
            }

            // Transform student data
            $startNumber = ($page - 1) * $perPage + 1;
            $transformedStudentData = $query->get()->map(function ($item, $index) use ($startNumber) {
                $peserta = $item->peserta;
                $total_soal = (int)($item->total_soal ?? 0);
                $soal_benar = (int)($item->jawaban_benar ?? 0);
                $soal_salah = $total_soal - $soal_benar;
                $nilai = round($item->nilai ?? 0);
                return [
                    'no' => $startNumber + $index,
                    'nama' => $peserta ? $peserta->nama : 'Peserta tidak ditemukan',
                    'jumlah_soal' => $total_soal,
                    'soal_benar' => $soal_benar,
                    'soal_salah' => $soal_salah,
                    'nilai' => $nilai,
                    // Untuk kompatibilitas frontend lama:
                    'benar' => $soal_benar . '/' . $total_soal
                ];
            });

            // Ambil semua data siswa untuk chart (tanpa pagination, tanpa filter search)
            $allStudentRaw = Pengerjaan::with(['peserta'])
                ->where('id_jadwal', $jadwalUjian->id_ujian)
                ->get();

            $allStudentData = $allStudentRaw->map(function ($item, $index) {
                $peserta = $item->peserta;
                $total_soal = (int)($item->total_soal ?? 0);
                $soal_benar = (int)($item->jawaban_benar ?? 0);
                $soal_salah = $total_soal - $soal_benar;
                $nilai = round($item->nilai ?? 0);
                return [
                    'no' => $index + 1,
                    'nama' => $peserta ? $peserta->nama : 'Peserta tidak ditemukan',
                    'jumlah_soal' => $total_soal,
                    'soal_benar' => $soal_benar,
                    'soal_salah' => $soal_salah,
                    'nilai' => $nilai,
                ];
            });

            // Calculate statistics
            $baseQuery = Pengerjaan::where('id_jadwal', $jadwalUjian->id_ujian);
            $registeredStudents = (clone $baseQuery)->count();
            $finishedStudents = (clone $baseQuery)->where('selesai', true)->count();
            $absentStudents = $registeredStudents - $finishedStudents;

            $stats = [
                'totalStudents' => $registeredStudents,
                'absentStudents' => $absentStudents,
                'finishedStudents' => $finishedStudents,
                'averageScores' => $averages,
                'maxScore' => $maxScore,
                'minScore' => $minScore,
            ];

            return response()->json([
                'studentData' => $transformedStudentData,
                'pagination' => [
                    'total' => $totalRecords,
                    'perPage' => $perPage,
                    'currentPage' => $page,
                    'lastPage' => ceil($totalRecords / $perPage)
                ],
                'stats' => $stats,
                // Tambahkan seluruh data siswa untuk chart
                'allStudentData' => $allStudentData,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in RekapNilaiController@show: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'error' => 'Terjadi kesalahan saat memuat data',
                'message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function export($id)
    {
        try {
            $jadwalUjian = JadwalUjian::where('id_penjadwalan', $id)->first();
            
            if (!$jadwalUjian) {
                return response()->json([
                    'error' => 'Jadwal ujian tidak ditemukan'
                ], 404);
            }

            return Excel::download(new NilaiExport($jadwalUjian->id_ujian), 'rekapnilai.xlsx');
        } catch (\Exception $e) {
            Log::error('Error in RekapNilaiController@export: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'error' => 'Terjadi kesalahan saat mengekspor data',
                'message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    private function getUjianStatus($penjadwalan)
    {
        $now = now();
        $tanggal = $penjadwalan->tanggal;
        $mulai = $penjadwalan->mulai;
        $selesai = $penjadwalan->selesai;

        if (!$tanggal || !$mulai || !$selesai) {
            return 'Not Scheduled';
        }

        $ujianStart = $tanggal->copy()->setTimeFromTimeString($mulai);
        $ujianEnd = $tanggal->copy()->setTimeFromTimeString($selesai);

        if ($now < $ujianStart) {
            return 'Scheduled';
        } elseif ($now >= $ujianStart && $now <= $ujianEnd) {
            return 'In Progress';
        } else {
            return 'Finished';
        }
    }

    private function validateStatistics($totalStudents, $presentStudents, $finishedStudents)
    {
        $warnings = [];
        
        // Ensure no negative values
        $totalStudents = max(0, $totalStudents);
        $presentStudents = max(0, $presentStudents);
        $finishedStudents = max(0, $finishedStudents);
        
        // Calculate absent students
        $absentStudents = max(0, $totalStudents - $presentStudents);
        
        // Validate finished students count
        if ($finishedStudents > $totalStudents) {
            $warnings[] = 'Jumlah siswa yang selesai tidak boleh melebihi total siswa';
            $finishedStudents = $totalStudents;
        }
        
        // Validate present students count
        if ($presentStudents > $totalStudents) {
            $warnings[] = 'Jumlah siswa yang hadir tidak boleh melebihi total siswa';
            $presentStudents = $totalStudents;
            $absentStudents = 0;
        }
        
        // Validate finished vs present students
        if ($finishedStudents > $presentStudents) {
            $warnings[] = 'Jumlah siswa yang selesai tidak boleh melebihi jumlah siswa yang hadir';
            $finishedStudents = $presentStudents;
        }
        
        return [
            'totalStudents' => $totalStudents,
            'presentStudents' => $presentStudents,
            'finishedStudents' => $finishedStudents,
            'absentStudents' => $absentStudents,
            'warnings' => $warnings,
            'hasAnomalies' => count($warnings) > 0
        ];
    }
}
