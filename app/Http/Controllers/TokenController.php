<?php

namespace App\Http\Controllers;

use App\Models\Token;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TokenController extends Controller
{
    /**
     * Ambil token yang sedang aktif (dari id_status = 2)
     */
    public function getCurrentToken()
    {
        try {
            $token = Token::getCurrentToken();

            return response()->json([
                'token' => $token ? $token->keterangan_status : 'N/A',
                'waktu' => $token ? $token->waktu : null,
                'status' => $token ? $token->status : 0,
            ]);
        } catch (\Exception $e) {
            \Log::error('getCurrentToken error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Database error: ' . $e->getMessage(),
                'token' => 'ERROR',
                'waktu' => null,
                'status' => 0,
            ]);
        }
    }

    /**
     * Generate token baru - langsung overwrite keterangan_status di database
     */
    public function generateNewToken()
    {
        try {
            // Ambil token lama sebelum diupdate
            $beforeUpdate = Token::where('id_status', 2)->first();
            $oldToken = $beforeUpdate ? $beforeUpdate->keterangan_status : 'TIDAK_ADA';

            if (!$beforeUpdate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Record token dengan id_status = 2 tidak ditemukan di tabel t_status.',
                ], 404);
            }

            // Update token langsung di database
            $updatedToken = Token::updateFirstRowToken();

            if ($updatedToken) {
                return response()->json([
                    'success' => true,
                    'message' => 'Token berhasil diperbarui dari "' . $oldToken . '" menjadi "' . $updatedToken->keterangan_status . '"',
                    'token' => $updatedToken->keterangan_status,
                    'waktu' => $updatedToken->waktu,
                    'old_token' => $oldToken,
                    'id_updated' => $updatedToken->id_status,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal memperbarui token pada record id_status = 2',
                ], 500);
            }
        } catch (\Exception $e) {
            \Log::error('Error saat generate token: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui token: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Copy token ke clipboard (untuk dashboard)
     */
    public function copyToken()
    {
        try {
            $token = Token::getCurrentToken();

            return response()->json([
                'token' => $token ? $token->keterangan_status : null,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'token' => null,
                'error' => $e->getMessage()
            ]);
        }
    }
}
