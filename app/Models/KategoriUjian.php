<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriUjian extends Model
{
    protected $connection = 'data_db';
    protected $table = 't_kat_soal';
    protected $fillable = [
        'id',
        'kategori',
    ];
    public function ujian()
    {
        return $this->hasMany(NamaUjian::class, 'id_kategori', 'id');
    }
    public $timestamps = false;
}
