import {
	useGetAllSettingsQuery,
	useUpdateSettingsMutation,
} from '@/app/api/settingsApi/settingsApi'
import { useUploadCreateMutation } from '@/app/api/upload/uploadApi'
import { User, UserCreateResponse, UserId } from '@/app/api/userApi/types'
import {
	useCreateUserMutation,
	useDeleteUserMutation,
	useGetUserByIdQuery,
	useGetUsersQuery,
	useUpdateUserMutation,
} from '@/app/api/userApi/userApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { RoleConstants } from '@/constants/Roles'
import { SectionConstants } from '@/constants/section'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import { settingsSchema } from '@/validation/validationSettings'
import { userSchema } from '@/validation/validationUser'
import { Edit, Plus, Search, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export type Settings = {
	clinic_name: string
	address: string
	phone: string
	email: string
	work_start_time: string
	work_end_time: string
	logo_path: string
}

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
	const [getAllSettings, setGetAllSettings] = useState<Settings | null>(null)
	// --- VALIDATION (Settings ichida) ---
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [errorsUser, setErrorsUser] = useState<Record<string, string>>({})
	const [isUploading, setIsUploading] = useState(false)

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
	const { data: settingsGetAll } = useGetAllSettingsQuery()
	const [updateSettings] = useUpdateSettingsMutation()
	// --- Faylni yuklash (faqat preview va pathni olish)
	const [uploadCreate] = useUploadCreateMutation()

	// --- FORM HOLATI ---
	const [form, setForm] = useState<UserCreateResponse>({
		fullname: '',
		username: '',
		email: '',
		phone: '',
		password: '',
		role: '',
		section: '',
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
					license_number: '',
				})
			},
			onError: (error: any) => {
				console.error('Parameter save error:', error)

				// 1️⃣ Avval backenddan structured error obyektni tekshirish
				if (error?.error?.msg) {
					toast.error(error.error.msg)
					return
				}

				// 2️⃣ Avvalgi errors object/arrayni tekshirish
				if (error?.data?.errors) {
					const backendErrors: Record<string, string> = {}

					if (Array.isArray(error.data.errors)) {
						error.data.errors.forEach((err: any) => {
							if (err.field && err.message) {
								backendErrors[err.field] = err.message
							}
						})
					} else if (typeof error.data.errors === 'object') {
						Object.entries(error.data.errors).forEach(([key, value]) => {
							backendErrors[key] = Array.isArray(value)
								? value[0]
								: String(value)
						})
					}

					if (Object.keys(backendErrors).length > 0) {
						setErrors(prev => ({ ...prev, ...backendErrors }))
					}
				}

				// 3️⃣ Fallback: error.msg string bo‘lsa
				else if (typeof error?.msg === 'string') {
					toast.error(error.msg)
				}
			},
		})
	}

	// --- FORM HANDLER ---
	const handleChange = (field, value) => {
		setForm(prev => ({ ...prev, [field]: value }))

		// Agar xato shu fieldda bo‘lsa, uni tozalaymiz
		if (errorsUser[field]) {
			setErrorsUser(prev => ({ ...prev, [field]: '' }))
		}
	}

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value)
		setPage(1) // search qilganda 1-page ga qaytish
	}

	// --- Pagination Handler ---
	const goToPage = (p: number) => {
		if (p >= 1 && p <= totalPages) setPage(p)
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
				onError: (error: any) => {
					console.error('Parameter save error:', error)

					// 1️⃣ Avval backenddan structured error obyektni tekshirish
					if (error?.error?.msg) {
						toast.error(error.error.msg)
						return
					}

					// 2️⃣ Avvalgi errors object/arrayni tekshirish
					if (error?.data?.errors) {
						const backendErrors: Record<string, string> = {}

						if (Array.isArray(error.data.errors)) {
							error.data.errors.forEach((err: any) => {
								if (err.field && err.message) {
									backendErrors[err.field] = err.message
								}
							})
						} else if (typeof error.data.errors === 'object') {
							Object.entries(error.data.errors).forEach(([key, value]) => {
								backendErrors[key] = Array.isArray(value)
									? value[0]
									: String(value)
							})
						}

						if (Object.keys(backendErrors).length > 0) {
							setErrors(prev => ({ ...prev, ...backendErrors }))
						}
					}

					// 3️⃣ Fallback: error.msg string bo‘lsa
					else if (typeof error?.msg === 'string') {
						toast.error(error.msg)
					}
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
				onError: (error: any) => {
					console.error('Parameter save error:', error)

					// 1️⃣ Avval backenddan structured error obyektni tekshirish
					if (error?.error?.msg) {
						toast.error(error.error.msg)
						return
					}

					// 2️⃣ Avvalgi errors object/arrayni tekshirish
					if (error?.data?.errors) {
						const backendErrors: Record<string, string> = {}

						if (Array.isArray(error.data.errors)) {
							error.data.errors.forEach((err: any) => {
								if (err.field && err.message) {
									backendErrors[err.field] = err.message
								}
							})
						} else if (typeof error.data.errors === 'object') {
							Object.entries(error.data.errors).forEach(([key, value]) => {
								backendErrors[key] = Array.isArray(value)
									? value[0]
									: String(value)
							})
						}

						if (Object.keys(backendErrors).length > 0) {
							setErrors(prev => ({ ...prev, ...backendErrors }))
						}
					}

					// 3️⃣ Fallback: error.msg string bo‘lsa
					else if (typeof error?.msg === 'string') {
						toast.error(error.msg)
					}
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
			license_number: '',
		})
		setEditingUserId(null)
	}

	// Dialogni ochish funksiyasi
	const handleOpenDeleteDialog = (userId: string, fullname: string) => {
		setSelectedUserId(userId)
		setSelectedUserName(fullname)
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
			onError: (error: any) => {
				console.error('Parameter save error:', error)

				// 1️⃣ Avval backenddan structured error obyektni tekshirish
				if (error?.error?.msg) {
					toast.error(error.error.msg)
					return
				}

				// 2️⃣ Avvalgi errors object/arrayni tekshirish
				if (error?.data?.errors) {
					const backendErrors: Record<string, string> = {}

					if (Array.isArray(error.data.errors)) {
						error.data.errors.forEach((err: any) => {
							if (err.field && err.message) {
								backendErrors[err.field] = err.message
							}
						})
					} else if (typeof error.data.errors === 'object') {
						Object.entries(error.data.errors).forEach(([key, value]) => {
							backendErrors[key] = Array.isArray(value)
								? value[0]
								: String(value)
						})
					}

					if (Object.keys(backendErrors).length > 0) {
						setErrors(prev => ({ ...prev, ...backendErrors }))
					}
				}

				// 3️⃣ Fallback: error.msg string bo‘lsa
				else if (typeof error?.msg === 'string') {
					toast.error(error.msg)
				}
			},
		})
	}

	// Bekor qilish
	const handleCancelDelete = () => {
		setIsDeleteDialogOpen(false)
		setSelectedUserId(null)
		setSelectedUserName('')
	}

	const handleSaveSettings = async () => {
		if (isUploading) {
			toast.warning('Илтимос, логотип юкланиб бўлишини кутинг ⏳')
			return
		}
		if (!getAllSettings) return
		try {
			await updateSettings(getAllSettings).unwrap()
			toast.success('Маълумотлар муваффақиятли сақланди ✅')
		} catch (err) {
			toast.error('Сақлашда хатолик ❌')
			console.error(err)
		}
	}

	const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const formData = new FormData()
		formData.append('file', file)

		setIsUploading(true)
		try {
			const res = await uploadCreate(formData).unwrap()
			console.log(res)
			if (res?.file_path) {
				handleChangee('logo_path', res.file_path)
				toast.success('Логотип юкланди ✅')
			} else {
				toast.error('Файл йўли қайтмади ❌')
			}
		} catch (err) {
			console.error('Upload error:', err)
			toast.error('Логотип юклашда хатолик ❌')
		} finally {
			setIsUploading(false)
		}
	}

	const handleChangee = (field: keyof Settings, value: string) => {
		setGetAllSettings(prev => ({ ...prev, [field]: value }))

		// Agar shu field uchun error bo‘lsa, uni tozalaymiz
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }))
		}
	}

	const onSaveSettings = () => {
		const result = settingsSchema.safeParse(getAllSettings)
		if (!result.success) {
			const newErrors = {}
			result.error.errors.forEach(err => {
				newErrors[err.path[0]] = err.message
			})
			setErrors(newErrors)
			return
		}
		handleSaveSettings()
	}

	const onSaveUser = async () => {
		const schema = userSchema(!!editingUserId) // tahrirlashda password optional
		const result = schema.safeParse(form)

		if (!result.success) {
			const newErrors: Record<string, string> = {}
			result.error.errors.forEach(err => {
				newErrors[err.path[0]] = err.message
			})
			setErrorsUser(newErrors)
			return
		}

		// Agar editingUserId bo'lsa -> update, yo'q bo'lsa -> create
		if (editingUserId) {
			await handleSaveUser() // foydalanuvchini yangilash
		} else {
			await handleCreateUser() // yangi foydalanuvchi qo'shish
		}
	}

	const handleEditUser = (user: UserId) => {
		setEditingUserId(user._id)
		const formData: UserCreateResponse = {
			fullname: user.fullname,
			username: user.username,
			email: user.email,
			phone: user.phone,
			password: '',
			role: user.role,
			section: user.section,
			license_number: user.license_number || '',
		}
		setForm(formData)
		setIsUserModalOpen(true)
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
				license_number: user.license_number,
			})
		}
	}, [editingUserData])

	// SettingGetAll
	useEffect(() => {
		if (settingsGetAll?.data) {
			setGetAllSettings(settingsGetAll.data)
		}
	}, [settingsGetAll])

	return (
		<div className='min-h-screen bg-background'>
			{/* Main Content */}
			<main className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
				<Tabs defaultValue='users' className='space-y-4 sm:space-y-6'>
					<TabsList className='grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 h-auto p-1'>
						<TabsTrigger value='users' className='text-xs sm:text-sm py-2'>
							Фойдаланувчилар
						</TabsTrigger>
						<TabsTrigger value='clinic' className='text-xs sm:text-sm py-2'>
							Клиника
						</TabsTrigger>
						<TabsTrigger
							value='notifications'
							className='text-xs sm:text-sm py-2'
						>
							Билдиришномалар
						</TabsTrigger>
						<TabsTrigger value='audit' className='text-xs sm:text-sm py-2'>
							Тарих
						</TabsTrigger>
					</TabsList>

					{/* Users Tab */}
					<TabsContent value='users'>
						<Card className='p-3 sm:p-4 lg:p-6'>
							<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3'>
								<h2 className='text-lg sm:text-xl font-semibold'>
									Фойдаланувчилар рўйхати
								</h2>
								<Button
									onClick={() => {
										resetForm()
										setEditingUserId(null)
										setIsUserModalOpen(true)
									}}
									className='w-full sm:w-auto text-xs sm:text-sm'
									size='sm'
								>
									<Plus className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
									Янги фойдаланувчи
								</Button>
							</div>

							{/* Search & Role filter */}
							<div className='mb-3 sm:mb-4 flex flex-col sm:flex-row gap-2 flex-wrap'>
								<Input
									placeholder='Қидириш...'
									value={search}
									onChange={handleSearchChange}
									className='flex-1 text-xs sm:text-sm h-9 sm:h-10'
								/>

								<select
									className='border border-border rounded-md px-2 sm:px-3 py-2 bg-background text-xs sm:text-sm h-9 sm:h-10 w-full sm:w-auto'
									value={role}
									onChange={e => {
										setRole(e.target.value)
										setPage(1)
									}}
								>
									<option value=''>Барчаси</option>
									<option value={RoleConstants.ADMIN}>Admin</option>
									<option value={RoleConstants.DOCTOR}>Shifokor</option>
									<option value={RoleConstants.RECEPTIONIST}>Qabulxona</option>
									<option value={RoleConstants.NURSE}>Hamshira</option>
								</select>
							</div>

							{/* Mobile Card View */}
							<div className='block lg:hidden space-y-3 sm:space-y-4'>
								{users.length > 0 &&
									users.map((user, index) => (
										<Card
											key={user._id}
											className='rounded-xl sm:rounded-2xl shadow-md border border-gray-100 overflow-hidden'
										>
											<div className='p-2.5 sm:p-3 space-y-2'>
												<div className='flex items-start justify-between gap-2'>
													<div className='flex-1 min-w-0'>
														<h3 className='font-semibold text-sm sm:text-base text-gray-900 truncate'>
															{user.fullname}
														</h3>
														<p className='text-[10px] sm:text-xs text-muted-foreground'>
															ID:{' '}
															<span className='font-medium'>
																{(page - 1) * limit + (index + 1)}
															</span>
														</p>
														<p className='text-[10px] sm:text-xs text-muted-foreground'>
															Рол:{' '}
															<span className='font-medium'>{user.role}</span>
														</p>
														<p className='text-[10px] sm:text-xs text-muted-foreground'>
															Бўлим:{' '}
															<span className='font-medium'>
																{user.section}
															</span>
														</p>
														<p className='text-[10px] sm:text-xs text-muted-foreground truncate'>
															Email:{' '}
															<span className='font-medium'>{user.email}</span>
														</p>
														<p className='text-[10px] sm:text-xs text-muted-foreground'>
															Ҳолат:{' '}
															<Badge
																className={
																	user.status === 'active'
																		? 'bg-success/10 text-success border-success/20 border text-[9px] sm:text-[10px] px-1.5 py-0.5'
																		: 'bg-destructive/10 text-destructive border-destructive/20 border text-[9px] sm:text-[10px] px-1.5 py-0.5'
																}
															>
																{user.status === 'active' ? 'Фаол' : 'Нофаол'}
															</Badge>
														</p>
													</div>
													<span className='text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium whitespace-nowrap'>
														#{index + 1}
													</span>
												</div>

												<div className='flex gap-1.5 sm:gap-2 pt-2'>
													<Button
														size='sm'
														variant='outline'
														className='flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs py-1.5 h-7 sm:h-8'
														onClick={() => handleEditUser(user as UserId)}
													>
														<Edit size={12} className='sm:w-3 sm:h-3' />
														<span className='hidden xs:inline'>Tahrirlash</span>
														<span className='xs:hidden'>Edit</span>
													</Button>

													<Dialog
														open={
															isDeleteDialogOpen && selectedUserId === user._id
														}
														onOpenChange={setIsDeleteDialogOpen}
													>
														<DialogTrigger asChild>
															<Button
																size='sm'
																variant='outline'
																className='flex-1 flex items-center justify-center gap-1 text-red-600 border-red-300 hover:bg-red-50 text-[10px] sm:text-xs py-1.5 h-7 sm:h-8'
																onClick={() =>
																	handleOpenDeleteDialog(
																		user._id,
																		user.fullname
																	)
																}
															>
																<Trash2 size={12} className='sm:w-3 sm:h-3' />
																<span className='hidden xs:inline'>
																	O'chirish
																</span>
																<span className='xs:hidden'>Del</span>
															</Button>
														</DialogTrigger>

														<DialogContent className='max-w-[90vw] sm:max-w-xs rounded-xl mx-4'>
															<DialogTitle className='text-sm sm:text-base'>
																Foydalanuvchini o'chirish
															</DialogTitle>
															<DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
																Rostan ham{' '}
																<span className='font-semibold'>
																	{selectedUserName}
																</span>{' '}
																foydalanuvchisini o'chirmoqchimisiz?
															</DialogDescription>
															<DialogFooter className='flex flex-row justify-end gap-2 pt-2'>
																<Button
																	variant='outline'
																	size='sm'
																	className='h-7 sm:h-8 text-xs'
																	onClick={handleCancelDelete}
																>
																	Yo'q
																</Button>
																<Button
																	size='sm'
																	className='bg-red-600 text-white h-7 sm:h-8 text-xs'
																	onClick={handleConfirmDelete}
																>
																	Ha
																</Button>
															</DialogFooter>
														</DialogContent>
													</Dialog>
												</div>
											</div>
										</Card>
									))}
							</div>

							{/* Desktop Table View - UNCHANGED */}
							<div className='hidden lg:block'>
								<Card className='card-shadow'>
									<div className='overflow-x-auto'>
										<table className='w-full'>
											<thead className='bg-muted/50'>
												<tr>
													{[
														'ID',
														'ФИО',
														'Рол',
														'Бўлим',
														'Email',
														'Ҳолат',
														'Ҳаракатлар',
													].map(i => (
														<th
															key={i}
															className='px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold'
														>
															{i}
														</th>
													))}
												</tr>
											</thead>
											<tbody className='divide-y'>
												{users.length > 0 &&
													users.map((user, index) => (
														<tr
															key={user._id}
															className='hover:bg-accent/50 transition-smooth'
														>
															<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-medium text-primary'>
																{(page - 1) * limit + (index + 1)}
															</td>
															<td className='px-4 xl:px-6 py-3 xl:py-4'>
																<div className='font-medium text-sm xl:text-base'>
																	{user.fullname}
																</div>
															</td>
															<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
																<Badge variant='outline'>{user.role}</Badge>
															</td>
															<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
																{user.section}
															</td>
															<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm text-muted-foreground'>
																{user.email}
															</td>
															<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
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
															<td className='px-4 xl:px-6 py-3 xl:py-4'>
																<div className='flex justify-center gap-3'>
																	<Button
																		size='icon'
																		variant='outline'
																		className='h-7 w-7'
																		onClick={() =>
																			handleEditUser(user as UserId)
																		}
																	>
																		<Edit size={16} />
																	</Button>

																	<Dialog
																		open={
																			isDeleteDialogOpen &&
																			selectedUserId === user._id
																		}
																		onOpenChange={setIsDeleteDialogOpen}
																	>
																		<DialogTrigger asChild>
																			<Button
																				size='icon'
																				variant='outline'
																				className='h-7 w-7 text-red-500 border-red-300 hover:bg-red-50'
																				onClick={() =>
																					handleOpenDeleteDialog(
																						user._id,
																						user.fullname
																					)
																				}
																			>
																				<Trash2 size={16} />
																			</Button>
																		</DialogTrigger>
																		<DialogContent className='max-w-xs rounded-xl'>
																			<DialogTitle>Foyda o'chirish</DialogTitle>
																			<DialogDescription>
																				Rostan ham{' '}
																				<span className='font-semibold'>
																					{selectedUserName}
																				</span>{' '}
																				foydalanuvchisini o'chirmoqchimisiz?
																			</DialogDescription>
																			<DialogFooter className='flex justify-end gap-2'>
																				<Button
																					variant='outline'
																					onClick={handleCancelDelete}
																				>
																					Yo'q
																				</Button>
																				<Button
																					className='bg-red-600 text-white'
																					onClick={handleConfirmDelete}
																				>
																					Ha
																				</Button>
																			</DialogFooter>
																		</DialogContent>
																	</Dialog>
																</div>
															</td>
														</tr>
													))}
											</tbody>
										</table>
									</div>
								</Card>
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className='flex flex-col sm:flex-row items-center justify-between mt-3 sm:mt-4 gap-3'>
									<div className='flex gap-2 w-full sm:w-auto'>
										<Button
											size='sm'
											onClick={() => goToPage(page - 1)}
											disabled={page === 1}
											className='flex-1 sm:flex-none text-xs h-8'
										>
											&larr; Назад
										</Button>
										<Button
											size='sm'
											onClick={() => goToPage(page + 1)}
											disabled={page === totalPages}
											className='flex-1 sm:flex-none text-xs h-8'
										>
											След &rarr;
										</Button>
									</div>
									<div className='text-xs sm:text-sm text-muted-foreground order-first sm:order-none'>
										{page} / {totalPages}
									</div>
									<div className='hidden md:flex gap-1'>
										{Array.from({ length: totalPages }, (_, i) => (
											<Button
												key={i}
												size='sm'
												variant={page === i + 1 ? 'default' : 'outline'}
												onClick={() => goToPage(i + 1)}
												className='text-xs h-8'
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
					<TabsContent value='clinic' className='space-y-3 sm:space-y-4'>
						<Card className='p-4 sm:p-5 lg:p-6'>
							<h2 className='text-lg sm:text-xl font-semibold mb-4 sm:mb-6'>
								Клиника маълумотлари
							</h2>
							<div className='space-y-3 sm:space-y-4 max-w-2xl'>
								<div>
									<Label className='text-xs sm:text-sm'>Клиника номи</Label>
									<Input
										value={getAllSettings?.clinic_name || ''}
										onChange={e => handleChangee('clinic_name', e.target.value)}
										className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
									/>
									{errors.clinic_name && (
										<p className='text-red-500 text-xs sm:text-sm mt-1'>
											{errors.clinic_name}
										</p>
									)}
								</div>

								<div>
									<Label className='text-xs sm:text-sm'>Манзил</Label>
									<Input
										value={getAllSettings?.address || ''}
										onChange={e => handleChangee('address', e.target.value)}
										className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
									/>
									{errors.address && (
										<p className='text-red-500 text-xs sm:text-sm mt-1'>
											{errors.address}
										</p>
									)}
								</div>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
									<div>
										<Label className='text-xs sm:text-sm'>Телефон</Label>
										<Input
											value={getAllSettings?.phone || ''}
											onChange={e => handleChangee('phone', e.target.value)}
											className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
										/>
										{errors.phone && (
											<p className='text-red-500 text-xs sm:text-sm mt-1'>
												{errors.phone}
											</p>
										)}
									</div>
									<div>
										<Label className='text-xs sm:text-sm'>Email</Label>
										<Input
											value={getAllSettings?.email || ''}
											onChange={e => handleChangee('email', e.target.value)}
											className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
										/>
										{errors.email && (
											<p className='text-red-500 text-xs sm:text-sm mt-1'>
												{errors.email}
											</p>
										)}
									</div>
								</div>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
									<div>
										<Label className='text-xs sm:text-sm'>
											Иш бошланиш вақти
										</Label>
										<Input
											type='time'
											value={getAllSettings?.work_start_time || ''}
											onChange={e =>
												handleChangee('work_start_time', e.target.value)
											}
											className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
										/>
										{errors.work_start_time && (
											<p className='text-red-500 text-xs sm:text-sm mt-1'>
												{errors.work_start_time}
											</p>
										)}
									</div>
									<div>
										<Label className='text-xs sm:text-sm'>Иш тугаш вақти</Label>
										<Input
											type='time'
											value={getAllSettings?.work_end_time || ''}
											onChange={e =>
												handleChangee('work_end_time', e.target.value)
											}
											className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
										/>
										{errors.work_end_time && (
											<p className='text-red-500 text-xs sm:text-sm mt-1'>
												{errors.work_end_time}
											</p>
										)}
									</div>
								</div>

								<div>
									<Label className='text-xs sm:text-sm'>Логотип</Label>
									<div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-2'>
										{/* <div className='w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted/20'>
																			{getAllSettings?.logo_path ? (
																					<img
																							src={getAllSettings.logo_path}
																							alt='Logo'
																							className='w-full h-full object-cover'
																					/>
																			) : (
																					<span className='text-xs sm:text-sm text-muted-foreground'>
																							Логотип
																					</span>
																			)}
																	</div> */}
										<div className='w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted/20'>
											{getAllSettings?.logo_path ? (
												<img
													src={getAllSettings.logo_path}
													alt='Logo'
													className='w-full h-full object-cover object-center'
												/>
											) : (
												<span className='text-xs sm:text-sm text-muted-foreground'>
													Логотип
												</span>
											)}
										</div>

										<div>
											<input
												type='file'
												accept='image/*'
												id='logoUpload'
												style={{ display: 'none' }}
												onChange={handleUploadFile}
											/>
											<Button
												variant='outline'
												onClick={() =>
													document.getElementById('logoUpload')?.click()
												}
												size='sm'
												className='text-xs sm:text-sm'
											>
												<Upload className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
												Юклаш
											</Button>
										</div>
									</div>
									{errors.logo_path && (
										<p className='text-red-500 text-xs sm:text-sm mt-1'>
											{errors.logo_path}
										</p>
									)}
								</div>

								<Button
									onClick={onSaveSettings}
									disabled={isUploading}
									className='w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10'
								>
									{isUploading ? 'Логотип юкланмоқда...' : 'Сақлаш'}
								</Button>
							</div>
						</Card>
					</TabsContent>

					{/* Notifications Tab */}
					<TabsContent value='notifications' className='space-y-3 sm:space-y-4'>
						<Card className='p-4 sm:p-5 lg:p-6'>
							<h2 className='text-lg sm:text-xl font-semibold mb-4 sm:mb-6'>
								SMS созламалари
							</h2>
							<div className='space-y-3 sm:space-y-4 max-w-2xl'>
								<div>
									<Label className='text-xs sm:text-sm'>Провайдер</Label>
									<Select defaultValue='playmobile'>
										<SelectTrigger className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem
												value='playmobile'
												className='text-xs sm:text-sm'
											>
												Playmobile
											</SelectItem>
											<SelectItem value='ucell' className='text-xs sm:text-sm'>
												Ucell
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label className='text-xs sm:text-sm'>API калит</Label>
									<Input
										type='password'
										placeholder='••••••••••••'
										className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
									/>
								</div>
								<Button
									variant='outline'
									className='w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10'
								>
									Тест SMS юбориш
								</Button>
							</div>
						</Card>
						<Card className='p-4 sm:p-5 lg:p-6'>
							<h2 className='text-lg sm:text-xl font-semibold mb-4 sm:mb-6'>
								Автоматик билдиришномалар
							</h2>
							<div className='space-y-3 sm:space-y-4 max-w-2xl'>
								<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4'>
									<div className='flex-1'>
										<Label className='text-xs sm:text-sm'>
											Таҳлил натижалари тайёр
										</Label>
										<p className='text-[10px] sm:text-xs text-muted-foreground mt-1'>
											Лаборатория натижалари тайёр бўлганда хабар бериш
										</p>
									</div>
									<Switch defaultChecked />
								</div>
							</div>
						</Card>
					</TabsContent>

					{/* Audit Log Tab */}
					<TabsContent value='audit' className='space-y-3 sm:space-y-4'>
						<Card className='p-4 sm:p-5 lg:p-6'>
							<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3'>
								<h2 className='text-lg sm:text-xl font-semibold'>
									Аудит тарихи
								</h2>
								<Button
									variant='outline'
									size='sm'
									className='w-full sm:w-auto text-xs sm:text-sm'
								>
									CSV юклаш
								</Button>
							</div>
							<div className='mb-3 sm:mb-4'>
								<div className='relative'>
									<Search className='absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground' />
									<Input
										placeholder='Фойдаланувчи қидириш...'
										className='pl-8 sm:pl-10 text-xs sm:text-sm h-9 sm:h-10'
									/>
								</div>
							</div>
							<div className='overflow-x-auto -mx-4 sm:mx-0'>
								<div className='inline-block min-w-full align-middle'>
									<table className='min-w-full'>
										<thead>
											<tr className='border-b'>
												<th className='text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground text-[10px] sm:text-xs lg:text-sm whitespace-nowrap'>
													Вақт
												</th>
												<th className='text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground text-[10px] sm:text-xs lg:text-sm whitespace-nowrap'>
													Фойдаланувчи
												</th>
												<th className='text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground text-[10px] sm:text-xs lg:text-sm whitespace-nowrap'>
													Ҳаракат
												</th>
												<th className='text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground text-[10px] sm:text-xs lg:text-sm whitespace-nowrap'>
													Модул
												</th>
												<th className='text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground text-[10px] sm:text-xs lg:text-sm whitespace-nowrap'>
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
													<td className='py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs lg:text-sm text-muted-foreground whitespace-nowrap'>
														{log.timestamp}
													</td>
													<td className='py-2 sm:py-3 px-2 sm:px-4 font-medium text-[10px] sm:text-xs lg:text-sm whitespace-nowrap'>
														{log.user}
													</td>
													<td className='py-2 sm:py-3 px-2 sm:px-4'>
														<Badge
															variant='outline'
															className='text-[9px] sm:text-[10px] px-1.5 py-0.5'
														>
															{log.action}
														</Badge>
													</td>
													<td className='py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs lg:text-sm whitespace-nowrap'>
														{log.module}
													</td>
													<td className='py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs lg:text-sm text-muted-foreground font-mono whitespace-nowrap'>
														{log.ip}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
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
						resetForm()
						setEditingUserId(null)
						setErrorsUser({})
						setForm({
							fullname: '',
							username: '',
							email: '',
							phone: '',
							password: '',
							role: '',
							section: '',
							license_number: '',
						})
					}
				}}
			>
				<DialogContent className='max-w-[95vw] sm:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='text-lg sm:text-xl lg:text-2xl'>
							{editingUserId
								? 'Фойдаланувчи таҳрири'
								: 'Янги фойдаланувчи қўшиш'}
						</DialogTitle>
					</DialogHeader>
					<div className='space-y-3 sm:space-y-4'>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
							<div>
								<Label className='text-xs sm:text-sm'>Тўлиқ исми</Label>
								<Input
									value={form.fullname}
									onChange={e => handleChange('fullname', e.target.value)}
									placeholder='Исмингизни киритинг'
									className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
								/>
								{errorsUser.fullname && (
									<p className='text-red-500 text-xs sm:text-sm mt-1'>
										{errorsUser.fullname}
									</p>
								)}
							</div>
							<div>
								<Label className='text-xs sm:text-sm'>Фойдаланувчи номи</Label>
								<Input
									value={form.username}
									onChange={e => handleChange('username', e.target.value)}
									placeholder='Фойдаланувчи номини киритинг'
									className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
								/>
								{errorsUser.username && (
									<p className='text-red-500 text-xs sm:text-sm mt-1'>
										{errorsUser.username}
									</p>
								)}
							</div>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
							<div>
								<Label className='text-xs sm:text-sm'>Email</Label>
								<Input
									value={form.email}
									onChange={e => handleChange('email', e.target.value)}
									placeholder='Email манзилингизни киритинг'
									className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
								/>
								{errorsUser.email && (
									<p className='text-red-500 text-xs sm:text-sm mt-1'>
										{errorsUser.email}
									</p>
								)}
							</div>
							<div>
								<Label className='text-xs sm:text-sm'>Телефон</Label>
								<Input
									value={form.phone}
									onChange={e => handleChange('phone', e.target.value)}
									placeholder='+998XXXXXXXXX форматда'
									className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
								/>
								{errorsUser.phone && (
									<p className='text-red-500 text-xs sm:text-sm mt-1'>
										{errorsUser.phone}
									</p>
								)}
							</div>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
							<div>
								<Label className='text-xs sm:text-sm'>Рол</Label>
								<Select
									value={form.role}
									onValueChange={val => handleChange('role', val)}
								>
									<SelectTrigger className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'>
										<SelectValue placeholder='Танланг...' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem
											value={RoleConstants.DOCTOR}
											className='text-xs sm:text-sm'
										>
											Shifokor
										</SelectItem>
										<SelectItem
											value={RoleConstants.NURSE}
											className='text-xs sm:text-sm'
										>
											Hamshira
										</SelectItem>
										<SelectItem
											value={RoleConstants.RECEPTIONIST}
											className='text-xs sm:text-sm'
										>
											Qabulxona
										</SelectItem>
										<SelectItem
											value={RoleConstants.ADMIN}
											className='text-xs sm:text-sm'
										>
											Admin
										</SelectItem>
									</SelectContent>
								</Select>
								{errorsUser.role && (
									<p className='text-red-500 text-xs sm:text-sm mt-1'>
										{errorsUser.role}
									</p>
								)}
							</div>

							<div>
								<Label className='text-xs sm:text-sm'>Бўлим</Label>
								<Select
									value={form.section}
									onValueChange={val => handleChange('section', val)}
								>
									<SelectTrigger className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'>
										<SelectValue placeholder='Бўлимни танланг...' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem
											value={SectionConstants.KARDIOLOGIYA}
											className='text-xs sm:text-sm'
										>
											{SectionConstants.KARDIOLOGIYA}
										</SelectItem>
										<SelectItem
											value={SectionConstants.NEVROLOGIYA}
											className='text-xs sm:text-sm'
										>
											{SectionConstants.NEVROLOGIYA}
										</SelectItem>
										<SelectItem
											value={SectionConstants.UZI_MUTAHASSISI}
											className='text-xs sm:text-sm'
										>
											{SectionConstants.UZI_MUTAHASSISI}
										</SelectItem>
									</SelectContent>
								</Select>
								{errorsUser.section && (
									<p className='text-red-500 text-xs sm:text-sm mt-1'>
										{errorsUser.section}
									</p>
								)}
							</div>
						</div>
						<div>
							<Label className='text-xs sm:text-sm'>
								Лицензия рақами (шифокорлар учун)
							</Label>
							<Input
								value={form.license_number}
								onChange={e => handleChange('license_number', e.target.value)}
								autoComplete='off'
								placeholder='Лицензия рақамини киритинг'
								className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
							/>
							{errorsUser.license_number && (
								<p className='text-red-500 text-xs sm:text-sm mt-1'>
									{errorsUser.license_number}
								</p>
							)}
						</div>

						<div>
							<Label className='text-xs sm:text-sm'>Парол</Label>
							<Input
								type='password'
								value={form.password}
								onChange={e => handleChange('password', e.target.value)}
								autoComplete='new-password'
								placeholder='Парол киритинг'
								className='text-xs sm:text-sm h-9 sm:h-10 mt-1.5'
							/>
							{!editingUserId
								? errorsUser.password && (
										<p className='text-red-500 text-xs sm:text-sm mt-1'>
											{errorsUser.password}
										</p>
								  )
								: null}
						</div>
					</div>

					<DialogFooter className='flex-col sm:flex-row gap-2'>
						<Button
							variant='outline'
							onClick={() => {
								setIsUserModalOpen(false)
								setErrorsUser({})
							}}
							className='w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10'
						>
							Бекор қилиш
						</Button>
						<Button
							onClick={onSaveUser}
							className='w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10'
						>
							{editingUserId ? 'Сақлаш' : 'Қўшиш'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default Settings
