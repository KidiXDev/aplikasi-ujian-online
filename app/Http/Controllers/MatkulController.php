<?php

namespace App\Http\Controllers;

use App\Models\Matakuliah;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MatkulController extends Controller
{
    public function index(Request $request)
    {
        // Ambil parameter dari request
        $pages = $request->query('pages', 10);
        $search = $request->query('search', null);
        
        // Buat query dasar dengan relasi dosen
        $query = Matakuliah::with('dosen');
        
        // Tambahkan pencarian jika parameter search ada
        if ($search) {
            $query->where('kode_mk', 'like', '%' . $search . '%')
                  ->orWhere('nama_mk', 'like', '%' . $search . '%');
        }

        // Ambil total data untuk validasi pagination
        $totalData = $query->count();
        
        // Hitung maksimum halaman yang valid
        $perPage = (int)$pages;
        $maxPage = ceil($totalData / $perPage);
        
        // Validasi page sesuai data yang tersedia
        $currentPage = $request->query('page', 1);
        if ($currentPage > $maxPage && $maxPage > 0) {
            return redirect()->route('master-data.matakuliah.index', [
                'page' => $maxPage,
                'pages' => $pages,
                'search' => $search
            ]);
        }
        
        // Ambil data dengan pagination
        $matakuliahs = $query->paginate($perPage)->withQueryString();
        
        // Format data untuk frontend
        $matakuliahs->through(function ($matakuliah) {
            return [
                'id' => $matakuliah->id_mk,
                'kode' => $matakuliah->kode_mk,
                'nama' => $matakuliah->nama_mk,
                'sks' => $matakuliah->sks,
                'semester' => $matakuliah->semester,
                'prodi' => $matakuliah->prodi,
                'id_dosen' => $matakuliah->id_dosen,
                'nama_dosen' => $matakuliah->dosen ? $matakuliah->dosen->name : '-',
                'prasyarat' => $matakuliah->prasyarat ?: '-'
            ];
        });
        
        // Render halaman dengan data
        return Inertia::render(
            'matakuliah/matakuliah',
            [
                'data' => $matakuliahs,
                'filters' => [
                    'search' => $search,
                    'pages' => $pages,
                ],
                'dosen_list' => $this->getDosenList()
            ]
        );
    }
    
    // Fungsi untuk mendapatkan daftar dosen
    private function getDosenList()
    {
        // Mengambil data dosen dari model User
        return User::select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name
                ];
            });
    }
    
    public function create()
    {
        return Inertia::render('matakuliah/form.matakuliah', [
            'isEdit' => false,
            'dosen_list' => $this->getDosenList()
        ]);
    }
    
    public function store(Request $request)
    {
        // Validasi data yang diinput
        $request->validate([
            'kode_mk' => 'required|string|max:10|unique:data_db.tblmatkul,kode_mk',
            'nama_mk' => 'required|string|max:255',
            'sks' => 'required|integer|min:1',
            'semester' => 'required|integer|min:1|max:8',
            'prodi' => 'required|string|max:255',
            'id_dosen' => 'nullable|integer|exists:users,id',
            'prasyarat' => 'nullable|string',
        ]);
        
        // Buat data matakuliah baru
        Matakuliah::create($request->all());
        
        // Redirect ke halaman daftar dengan pesan sukses
        return redirect()->route('master-data.matakuliah.index')
            ->with('success', 'Mata Kuliah berhasil ditambahkan');
    }
    
    public function edit(Matakuliah $matakuliah)
    {
        return Inertia::render('matakuliah/form.matakuliah', [
            'isEdit' => true,
            'matakuliah' => $matakuliah,
            'dosen_list' => $this->getDosenList()
        ]);
    }
    
    public function update(Request $request, Matakuliah $matakuliah)
    {
        // Mengkonversi kode_mk ke string terlebih dahulu
        $data = $request->all();
        if (isset($data['kode_mk'])) {
            $data['kode_mk'] = (string)$data['kode_mk'];
            $request->merge(['kode_mk' => $data['kode_mk']]); // Merge kembali ke request
        }
        
        // Validasi data yang diinput
        $request->validate([
            'kode_mk' => [
                'required',
                'string',
                'max:10',
                Rule::unique('data_db.tblmatkul', 'kode_mk')->ignore($matakuliah->id_mk, 'id_mk')
            ],
            'nama_mk' => 'required|string|max:255',
            'sks' => 'required|integer|min:1',
            'semester' => 'required|integer|min:1|max:8',
            'prodi' => 'required|string|max:255',
            'id_dosen' => 'nullable|integer|exists:users,id',
            'prasyarat' => 'nullable|string',
        ]);
        
        // Update data matakuliah dengan data yang sudah dikonversi
        $matakuliah->update($data);
        
        // Redirect dengan pesan sukses
        return redirect()->route('master-data.matakuliah.index')
            ->with('success', 'Mata Kuliah berhasil diperbarui');
    }
    
    public function destroy(Matakuliah $matakuliah)
    {
        // Hapus data matakuliah
        $matakuliah->delete();
        
        // Redirect dengan pesan sukses
        return redirect()->back()
            ->with('success', 'Mata Kuliah berhasil dihapus');
    }
}