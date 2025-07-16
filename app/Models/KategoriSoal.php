<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriSoal extends Model
{
    protected $connection = 'data_db';
    protected $table = 't_kat_soal';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'kategori',
    ];

    protected $casts = [
        'id' => 'integer',
    ];
}
