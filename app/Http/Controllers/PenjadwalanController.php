<?php

namespace App\Http\Controllers;

use App\Models\Penjadwalan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenjadwalanController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Penjadwalan::query();

        if ($search) {
            $query->where('kode_jadwal', 'like', "%{$search}%")
                ->orWhere('tipe_ujian', 'like', "%{$search}%");
        }

        $data = $query->orderBy('tanggal', 'desc')
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('penjadwalan/penjadwalan-manager', [
            'data' => $data,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('penjadwalan/form.penjadwalan-manager');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_paket_ujian' => 'required|integer',
            'tipe_ujian' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required',
            'waktu_selesai' => 'required',
            'kuota' => 'required|integer',
            'jenis_ujian' => 'required|integer',
            // 'kode_jadwal' => 'required|string|max:255', // not in Penjadwalan
        ]);

        Penjadwalan::create($validated);

        return redirect()->route('penjadwalan.index')->with('success', 'Jadwal ujian berhasil ditambahkan.');
    }

    public function edit(Penjadwalan $penjadwalan)
    {
        return Inertia::render('penjadwalan/form.penjadwalan-manager', [
            'penjadwalan' => $penjadwalan
        ]);
    }

    public function update(Request $request, Penjadwalan $penjadwalan)
    {
        $validated = $request->validate([
            'id_paket_ujian' => 'required|integer',
            'tipe_ujian' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required',
            'waktu_selesai' => 'required',
            'kuota' => 'required|integer',
            'jenis_ujian' => 'required|integer',
            // 'kode_jadwal' => 'required|string|max:255', // not in Penjadwalan
        ]);

        $penjadwalan->update($validated);

        return redirect()->route('penjadwalan.index')->with('success', 'Jadwal ujian berhasil diperbarui.');
    }

    public function destroy(Penjadwalan $penjadwalan)
    {
        $penjadwalan->delete();

        return redirect()->back()->with('success', 'Jadwal ujian berhasil dihapus.');
    }
}
