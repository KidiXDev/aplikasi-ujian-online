<?php

namespace App\Http\Controllers\PaketSoal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bidang;
use App\Models\Event;
use App\Models\JadwalUjianSoal;
use App\Models\JadwalUjian;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

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

        // Cek apakah kombinasi event dan kode_part sudah ada
        $existing = JadwalUjian::where('id_event', $request->input('id_event'))
            ->where('kode_part', $request->input('kode_part'))
            ->first();

        if ($existing) {
            return redirect()->back()
                ->withErrors(['bidang' => 'Bidang ini sudah ada dalam event tersebut.']);
        }

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

        return redirect()->route('master-data.paket-soal.show-by-event', ['id_event' => $request->input('id_event')])->with('success', 'Paket soal berhasil dibuat!');
    }

    // Method untuk create dengan event ID yang sudah ditentukan
    public function createWithEvent($id_event)
    {
        // Ambil data event
        $event = Event::findOrFail($id_event);
        
        // Ambil semua kode_part yang sudah digunakan dalam event ini
        $usedKodeParts = JadwalUjian::where('id_event', $id_event)
            ->pluck('kode_part')
            ->toArray();
        
        // Ambil bidang yang belum digunakan dalam event ini
        $bidangs = Bidang::select('kode', 'nama')
            ->whereNotIn('kode', $usedKodeParts)
            ->get();

        return Inertia::render('master-data/paket-soal/create-paket-soal', [
            'bidangs' => $bidangs,
            'selectedEventId' => $id_event,
            'selectedEvent' => $event,
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

        // Cek apakah kombinasi event dan kode_part sudah ada
        $existing = JadwalUjian::where('id_event', $event_id)
            ->where('kode_part', $request->input('kode_part'))
            ->first();

        if ($existing) {
            return redirect()->back()
                ->withErrors(['bidang' => 'Bidang ini sudah ada dalam event tersebut.']);
        }

        $namaUjian = Bidang::where('kode', $request->input('kode_part'))->value('nama');
        $jadwalUjian = JadwalUjian::create([
            'nama_ujian' => $namaUjian,
            'kode_kelas' => 1,
            'id_event' => $event_id,
            'kode_part' => $request->input('kode_part'),
        ]);

        JadwalUjianSoal::create([
            'id_ujian' => $jadwalUjian->id_ujian,
            'kd_bidang' => $request->input('kode_part'),
            'total_soal' => 0,
            'ujian_soal' => ''
        ]);

        return redirect()->route('master-data.paket-soal.show-by-event', ['id_event' => $event_id]);
    }

    

    public function list_event_to_copy_part(Request $request, $id_event_tujuan){
        try {
            $search = $request->get('search', '');
            
            // Ambil event kecuali event tujuan dan hanya yang aktif
            $query = Event::where('id_event', '!=', $id_event_tujuan)
                ->where('status', 1)
                ->select('id_event', 'nama_event');
            
            // Jika ada parameter search, filter berdasarkan nama event
            if (!empty($search)) {
                $query->where('nama_event', 'LIKE', '%' . $search . '%');
            }
            
            $eventList = $query->orderBy('nama_event', 'asc')->get();
            
            Log::info('Event list for copy:', [
                'search' => $search,
                'count' => $eventList->count(), 
                'data' => $eventList->toArray()
            ]);
            
            return response()->json($eventList);
        } catch (\Exception $e) {
            Log::error('Error in list_event_to_copy_part: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function copyPart(Request $request){
        try {
            $request->validate([
                'event_asal' => 'required|integer|exists:data_db.t_event,id_event',
                'event_tujuan' => 'required|integer|exists:data_db.t_event,id_event',
            ]);

            $id_event_asal = $request->input('event_asal');
            $id_event_tujuan = $request->input('event_tujuan');

            // ambil kode part event asal
            $kodePartAsal = JadwalUjian::where('id_event', $id_event_asal)->pluck('kode_part')->toArray();

            //  ambil kode part event tujuan
            $kodePartTujuan = JadwalUjian::where('id_event', $id_event_tujuan)->pluck('kode_part')->toArray();

            // ambil kode part yang belum ada di event tujuan
            $kodePartAvailable = array_diff($kodePartAsal, $kodePartTujuan);

            if (empty($kodePartAvailable)) {
                return redirect()->back()
                    ->with('error', 'Tidak ada paket soal yang dapat disalin. Semua bidang sudah ada di event tujuan.');
            }

            // ambil jadwal ujian yang kodepartnya tersedia aja
            $jadwalList = JadwalUjian::where('id_event', $id_event_asal)
                ->whereIn('kode_part', $kodePartAvailable)
                ->get();

            $copiedCount = 0;

            // Loop untuk setiap jadwal ujian yang akan disalin
            foreach ($jadwalList as $jadwal) {
                // copy jadwal ujian
                $jadwalUjianNew = JadwalUjian::create([
                    'nama_ujian' => $jadwal->nama_ujian,
                    'kode_kelas' => $jadwal->kode_kelas,
                    'id_event' => $id_event_tujuan,
                    'kode_part' => $jadwal->kode_part,
                ]);
                
                // Ambil JadwalUjianSoal dari jadwal asal
                $jadwalUjianSoal = JadwalUjianSoal::where('id_ujian', $jadwal->id_ujian)->first();
                
                if ($jadwalUjianSoal) {
                    // Buat JadwalUjianSoal baru untuk JadwalUjian baru
                    JadwalUjianSoal::create([
                        'id_ujian' => $jadwalUjianNew->id_ujian,
                        'kd_bidang' => $jadwalUjianSoal->kd_bidang,
                        'total_soal' => $jadwalUjianSoal->total_soal,
                        'ujian_soal' => $jadwalUjianSoal->ujian_soal
                    ]);
                }

                $copiedCount++;
            }

            return redirect()->back()
                ->with('success', "Berhasil menyalin {$copiedCount} paket soal ke event tujuan.");

        } catch (\Exception $e) {
            Log::error('Error in copyPart: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menyalin paket soal: ' . $e->getMessage());
        }
    }
}
