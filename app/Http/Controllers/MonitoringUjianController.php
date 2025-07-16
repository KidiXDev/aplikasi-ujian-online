<?php

namespace App\Http\Controllers;

use App\Models\Penjadwalan;
use App\Models\JadwalUjian;
use App\Models\JadwalUjianSoal;
use App\Models\Pengerjaan;
use App\Models\PengerjaanJawaban;
use App\Models\Peserta;
use App\Models\KategoriSoal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonitoringUjianController extends Controller
{
    /**
     * Display a listing of monitoring ujian.
     */
    public function index(Request $request)
    {
        $pages = $request->query('pages', 10);
        $search = $request->query('search', null);
        $tipeUjian = $request->query('tipe_ujian', null);
        $sort = $request->query('sort', 'newest');

        // Eager load both event and jenis_ujian relationships
        $query = Penjadwalan::with(['event', 'jenis_ujian']);

        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('event', function ($q) use ($search) {
                    $q->where('nama_event', 'like', "%{$search}%");
                })
                    ->orWhere('paket_ujian', 'like', "%{$search}%")
                    ->orWhere('kelas_prodi', 'like', "%{$search}%");
            });
        }

        // Apply tipe ujian filter if provided
        if ($tipeUjian) {
            $query->whereHas('jenis_ujian', function ($q) use ($tipeUjian) {
                $q->where('kategori', $tipeUjian);
            });
        }

        // Apply sorting
        switch ($sort) {
            case 'oldest':
                $query->orderBy('tanggal', 'asc');
                break;
            case 'tipe_ujian':
                $query->join('data_db.t_kat_soal as kat', 'penjadwalan.tipe_ujian', '=', 'kat.id')
                    ->orderBy('kat.kategori', 'asc')
                    ->select('penjadwalan.*'); // Ensure we only select from penjadwalan table
                break;
            case 'kuota_asc':
                $query->orderBy('kuota', 'asc');
                break;
            case 'kuota_desc':
                $query->orderBy('kuota', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('tanggal', 'desc');
                break;
        }

        $ujianList = $query->paginate((int)$pages)->withQueryString();

        // Transform the data to match the expected format in the frontend
        $ujianList->getCollection()->transform(function ($item) {
            return [
                'id' => $item->id_penjadwalan,
                'tipe_ujian' => $item->tipe_ujian,
                'paket_ujian' => $item->paket_ujian,
                'kelas_prodi' => $item->kelas_prodi,
                'tanggal_ujian' => $item->tanggal ? $item->tanggal->format('Y-m-d') : null,
                'mulai' => $item->mulai,
                'selesai' => $item->selesai,
                'kuota' => $item->kuota,
                'tipe' => $item->tipe,
            ];
        });

        // Get available exam categories for filter dropdown
        $examCategories = KategoriSoal::select('id', 'kategori')->orderBy('kategori')->get();

        return Inertia::render('monitoring/monitoring', [
            'ujianList' => $ujianList,
            'examCategories' => $examCategories,
            'filters' => [
                'search' => $search,
                'pages' => $pages,
                'tipe_ujian' => $tipeUjian,
                'sort' => $sort,
            ],
        ]);
    }

    /**
     * Display preview of exam schedules for a specific penjadwalan.
     */
    public function preview(Request $request, $id)
    {
        $pages = $request->query('pages', 10);
        $search = $request->query('search', null);

        // Get the penjadwalan data
        $penjadwalan = Penjadwalan::with(['event', 'jenis_ujian'])->findOrFail($id);

        // Transform ujian data to expected format
        $transformedUjian = [
            'id' => $penjadwalan->id_penjadwalan,
            'tipe_ujian' => $penjadwalan->tipe_ujian,
            'paket_ujian' => $penjadwalan->paket_ujian,
            'kelas_prodi' => $penjadwalan->kelas_prodi,
            'tanggal_ujian' => $penjadwalan->tanggal ? $penjadwalan->tanggal->format('Y-m-d') : null,
            'mulai' => $penjadwalan->mulai,
            'selesai' => $penjadwalan->selesai,
            'kuota' => $penjadwalan->kuota,
            'tipe' => $penjadwalan->tipe,
        ];

        // Get JadwalUjian filtered by id_penjadwalan
        $query = JadwalUjian::where('id_penjadwalan', $id);

        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_part', 'like', "%{$search}%")
                    ->orWhere('kode_kelas', 'like', "%{$search}%")
                    ->orWhere('nama_ujian', 'like', "%{$search}%")
                    ->orWhere('id_ujian', 'like', "%{$search}%");
            });
        }

        $jadwalUjianList = $query->paginate((int)$pages)->withQueryString();

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

        return Inertia::render('monitoring/preview', [
            'ujian' => $transformedUjian,
            'jadwalUjianList' => $jadwalUjianList,
            'filters' => [
                'search' => $search,
                'pages' => $pages,
            ],
        ]);
    }

    /**
     * Display participants and their progress for a specific exam.
     */
    public function show(Request $request, $id)
    {
        $pages = $request->query('pages', 10);
        $search = $request->query('search', null);
        $status = $request->query('status', null);
        $examId = $request->query('exam_id', null);

        // Get the penjadwalan data
        $penjadwalan = Penjadwalan::with(['event', 'jenis_ujian'])->findOrFail($id);

        // Transform ujian data to expected format
        $transformedUjian = [
            'id' => $penjadwalan->id_penjadwalan,
            'tipe_ujian' => $penjadwalan->tipe_ujian,
            'paket_ujian' => $penjadwalan->paket_ujian,
            'kelas_prodi' => $penjadwalan->kelas_prodi,
            'tanggal_ujian' => $penjadwalan->tanggal ? $penjadwalan->tanggal->format('Y-m-d') : null,
            'mulai' => $penjadwalan->mulai,
            'selesai' => $penjadwalan->selesai,
            'kuota' => $penjadwalan->kuota,
            'tipe' => $penjadwalan->tipe,
        ];

        // exam_id is required for this view
        if (!$examId) {
            return redirect()->route('monitoring.ujian.preview', $id)
                ->with('error', 'Exam ID is required to view details.');
        }

        // Get the specific JadwalUjian by exam_id
        $jadwalUjian = JadwalUjian::where('id_ujian', $examId)->first();

        if (!$jadwalUjian) {
            return redirect()->route('monitoring.ujian.preview', $id)
                ->with('error', 'Exam not found.');
        }

        // Add nama_ujian to the transformed ujian data
        $transformedUjian['nama_ujian'] = $jadwalUjian->nama_ujian;

        // Parse kode_kelas to get participant IDs
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

        if (empty($participantIds)) {
            // Create empty paginated response manually
            $studentsData = new \Illuminate\Pagination\LengthAwarePaginator(
                collect([]), // empty collection
                0, // total items
                (int)$pages, // per page
                1, // current page
                [
                    'path' => request()->url(),
                    'pageName' => 'page',
                ]
            );
            $studentsData->withQueryString();

            $stats = [
                'total_students' => 0,
                'active_students' => 0,
                'finished_students' => 0,
            ];

            return Inertia::render('monitoring/detail', [
                'ujian' => $transformedUjian,
                'studentsData' => $studentsData,
                'stats' => $stats,
                'filters' => [
                    'search' => $search,
                    'status' => $status,
                    'pages' => $pages,
                    'exam_id' => $examId, // Include exam_id in filters
                ],
            ]);
        }

        // Get total questions from JadwalUjianSoal
        $jadwalUjianSoal = JadwalUjianSoal::where('id_ujian', $jadwalUjian->id_ujian)->first();
        $totalQuestions = $jadwalUjianSoal ? $jadwalUjianSoal->total_soal : 0;

        // Get all participants data with their Pengerjaan status (if exists)
        $participantsQuery = Peserta::whereIn('id', $participantIds)
            ->when($search, function ($query, $search) {
                return $query->where('nama', 'like', "%{$search}%")
                    ->orWhereHas('pengerjaan', function ($q) use ($search) {
                        $q->where('id_pengerjaan', 'like', "%{$search}%");
                    });
            });

        // Apply status filter before pagination
        if ($status) {
            if ($status === 'active') {
                $participantsQuery->whereHas('pengerjaan', function ($query) use ($examId) {
                    $query->where('id_ujian', $examId)
                        ->where(function ($q) {
                            $q->where('selesai', 0)->orWhereNull('selesai');
                        });
                });
            } elseif ($status === 'finish') {
                $participantsQuery->whereHas('pengerjaan', function ($query) use ($examId) {
                    $query->where('id_ujian', $examId)
                        ->where('selesai', 1);
                });
            } elseif ($status === 'not_started') {
                $participantsQuery->whereDoesntHave('pengerjaan', function ($query) use ($examId) {
                    $query->where('id_ujian', $examId);
                });
            }
        }

        $participantsList = $participantsQuery->paginate((int)$pages)->withQueryString();

        // Transform data for students table
        $participantsList->getCollection()->transform(function ($participant) use ($examId, $totalQuestions) {
            // Get Pengerjaan data for this participant and exam
            $pengerjaan = Pengerjaan::where('id_peserta', $participant->id)
                ->where('id_ujian', $examId)
                ->first();

            $completedQuestions = 0;
            $status = 'not_started';
            $nilai = null;
            $idPengerjaan = null;

            if ($pengerjaan) {
                // Count answered questions (where jawaban is not null)
                $completedQuestions = PengerjaanJawaban::where('id_pengerjaan', $pengerjaan->id_pengerjaan)
                    ->whereNotNull('jawaban')
                    ->count();

                // Determine status based on selesai column
                if ($pengerjaan->selesai == 1) {
                    $status = 'finish';
                } else {
                    $status = 'active';
                }

                $nilai = $pengerjaan->nilai;
                $idPengerjaan = $pengerjaan->id_pengerjaan;
            }

            return [
                'id' => $participant->id,
                'id_pengerjaan' => $idPengerjaan,
                'name' => $participant->nama,
                'completedQuestions' => $completedQuestions,
                'totalQuestions' => $totalQuestions,
                'status' => $status,
                'nilai' => $nilai,
            ];
        });

        // Calculate statistics for all participants
        $totalParticipants = count($participantIds);
        $activeParticipants = 0;
        $finishedParticipants = 0;

        if (!empty($participantIds)) {
            $activeParticipants = Pengerjaan::whereIn('id_peserta', $participantIds)
                ->where('id_ujian', $examId)
                ->where(function ($query) {
                    $query->where('selesai', 0)->orWhereNull('selesai');
                })
                ->count();

            $finishedParticipants = Pengerjaan::whereIn('id_peserta', $participantIds)
                ->where('id_ujian', $examId)
                ->where('selesai', 1)
                ->count();
        }

        $stats = [
            'total_students' => $totalParticipants,
            'active_students' => $activeParticipants,
            'finished_students' => $finishedParticipants,
        ];

        return Inertia::render('monitoring/detail', [
            'ujian' => $transformedUjian,
            'studentsData' => $participantsList,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'pages' => $pages,
                'exam_id' => $examId, // Include exam_id in filters
            ],
        ]);
    }

    /**
     * Reset a participant's exam progress.
     */
    public function resetParticipant(Request $request, $id)
    {
        $idPengerjaan = $request->input('id_pengerjaan');
        $examId = $request->query('exam_id');

        if (!$idPengerjaan) {
            return back()->withErrors(['error' => 'Pengerjaan ID is required']);
        }

        // Find the Pengerjaan record by id_pengerjaan
        $pengerjaan = Pengerjaan::find($idPengerjaan);

        if (!$pengerjaan) {
            return back()->withErrors(['error' => 'Pengerjaan record not found']);
        }

        // Only allow reset if the participant has finished (selesai = 1)
        if ($pengerjaan->selesai !== true) {
            return back()->withErrors(['error' => 'Can only reset participants who have finished the exam']);
        }

        // Reset the specified fields
        $pengerjaan->update([
            'selesai' => 0,
            'waktu_selesai' => null,
            'total_soal' => null,
            'total_jawaban' => null,
            'jawaban_benar' => null,
            'jawaban_salah' => null,
            'nilai' => null,
        ]);

        // Don't send flash messages for AJAX requests (polling)
        // The frontend will handle showing the success message
        return back();
    }

    /**
     * Delete a participant's exam progress.
     */
    public function deleteParticipant(Request $request, $id)
    {
        $idPengerjaan = $request->input('id_pengerjaan');
        $examId = $request->query('exam_id');

        if (!$idPengerjaan) {
            return back()->withErrors(['error' => 'Pengerjaan ID is required']);
        }

        // Find the Pengerjaan record by id_pengerjaan
        $pengerjaan = Pengerjaan::find($idPengerjaan);

        if (!$pengerjaan) {
            return back()->withErrors(['error' => 'Pengerjaan record not found']);
        }

        // Reset the specified fields in Pengerjaan
        $pengerjaan->update([
            'selesai' => 0,
            'waktu_selesai' => null,
            'total_soal' => null,
            'total_jawaban' => null,
            'jawaban_benar' => null,
            'jawaban_salah' => null,
            'nilai' => null,
        ]);

        // Set all jawaban to NULL for this id_pengerjaan in PengerjaanJawaban
        PengerjaanJawaban::where('id_pengerjaan', $idPengerjaan)
            ->update(['jawaban' => null]);

        // Don't send flash messages for AJAX requests (polling)
        // The frontend will handle showing the success message
        return back();
    }
}
