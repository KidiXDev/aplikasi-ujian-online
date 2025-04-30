<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MBidang;

class JenisUjianController extends Controller
{
    public function index(Request $request)
    {
        $pages = $request->query('pages', 10);
        $search = $request->query('search', null);

        $query = MBidang::query()->orderBy('nama', 'asc');

        if ($search) {
            $query->where('nama', 'like', '%' . $search . '%');
        }

        return Inertia::render('user-management/jenis-ujian', [
            'data' => $query->paginate((int) $pages)->withQueryString(),
            'filters' => [
                'search' => $search,
                'pages' => $pages,
            ],
        ]);
    }

    public function delete(MBidang $user)
    {
        $user->delete();

        return redirect()->back()->with('success', 'Data berhasil dihapus');
    }

    public function update(Request $request, MBidang $user)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'type' => 'required|string|max:100',
        ]);

        $user->update($data);

        return redirect()->back()->with('success', 'Data berhasil diperbarui');
    }
}
