import { useForm } from '@inertiajs/react';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';

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

const InputField = ({ label, value, onChange, type = 'text', textarea = false }: {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    textarea?: boolean;
}) => (
    <div>
        <label className="block">{label}</label>
        {textarea ? (
            <textarea
                className="w-full border rounded px-3 py-2"
                value={value}
                onChange={onChange}
            />
        ) : (
            <input
                type={type}
                className="w-full border rounded px-3 py-2"
                value={value}
                onChange={onChange}
            />
        )}
    </div>
);

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
    suara: string;
    footer_soal: string;
    body_soal: string;
    jw_1: string;
    jw_2: string;
    jw_3: string;
    jw_4: string;
    jw_5: string;
    jw_fix: string;
    file: File | null;
    [key: string]: string | File | null;
}

export default function BankSoalCreate() {
    const { data, setData, processing } = useForm<SoalForm>({
        kategori_soal: '',
        suara: 'tidak',
        footer_soal: '',
        body_soal: '',
        jw_1: '',
        jw_2: '',
        jw_3: '',
        jw_4: '',
        jw_5: '',
        jw_fix: '',
        file: null,
    });

    const [bidangOptions, setBidangOptions] = useState<{ nama: string }[]>([]);
    const [showUpload, setShowUpload] = useState(false);

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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

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
                    <Dropdown
                        label="Jenis Ujian"
                        value={data.kategori_soal}
                        onChange={(e) => setData('kategori_soal', e.target.value)}
                        options={[
                            { value: '', label: 'Pilih Jenis Ujian' },
                            ...(bidangOptions?.map((item) => ({
                                value: item.nama,
                                label: item.nama,
                            })) || []),
                        ]}
                    />

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

                    <InputField
                        label="Footer Soal"
                        value={data.footer_soal}
                        onChange={(e) => setData('footer_soal', e.target.value)}
                        textarea
                    />
                    <InputField
                        label="Body Soal"
                        value={data.body_soal}
                        onChange={(e) => setData('body_soal', e.target.value)}
                        textarea
                    />

                    {['jw_1', 'jw_2', 'jw_3', 'jw_4', 'jw_5'].map((key, i) => (
                        <InputField
                            key={key}
                            label={`Jawaban ${String.fromCharCode(65 + i)}`}
                            value={data[key as keyof SoalForm] as string}
                            onChange={(e) => setData(key as keyof SoalForm, e.target.value)}
                            textarea
                        />
                    ))}

                    <Dropdown
                        label="Jawaban Benar"
                        value={data.jw_fix}
                        onChange={(e) => setData('jw_fix', e.target.value)}
                        options={[
                            { value: '', label: 'Pilih Jawaban' },
                            { value: '1', label: 'A' },
                            { value: '2', label: 'B' },
                            { value: '3', label: 'C' },
                            { value: '4', label: 'D' },
                            { value: '5', label: 'E' },
                        ]}
                    />
                    <button
                        type="submit"
                        className="bg-[#6784AE] hover:bg-[#56729B] text-white px-4 py-2 rounded-md mt-4"
                        disabled={processing}
                    >
                        Simpan Soal
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
