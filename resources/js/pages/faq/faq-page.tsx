import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Frequently Asked Questions',
        href: '/dashboard/faq',
    },
];

const faqData = [
    {
        id: '1',
        question: 'Bagaimana cara membuat jadwal ujian online?',
        answer: 'Untuk membuat jadwal ujian online, Pergi ke menu "Jadwal Ujian", dan klik tombol "Buat Jadwal Baru". Isi semua informasi yang diperlukan dan klik "Simpan".',
    },
    {
        id: '2',
        question: 'Bagaimana cara mereset jawaban mahasiswa jika koneksi internet terputus saat ujian?',
        answer: 'Jika koneksi internet terputus, pergi ke monitoring ujian, cari jadwal ujian yang bersangkutan, dan klik tombol "Reset Jawaban". Ini akan menghapus status submit mahasiswa dan memungkinkan mereka untuk memulai ulang ujian.',
    },
    {
        id: '3',
        question: 'Bagaimana cara membuat paket ujian?',
        answer: 'Untuk membuat paket ujian, pergi ke menu "Paket Soal", dan klik tombol "Add". Isi semua informasi yang diperlukan dan klik "Simpan".',
    },
    {
        id: '4',
        question: 'Apakah bisa mereset jawaban setelah submit?',
        answer: 'Setelah ujian di-submit, jawaban dapat di-reset oleh dosen melalui menu monitoring ujian. Ini memungkinkan mahasiswa untuk mengerjakan ulang ujian jika diperlukan.',
    },
    {
        id: '5',
        question: 'Bagaimana cara melihat hasil ujian?',
        answer: 'Hasil ujian dapat dilihat di menu "Monitoring Ujian", informasi ujian akan ditampilkan disini.',
    },
    {
        id: '6',
        question: 'Bagaimana cara melihat nilai mahasiswa?',
        answer: 'Untuk melihat nilai mahasiswa, pergi ke menu "Rekap Nilai", dan cari jadwal ujian yang bersangkutan. Nilai akan ditampilkan di sini setelah mahasiswa menyelesaikan ujian dan men-submit jawaban.',
    },
    {
        id: '7',
        question: 'Apakah monitoring dilakukan secara real-time?',
        answer: 'Ya, monitoring ujian dilakukan secara real-time. Dosen dapat melihat aktivitas mahasiswa selama ujian berlangsung.',
    },
    {
        id: '8',
        question: 'Apakah ada cara untuk menambahkan admin atau pengawas baru?',
        answer: 'Untuk menambahkan admin atau pengawas baru, akses super-admin diperlukan untuk mengelola pengguna. Ketika masuk sebagai super-admin, pergi ke menu "User" di "User Management",  dan klik tombol "Add". Isi informasi yang diperlukan dan pilih role yang sesuai.',
    },
    {
        id: '9',
        question: 'Apakah admin bisa menambahkan pengawas baru?',
        answer: 'Tidak, hanya super-admin yang memiliki hak untuk menambahkan pengawas baru. Admin hanya dapat mengelola jadwal ujian dan monitoring.',
    },
];

export default function FaqPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Frequently Asked Questions" />
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="mb-4 text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
                    <p className="text-gray-600">Temukan jawaban untuk pertanyaan yang sering diajukan seputar sistem ujian online.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqData.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-gray-700">{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </AppLayout>
    );
}
