<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\DosenImport;
use Illuminate\Support\Facades\Log;  // Import log

class DosenImportController extends Controller
{
    public function importViewDosen()
    {
        Log::debug('Navigating to import view');  // Debugging ketika mengakses view
        return Inertia::render('dosen-management/ImportDosen');
    }

    public function import(Request $request)
    {
        // Debugging validasi file
        Log::debug('Received file for import: ', ['file' => $request->file('file')]);

        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls',
        ]);

        try {
            Log::debug('Starting import process');  // Debugging sebelum memulai proses import
            Excel::import(new DosenImport, $request->file('file'));

            // Hitung total dosen dan halaman terakhir
            $total = \App\Models\Dosen::count();
            $perPage = 10; // samakan dengan paginate di controller index
            $lastPage = ceil($total / $perPage);

            Log::debug('Import process completed successfully');  // Debugging setelah import selesai
            return redirect()->route('master-data.dosen.manager', ['page' => $lastPage])
                ->with('success', 'Import data dosen berhasil.');
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            // Log error jika ada masalah dalam validasi Excel
            Log::error('Excel validation error: ', ['error' => $e->getMessage()]);
            return redirect()->back()
                ->with('error', 'Validasi file gagal.')
                ->with('failures', $e->failures());
        } catch (\Exception $e) {
            // Log error jika ada masalah lainnya
            Log::error('Import failed: ', ['error' => $e->getMessage()]);
            return redirect()->back()
                ->with('error', 'Gagal import: ' . $e->getMessage());
        }
    }
}
