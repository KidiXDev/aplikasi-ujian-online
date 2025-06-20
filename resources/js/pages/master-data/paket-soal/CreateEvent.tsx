import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function CreateEvent() {
  const [success, setSuccess] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    nama_event: '',
    status: '1',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(
      name as 'status',
      value
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('event.store'), {
      onSuccess: () => {
        setSuccess(true);
        reset();
        setTimeout(() => setSuccess(false), 3000); // Notifikasi hilang setelah 3 detik
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">Buat Event Baru</h2>
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Event berhasil dibuat!
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Nama Event</label>
          <input
            type="text"
            name="nama_event"
            value={data.nama_event}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.nama_event && <p className="text-red-500 text-sm">{errors.nama_event}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Status</label>
          <select
            name="status"
            value={data.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="1">Aktif</option>
            <option value="0">Nonaktif</option>
          </select>
          {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
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