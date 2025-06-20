<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalUjianSoal extends Model
{
    protected $connection = 'data_db';
    protected $table = 't_jadwal_ujian_soal';
    public $timestamps = false;

    protected $fillable = [
        'id_ujian',
        'kd_bidang',
        'total_soal',
        'ujian_soal',
        'id_penjadwalan',
        'direction',
        'total_direction',
    ];

    protected $casts = [
        'id_ujian' => 'integer',
        'kd_bidang' => 'integer',
        'total_soal' => 'integer',
        'ujian_soal' => 'integer',
        'id_penjadwalan' => 'integer',
        'direction' => 'integer',
        'total_direction' => 'integer',
    ];

    public function jenis_ujian()
    {
        return $this->belongsTo(JadwalUjian::class, 'id_ujian', 'id_ujian');
    }
}
