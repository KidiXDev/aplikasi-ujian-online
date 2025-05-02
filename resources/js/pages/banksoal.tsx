import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { CAlertDialog } from '@/components/c-alert-dialog';
import { ContentTitle } from '@/components/content-title';
import { CButtonIcon } from '@/components/ui/c-button';
import { CustomTable } from '@/components/ui/c-table';
import { EntriesSelector } from '@/components/ui/entries-selector';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { SearchInputMenu } from '@/components/ui/search-input-menu';
import { useState } from 'react';

interface BreadcrumbItem {
    title: string;
    href: string;
}

interface PageFilter {
    search?: string;
}

interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PageProps {
    dataSoal: PaginatedResponse<Soal>;
    filters: PageFilter;
    flash?: {
        success?: string;
        error?: string;
    };
}

interface Soal {
    ids: number;
    suara: string | null;
    footer_soal: string | null;
    body_soal: string;
    jw_1: string;
    jw_2: string;
    jw_3: string;
    jw_4: string;
    jw_5: string;
    jw_fix: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bank Soal',
        href: '/master-data/bank-soal',
    },
];

export default function Banksoal() {
    console.log("Raw props:", usePage().props);
    
    const props = usePage().props as unknown as PageProps;

    // Verifikasi data sebelum mengaksesnya
    const dataSoal = props.dataSoal || { 
        data: [], 
        current_page: 1, 
        last_page: 1, 
        per_page: 10, 
        total: 0 
    };
    
    const filters = props.filters || { search: '' };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Soal" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <ContentTitle 
                        title="Bank Soal" 
                        onButtonClick={() => router.visit('/master-data/bank-soal/create')}
                    />
                <div className="mt-4 flex items-center justify-between">
                <EntriesSelector currentValue={dataSoal.per_page} options={[10, 15, 25, 50]} routeName="master-data.bank.soal" paramName="pages" />
                <SearchInputMenu defaultValue={filters?.search} routeName="master-data.bank.soal" />
                </div>
                <BankSoalTable data={dataSoal} pageFilters={filters} />
            </div>
        </AppLayout>
    );
}

function BankSoalTable({ data, pageFilters }: { data: PaginatedResponse<Soal>; pageFilters: PageFilter }) {
    const [open, setOpen] = useState(false);
    const [targetId, setTargetId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setTargetId(id);
        setOpen(true);
    };

    const confirmDelete = () => {
        if (targetId !== null) {
            router.delete(route('master-data.bank.soal.destroy', targetId), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Soal berhasil dihapus');
                },
            });
        }
        setOpen(false);
    };    

    const navigateToPage = (page: number) => {
        router.visit(route('master-data.bank.soal'), {
            data: {
                page: page,
                search: pageFilters?.search,
                pages: data.per_page,
            },
            preserveState: true,
            preserveScroll: true,
        });
    };       

    const columns = [
        {
            label: 'No',
            className: 'w-[60px]',
            render: (item: Soal) => <div className="text-center">{item.ids}</div>,
        },
        {
            label: 'Soal',
            render: (item: Soal) => (
                <div className="flex flex-col gap-2 max-w-[600px] whitespace-pre-wrap break-words">
                    {}
                    {item.suara ? (
                        <audio controls src={`/storage/${item.suara}`} className="w-[250px] max-w-full" />
                    ) : (
                        item.footer_soal && <p className="font-medium text-base">{item.footer_soal}</p>
                    )}
            
                    <p className="font-medium text-base">{item.body_soal}</p>
            
                    <ul className="space-y-1 font-medium text-base">
                        {[item.jw_1, item.jw_2, item.jw_3, item.jw_4, item.jw_5].map((jw, idx) => {
                            const huruf = String.fromCharCode(65 + idx); // A, B, C, D, E
                            const isCorrect = idx + 1 === item.jw_fix;
                            return (
                                <li key={idx} className={isCorrect ? 'text-green-600 font-semibold' : ''}>
                                    {huruf}. {jw}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ),                                    
        },
        {
            label: 'Action',
            className: 'w-[100px]',
            render: (item: Soal) => (
                <div className="flex justify-center gap-2">
                    <CButtonIcon icon={Pencil} onClick={() => router.visit(route('master-data.bank.soal.edit', item.ids))} />
                    <CButtonIcon icon={Trash2} type="danger" onClick={() => handleDelete(item.ids)} />
                </div>
            ),
        },
    ];

    return (
        <>
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
            <CAlertDialog open={open} setOpen={setOpen} onContinue={confirmDelete} />
        </>
    );
}