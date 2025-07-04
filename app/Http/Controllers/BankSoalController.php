<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class BankSoalController extends Controller
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

    public function destroy($id)
    {
        try {
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
        $soal = DB::connection('data_db')
            ->table('m_soal')
            ->select('m_soal.*', 'm_bidang.nama as bidang_nama')
            ->leftJoin('m_bidang', 'm_soal.kd_mapel', '=', 'm_bidang.kode')
            ->where('ids', $id)
            ->first();

        if (!$soal) {
            return redirect()->route('bank.soal')->with('error', 'Soal tidak ditemukan');
        }

        return Inertia::render('banksoaledit', [
            'soal' => $soal
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Header Soal:', [$request->input('header_soal')]);
        Log::info('Body Soal:', [$request->input('body_soal')]);
        Log::info('Footer Soal:', [$request->input('footer_soal')]);

        $request->validate([
            'kategori_soal' => 'required|string',
            'kd_mapel' => 'required|string',  // Add this validation
            'header_soal' => 'nullable|string',
            'body_soal' => 'nullable|string',
            'footer_soal' => 'nullable|string',
            'jw_1' => 'required|string',
            'jw_2' => 'required|string',
            'jw_3' => 'required|string',
            'jw_4' => 'required|string',
            'jw_fix' => 'required|in:A,B,C,D,0,1,2,3',
            'jenis_soal' => 'nullable|string',
            'file' => 'nullable|file|mimes:mp3,wav',
        ]);        

        $mapping = ['A' => 0, 'B' => 1, 'C' => 2, 'D' => 3];
        $jw_fix = is_numeric($request->jw_fix) ? $request->jw_fix : ($mapping[$request->jw_fix] ?? 0);

        $filename = null;
        if ($request->hasFile('file')) {
            $filename = $request->file('file')->store('soal_audio', 'public');
        }

        DB::connection('data_db')->table('m_soal')->insert([
            'kategori_soal' => $request->kategori_soal,  // This will store kategori from t_kat_soal
            'kd_mapel' => $request->kd_mapel,  // This will store the jenis ujian code
            'header_soal' => $request->header_soal,
            'body_soal' => $request->body_soal,
            'footer_soal' => $request->footer_soal,
            'jw_1' => $request->jw_1,
            'jw_2' => $request->jw_2,
            'jw_3' => $request->jw_3,
            'jw_4' => $request->jw_4,
            'jw_fix' => $jw_fix,
            'jenis_soal' => $request->jenis_soal,
            'suara' => $filename,
        ]);        

        return redirect()->route('master-data.bank.soal')->with('success', 'Soal berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'kategori_soal' => 'required|string',
            'kd_mapel' => 'required|string',  // Add this validation
            'header_soal' => 'nullable|string',
            'body_soal' => 'nullable|string',
            'footer_soal' => 'nullable|string',
            'jw_1' => 'required|string',
            'jw_2' => 'required|string',
            'jw_3' => 'required|string',
            'jw_4' => 'required|string',
            'jw_fix' => 'requirFed|in:A,B,C,D,0,1,2,3',
            'jenis_soal' => 'nullable|string',
            'file' => 'nullable|file|mimes:mp3,wav',
            'delete_audio' => 'nullable|boolean',
        ]);

        $soal = DB::connection('data_db')->table('m_soal')->where('ids', $id)->first();

        if (!$soal) {
            return redirect()->route('bank.soal')->with('error', 'Soal tidak ditemukan');
        }

        $mapping = ['A' => 0, 'B' => 1, 'C' => 2, 'D' => 3];
        $jw_fix = is_numeric($request->jw_fix) ? $request->jw_fix : ($mapping[$request->jw_fix] ?? 0);

        $filename = $soal->suara;

        // Jika ada permintaan untuk menghapus audio
        if ($request->has('delete_audio') && $request->delete_audio) {
            if ($soal->suara) {
                Storage::disk('public')->delete($soal->suara);
                $filename = null; // Set audio menjadi null setelah dihapus
            }
        }

        if ($request->hasFile('file')) {
            if ($soal->suara) {
                Storage::disk('public')->delete($soal->suara);
            }

            $filename = $request->file('file')->store('soal_audio', 'public');
        }

        DB::connection('data_db')->table('m_soal')->where('ids', $id)->update([
            'kategori_soal' => $request->kategori_soal,  // This will store kategori from t_kat_soal
            'kd_mapel' => $request->kd_mapel,  // This will store the jenis ujian code
            'header_soal' => $request->header_soal,
            'body_soal' => $request->body_soal,
            'footer_soal' => $request->footer_soal,
            'jw_1' => $request->jw_1,
            'jw_2' => $request->jw_2,
            'jw_3' => $request->jw_3,
            'jw_4' => $request->jw_4,
            'jw_fix' => $jw_fix,
            'jenis_soal' => $request->jenis_soal,
            'suara' => $filename,
        ]);

        return redirect()->route('master-data.bank.soal')->with('success', 'Soal berhasil diperbarui.');
    }

    public function getKategoriSoal()
    {
        try {
            $kategoriSoal = DB::connection('data_db')
                ->table('t_kat_soal')
                ->select('kategori')
                ->get();

            Log::info('Kategori Soal fetched:', $kategoriSoal->toArray()); // Tambahkan logging
            return response()->json($kategoriSoal);
        } catch (\Exception $e) {
            Log::error('Error fetching kategori soal: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch kategori soal'], 500);
        }
    }
}
