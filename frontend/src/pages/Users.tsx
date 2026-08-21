import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, Globe, Building, ExternalLink } from 'lucide-react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { useQuery } from '@tanstack/react-query';
import { externalService } from '@/services/externalService';
import { User } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RoleBadge } from '@/components/ui/Badge';
import { TableSkeleton, PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select } from '@/components/ui/Select';
import { ROLE_OPTIONS } from '@/utils/constants';
import { formatDate } from '@/utils/date';
import { getInitials, getAvatarBg } from '@/utils/formatters';
import { clsx } from 'clsx';
import { getErrorMessage } from '@/services/api';
import toast from 'react-hot-toast';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters').optional().or(z.literal('')),
  role: z.enum(['admin', 'manager', 'member']),
});

type UserFormValues = z.infer<typeof userSchema>;

function UserFormModal({
  user,
  isOpen,
  onClose,
}: {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
}) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(user?.id ?? 0);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      role: user?.role ?? 'member',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        role: user?.role ?? 'member',
      });
    }
  }, [user, isOpen, reset]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (user) {
        const payload: any = { name: values.name, email: values.email, role: values.role };
        if (values.password) payload.password = values.password;
        await updateUser.mutateAsync(payload);
      } else {
        await createUser.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password!,
          role: values.role,
        });
      }
      onClose();
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const isLoading = createUser.isPending || updateUser.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Create User'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
        <Input label="Full Name" required error={errors.name?.message} autoComplete="off" {...register('name')} />
        <Input label="Email" type="email" required error={errors.email?.message} autoComplete="off" {...register('email')} />
        {!user && (
          <Input label="Password" type="password" required placeholder="Min 6 characters" error={errors.password?.message} autoComplete="new-password" {...register('password')} />
        )}
        {user && (
          <Input label="New Password" type="password" placeholder="Leave blank to keep current" error={errors.password?.message} autoComplete="new-password" {...register('password')} />
        )}
        <Select label="Role" required options={ROLE_OPTIONS} error={errors.role?.message} {...register('role')} />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
            {user ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const { data, isLoading, isError, refetch } = useUsers({ limit: 100, search: search || undefined });
  const deleteUserMut = useDeleteUser();

  const {
    data: externalData,
    isLoading: externalLoading,
    isError: externalError,
    refetch: refetchExternal,
  } = useQuery({
    queryKey: ['external-users'],
    queryFn: () => externalService.getUsers(),
    staleTime: 60_000,
  });

  const isAdmin = currentUser?.role === 'admin';

  if (isError) return <ErrorState title="Failed to load users" message="Could not load the user list." onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members and their roles.</p>
        </div>
        {isAdmin && (
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Add User
          </Button>
        )}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex-1 max-w-xs">
            <Input
              placeholder="Search users..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="user-search"
            />
          </div>
          {data && (
            <p className="text-sm text-gray-500">{data.total} users</p>
          )}
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : data?.items.length === 0 ? (
          <EmptyState title="No users found" description="No users match your search." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
                {isAdmin && <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.items.map((u) => (
                <tr key={u.id} className="group hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={clsx('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', getAvatarBg(u.name))}>
                        <span className="text-sm font-semibold text-white">{getInitials(u.name)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-sm text-gray-500">
                    {formatDate(u.created_at)}
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => setEditUser(u)}>Edit</Button>
                        {u.id !== currentUser?.id && (
                          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setDeleteUser(u)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* External Team Directory */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-900">External Team Directory</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">JSONPlaceholder API</span>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => refetchExternal()}>
            Refresh
          </Button>
        </div>

        {externalLoading ? (
          <TableSkeleton rows={4} />
        ) : externalError ? (
          <ErrorState
            title="External API unavailable"
            message="Could not connect to the external team directory. Please try again."
            onRetry={refetchExternal}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
            {externalData?.items.map((eu) => (
              <div key={eu.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-white">{getInitials(eu.name)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{eu.name}</p>
                    <p className="text-xs text-gray-400 truncate">{eu.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Building className="h-3 w-3" />
                    {eu.company || '—'}
                  </div>
                  {eu.website && (
                    <div className="flex items-center gap-1.5 text-xs text-brand-600">
                      <ExternalLink className="h-3 w-3" />
                      <a href={`https://${eu.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                        {eu.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <UserFormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <UserFormModal isOpen={!!editUser} onClose={() => setEditUser(null)} user={editUser ?? undefined} />
      <ConfirmDialog
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={async () => {
          if (deleteUser) {
            await deleteUserMut.mutateAsync(deleteUser.id);
            setDeleteUser(null);
          }
        }}
        title="Delete User?"
        message={`Are you sure you want to delete "${deleteUser?.name}"?`}
        isLoading={deleteUserMut.isPending}
      />
    </div>
  );
}
