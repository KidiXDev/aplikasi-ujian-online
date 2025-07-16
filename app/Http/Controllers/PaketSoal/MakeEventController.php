<?php

namespace App\Http\Controllers\PaketSoal;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MakeEventController extends Controller
{
    // public function create()
    // {
    //     return Inertia::render('master-data/event/CreateEvent');
    // }

    public function index()
    {
        $event = Event::get();
        return response()->json($event);
    }

    public function create()
    {
        return Inertia::render('master-data/paket-soal/create-event', [
            'event' => null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_event' => 'required|string|max:255',
            'status' => 'required|boolean',
            'event_mulai' => 'nullable|date',
            'event_akhir' => 'nullable|date',
        ]);

        try {
            // Gunakan nilai dari request atau default
            $event_mulai = $request->input('event_mulai') ?? now();
            $event_akhir = $request->input('event_akhir') ?? now()->addYears(5);

            $event = Event::create([
                'nama_event' => $request->input('nama_event'),
                'status' => $request->input('status', 1),
                'mulai_event' => $event_mulai,
                'akhir_event' => $event_akhir,
            ]);

            // Redirect ke halaman event manager dengan pesan sukses
            return redirect()->route('master-data.event.getEvent')
                ->with('success', 'Event berhasil dibuat');
        } catch (\Exception $e) {
            return redirect()->route('master-data.event.getEvent')
                ->with('error', 'Gagal membuat event: ' . $e->getMessage());
        }
    }

    public function show($id)
    {
        $event = Event::findOrFail($id);

        $eventData = [
            'id_event' => $event->id_event,
            'nama_event' => $event->nama_event,
            'status' => $event->status ? 'aktif' : 'tidak-aktif',
            'event_mulai' => $event->mulai_event ? $event->mulai_event->format('Y-m-d') : null,
            'event_akhir' => $event->akhir_event ? $event->akhir_event->format('Y-m-d') : null,
        ];

        return Inertia::render('master-data/event/EventDetail', [
            'event' => $eventData,
        ]);
    }

    public function edit($id)
    {
        $event = Event::findOrFail($id);

        $eventData = [
            'id_event' => $event->id_event,
            'nama_event' => $event->nama_event,
            'status' => $event->status ? 'aktif' : 'tidak-aktif',
            'event_mulai' => $event->mulai_event ? $event->mulai_event->format('Y-m-d') : null,
            'event_akhir' => $event->akhir_event ? $event->akhir_event->format('Y-m-d') : null,
        ];

        return Inertia::render('master-data/paket-soal/create-event', ['event' => $eventData]);
    }

    // public function store(Request $request)
    // {
    //     Event::create([
    //         'nama_event' => $request->nama_event,
    //         'status' => 1
    //     ]);

    //     return redirect()->route('master-data.event.getEvent');
    // }

    public function update($id, Request $request)
    {
        try {
            $event = Event::findOrFail($id);
            $event->update($request->all());

            return redirect()->route('master-data.event.getEvent')
                ->with('success', 'Event berhasil diupdate');
        } catch (\Exception $e) {
            return redirect()->route('master-data.event.getEvent')
                ->with('error', 'Gagal mengupdate event: ' . $e->getMessage());
        }
    }

    public function toggleStatus($id, Request $request)
    {
        $event = Event::findOrFail($id);
        $event->status = $request->status;
        $event->save();

        return redirect()->back();
    }

    public function destroy($id, Request $request)
    {
        try {
            Event::findOrFail($id)->delete();
            
            // Ambil parameter dari request untuk mempertahankan filter
            $params = $request->only(['pages', 'search', 'status', 'page']);
            
            return redirect()->route('master-data.event.getEvent', $params)
                ->with('success', 'Event berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->route('master-data.event.getEvent')
                ->with('error', 'Gagal menghapus event: ' . $e->getMessage());
        }
    }

    public function change_status($id, Request $request)
    {
        try {
            $event = Event::findOrFail($id);
            
            // Toggle status
            $event->status = $event->status === 1 ? 0 : 1;
            $event->save();
            
            $statusText = $event->status === 1 ? 'diaktifkan' : 'dinonaktifkan';

            // Ambil parameter dari request untuk mempertahankan filter
            $params = $request->only(['pages', 'search', 'status', 'page']);
            
            return redirect()->route('master-data.event.getEvent', $params)
                ->with('success', "Status event berhasil {$statusText}");            
        } catch (\Exception $e) {
            return redirect()->route('master-data.event.getEvent')
                ->with('error', 'Gagal mengubah status event: ' . $e->getMessage());
        }
    }

public function getEvent(Request $request)
    {
        $events = Event::query();

        if ($request->search) {
            $events->where('nama_event', 'like', '%' . $request->search . '%');
        }

        if (!is_null($request->status) && $request->status !== '') {
            $events->where('status', $request->status);
        }

        $data = $events->paginate($request->pages ?? 10)->withQueryString();

        return Inertia::render('master-data/event/EventManager', [
            'events' => $data
        ]);
    }
}
