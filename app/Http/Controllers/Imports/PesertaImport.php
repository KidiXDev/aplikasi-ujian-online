<?php

namespace App\Http\Controllers\Imports;

use App\Models\Peserta;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
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

            DB::transaction(function () use ($row) {
                // Simpan/update ke t_peserta
                $peserta = Peserta::updateOrCreate(
                    ['nis' => $row['nis']],
                    [
                        'username' => $row['username'],
                        'password' => Hash::make($row['password'] ?? 'password123'),
                        'status'   => $row['status'] ?? 1,
                        'jurusan'  => $row['jurusan'] ?? null,
                        'nama'     => $row['nama'],
                    ]
                );

                // Sinkron ke tblkelas
                DB::connection('data_db')->table('tblkelas')->updateOrInsert(
                    ['Kelas' => $row['nis']],
                    [
                        'tahun'  => date('Y'),
                        'Active' => ($row['status'] ?? 1) == 1 ? 'Y' : 'N',
                    ]
                );

                $kelasID = DB::connection('data_db')
                    ->table('tblkelas')
                    ->where('Kelas', $row['nis']) 
                    ->value('ID') ?? 0; // fallback ke 0 kalau tidak ketemu

                // Sinkron ke tblsiswa
                DB::connection('data_db')->table('tblsiswa')->updateOrInsert(
                    ['nis' => $row['nis']],
                    [
                        'nama'    => $row['nama'],
                        'IDKelas' => $kelasID,
                        'status'  => $row['status'] == 1 ? 'Y' : 'N',
                    ]
                );

                
            });
        }

        Log::debug('Import process completed successfully');
    }
}
