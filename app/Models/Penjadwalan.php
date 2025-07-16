<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penjadwalan extends Model
{
    use HasFactory;

    // Use the same connection as ExamSchedule
    protected $connection = 'data_db';

    // Reference the same table as ExamSchedule
    protected $table = 't_penjadwalan';

    // Use the same primary key
    protected $primaryKey = 'id_penjadwalan';

    // Disable timestamps since the original table doesn't use them
    public $timestamps = false;

    protected $fillable = [
        'id_paket_ujian',
        'tipe_ujian',
        'tanggal',
        'waktu_mulai',
        'waktu_selesai',
        'kuota',
        'status',
        'jenis_ujian',
        'kode_jadwal',  // Tambahkan ini
    ];

    protected $casts = [
        'tanggal' => 'date',
        'kuota' => 'integer',
        'status' => 'integer',
        'jenis_ujian' => 'integer',
        'tipe_ujian' => 'integer',  // Tambahkan casting untuk tipe_ujian
    ];

    // Relasi ke KategoriSoal melalui tipe_ujian
    public function jenis_ujian()
    {
        return $this->belongsTo(KategoriSoal::class, 'tipe_ujian', 'id');
    }

    /**
     * Get the event that owns this penjadwalan item.
     */
    public function event()
    {
        return $this->belongsTo(Event::class, 'id_paket_ujian', 'id_event');
    }

    /**
     * Get jadwal ujian yang terkait dengan penjadwalan ini
     */
    public function jadwalUjian()
    {
        return $this->hasMany(JadwalUjian::class, 'id_penjadwalan', 'id_penjadwalan');
    }

    // Accessor to map the field names to match what the UI expects
    public function getTipeUjianAttribute()
    {
        // If jenis_ujian is an integer (likely jenis_ujian field being used instead of relation)
        if (isset($this->attributes['tipe_ujian']) && is_int($this->attributes['tipe_ujian'])) {
            $kategoriSoal = KategoriSoal::find($this->attributes['tipe_ujian']);
            return $kategoriSoal ? $kategoriSoal->kategori : (string)$this->attributes['tipe_ujian'];
        }

        // Load the related KategoriSoal model and get its kategori
        if ($this->relationLoaded('jenis_ujian') && $this->jenis_ujian) {
            return $this->jenis_ujian->kategori;
        }

        // If relation is not loaded, try to load it
        if (isset($this->attributes['tipe_ujian'])) {
            $kategoriSoal = KategoriSoal::where('id', $this->attributes['tipe_ujian'])->first();
            return $kategoriSoal ? $kategoriSoal->kategori : (string)$this->attributes['tipe_ujian'];
        }

        return '';
    }

    public function getPaketUjianAttribute()
    {
        // Return the nama_event from the related Event model
        return $this->event ? $this->event->nama_event : ($this->attributes['id_paket_ujian'] ?? '');
    }

    public function getKelasProdiAttribute()
    {
        // Return something for kelas_prodi field - could be populated from elsewhere
        // This is a placeholder - you would need to modify based on your actual data structure
        return $this->attributes['jenis_ujian'] ?? '';
    }

    public function getTanggalUjianAttribute()
    {
        return $this->tanggal;
    }

    public function getMulaiAttribute()
    {
        return $this->attributes['waktu_mulai'] ?? '';
    }

    public function getSelesaiAttribute()
    {
        return $this->attributes['waktu_selesai'] ?? '';
    }

    public function getTipeAttribute()
    {
        // Map status to Remidi or Regular based on your business logic
        // This is a placeholder - adjust according to your needs
        return ($this->attributes['status'] ?? 0) == 1 ? 'Regular' : 'Remidi';
    }

    // Relasi ke MBidang berdasarkan tipe_ujian (kode)
    public function mbidangRelation()
    {
        return $this->hasOne(Mbidang::class, 'kode', 'tipe_ujian');
    }
}
