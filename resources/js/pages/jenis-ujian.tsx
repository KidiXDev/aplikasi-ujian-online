import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Jenis Ujian',
        href: '/jenis-ujian',
    },
];

const invoices = [
    {
        invoice: 'INV001',
        paymentStatus: 'Paid',
        totalAmount: '$250.00',
        paymentMethod: 'Credit Card',
    },
    {
        invoice: 'INV002',
        paymentStatus: 'Pending',
        totalAmount: '$150.00',
        paymentMethod: 'PayPal',
    },
    {
        invoice: 'INV003',
        paymentStatus: 'Unpaid',
        totalAmount: '$350.00',
        paymentMethod: 'Bank Transfer',
    },
    {
        invoice: 'INV004',
        paymentStatus: 'Paid',
        totalAmount: '$450.00',
        paymentMethod: 'Credit Card',
    },
    {
        invoice: 'INV005',
        paymentStatus: 'Paid',
        totalAmount: '$550.00',
        paymentMethod: 'PayPal',
    },
    {
        invoice: 'INV006',
        paymentStatus: 'Pending',
        totalAmount: '$200.00',
        paymentMethod: 'Bank Transfer',
    },
    {
        invoice: 'INV007',
        paymentStatus: 'Unpaid',
        totalAmount: '$300.00',
        paymentMethod: 'Credit Card',
    },
];

export default function JenisUjianPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Jenis Ujian" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl">Jenis Ujian</h1>
                <TableDemo />
                <button className="rounded bg-yellow-200 p-8" onClick={() => router.visit(route('monitoring.ujian'))}>
                    Click Me
                </button>
            </div>
        </AppLayout>
    );
}

function TableDemo() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
