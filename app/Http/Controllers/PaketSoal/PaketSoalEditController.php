<?php

namespace App\Http\Controllers\PaketSoal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bidang;
use App\Models\Event;
use App\Models\JadwalUjianSoal;
use App\Models\JadwalUjian;
use Inertia\Inertia;

class PaketSoalEditController extends Controller
{
    public function edit($id)
    {
        // Ambil data jadwal ujian (paket soal)
        $paket = JadwalUjian::findOrFail($id);

        // Ambil event & bidang untuk dropdown
        $events = Event::select('id_event', 'nama_event')->get();
        $bidangs = Bidang::select('kode', 'nama')->get();

        // Kirim data ke inertia view
        return Inertia::render('master-data/paket-soal/create-paket-soal', [
            'edit' => true,
            'paket' => [
                'id_ujian' => $paket->id_ujian,
                'nama_ujian' => $paket->nama_ujian,
                'id_event' => $paket->id_event,
                'kode_part' => $paket->kode_part,
            ],
            'events' => $events,
            'bidangs' => $bidangs,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_ujian' => 'required|string|max:255',
            'id_event' => 'required|integer|exists:data_db.t_event,id_event',
            'kode_part' => 'required|integer|exists:data_db.m_bidang,kode',
        ]);

        $paket = JadwalUjian::findOrFail($id);
        $paket->nama_ujian = $request->input('nama_ujian');
        $paket->id_event = $request->input('id_event');
        $paket->kode_part = $request->input('kode_part');
        $paket->save();

        return redirect()->route('master-data.paket-soal.index')->with('success', 'Paket soal berhasil diupdate!');
    }

    // PaketSoalEditController.php

    public function store(Request $request)
    {
        $request->validate([
            'nama_ujian' => 'required|string|max:255',
            'id_event' => 'required|integer|exists:data_db.t_event,id_event',
            'kode_part' => 'required|integer|exists:data_db.m_bidang,kode',
        ]);

        $kode_kelas = null;

        $jadwalUjian = JadwalUjian::create([
            'nama_ujian' => $request->input('nama_ujian'),
            'kode_kelas' => $kode_kelas,
            'id_event' => $request->input('id_event'),
            'kode_part' => $request->input('kode_part'),
        ]);

        $ujiaSoal = 0;
        $totalSoal = 0;
        $jadwalUjianSoal = JadwalUjianSoal::create([
            'id_ujian' => $jadwalUjian->id_ujian,
            'kd_bidang' => $request->input('kode_part'),
            'total_soal' => $totalSoal,
            'ujian_soal' => $ujiaSoal
        ]);

        // Redirect ke halaman index atau create lagi
        return redirect()->route('master-data.paket-soal.create')->with('success', 'Paket soal berhasil dibuat!');
    }

    public function create()
    {
        $events = Event::select('id_event', 'nama_event')->get();
        $bidangs = Bidang::select('kode', 'nama')->get();

        return Inertia::render('master-data/paket-soal/create-paket-soal', [
            'events' => $events,
            'bidangs' => $bidangs,
        ]);
    }
}
