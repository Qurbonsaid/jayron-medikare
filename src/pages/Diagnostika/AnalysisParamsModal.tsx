import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Edit, Trash2, ArrowLeft } from 'lucide-react'
import {
	useGetDiagnosticByIdQuery,
	useCreateAnalysisParameterMutation,
	useUpdateAnalysisParameterMutation,
} from '@/app/api/diagnostic/diagnosticApi'
import { toast } from 'sonner'
import {
	AnalysisParamCreateRequest,
	AnalysisParameter,
} from '@/app/api/diagnostic/types'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import { Label } from '@/components/ui/label'
import { addParameterSchema } from '@/validation/validationAddDiagnostic'

interface FormState {
	parameter_code: string
	parameter_name: string
	unit: string
	description: string
	male: { min: string; max: string; value: string }
	female: { min: string; max: string; value: string }
	general: { min: string; max: string; value: string }
	value_type: 'NUMBER' | 'STRING'
	gender_type: 'GENERAL' | 'MALE_FEMALE'
}

export default function AnalysisParamsModal() {
	const navigate = useNavigate()
	const { id } = useParams<{ id: string }>()
	const { data, isLoading, isError } = useGetDiagnosticByIdQuery(id!)
	const [params, setParams] = useState<AnalysisParameter[]>([])
	const [open, setOpen] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [editingParam, setEditingParam] = useState<AnalysisParameter | null>(
		null
	)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [form, setForm] = useState<FormState>({
		parameter_code: '',
		parameter_name: '',
		unit: '',
		description: '',
		male: { min: '', max: '', value: '' },
		female: { min: '', max: '', value: '' },
		general: { min: '', max: '', value: '' },
		value_type: 'NUMBER',
		gender_type: 'MALE_FEMALE',
	})

	const [createParameter, { isLoading: creating }] =
		useCreateAnalysisParameterMutation()
	const [updateParameter, { isLoading: updating }] =
		useUpdateAnalysisParameterMutation()
	const handleRequest = useHandleRequest()

	useEffect(() => {
		if (data?.data?.analysis_parameters) {
			setParams(data.data.analysis_parameters)
		}
	}, [data])

	const handleDelete = (id: string) => {
		setParams(prev => prev.filter(p => p._id !== id))
		toast.success('Parametr o‘chirildi')
		setDeleteId(null)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }))
	}

	const handleNormalChange = (
		type: 'male' | 'female' | 'general',
		key: 'min' | 'max' | 'value',
		value: string
	) => {
		setForm(prev => {
			const updated = { ...prev[type], [key]: value }

			let newValueType = prev.value_type

			if (key === 'value' && value.trim() !== '') {
				updated.min = ''
				updated.max = ''
				newValueType = 'STRING' // value kiritilgan, STRING
			} else if ((key === 'min' || key === 'max') && value.trim() !== '') {
				updated.value = ''
				newValueType = 'NUMBER' // min/max kiritilgan, NUMBER
			}

			return { ...prev, [type]: updated, value_type: newValueType }
		})
	}

	const handleGenderTypeChange = (type: 'GENERAL' | 'MALE_FEMALE') => {
		setForm(prev => ({ ...prev, gender_type: type }))
	}

	const buildRange = (range: { min: string; max: string; value: string }) => {
		if (range.value.trim() !== '') return { min: 0, max: 0, value: range.value }
		return {
			min: Number(range.min) || 0,
			max: Number(range.max) || 0,
			value: '',
		}
	}

	const openEdit = (param: AnalysisParameter) => {
		setEditingParam(null)
		setForm({
			parameter_code: param.parameter_code,
			parameter_name: param.parameter_name,
			unit: param.unit,
			description: param.description,
			value_type: param.value_type as 'NUMBER' | 'STRING',
			gender_type: param.gender_type as 'GENERAL' | 'MALE_FEMALE',
			male: {
				min: String(param.normal_range.male.min),
				max: String(param.normal_range.male.max),
				value: param.normal_range.male.value,
			},
			female: {
				min: String(param.normal_range.female.min),
				max: String(param.normal_range.female.max),
				value: param.normal_range.female.value,
			},
			general: {
				min: String(param.normal_range.general.min),
				max: String(param.normal_range.general.max),
				value: param.normal_range.general.value,
			},
		})
		setEditingParam(param)
		setOpen(true)
	}

	const handleSubmit = async () => {
		if (!id) return
		setErrors({})

		let generalRange = { min: 0, max: 0, value: '' }

		if (form.gender_type === 'GENERAL') {
			generalRange = buildRange(form.general)
		}

		const payload: AnalysisParamCreateRequest = {
			analysis_id: id,
			parameter_code: form.parameter_code,
			parameter_name: form.parameter_name,
			unit: form.unit,
			description: form.description,
			normal_range: {
				male: buildRange(form.male),
				female: buildRange(form.female),
				general: generalRange,
			},
			value_type: form.value_type,
			gender_type: form.gender_type,
		}

		await handleRequest({
			request: () =>
				editingParam
					? updateParameter({ id: editingParam._id, data: payload })
					: createParameter(payload),
			onSuccess: () => {
				if (editingParam) {
					setParams(prev =>
						prev.map(p =>
							p._id === editingParam._id
								? { ...p, ...payload, normal_range: payload.normal_range }
								: p
						)
					)
					toast.success('Parametr muvaffaqiyatli yangilandi 🎉')
				} else {
					setParams(prev => [
						...prev,
						{ ...payload, _id: Date.now().toString() } as AnalysisParameter,
					])
					toast.success('Parametr muvaffaqiyatli qo‘shildi 🎉')
				}

				setOpen(false)
				setEditingParam(null)
				setForm({
					parameter_code: '',
					parameter_name: '',
					unit: '',
					description: '',
					male: { min: '', max: '', value: '' },
					female: { min: '', max: '', value: '' },
					general: { min: '', max: '', value: '' },
					value_type: 'NUMBER',
					gender_type: 'MALE_FEMALE',
				})
			},
			onError: () => {
				toast.error('Xatolik: parametr saqlanmadi!')
			},
		})
	}

	// Min va Max inputlari uchun
	const isMinMaxDisabled = (range: {
		min: string
		max: string
		value: string
	}) => {
		return range.value.trim() !== '' // value mavjud bo'lsa min/max disabled
	}

	// Value inputi uchun
	const isValueDisabled = (range: {
		min: string
		max: string
		value: string
	}) => {
		// min va max faqat 0 yoki bo'sh bo'lsa value ochiq bo'lsin
		const min = Number(range.min) !== 0
		const max = Number(range.max) !== 0
		return min || max
	}

	const onSaveParameter = () => {
		const result = addParameterSchema().safeParse(form)
		if (!result.success) {
			const newErrors = {}
			result.error.errors.forEach(err => {
				newErrors[err.path[0]] = err.message
			})
			setErrors(newErrors)
			console.log('onSaveParameter da xatolik bor')
			return
		}
		console.log('onSaveParameter ishladi')
		handleSubmit()
	}

	useEffect(() => {
		if (data?.data) {
			console.log('getById data:', data.data)
			setParams(data.data.analysis_parameters)
		}
	}, [data])

	if (isLoading) return <p className='p-4'>Yuklanmoqda...</p>
	if (isError || !data)
		return <p className='p-4 text-red-500'>Xatolik yuz berdi!</p>

	return (
		<div className='min-h-screen bg-background flex flex-col'>
			<header className='bg-card border-b sticky top-0 z-10'>
				<div className='w-full px-4 sm:px-6 py-4 flex items-center justify-between gap-3'>
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
						onClick={() => {
							setEditingParam(null)
							setForm({
								parameter_code: '',
								parameter_name: '',
								unit: '',
								description: '',
								male: { min: '', max: '', value: '' },
								female: { min: '', max: '', value: '' },
								general: { min: '', max: '', value: '' },
								value_type: 'NUMBER',
								gender_type: 'MALE_FEMALE',
							})
							setOpen(true)
						}}
					>
						+ Parametr qo‘shish
					</Button>
				</div>
			</header>

			{/* Mobile Card View */}
			<div className='p-4 sm:p-6 block lg:hidden space-y-4'>
				{params.map((param, index) => {
					const { general, male, female } = param.normal_range
					const isGeneral =
						general && (general.value || general.min !== 0 || general.max !== 0)
					const display = isGeneral
						? general.value
							? general.value
							: `${general.min}-${general.max}`
						: `${male.value || `${male.min}-${male.max}`} / ${
								female.value || `${female.min}-${female.max}`
						  }`

					return (
						<Card
							key={param._id}
							className='rounded-2xl shadow-md border border-gray-100 overflow-hidden'
						>
							<div className='p-3 space-y-2'>
								{/* Header */}
								<div className='flex items-start justify-between'>
									<div>
										<h3 className='font-semibold text-base text-gray-900'>
											{param.parameter_code}
										</h3>
										<p className='text-xs text-muted-foreground'>
											Nomi:{' '}
											<span className='font-medium'>
												{param.parameter_name}
											</span>
										</p>
									</div>
									<span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium'>
										#{index + 1}
									</span>
								</div>

								{/* Body info */}
								<div className='space-y-2 text-sm'>
									<div className='flex  gap-3'>
										<span className='text-muted-foreground'>Jinsi:</span>
										<span className='font-medium'>
											{isGeneral ? 'Umumiy' : 'Erkak / Ayol'}
										</span>
									</div>
									<div className='flex  gap-3'>
										<span className='text-muted-foreground'>Qiymat:</span>
										<span className='font-medium text-blue-600'>{display}</span>
									</div>
									<div className='flex  gap-3'>
										<span className='text-muted-foreground'>Birligi:</span>
										<span className='font-medium'>{param.unit}</span>
									</div>
								</div>

								{/* Actions */}
								{/* <div className='flex gap-2 pt-1'>
									<Button
										variant='outline'
										className='flex-1 flex items-center justify-center gap-1 text-xs'
										onClick={() => openEdit(param)}
									>
										<Edit size={14} />
										Tahrirlash
									</Button>

									<Dialog
										open={deleteId === param._id}
										onOpenChange={isOpen => {
											if (!isOpen) setDeleteId(null)
										}}
									>
										<DialogTrigger asChild>
											<Button
												variant='outline'
												className='flex-1 flex items-center justify-center gap-1 text-red-600 border-red-300 hover:bg-red-50 text-xs'
												onClick={() => setDeleteId(param._id)}
											>
												<Trash2 size={14} />
												O‘chirish
											</Button>
										</DialogTrigger>
										<DialogContent className='max-w-xs rounded-xl'>
											<DialogTitle>Parametr o‘chirish</DialogTitle>
											<p className='text-sm text-muted-foreground'>
												Rostan ham ushbu parameterni o‘chirmoqchimisiz?
											</p>
											<DialogFooter className='flex justify-end gap-2'>
												<Button
													variant='outline'
													onClick={() => setDeleteId(null)}
												>
													Yo‘q
												</Button>
												<Button
													className='bg-red-600 text-white'
													onClick={() => handleDelete(param._id)}
												>
													Ha
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								</div> */}
								{/* Actions */}
								<div className='flex gap-1.5 pt-1'>
									<Button
										variant='outline'
										size='sm'
										className='flex-1 flex items-center justify-center gap-1 text-[11px] py-1.5 h-7'
										onClick={() => openEdit(param)}
									>
										<Edit size={12} />
										Tahrirlash
									</Button>

									<Dialog
										open={deleteId === param._id}
										onOpenChange={isOpen => {
											if (!isOpen) setDeleteId(null)
										}}
									>
										<DialogTrigger asChild>
											<Button
												variant='outline'
												size='sm'
												className='flex-1 flex items-center justify-center gap-1 text-red-600 border-red-300 hover:bg-red-50 text-[11px] py-1.5 h-7'
												onClick={() => setDeleteId(param._id)}
											>
												<Trash2 size={12} />
												O‘chirish
											</Button>
										</DialogTrigger>

										<DialogContent className='max-w-xs rounded-xl'>
											<DialogTitle className='text-sm'>
												Parametr o‘chirish
											</DialogTitle>
											<p className='text-xs text-muted-foreground'>
												Rostan ham ushbu parameterni o‘chirmoqchimisiz?
											</p>
											<DialogFooter className='flex justify-end gap-2 pt-2'>
												<Button
													variant='outline'
													size='sm'
													className='h-7 text-xs'
												>
													Yo‘q
												</Button>
												<Button
													size='sm'
													className='bg-red-600 text-white h-7 text-xs'
													onClick={() => handleDelete(param._id)}
												>
													Ha
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								</div>
							</div>
						</Card>
					)
				})}
			</div>

			{/* Desktop Table View */}
			<div className='p-4 sm:p-6'>
				<Card className='card-shadow hidden lg:block'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-muted/50'>
								<tr>
									{[
										'ID',
										'Parametr kodi',
										'Parametr nomi',
										'Jinsi',
										'Qiymatlari',
										'Birligi',
										'Harakatlar',
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
								{params.map((param, index) => {
									const { general, male, female } = param.normal_range
									const isGeneral =
										general &&
										(general.value || general.min !== 0 || general.max !== 0)
									const display = isGeneral
										? general.value
											? general.value
											: `${general.min}-${general.max}`
										: `${male.value || `${male.min}-${male.max}`} / ${
												female.value || `${female.min}-${female.max}`
										  }`

									return (
										<tr
											key={param._id}
											className='hover:bg-accent/50 transition-smooth'
										>
											<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-medium text-primary'>
												{index + 1}
											</td>
											<td className='px-4 xl:px-6 py-3 xl:py-4'>
												<div className='font-medium text-sm xl:text-base'>
													{param.parameter_code}
												</div>
											</td>
											<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
												{param.parameter_name}
											</td>
											<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
												{isGeneral ? 'Umumiy' : 'Erkak / Ayol'}
											</td>
											<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
												{display}
											</td>
											<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
												{param.unit}
											</td>
											<td className='px-4 xl:px-6 py-3 xl:py-4'>
												<div className='flex justify-center gap-3'>
													<Button
														size='icon'
														variant='outline'
														className='h-7 w-7'
														onClick={() => openEdit(param)}
													>
														<Edit size={16} />
													</Button>

													{/* Delete dialog */}
													<Dialog
														open={deleteId === param._id}
														onOpenChange={isOpen => {
															if (!isOpen) setDeleteId(null)
														}}
													>
														<DialogTrigger asChild>
															<Button
																size='icon'
																variant='outline'
																className='h-7 w-7 text-red-500 border-red-300 hover:bg-red-50'
																onClick={() => setDeleteId(param._id)}
															>
																<Trash2 size={16} />
															</Button>
														</DialogTrigger>
														<DialogContent className='max-w-xs rounded-xl'>
															<DialogTitle>Parametr o‘chirish</DialogTitle>
															<p className='text-sm text-muted-foreground'>
																Rostan ham ushbu parameterni o‘chirmoqchimisiz?
															</p>
															<DialogFooter className='flex justify-end gap-2'>
																<Button
																	variant='outline'
																	onClick={() => setDeleteId(null)}
																>
																	Yo‘q
																</Button>
																<Button
																	className='bg-red-600 text-white'
																	onClick={() => handleDelete(param._id)}
																>
																	Ha
																</Button>
															</DialogFooter>
														</DialogContent>
													</Dialog>
												</div>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				</Card>
			</div>

			{/* Dialog */}
			<Dialog
				open={open}
				onOpenChange={open => {
					setOpen(open)
					if (!open) {
						setErrors({})
					}
				}}
			>
				<DialogContent className='w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh]'>
					<DialogHeader>
						<DialogTitle>
							{editingParam
								? 'Parametrni tahrirlash'
								: 'Yangi parametr qo‘shish'}
						</DialogTitle>
					</DialogHeader>

					<div className='space-y-3'>
						<Label>Parametr kodi</Label>
						<Input
							name='parameter_code'
							value={form.parameter_code}
							onChange={handleChange}
							placeholder='Cod kiriting'
						/>
						{errors.parameter_code && (
							<p className='text-red-500 text-sm'>{errors.parameter_code}</p>
						)}
						<Label>Parametr nomi</Label>
						<Input
							name='parameter_name'
							value={form.parameter_name}
							onChange={handleChange}
							placeholder='Nomini kiriting'
						/>
						{errors.parameter_name && (
							<p className='text-red-500 text-sm'>{errors.parameter_name}</p>
						)}
						<Label>Parametr birligi</Label>
						<Input
							name='unit'
							value={form.unit}
							onChange={handleChange}
							placeholder='Birlikni kiriting'
						/>
						{errors.unit && (
							<p className='text-red-500 text-sm'>{errors.unit}</p>
						)}
						<Label>Parametrga tavsif bering</Label>
						<Input
							name='description'
							value={form.description}
							onChange={handleChange}
							placeholder='Izoh qoldiring'
						/>
						{errors.description && (
							<p className='text-red-500 text-sm'>{errors.description}</p>
						)}

						{/* Gender type radios — faqat create holatida */}
						{!editingParam && (
							<div className='flex gap-4'>
								<label className='flex items-center gap-1'>
									<input
										type='radio'
										checked={form.gender_type === 'MALE_FEMALE'}
										onChange={() => handleGenderTypeChange('MALE_FEMALE')}
									/>
									Erkak/Ayol
								</label>
								<label className='flex items-center gap-1'>
									<input
										type='radio'
										checked={form.gender_type === 'GENERAL'}
										onChange={() => handleGenderTypeChange('GENERAL')}
									/>
									Umumiy
								</label>
							</div>
						)}

						{/* Inputs */}
						{form.gender_type === 'MALE_FEMALE' && (
							<>
								<Label>Erkak</Label>
								<div className='grid grid-cols-3 gap-2'>
									<Input
										placeholder='Min'
										value={form.male.min}
										type='number'
										onChange={e =>
											handleNormalChange('male', 'min', e.target.value)
										}
										onKeyDown={e => {
											if (
												e.key === ',' ||
												e.key === 'e' ||
												e.key === 'E' ||
												e.key === '+' ||
												e.key === '-'
											) {
												e.preventDefault()
											}
										}}
										disabled={isMinMaxDisabled(form.male)}
									/>
									<Input
										placeholder='Max'
										value={form.male.max}
										type='number'
										onChange={e =>
											handleNormalChange('male', 'max', e.target.value)
										}
										onKeyDown={e => {
											if (
												e.key === ',' ||
												e.key === 'e' ||
												e.key === 'E' ||
												e.key === '+' ||
												e.key === '-'
											) {
												e.preventDefault()
											}
										}}
										disabled={isMinMaxDisabled(form.male)}
									/>
									<Input
										placeholder='Qiymat'
										value={form.male.value}
										type='string'
										onChange={e =>
											handleNormalChange('male', 'value', e.target.value)
										}
										disabled={isValueDisabled(form.male)}
									/>
								</div>

								<Label>Ayol</Label>
								<div className='grid grid-cols-3 gap-2'>
									<Input
										placeholder='Min'
										value={form.female.min}
										type='number'
										onChange={e =>
											handleNormalChange('female', 'min', e.target.value)
										}
										onKeyDown={e => {
											if (
												e.key === ',' ||
												e.key === 'e' ||
												e.key === 'E' ||
												e.key === '+' ||
												e.key === '-'
											) {
												e.preventDefault()
											}
										}}
										disabled={isMinMaxDisabled(form.female)}
									/>
									<Input
										placeholder='Max'
										value={form.female.max}
										type='number'
										onChange={e =>
											handleNormalChange('female', 'max', e.target.value)
										}
										onKeyDown={e => {
											if (
												e.key === ',' ||
												e.key === 'e' ||
												e.key === 'E' ||
												e.key === '+' ||
												e.key === '-'
											) {
												e.preventDefault()
											}
										}}
										disabled={isMinMaxDisabled(form.female)}
									/>
									<Input
										placeholder='Qiymat'
										value={form.female.value}
										type='string'
										onChange={e =>
											handleNormalChange('female', 'value', e.target.value)
										}
										disabled={isValueDisabled(form.female)}
									/>
								</div>
							</>
						)}

						{form.gender_type === 'GENERAL' && (
							<>
								<Label>Umumiy</Label>
								<div className='grid grid-cols-3 gap-2'>
									<Input
										placeholder='Min'
										value={form.general.min}
										type='number'
										onChange={e =>
											handleNormalChange('general', 'min', e.target.value)
										}
										onKeyDown={e => {
											if (
												e.key === ',' ||
												e.key === 'e' ||
												e.key === 'E' ||
												e.key === '+' ||
												e.key === '-'
											) {
												e.preventDefault()
											}
										}}
										disabled={isMinMaxDisabled(form.general)}
									/>

									<Input
										placeholder='Max'
										value={form.general.max}
										type='number'
										onChange={e =>
											handleNormalChange('general', 'max', e.target.value)
										}
										onKeyDown={e => {
											if (
												e.key === ',' ||
												e.key === 'e' ||
												e.key === 'E' ||
												e.key === '+' ||
												e.key === '-'
											) {
												e.preventDefault()
											}
										}}
										disabled={isMinMaxDisabled(form.general)}
									/>
									<Input
										placeholder='Qiymat'
										value={form.general.value}
										type='string'
										onChange={e =>
											handleNormalChange('general', 'value', e.target.value)
										}
										disabled={isValueDisabled(form.general)}
									/>
								</div>
							</>
						)}
					</div>

					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setOpen(false)
								setErrors({})
							}}
						>
							Bekor qilish
						</Button>
						<Button
							onClick={onSaveParameter}
							disabled={creating || updating}
							className='bg-blue-600 text-white'
						>
							{creating || updating ? 'Saqlanmoqda...' : 'Saqlash'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
