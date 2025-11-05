// import { useState, useEffect, useRef } from 'react'
// import { Button } from '@/components/ui/button'
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogFooter,
// } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { ArrowLeft, User, Mail, Phone, Shield } from 'lucide-react'
// import { useNavigate } from 'react-router-dom'
// import { useMeQuery } from '@/app/api/authApi'

// export default function ProfilePage() {
// 	const navigate = useNavigate()
// 	const [editOpen, setEditOpen] = useState(false)
// 	const [logoutOpen, setLogoutOpen] = useState(false)
// 	const [menuOpen, setMenuOpen] = useState(false)

// 	const menuRef = useRef<HTMLDivElement | null>(null)

// 	// 🔹 Tashqariga bosilganda menyuni yopish
// 	useEffect(() => {
// 		const handleClickOutside = (event: MouseEvent) => {
// 			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
// 				setMenuOpen(false)
// 			}
// 		}

// 		if (menuOpen) {
// 			document.addEventListener('mousedown', handleClickOutside)
// 		} else {
// 			document.removeEventListener('mousedown', handleClickOutside)
// 		}

// 		return () => {
// 			document.removeEventListener('mousedown', handleClickOutside)
// 		}
// 	}, [menuOpen])

// 	const { data: user, isLoading, isError } = useMeQuery()

// 	if (isLoading) return <div className='p-4 text-center'>Yuklanmoqda...</div>
// 	if (isError || !user)
// 		return (
// 			<div className='p-4 text-center text-red-500'>
// 				Ma’lumotni olishda xatolik yuz berdi
// 			</div>
// 		)

// 	return (
// 		<div className='min-h-screen bg-background flex flex-col'>
// 			{/* Header */}
// 			<header className='bg-card border-b sticky top-0 z-10'>
// 				<div className='w-full px-4 sm:px-6 py-4 flex flex-row flex-wrap items-center justify-between gap-3'>
// 					{/* Chap taraf: orqaga qaytish + sarlavha */}
// 					<div className='flex items-center gap-3 min-w-0'>
// 						<Button
// 							variant='ghost'
// 							size='icon'
// 							onClick={() => navigate('/dashboard')}
// 						>
// 							<ArrowLeft className='w-5 h-5' />
// 						</Button>
// 						<div className='min-w-0'>
// 							<h1 className='text-lg sm:text-xl font-bold truncate'>Profil</h1>
// 							<p className='text-xs sm:text-sm text-muted-foreground truncate'>
// 								Foydalanuvchi profili
// 							</p>
// 						</div>
// 					</div>

// 					{/* 3 chiziqli menu — mobil va desktopda yonma-yon turadi */}
// 					<div ref={menuRef} className='relative flex-shrink-0'>
// 						<button
// 							className='flex flex-col justify-center items-center gap-1 w-8 h-8 p-1 rounded hover:bg-gray-200 transition'
// 							onClick={() => setMenuOpen(prev => !prev)}
// 						>
// 							<span className='w-5 h-0.5 bg-gray-600 block rounded' />
// 							<span className='w-5 h-0.5 bg-gray-600 block rounded' />
// 							<span className='w-5 h-0.5 bg-gray-600 block rounded' />
// 						</button>

// 						{menuOpen && (
// 							<div className='absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-20'>
// 								<button
// 									className='w-full text-left px-4 py-2 hover:bg-gray-100'
// 									onClick={() => {
// 										setEditOpen(true)
// 										setMenuOpen(false)
// 									}}
// 								>
// 									Tahrirlash
// 								</button>
// 								<button
// 									className='w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600'
// 									onClick={() => {
// 										setLogoutOpen(true)
// 										setMenuOpen(false)
// 									}}
// 								>
// 									Logout
// 								</button>
// 							</div>
// 						)}
// 					</div>
// 				</div>
// 			</header>

// 			{/* Main Content */}
// 			<main className='flex-grow w-full flex flex-col items-center justify-start py-8 sm:py-12 px-3 sm:px-6'>
// 				<div className='w-full max-w-4xl flex flex-col gap-10'>
// 					<div className='flex flex-col items-center gap-4 mt-6 sm:mt-0'>
// 						<div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg'>
// 							{user.data.fullname?.charAt(0) ?? user.data.username?.charAt(0)}
// 						</div>
// 						<div className='text-center'>
// 							<h2 className='text-2xl sm:text-3xl font-semibold text-foreground'>
// 								{user.data.fullname}
// 							</h2>
// 							<p className='text-muted-foreground text-sm sm:text-base'>
// 								{user.data.role}
// 							</p>
// 						</div>
// 					</div>

// 					<div className='grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-6'>
// 						<div className='flex items-center gap-4 border-b pb-3'>
// 							<User className='w-6 h-6 text-indigo-600 shrink-0' />
// 							<div>
// 								<p className='text-xs text-muted-foreground uppercase'>
// 									Username
// 								</p>
// 								<p className='text-base font-medium'>
// 									{user.data.username || '-'}
// 								</p>
// 							</div>
// 						</div>

