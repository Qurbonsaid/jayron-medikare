import { baseApi, clearAuthTokens } from '@/app/api/baseApi'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import getUser from '@/hooks/getUser/getUser'
import { navigator } from '@/router'
import { ArrowLeft, Edit, Globe, LogOut, MoreVertical, Trash, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import LanguageSelector from './LanguageSelector'
import { languages } from '@/i18n'

interface AppLayoutProps {
	children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
	const { t, i18n } = useTranslation('sidebar')
	const navigate = useNavigate()
	const [menuOpen, setMenuOpen] = useState(false)
	const [logoutOpen, setLogoutOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement | null>(null)

	const [sidebarOpen, setSidebarOpen] = useState(() => {
		const saved = localStorage.getItem('sidebar-state')
		return saved !== 'false'
	})
	// Role tarjimasini olish funksiyasi
	const getRoleLabel = (role: string): string => {
		const roleMap: Record<string, string> = {
			ceo:'Rahbar',
			admin: 'Admin',
			doctor: 'Shifokor',
			nurse: 'Hamshira',
			receptionist: 'Qabulxona',
		}
		return roleMap[role.toLowerCase()] || role
	}
	const location = useLocation()

	useEffect(() => {
		localStorage.setItem('sidebar-state', String(sidebarOpen))
	}, [sidebarOpen])

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false)
			}
		}

		if (menuOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [menuOpen])

	const currentLocation = navigator.find(item => {
		if (item.path === location.pathname) return true

		// Pattern match for dynamic routes (e.g., /patient/:id)
		const pattern = item.path.replace(/:[^/]+/g, '[^/]+')
		const regex = new RegExp(`^${pattern}$`)
		return regex.test(location.pathname)
	})

	// Get translated title
	const getTranslatedTitle = () => {
		if (!currentLocation?.titleKey) return currentLocation?.title
		return t(currentLocation.titleKey)
	}

	const me = getUser()

	const nickName = me.fullname
		?.split(' ')
		?.map(i => i[0])
		?.join('')

	return (
		<SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
			<div className='flex min-h-screen w-full'>
				<AppSidebar />
				<SidebarInset className='flex-1'>
					{/* Top Header */}
					<header className='sticky top-0 z-10 bg-card border-b card-shadow flex items-center justify-between px-2 sm:px-4 lg:px-6 py-2 sm:py-3'>
						<div className='flex items-center gap-2 sm:gap-4 min-w-0 flex-1'>
							<SidebarTrigger className='md:hidden flex-shrink-0' />
							{currentLocation?.to && (
								<Link to={currentLocation?.to} className='flex-shrink-0'>
									<ArrowLeft className='w-4 h-4 sm:w-5 sm:h-5' />
								</Link>
							)}
							<h1 className='text-sm sm:text-base md:text-lg lg:text-xl font-bold truncate'>{getTranslatedTitle()}</h1>
						</div>
						<div className='flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0'>
							{/* Desktop: Normal buttons */}
							<div className='hidden sm:flex items-center gap-2 md:gap-3'>
								{/* 3 chiziqli menyu - faqat profile sahifasida ko'rsatiladi */}
								{location.pathname === '/profile' && (
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
														navigate('/profile?edit=true')
														setMenuOpen(false)
													}}
												>
													<span>
														<Edit size={12} />
													</span>
													<span>Tahrirlash</span>
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
								)}

								{/* Language Selector */}
								<LanguageSelector />

								{/* Profile Button */}
								<Link
									to='/profile'
									className='border-2 rounded-lg py-0.5 border-slate-400'
								>
									<Button
										variant='ghost'
										className='flex items-center gap-2 md:gap-3 hover:bg-accent border-slate-400 px-2 md:px-3'
									>
										<div className='w-8 h-8 md:w-10 md:h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm'>
											{nickName}
										</div>
										<div className='hidden md:block text-right'>
											<p className='text-sm font-medium'>{me.fullname}</p>
											<p className='text-xs text-muted-foreground'>
												{getRoleLabel(me.role)}
											</p>
										</div>
									</Button>
								</Link>
							</div>

							{/* Mobile: Dropdown menu for language + profile */}
							<div className='flex sm:hidden items-center gap-1'>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant='ghost' size='icon' className='h-8 w-8'>
											<MoreVertical className='h-4 w-4' />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end' className='w-48'>
										{/* Profile link */}
										<DropdownMenuItem asChild>
											<Link to='/profile' className='flex items-center gap-2'>
												<div className='w-6 h-6 gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-[10px]'>
													{nickName}
												</div>
												<div className='flex-1 min-w-0'>
													<p className='text-xs font-medium truncate'>{me.fullname}</p>
													<p className='text-[10px] text-muted-foreground'>{getRoleLabel(me.role)}</p>
												</div>
											</Link>
										</DropdownMenuItem>
										
										<DropdownMenuSeparator />
										
										{/* Language selector */}
										<div className='px-2 py-1.5'>
											<p className='text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1'>
												<Globe className='h-3 w-3' />
												Til
											</p>
											{languages.map((language) => (
												<DropdownMenuItem
													key={language.code}
													onClick={() => i18n.changeLanguage(language.code)}
													className={`text-xs ${i18n.language === language.code ? 'bg-accent' : ''}`}
												>
													<span className='flex items-center gap-2'>
														<span>{language.flag}</span>
														<span>{language.name}</span>
													</span>
												</DropdownMenuItem>
											))}
										</div>

										{location.pathname === '/profile' && (
											<>
												<DropdownMenuSeparator />
												<DropdownMenuItem onClick={() => navigate('/profile?edit=true')}>
													<Edit className='h-3 w-3 mr-2' />
													<span className='text-xs'>Tahrirlash</span>
												</DropdownMenuItem>
												<DropdownMenuItem 
													onClick={() => setLogoutOpen(true)}
													className='text-red-600'
												>
													<LogOut className='h-3 w-3 mr-2' />
													<span className='text-xs'>Chiqish</span>
												</DropdownMenuItem>
											</>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</header>

					{/* Main Content */}
					<main className='flex-1 min-w-0 overflow-x-hidden'>{children}</main>
				</SidebarInset>
			</div>

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
		</SidebarProvider>
	)
}
