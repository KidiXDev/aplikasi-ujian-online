import Editor from '@/components/editor/textrich';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { ChangeEvent, FormEvent, useEffect, useLayoutEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs = [
    { title: 'Bank Soal', href: '/master-data/bank-soal' },
    { title: 'Edit Soal', href: '/master-data/bank-soal/edit' },
];

const Dropdown = ({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
}) => (
    <div>
        <label className="block">{label}</label>
        <select className="w-full rounded border px-3 py-2" value={value} onChange={onChange}>
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
    kd_mapel: string;
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
                behavior: 'instant',
            });
        }, 100);

        // Approach 3: Force document position
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        // Approach 4: Scroll with smooth behavior as fallback
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'instant',
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
    
    // Track uploaded images for each field
    const [uploadedImages, setUploadedImages] = useState<Record<string, boolean>>({
        body_soal: false,
        header_soal: false,
        footer_soal: false,
        jw_1: false,
        jw_2: false,
        jw_3: false,
        jw_4: false,
    });
    
    // Store base64 image data for each field
    const [imageBase64Data, setImageBase64Data] = useState<Record<string, string | null>>({
        body_soal: null,
        header_soal: null,
        footer_soal: null,
        jw_1: null,
        jw_2: null,
        jw_3: null,
        jw_4: null,
    });

    // Function to detect if text is a base64 encoded image
    const isBase64Image = (text: string | null): boolean => {
        if (!text) return false;
        // Check for common base64 image prefixes
        return text.startsWith('/9j') || text.startsWith('iVBOR') || text.startsWith('R0lGOD') || text.startsWith('UklGR');
    };

    // Check each field for base64 images on initial load
    useEffect(() => {
        const fieldsToCheck = ['body_soal', 'header_soal', 'footer_soal', 'jw_1', 'jw_2', 'jw_3', 'jw_4'];
        
        const newUploadedImages = { ...uploadedImages };
        const newImageBase64Data = { ...imageBase64Data };
        
        fieldsToCheck.forEach((field) => {
            const value = soal[field as keyof SoalForm];
            if (value && isBase64Image(value as string)) {
                newUploadedImages[field] = true;
                newImageBase64Data[field] = `data:image/*;base64,${value}`;
            }
        });
        
        setUploadedImages(newUploadedImages);
        setImageBase64Data(newImageBase64Data);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [soal]);

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
        uploaded 
    }: { 
        fieldName: string;
        onUpload: (base64: string) => void; 
        uploaded: boolean; 
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
                        className={`flex h-8 w-20 cursor-pointer items-center justify-center rounded-lg border-2 text-sm transition-all ${
                            uploaded ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {uploaded ? 'Change' : 'Images'}
                        <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={handleImageChange} />
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
            },
        });
    };
    
    // Function to handle image rendering or editor rendering for a field
    const renderFieldEditor = (fieldName: string, label: string) => {
        const isUploaded = uploadedImages[fieldName];
        const imageData = imageBase64Data[fieldName];
        
        return (
            <div key={fieldName}>
                <div className="mb-1 flex items-center justify-between">
                    <label className="text-m text-foreground">{label}</label>
                    <ImageUpload
                        fieldName={fieldName}
                        uploaded={isUploaded}
                        onUpload={(base64) => {
                            const base64Only = base64.split(',')[1] || base64;
                            setImageBase64Data(prev => ({ ...prev, [fieldName]: base64 }));
                            setUploadedImages(prev => ({ ...prev, [fieldName]: true }));
                            setData(fieldName as keyof SoalForm, base64Only);
                        }}
                    />
                </div>
                
                {isUploaded && imageData ? (
                    <div className="relative rounded-lg border bg-gray-50 p-2">
                        <img src={imageData} alt="Preview Gambar" className="mx-auto max-h-60" />
                        <button
                            type="button"
                            onClick={() => {
                                setImageBase64Data(prev => ({ ...prev, [fieldName]: null }));
                                setUploadedImages(prev => ({ ...prev, [fieldName]: false }));
                                setData(fieldName as keyof SoalForm, '');
                            }}
                            className="absolute top-2 right-2 rounded-full border border-gray-300 bg-white px-2 text-xs text-red-500 hover:bg-red-50"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className="bg-background w-full space-y-2 overflow-hidden rounded-lg border">
                        <TooltipProvider>
                            <Editor 
                                value={data[fieldName as keyof SoalForm]?.toString() || ''} 
                                onChange={(value: string) => setData(fieldName as keyof SoalForm, value)} 
                            />
                        </TooltipProvider>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Soal" />
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="mb-4 text-2xl font-bold">Edit Soal</h1>
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
                                label: item.kategori,
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
                                label: `${item.kode} - ${item.nama}`,
                            })) || []),
                        ]}
                    />

                    {/* Add Kode Soal input */}
                    <div>
                        <label className="mb-2 block">Kode Soal</label>
                        <input
                            type="text"
                            className="w-full rounded border px-3 py-2"
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
                            <label className="mb-1 block font-medium">Upload Audio</label>

                            {audioUrl && (
                                <div className="mb-2">
                                    <p className="mb-1 text-sm text-gray-600">Audio saat ini:</p>
                                    <audio controls src={audioUrl} className="w-full" />
                                </div>
                            )}

                            <div className="flex w-full items-center justify-center">
                                <label
                                    htmlFor="audio-upload"
                                    className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 transition-colors hover:bg-gray-100"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg
                                            className="mb-3 h-8 w-8 text-gray-500"
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

                    {/* Render all fields with image uploading capability */}
                    {renderFieldEditor('header_soal', 'Header Soal')}
                    {renderFieldEditor('body_soal', 'Body Soal')}
                    {renderFieldEditor('footer_soal', 'Footer Soal')}
                    
                    {/* Answer fields */}
                    {['jw_1', 'jw_2', 'jw_3', 'jw_4'].map((key, i) => {
                        const label = i === 0 
                            ? `Jawaban ${String.fromCharCode(65 + i)} (Jawaban Benar)` 
                            : `Jawaban ${String.fromCharCode(65 + i)}`;
                        return renderFieldEditor(key, label);
                    })}

                    <div className="mt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.visit('/master-data/bank-soal')}
                            className="rounded-md bg-[#AC080C] px-4 py-2 text-white hover:bg-[#8C0A0F]"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="rounded-md bg-[#6784AE] px-4 py-2 text-white hover:bg-[#56729B]" disabled={processing}>
                            Simpan Soal
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
