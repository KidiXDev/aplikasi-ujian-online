import { ContentTitle } from '@/components/content-title';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { PageFilter, PaginatedResponse } from '@/types';
import { Head, router } from '@inertiajs/react';
import { RotateCcw, Trash2, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { StatusFilter } from '@/components/ui/status-filter';
import { usePolling } from '@/hooks/use-polling';
import { Seconds } from '@/lib/calculator';

interface Ujian {
    id: number;
    tipe_ujian: string;
    paket_ujian: string;
    nama_ujian?: string;
    kelas_prodi: string;
    tanggal_ujian: string;
    mulai: string;
    selesai: string;
    kuota: number;
    tipe: string;
}

interface Student {
    id: number;
    id_pengerjaan: number | null;
    name: string;
    completedQuestions: number;
    totalQuestions: number;
    status: 'active' | 'finish' | 'not_started';
    nilai?: number;
}

interface Stats {
    total_students: number;
    active_students: number;
    finished_students: number;
}

interface Props {
    ujian: Ujian;
    studentsData: PaginatedResponse<Student>;
    stats: Stats;
    filters: PageFilter;
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: {
        error?: string;
    };
}

export default function Detail({ ujian, studentsData, stats, filters, flash, errors }: Props) {
    const toastShown = useRef<{
        success?: { message: string; timestamp: number };
        error?: { message: string; timestamp: number };
        validationError?: { message: string; timestamp: number };
    }>({});

    useEffect(() => {
        const currentTime = Date.now();
        const TOAST_COOLDOWN = 10000; // 10 seconds cooldown to prevent spam from polling

        // Only show success toast if it's a new message or enough time has passed since last toast
        if (flash?.success) {
            const lastSuccess = toastShown.current.success;
            const shouldShow = !lastSuccess || lastSuccess.message !== flash.success || currentTime - lastSuccess.timestamp > TOAST_COOLDOWN;

            if (shouldShow) {
                toast.success(flash.success);
                toastShown.current.success = { message: flash.success, timestamp: currentTime };
            }
        }

        // Only show flash error toast if it's a new message or enough time has passed since last toast
        if (flash?.error) {
            const lastError = toastShown.current.error;
            const shouldShow = !lastError || lastError.message !== flash.error || currentTime - lastError.timestamp > TOAST_COOLDOWN;

            if (shouldShow) {
                toast.error(flash.error);
                toastShown.current.error = { message: flash.error, timestamp: currentTime };
            }
        }

        // Only show validation error toast if it's a new message or enough time has passed since last toast
        if (errors?.error) {
            const lastValidationError = toastShown.current.validationError;
            const shouldShow =
                !lastValidationError || lastValidationError.message !== errors.error || currentTime - lastValidationError.timestamp > TOAST_COOLDOWN;

            if (shouldShow) {
                toast.error(errors.error);
                toastShown.current.validationError = { message: errors.error, timestamp: currentTime };
            }
        }
    }, [flash, errors]);

    // Clear toast tracking when component unmounts
    useEffect(() => {
        return () => {
            toastShown.current = {};
        };
    }, []);

    // Get exam_id from filters (passed from backend)
    const examId = filters.exam_id;

    // Polling for updates every 5 seconds
    usePolling({
        interval: Seconds(5),
        onlyKeys: ['studentsData', 'stats'],
        key: ujian.id,
    });

    // Handle reset participant
    const handleResetParticipant = (studentId: number, studentName: string, idPengerjaan: number | null) => {
        if (!idPengerjaan) {
            toast.error('Pengerjaan ID is required');
            return;
        }

        router.post(
            route('monitoring.ujian.reset', ujian.id),
            {
                id_pengerjaan: idPengerjaan,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Show success toast immediately and track it
                    const currentTime = Date.now();
                    toast.success('Participant exam submission status has been reset successfully');
                    toastShown.current.success = {
                        message: 'Participant exam submission status has been reset successfully',
                        timestamp: currentTime,
                    };
                },
                onError: (errors) => {
                    // Handle validation errors from Laravel
                    const errorMessage = errors.error || 'Failed to reset participant progress';
                    toast.error(errorMessage);
                },
            },
        );
    };

    // Handle delete participant
    const handleDeleteParticipant = (studentId: number, studentName: string, idPengerjaan: number | null) => {
        if (!idPengerjaan) {
            toast.error('Pengerjaan ID is required');
            return;
        }

        router.post(
            route('monitoring.ujian.delete', ujian.id),
            {
                id_pengerjaan: idPengerjaan,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Show success toast immediately and track it
                    const currentTime = Date.now();
                    toast.success('Participant exam progress has been deleted successfully');
                    toastShown.current.success = {
                        message: 'Participant exam progress has been deleted successfully',
                        timestamp: currentTime,
                    };
                },
                onError: (errors) => {
                    // Handle validation errors from Laravel
                    const errorMessage = errors.error || 'Failed to delete participant progress';
                    toast.error(errorMessage);
                },
            },
        );
    };

    const breadcrumbs = [
        {
            title: 'Monitoring Ujian',
            href: '/monitoring-ujian',
        },
        {
            title: 'Preview',
            href: `/monitoring-ujian/${ujian.id}/preview`,
        },
        {
            title: 'Detail',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail ${ujian.nama_ujian || 'Ujian'}`} />

            <div className="flex flex-col gap-4 p-4">
                <ContentTitle
                    title="Detail Ujian"
                    showButton
                    showIcon={false}
                    buttonText="Kembali"
                    onButtonClick={() => router.visit(route('monitoring.ujian.preview', ujian.id))}
                />
                <Card className="flex flex-col gap-4 p-4">
                    <CardHeader>
                        <CardTitle className="text-2xl">{ujian.nama_ujian || 'Nama Ujian Tidak Tersedia'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full gap-2">
                            <StatCard title="Total" value={stats.total_students.toString()} />
                            <StatCard title="Active" value={stats.active_students.toString()} />
                            <StatCard title="Finished" value={stats.finished_students.toString()} />
                            <StatCard
                                title="Not Started"
                                value={(stats.total_students - stats.active_students - stats.finished_students).toString()}
                            />
                        </div>
                    </CardContent>
                    <CardFooter />
                </Card>
                <div className="mt-4">
                    <div className="mb-4 flex items-center justify-between">
                        <EntriesSelector
                            currentValue={studentsData.per_page}
                            options={[10, 25, 50, 100]}
                            routeName="monitoring.ujian.detail"
                            routeParams={{ id: ujian.id, ...(examId && { exam_id: examId }) }}
                        />
                        <div className="flex items-center gap-4">
                            <StatusFilter
                                currentValue={filters.status}
                                routeName="monitoring.ujian.detail"
                                routeParams={{ id: ujian.id, ...(examId && { exam_id: examId }) }}
                            />
                            <SearchInputMenu
                                defaultValue={filters.search}
                                routeName="monitoring.ujian.detail"
                                routeParams={{ id: ujian.id, ...(examId && { exam_id: examId }) }}
                            />
                        </div>
                    </div>
                    {studentsData && studentsData.data && studentsData.data.length > 0 ? (
                        <StudentTable
                            data={studentsData}
                            ujianId={ujian.id}
                            pageFilters={filters}
                            onResetParticipant={handleResetParticipant}
                            onDeleteParticipant={handleDeleteParticipant}
                        />
                    ) : (
                        <div className="mt-4 text-center text-gray-500">No Participants took the exam</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

// Status badge component
const StatusBadge: React.FC<{ status: 'active' | 'finish' | 'not_started' }> = ({ status }) => {
    switch (status) {
        case 'active':
            return <span className="rounded bg-green-500 p-2 text-white shadow">Active</span>;
        case 'finish':
            return <span className="rounded bg-blue-500 p-2 text-white shadow">Finish</span>;
        case 'not_started':
            return <span className="rounded bg-gray-500 p-2 text-white shadow">Not Started</span>;
        default:
            return <span className="rounded bg-gray-500 p-2 text-white shadow">{status}</span>;
    }
};

function StudentTable({
    data: studentsData,
    ujianId,
    pageFilters: filters,
    onResetParticipant,
    onDeleteParticipant,
}: {
    data: PaginatedResponse<Student>;
    ujianId: number;
    pageFilters: PageFilter;
    onResetParticipant: (studentId: number, studentName: string, idPengerjaan: number | null) => void;
    onDeleteParticipant: (studentId: number, studentName: string, idPengerjaan: number | null) => void;
}) {
    // Get exam_id from filters (passed from backend)
    const examId = filters.exam_id;
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<{ id: number; name: string; id_pengerjaan: number | null } | null>(null);

    // Helper function to navigate with preserved search parameters
    const navigateToPage = (page: number) => {
        router.visit(route('monitoring.ujian.detail', ujianId), {
            data: {
                page: page,
                search: filters.search,
                status: filters.status,
                pages: studentsData.per_page,
                exam_id: examId, // Preserve exam_id parameter
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle reset participant - now calls the parent function
    const handleResetParticipant = () => {
        if (!selectedStudent || !selectedStudent.id_pengerjaan) {
            toast.error('Pengerjaan ID is required');
            return;
        }

        onResetParticipant(selectedStudent.id, selectedStudent.name, selectedStudent.id_pengerjaan);
        setResetDialogOpen(false);
        setSelectedStudent(null);
    };

    // Handle delete participant - now calls the parent function
    const handleDeleteParticipant = () => {
        if (!selectedStudent || !selectedStudent.id_pengerjaan) {
            toast.error('Pengerjaan ID is required');
            return;
        }

        onDeleteParticipant(selectedStudent.id, selectedStudent.name, selectedStudent.id_pengerjaan);
        setDeleteDialogOpen(false);
        setSelectedStudent(null);
    };

    // Open reset dialog
    const openResetDialog = (studentId: number, studentName: string, idPengerjaan: number | null) => {
        setSelectedStudent({ id: studentId, name: studentName, id_pengerjaan: idPengerjaan });
        setResetDialogOpen(true);
    };

    // Open delete dialog
    const openDeleteDialog = (studentId: number, studentName: string, idPengerjaan: number | null) => {
        setSelectedStudent({ id: studentId, name: studentName, id_pengerjaan: idPengerjaan });
        setDeleteDialogOpen(true);
    };

    const columns = [
        {
            label: 'No',
            className: 'w-[60px] text-center',
            render: (student: Student) => {
                const index = studentsData.data.findIndex((s) => s.id === student.id);
                const rowNumber = (studentsData.current_page - 1) * studentsData.per_page + index + 1;
                return <div className="text-center font-medium">{rowNumber}</div>;
            },
        },
        {
            label: 'Id',
            className: 'w-[80px] text-center',
            render: (student: Student) => {
                return <div className="text-center font-medium">{student.id_pengerjaan || '-'}</div>;
            },
        },
        {
            label: 'Nama',
            className: 'w-[300px]',
            render: (student: Student) => student.name,
        },
        {
            label: 'Soal',
            className: 'w-[150px]',
            render: (student: Student) => `${student.completedQuestions}/${student.totalQuestions}`,
        },
        {
            label: 'Status',
            className: 'w-[150px]',
            render: (student: Student) => <StatusBadge status={student.status} />,
        },
        {
            label: 'Action',
            className: 'w-[100px] text-center',
            render: (student: Student) => (
                <div className="flex justify-center gap-4">
                    <CButtonIcon
                        icon={RotateCcw}
                        type="danger"
                        className={student.status === 'finish' ? '' : 'cursor-not-allowed opacity-50'}
                        onClick={() => {
                            if (student.status === 'finish') {
                                openResetDialog(student.id, student.name, student.id_pengerjaan);
                            } else {
                                toast.info('Reset is only available for participants who have finished the exam');
                            }
                        }}
                    />
                    <CButtonIcon
                        icon={Trash2}
                        type="danger"
                        className={student.id_pengerjaan ? '' : 'cursor-not-allowed opacity-50'}
                        onClick={() => {
                            if (student.id_pengerjaan) {
                                openDeleteDialog(student.id, student.name, student.id_pengerjaan);
                            } else {
                                toast.info('Delete is only available for participants who have started the exam');
                            }
                        }}
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex flex-col gap-4">
                <CustomTable columns={columns} data={studentsData.data} />

                <PaginationWrapper
                    currentPage={studentsData.current_page}
                    lastPage={studentsData.last_page}
                    perPage={studentsData.per_page}
                    total={studentsData.total}
                    onNavigate={navigateToPage}
                />
            </div>

            {/* Reset Confirmation Dialog */}
            <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Undo Exam Submission</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reset the submission status for <strong>{selectedStudent?.name}</strong>? Their answers will
                            remain intact, but their scores will be cleared.
                            <br /> <br />
                            <span className="font-semibold text-red-600">This action cannot be undone.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedStudent(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetParticipant} className="bg-red-600 hover:bg-red-700">
                            <TriangleAlert className="h-4 w-4" />
                            Reset Progress
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Participant Progress</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the exam progress for <strong>{selectedStudent?.name}</strong>? This action will clear
                            submission scoring data and remove all answers for this exam.
                            <br /> <br />
                            <span className="font-semibold text-red-600">This action cannot be undone.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedStudent(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteParticipant} className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="h-4 w-4" />
                            Delete Progress
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
