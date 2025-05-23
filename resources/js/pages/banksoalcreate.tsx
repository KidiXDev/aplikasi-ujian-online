import { useForm } from '@inertiajs/react';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import Editor from '@/components/editor/textrich';

const breadcrumbs = [
    {
        title: 'Bank Soal',
        href: '/master-data/bank-soal',
    },
    {
        title: 'Tambah Soal',
        href: '/master-data/bank-soal/create',
    },
];

const Dropdown = ({ label, value, onChange, options }: {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
}) => (
    <div>
        <label className="block">{label}</label>
        <select
            className="w-full border rounded px-3 py-2"
            value={value}
            onChange={onChange}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

interface SoalForm {
    kategori_soal: string;
    jenis_soal: string;
    kd_mapel: string;  // Add this for storing jenis ujian code
    suara: string;
    header_soal: string;
    body_soal: string;
    footer_soal: string;
    jw_1: string;
    jw_2: string;
    jw_3: string;
    jw_4: string;
    jw_fix: string;
    file: File | null;
    [key: string]: string | File | null;
}

// Update the interface for bidang options
interface BidangOption {
    kode: string;
    nama: string;
}

interface KategoriSoalOption {
    kategori: string;
}

export default function BankSoalCreate() {
    const { data, setData, processing } = useForm<SoalForm>({
        kategori_soal: '',
        kd_mapel: '',    // Add this
        jenis_soal: '',
        suara: 'tidak',
        header_soal: '',
        body_soal: '',
        footer_soal: '',
        jw_1: '',
        jw_2: '',
        jw_3: '',
        jw_4: '',
        jw_fix: '0',
        file: null,
    });

    // Update the state type
    const [bidangOptions, setBidangOptions] = useState<BidangOption[]>([]);
    const [kategoriOptions, setKategoriOptions] = useState<KategoriSoalOption[]>([]);
    const [showUpload, setShowUpload] = useState(false);

    // Update the useEffect that fetches bidang options
    useEffect(() => {
        const fetchBidangOptions = async () => {
            try {
                const res = await axios.get('/master-data/jenisujian');
                setBidangOptions(res.data);
            } catch (error) {
                console.error('Failed to fetch bidang options:', error);
            }
        };
        fetchBidangOptions();
    }, []);

    // Fetch kategori options
    useEffect(() => {
        const fetchKategoriOptions = async () => {
            try {
                const res = await axios.get('/master-data/kategorisoal');
                console.log('Kategori Soal response:', res.data); // Tambahkan logging
                setKategoriOptions(res.data);
            } catch (error) {
                console.error('Failed to fetch kategori options:', error);
            }
        };
        fetchKategoriOptions();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        console.log('Data yang dikirim:', data);

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            const value = data[key as keyof SoalForm];
            if (value !== null) formData.append(key, value as string | Blob);
        });

        router.post(route('master-data.bank.soal.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Soal berhasil ditambahkan');
                router.visit('/master-data/bank-soal');
            },
            onError: (errors) => {
                toast.error('Terjadi kesalahan saat menyimpan');
                console.error(errors);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Soal" />
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold mb-4">Tambah Soal</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Kategori Soal Dropdown */}
                    <Dropdown
                        label="Kategori Soal"
                        value={data.kategori_soal}
                        onChange={(e) => setData('kategori_soal', e.target.value)}
                        options={[
                            { value: '', label: 'Pilih Kategori Soal' },
                            ...(kategoriOptions?.map((item) => ({
                                value: item.kategori,
                                label: item.kategori
                            })) || []),
                        ]}
                    />

                    <Dropdown
                        label="Jenis Ujian"
                        value={data.kd_mapel}  // Changed from kategori_soal to kd_mapel
                        onChange={(e) => setData('kd_mapel', e.target.value)}
                        options={[
                            { value: '', label: 'Pilih Jenis Ujian' },
                            ...(bidangOptions?.map((item) => ({
                                value: item.kode,
                                label: `${item.kode} - ${item.nama}`
                            })) || []),
                        ]}
                    />

                    {/* Add Kode Soal input */}
                    <div>
                        <label className="block mb-2">Kode Soal</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={data.jenis_soal}
                            onChange={(e) => setData('jenis_soal', e.target.value)}
                            placeholder="Masukkan kode soal"
                        />
                    </div>

                    <Dropdown
                        label="Tambah Audio"
                        value={data.suara}
                        onChange={(e) => {
                            const val = e.target.value;
                            setData('suara', val);
                            setShowUpload(val === 'iya');
                            if (val !== 'iya') setData('file', null);
                        }}
                        options={[
                            { value: 'tidak', label: 'Tidak' },
                            { value: 'iya', label: 'Iya' },
                        ]}
                    />

                    {showUpload && (
                        <div className="w-full">
                            <label className="block mb-1 font-medium">Upload Audio</label>
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="audio-upload"
                                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg
                                            className="w-8 h-8 mb-3 text-gray-500"
                                            aria-hidden="true"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M7 16V4m0 0l4 4m-4-4L3 8m14 4v8m0 0l-4-4m4 4l4-4"
                                            />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Klik untuk unggah</span> atau tarik file ke sini
                                        </p>
                                        <p className="text-xs text-gray-500">Format audio (MP3, WAV, dll)</p>
                                    </div>
                                    <input
                                        id="audio-upload"
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>
                            {data.file && (
                                <p className="mt-2 text-sm text-gray-600">
                                    File terpilih: <span className="font-medium">{data.file.name}</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Header Soal */}
                    <div>
                        <label className="text-m text-foreground">Header Soal</label>
                        <div className="w-full overflow-hidden rounded-lg border bg-background space-y-2">
                            <TooltipProvider>
                                <Editor
                                    value={data.header_soal}
                                    onChange={(value: string) => setData('header_soal', value)} 
                                />
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Body Soal */}
                    <div>
                        <label className="text-m text-foreground">Body Soal</label>
                        <div className="w-full overflow-hidden rounded-lg border bg-background space-y-2">
                            <TooltipProvider>
                                <Editor
                                    value={data.body_soal}
                                    onChange={(value: string) => setData('body_soal', value)}
                                />
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Footer Soal */}
                    <div>
                        <label className="text-m text-foreground">Footer Soal</label>
                        <div className="w-full overflow-hidden rounded-lg border bg-background space-y-2">
                            <TooltipProvider>
                                <Editor
                                    value={data.footer_soal}
                                    onChange={(value: string) => setData('footer_soal', value)} 
                                />
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Jawaban Soal */}
                    {['jw_1', 'jw_2', 'jw_3', 'jw_4'].map((key, i) => {
                        const label = i === 0 ? `Jawaban ${String.fromCharCode(65 + i)} (Jawaban Benar)` : `Jawaban ${String.fromCharCode(65 + i)}`;
                        return (
                            <div key={key}>
                                <label className="text-m text-foreground">
                                    {label}
                                </label>
                                <div className="w-full overflow-hidden rounded-lg border bg-background space-y-2">
                                    <TooltipProvider>
                                        <Editor
                                            value={data[key as keyof SoalForm]?.toString() || ''}
                                            onChange={(value: string) => setData(key as keyof SoalForm, value)} 
                                        />
                                    </TooltipProvider>
                                </div>
                            </div>
                        );
                    })}

                    <div className="flex gap-4 mt-4">
                        <button
                            type="button"
                            onClick={() => router.visit('/master-data/bank-soal')}
                            className="bg-[#AC080C] hover:bg-[#8C0A0F] text-white px-4 py-2 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-[#6784AE] hover:bg-[#56729B] text-white px-4 py-2 rounded-md"
                            disabled={processing}
                        >
                            Simpan Soal
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}