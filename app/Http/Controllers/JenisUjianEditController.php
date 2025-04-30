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
            'kode' => 'required|string|max:10|unique:m_bidang,kode',
            'nama' => 'required|string|max:255',
            'type' => 'required|string|max:100',
        ]);

        MBidang::create($data);

        return redirect()->route('master-data.jenis-ujian.manager')->with('success', 'Data berhasil ditambahkan');
    }

    public function edit($kode)
    {
        $user = MBidang::findOrFail($kode);

        return Inertia::render('user-management/form.user-jenis-ujian', [
            'user' => [
                'kode' => $user->kode,
                'nama' => $user->nama,
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
        $user->update($data);

        return redirect()->route('master-data.jenis-ujian.manager')->with('success', 'Data berhasil diperbarui');
    }
}
