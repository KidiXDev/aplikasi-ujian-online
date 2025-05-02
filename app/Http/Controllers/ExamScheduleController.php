<?php

namespace App\Http\Controllers;

use App\Models\ExamSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamScheduleController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = ExamSchedule::query();

        if ($search) {
            $query->where('kode_jadwal', 'like', "%{$search}%")
                ->orWhere('tipe_ujian', 'like', "%{$search}%");
        }

        $data = $query->orderBy('tanggal', 'desc')
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('exam-schedule/exam-manager', [
            'data' => $data,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('ExamSchedule/Create');
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
            'kode_jadwal' => 'required|string|max:255',
        ]);

        ExamSchedule::create($validated);

        return redirect()->route('exam-schedule.index')->with('success', 'Jadwal ujian berhasil ditambahkan.');
    }

    public function edit(ExamSchedule $examSchedule)
    {
        return Inertia::render('ExamSchedule/Edit', [
            'data' => $examSchedule
        ]);
    }

    public function update(Request $request, ExamSchedule $examSchedule)
    {
        $validated = $request->validate([
            'id_paket_ujian' => 'required|integer',
            'tipe_ujian' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required',
            'waktu_selesai' => 'required',
            'kuota' => 'required|integer',
            'jenis_ujian' => 'required|integer',
            'kode_jadwal' => 'required|string|max:255',
        ]);

        $examSchedule->update($validated);

        return redirect()->route('exam-schedule.index')->with('success', 'Jadwal ujian berhasil diperbarui.');
    }

    public function destroy(ExamSchedule $examSchedule)
    {
        $examSchedule->delete();

        return redirect()->back()->with('success', 'Jadwal ujian berhasil dihapus.');
    }
}