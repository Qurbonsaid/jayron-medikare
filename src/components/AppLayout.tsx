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
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import getUser from '@/hooks/getUser/getUser'
import { navigator } from '@/router'
import { ArrowLeft, Edit, Trash } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import LanguageSelector from './LanguageSelector'

interface AppLayoutProps {
	children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
	const { t } = useTranslation('sidebar')
	const navigate = useNavigate()
	const [menuOpen, setMenuOpen] = useState(false)
	const [logoutOpen, setLogoutOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement | null>(null)

	const [sidebarOpen, setSidebarOpen] = useState(() => {
		const saved = localStorage.getItem('sidebar-state')
		return saved !== 'false'
	})

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
					<header className='sticky top-0 z-10 bg-card border-b card-shadow flex items-center justify-between px-6 py-3 lg:px-2 max-sm:pr-0'>
						<div className='flex items-center gap-4 md:px-4'>
							<SidebarTrigger className='md:hidden' />
							{currentLocation?.to && (
								<Link to={currentLocation?.to}>
									<ArrowLeft className='w-5 h-5' />
								</Link>
							)}
							<h1 className='text-xl font-bold'>{getTranslatedTitle()}</h1>
						</div>
						<div className='flex items-center gap-4 px-4'>
							<div className='flex items-center gap-3'>
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
													navigate('/profile')
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

								{/* Language Selector */}
								<LanguageSelector />

								{/* Profile Button */}
								<Link
									to='/profile'
									className='border-2 rounded-lg py-0.5 border-slate-400'
								>
									<Button
										variant='ghost'
										className='flex items-center gap-3 hover:bg-accent  border-slate-400'
									>
										<div className='w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold'>
											{nickName}
										</div>
										<div className='hidden md:block text-right'>
											<p className='text-sm font-medium'>{me.fullname}</p>
											<p className='text-xs text-muted-foreground'>{me.role}</p>
										</div>
									</Button>
								</Link>
							</div>
						</div>
					</header>

					{/* Main Content */}
					<main className='flex-1'>{children}</main>
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
								clearAuthTokens()
								navigate('/login')
								localStorage.removeItem('rtk_cache')
								baseApi.util.resetApiState()
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
