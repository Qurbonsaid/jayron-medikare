import { UserId, User, UserCreateResponse } from '@/app/api/userApi/types'
import {
	useCreateUserMutation,
	useDeleteUserMutation,
	useGetUserByIdQuery,
	useGetUsersQuery,
	userApi,
	useUpdateUserMutation,
} from '@/app/api/userApi/userApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PermissionConstants } from '@/constants/Permissions'
import { RoleConstants } from '@/constants/Roles'
import { SectionConstants } from '@/constants/section'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import { ArrowLeft, Plus, Search, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const Settings = () => {
	const auditLogs = [
		{
			timestamp: '07.10.2025 14:32',
			user: 'Др. Алиев А.Р.',
			action: 'Яратилди',
			module: 'Янги ташриф',
			ip: '192.168.1.45',
		},
		{
			timestamp: '07.10.2025 14:15',
			user: 'Ресепшн: Усмонова М.',
			action: 'Янгиланди',
			module: 'Навбат',
			ip: '192.168.1.32',
		},
	]
	const navigate = useNavigate()
	const handleRequest = useHandleRequest()
	const [isUserModalOpen, setIsUserModalOpen] = useState(false)
	const [search, setSearch] = useState('')
	const [users, setUsers] = useState<User[]>([])
	const [totalPages, setTotalPages] = useState(1)
	const [role, setRole] = useState<string>('')
	const [page, setPage] = useState(1)
	const [editingUserId, setEditingUserId] = useState<string | null>(null)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
	const [selectedUserName, setSelectedUserName] = useState<string>('')
	const limit = 10

	// --- API HOOKLAR ---
	const [createUser] = useCreateUserMutation()
	const [updateUser] = useUpdateUserMutation() // ✅ PUT endpoint
	const { data: usersData, error: usersError } = useGetUsersQuery({
		page,
		limit,
		search,
		role,
	})
	const [deleteUser] = useDeleteUserMutation()
	const { data: editingUserData, refetch: refetchUser } = useGetUserByIdQuery(
		editingUserId!,
		{
			skip: !editingUserId, // agar editingUserId bo'lmasa fetch qilmaslik
		}
	)

	// --- FORM HOLATI ---
	const [form, setForm] = useState<UserCreateResponse>({
		fullname: '',
		username: '',
		email: '',
		phone: '',
		password: '',
		role: '',
		section: '',
		permissions: [],
		license_number: '',
	})

	// ✅ Yangi foydalanuvchi yaratish
	const handleCreateUser = async () => {
		await handleRequest({
			request: async () => await createUser(form).unwrap(),
			onSuccess: () => {
				toast.success('Фойдаланувчи муваффақиятли қўшилди')
				setIsUserModalOpen(false)
				setForm({
					fullname: '',
					username: '',
					email: '',
					phone: '',
					password: '',
					role: '',
					section: '',
					permissions: [],
					license_number: '',
				})
			},
			onError: error => {
				toast.error('Қўшишда хатолик')
				console.error(error)
			},
		})
	}

	// --- FORM HANDLER ---
	const handleChange = (
		field: keyof UserCreateResponse,
		value: string | string[]
	) => {
		setForm(prev => ({ ...prev, [field]: value }))
	}

	// --- PERMISSIONS HANDLER ---
	const togglePermission = (perm: string) => {
		setForm(prev => {
			const exists = prev.permissions.includes(perm)
			return {
				...prev,
				permissions: exists
					? prev.permissions.filter(p => p !== perm)
					: [...prev.permissions, perm],
			}
		})
	}

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value)
		setPage(1) // search qilganda 1-page ga qaytish
	}

	// --- Pagination Handler ---
	const goToPage = (p: number) => {
		if (p >= 1 && p <= totalPages) setPage(p)
	}

	const handleOpenEditUser = (user: UserId) => {
		const formData: UserCreateResponse = {
			fullname: user.fullname,
			username: user.username,
			email: user.email,
			phone: user.phone,
			password: '', // foydalanuvchi o'zgartirsa
			role: user.role,
			section: user.section,
			permissions: user.permissions || [],
			license_number: user.license_number || '',
		}
		setForm(formData)
		setIsUserModalOpen(true)
	}

	const handleSaveUser = async () => {
		// Agar password bo'sh bo'lsa, payloaddan olib tashlaymiz
		const payload = { ...form }
		if (!payload.password) {
			delete payload.password
		}

		if (editingUserId) {
			// ✅ UPDATE
			await handleRequest({
				request: async () =>
					await updateUser({ id: editingUserId, data: payload }).unwrap(),
				onSuccess: () => {
					toast.success('Фойдаланувчи маълумотлари янгиланди')
					setIsUserModalOpen(false)
					setEditingUserId(null)
					resetForm()
				},
				onError: error => {
					toast.error('Янгилашда хатолик')
					console.error(error)
				},
			})
		} else {
			// ✅ CREATE
			await handleRequest({
				request: async () => await createUser(payload).unwrap(),
				onSuccess: () => {
					toast.success('Фойдаланувчи муваффақиятли қўшилди')
					setIsUserModalOpen(false)
					resetForm()
				},
				onError: error => {
					toast.error('Қўшишда хатолик')
					console.error(error)
				},
			})
		}
	}

	const resetForm = () => {
		setForm({
			fullname: '',
			username: '',
			email: '',
			phone: '',
			password: '',
			role: '',
			section: '',
			permissions: [],
			license_number: '',
		})
		setEditingUserId(null)
	}

	// --- Open edit modal
	const handleOpenEditUserId = (userId: string) => {
		setEditingUserId(userId)
		setIsUserModalOpen(true)
	}

	// Dialogni ochish funksiyasi
	const handleOpenDeleteDialog = (userId: string, userName: string) => {
		setSelectedUserId(userId)
		setSelectedUserName(userName)
		setIsDeleteDialogOpen(true)
	}

	// Tasdiqlash
	const handleConfirmDelete = async () => {
		if (!selectedUserId) return

		await handleRequest({
			request: async () => await deleteUser(selectedUserId).unwrap(),
			onSuccess: () => {
				toast.success(`Фойдаланувчи ${selectedUserName} ўчирилди`)
				setIsDeleteDialogOpen(false)
				setSelectedUserId(null)
				setSelectedUserName('')
			},
			onError: error => {
				toast.error('Ўчиришда хатолик')
				console.error(error)
			},
		})
	}

	// Bekor qilish
	const handleCancelDelete = () => {
		setIsDeleteDialogOpen(false)
		setSelectedUserId(null)
		setSelectedUserName('')
	}

	useEffect(() => {
		if (usersData?.data) {
			setUsers(usersData.data)
		}
		if (usersData?.pagination) {
			setTotalPages(usersData.pagination.total_pages)
		}
		if (usersError) {
			toast.error('Фойдаланувчиларни олиб бўлмади')
			console.error(usersError)
		}
	}, [usersData, usersError])

	// --- Formni to'ldirish useEffect orqali
	useEffect(() => {
		if (editingUserData?.data) {
			const user = editingUserData.data
			setForm({
				fullname: user.fullname,
				username: user.username,
				email: user.email,
				phone: user.phone,
				password: '', // agar foydalanuvchi o'zgartirmasa bo'sh qoldiramiz
				role: user.role,
				section: user.section,
				permissions: user.permissions,
				license_number: user.license_number,
			})
		}
	}, [editingUserData])

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='bg-card border-b border-border sticky top-0 z-10'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className='w-5 h-5' />
            </Button>
            <div>
              <h1 className='text-2xl font-bold'>Созламалар</h1>
              <p className='text-sm text-muted-foreground'>
                Тизим ва фойдаланувчи созламалари
              </p>
            </div>
          </div>
        </div>
      </header>

			{/* Main Content */}
			<main className='container mx-auto px-4 py-6'>
				<Tabs defaultValue='users' className='space-y-6'>
					<TabsList className='grid w-full grid-cols-4'>
						<TabsTrigger value='users'>Фойдаланувчилар</TabsTrigger>
						<TabsTrigger value='clinic'>Клиника</TabsTrigger>
						<TabsTrigger value='notifications'>Билдиришномалар</TabsTrigger>
						<TabsTrigger value='audit'>Тарих</TabsTrigger>
					</TabsList>

					{/* Users Tab */}

					<TabsContent value='users'>
						<Card className='p-6'>
							<div className='flex items-center justify-between mb-4'>
								<h2 className='text-xl font-semibold'>
									Фойдаланувчилар рўйхати
								</h2>
								<Button
									onClick={() => {
										resetForm() // formani tozalaydi
										setEditingUserId(null) // eski tahrirlangan ID ni tozalaydi
										setIsUserModalOpen(true)
									}}
								>
									<Plus className='w-4 h-4 mr-2' />
									Янги фойдаланувчи
								</Button>
							</div>

							{/* Search & Role filter */}
							<div className='mb-4 flex flex-col sm:flex-row gap-2'>
								<Input
									placeholder='Фойдаланувчи исми ёки email бўйича қидириш...'
									value={search}
									onChange={handleSearchChange}
									className='flex-1'
								/>

								<select
									className='border border-border rounded-md px-3 py-2 bg-background'
									value={role}
									onChange={e => {
										setRole(e.target.value)
										setPage(1)
									}}
								>
									<option value=''>Barchasi</option>
									<option value={RoleConstants.ADMIN}>
										{RoleConstants.ADMIN}
									</option>
									<option value={RoleConstants.DOCTOR}>
										{RoleConstants.DOCTOR}
									</option>
									<option value={RoleConstants.RECEPTIONIST}>
										{RoleConstants.RECEPTIONIST}
									</option>
									<option value={RoleConstants.NURSE}>
										{RoleConstants.NURSE}
									</option>
								</select>
							</div>

							{/* Users table */}
							<div className='overflow-x-auto'>
								<table className='w-full text-sm'>
									<thead>
										<tr className='border-b'>
											<th className='text-left py-2 px-4'>N</th>
											<th className='text-left py-2 px-4'>ФИО</th>
											<th className='text-left py-2 px-4'>Рол</th>
											<th className='text-left py-2 px-4'>Бўлим</th>
											<th className='text-left py-2 px-4'>Email</th>
											<th className='text-left py-2 px-4'>Ҳолат</th>
											<th className='text-left py-2 px-4'>Ҳаракатлар</th>
										</tr>
									</thead>
									<tbody>
										{users.length > 0 ? (
											users.map((user, index) => (
												<tr
													key={user._id}
													className='border-b hover:bg-muted/40 transition-colors'
												>
													<td className='py-2 px-4 font-medium'>
														{(page - 1) * limit + (index + 1)}
													</td>
													<td className='py-2 px-4 font-medium'>
														{user.fullname}
													</td>
													<td className='py-2 px-4'>
														<Badge variant='outline'>{user.role}</Badge>
													</td>
													<td className='py-2 px-4'>{user.section}</td>
													<td className='py-2 px-4 text-muted-foreground'>
														{user.email}
													</td>
													<td className='py-2 px-4'>
														<Badge
															className={
																user.status === 'active'
																	? 'bg-success/10 text-success border-success/20 border'
																	: 'bg-destructive/10 text-destructive border-destructive/20 border'
															}
														>
															{user.status === 'active' ? 'Фаол' : 'Нофаол'}
														</Badge>
													</td>
													<td className='py-2 px-4'>
														<div className='flex gap-4'>
															<Button
																size='sm'
																variant='outline'
																onClick={() => {
																	handleOpenEditUserId(user._id)
																	handleOpenEditUser(user as UserId)
																}}
															>
																Таҳрирлаш
															</Button>
															<Button
																size='sm'
																variant='outline'
																className='text-danger'
																onClick={() =>
																	handleOpenDeleteDialog(
																		user._id,
																		user.username
																	)
																}
															>
																Ўчириш
															</Button>
														</div>
													</td>
												</tr>
											))
										) : (
											<tr>
												<td
													colSpan={7}
													className='text-center py-4 text-muted-foreground'
												>
													Фойдаланувчилар топилмади
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className='flex items-center justify-between mt-4'>
									<div className='flex gap-2'>
										<Button
											size='sm'
											onClick={() => goToPage(page - 1)}
											disabled={page === 1}
										>
											&larr; Назад
										</Button>
										<Button
											size='sm'
											onClick={() => goToPage(page + 1)}
											disabled={page === totalPages}
										>
											След &rarr;
										</Button>
									</div>
									<div className='text-sm text-muted-foreground'>
										{page} / {totalPages}
									</div>
									<div className='hidden sm:flex gap-1'>
										{Array.from({ length: totalPages }, (_, i) => (
											<Button
												key={i}
												size='sm'
												variant={page === i + 1 ? 'default' : 'outline'}
												onClick={() => goToPage(i + 1)}
											>
												{i + 1}
											</Button>
										))}
									</div>
								</div>
							)}
						</Card>
					</TabsContent>

          {/* Clinic Tab */}
          <TabsContent value='clinic' className='space-y-4'>
            <Card className='p-6'>
              <h2 className='text-xl font-semibold mb-6'>
                Клиника маълумотлари
              </h2>
              <div className='space-y-4 max-w-2xl'>
                <div>
                  <Label>Клиника номи</Label>
                  <Input defaultValue='JAYRON MEDSERVIS' />
                </div>
                <div>
                  <Label>Манзил</Label>
                  <Input defaultValue='Тошкент шаҳри, Юнусобод тумани' />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>Телефон</Label>
                    <Input defaultValue='+998 71 123 45 67' />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input defaultValue='info@jayron.uz' />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>Иш бошланиш вақти</Label>
                    <Input type='time' defaultValue='08:00' />
                  </div>
                  <div>
                    <Label>Иш тугаш вақти</Label>
                    <Input type='time' defaultValue='20:00' />
                  </div>
                </div>
                <div>
                  <Label>Тил</Label>
                  <Select defaultValue='uz'>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='uz'>Ўзбек тили</SelectItem>
                      <SelectItem value='ru'>Русский язык</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Логотип</Label>
                  <div className='flex items-center gap-4 mt-2'>
                    <div className='w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center'>
                      <span className='text-sm text-muted-foreground'>
                        Логотип
                      </span>
                    </div>
                    <Button variant='outline'>
                      <Upload className='w-4 h-4 mr-2' />
                      Юклаш
                    </Button>
                  </div>
                </div>
                <Button>Сақлаш</Button>
              </div>
            </Card>
          </TabsContent>

					{/* Notifications Tab */}
					<TabsContent value='notifications' className='space-y-4'>
						<Card className='p-6'>
							<h2 className='text-xl font-semibold mb-6'>SMS созламалари</h2>
							<div className='space-y-4 max-w-2xl'>
								<div>
									<Label>Провайдер</Label>
									<Select defaultValue='playmobile'>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='playmobile'>Playmobile</SelectItem>
											<SelectItem value='ucell'>Ucell</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label>API калит</Label>
									<Input type='password' placeholder='••••••••••••' />
								</div>
								<Button variant='outline'>Тест SMS юбориш</Button>
							</div>
						</Card>
						<Card className='p-6'>
							<h2 className='text-xl font-semibold mb-6'>
								Автоматик билдиришномалар
							</h2>
							<div className='space-y-4 max-w-2xl'>
								{/* <div className='flex items-center justify-between'>
                  <div>
                    <Label>Навбатдан 1 кун олдин эслатма</Label>
                    <p className='text-sm text-muted-foreground'>
                      Навбат вақтидан 1 кун олдин SMS юбориш
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label>Навбатдан 1 соат олдин эслатма</Label>
                    <p className='text-sm text-muted-foreground'>
                      Навбат вақтидан 1 соат олдин SMS юбориш
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div> */}
								<div className='flex items-center justify-between'>
									<div>
										<Label>Таҳлил натижалари тайёр</Label>
										<p className='text-sm text-muted-foreground'>
											Лаборатория натижалари тайёр бўлганда хабар бериш
										</p>
									</div>
									<Switch defaultChecked />
								</div>
							</div>
						</Card>
					</TabsContent>

					{/* Audit Log Tab */}
					<TabsContent value='audit' className='space-y-4'>
						<Card className='p-6'>
							<div className='flex items-center justify-between mb-6'>
								<h2 className='text-xl font-semibold'>Аудит тарихи</h2>
								<Button variant='outline'>CSV юклаш</Button>
							</div>
							<div className='mb-4'>
								<div className='relative'>
									<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
									<Input
										placeholder='Фойдаланувчи қидириш...'
										className='pl-10'
									/>
								</div>
							</div>
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b'>
											<th className='text-left py-3 px-4 font-medium text-muted-foreground'>
												Вақт
											</th>
											<th className='text-left py-3 px-4 font-medium text-muted-foreground'>
												Фойдаланувчи
											</th>
											<th className='text-left py-3 px-4 font-medium text-muted-foreground'>
												Ҳаракат
											</th>
											<th className='text-left py-3 px-4 font-medium text-muted-foreground'>
												Модул
											</th>
											<th className='text-left py-3 px-4 font-medium text-muted-foreground'>
												IP манзил
											</th>
										</tr>
									</thead>
									<tbody>
										{auditLogs.map((log, index) => (
											<tr
												key={index}
												className='border-b hover:bg-muted/50 transition-colors'
											>
												<td className='py-3 px-4 text-sm text-muted-foreground'>
													{log.timestamp}
												</td>
												<td className='py-3 px-4 font-medium'>{log.user}</td>
												<td className='py-3 px-4'>
													<Badge variant='outline'>{log.action}</Badge>
												</td>
												<td className='py-3 px-4'>{log.module}</td>
												<td className='py-3 px-4 text-sm text-muted-foreground font-mono'>
													{log.ip}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</Card>
					</TabsContent>
				</Tabs>
			</main>

			{/* Add User Modal */}
			<Dialog
				open={isUserModalOpen}
				onOpenChange={open => {
					setIsUserModalOpen(open)
					if (!open) {
						// Modal yopilganda formni tozalash
						resetForm()
						setEditingUserId(null)
						setForm({
							fullname: '',
							username: '',
							email: '',
							phone: '',
							password: '',
							role: '',
							section: '',
							permissions: [],
							license_number: '',
						})
					}
				}}
			>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle className='text-2xl'>
							{editingUserId
								? 'Фойдаланувчи таҳрири'
								: 'Янги фойдаланувчи қўшиш'}
						</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label>Тўлиқ исми</Label>
								<Input
									value={form.fullname}
									onChange={e => handleChange('fullname', e.target.value)}
								/>
							</div>
							<div>
								<Label>Фойдаланувчи номи</Label>
								<Input
									value={form.username}
									onChange={e => handleChange('username', e.target.value)}
								/>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label>Email</Label>
								<Input
									value={form.email}
									onChange={e => handleChange('email', e.target.value)}
								/>
							</div>
							<div>
								<Label>Телефон</Label>
								<Input
									value={form.phone}
									onChange={e => handleChange('phone', e.target.value)}
								/>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label>Рол</Label>
								<Select
									value={form.role} // shu yerga qo‘shamiz
									onValueChange={val => handleChange('role', val)}
								>
									<SelectTrigger>
										<SelectValue placeholder='Танланг...' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={RoleConstants.DOCTOR}>
											Шифокор
										</SelectItem>
										<SelectItem value={RoleConstants.NURSE}>Ҳамшира</SelectItem>
										<SelectItem value={RoleConstants.RECEPTIONIST}>
											Ресепшн
										</SelectItem>
										<SelectItem value={RoleConstants.ADMIN}>Админ</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label>Бўлим</Label>
								<Select
									value={form.section} // shu yerga qo‘shamiz
									onValueChange={val => handleChange('section', val)}
								>
									<SelectTrigger>
										<SelectValue placeholder='Танланг...' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={SectionConstants.KARDIOLOGIYA}>
											{SectionConstants.KARDIOLOGIYA}
										</SelectItem>
										<SelectItem value={SectionConstants.NEVROLOGIYA}>
											{SectionConstants.NEVROLOGIYA}
										</SelectItem>
										<SelectItem value={SectionConstants.UZI_MUTAHASSISI}>
											{SectionConstants.UZI_MUTAHASSISI}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div>
							<Label>Лицензия рақами (шифокорлар учун)</Label>
							<Input
								value={form.license_number}
								onChange={e => handleChange('license_number', e.target.value)}
								autoComplete='off'
							/>
						</div>

						<div>
							<Label>Парол</Label>
							<Input
								type='password'
								value={form.password}
								onChange={e => handleChange('password', e.target.value)}
								autoComplete='new-password'
							/>
						</div>

						<div>
							<Label className='mb-3 block'>Рухсатлар</Label>
							{[
								{
									key: 'patients.view',
									label: 'Беморларни кўриш',
									value: PermissionConstants.READ,
								},
								{
									key: 'patients.edit',
									label: 'Беморларни таҳрирлаш',
									value: PermissionConstants.WRITE,
								},
								{
									key: 'lab.input',
									label: 'Таҳлил натижаларини киритиш',
									value: PermissionConstants.DELETE,
								},
							].map(perm => (
								<div key={perm.key} className='flex items-center space-x-2'>
									<Checkbox
										id={perm.key}
										checked={form.permissions.includes(perm.value)}
										onCheckedChange={() => togglePermission(perm.value)}
									/>
									<label htmlFor={perm.key} className='text-sm'>
										{perm.label}
									</label>
								</div>
							))}
						</div>
					</div>

					<DialogFooter>
						<Button variant='outline' onClick={() => setIsUserModalOpen(false)}>
							Бекор қилиш
						</Button>
						<Button
							onClick={() =>
								editingUserId ? handleSaveUser() : handleCreateUser()
							}
						>
							{editingUserId ? 'Янгилаш' : 'Қўшиш'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogTitle>Foydalanuvchini o'chirish</DialogTitle>
					<DialogDescription>
						Rostan ham <span className='font-semibold'>{selectedUserName}</span>{' '}
						foydalanuvchisini o'chirmoqchimisiz?
					</DialogDescription>
					<DialogFooter className='flex justify-end gap-2'>
						<Button variant='outline' onClick={handleCancelDelete}>
							Bekor qilish
						</Button>
						<Button variant='destructive' onClick={handleConfirmDelete}>
							Ha, oʻchirilsin
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default Settings
