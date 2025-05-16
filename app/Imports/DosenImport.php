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
        foreach ($rows as $row) {
            if (Dosen::where('nip', $row['nip'])->exists()) {
                throw new \Exception('NIP ' . $row['nip'] . ' sudah ada di database');
            }
            if (Dosen::where('nama', $row['name'])->exists()) {
                throw new \Exception('Nama ' . $row['name'] . ' sudah ada di database');
            }
            if (Dosen::where('email', $row['email'])->exists()) {
                throw new \Exception('Email ' . $row['email'] . ' sudah ada di database');
            }
        }

        // Jika semua baris lolos, baru lakukan insert
        foreach ($rows as $row) {
            $user = User::firstOrCreate(
                ['email' => $row['email']],
                [
                    'name'     => $row['name'],
                    'nip'      => $row['nip'],
                    'password' => Hash::make($row['password'] ?? 'password123'),
                ]
            );
            $user->assignRole('dosen');

            Dosen::create([
                'nip'      => $row['nip'],
                'nama'     => $row['name'],
                'email'    => $row['email'],
                'aktif'    => $row['aktif'] ?? 'Y',
                'password' => Hash::make($row['password'] ?? 'password123'),
            ]);
        }
    }
}
