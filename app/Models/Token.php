<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class Token extends Model
{
    protected $connection = 'data_db';
    protected $table = 't_status';
    protected $primaryKey = 'id_status';
    public $timestamps = false;

    protected $fillable = [
        'keterangan_status',
        'status',
        'waktu',
        'apa_ini',
    ];

    protected $casts = [
        'waktu' => 'datetime',
        'status' => 'integer',
    ];

    /**
     * Generate token acak dengan kombinasi huruf kapital dan angka
     */
    public static function generateRandomToken($length = 6)
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $token = '';

        for ($i = 0; $i < $length; $i++) {
            $token .= $characters[rand(0, strlen($characters) - 1)];
        }

        return $token;
    }

    /**
     * Update token langsung di database pada record id_status = 2
     */
    public static function updateFirstRowToken()
    {
        try {
            // Generate token baru
            $newToken = self::generateRandomToken(6);

            // Update langsung menggunakan DB query builder dengan koneksi yang benar
            $affected = DB::connection('data_db')->table('t_status')
                ->where('id_status', 2)
                ->update([
                    'keterangan_status' => $newToken,
                    'waktu' => now(),
                    'status' => 1
                ]);

            if ($affected > 0) {
                // Ambil record yang sudah diupdate
                $updatedRecord = self::where('id_status', 2)->first();
                return $updatedRecord;
            }

            return null;
        } catch (\Exception $e) {
            \Log::error('Error dalam updateFirstRowToken: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get current active token
     */
    public static function getCurrentToken()
    {
        return self::where('id_status', 2)->first();
    }
}
