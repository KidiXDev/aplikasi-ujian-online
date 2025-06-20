<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengerjaanJawaban extends Model
{
    protected $connection = 'data_db';
    protected $table = 't_pengerjaan_jawaban';
    public $timestamps = false;

    protected $fillable = [
        'id_pengerjaan',
        'kd_bidang',
        'no_soal',
        'jawaban',
        'raguragu',
        'id_soal',
        'pg_1',
        'pg_2',
        'pg_3',
        'pg_4',
        'pg_5',
    ];

    protected $casts = [
        'id_pengerjaan' => 'integer',
        'kd_bidang' => 'integer',
        'no_soal' => 'integer',
        'jawaban' => 'integer',
        'raguragu' => 'integer',
        'id_soal' => 'integer',
        'pg_1' => 'integer',
        'pg_2' => 'integer',
        'pg_3' => 'integer',
        'pg_4' => 'integer',
        'pg_5' => 'integer',
    ];

    public function pengerjaan()
    {
        return $this->belongsTo(Pengerjaan::class, 'id_pengerjaan', 'id_pengerjaan');
    }
}
