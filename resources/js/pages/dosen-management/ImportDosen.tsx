import { CButton } from '@/components/ui/c-button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { BreadcrumbItem } from '@/types';

export default function ImportDosen() {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error('Silakan pilih file Excel');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        router.post(route('master-data.dosen.import'), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Import berhasil');

            },
            onError: () => toast.error('Import gagal, periksa format file.'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dosen Manager', href: route('master-data.dosen.manager') },
        { title: 'Import', href: '/import' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import Data Dosen" />

            <div className="space-y-4 p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Import Data Dosen</h1>
                    <CButton
                        type="primary"
                        className="md:w-24"
                        onClick={() => {
                            const lastPage = localStorage.getItem('dosen_last_page') || 1;
                            router.visit(route('master-data.dosen.manager', { page: lastPage }));
                        }}
                    >
                        Kembali
                    </CButton>
                </div>

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

                    {/* Tombol Sample & Import */}
                    <div className="flex gap-4 pt-2">
                        <CButton href="/sample/import-dosen.xlsx" download type="success" className="bg-green-600 px-4 text-sm">
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
