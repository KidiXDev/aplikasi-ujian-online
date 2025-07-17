import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

interface Bidang {
  kode: number;
  nama: string;
}
interface Event {
  id_event: number;
  nama_event: string;
}

export default function CreatePaketSoal() {
  const [bidangs, setBidangs] = useState<Bidang[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [success, setSuccess] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    nama_ujian: '',
    id_event: '',
    kode_part: '',
  });

  // Ambil data bidang
  useEffect(() => {
    axios.get('/bidangs').then(res => {
      setBidangs(res.data);
    });
    axios.get('/events/list').then(res => {
      setEvents(res.data);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData(e.target.name as keyof typeof data, e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('master-data.part.store'), {
      onSuccess: () => {
        setSuccess(true);
        reset();
        setTimeout(() => setSuccess(false), 3000);
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">Buat Paket Soal</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Paket soal berhasil dibuat!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Nama Ujian</label>
          <input
            type="text"
            name="nama_ujian"
            value={data.nama_ujian}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.nama_ujian && <p className="text-red-500 text-sm">{errors.nama_ujian}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Event</label>
          <select
            name="id_event"
            value={data.id_event}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Pilih Event</option>
            {events.map((event) => (
              <option key={event.id_event} value={event.id_event}>
                {event.nama_event}
              </option>
            ))}
          </select>
          {errors.id_event && <p className="text-red-500 text-sm">{errors.id_event}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Bidang</label>
          <select
            name="kode_part"
            value={data.kode_part}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Pilih Bidang</option>
            {bidangs.map((bidang) => (
              <option key={bidang.kode} value={bidang.kode}>
                {bidang.nama}
              </option>
            ))}
          </select>
          {errors.kode_part && <p className="text-red-500 text-sm">{errors.kode_part}</p>}
        </div>

        <button
          type="submit"
          disabled={processing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
