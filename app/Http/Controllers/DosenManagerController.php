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
        $pages = $request->query('pages', 10);
        $search = $request->query('search', null);

        $usersQuery = User::role('dosen')->with(['roles', 'dosen']);
        
        if ($search) {
            $usersQuery->where('name', 'like', '%' . $search . '%')
                ->orWhere('email', 'like', '%' . $search . '%');
        }

        return Inertia::render(
            'dosen-management/dosen-manager',
            [
                'data' => $usersQuery->paginate((int)$pages)->withQueryString(),
                'filters' => [
                    'search' => $search,
                    'pages' => $pages,
                ],
            ]
        );
    }

    public function delete(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return redirect()->back()->with('error', 'You cannot delete your own account');
        }

        $dosen = \App\Models\Dosen::where('nip', $user->nip)->first();
        if ($dosen) {
            $dosen->delete();
        }


        $user->delete();

        return redirect()->back()->with('success', 'Dosen dan data terkait berhasil dihapus');
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
            return redirect()->back()->with('success', 'Import data dosen berhasil.');
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
}
