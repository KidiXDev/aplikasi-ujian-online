<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MBidang extends Model
{
    protected $connection = 'data_db';
    protected $table = 'm_bidang';
    protected $primaryKey = 'kode';
    public $timestamps = false;

    protected $fillable = [
        'kode',
        'nama',
        'type',
    ];
}
