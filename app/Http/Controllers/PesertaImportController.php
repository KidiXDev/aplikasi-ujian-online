<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Imports\PesertaImport;
use Illuminate\Support\Facades\Log;

class PesertaImportController extends Controller
{
    public function importView()
    {
        Log::debug('Navigating to import view');
        return Inertia::render('master-data/import-peserta-form');
    }

    public function import(Request $request)
    {
        Log::debug('Received file for import: ', ['file' => $request->file('file')]);

        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls',
        ]);

        try {
            Log::debug('Starting import process');
            
            $import = new PesertaImport();
            Excel::import($import, $request->file('file'));

            Log::debug('Import process completed successfully');
            return redirect()->back()->with('success', 'Import data peserta berhasil.');
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            Log::error('Excel validation error: ', [
                'error' => $e->getMessage(),
                'failures' => $e->failures()
            ]);
            
            return redirect()->back()->withErrors([
                'error' => 'Validasi file gagal. Periksa format file Excel.'
            ]);
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            
            Log::error('Import failed: ', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()->withErrors([
                'error' => $errorMessage
            ]);
        }
    }
}
