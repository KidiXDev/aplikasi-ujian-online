<?php

namespace App\Http\Controllers;

use App\Models\Penjadwalan;
use App\Models\JadwalUjian;
use App\Models\JadwalUjianSoal;
use App\Models\Pengerjaan;
use App\Models\PengerjaanJawaban;
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

        // Eager load both event and jenis_ujian relationships
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

        return Inertia::render('monitoring/monitoring', [
            'ujianList' => $ujianList,
            'filters' => [
                'search' => $search,
                'pages' => $pages,
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

        // Get JadwalUjian filtered by id_penjadwalan and optionally by exam_id
        $jadwalUjianQuery = JadwalUjian::where('id_penjadwalan', $id);
        
        if ($examId) {
            $jadwalUjianQuery->where('id_ujian', $examId);
        } else {
            // If no exam_id specified, try with kode_part matching tipe_ujian
            $jadwalUjianQuery->where('kode_part', $penjadwalan->tipe_ujian);
        }

        $jadwalUjian = $jadwalUjianQuery->first();

        // If not found and no exam_id was specified, try without kode_part filter
        if (!$jadwalUjian && !$examId) {
            $jadwalUjian = JadwalUjian::where('id_penjadwalan', $id)->first();
        }

        if (!$jadwalUjian) {
            // Return empty students data if no jadwal ujian found
            $studentsData = collect([])->paginate((int)$pages);

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
                ],
            ]);
        }

        // Parse kode_kelas to get participant IDs
        $participantIds = [];

        if ($jadwalUjian->kode_kelas) {
            // Trim whitespace and split by comma
            $kodeKelasClean = trim(strval($jadwalUjian->kode_kelas));
            if (!empty($kodeKelasClean)) {
                // Split by comma and clean each value
                $rawIds = explode(',', $kodeKelasClean);
                $participantIds = [];

                foreach ($rawIds as $rawId) {
                    $cleanId = trim($rawId);
                    if (!empty($cleanId) && is_numeric($cleanId)) {
                        $participantIds[] = intval($cleanId);
                    }
                }

                // Remove duplicates and sort
                $participantIds = array_unique($participantIds);
                sort($participantIds);
            }
        }

        // Get total questions from JadwalUjianSoal
        $jadwalUjianSoal = JadwalUjianSoal::where('id_ujian', $jadwalUjian->id_ujian)->first();
        $totalQuestions = $jadwalUjianSoal ? $jadwalUjianSoal->total_soal : 0;

        // Query participants who exist in Pengerjaan and match the specific ujian
        $pengerjaanQuery = Pengerjaan::with(['peserta'])
            ->whereIn('id_peserta', $participantIds)
            ->where('id_ujian', $jadwalUjian->id_ujian)
            ->when($search, function ($query, $search) {
                return $query->whereHas('peserta', function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                if ($status === 'active') {
                    return $query->where(function ($q) {
                        $q->whereNull('nilai')->orWhere('nilai', '=', 0);
                    });
                } elseif ($status === 'finish') {
                    return $query->where(function ($q) {
                        $q->whereNotNull('nilai')->where('nilai', '>', 0);
                    });
                }
                return $query;
            });

        $pengerjaanList = $pengerjaanQuery->paginate((int)$pages)->withQueryString();

        // Transform data for students table
        $pengerjaanList->getCollection()->transform(function ($pengerjaan) use ($totalQuestions) {
            // Count completed questions from PengerjaanJawaban
            $completedQuestions = PengerjaanJawaban::where('id_pengerjaan', $pengerjaan->id_pengerjaan)->count();

            // Determine status based on nilai (score)
            $status = 'active';
            if ($pengerjaan->nilai !== null && $pengerjaan->nilai > 0) {
                $status = 'finish';
            }

            return [
                'id' => $pengerjaan->id_peserta,
                'name' => $pengerjaan->peserta ? $pengerjaan->peserta->nama : 'Unknown',
                'completedQuestions' => $completedQuestions,
                'totalQuestions' => $totalQuestions,
                'status' => $status,
                'nilai' => $pengerjaan->nilai,
            ];
        });

        // Calculate statistics
        $totalParticipants = count($participantIds);

        $participantsInPengerjaan = 0;
        $finishedParticipants = 0;

        if (!empty($participantIds)) {
            $participantsInPengerjaan = Pengerjaan::whereIn('id_peserta', $participantIds)
                ->where('id_ujian', $jadwalUjian->id_ujian)
                ->count();
            $finishedParticipants = Pengerjaan::whereIn('id_peserta', $participantIds)
                ->where('id_ujian', $jadwalUjian->id_ujian)
                ->where(function ($query) {
                    $query->whereNotNull('nilai')->where('nilai', '>', 0);
                })->count();
        }

        $activeParticipants = $participantsInPengerjaan - $finishedParticipants;

        $stats = [
            'total_students' => $totalParticipants,
            'active_students' => $activeParticipants,
            'finished_students' => $finishedParticipants,
        ];

        return Inertia::render('monitoring/detail', [
            'ujian' => $transformedUjian,
            'studentsData' => $pengerjaanList,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'pages' => $pages,
            ],
        ]);
    }
}
