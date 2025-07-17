import { ContentTitle } from '@/components/content-title';
import ScoreChart from '@/components/ScoreChart';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { FileDown } from 'lucide-react';
import { useEffect } from 'react';

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
    type StudentWithPenjadwalan = Student & { id_penjadwalan?: number };
    const previewId =
        ujian.id_penjadwalan ??
        (studentData && studentData.data.length > 0 && (studentData.data[0] as StudentWithPenjadwalan).id_penjadwalan) ??
        ujian.id;
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

    const totalStudents = studentStats.total ?? safeStudentData.total;
    const finishedStudents = studentStats.finished ?? 0;
    const absentStudents = studentStats.absent ?? 0;
    const cardAverage = studentStats.average !== null && studentStats.average !== undefined ? studentStats.average : '-';
    const cardMax = studentStats.max !== null && studentStats.max !== undefined ? studentStats.max : '-';
    const cardMin = studentStats.min !== null && studentStats.min !== undefined ? studentStats.min : '-';

    interface StudentWithNilai extends Student {
        score?: number;
    }
    interface StudentStatsWithAll extends StudentStats {
        allStudents?: StudentWithNilai[];
    }
    const statsWithAll = studentStats as StudentStatsWithAll;
    const pesertaScoresGlobal =
        statsWithAll && Array.isArray(statsWithAll.allStudents)
            ? statsWithAll.allStudents.map((s) => ({ nama: s.nama, score: typeof s.nilai === 'number' ? s.nilai : 0 }))
            : safeStudentData.data.map((s) => ({ nama: s.nama, score: typeof s.nilai === 'number' ? s.nilai : 0 }));

    const columns = [
        { label: 'No', className: 'w-[60px] text-center', render: (student: Student) => <div className="text-center font-medium">{student.no}</div> },
        { label: 'Nama', className: 'w-[300px]', render: (student: Student) => student.nama },
        {
            label: 'Jumlah Soal',
            className: 'w-[120px] text-center',
            render: (student: Student) => <div className="text-center">{student.jumlah_soal}</div>,
        },
        {
            label: 'Benar',
            className: 'w-[100px] text-center',
            render: (student: Student) => <div className="text-center">{student.soal_benar ? student.soal_benar : '-'}</div>,
        },
        {
            label: 'Salah',
            className: 'w-[100px] text-center',
            render: (student: Student) => <div className="text-center">{student.soal_salah ? student.soal_salah : '-'}</div>,
        },
        {
            label: 'Nilai',
            className: 'w-[100px] text-center',
            render: (student: Student) => (
                <div className="text-center">{student.nilai === null || student.nilai === undefined ? '0' : student.nilai}</div>
            ),
        },
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
                <div className="mb-6 rounded-lg border bg-white p-6">
                    <div className="mb-4">
                        <div className="text-2xl font-semibold text-gray-800">{ujian.nama_ujian || 'Nama Ujian Tidak Tersedia'}</div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Total Student */}
                        <div className="flex items-center rounded-lg border bg-white p-4">
                            <div className="mr-4 rounded-full bg-blue-100 p-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Student</p>
                                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                            </div>
                        </div>
                        {/* Absent */}
                        <div className="flex items-center rounded-lg border bg-white p-4">
                            <div className="mr-4 rounded-full bg-blue-100 p-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Absent</p>
                                <p className="text-2xl font-bold text-gray-900">{absentStudents}</p>
                            </div>
                        </div>
                        {/* Finished */}
                        <div className="flex items-center rounded-lg border bg-white p-4">
                            <div className="mr-4 rounded-full bg-blue-100 p-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Finished</p>
                                <p className="text-2xl font-bold text-gray-900">{finishedStudents}</p>
                            </div>
                        </div>
                        {/* Rata-rata */}
                        <div className="flex items-center rounded-lg border bg-white p-4">
                            <div className="mr-4 rounded-full bg-blue-100 p-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rata-rata</p>
                                <p className="text-2xl font-bold text-gray-900">{cardAverage}</p>
                            </div>
                        </div>
                        {/* Nilai Tertinggi */}
                        <div className="flex items-center rounded-lg border bg-white p-4">
                            <div className="mr-4 rounded-full bg-blue-100 p-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Nilai Tertinggi</p>
                                <p className="text-2xl font-bold text-gray-900">{cardMax}</p>
                            </div>
                        </div>
                        {/* Nilai Terendah */}
                        <div className="flex items-center rounded-lg border bg-white p-4">
                            <div className="mr-4 rounded-full bg-blue-100 p-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-blue-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Nilai Terendah</p>
                                <p className="text-2xl font-bold text-gray-900">{cardMin}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tulisan di atas tabel */}
                <div className="mt-6 mb-2 text-xl font-semibold">Grafik Rekap Nilai</div>

                {/* Chart Nilai Peserta */}
                {/* Pastikan chart menerima seluruh data peserta, bukan data paginated */}
                <ScoreChart pesertaScores={pesertaScoresGlobal} />

                {/* Tombol Ekspor Data */}
                <div className="mt-6 mb-2 text-xl font-semibold">Data Peserta</div>
                {/* Tulisan di atas tabel */}

                <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center">
                        <EntriesSelector
                            currentValue={safeStudentData.perPage}
                            options={[10, 25, 50, 100]}
                            routeName="rekap.nilai.detail"
                            routeParams={{ id: ujian.id_penjadwalan ?? ujian.id, exam_id: ujian.id }}
                            paramName="studentEntriesPerPage"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center rounded bg-green-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-green-700"
                        >
                            <FileDown className="mr-2 h-4 w-4" />
                            <span className="flex items-center">Export Excel</span>
                        </button>
                        <SearchInputMenu
                            defaultValue={safeFilters.search}
                            routeName="rekap.nilai.detail"
                            routeParams={{ id: ujian.id_penjadwalan ?? ujian.id, exam_id: ujian.id }}
                        />
                    </div>
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
