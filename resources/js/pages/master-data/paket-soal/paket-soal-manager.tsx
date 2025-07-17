import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
  const [searchEventCopy, setSearchEventCopy] = useState('');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');
  const [idSortOrder, setIdSortOrder] = useState<'asc' | 'desc'>('asc');

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
  const fetchEventListForCopy = async (search = '') => {
    if (!event?.id_event) return;
    
    setLoadingEventList(true);
    try {
      const url = `/master-data/paket-soal/list-event-to-copy/${event.id_event}${search ? `?search=${encodeURIComponent(search)}` : ''}`;
      const response = await fetch(url);
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

  // Debounce search untuk mengurangi API calls
  useEffect(() => {
    if (copyDialogOpen) {
      const timeoutId = setTimeout(() => {
        fetchEventListForCopy(searchEventCopy);
      }, 300); // 300ms delay

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchEventCopy, copyDialogOpen, event?.id_event]);

  // Gabungkan data jadwalUjian dan jadwalUjianSoal berdasarkan id_ujian
  const data = jadwalUjian.data.map((item) => {
    const soal = jadwalUjianSoal.find((s) => s.id_ujian === item.id_ujian);
    return {
      id: item.id_ujian,
      nama: item.nama_ujian,
      event: item.event?.nama_event ?? item.id_event,
      // bidang: item.bidang?.nama ?? item.kode_part,
      jumlah: soal ? soal.total_soal : 0,
    };
  });

  // Sorting data berdasarkan ID dan jumlah soal
  const sortedData = [...data].sort((a, b) => {
    // Primary sort: ID (default terkecil ke terbesar)
    let idComparison = 0;
    if (idSortOrder === 'desc') {
      idComparison = b.id - a.id; // Terbesar ke terkecil
    } else {
      idComparison = a.id - b.id; // Terkecil ke terbesar
    }
    
    // Secondary sort: Jumlah Soal (jika ID sama)
    if (idComparison === 0) {
      if (sortOrder === 'desc') {
        return b.jumlah - a.jumlah; // Terbesar ke terkecil
      } else {
        return a.jumlah - b.jumlah; // Terkecil ke terbesar
      }
    }
    
    return idComparison;
  });

  // Tambahkan nomor urut berdasarkan urutan yang sudah diurutkan
  const sortedDataWithNumbers = sortedData.map((item, index) => ({
    ...item,
    nomor: index + 1,
  }));

  const handleDelete = (id: number) => {
    setTargetId(id);
    setOpen(true);
  };

  const handleCopyPart = async () => {
    if (!event?.id_event) {
      toast.error('Event tidak ditemukan');
      return;
    }

    // Reset search dan buka dialog
    setSearchEventCopy('');
    setCopyDialogOpen(true);
    // fetchEventListForCopy akan dipanggil otomatis oleh useEffect
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
        setSearchEventCopy('');
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
      render: (d: typeof sortedDataWithNumbers[0]) => (
        <div className="text-center">{d.nomor}</div>
      )
    },
    { label: 'ID', className: 'text-center w-[80px]', render: (d: typeof sortedDataWithNumbers[0]) => <div className="text-center">{d.id}</div> },
    { label: 'Nama Part', className: 'w-[300px]', render: (d: typeof sortedDataWithNumbers[0]) => d.nama },
    {
      label: 'Jumlah Soal',
      className: 'text-center w-[150px]',
      render: (d: typeof sortedDataWithNumbers[0]) => <div className="text-center">{d.jumlah}</div>,
    },
    {
      label: 'Action',
      className: 'text-center w-[200px]',
      render: (d: typeof sortedDataWithNumbers[0]) => (
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

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && selectedEventAsal && !loadingEventList) {
        confirmCopyPart();
      } else if (e.key === 'Escape') {
        setCopyDialogOpen(false);
        setSelectedEventAsal(null);
        setEventListForCopy([]);
        setSearchEventCopy('');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div 
          className="bg-white rounded-lg p-8 max-w-xl w-full mx-4 shadow-xl"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Copy Part dari Paket Lain ke {event?.nama_event}</h2>
          
          <div className="space-y-5">

            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cari Paket Asal:
              </label>
              <input
                type="text"
                value={searchEventCopy}
                onChange={(e) => setSearchEventCopy(e.target.value)}
                placeholder="Ketik nama event untuk mencari..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled={loadingEventList}
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pilih Event Asal:
              </label>
              {loadingEventList ? (
                <div className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-500 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Memuat daftar event...
                  </div>
                </div>
              ) : (
                <select
                  value={selectedEventAsal || ''}
                  onChange={(e) => setSelectedEventAsal(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  disabled={loadingEventList}
                  size={Math.min(eventListForCopy.length + 1, 8)}
                >
                  <option value="">-- Pilih Event Asal --</option>
                  {eventListForCopy.map((evt) => (
                    <option key={evt.id_event} value={evt.id_event}>
                      {evt.nama_event}
                    </option>
                  ))}
                </select>
              )}
              
              {/* Info hasil pencarian */}
              {searchEventCopy && !loadingEventList && (
                <div className="mt-3 text-xs text-gray-500">
                  Ditemukan <span className="font-medium text-blue-600">{eventListForCopy.length}</span> event yang cocok
                </div>
              )}
            </div>
            
            {!loadingEventList && eventListForCopy.length === 0 && !searchEventCopy && (
              <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Tidak ada paket lain yang tersedia untuk disalin.
                </div>
              </div>
            )}

            {!loadingEventList && eventListForCopy.length === 0 && searchEventCopy && (
              <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Tidak ada event yang cocok dengan pencarian "<strong>{searchEventCopy}</strong>".
                </div>
              </div>
            )}

            {/* Keyboard shortcuts info */}
            <div className="text-xs text-gray-400 border-t pt-4">
              <div className="flex items-center gap-6">
                <span>Tekan <kbd className="px-2 py-1 bg-gray-100 border rounded text-gray-600 font-mono">Enter</kbd> untuk copy</span>
                <span><kbd className="px-2 py-1 bg-gray-100 border rounded text-gray-600 font-mono">Esc</kbd> untuk batal</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => {
                setCopyDialogOpen(false);
                setSelectedEventAsal(null);
                setEventListForCopy([]);
                setSearchEventCopy('');
              }}
              className="px-6 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={confirmCopyPart}
              disabled={!selectedEventAsal || loadingEventList}
              className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Part
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
          <div className="flex items-center gap-4">
            <EntriesSelector
              currentValue={jadwalUjian.per_page}
              options={[10, 25, 50, 100]}
              routeName={event ? "master-data.paket-soal.show-by-event" : "master-data.paket-soal.index"}
              paramName="pages"
              routeParams={event ? { 
                id_event: event.id_event,
                search: currentParams.search
              } : {
                search: currentParams.search
              }}
            />
            
            {/* Sort by ID */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Urutkan ID:</label>
              <select
                value={idSortOrder}
                onChange={(e) => setIdSortOrder(e.target.value as 'asc' | 'desc')}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="asc">Terkecil ke Terbesar</option>
                <option value="desc">Terbesar ke Terkecil</option>
              </select>
            </div>
          </div>
          
          <SearchInputMenu
            defaultValue={currentParams.search}
            routeName={event ? "master-data.paket-soal.show-by-event" : "master-data.paket-soal.index"}
            paramName="search"
            routeParams={event ? { 
              id_event: event.id_event,
              pages: currentParams.pages
            } : {
              pages: currentParams.pages
            }}
          />
        </div>

        <CustomTable columns={columns} data={sortedDataWithNumbers} />
        
        <PaginationWrapper
          currentPage={jadwalUjian.current_page}
          lastPage={jadwalUjian.last_page}
          perPage={jadwalUjian.per_page}
          total={jadwalUjian.total}
          onNavigate={(page) => {
            if (event && event.id_event) {
              router.visit(route('master-data.paket-soal.show-by-event', event.id_event), {
                data: {
                  pages: currentParams.pages,
                  search: currentParams.search,
                  page
                },
                preserveScroll: true
              });
            } else {
              router.visit(route('master-data.paket-soal.index'), {
                data: {
                  pages: currentParams.pages,
                  search: currentParams.search,
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