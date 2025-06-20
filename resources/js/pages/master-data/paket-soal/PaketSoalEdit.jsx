import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PaketSoalEdit = ({ eventId }) => {
  const [form, setForm] = useState({
    nama_event: '',
    bidang: '',
    soal: [''],
  });
  const [bidangs, setBidangs] = useState([]);

  useEffect(() => {
    // Fetch bidangs
    axios.get('/api/bidangs').then((res) => setBidangs(res.data));

    // Fetch event detail
    axios.get(`/api/event/${eventId}/edit`).then((res) => {
      const { event } = res.data;
      setForm({
        nama_event: event.nama_event,
        bidang: event.jadwal_ujian_soal?.kd_bidang || '',
        soal: event.jadwal_ujian_soal?.ujian_soal || [''],
      });
    });
  }, [eventId]);

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;

    if (name === 'soal') {
      const updatedSoal = [...form.soal];
      updatedSoal[index] = value;
      setForm({ ...form, soal: updatedSoal });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addSoal = () => {
    setForm({ ...form, soal: [...form.soal, ''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.put(`/master-data/paket-soal/${eventId}`, form);
    alert('Paket soal berhasil diperbarui.');
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">Edit Paket Soal</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Nama Event</label>
          <input
            type="text"
            name="nama_event"
            value={form.nama_event}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Bidang</label>
          <select
            name="bidang"
            value={form.bidang}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Pilih Bidang</option>
            {bidangs.map((bidang) => (
              <option key={bidang.kode} value={bidang.kode}>
                {bidang.nama_bidang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Soal (Opsional)</label>
          {form.soal.map((item, index) => (
            <input
              key={index}
              type="text"
              name="soal"
              value={item}
              onChange={(e) => handleChange(e, index)}
              placeholder={`ID Soal ke-${index + 1}`}
              className="w-full border px-3 py-2 rounded mb-2"
            />
          ))}
          <button type="button" onClick={addSoal} className="text-blue-600 text-sm">
            + Tambah Soal
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Simpan
        </button>
      </form>
    </div>
  );
};

export default PaketSoalEdit;
