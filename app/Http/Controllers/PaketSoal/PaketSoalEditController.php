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
            'id_event' => 'required|integer|exists:data_db.t_event,id_event',
            'kode_part' => 'required|integer|exists:data_db.m_bidang,kode',
        ]);

        $paket = JadwalUjian::findOrFail($id);
        $namaUjian = Bidang::where('kode', $request->input('kode_part'))->value('nama');
        $paket->nama_ujian = $namaUjian;
        $paket->id_event = $request->input('id_event');
        $paket->kode_part = $request->input('kode_part');
        $paket->save();

        return redirect()->route('master-data.paket-soal.index')->with('success', 'Paket soal berhasil diupdate!');
    }

    // PaketSoalEditController.php
    public function store(Request $request)
    {
        $request->validate([
            'id_event' => 'required|integer|exists:data_db.t_event,id_event',
            'kode_part' => 'required|integer|exists:data_db.m_bidang,kode',
        ]);

        $namaUjian = Bidang::where('kode', $request->input('kode_part'))->value('nama');
        $jadwalUjian = JadwalUjian::create([
            'nama_ujian' => $namaUjian,
            'kode_kelas' => 1,
            'id_event' => $request->input('id_event'),
            'kode_part' => $request->input('kode_part'),
        ]);

        JadwalUjianSoal::create([
            'id_ujian' => $jadwalUjian->id_ujian,
            'kd_bidang' => $request->input('kode_part'),
            'total_soal' => 0,
            'ujian_soal' => 0
        ]);

        // REDIRECT KE ROUTE YANG BENAR
        return redirect()->route('master-data.paket-soal.show-by-event', ['id_event' => $request->input('id_event')])->with('success', 'Paket soal berhasil dibuat!');
    }

    // Method untuk create dengan event ID yang sudah ditentukan
    public function createWithEvent($id_event)
    {
        $events = Event::select('id_event', 'nama_event')->get();
        $bidangs = Bidang::select('kode', 'nama')->get();
        
        // Ambil data event yang dipilih
        $selectedEvent = Event::findOrFail($id_event);

        return Inertia::render('master-data/paket-soal/create-paket-soal', [
            'events' => $events,
            'bidangs' => $bidangs,
            'selectedEventId' => (int)$id_event,
            'selectedEvent' => $selectedEvent,
        ]);
    }

    // Method create biasa (tanpa event ID)
    public function create()
    {
        $events = Event::select('id_event', 'nama_event')->get();
        $bidangs = Bidang::select('kode', 'nama')->get();

        return Inertia::render('master-data/paket-soal/create-paket-soal', [
            'events' => $events,
            'bidangs' => $bidangs,
        ]);
    }

    // Update method store_id untuk handle event ID dari URL
    public function store_id(Request $request, $event_id)
    {
        $request->validate([
            'kode_part' => 'required|integer|exists:data_db.m_bidang,kode',
        ]);

        $namaUjian = Bidang::where('kode', $request->input('kode_part'))->value('nama');
        $jadwalUjian = JadwalUjian::create([
            'nama_ujian' => $namaUjian,
            'kode_kelas' => 1,
            'id_event' => $event_id, // Gunakan event_id dari parameter URL
            'kode_part' => $request->input('kode_part'),
        ]);

        JadwalUjianSoal::create([
            'id_ujian' => $jadwalUjian->id_ujian,
            'kd_bidang' => $request->input('kode_part'),
            'total_soal' => 0,
            'ujian_soal' => ''
        ]);

        return redirect()->route('master-data.paket-soal.show-by-event', ['id_event' => $event_id])
            ->with('success', 'Paket soal berhasil dibuat!');
    }
}
