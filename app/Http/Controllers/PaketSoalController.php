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

    public function destroy(PaketSoal $paketSoal)
    {
        try {
            Log::info('Delete route called with ID:', ['id' => $paketSoal->id]);

            // Hapus data terkait di tabel match_soals
            \App\Models\MatchSoal::where('paket_id', $paketSoal->id)->delete();

            // Hapus data di tabel paket_soals
            $paketSoal->delete();

            Log::info('PaketSoal deleted successfully:', ['id' => $paketSoal->id]);

            return redirect()->back()->with('success', 'Paket deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting PaketSoal:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to delete Paket');
        }
    }

    public function update(Request $request, PaketSoal $paket_soal)
    {
        $paket_soal->update($request->all());

        return redirect()->back()->with('success', 'User updated successfully');
    }
}
