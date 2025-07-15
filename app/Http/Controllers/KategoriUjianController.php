<?php

namespace App\Http\Controllers;

use App\Models\KategoriSoal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

/**
 * =======================================================================
 * KATEGORI UJIAN CONTROLLER - TUGAS JOBDESK KATEGORI UJIAN
 * =======================================================================
 * 
 * DESKRIPSI:
 * Controller untuk mengelola master data kategori ujian dalam aplikasi ujian online.
 * Kategori ujian adalah pengelompokan/klasifikasi ujian berdasarkan topik/bidang tertentu.
 * 
 * DATABASE:
 * - Tabel utama: data_db.t_kat_soal
 * - Model: App\Models\KategoriSoal (app/Models/KategoriSoal.php)
 * - Struktur: id (int), kategori (varchar)
 * 
 * RELASI & INTEGRASI:
 * - Digunakan oleh: t_direction (field: kategori_soal)
 * - Digunakan oleh: Bank soal dan sistem lain melalui dropdown API
 * - Foreign key reference: kategori ujian sebagai string di tabel lain
 * 
 * FRONTEND PAGES:
 * - Index: resources/js/pages/master-data/kategori-soal/kategori-soal.tsx
 * - Form: resources/js/pages/master-data/kategori-soal/form.kategori-soal.tsx
 * - Menu: components/app-sidebar.tsx (Master Data > Kategori Ujian)
 * 
 * ROUTES:
 * - Web routes: routes/web.php (master-data.kategori-soal.*)
 * - API routes: /api/kategori-soal untuk dropdown
 * 
 * FITUR UTAMA:
 * - CRUD kategori ujian (Create, Read, Update, Delete)
 * - Search & pagination
 * - Validasi unique kategori
 * - Soft constraint checking sebelum delete
 * - API endpoint untuk dropdown di sistem lain
 * 
 * =======================================================================
 */
class KategoriUjianController extends Controller
{    /**
     * DISPLAY INDEX PAGE - KATEGORI UJIAN
     * 
     * Menampilkan halaman utama daftar kategori ujian dengan fitur:
     * - Pagination (default 10 per halaman)
     * - Search berdasarkan nama kategori
     * - Data dari tabel: data_db.t_kat_soal
     * 
     * Frontend: resources/js/pages/master-data/kategori-soal/kategori-soal.tsx
     * Route: GET /master-data/kategori-soal
     */
    public function index(Request $request)
    {
        $pages = $request->query('pages', 10);
        $search = $request->query('search', null);

        $query = KategoriSoal::query();

        if ($search) {
            $query->where('kategori', 'like', '%' . $search . '%');
        }

        $data = $query->paginate((int)$pages)->withQueryString();

        return Inertia::render('master-data/kategori-soal/kategori-soal', [
            'data' => $data,
            'filters' => [
                'search' => $search,
                'pages' => $pages,
            ],
        ]);
    }

    /**
     * DISPLAY CREATE FORM - KATEGORI UJIAN
     * 
     * CATATAN: Method ini tidak digunakan lagi karena form sekarang menggunakan dialog
     * di halaman utama. Tetap dipertahankan untuk kompatibilitas route.
     */
    public function create()
    {
        // Redirect ke halaman utama karena form sekarang menggunakan dialog
        return redirect()->route('master-data.kategori-soal.index');
    }

    /**
     * STORE NEW KATEGORI UJIAN
     * 
     * Menyimpan kategori ujian baru ke database
     * - Validasi: required, max 100 char, unique di t_kat_soal
     * - Manual ID increment (karena bukan auto_increment)
     * - Akan otomatis tersedia di dropdown sistem lain
     * 
     * Route: POST /master-data/kategori-soal
     */
    public function store(Request $request)
    {
        $request->validate([
            'kategori' => 'required|string|max:100|unique:data_db.t_kat_soal,kategori',
        ]);

        // Get the next ID manually since it's not auto-increment
        $lastId = KategoriSoal::max('id') ?? 0;
        $newId = $lastId + 1;

        KategoriSoal::create([
            'id' => $newId,
            'kategori' => $request->kategori,
        ]);

        return redirect()->route('master-data.kategori-soal.index')
            ->with('success', 'Kategori ujian berhasil ditambahkan');
    }

    /**
     * DISPLAY EDIT FORM - KATEGORI UJIAN
     * 
     * CATATAN: Method ini tidak digunakan lagi karena form sekarang menggunakan dialog
     * di halaman utama. Tetap dipertahankan untuk kompatibilitas route.
     */
    public function edit($id)
    {
        // Redirect ke halaman utama karena form sekarang menggunakan dialog
        return redirect()->route('master-data.kategori-soal.index');
    }

    /**
     * UPDATE KATEGORI UJIAN
     * 
     * Update data kategori ujian yang sudah ada
     * - Validasi: required, max 100 char, unique kecuali record sendiri
     * - Perubahan akan otomatis ter-reflect di sistem yang menggunakan
     * 
     * Route: PUT /master-data/kategori-soal/{id}
     */
    public function update(Request $request, $id)
    {
        $kategori = KategoriSoal::findOrFail($id);

        $request->validate([
            'kategori' => 'required|string|max:100|unique:data_db.t_kat_soal,kategori,' . $id . ',id',
        ]);

        $kategori->update([
            'kategori' => $request->kategori,
        ]);

        return redirect()->route('master-data.kategori-soal.index')
            ->with('success', 'Kategori ujian berhasil diperbarui');
    }

    /**
     * DELETE KATEGORI UJIAN
     * 
     * Hapus kategori ujian dengan pengecekan constraint
     * - Cek penggunaan di t_direction (field: kategori_soal)
     * - Jika digunakan, tidak bisa dihapus (soft constraint)
     * - Bisa ditambah pengecekan tabel lain sesuai kebutuhan
     * 
     * Route: DELETE /master-data/kategori-soal/{id}
     */
    public function destroy($id)
    {
        $kategori = KategoriSoal::findOrFail($id);

        // Check if kategori is being used in t_direction
        $isUsed = DB::connection('data_db')
            ->table('t_direction')
            ->where('kategori_soal', $kategori->kategori)
            ->exists();

        if ($isUsed) {
            return redirect()->back()
                ->with('error', 'Kategori ujian tidak dapat dihapus karena sedang digunakan');
        }

        $kategori->delete();

        return redirect()->back()
            ->with('success', 'Kategori ujian berhasil dihapus');
    }

    /**
     * API ENDPOINT - GET KATEGORI LIST FOR DROPDOWN
     * 
     * Endpoint API untuk mendapatkan list kategori ujian
     * Digunakan oleh sistem lain untuk dropdown/select options:
     * - Bank soal
     * - Direction/petunjuk soal
     * - Sistem ujian lainnya
     * 
     * Route: GET /api/kategori-soal
     * Response: JSON array [{"id": 1, "kategori": "Matematika"}, ...]
     */
    public function getKategoriList()
    {
        $data = KategoriSoal::select('id', 'kategori')->get();
        return response()->json($data);
    }
}
