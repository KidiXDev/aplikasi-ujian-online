<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Matakuliah extends Model
{
    use HasFactory;
    
    // Gunakan koneksi ke database 
    protected $connection = 'data_db';
    
    // Nama tabel di database
    protected $table = 'tblmatkul';
    
    // Kunci utama tabel
    protected $primaryKey = 'id_mk';
    
    // Nonaktifkan timestamps karena tabel tidak memiliki kolom created_at/updated_at
    public $timestamps = false;
    
    // Kolom yang bisa diisi secara massal
    protected $fillable = [
        'kode_mk',
        'nama_mk',
        'sks',
        'semester',
        'prodi',
        'id_dosen',
        'prasyarat'
    ];
    
    /**
     * Relasi dengan User untuk mendapatkan data dosen
     * Menentukan koneksi mysql secara eksplisit untuk model User
     */
    public function dosen(): BelongsTo
    {
        // Gunakan koneksi mysql (default) untuk mengakses model User
        return $this->setConnection('mysql')->belongsTo(User::class, 'id_dosen', 'id')
            ->withDefault([
                'name' => 'Tidak Ada Dosen'
            ]);
    }
}