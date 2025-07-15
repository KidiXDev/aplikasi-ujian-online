import { CButton } from '@/components/ui/c-button';
import { ContentTitle } from '@/components/content-title';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function ImportPeserta() {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    type BreadcrumbItem = {
        title: string;
        href: string;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Peserta Manager',
            href: '/master-data/peserta',
        },
        {
            title: 'Import',
            href: '/import-peserta',
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error('Silakan pilih file Excel');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        router.post(route('master-data.peserta.import'), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Import peserta berhasil');
                const lastPage = localStorage.getItem('peserta_last_page') || 1;
                router.visit(route('master-data.peserta.manager', { page: lastPage }), { replace: true });
                localStorage.removeItem('peserta_last_page');
            },
            onError: () => toast.error('Import gagal, periksa format file.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import Data Peserta" />

            <div className="space-y-4 p-4">
                <ContentTitle
                    title="Import Data Peserta"
                    extraButtons={
                        <CButton
                            type="primary"
                            className="md:w-24"
                            onClick={() => {
                                const lastPage = localStorage.getItem('peserta_last_page') || 1;
                                router.visit(route('master-data.peserta.manager', { page: lastPage }));
                            }}
                        >
                            Kembali
                        </CButton>
                    }
                    showButton={false}
                />

                <form onSubmit={handleSubmit} className="space-y-2">
                    <label htmlFor="fileInput" className="text-md block pt-15 font-medium text-gray-700">
                        File Excel
                    </label>

                    <input
                        ref={fileInputRef}
                        id="fileInput"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full cursor-pointer rounded border border-gray-300 p-[8px] text-sm file:mr-4 file:rounded file:border-0 file:bg-gray-100 file:px-4 file:py-1 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                    />

                    <div className="flex gap-4 pt-2">
                        <CButton href="/sample/import-peserta.xlsx" download type="success" className="bg-green-600 px-4 text-sm">
                            Sample
                        </CButton>

                        <CButton type="submit" className="px-4 py-2">
                            Import
                        </CButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
