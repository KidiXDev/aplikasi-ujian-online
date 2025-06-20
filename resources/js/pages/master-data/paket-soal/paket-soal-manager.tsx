import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { List, Pencil, Trash2, Plus } from 'lucide-react';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';

interface JadwalUjianType {
  id_ujian: number;
  nama_ujian: string;
  id_event: number;
  kode_part: string;
  event?: {
    nama_event: string;
  };
  bidang?: {
    nama: string;
  };
}
interface JadwalUjianSoalType {
  id_ujian: number;
  total_soal: number;
}

export default function PaketSoalManager() {
  const [open, setOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);

  // Ambil data dari props inertia
  const { jadwalUjian = [], jadwalUjianSoal = [] } = (usePage().props as unknown) as {
    jadwalUjian: JadwalUjianType[];
    jadwalUjianSoal: JadwalUjianSoalType[];
  };

  // Gabungkan data jadwalUjian dan jadwalUjianSoal berdasarkan id_ujian
  const data = jadwalUjian.map((item) => {
    const soal = jadwalUjianSoal.find((s) => s.id_ujian === item.id_ujian);
    return {
      id: item.id_ujian,
      nama: item.nama_ujian,
      event: item.event?.nama_event ?? item.id_event,
      bidang: item.bidang?.nama ?? item.kode_part, // tampilkan nama bidang jika ada
      jumlah: soal ? soal.total_soal : 0,
    };
  });

  useEffect(() => {
    toast.success('Paket soal dimuat');
  }, []);

  const handleDelete = (id: number) => {
    setTargetId(id);
    setOpen(true);
  };

  const confirmDelete = () => {
    toast.success(`Paket soal dengan ID ${targetId} berhasil dihapus`);
    setOpen(false);
  };

  const breadcrumbs = [{ title: 'Paket Soal', href: '/master-data/paket-soal' }];

  const columns = [
    { label: 'ID', className: 'text-center w-[80px]', render: (d: typeof data[0]) => <div className="text-center">{d.id}</div> },
    { label: 'Nama Paket Soal', className: 'w-[300px]', render: (d: typeof data[0]) => d.nama },
    { label: 'Event', className: 'w-[200px]', render: (d: typeof data[0]) => d.event },
    { label: 'Bidang', className: 'w-[150px]', render: (d: typeof data[0]) => d.bidang },
    {
      label: 'Jumlah Soal',
      className: 'text-center w-[150px]',
      render: (d: typeof data[0]) => <div className="text-center">{d.jumlah}</div>,
    },
    {
      label: 'Action',
      className: 'text-center w-[200px]',
      render: (d: typeof data[0]) => (
        <div className="flex justify-center gap-2">
          <CButtonIcon
            icon={Plus}
            className="bg-green-600"
            onClick={() => router.visit(`/master-data/bank-soal-checkbox/${d.id}/edit`)}
          />
          <CButtonIcon
            icon={List}
            className="bg-yellow-500"
            onClick={() => router.visit(`/master-data/paket-soal/${d.id}/detail`)}
          />
          <CButtonIcon
            icon={Pencil}
            onClick={() => router.visit(`/master-data/paket-soal/${d.id}/edit`)}
          />
          <CButtonIcon
            icon={Trash2}
            type="danger"
            onClick={() => handleDelete(d.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data Paket Soal" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <ContentTitle title="Data Paket Soal" showButton onButtonClick={() => router.visit('/master-data/paket-soal/create')} />

        <div className="mt-4 flex items-center justify-between">
          <EntriesSelector currentValue={10} options={[10, 25, 50]} routeName="#" />
          <SearchInputMenu defaultValue={''} routeName="#" />
        </div>

        <CustomTable columns={columns} data={data} />
        <PaginationWrapper
          currentPage={1}
          lastPage={1}
          perPage={10}
          total={data.length}
          onNavigate={() => {}}
        />

        <CAlertDialog open={open} setOpen={setOpen} onContinue={confirmDelete} />
      </div>
    </AppLayout>
  );
}
