<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $connection = 'data_db'; // Menentukan koneksi database yang digunakan
    protected $table = 't_event'; // jika nama tabel bukan jamak dari nama model
    protected $primaryKey = 'id_event'; // jika primary key bukan "id"
    public $timestamps = false; // karena tidak ada kolom created_at & updated_at

    protected $fillable = [
        'nama_event',
        'mulai_event',
        'akhir_event',
        'create_event',
        'status',
    ];

    // Casting tipe data (opsional)
    protected $casts = [
        'mulai_event' => 'datetime',
        'akhir_event' => 'datetime',
        'create_event' => 'datetime',
        'status' => 'integer',
    ];

    /**
     * Get the penjadwalan items associated with this event.
     */
    public function penjadwalans()
    {
        return $this->hasMany(Penjadwalan::class, 'id_paket_ujian', 'id_event');
    }
}
