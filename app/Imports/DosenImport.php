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

        foreach ($rows as $row) {
            $nip = strtolower($row['nip']);
            $name = strtolower($row['name']);

            if (in_array($nip, $existingNips)) {
                throw new \Exception('NIP ' . $row['nip'] . ' sudah ada di database');
            }
            if (in_array($name, $existingNames)) {
                throw new \Exception('Nama ' . $row['name'] . ' sudah ada di database');
            }
        }

        // Semua data valid, mulai insert ke t_guru saja
        foreach ($rows as $row) {
            Dosen::create([
                'nip'      => $row['nip'],
                'nama'     => $row['name'],
                'aktif'    => $row['aktif'] ?? 1, // default aktif 1 (integer)
                'password' => \Illuminate\Support\Facades\Hash::make($row['password'] ?? 'password123'),
                // Tambahkan kolom lain jika ada di t_guru
            ]);
        }
    }
}
