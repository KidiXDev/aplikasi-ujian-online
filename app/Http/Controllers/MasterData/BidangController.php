<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bidang;

class BidangController extends Controller
{
    /**
     * Menampilkan semua data bidang dalam format JSON (untuk dropdown).
     */
    public function index()
    {
        return response()->json(Bidang::select('kode', 'nama')->get());
    }
}
