<?php

namespace App\Http\Controllers\Imports;

use App\Models\Peserta;
use App\Models\KategoriSoal;
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
        Log::info('Mulai import peserta', ['total' => $rows->count()]);
        
        // Validasi format file - cek header yang diperlukan
        if ($rows->isEmpty()) {
            throw new \Exception('File Excel kosong atau tidak memiliki data');
        }

        $firstRow = $rows->first();
        $requiredHeaders = ['nis', 'nama'];
        
        // Ambil keys dari row pertama (header yang sebenarnya)
        $actualHeaders = array_keys($firstRow->toArray());
        
        Log::info('Headers yang ditemukan:', ['headers' => $actualHeaders]);
        
        // Validasi apakah header yang diperlukan ada
        foreach ($requiredHeaders as $header) {
            if (!in_array($header, $actualHeaders)) {
                throw new \Exception("Format file tidak sesuai. Kolom '{$header}' tidak ditemukan. Headers yang tersedia: " . implode(', ', $actualHeaders) . ". Silakan gunakan template yang disediakan.");
            }
        }
        
        $successCount = 0;
        $errorCount = 0;

        foreach ($rows as $index => $row) {
            // Skip row kosong
            if ($row->filter()->isEmpty()) continue;

            try {
                DB::transaction(function () use ($row) {
                    // Validasi data wajib - pastikan kolom nis dan nama ada dan tidak kosong
                    if (!isset($row['nis']) || !isset($row['nama']) || empty($row['nis']) || empty($row['nama'])) {
                        throw new \Exception('NIS atau Nama kosong atau tidak ditemukan');
                    }

                    // Validasi jurusan
                    if (!empty($row['jurusan']) && !KategoriSoal::where('id', $row['jurusan'])->exists()) {
                        throw new \Exception("Jurusan tidak valid: {$row['jurusan']}");
                    }

                    // Simpan atau update peserta
                    $peserta = Peserta::updateOrCreate(
                        ['nis' => $row['nis']],
                        [
                            'username' => $row['username'] ?? $row['nis'],
                            'password' => Hash::make($row['password'] ?? 'password123'),
                            'status'   => $row['status'] ?? 1,
                            'jurusan'  => $row['jurusan'] ?? null,
                            'nama'     => $row['nama'],
                            'filter'   => $row['filter'] ?? '',
                        ]
                    );

                    // Sinkronisasi ke tblkelas
                    DB::connection('data_db')->table('tblkelas')->updateOrInsert(
                        ['Kelas' => $row['nis']],
                        [
                            'tahun' => date('Y'),
                            'Active' => ($row['status'] ?? 1) == 1 ? 'Y' : 'N',
                        ]
                    );

                    // Ambil ID kelas
                    $kelasID = DB::connection('data_db')->table('tblkelas')
                        ->where('Kelas', $row['nis'])
                        ->value('ID');

                    // Sinkronisasi ke tblsiswa
                    DB::connection('data_db')->table('tblsiswa')->updateOrInsert(
                        ['nis' => $row['nis']],
                        [
                            'nama' => $row['nama'],
                            'IDKelas' => $kelasID,
                            'status' => ($row['status'] ?? 1) == 1 ? 'Y' : 'N',
                        ]
                    );
                });

                $successCount++;
            } catch (\Exception $e) {
                $errorCount++;
                Log::warning("Gagal impor row " . ($index + 2), [
                    'nis' => $row['nis'] ?? 'N/A',
                    'nama' => $row['nama'] ?? 'N/A',
                    'pesan' => $e->getMessage()
                ]);
                
                // Jika error karena kolom tidak ditemukan, langsung throw exception
                if (strpos($e->getMessage(), 'tidak ditemukan') !== false) {
                    throw $e;
                }
                
                continue;
            }
        }

        Log::info('Selesai import', [
            'sukses' => $successCount,
            'gagal' => $errorCount,
            'total_di_db' => Peserta::count()
        ]);
        
        // Jika semua data gagal diimport, throw exception
        if ($successCount == 0 && $errorCount > 0) {
            throw new \Exception('Semua data gagal diimport. Periksa format file Excel dan data yang dimasukkan.');
        }
    }
}
