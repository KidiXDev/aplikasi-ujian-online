import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Permission, type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permission Manager',
        href: '/permissions',
    },
];

interface Props {
    permissions: Permission[];
}

export default function PermissionManager({ permissions }: Props) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        guard_name: 'web',
    });

    const {
        data: editData,
        setData: setEditData,
        put,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        name: '',
        guard_name: 'web',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('user-management.permissions.store'), {
            onSuccess: () => {
                reset();
                setIsCreateDialogOpen(false);
            },
        });
    };

    const handleEdit = (permission: Permission) => {
        setEditingPermission(permission);
        setEditData({
            name: permission.name,
            guard_name: permission.guard_name,
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPermission) return;

        put(route('user-management.permissions.update', editingPermission.id), {
            onSuccess: () => {
                resetEdit();
                setIsEditDialogOpen(false);
                setEditingPermission(null);
            },
        });
    };

    const handleDelete = (permission: Permission) => {
        if (confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
            router.delete(route('user-management.permissions.destroy', permission.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permission Manager" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Permission Manager</h1>
                        <p className="text-muted-foreground">Manage system permissions and access control</p>
                    </div>

                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Permission
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Permission</DialogTitle>
                                <DialogDescription>
                                    Create a new permission for the application. Enter a unique name for the permission.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
                                        </Label>
                                        <div className="col-span-3">
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g. create-users, edit-posts"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="guard_name" className="text-right">
                                            Guard
                                        </Label>
                                        <div className="col-span-3">
                                            <Input
                                                id="guard_name"
                                                value={data.guard_name}
                                                onChange={(e) => setData('guard_name', e.target.value)}
                                                placeholder="web"
                                                className={errors.guard_name ? 'border-red-500' : ''}
                                            />
                                            {errors.guard_name && <p className="mt-1 text-sm text-red-500">{errors.guard_name}</p>}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Permission'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Permission Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit Permission</DialogTitle>
                                <DialogDescription>Edit the permission details. Make sure the name is unique.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleEditSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-name" className="text-right">
                                            Name
                                        </Label>
                                        <div className="col-span-3">
                                            <Input
                                                id="edit-name"
                                                value={editData.name}
                                                onChange={(e) => setEditData('name', e.target.value)}
                                                placeholder="e.g. create-users, edit-posts"
                                                className={editErrors.name ? 'border-red-500' : ''}
                                            />
                                            {editErrors.name && <p className="mt-1 text-sm text-red-500">{editErrors.name}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-guard_name" className="text-right">
                                            Guard
                                        </Label>
                                        <div className="col-span-3">
                                            <Input
                                                id="edit-guard_name"
                                                value={editData.guard_name}
                                                onChange={(e) => setEditData('guard_name', e.target.value)}
                                                placeholder="web"
                                                className={editErrors.guard_name ? 'border-red-500' : ''}
                                            />
                                            {editErrors.guard_name && <p className="mt-1 text-sm text-red-500">{editErrors.guard_name}</p>}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={editProcessing}>
                                        {editProcessing ? 'Updating...' : 'Update Permission'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4">
                    <div className="rounded-lg border">
                        <div className="p-4">
                            <h2 className="text-lg font-semibold">Existing Permissions</h2>
                            <p className="text-muted-foreground text-sm">Manage and view all system permissions</p>
                        </div>
                        <div className="border-t">
                            {permissions.length > 0 ? (
                                <div className="divide-y">
                                    {permissions.map((permission) => (
                                        <div key={permission.id} className="flex items-center justify-between p-4">
                                            <div>
                                                <h3 className="font-medium">{permission.name}</h3>
                                                <p className="text-muted-foreground text-sm">
                                                    Guard: {permission.guard_name} • Used by {permission.roles?.length || 0} role(s)
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(permission)}>
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(permission)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-muted-foreground">No permissions found. Create your first permission to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
