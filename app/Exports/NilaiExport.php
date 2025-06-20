<?php

namespace App\Exports;

use App\Models\Pengerjaan;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class NilaiExport implements FromCollection, WithHeadings, WithMapping
{
    protected $jadwalId;
    protected $rowNumber = 1; // untuk nomor urut otomatis

    public function __construct($jadwalId)
    {
        $this->jadwalId = $jadwalId;
    }

    public function collection()
    {
        return Pengerjaan::with(['peserta'])
            ->where('id_jadwal', $this->jadwalId)
            ->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama',
            'Jumlah Soal',
            'Soal Benar',
            'Soal Salah',
            'Nilai'
        ];
    }

    public function map($item): array
    {
        $total_soal = (int)($item->total_soal ?? 0);
        $soal_benar = (int)($item->jawaban_benar ?? 0);
        $soal_salah = $total_soal - $soal_benar;
        $nilai = (int) round($item->nilai ?? 0);

        return [
            (string) $this->rowNumber++, // No: auto increment
            $item->peserta ? $item->peserta->nama : 'Peserta tidak ditemukan',
            (string) $total_soal,
            (string) $soal_benar,
            (string) $soal_salah,
            (string) $nilai
        ];
    }
}
