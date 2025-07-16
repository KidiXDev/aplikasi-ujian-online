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
        return redirect()->route('master-data.event.getEvent');
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
        return redirect()->route('master-data.event.getEvent');
    }

    public function destroy($id)
    {
        Event::findOrFail($id)->delete();
        return redirect()->back();
        try {
            // Cari event berdasarkan ID
            $event = Event::findOrFail($id);
            
            // Nonaktifkan event dengan mengubah status menjadi 0
            $event->status = 0;
            $event->save();

            // Nonaktifkan semua jadwal ujian yang terkait dengan event ini
            $jadwalUjians = JadwalUjian::where('id_event', $id)->get();
            foreach ($jadwalUjians as $jadwalUjian) {
                // Bisa tambahkan field status pada jadwal ujian jika diperlukan
                // $jadwalUjian->status = 0;
                // $jadwalUjian->save();
            }

            return redirect()->route('master-data.event.getEvent');
        } catch (\Exception $e) {
            return redirect()->route('master-data.event.getEvent')
                ->with('error', 'Gagal menonaktifkan event: ' . $e->getMessage());
        }
    }

    public function list()
    {
        // Ambil semua event, bisa tambahkan where jika ingin filter tertentu
        $events = Event::select('id_event', 'nama_event')->get();
        return response()->json($events);
    }

    public function getEvent(Request $request)
    {
        $pages = $request->query('pages', 10);
        $search = $request->query('search', null);

        $eventQuery = Event::select('id_event', 'nama_event', 'status', 'mulai_event', 'akhir_event')
            ->orderBy('id_event', 'desc');

        if ($search) {
            $eventQuery->where('nama_event', 'like', '%' . $search . '%');
        }

        $events = $eventQuery->paginate($pages);

        return Inertia::render('master-data/event/EventManager', [
            'events' => $events,
        ]);
    }
}
