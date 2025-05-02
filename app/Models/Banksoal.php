<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banksoal extends Model
{
    protected $connection = 'data_db';
    protected $table = 'm_soal';

    public $timestamps = false;
}
