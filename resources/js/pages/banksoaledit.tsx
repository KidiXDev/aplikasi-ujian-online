import { Head, usePage } from '@inertiajs/react';
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
        title: 'Edit Soal',
        href: '/master-data/bank-soal/update',
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

export default function BankSoalEdit() {
    // Perubahan 1: Jangan gunakan useForm dari Inertia untuk state awal
    const [data, setData] = useState<SoalForm>({
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
    const [processing, setProcessing] = useState(false);

    const [bidangOptions, setBidangOptions] = useState<{ nama: string }[]>([]);
    const [showUpload, setShowUpload] = useState(false);
    
    // Get the current question data from page props (set when visiting edit page)
    interface PageProps {
        soal: {
            ids: number;
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
        }
        [key: string]: unknown;
    }
    
    const { soal } = usePage<PageProps>().props;

    // Perubahan 2: Update handleChange untuk memperbarui state dengan nilai baru
    const handleChange = (key: keyof SoalForm, value: string | File | null) => {
        setData(prevData => ({
            ...prevData,
            [key]: value
        }));
    };

    useEffect(() => {
        console.log('Data soal dari server:', soal);
        
        // Set initial form data based on existing soal data
        if (soal) {
            setData({
                kategori_soal: soal.kategori_soal || '',
                suara: soal.suara || 'tidak',
                footer_soal: soal.footer_soal || '',
                body_soal: soal.body_soal || '',
                jw_1: soal.jw_1 || '',
                jw_2: soal.jw_2 || '',
                jw_3: soal.jw_3 || '',
                jw_4: soal.jw_4 || '',
                jw_5: soal.jw_5 || '',
                jw_fix: soal.jw_fix?.toString() || '',
                file: null,
            });
            
            // Periksa nilai suara dan atur showUpload sesuai dengan nilai suara
            if (soal.suara === 'iya') {
                setShowUpload(true);
            }
        }
    
        const fetchBidangOptions = async () => {
            try {
                const res = await axios.get('/master-data/jenisujian');
                setBidangOptions(res.data);
            } catch (error) {
                console.error('Failed to fetch bidang options:', error);
            }
        };
        fetchBidangOptions();
    }, [soal]);    

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
    
        // Validasi form sebelum submit
        const requiredFields = ['kategori_soal', 'body_soal', 'jw_1', 'jw_2', 'jw_3', 'jw_4', 'jw_5', 'jw_fix'];
        const missingFields = requiredFields.filter(field => !data[field as keyof SoalForm]);
    
        if (missingFields.length > 0) {
            toast.error(`Field berikut harus diisi: ${missingFields.join(', ')}`);
            setProcessing(false);
            return;
        }
    
        // Validasi file audio jika suara 'iya'
        if (data.suara === 'iya' && !data.file) {
            toast.error('Audio harus diupload');
            setProcessing(false);
            return;
        }
    
        // Debug untuk melihat data yang dikirim
        console.log('Data yang akan dikirim:', data);
    
        try {
            // Buat object data terpisah (tanpa file) untuk dikirim
            const dataToSend = {
                kategori_soal: data.kategori_soal,
                suara: data.suara,
                footer_soal: data.footer_soal,
                body_soal: data.body_soal,
                jw_1: data.jw_1,
                jw_2: data.jw_2,
                jw_3: data.jw_3,
                jw_4: data.jw_4,
                jw_5: data.jw_5,
                jw_fix: data.jw_fix,
            };
    
            console.log('Data yang akan dikirim ke server:', dataToSend);
    
            // Jika ada file dan suara 'iya', gunakan FormData
            if (data.suara === 'iya' && data.file) {
                const formData = new FormData();
                // Tambahkan semua field ke FormData
                Object.entries(dataToSend).forEach(([key, value]) => {
                    formData.append(key, value.toString());
                });
                // Tambahkan file jika ada
                formData.append('file', data.file);
    
                // Kirim dengan FormData menggunakan PUT
                await axios.put(`/master-data/bank-soal/update/${soal.ids}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
            } else {
                // Jika tidak ada file, kirim tanpa FormData menggunakan PUT
                await axios.put(`/master-data/bank-soal/update/${soal.ids}`, dataToSend);
            }
    
            toast.success('Soal berhasil diperbarui');
            setTimeout(() => {
                window.location.href = '/master-data/bank-soal';
            }, 1000);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error('Error during form submission:', error);
                toast.error('Terjadi kesalahan saat memperbarui soal');

                if (error.response?.data?.errors) {
                    const errorMessages = error.response.data.errors as Record<string, string>;
                    Object.keys(errorMessages).forEach(key => {
                        toast.error(`${key}: ${errorMessages[key]}`);
                    });
                }
            } else {
                console.error('Unexpected error:', error);
                toast.error('Terjadi kesalahan tak terduga');
            }
        }

        setProcessing(false);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Soal" />
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold mb-4">Edit Soal</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Dropdown
                        label="Jenis Ujian"
                        value={data.kategori_soal}
                        onChange={(e) => handleChange('kategori_soal', e.target.value)}
                        options={[{ value: '', label: 'Pilih Jenis Ujian' }, ...(bidangOptions?.map((item) => ({
                            value: item.nama,
                            label: item.nama,
                        })) || [])]}
                    />
                    
                    <Dropdown
                        label="Tambah Audio"
                        value={data.suara}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange('suara', val);
                            setShowUpload(val === 'iya');
                            if (val !== 'iya') handleChange('file', null);
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
                                        onChange={(e) => handleChange('file', e.target.files?.[0] || null)}
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
                        onChange={(e) => handleChange('footer_soal', e.target.value)}
                        textarea
                    />
                    <InputField
                        label="Body Soal"
                        value={data.body_soal}
                        onChange={(e) => handleChange('body_soal', e.target.value)}
                        textarea
                    />

                    {['jw_1', 'jw_2', 'jw_3', 'jw_4', 'jw_5'].map((key, i) => (
                        <InputField
                            key={key}
                            label={`Jawaban ${String.fromCharCode(65 + i)}`}
                            value={(data[key] ?? '') as string}
                            onChange={(e) => handleChange(key as keyof SoalForm, e.target.value)}
                            textarea
                        />
                    ))}

                    <Dropdown
                        label="Jawaban Benar"
                        value={data.jw_fix}
                        onChange={(e) => handleChange('jw_fix', e.target.value)}
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
                        {processing ? 'Menyimpan...' : 'Simpan Soal'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}