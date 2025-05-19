<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Imports\PesertaImport;
use Illuminate\Support\Facades\Log;  // Import log

class PesertaImportController extends Controller
{
    public function importView()
    {
        Log::debug('Navigating to import view');  // Debugging ketika mengakses view
        return Inertia::render('master-data/import-peserta-form');
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
            Excel::import(new PesertaImport, $request->file('file'));

            Log::debug('Import process completed successfully');  // Debugging setelah import selesai
            return redirect()->back()->with('success', 'Import data peserta berhasil.');
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
