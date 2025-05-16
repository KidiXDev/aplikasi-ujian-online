<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bidang;
use App\Models\MatchSoal;
use App\Models\Soal;
use Inertia\Inertia;
use App\Models\JenisUjian;
use App\Models\PaketSoal;
use Illuminate\Validation\Rule;


class PaketSoalEditController extends Controller
{
    public function edit($id)
    {
        $paket_soal = PaketSoal::with(['match_soal', 'bidang'])->findOrFail($id);
        $options = Bidang::select('kode', 'type', 'nama')->get();

        return Inertia::render('master-data/paket-soal/form.paket-soal', [
            'paket' => [
                'id' => $paket_soal->id,
                'kode_bidang' => $paket_soal->kode_bidang,
                'jenis_ujian' => $paket_soal->bidang->nama,
                'nama_paket_ujian' => $paket_soal->nama_paket,
                'kategori_ujian' => $paket_soal->bidang->type,
            ],
            'options' => $options, // Data kategori dan jenis ujian
        ]);
    }

    public function update(Request $request, PaketSoal $paket_soal)
    {
        $data = $request->validate([
            'nama_paket_ujian' => 'required|string',
            'kode_bidang' => [
                'required',
                'integer',
                Rule::exists('data_db.m_bidang', 'kode'),
            ],
        ]);

        $paket_soal->update([
            'nama_paket' => $data['nama_paket_ujian'],
            'kode_bidang' => $data['kode_bidang'],
        ]);

        return redirect()->route('master-data.paket-soal.manager')
            ->with('success', 'Paket soal berhasil diperbarui.');
    }

    public function create()
    {
        $options = Bidang::select('kode', 'type', 'nama')->get();

        return Inertia::render('master-data/paket-soal/form.paket-soal', [
            'paket' => null,
            'options' => $options, // Data kategori dan jenis ujian
        ]);
    }

    public function store_data(Request $request)
    {
        $data = $request->validate([
            'nama_paket_ujian' => 'required|string',
            'kode_bidang' => [
                'required',
                'integer',
                Rule::exists('data_db.m_bidang', 'kode'),
            ],
            'kategori_ujian' => 'required|string',
        ]);
    
        $paket_soal = PaketSoal::create([
            'nama_paket' => $data['nama_paket_ujian'],
            'kode_bidang' => $data['kode_bidang'],
            'kategori_ujian' => $data['kategori_ujian'],
        ]);
    
        return redirect()->route('master-data.bank-soal-checkbox.edit', $paket_soal->id)
            ->with('success', 'Paket soal berhasil dibuat.');
    }

    public function store(Request $request)
    {
        $options = Bidang::select('kode', 'type', 'nama')->get();
        $data = $request->validate([
            'nama_paket_ujian' => 'required|string',
            'kode_bidang' => [
                'required',
                'integer',
                Rule::exists('data_db.m_bidang', 'kode'),
            ],

            'kategori_ujian' => 'required|string',
            'match_soal' => 'nullable|array',
            'match_soal.*.soal_id' => 'nullable|integer|exists:m_soal,ids',
        ]);

        $paket_soal = PaketSoal::create([
            'nama_paket' => $data['nama_paket_ujian'],
            'kode_bidang' => $data['kode_bidang'],
        ]);

        $matchSoal = $data['match_soal'] ?? [];

        if (!empty($matchSoal)) {
            foreach ($matchSoal as $item) {
                MatchSoal::create([
                    'soal_id' => $item['soal_id'],
                    'paket_id' => $paket_soal->id,
                ]);
            }
        }

        return redirect()->route('master-data.paket-soal.manager')->with('success', 'Kategori ujian berhasil ditambahkan.');
    }

    public function edit_soal($id)
    {
        $paket_soal = PaketSoal::with(['match_soal', 'bidang'])->findOrFail($id);
        $options = Bidang::select('kode', 'type', 'nama')->get();
        $soal = Soal::all();

        return Inertia::render('master-data/paket-soal/form.paket-soal-soal', [
            'paket' => [
                'id' => $paket_soal->id,
                'kode_bidang' => $paket_soal->kode_bidang,
                'jenis_ujian' => $paket_soal->bidang->nama,
                'nama_paket_ujian' => $paket_soal->nama_paket,
                'kategori_ujian' => $paket_soal->bidang->type,
            ],
            'options' => $options, // Data kategori dan jenis ujian
            'soals' => $soal, // Data soal
        ]);
    }

    public function update_soal(Request $request, $id)
    {
        $paket_soal = PaketSoal::findOrFail($id);
        $data = $request->validate([
            'match_soal' => 'nullable|array',
            'match_soal.*.soal_id' => 'nullable|integer|exists:m_soal,ids',
        ]);

        $matchSoal = $data['match_soal'] ?? [];

        if (!empty($matchSoal)) {
            // Hapus semua relasi soal yang ada
            MatchSoal::where('paket_id', $paket_soal->id)->delete();

            // Simpan relasi soal baru
            foreach ($matchSoal as $item) {
                MatchSoal::create([
                    'soal_id' => $item['soal_id'],
                    'paket_id' => $paket_soal->id,
                ]);
            }
        }

        return redirect()->route('master-data.paket-soal.manager')->with('success', 'Kategori ujian berhasil diperbarui.');
    }
}