// 						<div className='flex items-center gap-4 border-b pb-3'>
// 							<Mail className='w-6 h-6 text-indigo-600 shrink-0' />
// 							<div>
// 								<p className='text-xs text-muted-foreground uppercase'>Email</p>
// 								<p className='text-base font-medium break-all'>
// 									{user.data.email || '-'}
// 								</p>
// 							</div>
// 						</div>

// 						<div className='flex items-center gap-4 border-b pb-3'>
// 							<Phone className='w-6 h-6 text-indigo-600 shrink-0' />
// 							<div>
// 								<p className='text-xs text-muted-foreground uppercase'>
// 									Telefon
// 								</p>
// 								<p className='text-base font-medium'>
// 									{user.data.phone || '-'}
// 								</p>
// 							</div>
// 						</div>

// 						<div className='flex items-center gap-4 border-b pb-3'>
// 							<Shield className='w-6 h-6 text-indigo-600 shrink-0' />
// 							<div>
// 								<p className='text-xs text-muted-foreground uppercase'>Litsenziya raqami</p>
// 								<p className='text-base font-medium'>{user.data.license_number || '-'}</p>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</main>

// 			{/* Tahrirlash Dialog */}
// 			<Dialog open={editOpen} onOpenChange={setEditOpen}>
// 				<DialogContent className='w-full max-w-md rounded-2xl'>
// 					<DialogHeader>
// 						<DialogTitle className='text-lg font-semibold text-gray-800'>
// 							Profilni tahrirlash
// 						</DialogTitle>
// 					</DialogHeader>

// 					<div className='space-y-4 mt-4'>
// 						<Input defaultValue={user.data.fullname} placeholder='To‘liq ism' />
// 						<Input
// 							defaultValue={user.data.username}
// 							placeholder='Foydalanuvchi nomi'
// 						/>
// 						<Input defaultValue={user.data.email} placeholder='Email' />
// 						<Input defaultValue={user.data.phone} placeholder='Telefon raqam' />
// 					</div>

// 					<DialogFooter className='mt-6 flex justify-end gap-3'>
// 						<Button variant='outline' onClick={() => setEditOpen(false)}>
// 							Bekor qilish
// 						</Button>
// 						<Button
// 							onClick={() => setEditOpen(false)}
// 							className='bg-indigo-600 hover:bg-indigo-700 text-white'
// 						>
// 							Saqlash
// 						</Button>
// 					</DialogFooter>
// 				</DialogContent>
// 			</Dialog>

// 			{/* Logout Dialog */}
// 			<Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
// 				<DialogContent className='w-full max-w-sm rounded-2xl'>
// 					<DialogHeader>
// 						<DialogTitle className='text-lg font-semibold text-gray-800'>
// 							Chiqish
// 						</DialogTitle>
// 					</DialogHeader>

// 					<div className='mt-4 text-gray-700'>
// 						Siz rostan ham bu accountdan chiqmoqchimisiz?
// 					</div>

// 					<DialogFooter className='mt-6 flex justify-end gap-3'>
// 						<Button variant='outline' onClick={() => setLogoutOpen(false)}>
// 							Bekor qilish
// 						</Button>
// 						<Button
// 							onClick={() => {
// 								setLogoutOpen(false)
// 								console.log('User logged out')
// 							}}
// 							className='bg-red-600 hover:bg-red-700 text-white'
// 						>
// 							Chiqish
// 						</Button>
// 					</DialogFooter>
// 				</DialogContent>
// 			</Dialog>
// 		</div>
// 	)
// }

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
import { ArrowLeft, User, Mail, Phone, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMeQuery, useUpdateMeMutation } from '@/app/api/authApi'

export default function ProfilePage() {
	const navigate = useNavigate()
	const [editOpen, setEditOpen] = useState(false)
	const [logoutOpen, setLogoutOpen] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)

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
		try {
			await updateMe(formData).unwrap()
			setEditOpen(false)
		} catch (err) {
			console.error('Profilni yangilashda xatolik:', err)
		}
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
						<Button
							variant='ghost'
							size='icon'
							onClick={() => navigate('/dashboard')}
						>
							<ArrowLeft className='w-5 h-5' />
						</Button>
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
									className='w-full text-left px-4 py-2 hover:bg-gray-100'
									onClick={() => {
										setEditOpen(true)
										setMenuOpen(false)
									}}
								>
									Tahrirlash
								</button>
								<button
									className='w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600'
									onClick={() => {
										setLogoutOpen(true)
										setMenuOpen(false)
									}}
								>
									Logout
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
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent
					className='w-full max-w-md sm:max-w-lg md:max-w-xl rounded-2xl 
				   max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
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
						</div>
					</div>

					<DialogFooter className='mt-6 flex flex-col sm:flex-row justify-end gap-3'>
						<Button
							variant='outline'
							onClick={() => setEditOpen(false)}
							className='w-full sm:w-auto'
						>
							Bekor qilish
						</Button>
						<Button
							onClick={handleSubmit}
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
							// onClick={handleLogout} // ✅ shu joyda f-ya chaqiriladi
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
