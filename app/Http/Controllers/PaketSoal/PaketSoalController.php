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
    public function index(Request $request)
    {
        $jadwalUjian = JadwalUjian::select('id_ujian', 'nama_ujian', 'id_event', 'kode_part')
            ->with('event:id_event,nama_event')
            ->get();

        $jadwalUjianSoal = JadwalUjianSoal::select('id_ujian','total_soal')->get();

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
}
