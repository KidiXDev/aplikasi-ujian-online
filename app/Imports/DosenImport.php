<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Dosen;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class DosenImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        // Menambahkan log untuk melihat data yang diterima dari file Excel
        Log::debug('Data yang diterima:', ['rows' => $rows]);

        foreach ($rows as $row) {
            // Debugging data per baris
            Log::debug('Processing row:', ['row' => $row]);

            // Cek atau buat user berdasarkan email
            $user = User::firstOrCreate(
                ['email' => $row['email']],
                [
                    'name'     => $row['name'],
                    'nip'      => $row['nip'],
                    'password' => Hash::make($row['password'] ?? 'password123'),
                ]
            );

            Log::debug('User created or found:', ['user' => $user]);

            // Menambahkan role dosen
            $user->assignRole('dosen');

            // Cek atau buat dosen
            $dosen = Dosen::updateOrCreate(
                ['nip' => $row['nip']],
                [
                    'nama'     => $row['name'],
                    // 'email'    => $row['email'],
                    'aktif'    => $row['aktif'] ?? 'Y',
                    // 'roles'    => $row['roles'] ?? 'dosen',
                    'password' => Hash::make($row['password'] ?? 'password123'),
                ]
            );

            Log::debug('Dosen created or updated:', ['dosen' => $dosen]);
        }

        Log::debug('Import process completed successfully');
    }
}
