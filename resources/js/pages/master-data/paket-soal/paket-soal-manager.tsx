import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Plus, Copy } from 'lucide-react';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { CButtonIcon, CButton } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';

interface JadwalUjianType {
  id_ujian: number;
  nama_ujian: string;
  id_event: number;
  // kode_part: string;
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

interface EventType {
  id_event: number;
  nama_event: string;
}

export default function PaketSoalManager() {
  const [open, setOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [selectedEventAsal, setSelectedEventAsal] = useState<number | null>(null);
  const [eventListForCopy, setEventListForCopy] = useState<EventType[]>([]);
  const [loadingEventList, setLoadingEventList] = useState(false);

  // Ambil data dari props inertia
  const { 
    jadwalUjian = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 }, 
    jadwalUjianSoal = [],
    event // Event saat ini (event tujuan)
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

  // Ambil parameter URL yang ada
  const { url: currentUrl } = usePage();
  const params = new URLSearchParams(currentUrl.split('?')[1] || '');
  const currentParams = {
    pages: params.get('pages') || jadwalUjian.per_page.toString(),
    search: params.get('search') || '',
    page: params.get('page') || '1'
  };

  // Fetch event list untuk copy part menggunakan API yang sudah ada
  const fetchEventListForCopy = async () => {
    if (!event?.id_event) return;
    
    setLoadingEventList(true);
    try {
      const response = await fetch(`/master-data/paket-soal/list-event-to-copy/${event.id_event}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event list');
      }
      const data = await response.json();
      console.log('Event list fetched:', data); // Debug log
      setEventListForCopy(data);
    } catch (error) {
      console.error('Error fetching event list:', error);
      toast.error('Gagal memuat daftar event');
      setEventListForCopy([]);
    } finally {
      setLoadingEventList(false);
    }
  };

  // Gabungkan data jadwalUjian dan jadwalUjianSoal berdasarkan id_ujian
  const data = jadwalUjian.data.map((item, index) => {
    const soal = jadwalUjianSoal.find((s) => s.id_ujian === item.id_ujian);
    return {
      id: item.id_ujian,
      nama: item.nama_ujian,
      event: item.event?.nama_event ?? item.id_event,
      // bidang: item.bidang?.nama ?? item.kode_part,
      jumlah: soal ? soal.total_soal : 0,
      nomor: ((jadwalUjian.current_page - 1) * jadwalUjian.per_page) + index + 1,
    };
  });

  const handleDelete = (id: number) => {
    setTargetId(id);
    setOpen(true);
  };

  const handleCopyPart = async () => {
    if (!event?.id_event) {
      toast.error('Event tidak ditemukan');
      return;
    }

    // Fetch event list saat dialog dibuka
    await fetchEventListForCopy();
    setCopyDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!targetId) return;
    router.delete(route('master-data.paket-soal.destroy', targetId), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Paket soal berhasil dihapus');
        // Refresh halaman dengan parameter yang sama
        if (event?.id_event) {
          router.visit(route('master-data.paket-soal.show-by-event', event.id_event), {
            data: currentParams,
            preserveScroll: true
          });
        }
      },
      onError: () => {
        toast.error('Gagal menghapus paket soal');
      },
    });
    setOpen(false);
  };

  const confirmCopyPart = () => {
    if (!selectedEventAsal || !event?.id_event) {
      toast.error('Silakan pilih event asal');
      return;
    }

    const payload = {
      event_asal: selectedEventAsal,
      event_tujuan: event.id_event,
    };

    console.log('Sending copy part request:', payload);
    console.log('Route:', route('master-data.paket-soal.copy_part'));

    router.post(route('master-data.paket-soal.copy_part'), payload, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: (response) => {
        console.log('Copy part success:', response);
        toast.success('Paket soal berhasil disalin!');
        setCopyDialogOpen(false);
        setSelectedEventAsal(null);
        setEventListForCopy([]);
        // Refresh halaman dengan parameter yang sama
        if (event?.id_event) {
          router.visit(route('master-data.paket-soal.show-by-event', event.id_event), {
            data: currentParams,
            preserveScroll: true
          });
        }
      },
      onError: (errors) => {
        console.error('Copy part errors:', errors);
        toast.error('Gagal menyalin paket soal');
      },
    });
  };

  const handleBack = () => {
    router.visit(route('master-data.event.getEvent'));
  };

  const breadcrumbs = [
    { title: 'Event', href: '/master-data/event' },
    { title: 'Paket Soal', href: '#' }
  ];

  const columns = [
    { 
      label: 'No', 
      className: 'text-center w-[60px]', 
      render: (d: typeof data[0]) => (
        <div className="text-center">{d.nomor}</div>
      )
    },
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

  // Custom Copy Dialog Component
  const CopyPartDialog = () => {
    if (!copyDialogOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Copy Part dari Event Lain</h2>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Menyalin paket soal ke event: <strong>{event?.nama_event}</strong>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Asal:
              </label>
              {loadingEventList ? (
                <div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500">
                  Memuat daftar event...
                </div>
              ) : (
                <select
                  value={selectedEventAsal || ''}
                  onChange={(e) => setSelectedEventAsal(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loadingEventList}
                >
                  <option value="">Pilih Event Asal</option>
                  {eventListForCopy.map((evt) => (
                    <option key={evt.id_event} value={evt.id_event}>
                      {evt.nama_event}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {!loadingEventList && eventListForCopy.length === 0 && (
              <div className="text-sm text-red-600">
                Tidak ada event lain yang tersedia untuk disalin.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => {
                setCopyDialogOpen(false);
                setSelectedEventAsal(null);
                setEventListForCopy([]);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={confirmCopyPart}
              disabled={!selectedEventAsal || loadingEventList}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    );
  };

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

        {/* Content Title dengan tombol Add dan Copy */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {event ? `Part Paket Soal - ${event.nama_event}` : "Part Paket Soal"}
          </h1>
          <div className="flex gap-2">
            <CButton
              onClick={handleCopyPart}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Part
            </CButton>
            <CButton
              onClick={() => {
                if (event?.id_event) {
                  router.visit(`/master-data/paket-soal/create/${event.id_event}`);
                } else {
                  router.visit(`/master-data/paket-soal/create-event/${event?.id_event}`);
                }
              }}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </CButton>
          </div>
        </div>

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
            if (event && event.id_event) {
              router.visit(route('master-data.paket-soal.show-by-event', event.id_event), {
                data: {
                  pages: jadwalUjian.per_page,
                  page
                },
                preserveScroll: true
              });
            } else {
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

        {/* Dialog Delete */}
        <CAlertDialog 
          open={open} 
          setOpen={setOpen} 
          onContinue={confirmDelete}
          title="Hapus Paket Soal"
          description="Apakah Anda yakin ingin menghapus paket soal ini? Tindakan ini tidak dapat dibatalkan."
        />

        {/* Custom Copy Dialog */}
        <CopyPartDialog />
      </div>
    </AppLayout>
  );
}