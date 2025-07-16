<?php

namespace App\Http\Controllers\PaketSoal;

use App\Http\Controllers\Controller;
use App\Models\JadwalUjian;
use Illuminate\Http\Request;
use App\Models\JadwalUjianSoal;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Event;
use App\Models\Bidang;

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
            return redirect()->back()->with('success', 'Paket soal berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('Error deleting PaketSoal:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Gagal menghapus paket soal');
        }
    }
    public function index(Request $request)
    {
        $pages = $request->query('pages', 10);
        $search = $request->query('search', null);

        $jadwalUjianQuery = JadwalUjian::select('id_ujian', 'nama_ujian', 'id_event', 'kode_part')
            ->with('event:id_event,nama_event');

        if ($search) {
            $jadwalUjianQuery->where('nama_ujian', 'like', '%' . $search . '%')
                ->orWhereHas('event', function ($query) use ($search) {
                    $query->where('nama_event', 'like', '%' . $search . '%');
                });
        }

        // Ini dia yang paging bener!
        $jadwalUjian = $jadwalUjianQuery->paginate($pages);

        // Ambil soal terpisah aja, nggak usah dipaginasi kalau cuman tambahan info
        $jadwalUjianSoal = JadwalUjianSoal::select('id_ujian', 'total_soal')->get();

        return Inertia::render('master-data/paket-soal/paket-soal-manager', [
            'jadwalUjian' => $jadwalUjian,
            'jadwalUjianSoal' => $jadwalUjianSoal,
        ]);
    }

    
    public function list()
    {
        // Ambil semua paket soal (bisa tambahkan filter sesuai kebutuhan)
        $paketSoal = JadwalUjian::select('id_ujian', 'nama_ujian')->get();
        return response()->json($paketSoal);
    }

    public function create()
    {
        // Ambil data yang diperlukan untuk membuat paket soal, misalnya daftar event dan bidang
        $events = Event::select('id_event', 'nama_event')->get();
        $bidangs = Bidang::select('id_bidang', 'nama_bidang')->get();

        // Tampilkan halaman untuk membuat paket soal
        return Inertia::render('master-data/paket-soal/create-paket-soal', [
            'events' => $events,
            'bidangs' => $bidangs,
        ]);
    }

    public function edit($id)
    {
        // Ambil data paket soal yang akan diedit
        $paketSoal = JadwalUjian::findOrFail($id);

        // Ambil data yang diperlukan untuk mengisi form edit, misalnya daftar event dan bidang
        $events = Event::select('id_event', 'nama_event')->get();
        $bidangs = Bidang::select('id_bidang', 'nama_bidang')->get();

        // Tampilkan halaman untuk mengedit paket soal
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
