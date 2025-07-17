import { ContentTitle } from '@/components/content-title';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import ScoreChart from '@/components/ScoreChart';

interface Student {
  no: number;
  nama: string;
  jumlah_soal: number;
  soal_benar: number;
  soal_salah: number;
  nilai: number;
  benar?: string;
  status?: 'active' | 'finish' | 'not_started'; // for parity with Monitoring, optional
}

interface UjianDetail {
  id: number;
  nama_ujian: string;
  id_penjadwalan?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
}

interface StudentStats {
  total: number;
  finished: number;
  absent: number;
  average: number | string | null;
  max: number | string | null;
  min: number | string | null;
}

interface Props {
  ujian: UjianDetail;
  studentData: PaginatedResponse<Student>;
  studentStats?: StudentStats;
  filters: {
    search: string;
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const defaultStats: StudentStats = {
  total: 0,
  finished: 0,
  absent: 0,
  average: '-',
  max: '-',
  min: '-',
};
export default function RekapNilaiStudentDetail({ ujian, studentData, studentStats = defaultStats, filters, flash }: Props) {
  // Handler for changing page size (perPage)
  // const handleChangeEntries = (newPerPage: number) => {
  //   router.visit(window.location.pathname, {
  //     data: {
  //       page: 1,
  //       search: safeFilters.search,
  //       studentEntriesPerPage: newPerPage,
  //       exam_id: ujian.id,
  //     },
  //     preserveState: true,
  //     preserveScroll: true,
  //   });
  // };
  // Breadcrumbs mirip monitoring, pastikan pakai id_penjadwalan jika tersedia
  // Breadcrumbs mirip monitoring, agar bisa kembali ke preview yang sesuai
  // Gunakan id_penjadwalan jika tersedia, agar breadcrumbs Preview selalu benar
  // Breadcrumbs Preview harus pakai id_penjadwalan jika tersedia
  // Breadcrumbs Preview harus pakai id_penjadwalan yang valid dari studentData jika props ujian tidak punya
  type StudentWithPenjadwalan = Student & { id_penjadwalan?: number };
  const previewId = ujian.id_penjadwalan
    ?? (studentData && studentData.data.length > 0 && (studentData.data[0] as StudentWithPenjadwalan).id_penjadwalan)
    ?? ujian.id;
  const breadcrumbs = [
    {
      title: 'Rekap Nilai',
      href: '/rekap-nilai',
    },
    {
      title: 'Preview',
      href: `/rekap-nilai/${previewId}/preview`,
    },
    {
      title: 'Detail',
      href: '#',
    },
  ];
  // Fungsi untuk ekspor data sesuai exam_id dan id_penjadwalan
  const handleExport = () => {
    // Pastikan URL sesuai backend: /rekap-nilai/{id_penjadwalan}/export?exam_id={id_ujian}&search=...
    const idPenjadwalan = ujian.id_penjadwalan ?? ujian.id;
    const examId = ujian.id;
    const searchParam = safeFilters.search ? `&search=${encodeURIComponent(safeFilters.search)}` : '';
    window.open(`/rekap-nilai/${idPenjadwalan}/export?exam_id=${examId}${searchParam}`, '_blank');
  };
  useEffect(() => {
    // ...show toast if needed...
  }, [flash]);

  const safeStudentData = studentData ?? { data: [], currentPage: 1, perPage: 10, total: 0, lastPage: 1 };
  const safeFilters = filters ?? { search: '', page: 1, perPage: 10, total: 0, lastPage: 1 };

  // Statistik global langsung dari props
  const totalStudents = studentStats.total ?? safeStudentData.total;
  const finishedStudents = studentStats.finished ?? 0;
  const absentStudents = studentStats.absent ?? 0;
  const cardAverage = studentStats.average !== null && studentStats.average !== undefined ? studentStats.average : '-';
  const cardMax = studentStats.max !== null && studentStats.max !== undefined ? studentStats.max : '-';
  const cardMin = studentStats.min !== null && studentStats.min !== undefined ? studentStats.min : '-';

  // Ambil seluruh data peserta dari backend (bukan data paginated)
  // Asumsikan backend sudah mengirimkan array global seluruh peserta di studentStats (atau bisa ditambah prop baru jika perlu)
  // Jika belum ada, tambahkan prop baru misal: allStudents: Student[]
  // Untuk patch ini, gunakan studentStats.allStudents jika tersedia, fallback ke studentData.data
  interface StudentWithNilai extends Student {
    score?: number;
  }
  interface StudentStatsWithAll extends StudentStats {
    allStudents?: StudentWithNilai[];
  }
  const statsWithAll = studentStats as StudentStatsWithAll;
  const pesertaScoresGlobal = (statsWithAll && Array.isArray(statsWithAll.allStudents))
    ? statsWithAll.allStudents.map((s) => ({ nama: s.nama, score: typeof s.nilai === 'number' ? s.nilai : 0 }))
    : safeStudentData.data.map(s => ({ nama: s.nama, score: typeof s.nilai === 'number' ? s.nilai : 0 }));

  const columns = [
    { label: 'No', className: 'w-[60px] text-center', render: (student: Student) => <div className="text-center font-medium">{student.no}</div> },
    { label: 'Nama', className: 'w-[300px]', render: (student: Student) => student.nama },
    { label: 'Jumlah Soal', className: 'w-[120px] text-center', render: (student: Student) => <div className="text-center">{student.jumlah_soal}</div> },
    { label: 'Benar', className: 'w-[100px] text-center', render: (student: Student) => <div className="text-center">{student.soal_benar}</div> },
    { label: 'Salah', className: 'w-[100px] text-center', render: (student: Student) => <div className="text-center">{student.soal_salah}</div> },
    { label: 'Nilai', className: 'w-[100px] text-center', render: (student: Student) => <div className="text-center">{student.nilai === null || student.nilai === undefined ? '-' : student.nilai}</div> },
  ];

  const navigateToPage = (page: number) => {
    router.visit(window.location.pathname, {
      data: {
        page: page,
        search: safeFilters.search,
        studentEntriesPerPage: safeStudentData.perPage,
        exam_id: ujian.id, // pastikan exam_id selalu dikirim
      },
      preserveState: true,
      preserveScroll: true,
    });
  };
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Detail Ujian - ${ujian.nama_ujian}`} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <ContentTitle
          title={`Detail Ujian `}
          showButton
          showIcon={false}
          buttonText="Kembali"
          onButtonClick={() => router.visit(`/rekap-nilai/${previewId}/preview`)}
        />

        {/* Stats Cards (with CardHeader like Monitoring) */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="mb-4">
            <div className="text-2xl font-semibold text-gray-800">{ujian.nama_ujian || 'Nama Ujian Tidak Tersedia'}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Student */}
            <div className="bg-white border rounded-lg p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Student</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
            </div>
            {/* Absent */}
            <div className="bg-white border rounded-lg p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Absent</p>
                <p className="text-2xl font-bold text-gray-900">{absentStudents}</p>
              </div>
            </div>
            {/* Finished */}
            <div className="bg-white border rounded-lg p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Finished</p>
                <p className="text-2xl font-bold text-gray-900">{finishedStudents}</p>
              </div>
            </div>
            {/* Rata-rata */}
            <div className="bg-white border rounded-lg p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Rata-rata</p>
                <p className="text-2xl font-bold text-gray-900">{cardAverage}</p>
              </div>
            </div>
            {/* Nilai Tertinggi */}
            <div className="bg-white border rounded-lg p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Nilai Tertinggi</p>
                <p className="text-2xl font-bold text-gray-900">{cardMax}</p>
              </div>
            </div>
            {/* Nilai Terendah */}
            <div className="bg-white border rounded-lg p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Nilai Terendah</p>
                <p className="text-2xl font-bold text-gray-900">{cardMin}</p>
              </div>
            </div>
          </div>
        </div>

{/* Tulisan di atas tabel */}
        <div className="font-semibold text-xl mb-2 mt-6">Grafik Rekap Nilai</div>

        {/* Chart Nilai Peserta */}
        {/* Pastikan chart menerima seluruh data peserta, bukan data paginated */}
        <ScoreChart pesertaScores={pesertaScoresGlobal} />

        
        {/* Tombol Ekspor Data */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
          >
            Export Excel
          </button>
        </div>
{/* Tulisan di atas tabel */}
        <div className="font-semibold text-xl mb-2 mt-6">Data Peserta</div>

        <div className="mt-4 flex items-center justify-between">
          <EntriesSelector
            currentValue={safeStudentData.perPage}
            options={[10, 25, 50, 100]}
            routeName="rekap.nilai.detail"
            routeParams={{ id: ujian.id_penjadwalan ?? ujian.id, exam_id: ujian.id }}
            paramName="studentEntriesPerPage"
          />
          <SearchInputMenu defaultValue={safeFilters.search} routeName="rekap.nilai.detail" routeParams={{ id: ujian.id_penjadwalan ?? ujian.id, exam_id: ujian.id }} />
        </div>
        <CustomTable columns={columns} data={safeStudentData.data} />
        <PaginationWrapper
          currentPage={safeStudentData.currentPage}
          lastPage={safeStudentData.lastPage}
          perPage={safeStudentData.perPage}
          total={safeStudentData.total}
          onNavigate={navigateToPage}
        />
      </div>
    </AppLayout>
  );
}
