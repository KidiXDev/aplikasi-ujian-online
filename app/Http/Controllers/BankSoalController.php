<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankSoalController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('pages', 10);

        $query = DB::connection('data_db')->table('m_soal')
            ->select('ids', 'suara', 'footer_soal', 'body_soal', 'jw_1', 'jw_2', 'jw_3', 'jw_4', 'jw_5', 'jw_fix');

        if ($search) {
            $query->where('body_soal', 'like', "%$search%");
        }

        $data = $query->paginate($perPage)->withQueryString();

        return Inertia::render('banksoal', [
            'dataSoal' => $data,
            'filters' => [
                'search' => $search,
                'pages' => $perPage,
            ],
        ]);
    }

    public function destroy($id)
    {
        try {
            // Ambil data soal untuk cek apakah ada file audio
            $soal = DB::connection('data_db')->table('m_soal')->where('ids', $id)->first();
    
            if ($soal && $soal->suara) {
                Storage::disk('public')->delete($soal->suara);
            }
    
            DB::connection('data_db')->table('m_soal')->where('ids', $id)->delete();
    
            return redirect()->back()->with('success', 'Soal berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus soal: ' . $e->getMessage());
        }
    }    

    public function edit($id)
    {
        $soal = DB::connection('data_db')->table('m_soal')->where('ids', $id)->first();
        if (!$soal) {
            return redirect()->route('bank.soal')->with('error', 'Soal tidak ditemukan');
        }

        return Inertia::render('banksoaledit', [
            'soal' => $soal
        ]);
    }

    public function store(Request $request)
{
    $request->validate([
        'kategori_soal' => 'required|string',
        'footer_soal' => 'nullable|string',
        'body_soal' => 'required|string',
        'jw_1' => 'required|string',
        'jw_2' => 'required|string',
        'jw_3' => 'required|string',
        'jw_4' => 'required|string',
        'jw_5' => 'required|string',
        'jw_fix' => 'required|in:1,2,3,4,5',
        'file' => 'nullable|file|mimes:mp3,wav',
    ]);

    $filename = null;
    if ($request->hasFile('file')) {
        $filename = $request->file('file')->store('soal_audio', 'public');
    }

    DB::connection('data_db')->table('m_soal')->insert([
        'kategori_soal' => $request->kategori_soal,
        'footer_soal' => $request->footer_soal,
        'body_soal' => $request->body_soal,
        'jw_1' => $request->jw_1,
        'jw_2' => $request->jw_2,
        'jw_3' => $request->jw_3,
        'jw_4' => $request->jw_4,
        'jw_5' => $request->jw_5,
        'jw_fix' => $request->jw_fix,
        'suara' => $filename,
    ]);

    return redirect()->route('master-data.bank.soal')->with('success', 'Soal berhasil ditambahkan.');
}

public function update(Request $request, $id)
{
    $request->validate([
        'kategori_soal' => 'required|string',
        'footer_soal' => 'nullable|string',
        'body_soal' => 'required|string',
        'jw_1' => 'required|string',
        'jw_2' => 'required|string',
        'jw_3' => 'required|string',
        'jw_4' => 'required|string',
        'jw_5' => 'required|string',
        'jw_fix' => 'required|in:1,2,3,4,5',
        'file' => 'nullable|file|mimes:mp3,wav',
    ]);

    // Ambil soal yang ingin diperbarui
    $soal = DB::connection('data_db')->table('m_soal')->where('ids', $id)->first();
    
    if (!$soal) {
        return redirect()->route('bank.soal')->with('error', 'Soal tidak ditemukan');
    }

    $filename = $soal->suara; // Menggunakan file lama jika tidak ada file baru

    // Jika ada file baru yang diupload
    if ($request->hasFile('file')) {
        // Hapus file lama jika ada
        if ($soal->suara) {
            Storage::disk('public')->delete($soal->suara); 
        }
        // Simpan file baru
        $filename = $request->file('file')->store('soal_audio', 'public');
    }

    // Update data soal
    DB::connection('data_db')->table('m_soal')->where('ids', $id)->update([
        'kategori_soal' => $request->kategori_soal,
        'footer_soal' => $request->footer_soal,
        'body_soal' => $request->body_soal,
        'jw_1' => $request->jw_1,
        'jw_2' => $request->jw_2,
        'jw_3' => $request->jw_3,
        'jw_4' => $request->jw_4,
        'jw_5' => $request->jw_5,
        'jw_fix' => $request->jw_fix,
        'suara' => $filename,
    ]);

    return redirect()->route('master-data.bank.soal')->with('success', 'Soal berhasil diperbarui.');
}

}
