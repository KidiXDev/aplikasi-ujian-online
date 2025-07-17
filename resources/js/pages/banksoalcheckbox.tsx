import AppLayout from '@/layouts/app-layout';
import { Listbox } from '@headlessui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Components
import { ContentTitleNoadd } from '@/components/content-title-no-add';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';

/**
 * Types --------------------------------------------------------------------
 */
interface BreadcrumbItem {
  title: string;
  href: string;
}

interface PageFilter {
  order: string;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Soal {
  ids: number;
  suara: string | null;
  header_soal: string | null;
  body_soal: string;
  footer_soal: string | null;
  jw_1: string;
  jw_2: string;
  jw_3: string;
  jw_4: string;
  jw_fix: number;
}

interface PageProps {
  [key: string]: unknown;
  dataSoal: PaginatedResponse<Soal>;
  filters: PageFilter;
  flash?: {
    success?: string;
    error?: string;
  };
  matchedSoalIds?: number[];
  totalAvailableSoal?: number;
  availableForAdd?: number;
  paketSoal?: {
    id_ujian: number;
    nama_ujian: string;
    kode_part: string;
    id_event: number;
  };
}

/**
 * Main Component -----------------------------------------------------------
 */
export default function BankSoalCheckbox() {
  const props = usePage<PageProps>().props as unknown as PageProps;
  const dataSoal = props.dataSoal;
  const filters = props.filters || { search: '', order: 'asc' };
  const paketSoal = props.paketSoal;
  const totalAvailableSoal = props.totalAvailableSoal || 0;

  // Dynamic breadcrumbs based on paketSoal data
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Paket', href: '/master-data/paket' },
    { 
      title: 'part', 
      href: paketSoal?.id_event ? `/master-data/part/${paketSoal.id_event}` : '/master-data/part'
    },
    {
      title: 'Bank Soal Check Box',
      href: '/master-data/banksoalcheckbox',
    },
  ];

  const [selectedSoalIds, setSelectedSoalIds] = useState<number[]>(
    props.matchedSoalIds || []
  );
  const [randomCount, setRandomCount] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  /** Notifications --------------------------------------------------------*/
  useEffect(() => {
    if (props.flash?.success) toast.success(props.flash.success);
    if (props.flash?.error) toast.error(props.flash.error);
  }, [props.flash]);

  /** Handle back navigation -----------------------------------------------*/
  const handleBack = () => {
    if (paketSoal?.id_ujian) {
      // Gunakan route back yang sudah ada
      router.visit(route('master-data.bank-soal-checkbox.back', paketSoal.id_ujian));
    } else {
      // Fallback ke history back
      window.history.back();
    }
  };

  /** Handle select all ---------------------------------------------------*/
  const handleSelectAll = () => {
    if (!paketSoal?.id_ujian || isProcessing) return;

    setIsProcessing(true);
    router.post(
      route('master-data.bank-soal-checkbox.select-all', paketSoal.id_ujian),
      {},
      {
        preserveState: false, // Changed to false to reload page data
        preserveScroll: true,
        onFinish: () => setIsProcessing(false),
      }
    );
  };

  /** Handle select random ------------------------------------------------*/
  const handleSelectRandom = () => {
    if (!paketSoal?.id_ujian || isProcessing) return;

    if (randomCount < 1 || randomCount > totalAvailableSoal) {
      toast.error(`Jumlah soal harus antara 1 dan ${totalAvailableSoal}`);
      return;
    }

    setIsProcessing(true);
    router.post(
      route('master-data.bank-soal-checkbox.select-random', paketSoal.id_ujian),
      { random_count: randomCount },
      {
        preserveState: false, // Changed to false to reload page data
        preserveScroll: true,
        onFinish: () => setIsProcessing(false),
      }
    );
  };

  /** Handle add random ---------------------------------------------------*/
  const handleAddRandom = () => {
    if (!paketSoal?.id_ujian || isProcessing) return;

    const availableForAdd = totalAvailableSoal - selectedSoalIds.length;
    
    if (randomCount < 1 || randomCount > availableForAdd) {
      toast.error(`Jumlah soal harus antara 1 dan ${availableForAdd} (soal yang tersedia untuk ditambahkan)`);
      return;
    }

    setIsProcessing(true);
    router.post(
      route('master-data.bank-soal-checkbox.add-random', paketSoal.id_ujian),
      { random_count: randomCount },
      {
        preserveState: false, // Changed to false to reload page data
        preserveScroll: true,
        onFinish: () => setIsProcessing(false),
      }
    );
  };

