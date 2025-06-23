<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MatchSoal;
use App\Models\Bidang;
use App\Models\PaketSoal;
use Illuminate\Support\Facades\Log;

class PaketSoalController extends Controller
{
    public function index(Request $request)
    {
        $pages = $request->query('pages', 10);
        $search = $request->query('search', null);

        $usersQuery = PaketSoal::withCount('match_soal');

        if ($search) {
            $usersQuery->where('nama_paket', 'like', '%' . $search . '%');
        }

        return Inertia::render(
            'master-data/paket-soal/paket-soal',
            [
                'data' => $usersQuery->paginate((int)$pages)->withQueryString(),
                'filters' => [
                    'search' => $search,
                    'pages' => $pages,
                ],
            ]
        );
    }

    /**
     * DELETE paket soal (via API / AJAX / Inertia)
     */
    public function delete($id)
    {
        try {
            Log::info('Delete route called with ID:', ['id' => $id]);

            $paket_soal = PaketSoal::findOrFail($id);

            // Hapus relasi match soal dulu
            MatchSoal::where('paket_id', $paket_soal->id)->delete();

            // Hapus paket soal-nya
            $paket_soal->delete();

            Log::info('PaketSoal deleted successfully:', ['id' => $id]);

            return response()->json(['message' => 'Paket soal berhasil dihapus.']);
        } catch (\Exception $e) {
            Log::error('Error deleting PaketSoal:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menghapus paket soal.'], 500);
        }
    }

    public function update(Request $request, PaketSoal $paket_soal)
    {
        $paket_soal->update($request->all());

        return redirect()->back()->with('success', 'Paket soal berhasil diperbarui');
    }
}
