<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'peserta_login' => $this->getPesertaLogin(),
            'peserta_soal_ujian' => $this->getPesertaSoalUjian(),
            'ujian_berlangsung' => $this->getUjianBerlangsung(),
            'ujian_selesai' => $this->getUjianSelesai(),
        ];

        $examHistory = $this->getExamHistory();

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
            'examHistory' => $examHistory,
        ]);
    }

    private function getPesertaLogin()
    {
        // Logic untuk menghitung peserta yang login
        return 150;
    }

    private function getPesertaSoalUjian()
    {
        // Logic untuk menghitung peserta yang mengerjakan soal
        return 120;
    }

    private function getUjianBerlangsung()
    {
        // Logic untuk menghitung ujian yang sedang berlangsung
        return 5;
    }

    private function getUjianSelesai()
    {
        // Logic untuk menghitung ujian yang sudah selesai
        return 25;
    }

    private function getExamHistory()
    {
        // Logic untuk mengambil riwayat ujian
        // Bisa menggunakan model Ujian
        return collect([
            [
                'ujian' => 'Matematika Dasar',
                'kelas' => 'X-1',
                'kode' => 'MTK001',
                'peserta' => 30,
                'selesai' => 28,
                'jadwal' => '2024-01-15 08:00',
                'status' => 'Selesai'
            ],
            // ... data lainnya
        ]);
    }
}