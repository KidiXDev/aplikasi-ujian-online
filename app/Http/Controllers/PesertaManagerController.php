<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Peserta;
use Illuminate\Support\Facades\DB;

class PesertaManagerController extends Controller
{

    public function index(Request $request)
    {
        $query = Peserta::with('kategoriRef');
        
        // Filter berdasarkan search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nis', 'like', "%{$search}%")
                  ->orWhere('nama', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }
        
        // Filter berdasarkan filter value
        if ($request->filled('filter')) {
            $query->where('filter', $request->filter);
        }
        
        // Sorting - handle format dari frontend
        $sortParam = $request->get('sort', 'newest');
        
        switch ($sortParam) {
            case 'newest':
                $query->orderBy('id', 'desc');
                break;
            case 'oldest':
                $query->orderBy('id', 'asc');
                break;
            case 'nama_asc':
                $query->orderBy('nama', 'asc');
                break;
            case 'nama_desc':
                $query->orderBy('nama', 'desc');
                break;
            case 'nis_asc':
                $query->orderBy('nis', 'asc');
                break;
            case 'nis_desc':
                $query->orderBy('nis', 'desc');
                break;
            default:
                $query->orderBy('id', 'desc');
                break;
        }
        
        // Pagination
        $perPage = $request->get('pages', 10);
        $data = $query->paginate($perPage);
        
        return Inertia::render('master-data/peserta-manager', [
            'data' => $data,
            'filters' => array_merge($request->only(['search', 'pages', 'filter', 'sort']), [
                'sort' => $sortParam // Pastikan sort value selalu ada
            ]),
            'filterOptions' => Peserta::distinct()->pluck('filter')->filter()->sort()->values(),
        ]);
    }

    public function delete(Request $request, Peserta $peserta)
    {
        $nis = $peserta->nis;

        DB::transaction(function () use ($peserta, $nis) {
            // 1. Hapus dari t_peserta
            $peserta->delete();

            // 2. Hapus dari tblsiswa
            DB::connection('data_db')->table('tblsiswa')->where('nis', $nis)->delete();

            // 3. Hapus dari tblkelas
            DB::connection('data_db')->table('tblkelas')->where('Kelas', $nis)->delete();
        });

        return redirect()->back()->with('success', 'Peserta berhasil dihapus');
    }

    public function update(Request $request, Peserta $peserta)
    {

        $data = $request->validate([
            'username' => 'required|string|max:255',
            'status' => 'integer',
            'jurusan' => 'required|integer',
            'nis' => 'required|string|min:5|max:15',
            'nama' => 'required|string|max:255',
        ]);

        $peserta->update($data);

        // return redirect()->back()->with('success', 'Peserta berhasil diedit');
    }

    public function toggleStatus(Request $request, Peserta $peserta)
    {
        $peserta->status = $request->input('status', 0);
        $peserta->save();

        return redirect()->back()->with('success', 'Status berhasil diedit');
    }
}
