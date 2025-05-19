import { CButton } from '@/components/ui/c-button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function ImportPeserta() {
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

        router.post(route('master-data.peserta.import'), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Import berhasil');
                const lastPage = localStorage.getItem('peserta_last_page') || 1;
                router.visit(route('master-data.peserta.manager', { page: lastPage }), { replace: true });
                localStorage.removeItem('peserta_last_page');
            },
            onError: () => toast.error('Import gagal, periksa format file.'),
        });
    };

    return (
        <AppLayout>
            <Head title="Import Data Peserta" />

            <div className="space-y-4 p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Import Data Peserta</h1>
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
