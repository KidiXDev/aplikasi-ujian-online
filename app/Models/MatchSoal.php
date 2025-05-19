<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatchSoal extends Model
{
    protected $connection = 'data_db';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'soal_id',
        'paket_id',
    ];

    public function soal()
    {
        return $this->belongsTo(soal::class, 'soal_id', 'ids');
    }

    public function paket_soal()
    {
        return $this->belongsTo(PaketSoal::class, 'paket_id', 'id');
    }
}
