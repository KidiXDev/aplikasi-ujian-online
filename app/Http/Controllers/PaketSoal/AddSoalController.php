<?php

namespace App\Http\Controllers\PaketSoal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JadwalUjian;
use App\Models\JadwalUjianSoal;
use Inertia\Inertia;

class AddSoalController extends Controller
{
    
    public function addSoal(Request $request)
    {
        // Validasi input
        $request->validate([
            'paket_soal_id' => 'required|integer|exists:data_db.t_event,id_event',
            'soal' => 'required|string|max:1000|exists:m_soal,ids',
        ]);

        $jadwalUjian = JadwalUjian::findOrFail($request->input('paket_soal_id'));
        $jadwalUjianSoal = JadwalUjianSoal::where('id_ujian', $jadwalUjian->id_ujian)
            ->where('kd_bidang', $jadwalUjian->kode_part)
            ->first();

        $jadwalUjianNew = JadwalUjianSoal::create([
            'nama_ujian' => $jadwalUjian->nama_ujian,
            'kode_kelas' => $jadwalUjian->kode_kelas,
            'id_event' => $jadwalUjian->id_event,
            'kode_part' => $jadwalUjian->kode_part,
        ]);

        $jadwalUjianSoalNew = JadwalUjianSoal::create([
            'id_ujian' => $jadwalUjianNew->id_ujian,
            'kd_bidang' => $jadwalUjian->kode_part,
            'total_soal' => count($request->input('soal')),
            'ujian_soal' => $request->input('soal')
        ]);
    }

    public function showAddSoalForm()
    {
        // Menampilkan halaman tambah soal ke paket soal (Inertia/React)
        return Inertia::render('banksoalcheckbox');
    }
}
