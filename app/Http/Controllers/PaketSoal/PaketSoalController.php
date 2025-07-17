<?php

namespace App\Http\Controllers\PaketSoal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JadwalUjian;
use App\Models\JadwalUjianSoal;
use App\Models\Event;
use App\Models\Bidang;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PaketSoalController extends Controller
{
    public function destroy($id)
    {
        try {
            // Hapus data terkait di tabel jadwal_ujian_soal
            JadwalUjianSoal::where('id_ujian', $id)->delete();

            // Hapus data di tabel jadwal_ujian
            JadwalUjian::destroy($id);

            Log::info('Paket soal deleted successfully:', ['id' => $id]);
            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Error deleting PaketSoal:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Gagal menghapus paket soal');
        }
    }
    
    // Method untuk menampilkan paket soal berdasarkan event
    public function index(Request $request, $id_event)
    {
        $pages = $request->input('pages', 10);
        $search = $request->input('search', null);

        // Ambil data event
        $event = Event::findOrFail($id_event);

        // Query jadwal ujian berdasarkan event
        $jadwalUjianQuery = JadwalUjian::select('id_ujian', 'nama_ujian', 'id_event', 'kode_part', 'id_penjadwalan')
            ->with(['event:id_event,nama_event', 'bidang:kode,nama'])
            ->where('id_event', $id_event)
            ->where('id_penjadwalan', null);

        if ($search) {
            $jadwalUjianQuery->where('nama_ujian', 'like', '%' . $search . '%');
        }

        // Handle pagination with different page sizes
        if ($pages === 'all') {
            $jadwalUjian = $jadwalUjianQuery->get();
            // Create a mock pagination object for "All" option
            $jadwalUjian = new \Illuminate\Pagination\LengthAwarePaginator(
                $jadwalUjian, 
                $jadwalUjian->count(), 
                $jadwalUjian->count(), 
                1,
                ['path' => $request->url(), 'pageName' => 'page']
            );
            $jadwalUjian->appends($request->query());
        } else {
            // Ensure per page is a valid number
            $pages = in_array($pages, [10, 20, 25, 50, 100]) ? (int)$pages : 10;
            $jadwalUjian = $jadwalUjianQuery->paginate($pages)->withQueryString();
        }

        // Ambil data total soal
        $jadwalUjianSoal = JadwalUjianSoal::select('id_ujian', 'total_soal')
            ->whereIn('id_ujian', $jadwalUjian->pluck('id_ujian'))
            ->get();

        return Inertia::render('master-data/paket-soal/paket-soal-manager', [
            'jadwalUjian' => $jadwalUjian,
            'jadwalUjianSoal' => $jadwalUjianSoal,
            'event' => $event, // Kirim data event ke frontend
        ]);
    }

    // Method untuk menampilkan semua paket soal
    public function indexAll(Request $request)
    {
        $pages = $request->input('pages', 10);
        $search = $request->input('search', null);

        $jadwalUjianQuery = JadwalUjian::select('id_ujian', 'nama_ujian', 'id_event', 'kode_part')
            ->with(['event:id_event,nama_event', 'bidang:kode,nama']);

        if ($search) {
            $jadwalUjianQuery->where(function ($query) use ($search) {
                $query->where('nama_ujian', 'like', '%' . $search . '%')
                    ->orWhereHas('event', function ($q) use ($search) {
                        $q->where('nama_event', 'like', '%' . $search . '%');
                    });
            });
        }

        // Handle pagination with different page sizes
        if ($pages === 'all') {
            $jadwalUjian = $jadwalUjianQuery->get();
            // Create a mock pagination object for "All" option
            $jadwalUjian = new \Illuminate\Pagination\LengthAwarePaginator(
                $jadwalUjian, 
                $jadwalUjian->count(), 
                $jadwalUjian->count(), 
                1,
                ['path' => $request->url(), 'pageName' => 'page']
            );
            $jadwalUjian->appends($request->query());
        } else {
            // Ensure per page is a valid number
            $pages = in_array($pages, [10, 20, 25, 50, 100]) ? (int)$pages : 10;
            $jadwalUjian = $jadwalUjianQuery->paginate($pages)->withQueryString();
        }

        $jadwalUjianSoal = JadwalUjianSoal::select('id_ujian', 'total_soal')->get();

        return Inertia::render('master-data/paket-soal/paket-soal-manager', [
            'jadwalUjian' => $jadwalUjian,
            'jadwalUjianSoal' => $jadwalUjianSoal,
            // Tidak ada event untuk index all
        ]);
    }


    public function list($idEvent)
    {
        // Ambil semua paket soal (bisa tambahkan filter sesuai kebutuhan)
        $paketSoal = JadwalUjian::findOrFail('id_ujian', 'nama_ujian')->get();
        return response()->json($paketSoal);
    }

    public function create($id_event)
    {
        $JadwalUjian = JadwalUjian::where('id_event', $id_event)->first();
        $kode_part = $JadwalUjian->kode_part;

        //Ambil bidang yang id nya beda dengan $kode_part
        $bidangs = Bidang::select('id_bidang', 'nama_bidang')
            ->where('kode', '!=', $kode_part)
            ->get();

        return Inertia::render('master-data/paket-soal/create-paket-soal', [
            'bidangs' => $bidangs,
        ]);
    }

    public function edit($id)
    {
        $paketSoal = JadwalUjian::findOrFail($id);
        $events = Event::select('id_event', 'nama_event')->get();
        $bidangs = Bidang::select('id_bidang', 'nama_bidang')->get();

        return Inertia::render('master-data/paket-soal/create-paket-soal', [
            'paketSoal' => $paketSoal,
            'events' => $events,
            'bidangs' => $bidangs,
        ]);
    }

    public function show($paketSoalId)
    {
        // Ambil data paket soal beserta relasi event dan bidang
        $paketSoal = JadwalUjian::with([
            'event:id_event,nama_event',
            'bidang:kode,nama'
        ])->findOrFail($paketSoalId);

        // Ambil soal terkait dengan paket soal ini
        $jadwalUjianSoal = JadwalUjianSoal::where('id_ujian', $paketSoal->id_ujian)->first();

        // Susun data detail untuk dikirim ke FE
        $detail = [
            'id_ujian'    => $paketSoal->id_ujian,
            'nama_ujian'  => $paketSoal->nama_ujian,
            'event'       => $paketSoal->event ? $paketSoal->event->nama_event : '-',
            'bidang'      => $paketSoal->bidang ? $paketSoal->bidang->nama : '-',
            'total_soal'  => $jadwalUjianSoal ? $jadwalUjianSoal->total_soal : 0,
            'created_at'  => $paketSoal->created_at,
            'updated_at'  => $paketSoal->updated_at,
        ];

        // Tampilkan halaman detail paket soal
        return Inertia::render('master-data/paket-soal/PaketSoalDetail', [
            'paketSoal' => $detail,
        ]);
    }
}
