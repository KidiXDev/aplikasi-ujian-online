<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengerjaan extends Model
{
    protected $connection = 'data_db';
    protected $table = 't_pengerjaan';
    protected $primaryKey = 'id_pengerjaan';
    public $timestamps = false;

    protected $fillable = [
        'id_peserta',
        'id_jadwal',
        'id_ujian',
        'id_event',
        'kode_mapel',
        'selesai',
        'waktu_mulai',
        'waktu_selesai',
        'waktu_tambahan',
        'backup_lokasi',
        'backup',
        'kirim',
        'total_soal',
        'total_jawaban',
        'jawaban_benar',
        'jawaban_salah',
        'nilai',
    ];

    protected $casts = [
        'id_peserta' => 'integer',
        'id_jadwal' => 'integer',
        'id_ujian' => 'integer',
        'id_event' => 'integer',
        'kode_mapel' => 'integer',
        'selesai' => 'boolean',
        'waktu_mulai' => 'datetime',
        'waktu_selesai' => 'datetime',
        'waktu_tambahan' => 'datetime',
        'backup_lokasi' => 'string',
        'backup' => 'datetime',
        'kirim' => 'datetime',
        'total_soal' => 'integer',
        'total_jawaban' => 'integer',
        'jawaban_benar' => 'integer',
        'jawaban_salah' => 'integer',
        'nilai' => 'float',
    ];

    public function peserta()
    {
        return $this->belongsTo(Peserta::class, 'id_peserta', 'id');
    }

    public function jawaban()
    {
        return $this->hasMany(PengerjaanJawaban::class, 'id_pengerjaan', 'id_pengerjaan');
    }

    public function ujian()
    {
        return $this->belongsTo(JadwalUjian::class, 'id_ujian', 'id_ujian');
    }
}
