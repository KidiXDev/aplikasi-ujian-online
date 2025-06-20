<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Dosen;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class DosenImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        // Ambil semua NIP dan nama yang sudah ada di tabel Dosen
        $existingNips = Dosen::pluck('nip')->map(fn($v) => strtolower($v))->toArray();
        $existingNames = Dosen::pluck('nama')->map(fn($v) => strtolower($v))->toArray();

        // Ambil semua email yang sudah ada di tabel User
        $existingEmails = User::pluck('email')->map(fn($v) => strtolower($v))->toArray();

        foreach ($rows as $row) {
            $nip = strtolower($row['nip']);
            $name = strtolower($row['name']);
            $email = strtolower($row['email']);

            if (in_array($nip, $existingNips)) {
                throw new \Exception('NIP ' . $row['nip'] . ' sudah ada di database');
            }
            if (in_array($name, $existingNames)) {
                throw new \Exception('Nama ' . $row['name'] . ' sudah ada di database');
            }
            if (in_array($email, $existingEmails)) {
                throw new \Exception('Email ' . $row['email'] . ' sudah ada di database');
            }
        }

        // Semua data valid, mulai insert
        foreach ($rows as $row) {
            // Insert ke tabel users
            $user = User::firstOrCreate(
                ['email' => $row['email']],
                [
                    'name'     => $row['name'],
                    'nip'      => $row['nip'],
                    'password' => Hash::make($row['password'] ?? 'password123'),
                ]
            );

            // Assign role dosen
            $user->assignRole('dosen');

            // Insert ke tabel t_guru
            Dosen::create([
                'nip'      => $row['nip'],
                'nama'     => $row['name'],
                'aktif'    => $row['aktif'] ?? 'Y',
                'password' => Hash::make($row['password'] ?? 'password123'),
                // Jangan simpan email jika tidak ada kolom email di t_guru
            ]);
        }
    }
}
