<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NamaUjian extends Model
{
    protected $connection = 'data_db';
    protected $table = 't_jadwal_ujian';
    protected $primaryKey = 'id_ujian';
    protected $fillable = [
        'nama_ujian'
    ];
    public function kategori()
    {
        return $this->belongsTo(KategoriUjian::class, 'id_kategori', 'id');
    }
    public $timestamps = false;
}
