<?php

namespace App\Http\Controllers\Imports;

use App\Models\Peserta;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class PesertaImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        Log::debug('Data yang diterima:', ['rows' => $rows]);

        foreach ($rows as $row) {
            Log::debug('Processing row:', ['row' => $row]);

            Peserta::updateOrCreate(
                ['nis' => $row['nis']],
                [
                    'username' => $row['username'],
                    'password' => Hash::make($row['password'] ?? 'password123'),
                    'status'   => $row['status'] ?? 1, //inget ya yang dipake itu status bukan aktif
                    'jurusan'  => $row['jurusan'] ?? null,
                    'nama'     => $row['nama'],
                ]
            );
        }

        Log::debug('Import process completed successfully');
    }
}