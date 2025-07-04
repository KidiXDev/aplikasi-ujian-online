import React, { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import AppLayout from "@/layouts/app-layout";
import { ContentTitle } from "@/components/content-title";
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScoreChart from '@/components/ScoreChart';

// Helper function for safe string comparison
const safeIncludes = (value: string | null | undefined, searchTerm: string): boolean => {
  if (!value) return false;
  return value.toLowerCase().includes(searchTerm.toLowerCase());
};

interface Ujian {
  id?: number;
  tipe: string;
  paket: string;
  tanggal: string;
  mulai: string;
  selesai: string;
  kuota: number;
  status: string;
}

interface Student {
  no: number;
  nama: string;
  jumlah_soal: number;
  soal_benar: number;
  soal_salah: number;
  nilai: number;
}

interface Props {
  initialData: {
    data: Ujian[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  filters: {
    search: string;
    pages: number;
  };
}

interface AverageScores {
  benar: number;
  salah: number;
  score: number;
}

const RekapNilai: React.FC<Props> = ({ initialData, filters }) => {
  const [data, setData] = useState<Ujian[]>(initialData.data);  const [currentPage, setCurrentPage] = useState<number>(initialData.current_page);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(initialData.per_page);
  const [searchTerm] = useState<string>(filters.search);
  const [selectedUjian, setSelectedUjian] = useState<Ujian | null>(null);
  const [studentData, setStudentData] = useState<Student[]>([]);
  // Tambahkan state untuk menyimpan semua data siswa
  const [allStudentData, setAllStudentData] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [absentStudents, setAbsentStudents] = useState<number>(0);
  const [finishedStudents, setFinishedStudents] = useState<number>(0);
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>("");
  const [studentSearchInput, setStudentSearchInput] = useState<string>("");
  const [studentEntriesPerPage, setStudentEntriesPerPage] = useState<number>(10);
  const [studentCurrentPage, setStudentCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number>(1);
  // State untuk menyimpan statistik global (tidak berubah saat search)
  const [globalAverageScores, setGlobalAverageScores] = useState<AverageScores>({ benar: 0, salah: 0, score: 0 });
  const [globalMaxScore, setGlobalMaxScore] = useState<number>(0);
  const [globalMinScore, setGlobalMinScore] = useState<number>(0);

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData.data);
    setCurrentPage(initialData.current_page);
    setEntriesPerPage(initialData.per_page);
  }, [initialData]);

  // Load student data when a test is selected
  useEffect(() => {
    if (selectedUjian?.id) {
      const fetchStudentData = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`/rekap-nilai/${selectedUjian.id}`, {
            params: {
              search: studentSearchTerm,
              studentEntriesPerPage,
              page: studentCurrentPage,
            }
          });
          const { studentData, pagination, stats, allStudentData: allDataFromBackend } = response.data;
          if (studentData) {
            setStudentData(studentData);
            setTotalRecords(pagination.total);
            setLastPage(pagination.lastPage);
            setStudentCurrentPage(pagination.currentPage);
            setStudentEntriesPerPage(pagination.perPage);
          }
          // Simpan semua data siswa (pastikan backend mengirim allStudentData)
          if (allDataFromBackend) {
            setAllStudentData(allDataFromBackend);
          } else {
            setAllStudentData(studentData || []);
          }
          if (stats) {
            setTotalStudents(stats.totalStudents);
            setAbsentStudents(stats.absentStudents);
            setFinishedStudents(stats.finishedStudents);
            // Jika tidak sedang search, update statistik global dan card
            if (!studentSearchTerm) {
              setGlobalAverageScores(stats.averageScores);
              setGlobalMaxScore(stats.maxScore);
              setGlobalMinScore(stats.minScore);
            }
            // Jika sedang search, statistik card tetap pakai global (tidak perlu set state lain)
          }
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          console.error('Error fetching student data:', error);
          setError(err.response?.data?.message || 'Failed to load student data. Please try again.');
          setStudentData([]);
          setTotalRecords(0);
          setLastPage(1);
          setAllStudentData([]);
        } finally {
          setLoading(false);
        }
      };
      fetchStudentData();
    } else {
      // Reset student data when no exam is selected
      setStudentData([]);
      setTotalStudents(0);
      setAbsentStudents(0);
      setFinishedStudents(0);
      setTotalRecords(0);
      setLastPage(1);
      setGlobalAverageScores({ benar: 0, salah: 0, score: 0 });
      setGlobalMaxScore(0);
      setGlobalMinScore(0);
      setAllStudentData([]);
    }
  // Hapus globalAverageScores, globalMaxScore, globalMinScore dari dependency array
  }, [selectedUjian?.id, studentSearchTerm, studentEntriesPerPage, studentCurrentPage]);

  // Filter data based on search term
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    return (
      safeIncludes(item.tipe, searchTerm) ||
      safeIncludes(item.paket, searchTerm) ||
      (item.tanggal || '').includes(searchTerm) ||
      safeIncludes(item.status, searchTerm)
    );
  });

  // Pagination logic for main data
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);
  // Navigation handlers
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const paginateStudents = (pageNumber: number) => {
    setStudentCurrentPage(pageNumber);
  };
  // Entries per page handlers
  const handleStudentEntriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStudentEntriesPerPage(parseInt(e.target.value));
    setStudentCurrentPage(1);
  };

  const handleStudentSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentSearchInput(e.target.value);
  };

  const handleStudentSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setStudentSearchTerm(studentSearchInput);
      setStudentCurrentPage(1);
    }
  };

  // Action handlers
  const handleActionClick = (ujian: Ujian) => {
    setSelectedUjian(ujian);
  };

  const handleBackToList = () => {
    setSelectedUjian(null);
  };

  const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    const selected = data.find(ujian => ujian.id === selectedId);
    if (selected) {
      setSelectedUjian(selected);
    }
  };

  // Filter student data based on search
  const filteredStudentData = studentData.filter(student => {
    if (!studentSearchTerm) return true;
    return safeIncludes(student.nama, studentSearchTerm);
  });

  // Update student table content section
  const renderStudentTable = () => {
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Soal</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Soal Benar</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Soal Salah</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredStudentData.map((student) => {
            return (
              <tr key={student.no} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">{student.no}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.nama}</td>
                <td className="px-4 py-3 text-sm text-center">{student.jumlah_soal}</td>
                <td className="px-4 py-3 text-sm text-center text-green-600">{student.soal_benar}</td>
                <td className="px-4 py-3 text-sm text-center text-red-600">{student.soal_salah}</td>
                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">{student.nilai}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <AppLayout>
      <Head title="Rekap Nilai" />
      <div className="p-6 bg-gray-50 min-h-screen">
        {selectedUjian ? (
          // Detail View (Student Results)
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Rekap Nilai</h1>
                <div className="mt-4">
                  <h2 className="text-sm font-medium text-gray-600 mb-2">Pilih Ujian</h2>
                  <div className="inline-block relative w-64">
                    <select 
                      className="block appearance-none w-full bg-white border border-gray-300 px-4 py-2 pr-8 rounded-lg shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      value={selectedUjian.id}
                      onChange={handleExamChange}
                    >
                      {data.map(ujian => (
                        <option key={ujian.id} value={ujian.id}>
                          {`${ujian.paket} - ${ujian.tanggal}`}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleBackToList}
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 shadow-sm flex items-center gap-2 text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
              </button>
            </div>

            {/* Stats Cards */}
            <div className="bg-gradient-to-b from-blue-50 to-white rounded-lg border p-6 mb-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{`${selectedUjian.paket}`}</h2>
                  <p className="text-sm text-gray-600 mt-1">{`Tanggal: ${selectedUjian.tanggal}`}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  selectedUjian.status === 'Finished' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedUjian.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedUjian.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Student</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-yellow-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Absent</p>
                    <p className="text-2xl font-bold text-gray-900">{absentStudents}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Finished</p>
                    <p className="text-2xl font-bold text-gray-900">{finishedStudents}</p>
                  </div>
                </div>
              </div>
              {/* Statistik Nilai */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Card Rata-rata Nilai */}
              <div className="bg-purple-50 rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20v-6m0 0V4m0 10l-3-3m3 3l3-3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Rata-rata Nilai</p>
                  <p className="text-2xl font-bold text-gray-900">{globalAverageScores.score}</p>
                </div>
              </div>
              {/* Card Nilai Tertinggi */}
              <div className="bg-orange-50 rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-orange-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l5 5L20 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Nilai Tertinggi</p>
                  <p className="text-2xl font-bold text-gray-900">{globalMaxScore}</p>
                </div>
              </div>
              {/* Card Nilai Terendah */}
              <div className="bg-red-50 rounded-lg p-4 flex items-center shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12l-7 7-7-7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Nilai Terendah</p>
                  <p className="text-2xl font-bold text-gray-900">{globalMinScore}</p>
                </div>
              </div>
            </div>

            </div>

            {/* Score Chart */}
            <div className="bg-white rounded-lg border shadow-sm mb-6">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-800">Grafik Rekap Nilai</h3>
              </div>
              <div className="px-6 py-4">
                {/* Kirim seluruh data siswa ke ScoreChart */}
                <ScoreChart pesertaScores={allStudentData.map(s => ({ nama: s.nama, score: s.nilai }))} />
              </div>
            </div>

            
            {/* Student Results Table */}            <div className="bg-white rounded-lg border shadow-sm">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Tabel Siswa</h3>
                <a
                  href={`/rekap-nilai/${selectedUjian.id}/export`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  Export to Excel
                </a>
              </div>

              {error && (
                <div className="mx-6 mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 gap-4 border-b">
                <div className="text-sm w-full sm:w-auto flex items-center gap-2">
                  <span className="text-gray-600">Show</span>
                  <select 
                    className="border px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                    value={studentEntriesPerPage}
                    onChange={handleStudentEntriesChange}
                    disabled={loading}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-gray-600">entries</span>
                </div>

                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search student..."
                    className="border pl-10 pr-4 py-2 rounded-lg text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                    value={studentSearchInput}
                    onChange={handleStudentSearch}
                    onKeyDown={handleStudentSearchKeyDown}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="px-6 py-4 overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  renderStudentTable()
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{studentData.length ? (studentCurrentPage - 1) * studentEntriesPerPage + 1 : 0}</span> to{' '}
                  <span className="font-medium">{(studentCurrentPage - 1) * studentEntriesPerPage + studentData.length}</span> of{' '}
                  <span className="font-medium">{totalRecords}</span> results
                </div>

                <div className="inline-flex mt-4 sm:mt-0">
                  <button
                    onClick={() => studentCurrentPage > 1 && paginateStudents(studentCurrentPage - 1)}
                    disabled={studentCurrentPage === 1 || loading}
                    className={`relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium ${
                      studentCurrentPage === 1 || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => studentCurrentPage < lastPage && paginateStudents(studentCurrentPage + 1)}
                    disabled={studentCurrentPage === lastPage || loading}
                    className={`relative inline-flex items-center px-4 py-2 rounded-r-md border-t border-r border-b text-sm font-medium ${
                      studentCurrentPage === lastPage || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // List View
          <>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <ContentTitle title="Rekap Nilai" showButton={false} />
              </div>

              <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <EntriesSelector 
                  currentValue={entriesPerPage} 
                  options={[10, 25, 50]} 
                  routeName="rekap-nilai" 
                />
                <SearchInputMenu 
                  defaultValue={searchTerm} 
                  routeName="rekap-nilai"
                />
              </div>

              <div className="flex flex-col gap-4">
                <CustomTable
                  columns={[
                    {
                      label: 'Tipe Ujian',
                      className: 'w-[150px]',
                      render: (item: Ujian) => item.tipe,
                    },
                    {
                      label: 'Paket Ujian',
                      className: 'w-[200px]',
                      render: (item: Ujian) => item.paket,
                    },
                    {
                      label: 'Tanggal',
                      className: 'w-[150px] text-center',
                      render: (item: Ujian) => item.tanggal,
                    },
                    {
                      label: 'Mulai',
                      className: 'w-[100px] text-center',
                      render: (item: Ujian) => item.mulai,
                    },
                    {
                      label: 'Selesai',
                      className: 'w-[100px] text-center',
                      render: (item: Ujian) => item.selesai,
                    },
                    {
                      label: 'Kuota',
                      className: 'w-[80px] text-center',
                      render: (item: Ujian) => item.kuota,
                    },
                    {
                      label: 'Status',
                      className: 'w-[100px] text-center',
                      render: (item: Ujian) => (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'Finished'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      ),
                    },
                    {
                      label: 'Action',
                      className: 'w-[80px] text-center',
                      render: (item: Ujian) => (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActionClick(item)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      ),
                    },
                  ]}
                  data={currentEntries}
                />

                <PaginationWrapper
                  currentPage={currentPage}
                  lastPage={Math.ceil(filteredData.length / entriesPerPage)}
                  perPage={entriesPerPage}
                  total={filteredData.length}
                  onNavigate={paginate}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default RekapNilai;