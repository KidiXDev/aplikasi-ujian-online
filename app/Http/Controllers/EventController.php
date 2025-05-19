<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);

        $events = Event::query()
            ->when($search, function ($query, $search) {
                return $query->where('nama_event', 'like', "%{$search}%");
            })
            ->orderByDesc('id_event')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('masterdata/event/event-manager', [
            'data' => $events,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('masterdata/event/form.event-manager');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_event' => 'required|string',
            'mulai_event' => 'required|date',
            'akhir_event' => 'required|date',
            'create_event' => 'required|date',
            'status' => 'required|integer|in:0,1',
        ]);

        Event::create($validated);

        return redirect()->route('master-data.event.index')
            ->with('success', 'Event berhasil ditambahkan');
    }

    public function edit($id)
    {
        $event = Event::findOrFail($id);

        return Inertia::render('masterdata/event/form.event-manager', [
            'event' => $event
        ]);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'nama_event' => 'required|string',
            'mulai_event' => 'required|date',
            'akhir_event' => 'required|date',
            'create_event' => 'required|date',
            'status' => 'required|integer|in:0,1',
        ]);

        $event->update($validated);

        return redirect()->route('master-data.event.index')
            ->with('success', 'Event berhasil diperbarui');
    }

    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return redirect()->route('master-data.event.index')
            ->with('success', 'Event berhasil dihapus');
    }
}
