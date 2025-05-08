<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisUjian extends Model
{
    protected $connection = 'data_db';
    protected $table = 'jenis_ujians';
    public $timestamps = false;

    protected $fillable = [
        'id_ujian',
        'jenis_ujian',
    ];

    public function bidang()
    {
        return $this->belongsTo(Bidang::class, 'id_ujian', 'kode');
    }
}
