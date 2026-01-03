import { useMeQuery, useUpdateMeMutation } from '@/app/api/authApi'
import { baseApi, clearAuthTokens } from '@/app/api/baseApi'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import { profileSchema } from '@/validation/validationProfile'
import { Mail, Phone, Shield, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

// Role tarjimasini olish funksiyasi
const getRoleLabel = (role: string): string => {
	const roleMap: Record<string, string> = {
		ceo: 'Rahbar',
		admin: 'Admin',
		doctor: 'Shifokor',
		nurse: 'Hamshira',
		receptionist: 'Qabulxona',
	}
	return roleMap[role.toLowerCase()] || role
}

export default function ProfilePage() {
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const [editOpen, setEditOpen] = useState(false)
	const [logoutOpen, setLogoutOpen] = useState(false)
	const handleRequest = useHandleRequest()

	// 🔹 RTK Query: profilni olish
	const { data: user, isLoading, isError } = useMeQuery()
	// 🔹 RTK Query: profilni yangilash
	const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation()
	const [errors, setErrors] = useState<Record<string, string>>({})

	// 🔹 Form state (edit dialog uchun)
	const [formData, setFormData] = useState({
		fullname: '',
		username: '',
		email: '',
		phone: '',
		license_number: '',
	})

	const { refetch } = useMeQuery(undefined, { skip: false })

	// URL parametrini tekshirib edit modalni ochish
	useEffect(() => {
		if (searchParams.get('edit') === 'true') {
			setEditOpen(true)
			// URL'dan parametrni olib tashlash
			setSearchParams({})
		}
	}, [searchParams, setSearchParams])

	// Ma'lumotlarni tahrirlash modal ochilganda formni to'ldirish
	useEffect(() => {
		if (user?.data) {
			setFormData({
				fullname: user.data.fullname || '',
				username: user.data.username || '',
				email: user.data.email || '',
				phone: user.data.phone || '',
				license_number: user.data.license_number || '',
			})
		}
	}, [user, editOpen])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const handleSubmit = async () => {
		console.log('Saqlanmoqda')
		await handleRequest({
			request: () => updateMe(formData).unwrap(),
			onSuccess: () => {
				console.log('Muvaffaqqiyatli')
				toast.success('Profil muvaffaqiyatli yangilandi!')
				setEditOpen(false)
				setErrors({})
			},
			onError: err => {
				toast.error(err?.data?.error?.msg)
			},
		})
	}

	const OnSaveUpdate = () => {
		const result = profileSchema().safeParse(formData)
		if (!result.success) {
			const newErrors = {}
			result.error.errors.forEach(err => {
				newErrors[err.path[0]] = err.message
			})
			setErrors(newErrors)
			return
		}
		handleSubmit()
	}

	if (isLoading) return <div className='p-4 text-center'>Yuklanmoqda...</div>

	if (isError || !user) {
		return (
			<div className='p-4 text-center text-red-500'>
				Ma’lumotni olishda xatolik yuz berdi
			</div>
		)
	}
	// const handleLogout = () => {
	// 	// 🔹 1. Tokenlarni localStorage’dan o‘chirish
	// 	localStorage.removeItem('accessToken')

	// 	// 🔹 2. Logout modalni yopish
	// 	setLogoutOpen(false)

	// 	// 🔹 3. Login sahifasiga yo‘naltirish
	// 	navigate('/login')
	// }

	return (
		<div className='min-h-screen bg-background flex flex-col'>
			{/* Asosiy kontent */}
			<main className='flex-grow w-full flex flex-col items-center justify-start py-8 sm:py-12 px-3 sm:px-6'>
				<div className='w-full max-w-4xl flex flex-col gap-10'>
					{/* Avatar va ism */}
					<div className='flex flex-col items-center gap-4 mt-6 sm:mt-0'>
						<div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg'>
							{user.data.fullname?.charAt(0) ?? user.data.username?.charAt(0)}
						</div>
						<div className='text-center'>
							<h2 className='text-2xl sm:text-3xl font-semibold text-foreground'>
								{user.data.fullname}
							</h2>
							<p className='text-muted-foreground text-sm sm:text-base'>
								Рол: {getRoleLabel(user.data.role)}
							</p>
						</div>
					</div>

					{/* Ma’lumotlar */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-6'>
						<div className='flex items-center gap-4 border-b pb-3'>
							<User className='w-6 h-6 text-indigo-600 shrink-0' />
							<div>
								<p className='text-xs text-muted-foreground uppercase'>
									Username
								</p>
								<p className='text-base font-medium'>
									{user.data.username || '-'}
								</p>
							</div>
						</div>

						{/* <div className='flex items-center gap-4 border-b pb-3'>
							<Mail className='w-6 h-6 text-indigo-600 shrink-0' />
							<div>
								<p className='text-xs text-muted-foreground uppercase'>Email</p>
								<p className='text-base font-medium break-all'>
									{user.data.email || '-'}
								</p>
							</div>
						</div> */}

						<div className='flex items-center gap-4 border-b pb-3'>
							<Phone className='w-6 h-6 text-indigo-600 shrink-0' />
							<div>
								<p className='text-xs text-muted-foreground uppercase'>
									Telefon
								</p>
								<p className='text-base font-medium'>
									{user.data.phone || '-'}
								</p>
							</div>
						</div>

						<div className='flex items-center gap-4 border-b pb-3'>
							<Shield className='w-6 h-6 text-indigo-600 shrink-0' />
							<div>
								<p className='text-xs text-muted-foreground uppercase'>
									Litsenziya raqami
								</p>
								<p className='text-base font-medium'>
									{user.data.license_number || '-'}
								</p>
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Tahrirlash Dialog */}
			<Dialog
				open={editOpen}
				onOpenChange={open => {
					setEditOpen(open)
					if (!open) {
						setErrors({})
					}
				}}
			>
				<DialogContent className=' max-w-md md:max-w-xl scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh]'>
					<DialogHeader>
						<DialogTitle className='text-lg font-semibold text-gray-800'>
							Profilni tahrirlash
						</DialogTitle>
					</DialogHeader>

					<div className='space-y-4 mt-4'>
						<div className='flex flex-col space-y-1'>
							<label
								htmlFor='fullname'
								className='text-sm font-medium text-gray-700'
							>
								To‘liq ism
							</label>
							<Input
								id='fullname'
								name='fullname'
								value={formData.fullname}
								onChange={handleChange}
								placeholder='Ismingizni kiriting'
							/>
							{errors.fullname && (
								<p className='text-red-500 text-sm'>{errors.fullname}</p>
							)}
						</div>

						<div className='flex flex-col space-y-1'>
							<label
								htmlFor='username'
								className='text-sm font-medium text-gray-700'
							>
								Foydalanuvchi nomi
							</label>
							<Input
								id='username'
								name='username'
								value={formData.username}
								onChange={handleChange}
								placeholder='Foydalanuvchi nomingizni kiriting'
							/>
							{errors.username && (
								<p className='text-red-500 text-sm'>{errors.username}</p>
							)}
						</div>

						{/* <div className='flex flex-col space-y-1'>
							<label
								htmlFor='email'
								className='text-sm font-medium text-gray-700'
							>
								Email
							</label>
							<Input
								id='email'
								type='email'
								name='email'
								value={formData.email}
								onChange={handleChange}
								placeholder='example@gmail.com'
							/>
							{errors.email && (
								<p className='text-red-500 text-sm'>{errors.email}</p>
							)}
						</div> */}

						<div className='flex flex-col space-y-1'>
							<label
								htmlFor='phone'
								className='text-sm font-medium text-gray-700'
							>
								Telefon raqam
							</label>
							<Input
								id='phone'
								name='phone'
								value={formData.phone}
								onChange={handleChange}
								placeholder='+998xxxxxxxxx'
							/>
							{errors.phone && (
								<p className='text-red-500 text-sm'>{errors.phone}</p>
							)}
						</div>

						<div className='flex flex-col space-y-1'>
							<label
								htmlFor='license_number'
								className='text-sm font-medium text-gray-700'
							>
								Litsenziya raqami
							</label>
							<Input
								id='license_number'
								name='license_number'
								value={formData.license_number}
								onChange={handleChange}
								placeholder='ABC-12345'
							/>
							{errors.license_number && (
								<p className='text-red-500 text-sm'>{errors.license_number}</p>
							)}
						</div>
					</div>

					<DialogFooter className='mt-6 flex flex-col sm:flex-row justify-end gap-3'>
						<Button
							variant='outline'
							onClick={() => {
								setEditOpen(false)
								setErrors({})
							}}
							className='w-full sm:w-auto'
						>
							Bekor qilish
						</Button>
						<Button
							onClick={OnSaveUpdate}
							disabled={isUpdating}
							className='w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white'
						>
							{isUpdating ? 'Saqlanmoqda...' : 'Saqlash'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Logout Dialog */}
			<Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
				<DialogContent className='w-full max-w-sm rounded-2xl'>
					<DialogHeader>
						<DialogTitle className='text-lg font-semibold text-gray-800'>
							Chiqish
						</DialogTitle>
					</DialogHeader>

					<div className='mt-4 text-gray-700'>
						Siz rostan ham bu accountdan chiqmoqchimisiz?
					</div>

					<DialogFooter className='mt-6 flex justify-end gap-3'>
						<Button variant='outline' onClick={() => setLogoutOpen(false)}>
							Bekor qilish
						</Button>
						<Button
							onClick={() => {
								// 1. Token va cache tozalash
								clearAuthTokens()
								localStorage.removeItem('rtk_cache')
								localStorage.removeItem('sidebar-state')

								// 2. Redux store ni to'liq reset qilish
								baseApi.util.resetApiState()

								// 3. Login sahifasiga o'tish va sahifani reload qilish
								window.location.href = '/login'
							}}
							className='bg-red-600 hover:bg-red-700 text-white'
						>
							Chiqish
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
