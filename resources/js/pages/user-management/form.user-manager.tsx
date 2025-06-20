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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Role, User } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
});

export default function Dashboard() {
    const { user, allRoles } = usePage<{ user: UserWithPassword; allRoles: Role[] }>().props;
    const isEdit = !!user;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'User Manager',
            href: '/user-management/user',
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
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        if (isEdit) {
            router.put(
                route('user-management.user.update', user.id),
                {
                    name: values.username,
                    email: values.email,
                    roles: values.roles,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        console.log('User updated successfully!');
                    },
                    onError: (errors) => {
                        console.error('Error:', errors);
                        if (errors.email) {
                            toast.error(errors.email);
                        }
                    },
                },
            );
        } else {
            router.post(
                route('user-management.user.store'),
                {
                    name: values.username,
                    email: values.email,
                    password: values.password,
                    roles: values.roles,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        console.log('User created successfully!');
                    },
                    onError: (errors) => {
                        console.error('Error:', errors);
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
                <Card>
                    <CardHeader>
                        <CardTitle>{isEdit ? 'Edit User' : 'Create User'}</CardTitle>
                        <CardDescription>{isEdit ? 'Edit user details' : 'Create a new user'}</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                <div className="flex gap-2">
                                    <CButton type="submit">Save</CButton>
                                    <CButton type="primary" onClick={() => router.visit(route('user-management.user.manager'))}>
                                        Back
                                    </CButton>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
