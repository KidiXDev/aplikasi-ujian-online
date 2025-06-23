<?php

namespace App\Http\Controllers\PaketSoal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Models\JadwalUjian;
use App\Models\JadwalUjianSoal;
use App\Models\Event;
use App\Models\Bidang;

class PaketSoalController extends Controller
{
    public function index(Request $request)
    {
        $jadwalUjian = JadwalUjian::select('id_ujian', 'nama_ujian', 'id_event', 'kode_part')
            ->with('event:id_event,nama_event')
            ->get();

        $jadwalUjianSoal = JadwalUjianSoal::select('id_ujian', 'total_soal')->get();

        return Inertia::render('master-data/paket-soal/paket-soal-manager', [
            'jadwalUjian' => $jadwalUjian,
            'jadwalUjianSoal' => $jadwalUjianSoal,
        ]);
    }

    public function list()
    {
        $paketSoal = JadwalUjian::select('id_ujian', 'nama_ujian')->get();
        return response()->json($paketSoal);
    }

    public function create()
    {
        $events = Event::select('id_event', 'nama_event')->get();
        $bidangs = Bidang::select('id_bidang', 'nama_bidang')->get();

        return Inertia::render('master-data/paket-soal/create-paket-soal', [
            'events' => $events,
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

    public function delete(Request $request, $id)
    {
        try {
            Log::info("Menghapus paket soal ID: $id");

            // Hapus semua soal terkait
            JadwalUjianSoal::where('id_ujian', $id)->delete();

            // Hapus paket soal
            JadwalUjian::destroy($id);

            Log::info("Paket soal ID $id berhasil dihapus");

            // FIX PALING BENER: langsung redirect back, biar Inertia happy
            return redirect()->back()->with('success', 'Paket soal berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error("Gagal hapus paket soal ID $id", ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Gagal menghapus paket soal: ' . $e->getMessage());
        }
    }
}
