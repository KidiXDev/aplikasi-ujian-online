<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaketSoal extends Model
{
    protected $connection = 'data_db';
    protected $table = 'paket_soals';
    public $timestamps = false;

    protected $primaryKey = 'id';
    protected $fillable = [
        'kode_bidang',
        'nama_paket',
    ];

    public function bidang()
    {
        return $this->belongsTo(Bidang::class, 'kode_bidang', 'kode');
    }

    public function match_soal()
    {
        return $this->hasMany(MatchSoal::class, 'paket_id', 'id');
    }
}
