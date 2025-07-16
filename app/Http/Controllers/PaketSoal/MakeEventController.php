<?php

namespace App\Http\Controllers\PaketSoal;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MakeEventController extends Controller
{
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


    public function create()
    {
        return Inertia::render('master-data/event/CreateEvent');
    }

    public function edit($id)
    {
        $event = Event::findOrFail($id);
        return Inertia::render('master-data/event/EditEvent', ['event' => $event]);
    }

    public function store(Request $request)
    {
        Event::create([
            'nama_event' => $request->nama_event,
            'status' => 1
        ]);

        return redirect()->route('master-data.event.getEvent');
    }

    public function update($id, Request $request)
    {
        $event = Event::findOrFail($id);
        $event->update($request->all());

        return redirect()->route('master-data.event.getEvent');
    }

    public function toggleStatus($id, Request $request)
    {
        $event = Event::findOrFail($id);
        $event->status = $request->status;
        $event->save();

        return redirect()->back();
    }

    public function destroy($id)
    {
        Event::findOrFail($id)->delete();
        return redirect()->back();
    }
}
