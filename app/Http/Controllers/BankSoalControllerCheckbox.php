<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MatchSoal;
use App\Models\PaketSoal;
use Illuminate\Support\Facades\Log;
use App\Models\JadwalUjian;
use App\Models\JadwalUjianSoal;
use App\Models\Bidang;

class BankSoalControllerCheckbox extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('pages', 10);
        $order = $request->get('order', 'asc');
        $kdMapel = $request->get('kd_mapel'); // Tambahkan ini
    
        $query = DB::connection('data_db')->table('m_soal')
            ->select('m_soal.*', 'm_bidang.nama as bidang_nama') // Tambahkan nama bidang
            ->leftJoin('m_bidang', 'm_soal.kd_mapel', '=', 'm_bidang.kode')
            ->orderBy('m_soal.ids', $order);

        // Tambahkan filter kd_mapel
        if ($kdMapel) {
            $query->where('m_soal.kd_mapel', $kdMapel);
        }
        
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kategori_soal', 'like', "%{$search}%")
                    ->orWhere('header_soal', 'like', "%{$search}%")
                    ->orWhere('body_soal', 'like', "%{$search}%")
                    ->orWhere('footer_soal', 'like', "%{$search}%");
            });
        }
    
        $data = $query->paginate($perPage)->withQueryString();

        // Get unique kd_mapel values for filter options
        $kdMapelOptions = DB::connection('data_db')
            ->table('m_bidang')
            ->select('kode', 'nama')
            ->get();

        return Inertia::render('banksoal', [
            'dataSoal' => $data,
            'filters' => [
                'search' => $search,
                'pages' => $perPage,
                'order' => $order,
                'kd_mapel' => $kdMapel,
            ],
            'kdMapelOptions' => $kdMapelOptions, // Tambahkan ini
        ]);
    }    
    public function edit(Request $request, JadwalUjianSoal $paket_soal)
    {
        // Ambil data paket soal dan jadwal ujian
        $paket_soal = JadwalUjianSoal::findOrFail($paket_soal->id_ujian);
        $jadwalUjian = JadwalUjian::findOrFail($paket_soal->id_ujian);

        // Ambil kode_part dari jadwal ujian untuk filter soal
        $kodePart = $jadwalUjian->kode_part;

        $search = $request->query('search', null);
        $perPage = $request->input('pages', 10);
        $order = $request->get('order', 'asc');

        $query = DB::connection('data_db')->table('m_soal')
            ->select(
                'ids', 
                'suara', 
                'header_soal', 
                'body_soal', 
                'footer_soal', 
                'jw_1', 
                'jw_2', 
                'jw_3', 
                'jw_4', 
                'jw_fix',
                'kd_mapel'
            )
            ->where('kd_mapel', $kodePart) // Filter soal berdasarkan kode_part
            ->orderBy('ids', $order);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kategori_soal', 'like', '%' . $search . '%')
                    ->orWhere('header_soal', 'like', '%' . $search . '%')
                    ->orWhere('body_soal', 'like', '%' . $search . '%')
                    ->orWhere('footer_soal', 'like', '%' . $search . '%');
            });
        }

        $dataSoal = $query->paginate($perPage)->withQueryString();

        // Ambil string ujian_soal dari model JadwalUjianSoal
        $ujianSoalString = $paket_soal->ujian_soal; // misal "10,11,12"

        // Ubah ke array integer
        $ujianSoalIds = $ujianSoalString ? array_filter(array_map('intval', explode(',', $ujianSoalString))) : [];

        return Inertia::render('banksoalcheckbox', [
            'dataSoal' => $dataSoal,
            'filters' => [
                'search' => $search,
                'pages' => $perPage,
                'order' => $order,
            ],
            'paketSoal' => [
                'id_ujian' => $paket_soal->id_ujian,
                'nama_ujian' => $jadwalUjian->nama_ujian,
                'kode_part' => $jadwalUjian->kode_part,
            ],
            'matchedSoalIds' => $ujianSoalIds,
        ]);
    }

    public function update(Request $request, JadwalUjianSoal $paket_soal)
    {
        // Validasi input
        $request->validate([
            'soal_id' => 'required|array|min:1',
            'soal_id.*' => 'integer|exists:data_db.m_soal,ids',
        ]);

        // Ambil data jadwal ujian
        $jadwalUjian = JadwalUjian::findOrFail($paket_soal->id_ujian);

        // Update JadwalUjianSoal
        JadwalUjianSoal::where('id_ujian', $paket_soal->id_ujian)->update([
            'kd_bidang' => $jadwalUjian->kode_part,
            'total_soal' => count($request->input('soal_id')),
            'ujian_soal' => implode(',', $request->input('soal_id')),
        ]);

        return redirect()
            ->back()
            ->with('success', 'Soal berhasil diperbarui');
    }
}
