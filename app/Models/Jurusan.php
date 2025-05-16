<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jurusan extends Model
{
    protected $connection = 'data_db';
    protected $table = 't_jurusan';
    protected $primaryKey = 'id_jurusan'; // pakai nama primary key yang benar
    public $timestamps = false;

    // Jika ingin mass assignment
    // protected $fillable = ['id_jurusan', 'nama_jurusan'];
}