  /** Handle clear all ----------------------------------------------------*/
  const handleClearAll = () => {
    if (!paketSoal?.id_ujian || isProcessing) return;

    if (selectedSoalIds.length === 0) {
      toast.error('Tidak ada soal yang dipilih');
      return;
    }

    setIsProcessing(true);
    router.post(
      route('master-data.bank-soal-checkbox.clear-all', paketSoal.id_ujian),
      {},
      {
        preserveState: false, // Changed to false to reload page data
        preserveScroll: true,
        onFinish: () => setIsProcessing(false),
      }
    );
  };

  /** Render ---------------------------------------------------------------*/
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Bank Soal Check Box" />

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

        <ContentTitleNoadd title="Bank Soal Check Box" />

        {/* Info Paket Soal dan Filter */}
        {paketSoal && (
          <div className="mb-4 rounded border bg-gray-50 p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                <p className="mt-1 text-base font-semibold">{paketSoal.nama_ujian}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kode Bidang</label>
                <p className="mt-1 text-base font-semibold">{paketSoal.kode_part}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Soal Terpilih</label>
                <p className="mt-1 text-base font-semibold text-green-600">
                  {selectedSoalIds.length} / {totalAvailableSoal} soal
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Soal Tersedia</label>
                <p className="mt-1 text-base font-semibold text-blue-600">
                  {totalAvailableSoal} soal
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dapat Ditambahkan</label>
                <p className="mt-1 text-base font-semibold text-purple-600">
                  {totalAvailableSoal - selectedSoalIds.length} soal
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Selection Controls */}
        {paketSoal && (
          <div className="mb-4 rounded border bg-gray-50 p-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Pilihan Cepat</h3>
            <div className="flex flex-wrap items-center gap-4">
              {/* Select All Button */}
              <button
                onClick={handleSelectAll}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isProcessing ? 'Memproses...' : 'Pilih Semua'}
              </button>

              {/* Random Selection */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Random:</label>
                <input
                  type="number"
                  value={randomCount}
                  onChange={(e) => setRandomCount(parseInt(e.target.value) || 1)}
                  min="1"
                  max={totalAvailableSoal}
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                />
                <span className="text-sm text-gray-500">dari {totalAvailableSoal}</span>
                <button
                  onClick={handleSelectRandom}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isProcessing ? 'Memproses...' : 'Pilih Random'}
                </button>
              </div>

              {/* Add Random Section */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Tambah Random:</label>
                <input
                  type="number"
                  value={randomCount}
                  onChange={(e) => setRandomCount(parseInt(e.target.value) || 1)}
                  min="1"
                  max={totalAvailableSoal - selectedSoalIds.length}
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                />
                <span className="text-sm text-gray-500">dari {totalAvailableSoal - selectedSoalIds.length}</span>
                
                {/* Add Random Button */}
                <button
                  onClick={handleAddRandom}
                  disabled={isProcessing || (totalAvailableSoal - selectedSoalIds.length) <= 0}
                  className="flex items-center gap-2 rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {isProcessing ? 'Memproses...' : 'Tambah Random'}
                </button>
              </div>

              {/* Clear All Button */}
              <button
                onClick={handleClearAll}
                disabled={isProcessing || selectedSoalIds.length === 0}
                className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isProcessing ? 'Memproses...' : 'Hapus Semua'}
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <EntriesSelector
              currentValue={dataSoal.per_page}
              options={[10, 15, 25, 50]}
              routeName="master-data.bank-soal-checkbox.edit"
              paramName="pages"
              routeParams={paketSoal ? {
                paket_soal: paketSoal.id_ujian,
                search: filters?.search || '',
                order: filters?.order || 'asc',
              } : {}}
            />
            <OrderFilter defaultValue={filters?.order ?? 'asc'} />
          </div>
          <SearchInputMenu
            defaultValue={filters?.search || ''}
            routeName="master-data.bank-soal-checkbox.edit"
            paramName="search"
            routeParams={paketSoal ? {
              paket_soal: paketSoal.id_ujian,
              pages: dataSoal.per_page.toString(),
              order: filters?.order || 'asc',
            } : {}}
          />
        </div>

        {/* Table */}
        <BankSoalTable
          data={dataSoal}
          pageFilters={filters}
          selectedSoalIds={selectedSoalIds}
          setSelectedSoalIds={setSelectedSoalIds}
        />
      </div>
    </AppLayout>
  );
}

/**
 * Helpers -----------------------------------------------------------------
 */
function detectMimeType(base64: string): string {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  if (base64.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg';
}

function renderContentWithBase64(content: string | null) {
  if (!content) return null;
  const isProbablyBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(content) && content.length > 100;

  if (isProbablyBase64) {
    const mimeType = detectMimeType(content);
    const imageSrc = `data:${mimeType};base64,${content}`;
    return (
      <img
        src={imageSrc}
        alt="gambar"
        className="max-h-60 max-w-full rounded object-contain"
      />
    );
  }

  return (
    <span
      className="whitespace-pre-wrap text-base font-medium"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

/**
 * OrderFilter Component ---------------------------------------------------
 */
function OrderFilter({ defaultValue }: { defaultValue: string }) {
  const props = usePage<PageProps>().props as unknown as PageProps;
  const filters = props.filters || {};
  const paketSoal = props.paketSoal;
  const perPage = props.dataSoal?.per_page || 10;
  const [order, setOrder] = useState(defaultValue);

  const handleChange = (selected: string) => {
    setOrder(selected);
    if (paketSoal) {
      router.visit(route('master-data.bank-soal-checkbox.edit', paketSoal.id_ujian), {
        data: {
          order: selected,
          search: filters.search || '',
          pages: perPage,
        },
        preserveState: true,
        preserveScroll: true,
      });
    }
  };

  const options = [
    { label: 'Terlama', value: 'asc' },
    { label: 'Terbaru', value: 'desc' },
  ];

  return (
    <div className="relative w-[150px]">
      <Listbox value={order} onChange={handleChange}>
        <div className="relative">
          <Listbox.Button className="w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-left text-sm text-gray-700">
            {options.find((o) => o.value === order)?.label}
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 w-[100px] rounded-lg border border-gray-200 bg-white shadow">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 text-sm ${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  }`
                }
              >
                {option.label}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}

/**
 * BankSoalTable Component -------------------------------------------------
 */
function BankSoalTable({
  data,
  pageFilters,
  selectedSoalIds,
  setSelectedSoalIds,
}: {
  data: PaginatedResponse<Soal>;
  pageFilters: PageFilter;
  selectedSoalIds: number[];
  setSelectedSoalIds: (ids: number[]) => void;
}) {
  const paketSoal = usePage<PageProps>().props.paketSoal;

  const handleChecklistChange = (id: number, checked: boolean) => {
    let newIds: number[];
    if (checked) {
      newIds = [...selectedSoalIds, id];
    } else {
      newIds = selectedSoalIds.filter((sid) => sid !== id);
    }

    setSelectedSoalIds(newIds);

    // Update ke backend jika ada paket yang dipilih
    if (paketSoal) {
      router.put(
        route('master-data.bank-soal-checkbox.update', paketSoal.id_ujian),
        { soal_id: newIds },
        {
          preserveState: true,
          preserveScroll: true,
          onSuccess: () => {
            toast.success('Soal berhasil diperbarui');
          },
          onError: () => {
            toast.error('Gagal menyimpan soal');
          },
        }
      );
    }
  };

  const columns = [
    {
      label: 'No',
      className: 'w-[60px] text-center',
      render: (item: Soal) => {
        const index = data.data.indexOf(item);
        return (
          <div className="text-center">
            {((data.current_page - 1) * data.per_page) + index + 1}
          </div>
        );
      },
    },
    {
      label: 'Soal',
      render: (item: Soal) => (
        <div className="flex max-w-[900px] flex-col gap-2 break-words whitespace-pre-wrap">
          {item.suara && (
            <audio
              controls
              src={`/storage/${item.suara}`}
              className="w-[250px] max-w-full"
            />
          )}
          {renderContentWithBase64(item.header_soal)}
          {renderContentWithBase64(item.body_soal)}
          {renderContentWithBase64(item.footer_soal)}
          <ul className="space-y-2 text-base font-medium">
            {[item.jw_1, item.jw_2, item.jw_3, item.jw_4].map((jw, idx) => {
              const huruf = String.fromCharCode(65 + idx);
              const isCorrect = idx === item.jw_fix;
              return (
                <li
                  key={idx}
                  className={`flex max-w-[900px] ${
                    isCorrect ? 'font-semibold text-green-600' : ''
                  }`}
                >
                  <span className="mr-2 flex-shrink-0">{huruf}.</span>
                  <div className="break-words whitespace-pre-wrap">
                    {renderContentWithBase64(jw)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ),
    },
    {
      label: 'Checklist',
      className: 'w-[100px] text-center',
      render: (item: Soal) => {
        const isSelected = selectedSoalIds.includes(item.ids);
        return (
          <div className="flex h-full w-full items-center justify-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleChecklistChange(item.ids, !isSelected)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
          </div>
        );
      },
    },
  ];

  const navigateToPage = (page: number) => {
    if (paketSoal) {
      router.visit(route('master-data.bank-soal-checkbox.edit', paketSoal.id_ujian), {
        data: {
          page,
          search: pageFilters?.search || '',
          pages: data.per_page,
          order: pageFilters?.order || 'asc',
        },
        preserveState: true,
        preserveScroll: true,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <CustomTable columns={columns} data={data.data} />
      <PaginationWrapper
        currentPage={data.current_page}
        lastPage={data.last_page}
        perPage={data.per_page}
        total={data.total}
        onNavigate={navigateToPage}
      />
    </div>
  );
}

