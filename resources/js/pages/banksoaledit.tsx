import { useForm } from '@inertiajs/react';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState, ChangeEvent, FormEvent, useLayoutEffect } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import Editor from '@/components/editor/textrich';

const breadcrumbs = [
    { title: 'Bank Soal', href: '/master-data/bank-soal' },
    { title: 'Edit Soal', href: '/master-data/bank-soal/edit' },
];
const Dropdown = ({ label, value, onChange, options }: {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
}) => (
    <div>
        <label className="block">{label}</label>
        <select className="w-full border rounded px-3 py-2" value={value} onChange={onChange}>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

interface SoalForm {
    ids: string;
    kategori_soal: string;
    jenis_soal: string;
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

// Use the same interface and state updates as in create form
interface BidangOption {
    kode: string;
    nama: string;
}

// Tambahkan interface KategoriSoalOption
interface KategoriSoalOption {
    kategori: string; 
}

export default function BankSoalEdit({ soal }: { soal: SoalForm }) {
    const { data, setData, processing } = useForm<SoalForm>({
        ids: soal.ids,
        kategori_soal: soal.kategori_soal,
        kd_mapel: soal.kd_mapel,
        jenis_soal: soal.jenis_soal,
        suara: 'tidak',
        header_soal: soal.header_soal,
        body_soal: soal.body_soal,
        footer_soal: soal.footer_soal,
        jw_1: soal.jw_1,
        jw_2: soal.jw_2,
        jw_3: soal.jw_3,
        jw_4: soal.jw_4,
        jw_fix: soal.jw_fix,
        file: null,
    });

    // Add multiple scroll reset approaches
    useEffect(() => {
        // Approach 1: Immediate scroll
        window.scrollTo(0, 0);
        
        // Approach 2: Delayed scroll
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'instant'
            });
        }, 100);

        // Approach 3: Force document position
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        
        // Approach 4: Scroll with smooth behavior as fallback
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, []);

    // Move this before other useEffects
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [bidangOptions, setBidangOptions] = useState<BidangOption[]>([]);
    const [kategoriOptions, setKategoriOptions] = useState<KategoriSoalOption[]>([]);
    const [showUpload, setShowUpload] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [deleteAudio, setDeleteAudio] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<Record<string, boolean>>({
        body_soal: false
    });
    const [bodyImageBase64, setBodyImageBase64] = useState<string | null>(null);

    useEffect(() => {
        if (soal.body_soal && soal.body_soal.startsWith('/9j') || soal.body_soal.startsWith('iVBOR')) {
            const fullBase64 = `data:image/*;base64,${soal.body_soal}`;
            setBodyImageBase64(fullBase64);
            setUploadedImages(prev => ({ ...prev, body_soal: true }));
        }
    }, [soal.body_soal]);    

    useEffect(() => {
        // Existing bidang options fetch
        const fetchBidangOptions = async () => {
            try {
                const res = await axios.get('/master-data/jenisujian');
                setBidangOptions(res.data);
            } catch (error) {
                console.error('Failed to fetch bidang options:', error);
            }
        };

        // Add new fetch for kategori options
        const fetchKategoriOptions = async () => {
            try {
                const res = await axios.get('/master-data/kategorisoal');
                console.log('Kategori Soal response:', res.data);
                setKategoriOptions(res.data);
            } catch (error) {
                console.error('Failed to fetch kategori options:', error);
            }
        };

        fetchBidangOptions();
        fetchKategoriOptions();

        // Keep the audio handling code
        const adaSuara = Boolean(soal.suara && soal.suara !== '');
        const url = adaSuara ? `/storage/${soal.suara}` : null;

        setData('suara', adaSuara ? 'iya' : 'tidak');
        setShowUpload(adaSuara);
        setAudioUrl(url);
    }, [soal, setData, setShowUpload, setAudioUrl]);

    const convertToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
        
        const ImageUpload = ({
            onUpload,
            uploaded,
        }: {
            onUpload: (base64: string) => void;
            uploaded: boolean;
            onClear?: () => void;
        }) => {
            const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                    try {
                        const base64 = await convertToBase64(file);
                        onUpload(base64);
                    } catch (err) {
                        console.error('Gagal mengonversi gambar ke Base64:', err);
                    }
                }
            };
        
            return (
                <div className="space-y-2">
                    <div className="relative inline-block">
                        <label
                            className={`flex items-center justify-center w-20 h-8 text-sm border-2 rounded-lg cursor-pointer transition-all ${
                                uploaded ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {uploaded ? 'Change' : 'Images'}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>
                </div>
            );
        };        

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append('_method', 'PUT');

        if (deleteAudio) {
            formData.append('delete_audio', '1');
        } else {
            formData.append('delete_audio', '0');
        }
    
        // Tambahkan data form lainnya
        Object.keys(data).forEach((key) => {
            const value = data[key as keyof SoalForm];
            if (value !== null) {
                if (value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, String(value));
                }
            }
        });
    
        router.post(`/master-data/bank-soal/${data.ids}`, formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Soal berhasil diperbarui');
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
            <Head title="Edit Soal" />
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold mb-4">Edit Soal</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Update Kategori Soal Dropdown */}
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

                    {/* Update Jenis Ujian Dropdown */}
                    <Dropdown
                        label="Jenis Ujian"
                        value={data.kd_mapel}
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
                            if (val !== 'iya') {
                                setData('file', null);
                                setAudioUrl(null);
                                setDeleteAudio(true);
                            }
                        }}
                        options={[
                            { value: 'tidak', label: 'Tidak' },
                            { value: 'iya', label: 'Iya' },
                        ]}
                    />

                    {showUpload && (
                        <div className="w-full">
                            <label className="block mb-1 font-medium">Upload Audio</label>

                            {audioUrl && (
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-1">Audio saat ini:</p>
                                    <audio controls src={audioUrl} className="w-full" />
                                </div>
                            )}

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
                                        onChange={(e) => {
                                            setData('file', e.target.files?.[0] || null);
                                            setAudioUrl(null);
                                        }}
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

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-m text-foreground">Body Soal</label>
                            <ImageUpload
                                uploaded={uploadedImages.body_soal}
                                onUpload={(base64) => {
                                    const base64Only = base64.split(',')[1] || base64;
                                    setBodyImageBase64(base64);
                                    setUploadedImages(prev => ({ ...prev, body_soal: true }));
                                    setData('body_soal', base64Only);
                                }}
                                onClear={() => {
                                    setBodyImageBase64(null);
                                    setUploadedImages(prev => ({ ...prev, body_soal: false }));
                                    setData('body_soal', '');
                                }}
                            />
                        </div>
                        {bodyImageBase64 ? (
                            <div className="relative border rounded-lg p-2 bg-gray-50">
                                <img src={bodyImageBase64} alt="Preview Gambar" className="max-h-60 mx-auto" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBodyImageBase64(null);
                                        setUploadedImages(prev => ({ ...prev, body_soal: false }));
                                        setData('body_soal', '');
                                    }}
                                    className="absolute top-2 right-2 bg-white border border-gray-300 rounded-full px-2 text-xs text-red-500 hover:bg-red-50"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div className="w-full overflow-hidden rounded-lg border bg-background space-y-2">
                                <TooltipProvider>
                                    <Editor
                                        value={data.body_soal}
                                        onChange={(value: string) => setData('body_soal', value)}
                                    />
                                </TooltipProvider>
                            </div>
                        )}
                    </div>

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

                    {['jw_1', 'jw_2', 'jw_3', 'jw_4'].map((key, i) => {
                        const label = i === 0 ? `Jawaban ${String.fromCharCode(65 + i)} (Jawaban Benar)` : `Jawaban ${String.fromCharCode(65 + i)}`;
                        return (
                            <div key={key}>
                                <label className="text-m text-foreground">{label}</label>
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
