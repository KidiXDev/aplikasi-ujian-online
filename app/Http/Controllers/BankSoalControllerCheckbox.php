<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MatchSoal;
use App\Models\PaketSoal;
use Illuminate\Support\Facades\Log;

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
    public function edit(Request $request, PaketSoal $paket_soal)
    {
        // Ambil data paket soal beserta relasi match_soal
        $paket_soal = PaketSoal::with(['match_soal'])->findOrFail($paket_soal->id);

        // Ambil ID soal yang sudah match
        $matchedSoalIds = $paket_soal->match_soal->pluck('soal_id')->toArray();

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

        return Inertia::render('banksoalcheckbox', [
            'dataSoal' => $dataSoal,
            'filters' => [
                'search' => $search,
                'pages' => $perPage,
            ],
            'paketSoal' => [
                'id' => $paket_soal->id,
                'nama_paket' => $paket_soal->nama_paket,
            ],
            'matchedSoalIds' => $matchedSoalIds, // Kirim ID soal yang sudah match
        ]);
    }

    public function update(Request $request, PaketSoal $paket_soal)
    {
        Log::info('Data yang diterima:', $request->all());

        // Validasi data
        $data = $request->validate([
            'soal_id' => 'nullable|array',
            'soal_id.*' => 'integer|exists:data_db.m_soal,ids',
        ]);

        $soalIds = $data['soal_id'] ?? [];

        // Hapus semua relasi sebelumnya
        MatchSoal::where('paket_id', $paket_soal->id)->delete();

        // Simpan relasi soal baru
        foreach ($soalIds as $id) {
            MatchSoal::create([
                'soal_id' => $id,
                'paket_id' => $paket_soal->id,
            ]);
        }

        return back()->with('success', 'Soal berhasil diperbarui.');
    }

}
