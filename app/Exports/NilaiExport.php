<?php

namespace App\Exports;

use App\Models\Pengerjaan;
use App\Models\JadwalUjian;
use App\Models\Penjadwalan;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class NilaiExport implements FromCollection, WithHeadings, WithMapping
{
    protected $jadwalId;
    protected $rowNumber = 1; // untuk nomor urut otomatis
    protected $tipeUjian;
    protected $paketUjian;

    public function __construct($jadwalId)
    {
        $this->jadwalId = $jadwalId;

        // Ambil tipe ujian dan paket ujian sesuai transformasi controller
        $jadwalUjian = JadwalUjian::where('id_ujian', $jadwalId)->first();
        $this->tipeUjian = '-';
        $this->paketUjian = '-';
        if ($jadwalUjian) {
            $penjadwalan = Penjadwalan::with(['event', 'jenis_ujian'])->find($jadwalUjian->id_penjadwalan);
            // Tipe ujian: jika ada relasi jenis_ujian, ambil nama, jika tidak fallback ke tipe_ujian
            $this->tipeUjian = (is_object($penjadwalan) && is_object($penjadwalan->jenis_ujian) && isset($penjadwalan->jenis_ujian->nama))
                ? $penjadwalan->jenis_ujian->nama
                : ($penjadwalan->tipe_ujian ?? '-');
            // Paket ujian: jika ada relasi event, ambil nama_event, jika tidak fallback ke paket_ujian
            $this->paketUjian = (is_object($penjadwalan) && is_object($penjadwalan->event) && isset($penjadwalan->event->nama_event))
                ? $penjadwalan->event->nama_event
                : ($penjadwalan->paket_ujian ?? '-');
        }
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
            'Tipe Ujian',
            'Paket Ujian',
            // 'Jumlah Soal', // dihapus
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
            $this->tipeUjian,
            $this->paketUjian,
            // (string) $total_soal, // dihapus
            (string) $soal_benar,
            (string) $soal_salah,
            (string) $nilai
        ];
    }
}
