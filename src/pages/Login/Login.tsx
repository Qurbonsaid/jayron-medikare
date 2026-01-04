import { useLoginMutation } from '@/app/api/authApi/authApi'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import { languages } from '@/i18n'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const Login = () => {
	const { t, i18n } = useTranslation('login')
	const navigate = useNavigate()
	const [showPassword, setShowPassword] = useState(false)
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [login] = useLoginMutation()
	const handleRequest = useHandleRequest()

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()

		await handleRequest({
			request: async () => {
				const result = await login({
					username,
					password,
				}).unwrap()
				return result
			},
			onSuccess: () => {
				// Login muvaffaqiyatli bo'lgandan keyin sahifani to'liq reload qilish
				// Bu yangi role bilan UI to'liq yangilanishini ta'minlaydi
				window.location.href = '/patients'
			},
			onError: err => {
				const msg = err?.data?.error?.msg
				toast.error(msg || t('loginFailed'))
			},
		})
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10'>
			<div className='w-full max-w-md p-8'>
				{/* Logo and Title */}
				<div className='text-center mb-8'>
					<div className='w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4'>
						<svg
							className='w-12 h-12 text-white'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
							/>
						</svg>
					</div>
					<h1 className='text-2xl font-bold mb-2'>JAYRON MEDSERVIS</h1>
					<p className='text-muted-foreground'>{t('subtitle')}</p>
				</div>

				{/* Login Card */}
				<div className='card-shadow rounded-lg bg-card p-8'>
					<form onSubmit={handleLogin} className='space-y-6'>
						{/* Username */}
						<div className='space-y-2'>
							<Label htmlFor='username'>{t('username')}</Label>
							<div className='relative'>
								<User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
								<Input
									id='username'
									type='text'
									placeholder={t('usernamePlaceholder')}
									className='pl-10'
									value={username}
									onChange={e => setUsername(e.target.value)}
									required
								/>
							</div>
						</div>

						{/* Password */}
						<div className='space-y-2'>
							<Label htmlFor='password'>{t('password')}</Label>
							<div className='relative'>
								<Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
								<Input
									id='password'
									type={showPassword ? 'text' : 'password'}
									placeholder={t('passwordPlaceholder')}
									className='pl-10 pr-10'
									value={password}
									onChange={e => setPassword(e.target.value)}
									required
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
								>
									{showPassword ? (
										<EyeOff className='w-5 h-5' />
									) : (
										<Eye className='w-5 h-5' />
									)}
								</button>
							</div>
						</div>

						{/* Remember Me */}
						<div className='flex items-center justify-between'>
							<div className='flex items-center space-x-2'>
								<Checkbox id='remember' />
								<Label
									htmlFor='remember'
									className='text-sm font-normal cursor-pointer'
								>
									{t('rememberMe')}
								</Label>
							</div>
						</div>

						{/* Login Button */}
						<Button
							type='submit'
							className='w-full h-12 text-base gradient-primary hover:opacity-90 transition-opacity'
						>
							{t('submit')}
						</Button>
					</form>

					{/* Language Selector */}
					<div className='mt-6 pt-6 border-t flex justify-center gap-2 flex-wrap'>
						{languages.map((lang, index) => (
							<span key={lang.code} className='flex items-center gap-2'>
								<button
									onClick={() => i18n.changeLanguage(lang.code)}
									className={`text-sm ${
										i18n.language === lang.code
											? 'font-medium text-primary'
											: 'text-muted-foreground hover:text-foreground'
									}`}
								>
									{lang.flag} {lang.name}
								</button>
								{index < languages.length - 1 && (
									<span className='text-muted-foreground'>|</span>
								)}
							</span>
						))}
					</div>
				</div>

				{/* Footer */}
				<p className='text-center text-sm text-muted-foreground mt-6'>
					{t('copyright')}
				</p>
			</div>
		</div>
	)
}

export default Login
