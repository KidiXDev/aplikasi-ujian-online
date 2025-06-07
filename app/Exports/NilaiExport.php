<?php

namespace App\Exports;

use App\Models\Pengerjaan;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class NilaiExport implements FromCollection, WithHeadings, WithMapping
{
    protected $jadwalId;

    public function __construct($jadwalId)
    {
        $this->jadwalId = $jadwalId;
    }

    public function collection()
    {
        return Pengerjaan::with(['peserta', 'jawaban'])
            ->where('id_jadwal', $this->jadwalId)
            ->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Name',
            'Listening',
            'Structure',
            'Reading',
            'Correct',
            'Score'
        ];
    }

    public function map($item): array
    {
        $jawaban = $item->jawaban;
        $sections = $jawaban->groupBy('kd_bidang');
        
        $scores = [
            'listening' => 0,
            'structure' => 0,
            'reading' => 0
        ];
        
        foreach ($sections as $kd_bidang => $answers) {
            $correctAnswers = $answers->where('jawaban', 1)->count();
            $totalQuestions = $answers->count();
            $sectionScore = ($totalQuestions > 0) ? ($correctAnswers / $totalQuestions) * 100 : 0;
            
            switch ($kd_bidang) {
                case 1:
                    $scores['listening'] = round($sectionScore);
                    break;
                case 2:
                    $scores['structure'] = round($sectionScore);
                    break;
                case 3:
                    $scores['reading'] = round($sectionScore);
                    break;
            }
        }

        return [
            $item->id,
            $item->peserta ? $item->peserta->nama : 'Peserta tidak ditemukan',
            $scores['listening'],
            $scores['structure'],
            $scores['reading'],
            $item->jawaban_benar . "/" . $item->total_soal,
            round($item->nilai ?? 0)
        ];
    }
}
