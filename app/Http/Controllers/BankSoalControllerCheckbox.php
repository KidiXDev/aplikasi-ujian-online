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

class BankSoalControllerCheckbox extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('pages', 10);
        $order = $request->get('order', 'asc');
    
        $query = DB::connection('data_db')->table('m_soal')
            ->select('ids', 'suara', 'header_soal', 'body_soal', 'footer_soal', 'jw_1', 'jw_2', 'jw_3', 'jw_4', 'jw_fix')
            ->orderBy('ids', $order);
    
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kategori_soal', 'like', "%{$search}%")
                    ->orWhere('header_soal', 'like', "%{$search}%")
                    ->orWhere('body_soal', 'like', "%{$search}%")
                    ->orWhere('footer_soal', 'like', "%{$search}%");
            });
        }
    
        $data = $query->paginate($perPage)->withQueryString();
    
        return Inertia::render('banksoalcheckbox', [
            'dataSoal' => $data,
            'filters' => [
                'search' => $search,
                'pages' => $perPage,
            ],
        ]);
    }    
    public function edit(Request $request, JadwalUjianSoal $paket_soal)
    {
        // Ambil data paket soal beserta relasi match_soal
        $paket_soal = JadwalUjianSoal::findOrFail($paket_soal->id_ujian);

        // Ambil ID soal yang sudah match
        $idsoal = 

        // Ambil semua soal dari tabel m_soal
        $search = $request->query('search', null);
        $perPage = $request->input('pages', 10);

        $query = DB::connection('data_db')->table('m_soal')
            ->select('ids', 'suara', 'header_soal', 'body_soal', 'footer_soal', 'jw_1', 'jw_2', 'jw_3', 'jw_4', 'jw_fix')
            ->orderBy('ids');

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
        $ujianSoalIds = array_filter(array_map('intval', explode(',', $ujianSoalString)));

        // Query soal yang sesuai
        $soalList = DB::connection('data_db')
            ->table('m_soal')
            ->whereIn('ids', $ujianSoalIds)
            ->get();

        // Assign matched soal IDs (use $ujianSoalIds as the matched IDs)
        $matchedSoalIds = $ujianSoalIds;

        return Inertia::render('banksoalcheckbox', [
            'dataSoal' => $dataSoal,
            'filters' => [
                'search' => $search,
                'pages' => $perPage,
            ],
            'paketSoal' => [
                'id_ujian' => $paket_soal->id_ujian,
                'nama_ujian' => $paket_soal->nama_ujian,
            ],
            'matchedSoalIds' => $matchedSoalIds, // Kirim ID soal yang sudah match
        ]);
    }

    public function update(Request $request, JadwalUjianSoal $paket_soal)
    {
        // Validasi input
        $request->validate([
            'soal_id' => 'required|array|min:1',
            'soal_id.*' => 'integer|exists:data_db.m_soal,ids',
        ]);

        // Ambil data jadwal ujian lama
        $jadwalUjianSoal = JadwalUjian::findOrFail($paket_soal->id_ujian);

        // // Buat data baru di JadwalUjian (copy dari lama)
        // $jadwalUjianBaru = JadwalUjian::create([
        //     'nama_ujian'  => $jadwalUjianLama->nama_ujian,
        //     'kode_kelas'  => $jadwalUjianLama->kode_kelas,
        //     'id_event'    => $jadwalUjianLama->id_event,
        //     'kode_part'   => $jadwalUjianLama->kode_part,
        // ]);

        $jadwalUjianSoal = JadwalUjianSoal::findOrFail($paket_soal->id_ujian)->update([
            'total_soal' => count($request->input('soal_id')),
            'ujian_soal' => implode(',', $request->input('soal_id')),
        ]);

        return redirect()
            ->back()
            ->with('success', 'Soal berhasil ditambahkan sebagai data baru');
    }
}
