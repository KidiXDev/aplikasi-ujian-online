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
                // Kolom pada relasi jenis_ujian (t_kat_soal) adalah 'kategori', bukan 'nama'
                $q->whereHas('jenis_ujian', function ($q) use ($search) {
                    $q->where('kategori', 'like', "%{$search}%");
                })
                ->orWhereHas('event', function ($q) use ($search) {
                    $q->where('nama_event', 'like', "%{$search}%");
                })
                // Kolom 'jenis_ujian' di tabel utama adalah integer (id), jadi pencarian like tidak relevan, bisa dihapus atau diganti jika perlu
                ;
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
            $exam_id = $request->input('exam_id');

            // Get the JadwalUjian for this Penjadwalan, filter by exam_id (id_ujian) if provided
            $jadwalUjian = null;
            if ($exam_id) {
                $jadwalUjian = JadwalUjian::where('id_penjadwalan', $id)
                    ->where('id_ujian', $exam_id)
                    ->first();
            } else {
                $jadwalUjian = JadwalUjian::where('id_penjadwalan', $id)->first();
            }

            if (!$jadwalUjian) {
                return inertia('rekap-nilai-student', [
                    'ujian' => [
                        'id' => $exam_id,
                        'id_penjadwalan' => $id,
                        'nama_ujian' => 'Jadwal ujian tidak ditemukan',
                    ],
                    'studentData' => [
                        'data' => [],
                        'currentPage' => 1,
                        'perPage' => $perPage,
                        'total' => 0,
                        'lastPage' => 1,
                    ],
                    'filters' => [
                        'search' => $search,
                        'page' => $page,
                        'perPage' => $perPage,
                        'total' => 0,
                        'lastPage' => 1,
                    ],
                ]);
            }

            // Ambil daftar peserta dari kode_kelas pada jadwal ujian
            $participantIds = [];
            if ($jadwalUjian->kode_kelas) {
                $kodeKelasClean = trim(strval($jadwalUjian->kode_kelas));
                if (!empty($kodeKelasClean)) {
                    $rawIds = explode(',', $kodeKelasClean);
                    foreach ($rawIds as $rawId) {
                        $cleanId = trim($rawId);
                        if (!empty($cleanId) && is_numeric($cleanId)) {
                            $participantIds[] = intval($cleanId);
                        }
                    }
                    $participantIds = array_unique($participantIds);
                    sort($participantIds);
                }
            }


            // Query seluruh peserta untuk statistik global
            $allPesertaList = Peserta::whereIn('id', $participantIds)->get();
            $jadwalUjianSoal = \App\Models\JadwalUjianSoal::where('id_ujian', $jadwalUjian->id_ujian)->first();
            $totalQuestions = $jadwalUjianSoal ? $jadwalUjianSoal->total_soal : 0;

            // Statistik global dan data peserta untuk chart
            $allStudentStats = $allPesertaList->map(function ($peserta) use ($jadwalUjian, $totalQuestions) {
                $pengerjaan = Pengerjaan::where('id_peserta', $peserta->id)
                    ->where('id_ujian', $jadwalUjian->id_ujian)
                    ->first();
                if ($pengerjaan === null) {
                    $status = 'not_started';
                } else if ($pengerjaan->selesai == 1) {
                    $status = 'finish';
                } else {
                    $status = 'active';
                }
                $nilai = $pengerjaan !== null ? $pengerjaan->nilai : null;
                return [
                    'nama' => $peserta->nama,
                    'jumlah_soal' => $totalQuestions,
                    'soal_benar' => $pengerjaan ? (int)($pengerjaan->jawaban_benar ?? 0) : null,
                    'soal_salah' => $pengerjaan ? $totalQuestions - (int)($pengerjaan->jawaban_benar ?? 0) : null,
                    'nilai' => $nilai,
                    'status' => $status,
                ];
            });
            $statsTotal = $allStudentStats->count();
            $statsFinished = $allStudentStats->where('status', 'finish')->count();
            $statsAbsent = $allStudentStats->where('status', 'not_started')->count();
            $nilaiList = $allStudentStats->where('status', 'finish')->pluck('nilai')->filter(fn($n) => $n !== null);
            $statsAverage = $nilaiList->count() > 0 ? round($nilaiList->avg(), 2) : null;
            $statsMax = $nilaiList->count() > 0 ? $nilaiList->max() : null;
            $statsMin = $nilaiList->count() > 0 ? $nilaiList->min() : null;

            // Data untuk tabel (paginated)
            $pesertaQuery = Peserta::whereIn('id', $participantIds);
            if ($search) {
                $pesertaQuery->where('nama', 'like', "%{$search}%");
            }
            $totalRecords = $pesertaQuery->count();
            $pesertaList = $pesertaQuery->skip(($page - 1) * $perPage)->take($perPage)->get();
            $transformedStudentData = $pesertaList->map(function ($peserta, $idx) use ($page, $perPage, $jadwalUjian, $totalQuestions, $exam_id) {
                $pengerjaan = Pengerjaan::where('id_peserta', $peserta->id)
                    ->where('id_ujian', $jadwalUjian->id_ujian)
                    ->first();
                $soal_benar = $pengerjaan ? (int)($pengerjaan->jawaban_benar ?? 0) : null;
                $jumlah_soal = $totalQuestions;
                $soal_salah = $soal_benar !== null ? $jumlah_soal - $soal_benar : null;
                $nilai = $pengerjaan !== null ? $pengerjaan->nilai : null;
                if ($pengerjaan === null) {
                    $status = 'not_started';
                } else if ($pengerjaan->selesai == 1) {
                    $status = 'finish';
                } else {
                    $status = 'active';
                }
                return [
                    'no' => ($page - 1) * $perPage + $idx + 1,
                    'nama' => $peserta->nama,
                    'jumlah_soal' => $jumlah_soal,
                    'soal_benar' => $soal_benar,
                    'soal_salah' => $soal_salah,
                    'nilai' => $nilai,
                    'benar' => $soal_benar !== null ? ($soal_benar . '/' . $jumlah_soal) : '-/' . $jumlah_soal,
                    'status' => $status,
                ];
            });

            return inertia('rekap-nilai-student', [
                'ujian' => [
                    'id' => $jadwalUjian->id_ujian,
                    'id_penjadwalan' => $jadwalUjian->id_penjadwalan,
                    'nama_ujian' => $jadwalUjian->nama_ujian,
                ],
                'studentData' => [
                    'data' => $transformedStudentData,
                    'currentPage' => $page,
                    'perPage' => $perPage,
                    'total' => $totalRecords,
                    'lastPage' => ceil($totalRecords / $perPage),
                ],
                'studentStats' => [
                    'total' => $statsTotal,
                    'finished' => $statsFinished,
                    'absent' => $statsAbsent,
                    'average' => $statsAverage,
                    'max' => $statsMax,
                    'min' => $statsMin,
                    // Kirim seluruh data peserta untuk chart
                    'allStudents' => $allStudentStats,
                ],
                'filters' => [
                    'search' => $search,
                    'page' => $page,
                    'perPage' => $perPage,
                    'total' => $totalRecords,
                    'lastPage' => ceil($totalRecords / $perPage),
                ],
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in RekapNilaiController@show: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            
            return response()->json([
                'error' => 'Terjadi kesalahan saat memuat data',
                'message' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Preview page for Rekap Nilai (list peserta per ujian)
     */
    public function preview(Request $request, $id)
    {
        $pages = $request->query('pages', 10);
        $search = $request->query('search', null);
        $page = $request->query('page', 1);
        $perPage = $pages;

        // Get ujian data
        $penjadwalan = Penjadwalan::with(['event', 'jenis_ujian'])->findOrFail($id);
        $ujian = [
            'id' => $penjadwalan->id_penjadwalan,
            'tipe' => is_object($penjadwalan->jenis_ujian) ? $penjadwalan->jenis_ujian->nama : $penjadwalan->tipe_ujian,
            'paket' => $penjadwalan->event ? $penjadwalan->event->nama_event : $penjadwalan->paket_ujian,
            'tanggal' => ($penjadwalan->tanggal instanceof \Carbon\Carbon) ? $penjadwalan->tanggal->format('d/m/Y') : ($penjadwalan->tanggal ?? null),
            'mulai' => $penjadwalan->mulai,
            'selesai' => $penjadwalan->selesai,
            'kuota' => $penjadwalan->kuota,
            'status' => $this->getUjianStatus($penjadwalan),
        ];

        // Query JadwalUjian (exam parts) for this penjadwalan
        $query = JadwalUjian::where('id_penjadwalan', $id);
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_part', 'like', "%{$search}%")
                    ->orWhere('kode_kelas', 'like', "%{$search}%")
                    ->orWhere('nama_ujian', 'like', "%{$search}%")
                    ->orWhere('id_ujian', 'like', "%{$search}%");
            });
        }
        $jadwalUjianList = $query->paginate((int)$perPage)->withQueryString();

        // Transform the data to match the expected format in the frontend
        $jadwalUjianList->getCollection()->transform(function ($item) {
            return [
                'id_ujian' => $item->id_ujian,
                'nama_ujian' => $item->nama_ujian, // Using nama_ujian from database
                'kode_part' => $item->kode_part,
                'kode_kelas' => $item->kode_kelas,
                'id_penjadwalan' => $item->id_penjadwalan,
            ];
        });

        // Compose filters for pagination
        $filters = [
            'search' => $search,
            'pages' => $pages,
            'page' => $jadwalUjianList->currentPage(),
            'per_page' => $jadwalUjianList->perPage(),
            'total' => $jadwalUjianList->total(),
            'last_page' => $jadwalUjianList->lastPage(),
        ];

        return Inertia::render('rekap-nilai-preview', [
            'ujian' => $ujian,
            'jadwalUjianList' => $jadwalUjianList,
            'filters' => $filters,
        ]);
    }

    public function export(Request $request, $id)
    {
        try {
            // Mendukung export berdasarkan exam_id (part ujian) jika ada
            $exam_id = $request->query('exam_id');
            $search = $request->query('search');

            // Perbaikan utama: pastikan route yang digunakan adalah /rekap-nilai/{id}/export
            // dan parameter $id adalah id_penjadwalan, exam_id adalah id_ujian
            $jadwalUjian = JadwalUjian::where('id_penjadwalan', $id)
                ->when($exam_id, function($q) use ($exam_id) {
                    $q->where('id_ujian', $exam_id);
                })
                ->first();

            if (!$jadwalUjian) {
                return response()->json([
                    'error' => 'Jadwal ujian tidak ditemukan'
                ], 404);
            }

            // Kirim exam_id dan search ke NilaiExport
            return Excel::download(new NilaiExport($jadwalUjian->id_ujian, $search), 'rekapnilai.xlsx');
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
