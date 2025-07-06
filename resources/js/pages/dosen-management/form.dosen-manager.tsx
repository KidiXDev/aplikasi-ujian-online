import { PasswordInput } from '@/components/c-password-input';
import {
    MultiSelector,
    MultiSelectorContent,
    MultiSelectorInput,
    MultiSelectorItem,
    MultiSelectorList,
    MultiSelectorTrigger,
} from '@/components/multi-select';
import { CButton } from '@/components/ui/c-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Role } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    dosen?: {
        nip: string;
        aktif: boolean;
    };
}

interface UserWithPassword extends User {
    password: string;
}

const formSchema = z.object({
    username: z.string().min(2, {
        message: 'Username must be at least 2 characters.',
    }),
    email: z.string().email('Invalid email address.'),
    password: z
        .string()
        .optional()
        .refine((val) => !val || val.length >= 8, { message: 'Password must be at least 8 characters.' }),
    roles: z.array(z.string()).nonempty('Please select at least one item'),
    nip: z.string().min(2, {
        message: 'NIP must be at least 2 characters.',
    }),
    aktif: z.boolean(),
});

export default function Dashboard() {
    const { user, allRoles } = usePage<{ user: UserWithPassword; allRoles: Role[] }>().props;
    const isEdit = !!user;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dosen Manager',
            href: '/user-management/dosen',
        },
        {
            title: isEdit ? 'Edit' : 'Create',
            href: isEdit ? '/edit' : '/create',
        },
    ];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: user?.name ?? '',
            email: user?.email ?? '',
            password: '',
            roles: user?.roles?.length ? user.roles : [],
            nip: user?.dosen?.nip ?? '',
            aktif: !!user?.dosen?.aktif,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEdit) {
            router.put(
                route('master-data.dosen.update', user.id),
                {
                    name: values.username,
                    email: values.email,
                    roles: values.roles,
                    nip: values.nip,
                    aktif: values.aktif,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Success handler
                    },
                    onError: (errors) => {
                        if (errors.email) {
                            toast.error(errors.email);
                        }
                    },
                },
            );
        } else {
            router.post(
                route('master-data.dosen.store'),
                {
                    name: values.username,
                    email: values.email,
                    password: values.password,
                    roles: values.roles,
                    nip: values.nip,
                    aktif: values.aktif,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Success handler
                    },
                    onError: (errors) => {
                        if (errors.email) {
                            toast.error(errors.email);
                        }
                        if (errors.password) {
                            toast.error(errors.password);
                        }
                    },
                },
            );
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="space-between flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Tambah'} Data Dosen</h1>
                    <CButton type="primary" className="md:w-24" onClick={() => router.visit(route('master-data.dosen.manager'))}>
                        Kembali
                    </CButton>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Enter your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {!isEdit && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <PasswordInput placeholder="Password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="roles"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Roles</FormLabel>
                                    <FormControl>
                                        <MultiSelector values={field.value} onValuesChange={field.onChange} loop className="max-w-xs">
                                            <MultiSelectorTrigger>
                                                <MultiSelectorInput placeholder="Select roles" />
                                            </MultiSelectorTrigger>
                                            <MultiSelectorContent>
                                                <MultiSelectorList>
                                                    {allRoles.map((role) => (
                                                        <MultiSelectorItem key={role.id} value={role.name}>
                                                            {role.name}
                                                        </MultiSelectorItem>
                                                    ))}
                                                </MultiSelectorList>
                                            </MultiSelectorContent>
                                        </MultiSelector>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nip"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NIP</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your NIP" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="aktif"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value ? 'true' : 'false'}
                                            onValueChange={(value: string) => field.onChange(value === 'true')}
                                        >
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Active</SelectItem>
                                                <SelectItem value="false">Non Active</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <CButton type="submit">Save</CButton>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
