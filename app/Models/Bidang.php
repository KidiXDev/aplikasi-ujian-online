<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bidang extends Model
{
    protected $connection = 'data_db';
    protected $table = 'm_bidang';
    public $timestamps = false;
}