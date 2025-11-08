import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Edit, Trash2, ArrowLeft } from 'lucide-react'
import { useGetDiagnosticByIdQuery } from '@/app/api/diagnostic/diagnosticApi'
import { useCreateAnalysisParameterMutation } from '@/app/api/diagnostic/diagnosticApi'
import { toast } from 'sonner'
import { AnalysisParameter } from '@/app/api/diagnostic/types'

export default function AnalysisParamsModal() {
	const navigate = useNavigate()
	const { id } = useParams<{ id: string }>()
	const { data, isLoading, isError } = useGetDiagnosticByIdQuery(id!)
	const [params, setParams] = useState<AnalysisParameter[]>([])
	const [open, setOpen] = useState(false)

	// 🧩 Qo‘shish form holati
	const [form, setForm] = useState({
		parameter_code: '',
		parameter_name: '',
		unit: '',
		description: '',
		genderType: 'general', // 'general' yoki 'gendered'
		male: { min: '', max: '', value: '' },
		female: { min: '', max: '', value: '' },
		general: { min: '', max: '', value: '' },
	})

	const [createParameter, { isLoading: creating }] =
		useCreateAnalysisParameterMutation()

	useEffect(() => {
		if (data?.data?.analysis_parameters) {
			setParams(data.data.analysis_parameters)
		}
	}, [data])

	const handleDelete = (_id: string) => {
		if (window.confirm('Rostan o‘chirmoqchimisiz?')) {
			setParams(prev => prev.filter(p => p._id !== _id))
			toast.success('Parametr o‘chirildi')
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }))
	}

	const handleNormalChange = (
		type: 'male' | 'female' | 'general',
		key: string,
		value: string
	) => {
		setForm(prev => ({
			...prev,
			[type]: { ...prev[type], [key]: value },
		}))
	}

	const handleSubmit = async () => {
		if (!id) return

		const payload = {
			analysis_id: id,
			parameter_code: form.parameter_code,
			parameter_name: form.parameter_name,
			unit: form.unit,
			description: form.description,
			normal_range:
				form.genderType === 'general'
					? {
							male: { min: 0, max: 0, value: '' },
							female: { min: 0, max: 0, value: '' },
							general: {
								min: Number(form.general.min) || 0,
								max: Number(form.general.max) || 0,
								value: form.general.value,
							},
					  }
					: {
							male: {
								min: Number(form.male.min) || 0,
								max: Number(form.male.max) || 0,
								value: form.male.value,
							},
							female: {
								min: Number(form.female.min) || 0,
								max: Number(form.female.max) || 0,
								value: form.female.value,
							},
							general: { min: 0, max: 0, value: '' },
					  },
		}

		try {
			await createParameter(payload).unwrap()
			toast.success('Parametr muvaffaqiyatli qo‘shildi 🎉')
			setOpen(false)
			setForm({
				parameter_code: '',
				parameter_name: '',
				unit: '',
				description: '',
				genderType: 'general',
				male: { min: '', max: '', value: '' },
				female: { min: '', max: '', value: '' },
				general: { min: '', max: '', value: '' },
			})
		} catch (err) {
			toast.error('Xatolik: parametr qo‘shilmadi!')
		}
	}

	if (isLoading) return <p className='p-4'>Yuklanmoqda...</p>
	if (isError || !data)
		return <p className='p-4 text-red-500'>Xatolik yuz berdi!</p>

	return (
		<div className='min-h-screen bg-background flex flex-col'>
			{/* HEADER */}
			<header className='bg-card border-b sticky top-0 z-10'>
				<div className='w-full px-4 sm:px-6 py-4 flex flex-row flex-wrap items-center justify-between gap-3'>
					<div className='flex items-center gap-3 min-w-0'>
						<Button variant='ghost' size='icon' onClick={() => navigate(-1)}>
							<ArrowLeft className='w-5 h-5' />
						</Button>
						<div className='min-w-0'>
							<h1 className='text-lg sm:text-xl font-bold truncate'>
								{data.data.code}
							</h1>
							<p className='text-xs sm:text-sm text-muted-foreground truncate'>
								{data.data.name}
							</p>
						</div>
					</div>

					<Button
						className='bg-blue-600 hover:bg-blue-700 text-white'
						onClick={() => setOpen(true)}
					>
						+ Parametr qo‘shish
					</Button>
				</div>
			</header>

			{/* TABLE */}
			<div className='p-4 sm:p-6'>
				<Card className='overflow-x-auto'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className='w-[50px]'>#</TableHead>
								<TableHead>Parametr codi</TableHead>
								<TableHead>Parametr nomi</TableHead>
								<TableHead>Jinsi</TableHead>
								<TableHead>Qiymatlari</TableHead>
								<TableHead>Birligi</TableHead>
								<TableHead className='text-right'>Harakatlar</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{params.map((param, index) => {
								const { normal_range } = param
								const { general, male, female } = normal_range || {}

								// 1️⃣ General qiymatlar 0 yoki bo‘sh bo‘lmasa — umumiy deb hisoblanadi
								const isGeneral =
									general &&
									((typeof general.min === 'number' && general.min !== 0) ||
										(typeof general.max === 'number' && general.max !== 0) ||
										(general.value &&
											general.value.trim() !== '' &&
											general.value !== 'Negative'))

								// 2️⃣ Erkak/ayol qiymatlar mavjudligini tekshirish
								const hasMale =
									male &&
									((typeof male.min === 'number' && male.min !== 0) ||
										(typeof male.max === 'number' && male.max !== 0) ||
										(male.value && male.value.trim() !== ''))

								const hasFemale =
									female &&
									((typeof female.min === 'number' && female.min !== 0) ||
										(typeof female.max === 'number' && female.max !== 0) ||
										(female.value && female.value.trim() !== ''))

								// 3️⃣ Chiqariladigan UI qismi
								let rangeDisplay

								if (isGeneral) {
									rangeDisplay = (
										<div className='flex flex-col items-start'>
											<span className='text-sm font-medium text-gray-700 mb-1'>
												🌍 Umumiy
											</span>
											<span className='px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium'>
												{general.value && general.value.trim() !== ''
													? general.value
													: `${general.min ?? '-'} - ${general.max ?? '-'}`}
											</span>
										</div>
									)
								} else if (hasMale || hasFemale) {
									rangeDisplay = (
										<div className='flex flex-col gap-1'>
											{hasMale && (
												<span className='px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm'>
													👨 :{' '}
													{male.value && male.value.trim() !== ''
														? male.value
														: `${male.min ?? '-'} - ${male.max ?? '-'}`}
												</span>
											)}
											{hasFemale && (
												<span className='px-2 py-1 rounded-lg bg-pink-50 text-pink-700 text-sm'>
													👩 :{' '}
													{female.value && female.value.trim() !== ''
														? female.value
														: `${female.min ?? '-'} - ${female.max ?? '-'}`}
												</span>
											)}
										</div>
									)
								} else {
									rangeDisplay = (
										<span className='text-gray-400 text-sm italic'>
											Ma’lumot yo‘q
										</span>
									)
								}

								return (
									<TableRow key={param._id}>
										<TableCell>{index + 1}</TableCell>
										<TableCell>{param.parameter_code}</TableCell>
										<TableCell>{param.parameter_name}</TableCell>
										<TableCell>
											{isGeneral
												? 'Umumiy'
												: hasMale || hasFemale
												? 'Erkak / Ayol'
												: '-'}
										</TableCell>
										<TableCell>{rangeDisplay}</TableCell>
										<TableCell>{param.unit}</TableCell>
										<TableCell className='text-right space-x-2'>
											<Button size='icon' variant='outline' className='h-8 w-8'>
												<Edit size={16} />
											</Button>
											<Button
												size='icon'
												variant='outline'
												className='h-8 w-8 text-red-500 border-red-300 hover:bg-red-50'
												onClick={() => handleDelete(param._id)}
											>
												<Trash2 size={16} />
											</Button>
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</Card>
			</div>

			{/* ADD PARAM DIALOG */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className='max-w-lg'>
					<DialogHeader>
						<DialogTitle>Yangi parametr qo‘shish</DialogTitle>
					</DialogHeader>

					<div className='space-y-3'>
						<Input
							name='parameter_code'
							value={form.parameter_code}
							onChange={handleChange}
							placeholder='Parametr kodi (masalan: WRT)'
						/>
						<Input
							name='parameter_name'
							value={form.parameter_name}
							onChange={handleChange}
							placeholder='Parametr nomi'
						/>
						<Input
							name='unit'
							value={form.unit}
							onChange={handleChange}
							placeholder='Birlik (masalan: g/L)'
						/>
						<Input
							name='description'
							value={form.description}
							onChange={handleChange}
							placeholder='Izoh (ixtiyoriy)'
						/>

						<div className='flex gap-12 mt-3'>
							<label className='flex items-center gap-2'>
								<input
									type='radio'
									name='genderType'
									value='general'
									checked={form.genderType === 'general'}
									onChange={e =>
										setForm(prev => ({ ...prev, genderType: e.target.value }))
									}
								/>
								<span>🌍 Umumiy</span>
							</label>
							<label className='flex items-center gap-2'>
								<input
									type='radio'
									name='genderType'
									value='gendered'
									checked={form.genderType === 'gendered'}
									onChange={e =>
										setForm(prev => ({ ...prev, genderType: e.target.value }))
									}
								/>
								<span>👨 / 👩 </span>
							</label>
						</div>

						{/* Umumiy bo‘lsa */}
						{form.genderType === 'general' && (
							<div className='grid grid-cols-3 gap-2'>
								<Input
									placeholder='Min'
									value={form.general.min}
									onChange={e =>
										handleNormalChange('general', 'min', e.target.value)
									}
								/>
								<Input
									placeholder='Max'
									value={form.general.max}
									onChange={e =>
										handleNormalChange('general', 'max', e.target.value)
									}
								/>
								<Input
									placeholder='Qiymat (matn bo‘lishi mumkin)'
									value={form.general.value}
									onChange={e =>
										handleNormalChange('general', 'value', e.target.value)
									}
								/>
							</div>
						)}

						{/* Erkak / Ayol bo‘lsa */}
						{form.genderType === 'gendered' && (
							<div className='space-y-2'>
								<p className='font-medium text-sm'>👨 Erkak:</p>
								<div className='grid grid-cols-3 gap-2'>
									<Input
										placeholder='Min'
										value={form.male.min}
										onChange={e =>
											handleNormalChange('male', 'min', e.target.value)
										}
									/>
									<Input
										placeholder='Max'
										value={form.male.max}
										onChange={e =>
											handleNormalChange('male', 'max', e.target.value)
										}
									/>
									<Input
										placeholder='Qiymat (matn bo‘lishi mumkin)'
										value={form.male.value}
										onChange={e =>
											handleNormalChange('male', 'value', e.target.value)
										}
									/>
								</div>

								<p className='font-medium text-sm mt-2'>👩 Ayol:</p>
								<div className='grid grid-cols-3 gap-2'>
									<Input
										placeholder='Min'
										value={form.female.min}
										onChange={e =>
											handleNormalChange('female', 'min', e.target.value)
										}
									/>
									<Input
										placeholder='Max'
										value={form.female.max}
										onChange={e =>
											handleNormalChange('female', 'max', e.target.value)
										}
									/>
									<Input
										placeholder='Qiymat (matn bo‘lishi mumkin)'
										value={form.female.value}
										onChange={e =>
											handleNormalChange('female', 'value', e.target.value)
										}
									/>
								</div>
							</div>
						)}
					</div>

					<DialogFooter>
						<Button variant='outline' onClick={() => setOpen(false)}>
							Bekor qilish
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={creating}
							className='bg-blue-600 text-white'
						>
							{creating ? 'Saqlanmoqda...' : 'Saqlash'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
