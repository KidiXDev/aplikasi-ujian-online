import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

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
  const { 
    jadwalUjian = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 }, 
    jadwalUjianSoal = [],
    event // Tambahkan event dari props
  } = usePage().props as unknown as {
    jadwalUjian: {
      data: JadwalUjianType[];
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
    jadwalUjianSoal: JadwalUjianSoalType[];
    event?: { id_event: number; nama_event: string };
  };

  // Gabungkan data jadwalUjian dan jadwalUjianSoal berdasarkan id_ujian
  const data = jadwalUjian.data.map((item) => {
    const soal = jadwalUjianSoal.find((s) => s.id_ujian === item.id_ujian);
    return {
      id: item.id_ujian,
      nama: item.nama_ujian,
      event: item.event?.nama_event ?? item.id_event,
      bidang: item.bidang?.nama ?? item.kode_part,
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

  // PERBAIKI: Fungsi ini HARUS di luar render kolom!
  const confirmDelete = () => {
    if (!targetId) return;
    router.delete(route('master-data.paket-soal.destroy', targetId), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Paket soal berhasil dihapus');
      },
      onError: () => {
        toast.error('Gagal menghapus paket soal');
      },
    });
    setOpen(false);
  };

  const handleBack = () => {
    router.visit(route('master-data.event.getEvent'));
    };

  // Perbaiki breadcrumbs
  const breadcrumbs = [
    { title: 'Event', href: '/master-data/event' },
    { title: 'Paket Soal', href: '#' }
  ];

  const columns = [
    { label: 'ID', className: 'text-center w-[80px]', render: (d: typeof data[0]) => <div className="text-center">{d.id}</div> },
    { label: 'Nama Paket Soal', className: 'w-[300px]', render: (d: typeof data[0]) => d.nama },
    { label: 'Event', className: 'w-[200px]', render: (d: typeof data[0]) => d.event },
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
        {/* Tombol Kembali */}
        <button
          onClick={handleBack}
          className="mb-4 self-start flex items-center gap-2 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>

        <ContentTitle 
          title={event ? `Paket Soal - ${event.nama_event}` : "Data Paket Soal"} 
          showButton 
          onButtonClick={() => {
            // Jika ada event dari props, gunakan untuk create dengan event ID
            if (event?.id_event) {
              router.visit(`/master-data/paket-soal/create/${event.id_event}`);
            } else {
              // Jika tidak ada event, gunakan create biasa
              router.visit('/master-data/paket-soal/create-event');
            }
          }}
        />

        <div className="mt-4 flex items-center justify-between">
          <EntriesSelector
            currentValue={jadwalUjian.per_page}
            options={[10, 25, 50]}
            routeName={event ? "master-data.paket-soal.show-by-event" : "master-data.paket-soal.index"}
            paramName="pages"
            routeParams={event ? { id_event: event.id_event } : {}}
          />
          <SearchInputMenu
            defaultValue={''}
            routeName={event ? "master-data.paket-soal.show-by-event" : "master-data.paket-soal.index"}
            paramName="search"
            routeParams={event ? { id_event: event.id_event } : {}}
          />
        </div>

        <CustomTable columns={columns} data={data} />
        
        <PaginationWrapper
          currentPage={jadwalUjian.current_page}
          lastPage={jadwalUjian.last_page}
          perPage={jadwalUjian.per_page}
          total={jadwalUjian.total}
          onNavigate={(page) => {
            // Perbaiki logika pagination berdasarkan keberadaan event
            if (event && event.id_event) {
              // Jika ada event, gunakan route show-by-event
              router.visit(route('master-data.paket-soal.show-by-event', event.id_event), {
                data: {
                  pages: jadwalUjian.per_page,
                  page
                },
                preserveScroll: true
              });
            } else {
              // Jika tidak ada event, gunakan route index
              router.visit(route('master-data.paket-soal.index'), {
                data: {
                  pages: jadwalUjian.per_page,
                  page
                },
                preserveScroll: true
              });
            }
          }}
        />

        <CAlertDialog open={open} setOpen={setOpen} onContinue={confirmDelete} />
      </div>
    </AppLayout>
  );
}
