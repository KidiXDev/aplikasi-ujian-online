<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MBidang;

class JenisUjianEditController extends Controller
{
    public function create()
    {
        return Inertia::render('user-management/form.user-jenis-ujian', [
            'user' => null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([

            'nama' => 'required|string|max:255',
            'type' => 'required|string|max:100',
        ]);

        // Generate kode otomatis
        $last = MBidang::orderBy('kode', 'desc')->first();
        $newKode = $last ? ((int)$last->kode + 1) : 10001;

        MBidang::create([
            'kode' => $newKode,
            'type' => $data['type'],
            'nama' => $data['type'] . ' - ' . $data['nama'], // Gabungan
        ]);

        return redirect()->route('master-data.jenis-ujian.manager')->with('success', 'Data berhasil ditambahkan');
    }

    public function edit($kode)
    {
        $user = MBidang::findOrFail($kode);

        // Hapus prefix "type - " dari nama
        $namaWithoutPrefix = preg_replace('/^' . preg_quote($user->type . ' - ', '/') . '/', '', $user->nama);

        return Inertia::render('user-management/form.user-jenis-ujian', [
            'user' => [
                'kode' => $user->kode,
                'nama' => $namaWithoutPrefix, // hanya nama jenis ujiannya
                'type' => $user->type,
            ],
        ]);
    }

    public function update(Request $request, $kode)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'type' => 'required|string|max:100', 
        ]);

        $user = MBidang::findOrFail($kode);
        $user->update([
            'type' => $data['type'],
            'nama' => $data['type'] . ' - ' . $data['nama'], // Gabungan
        ]);

        return redirect()->route('master-data.jenis-ujian.manager')->with('success', 'Data berhasil diperbarui');
    }
}
