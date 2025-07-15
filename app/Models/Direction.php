<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Direction extends Model
{
    protected $connection = 'data_db';
    protected $table = 't_direction';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'kd_mapel',
        'kategori_soal',
        'paket',
        'header',
        'body',
        'footer',
        'suara',
        'waktu_add',
        'waktu_update',
        'user_add',
        'user_update',
        'tipe_soal',
        'jenis_soal',
    ];

    protected $casts = [
        'id' => 'integer',
        'waktu_add' => 'datetime',
        'waktu_update' => 'datetime',
    ];

    // Relasi ke kategori soal
    public function kategoriSoal()
    {
        return $this->belongsTo(KategoriSoal::class, 'kategori_soal', 'kategori');
    }

    // Relasi ke bidang (kd_mapel)
    public function bidang()
    {
        return $this->belongsTo(Bidang::class, 'kd_mapel', 'kode');
    }
}
