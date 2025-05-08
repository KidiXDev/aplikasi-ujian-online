<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Soal extends Model
{
    protected $connection = 'data_db';
    protected $table = 'm_soal';
    protected $primaryKey = 'ids';
    public $timestamps = false;
    protected $fillable = [
    ];
    public function match_soal()
    {
        return $this->hasMany(MatchSoal::class, 'soal_id', 'ids');
    }
}
 