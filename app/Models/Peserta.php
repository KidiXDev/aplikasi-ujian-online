<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Peserta extends Model
{
    protected $connection = 'data_db';
    // Nama tabel (kalau tidak mengikuti konvensi Laravel)
    protected $table = 't_peserta';

    // Primary key
    protected $primaryKey = 'id';

    // Jika tidak pakai timestamps (created_at dan updated_at)
    public $timestamps = false;

    // Kolom yang bisa diisi mass-assignment
    protected $fillable = [
        'username',
        'password',
        'status', // yang dipake itu status ya bukan aktif
        'jurusan',
        'kategori', // tambahkan ini
        'nis',
        'nama',
        'filter', // tambahkan ini
    ];

    // (Opsional) Cast agar tipe data otomatis dikonversi sesuai
    protected $casts = [
        'id' => 'integer',
        'status' => 'integer',
        'jurusan' => 'integer',
        'kategori' => 'integer', // tambahkan ini
        'filter' => 'string', // tambahkan ini
    ];

    // public function jurusanRef()
    // {
    //     return $this->belongsTo(Jurusan::class, 'jurusan', 'id_jurusan');
    // }

    public function jurusanRef()
    {
        return $this->belongsTo(Jurusan::class, 'jurusan', 'id_jurusan');
    }

    public function kategoriRef()
    {
        return $this->belongsTo(KategoriSoal::class, 'jurusan', 'id');
    }

    public function pengerjaan()
    {
        return $this->hasMany(Pengerjaan::class, 'id_peserta', 'id');
    }
}
