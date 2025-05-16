import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ImportDosen() {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Silakan pilih file Excel');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    router.post(route('master-data.dosen.import'), formData, {
      forceFormData: true,
      onSuccess: () => toast.success('Import berhasil'),
      onError: () => toast.error('Import gagal'),
    });
  };

  return (
    <AppLayout>
      <Head title="Import Data Dosen" />

      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Import Data Dosen</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 rounded"
          />
          <div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}