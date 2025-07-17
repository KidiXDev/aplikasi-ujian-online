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
    protected $namaUjian;
    protected $paketUjian;
    protected $search;

    public function __construct($jadwalId, $search = null)
    {
        $this->jadwalId = $jadwalId;
        $this->search = $search;

        // Ambil tipe ujian dan paket ujian sesuai transformasi controller
        $jadwalUjian = JadwalUjian::where('id_ujian', $jadwalId)->first();
        $this->tipeUjian = '-';
        $this->paketUjian = '-';
        $this->namaUjian = '-';
        if ($jadwalUjian) {
            $this->namaUjian = $jadwalUjian->nama_ujian ?? '-';
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
        // Ambil peserta yang terdaftar pada jadwal ujian ini (hanya peserta yang seharusnya ikut ujian)
        $jadwalUjian = JadwalUjian::where('id_ujian', $this->jadwalId)->first();
        $pesertaIds = [];
        if ($jadwalUjian && $jadwalUjian->kode_kelas) {
            $pesertaIds = array_filter(array_map('trim', explode(',', $jadwalUjian->kode_kelas)));
        }

        // Ambil semua peserta yang terdaftar pada kode_kelas, lalu tampilkan meskipun belum ada pengerjaan
        $pesertaCollection = collect();
        if (!empty($pesertaIds)) {
            $pesertaQuery = \App\Models\Peserta::whereIn('id', $pesertaIds);
            if ($this->search) {
                $pesertaQuery->where('nama', 'like', "%{$this->search}%");
            }
            $pesertaCollection = $pesertaQuery->get();
        }

        // Ambil data pengerjaan yang sudah ada
        $pengerjaan = Pengerjaan::with(['peserta'])
            ->where('id_ujian', $this->jadwalId);
        if (!empty($pesertaIds)) {
            $pengerjaan->whereIn('id_peserta', $pesertaIds);
        }
        if ($this->search) {
            $pengerjaan->whereHas('peserta', function($q) {
                $q->where('nama', 'like', "%{$this->search}%");
            });
        }
        $pengerjaanCollection = $pengerjaan->get()->keyBy('id_peserta');

        // Gabungkan: peserta yang tidak punya pengerjaan tetap muncul dengan nilai kosong
        $result = collect();
        foreach ($pesertaCollection as $peserta) {
            $item = $pengerjaanCollection->get($peserta->id);
            if ($item) {
                $result->push($item);
            } else {
                // Buat dummy object agar tetap bisa di-map
                $dummy = new \stdClass();
                $dummy->peserta = $peserta;
                $dummy->total_soal = null;
                $dummy->jawaban_benar = null;
                $dummy->nilai = null;
                $result->push($dummy);
            }
        }
        return $result;
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama',
            'Paket Ujian',
            'Tipe Ujian',
            'Nama Ujian',
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
            $this->paketUjian,
            $this->tipeUjian,
            $this->namaUjian,
            // (string) $total_soal, // dihapus
            (string) $soal_benar,
            (string) $soal_salah,
            (string) $nilai
        ];
    }
}
