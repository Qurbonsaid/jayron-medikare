import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ArrowLeft, User, Mail, Phone, Shield, Edit, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMeQuery, useUpdateMeMutation } from '@/app/api/authApi'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import { toast } from 'sonner'
import { profileSchema } from '@/validation/validationProfile'
import { clearAuthTokens } from '@/app/api/baseApi'

export default function ProfilePage() {
	const navigate = useNavigate()
	const [editOpen, setEditOpen] = useState(false)
	const [logoutOpen, setLogoutOpen] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)
	const handleRequest = useHandleRequest()

	const menuRef = useRef<HTMLDivElement | null>(null)

	// 🔹 Tashqariga bosilganda menyuni yopish
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false)
			}
		}

		if (menuOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		} else {
			document.removeEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [menuOpen])

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

	// Ma’lumotlarni tahrirlash modal ochilganda formni to‘ldirish
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
			onError: () => {
				console.log('Xatolik bor')
				toast.error('Profilni yangilashda xatolik yuz berdi!')
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
			{/* Header */}
			<header className='bg-card border-b sticky top-0 z-10'>
				<div className='w-full px-4 sm:px-6 py-4 flex flex-row flex-wrap items-center justify-between gap-3'>
					{/* Chap taraf */}
					<div className='flex items-center gap-3 min-w-0'>
						{/* <Button
							variant='ghost'
							size='icon'
							onClick={() => navigate('/patients')}
						>
							<ArrowLeft className='w-5 h-5' />
						</Button> */}
						<div className='min-w-0'>
							<h1 className='text-lg sm:text-xl font-bold truncate'>Profil</h1>
							<p className='text-xs sm:text-sm text-muted-foreground truncate'>
								Foydalanuvchi profili
							</p>
						</div>
					</div>

					{/* 3 chiziqli menyu */}
					<div ref={menuRef} className='relative flex-shrink-0'>
						<button
							className='flex flex-col justify-center items-center gap-1 w-8 h-8 p-1 rounded hover:bg-gray-200 transition'
							onClick={() => setMenuOpen(prev => !prev)}
						>
							<span className='w-5 h-0.5 bg-gray-600 block rounded' />
							<span className='w-5 h-0.5 bg-gray-600 block rounded' />
							<span className='w-5 h-0.5 bg-gray-600 block rounded' />
						</button>

						{menuOpen && (
							<div className='absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-20'>
								<button
									className='flex gap-2 items-center w-full text-left px-3 py-2 hover:bg-gray-100'
									onClick={() => {
										setEditOpen(true)
										setMenuOpen(false)
									}}
								>
									<span>
										<Edit size={12} />
									</span>
									<span> Tahrirlash</span>
								</button>
								<button
									className='flex gap-2 items-center w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600'
									onClick={() => {
										setLogoutOpen(true)
										setMenuOpen(false)
									}}
								>
									<span>
										<Trash size={13} />
									</span>
									<span>Logout</span>
								</button>
							</div>
						)}
					</div>
				</div>
			</header>

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
								role : {user.data.role}
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

						<div className='flex items-center gap-4 border-b pb-3'>
							<Mail className='w-6 h-6 text-indigo-600 shrink-0' />
							<div>
								<p className='text-xs text-muted-foreground uppercase'>Email</p>
								<p className='text-base font-medium break-all'>
									{user.data.email || '-'}
								</p>
							</div>
						</div>

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
				<DialogContent
					className=' max-w-md md:max-w-xl scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh]'
				>
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

						<div className='flex flex-col space-y-1'>
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
						</div>

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
								clearAuthTokens()
								navigate('/login')
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
