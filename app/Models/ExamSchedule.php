<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamSchedule extends Model
{
     protected $connection = 'data_db';
     // Nama tabel (kalau tidak mengikuti konvensi Laravel)
     protected $table = 't_penjadwalan';

     // Primary key
     protected $primaryKey = 'id_penjadwalan';
 
     // Jika tidak pakai timestamps (created_at dan updated_at)
     public $timestamps = false;
 
     // Kolom yang bisa diisi mass-assignment
     protected $fillable = [
         'id_paket_ujian',
         'tipe_ujian',
         'tanggal',
         'waktu_mulai',
         'waktu_selesai',
         'kuota',
         'status',
         'jenis_ujian',
         'urutan',
         'urutan_1',
         'kode_jadwal',
         'pelatihan_mulai',
         'pelatihan_selesai',
         'tanggal_pelatihan',
         'online_offline',
         'flag',
         'online_offline_pelatihan',
     ];
 
     // (Opsional) Cast agar tipe data otomatis dikonversi sesuai
     protected $casts = [
         'tanggal' => 'date',
         'tanggal_pelatihan' => 'date',
         'kuota' => 'integer',
         'status' => 'integer',
         'jenis_ujian' => 'integer',
         'urutan' => 'integer',
         'urutan_1' => 'integer',
         'flag' => 'integer',
         'online_offline' => 'integer',
         'online_offline_pelatihan' => 'integer',
     ];
}
