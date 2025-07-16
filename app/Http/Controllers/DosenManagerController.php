<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\DosenImport;
use App\Models\Dosen;

class DosenManagerController extends Controller
{
    function index(Request $request)
    {
        $dosen = Dosen::query();

        // filter, search, pagination sesuai kebutuhan
        if ($request->search) {
            $dosen->where('nama', 'like', '%' . $request->search . '%');
        }

          // Filter status aktif/tidak aktif
        if ($request->filled('status')) {
            $dosen->where('aktif', $request->status);
        }

        $data = $dosen->orderBy('nama', 'asc')->paginate(10);

        return Inertia::render('dosen-management/dosen-manager', [
            'data' => $data,
            'filters' => $request->only('search', 'status   '),
        ]);
    }

    public function delete($nip)
    {
        $dosen = \App\Models\Dosen::findOrFail($nip); // nip sebagai primary key
        $dosen->delete();

        return redirect()->route('master-data.dosen.manager')->with('success', 'Dosen berhasil dihapus');
    }

    public function update(Request $request, User $user)
    {
        $user->update($request->all());

        return redirect()->back()->with('success', 'Data berhasil diupdate');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls',
        ]);

        try {
            Excel::import(new DosenImport, $request->file('file'));
            return redirect()->route('master-data.dosen.manager')
                ->with('success', 'Import data dosen berhasil.');
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            return redirect()->back()->with('error', 'Validasi file gagal.')->with('failures', $e->failures());
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal import: ' . $e->getMessage());
        }
    }

    // Debugging di DosenManagerController
    public function debug()
    {
        $users = User::role('dosen')->with('dosen')->get();
        foreach ($users as $user) {
            logger()->info('User NIP: ' . $user->nip . ', Aktif: ' . optional($user->dosen)->aktif);
        }
    }

    public function toggleStatus($nip)
    {
        $dosen = \App\Models\Dosen::findOrFail($nip);
        $dosen->aktif = $dosen->aktif ? 0 : 1;
        $dosen->save();

        return response()->json([
            'success' => true,
            'aktif' => $dosen->aktif,
        ]);
    }
}
