import React, { useState } from 'react';
import { Users, FileText, CheckCircle, Monitor } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    // Mock data for stats
    const stats = [
        { title: 'peserta login', value: '150', icon: Users },
        { title: 'peserta soal ujian', value: '120', icon: FileText },
        { title: 'ujian berlangsung', value: '5', icon: CheckCircle },
        { title: 'ujian selesai', value: '25', icon: Monitor },
    ];

    // Mock data for exam history
    const examHistory = [
        {
            ujian: 'Matematika Dasar',
            kelas: 'X-1',
            kode: 'MTK001',
            peserta: 30,
            selesai: 28,
            jadwal: '2024-01-15 08:00',
            status: 'Selesai'
        },
        {
            ujian: 'Bahasa Indonesia',
            kelas: 'X-2',
            kode: 'BIN001',
            peserta: 32,
            selesai: 30,
            jadwal: '2024-01-15 10:00',
            status: 'Berlangsung'
        },
        {
            ujian: 'Fisika',
            kelas: 'XI-1',
            kode: 'FIS001',
            peserta: 28,
            selesai: 0,
            jadwal: '2024-01-16 08:00',
            status: 'Terjadwal'
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            {/* Header */}
            <header className="bg-white shadow-sm border-b rounded-xl mb-6">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-600 rounded"></div>
                        <span className="font-medium text-gray-900">Polines - Admin</span>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4" />
                    </div>
                </div>
            </header>

            <div className="p-6">
                {/* Stats Cards */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <stat.icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                                <p className="text-sm text-gray-600">{stat.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dashboard Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tambah Ujian Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Ujian</h3>
                            <div className="h-32 flex items-center justify-center">
                                <a
                                    href="/penjadwalan"
                                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors border border-gray-300 text-center"
                                >
                                    Tambah Ujian
                                </a>
                            </div>
                        </div>

                        {/* Monitoring Ujian Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring Ujian</h3>
                            <div className="h-32 flex items-center justify-center">
                                <a
                                    href="/monitoring-ujian"
                                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors border border-gray-300 text-center"
                                >
                                    Monitoring
                                </a>
                            </div>
                        </div>

                        {/* Token Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Ujian</h3>
                                <div className="flex items-center justify-center mb-4">
                                    <span className="text-3xl font-mono font-bold tracking-widest bg-gray-100 px-6 py-2 rounded-lg border border-gray-200 select-all">
                                        7X9Q2
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <button className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    Salin Token
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exam History Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Exam History</h2>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-blue-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ujian</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Kelas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Kode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Peserta</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Selesai</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Jadwal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {examHistory.map((exam, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {exam.ujian}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {exam.kelas}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {exam.kode}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {exam.peserta}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {exam.selesai}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {exam.jadwal}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    exam.status === 'Selesai' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : exam.status === 'Berlangsung'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {exam.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
