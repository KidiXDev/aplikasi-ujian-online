import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { ContentTitle } from '@/components/content-title';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { ChevronRight } from 'lucide-react';

interface Ujian {
  id: number;
  tipe: string;
  paket: string;
  tanggal: string;
  mulai: string;
  selesai: string;
  kuota: number;
  status: string;
}

interface JadwalUjian {
  id_ujian: number;
  nama_ujian: string;
  kode_part: string;
  kode_kelas: string;
  id_penjadwalan: number;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface Props {
  ujian: Ujian;
  jadwalUjianList: PaginatedResponse<JadwalUjian>;
  filters: {
    search: string;
    pages: number;
    page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function RekapNilaiPreview({ ujian, jadwalUjianList, filters, flash }: Props) {
  // Breadcrumbs mirip monitoring
  const breadcrumbs = [
    { title: 'Rekap Nilai', href: '/rekap-nilai' },
    { title: 'Preview', href: `/rekap-nilai/${ujian.id}/preview` },
  ];
  useEffect(() => {
    // ...show toast if needed...
  }, [flash]);

  // Default values to prevent undefined errors
  const safeJadwalUjianList = jadwalUjianList ?? { data: [], current_page: 1, per_page: 10, total: 0, last_page: 1 };
  const safeFilters = filters ?? { search: '', pages: 10, page: 1, per_page: 10, total: 0, last_page: 1 };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Preview ${ujian.paket}`} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <ContentTitle
          title="Preview Ujian"
          showButton
          showIcon={false}
          buttonText="Kembali"
          onButtonClick={() => router.visit('/rekap-nilai')}
        />

        {/* Exam Info Card */}
        <div className="bg-card rounded-lg border p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Tipe Ujian</p>
              <p className="text-base font-semibold">{ujian.tipe}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Paket</p>
              <p className="text-base font-semibold">{ujian.paket}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Tanggal</p>
              <p className="text-base font-semibold">{ujian.tanggal}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Waktu</p>
              <p className="text-base font-semibold">{ujian.mulai} - {ujian.selesai}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <EntriesSelector
            currentValue={safeJadwalUjianList.per_page}
            options={[10, 25, 50, 100]}
            routeName="rekap-nilai.preview"
            routeParams={{ id: ujian.id }}
          />
          <SearchInputMenu defaultValue={safeFilters.search} routeName="rekap-nilai.preview" routeParams={{ id: ujian.id }} />
        </div>

        <JadwalUjianTable data={safeJadwalUjianList} ujianId={ujian.id} pageFilters={safeFilters} />
      </div>
    </AppLayout>
  );
}

function JadwalUjianTable({
  data: jadwalUjianList,
  ujianId,
  pageFilters: filters,
}: {
  data: PaginatedResponse<JadwalUjian>;
  ujianId: number;
  pageFilters: Props['filters'];
}) {
  const navigateToPage = (page: number) => {
    router.visit(`/rekap-nilai/${ujianId}/preview`, {
      data: {
        page: page,
        search: filters.search,
        per_page: jadwalUjianList.per_page,
      },
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Tambahkan rowNumber ke setiap jadwal
  const jadwalDataWithRowNumber = (jadwalUjianList.data || []).map((jadwal, idx) => ({
    ...jadwal,
    rowNumber: (jadwalUjianList.current_page - 1) * jadwalUjianList.per_page + idx + 1,
  }));

  const columns = [
    {
      label: 'No',
      className: 'w-[60px] text-center',
      render: (jadwal: JadwalUjian & { rowNumber: number }) => (
        <div className="text-center font-medium">{jadwal.rowNumber}</div>
      ),
    },
    {
      label: 'ID Ujian',
      className: 'w-[120px] text-center',
      render: (jadwal: JadwalUjian) => <div className="text-center font-mono text-sm">{jadwal.id_ujian}</div>,
    },
    {
      label: 'Nama Ujian',
      className: 'flex-1',
      render: (jadwal: JadwalUjian) => <div className="font-medium">{jadwal.nama_ujian || `Ujian ${jadwal.kode_part}`}</div>,
    },
    {
      label: 'Aksi',
      className: 'w-[80px] text-center',
      render: (jadwal: JadwalUjian) => (
        <div className="flex justify-center">
          <Link href={`/rekap-nilai/${jadwal.id_penjadwalan}?exam_id=${jadwal.id_ujian}`}>
            <Button variant="ghost" size="sm">
              <ChevronRight />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <CustomTable columns={columns} data={jadwalDataWithRowNumber} />
      <PaginationWrapper
        currentPage={jadwalUjianList.current_page}
        lastPage={jadwalUjianList.last_page}
        perPage={jadwalUjianList.per_page}
        total={jadwalUjianList.total}
        onNavigate={navigateToPage}
      />
    </div>
  );
}
