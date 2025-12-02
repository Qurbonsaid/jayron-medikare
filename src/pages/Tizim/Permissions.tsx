import {
  useCreatePermissionMutation,
  useDeletePermissionMutation,
  useGetAllPermissionsQuery,
  useUpdatePermissionMutation,
} from '@/app/api/permissionApi/permissionApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleConstants } from '@/constants/Roles';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { usePermission } from '@/hooks/usePermission';
import { Edit, Plus, Shield, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Rol nomlari uchun o'zbek tilidagi tarjimalar
const roleLabels: Record<RoleConstants, string> = {
  [RoleConstants.CEO]: 'Бош директор',
  [RoleConstants.ADMIN]: 'Администратор',
  [RoleConstants.DOCTOR]: 'Шифокор',
  [RoleConstants.NURSE]: 'Ҳамшира',
  [RoleConstants.RECEPTIONIST]: 'Қабулхона',
  [RoleConstants.PHARMACIST]: 'Фармацевт',
};

// Permission turi
interface Permission {
  _id: string;
  collection_name: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

interface PermissionData {
  _id: string;
  role: RoleConstants;
  permissions: Permission[];
  created_at: Date;
  updated_at: Date;
}

// PermissionCard komponenti
const PermissionCard = ({
  permission,
  roleLabels,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: {
  permission: PermissionData;
  roleLabels: Record<RoleConstants, string>;
  onEdit: (permission: PermissionData) => void;
  onDelete: (permission: PermissionData) => void;
  canUpdate: boolean;
  canDelete: boolean;
}) => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <div className='flex items-center gap-3'>
        <CardTitle className='text-lg'>{roleLabels[permission.role]}</CardTitle>
        <Badge variant='outline'>{permission.role}</Badge>
      </div>
      <div className='flex gap-2'>
        {canUpdate && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => onEdit(permission)}
          >
            <Edit className='mr-2 h-4 w-4' />
            Таҳрирлаш
          </Button>
        )}
        {canDelete && (
          <Button
            variant='destructive'
            size='sm'
            onClick={() => onDelete(permission)}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Ўчириш
          </Button>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Коллекция</TableHead>
            <TableHead className='text-center'>Яратиш</TableHead>
            <TableHead className='text-center'>Ўқиш</TableHead>
            <TableHead className='text-center'>Янгилаш</TableHead>
            <TableHead className='text-center'>Ўчириш</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permission.permissions.map((perm) => (
            <TableRow key={perm._id}>
              <TableCell className='font-medium'>
                {perm.collection_name}
              </TableCell>
              <TableCell className='text-center'>
                <Badge variant={perm.create ? 'default' : 'secondary'}>
                  {perm.create ? 'Ҳа' : 'Йўқ'}
                </Badge>
              </TableCell>
              <TableCell className='text-center'>
                <Badge variant={perm.read ? 'default' : 'secondary'}>
                  {perm.read ? 'Ҳа' : 'Йўқ'}
                </Badge>
              </TableCell>
              <TableCell className='text-center'>
                <Badge variant={perm.update ? 'default' : 'secondary'}>
                  {perm.update ? 'Ҳа' : 'Йўқ'}
                </Badge>
              </TableCell>
              <TableCell className='text-center'>
                <Badge variant={perm.delete ? 'default' : 'secondary'}>
                  {perm.delete ? 'Ҳа' : 'Йўқ'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const Permissions = () => {
  const handleRequest = useHandleRequest();
  const { canCreate, canUpdate, canDelete } = usePermission('permissions');

  // State
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionData | null>(null);
  const [newRole, setNewRole] = useState<RoleConstants | ''>('');
  const [editingPermissions, setEditingPermissions] = useState<Permission[]>(
    []
  );

  // API Hooks
  const { data: permissionsData, isLoading } = useGetAllPermissionsQuery();
  const [createPermission, { isLoading: isCreating }] =
    useCreatePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] =
    useUpdatePermissionMutation();
  const [deletePermission, { isLoading: isDeleting }] =
    useDeletePermissionMutation();

  // Mavjud rollar ro'yxati
  const existingRoles =
    permissionsData?.data?.map((p: PermissionData) => p.role) || [];

  // Yangi rol yaratish uchun mavjud bo'lmagan rollar
  const availableRoles = Object.values(RoleConstants).filter(
    (role) => !existingRoles.includes(role)
  );

  // Yangi permission yaratish
  const handleCreatePermission = async () => {
    if (!newRole) {
      toast.error('Илтимос, ролни танланг');
      return;
    }

    await handleRequest({
      request: async () => await createPermission(newRole).unwrap(),
      onSuccess: () => {
        toast.success('Рухсат муваффақиятли яратилди');
        setIsCreateModalOpen(false);
        setNewRole('');
      },
      onError: (err) => {
        toast.error(err?.data?.error?.msg || 'Хатолик юз берди');
      },
    });
  };

  // Permission tahrirlash modalini ochish
  const handleEditClick = (permission: PermissionData) => {
    setSelectedPermission(permission);
    setEditingPermissions([...permission.permissions]);
    setIsEditModalOpen(true);
  };

  // Permission o'chirish dialogini ochish
  const handleDeleteClick = (permission: PermissionData) => {
    setSelectedPermission(permission);
    setIsDeleteDialogOpen(true);
  };

  // Permission yangilash
  const handleUpdatePermission = async () => {
    if (!selectedPermission) return;

    await handleRequest({
      request: async () =>
        await updatePermission({
          id: selectedPermission._id,
          body: {
            permissions: editingPermissions.map((p) => ({
              _id: p._id,
              create: p.create,
              read: p.read,
              update: p.update,
              delete: p.delete,
            })),
          },
        }).unwrap(),
      onSuccess: () => {
        toast.success('Рухсатлар муваффақиятли янгиланди');
        setIsEditModalOpen(false);
        setSelectedPermission(null);
        setEditingPermissions([]);
      },
      onError: (err) => {
        toast.error(err?.data?.error?.msg || 'Хатолик юз берди');
      },
    });
  };

  // Permission o'chirish
  const handleDeletePermission = async () => {
    if (!selectedPermission) return;

    await handleRequest({
      request: async () =>
        await deletePermission(selectedPermission._id).unwrap(),
      onSuccess: () => {
        toast.success('Рухсат муваффақиятли ўчирилди');
        setIsDeleteDialogOpen(false);
        setSelectedPermission(null);
      },
      onError: (err) => {
        toast.error(err?.data?.error?.msg || 'Хатолик юз берди');
      },
    });
  };

  // Checkbox o'zgarishini boshqarish
  const handlePermissionChange = (
    index: number,
    field: 'create' | 'read' | 'update' | 'delete',
    value: boolean
  ) => {
    setEditingPermissions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Bir qatordagi barcha checkboxlarni yoqish/o'chirish
  const handleRowAllChange = (index: number, value: boolean) => {
    setEditingPermissions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        create: value,
        read: value,
        update: value,
        delete: value,
      };
      return updated;
    });
  };

  // Bir qatordagi barcha checkboxlar yoqilganmi tekshirish
  const isRowAllChecked = (perm: Permission) => {
    return perm.create && perm.read && perm.update && perm.delete;
  };

  // Barcha checkboxlarni yoqish/o'chirish
  const handleToggleAll = (value: boolean) => {
    setEditingPermissions((prev) =>
      prev.map((perm) => ({
        ...perm,
        create: value,
        read: value,
        update: value,
        delete: value,
      }))
    );
  };

  // Barcha checkboxlar yoqilganmi tekshirish
  const isAllChecked = () => {
    return editingPermissions.every(
      (perm) => perm.create && perm.read && perm.update && perm.delete
    );
  };

  // Tanlangan rol bo'yicha filtrlash
  const getPermissionByRole = (role: string) => {
    if (role === 'all') return permissionsData?.data;
    return permissionsData?.data?.filter(
      (p: PermissionData) => p.role === role
    );
  };

  return (
    <div className='space-y-6 py-4 px-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Shield className='h-8 w-8 text-primary' />
          <div>
            <h1 className='text-2xl font-bold'>Рухсатлар</h1>
            <p className='text-sm text-muted-foreground'>
              Тизим рухсатларини бошқариш
            </p>
          </div>
        </div>
        {canCreate && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={availableRoles.length === 0}
          >
            <Plus className='mr-2 h-4 w-4' />
            Янги рухсат
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='w-full justify-start flex-wrap h-auto bg-muted/50 p-2 space-x-4 border-2 shadow-lg'>
          <TabsTrigger
            value='all'
            className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-blue-400 hover:text-white'
          >
            <Users className='mr-2 h-4 w-4' />
            Барчаси
          </TabsTrigger>
          {existingRoles.map((role: RoleConstants) => (
            <TabsTrigger
              key={role}
              value={role}
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 hover:bg-blue-400 hover:text-white'
            >
              {roleLabels[role]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All Roles Tab */}
        <TabsContent value='all' className='mt-4'>
          {isLoading ? (
            <Card>
              <CardContent className='py-10 text-center'>
                <p className='text-muted-foreground'>Юкланмоқда...</p>
              </CardContent>
            </Card>
          ) : permissionsData?.data?.length === 0 ? (
            <Card>
              <CardContent className='py-10 text-center'>
                <p className='text-muted-foreground'>Рухсатлар топилмади</p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-4'>
              {permissionsData?.data?.map((permission: PermissionData) => (
                <PermissionCard
                  key={permission._id}
                  permission={permission}
                  roleLabels={roleLabels}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Individual Role Tabs */}
        {existingRoles.map((role: RoleConstants) => (
          <TabsContent key={role} value={role} className='mt-4'>
            {isLoading ? (
              <Card>
                <CardContent className='py-10 text-center'>
                  <p className='text-muted-foreground'>Юкланмоқда...</p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid gap-4'>
                {getPermissionByRole(role)?.map(
                  (permission: PermissionData) => (
                    <PermissionCard
                      key={permission._id}
                      permission={permission}
                      roleLabels={roleLabels}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                    />
                  )
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Permission Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Янги рухсат яратиш</DialogTitle>
            <DialogDescription>
              Янги рол учун рухсат яратиш. Рол танланг.
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <Select
              value={newRole}
              onValueChange={(value) => setNewRole(value as RoleConstants)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Ролни танланг' />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleLabels[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateModalOpen(false)}
            >
              Бекор қилиш
            </Button>
            <Button onClick={handleCreatePermission} disabled={isCreating}>
              {isCreating ? 'Яратилмоқда...' : 'Яратиш'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              Рухсатларни таҳрирлаш -{' '}
              {selectedPermission && roleLabels[selectedPermission.role]}
            </DialogTitle>
            <DialogDescription>
              Коллекциялар учун рухсатларни ўзгартиринг
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Коллекция</TableHead>
                  <TableHead className='text-center'>Яратиш</TableHead>
                  <TableHead className='text-center'>Ўқиш</TableHead>
                  <TableHead className='text-center'>Янгилаш</TableHead>
                  <TableHead className='text-center'>Ўчириш</TableHead>
                  <TableHead className='text-center'>Барчаси</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editingPermissions.map((perm, index) => (
                  <TableRow key={perm._id || index}>
                    <TableCell className='font-medium'>
                      {perm.collection_name}
                    </TableCell>
                    <TableCell className='text-center'>
                      <Checkbox
                        checked={perm.create}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            index,
                            'create',
                            checked as boolean
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className='text-center'>
                      <Checkbox
                        checked={perm.read}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            index,
                            'read',
                            checked as boolean
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className='text-center'>
                      <Checkbox
                        checked={perm.update}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            index,
                            'update',
                            checked as boolean
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className='text-center'>
                      <Checkbox
                        checked={perm.delete}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            index,
                            'delete',
                            checked as boolean
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className='text-center'>
                      <Checkbox
                        checked={isRowAllChecked(perm)}
                        onCheckedChange={(checked) =>
                          handleRowAllChange(index, checked as boolean)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className='mt-4 flex justify-end'>
              <Button
                type='button'
                variant={isAllChecked() ? 'destructive' : 'default'}
                onClick={() => handleToggleAll(!isAllChecked())}
              >
                {isAllChecked()
                  ? 'Рухсатни олиб ташлаш'
                  : 'Барчасига рухсат бериш'}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditModalOpen(false)}>
              Бекор қилиш
            </Button>
            <Button onClick={handleUpdatePermission} disabled={isUpdating}>
              {isUpdating ? 'Сақланмоқда...' : 'Сақлаш'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Рухсатни ўчириш</DialogTitle>
            <DialogDescription>
              {selectedPermission && (
                <>
                  <strong>{roleLabels[selectedPermission.role]}</strong> роли
                  учун барча рухсатларни ўчиришни хоҳлайсизми? Бу амални
                  қайтариб бўлмайди.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Бекор қилиш
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeletePermission}
              disabled={isDeleting}
            >
              {isDeleting ? 'Ўчирилмоқда...' : 'Ўчириш'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Permissions;
