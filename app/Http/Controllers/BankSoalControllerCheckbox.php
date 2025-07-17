<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\JadwalUjian;
use App\Models\JadwalUjianSoal;

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

        $search = $request->input('search', null);
        $perPage = $request->input('pages', 10);
        $order = $request->input('order', 'asc');

        // Validate and set per page value
        if ($perPage === 'all') {
            $perPage = 999999; // Large number for "all"
        } else {
            $perPage = in_array($perPage, [10, 15, 25, 50]) ? (int)$perPage : 10;
        }

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

        // Ambil total soal yang tersedia untuk random selection
        $totalAvailableSoal = DB::connection('data_db')->table('m_soal')
            ->where('kd_mapel', $kodePart)
            ->count();

        // Ambil string ujian_soal dari model JadwalUjianSoal
        $ujianSoalString = $paket_soal->ujian_soal; // misal "10,11,12"

        // Ubah ke array integer
        $ujianSoalIds = $ujianSoalString ? array_filter(array_map('intval', explode(',', $ujianSoalString))) : [];

        // Hitung soal yang tersedia untuk ditambahkan
        $availableForAdd = $totalAvailableSoal - count($ujianSoalIds);

        return Inertia::render('banksoalcheckbox', [
            'dataSoal' => $dataSoal,
            'filters' => [
                'search' => $search,
                'pages' => $request->input('pages', 10),
                'order' => $order,
            ],
            'paketSoal' => [
                'id_ujian' => $paket_soal->id_ujian,
                'nama_ujian' => $jadwalUjian->nama_ujian,
                'kode_part' => $jadwalUjian->kode_part,
            ],
            'matchedSoalIds' => $ujianSoalIds,
            'totalAvailableSoal' => $totalAvailableSoal,
            'availableForAdd' => $availableForAdd,
        ]);
    }

    public function update(Request $request, JadwalUjianSoal $paket_soal)
    {
        // Validasi input - allow empty arrays for clearing selection
        $request->validate([
            'soal_id' => 'array',
            'soal_id.*' => 'integer|exists:data_db.m_soal,ids',
        ]);

        // Ambil data jadwal ujian
        $jadwalUjian = JadwalUjian::findOrFail($paket_soal->id_ujian);

        $soalIds = $request->input('soal_id', []);

        // Update JadwalUjianSoal
        JadwalUjianSoal::where('id_ujian', $paket_soal->id_ujian)->update([
            'kd_bidang' => $jadwalUjian->kode_part,
            'total_soal' => count($soalIds),
            'ujian_soal' => empty($soalIds) ? '' : implode(',', $soalIds),
        ]);

        // Ambil parameter untuk mempertahankan state
        $params = $request->only(['pages', 'search', 'order', 'page']);

        return redirect()
            ->route('master-data.bank-soal-checkbox.edit', $paket_soal->id_ujian)
            ->with($params)
            ->with('success', 'Soal berhasil diperbarui');
    }

    public function selectAll(Request $request, JadwalUjianSoal $paket_soal)
    {
        // Ambil data jadwal ujian
        $jadwalUjian = JadwalUjian::findOrFail($paket_soal->id_ujian);
        $kodePart = $jadwalUjian->kode_part;

        // Ambil semua ID soal yang sesuai dengan kode_part
        $allSoalIds = DB::connection('data_db')->table('m_soal')
            ->where('kd_mapel', $kodePart)
            ->orderBy('ids', 'asc')
            ->pluck('ids')
            ->toArray();

        // Update JadwalUjianSoal dengan semua soal
        JadwalUjianSoal::where('id_ujian', $paket_soal->id_ujian)->update([
            'kd_bidang' => $jadwalUjian->kode_part,
            'total_soal' => count($allSoalIds),
            'ujian_soal' => implode(',', $allSoalIds),
        ]);

        // Ambil parameter untuk mempertahankan state
        $params = $request->only(['pages', 'search', 'order', 'page']);

        return redirect()
            ->route('master-data.bank-soal-checkbox.edit', $paket_soal->id_ujian)
            ->with($params)
            ->with('success', 'Semua soal berhasil dipilih');
    }

    public function selectRandom(Request $request, JadwalUjianSoal $paket_soal)
    {
        // Validasi input
        $request->validate([
            'random_count' => 'required|integer|min:1|max:1000',
        ]);

        // Ambil data jadwal ujian
        $jadwalUjian = JadwalUjian::findOrFail($paket_soal->id_ujian);
        $kodePart = $jadwalUjian->kode_part;

        // Ambil semua ID soal yang sesuai dengan kode_part
        $allSoalIds = DB::connection('data_db')->table('m_soal')
            ->where('kd_mapel', $kodePart)
            ->orderBy('ids', 'asc')
            ->pluck('ids')
            ->toArray();

        $randomCount = $request->input('random_count');

        // Validasi jumlah soal yang diminta
        if ($randomCount > count($allSoalIds)) {
            return back()->with('error', 'Jumlah soal yang diminta melebihi total soal yang tersedia (' . count($allSoalIds) . ')');
        }

        // Pilih soal secara random
        $randomSoalIds = collect($allSoalIds)->random($randomCount)->toArray();

        // Update JadwalUjianSoal dengan soal random
        JadwalUjianSoal::where('id_ujian', $paket_soal->id_ujian)->update([
            'kd_bidang' => $jadwalUjian->kode_part,
            'total_soal' => count($randomSoalIds),
            'ujian_soal' => implode(',', $randomSoalIds),
        ]);

        // Ambil parameter untuk mempertahankan state
        $params = $request->only(['pages', 'search', 'order', 'page']);

        return redirect()
            ->route('master-data.bank-soal-checkbox.edit', $paket_soal->id_ujian)
            ->with($params)
            ->with('success', $randomCount . ' soal berhasil dipilih secara random');
    }

    public function addRandom(Request $request, JadwalUjianSoal $paket_soal)
    {
        // Validasi input
        $request->validate([
            'random_count' => 'required|integer|min:1|max:1000',
        ]);

        // Ambil data jadwal ujian
        $jadwalUjian = JadwalUjian::findOrFail($paket_soal->id_ujian);
        $kodePart = $jadwalUjian->kode_part;

        // Ambil soal yang sudah terpilih sebelumnya
        $currentSoalString = $paket_soal->ujian_soal;
        $currentSoalIds = $currentSoalString ? array_filter(array_map('intval', explode(',', $currentSoalString))) : [];

        // Ambil semua ID soal yang sesuai dengan kode_part
        $allSoalIds = DB::connection('data_db')->table('m_soal')
            ->where('kd_mapel', $kodePart)
            ->orderBy('ids', 'asc')
            ->pluck('ids')
            ->toArray();

        // Cari soal yang belum terpilih
        $availableSoalIds = array_diff($allSoalIds, $currentSoalIds);

        $randomCount = $request->input('random_count');

        // Validasi jumlah soal yang diminta
        if ($randomCount > count($availableSoalIds)) {
            return back()->with('error', 'Jumlah soal yang diminta melebihi total soal yang tersedia untuk ditambahkan (' . count($availableSoalIds) . ')');
        }

        // Pilih soal secara random dari yang belum terpilih
        $randomSoalIds = collect($availableSoalIds)->random($randomCount)->toArray();

        // Gabungkan dengan soal yang sudah ada
        $finalSoalIds = array_merge($currentSoalIds, $randomSoalIds);

        // Update JadwalUjianSoal dengan soal yang sudah digabungkan
        JadwalUjianSoal::where('id_ujian', $paket_soal->id_ujian)->update([
            'kd_bidang' => $jadwalUjian->kode_part,
            'total_soal' => count($finalSoalIds),
            'ujian_soal' => implode(',', $finalSoalIds),
        ]);

        // Ambil parameter untuk mempertahankan state
        $params = $request->only(['pages', 'search', 'order', 'page']);

        return redirect()
            ->route('master-data.bank-soal-checkbox.edit', $paket_soal->id_ujian)
            ->with($params)
            ->with('success', $randomCount . ' soal berhasil ditambahkan secara random');
    }

    public function clearAll(Request $request, JadwalUjianSoal $paket_soal)
    {
        // Kosongkan semua soal yang dipilih
        JadwalUjianSoal::where('id_ujian', $paket_soal->id_ujian)->update([
            'total_soal' => 0,
            'ujian_soal' => '',
        ]);

        // Ambil parameter untuk mempertahankan state
        $params = $request->only(['pages', 'search', 'order', 'page']);

        return redirect()
            ->route('master-data.bank-soal-checkbox.edit', $paket_soal->id_ujian)
            ->with($params)
            ->with('success', 'Semua soal berhasil dihapus');
    }

    public function back($paket_soal_id)
    {
        // Cari jadwal ujian berdasarkan id_ujian
        $jadwalUjian = JadwalUjian::findOrFail($paket_soal_id);
        $id_event = $jadwalUjian->id_event;
                
        // Redirect ke halaman paket soal berdasarkan event       
        return redirect()->route('master-data.part.show-by-event', ['id_event' => $id_event]);
    }    
}    



