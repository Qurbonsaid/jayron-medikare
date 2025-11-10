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
	DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Edit, Trash2, ArrowLeft, Phone, Eye } from 'lucide-react'
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

interface FormState {
	parameter_code: string
	parameter_name: string
	unit: string
	description: string
	male: { min: string; max: string; value: string }
	female: { min: string; max: string; value: string }
	general: { min: string; max: string; value: string }
}

export default function AnalysisParamsModal() {
	const navigate = useNavigate()
	const { id } = useParams<{ id: string }>()
	const { data, isLoading, isError } = useGetDiagnosticByIdQuery(id!)
	const [params, setParams] = useState<AnalysisParameter[]>([])
	const [open, setOpen] = useState(false)
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
			if (key === 'value') {
				if (value.trim() !== '') {
					updated.min = ''
					updated.max = ''
				}
			} else {
				if (value.trim() !== '') {
					updated.value = ''
				}
			}
			return { ...prev, [type]: updated }
		})
	}

	const buildRange = (range: { min: string; max: string; value: string }) => {
		if (range.value.trim() !== '') return { min: 0, max: 0, value: range.value }
		const min = Number(range.min) || 0
		const max = Number(range.max) || 0
		return { min, max, value: '' }
	}

	const openEdit = (param: AnalysisParameter) => {
		setEditingParam(null) // eski paramni tozalaymiz
		setForm({
			parameter_code: param.parameter_code,
			parameter_name: param.parameter_name,
			unit: param.unit,
			description: param.description,
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
		setEditingParam(param) // keyin yangi paramni set qilamiz
		setOpen(true)
	}

	const handleSubmit = async () => {
		if (!id) return

		// Check if male/female values are identical → assign to general
		let generalRange = buildRange(form.general)
		if (
			form.male.value === form.female.value &&
			form.male.value.trim() !== ''
		) {
			generalRange = { min: 0, max: 0, value: form.male.value }
		} else if (
			form.male.min === form.female.min &&
			form.male.max === form.female.max &&
			(form.male.min !== '' || form.male.max !== '')
		) {
			generalRange = {
				min: Number(form.male.min),
				max: Number(form.male.max),
				value: '',
			}
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
				})
			},
			onError: () => {
				toast.error('Xatolik: parametr saqlanmadi!')
			},
		})
	}

	if (isLoading) return <p className='p-4'>Yuklanmoqda...</p>
	if (isError || !data)
		return <p className='p-4 text-red-500'>Xatolik yuz berdi!</p>

	return (
		<div className='min-h-screen bg-background flex flex-col'>
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
						onClick={() => {
							setEditingParam(null) // dialog ochilishidan oldin reset qilamiz
							setForm({
								parameter_code: '',
								parameter_name: '',
								unit: '',
								description: '',
								male: { min: '', max: '', value: '' },
								female: { min: '', max: '', value: '' },
								general: { min: '', max: '', value: '' },
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
							<div className='p-4 space-y-3'>
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
								<div className='flex gap-2 pt-2'>
									<Button
										variant='outline'
										className='flex-1 flex items-center justify-center gap-2 text-sm'
										onClick={() => openEdit(param)}
									>
										<Edit size={16} />
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
												className='flex-1 flex items-center justify-center gap-2 text-red-600 border-red-300 hover:bg-red-50 text-sm'
												onClick={() => setDeleteId(param._id)}
											>
												<Trash2 size={16} />
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
														className='h-8 w-8'
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
																className='h-8 w-8 text-red-500 border-red-300 hover:bg-red-50'
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

					{/* Pagination */}
					{/* <div className='px-4 xl:px-6 py-3 xl:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3'>
											<div className='text-xs xl:text-sm text-muted-foreground'>
												{patientdata.pagination.prev_page
													? (patientdata.pagination.page - 1) *
															patientdata.pagination.limit +
														1
													: 1}{' '}
												- {patientdata.pagination.total_items} дан{' '}
												{patientdata.pagination.limit} та кўрсатилмоқда
											</div>
											<div className='flex gap-2'>
												<Button
													variant='outline'
													size='sm'
													disabled={currentPage === 1}
													onClick={() => setCurrentPage(currentPage - 1)}
													className='text-xs xl:text-sm'
												>
													Олдинги
												</Button>
												{(() => {
													const pages = [];
													const showPages = new Set<number>();
			
													// Har doim 1-sahifani ko'rsat
													showPages.add(1);
			
													// Har doim oxirgi sahifani ko'rsat
													if (patientdata.pagination.total_pages > 1) {
														showPages.add(patientdata.pagination.total_pages);
													}
			
													// Joriy sahifa va uning atrofidagi sahifalarni ko'rsat
													for (
														let i = Math.max(2, currentPage - 1);
														i <=
														Math.min(
															patientdata.pagination.total_pages - 1,
															currentPage + 1
														);
														i++
													) {
														showPages.add(i);
													}
			
													const sortedPages = Array.from(showPages).sort(
														(a, b) => a - b
													);
			
													sortedPages.forEach((page, index) => {
														// Ellipsis qo'shish agar sahifalar orasida bo'sh joy bo'lsa
														if (index > 0 && sortedPages[index - 1] !== page - 1) {
															pages.push(
																<span
																	key={`ellipsis-${page}`}
																	className='px-2 flex items-center text-xs xl:text-sm'
																>
																	...
																</span>
															);
														}
			
														// Sahifa tugmasi
														pages.push(
															<Button
																key={page}
																variant='outline'
																size='sm'
																onClick={() => setCurrentPage(page)}
																className={`text-xs xl:text-sm ${
																	page === currentPage
																		? 'bg-primary text-white hover:bg-primary/60 hover:text-white'
																		: ''
																}`}
															>
																{page}
															</Button>
														);
													});
			
													return pages;
												})()}
												<Button
													variant='outline'
													size='sm'
													disabled={
														currentPage === patientdata.pagination.total_pages
													}
													onClick={() => setCurrentPage(currentPage + 1)}
													className='text-xs xl:text-sm'
												>
													Кейинги
												</Button>
											</div>
										</div> */}
				</Card>
			</div>

			{/* Create / Update Dialog */}
			<Dialog open={open} onOpenChange={setOpen}>
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
						<Label>Parametr nomi</Label>
						<Input
							name='parameter_name'
							value={form.parameter_name}
							onChange={handleChange}
							placeholder='Nomini kiriting'
						/>
						<Label>Parametr birligi</Label>
						<Input
							name='unit'
							value={form.unit}
							onChange={handleChange}
							placeholder='Birlikni kiriting'
						/>
						<Label>Parametrga tavsif bering</Label>
						<Input
							name='description'
							value={form.description}
							onChange={handleChange}
							placeholder='Izoh qoldiring'
						/>

						{/* <p className='font-medium text-sm mt-2'>Erkak:</p>
						<div className='grid grid-cols-3 gap-2'>
							<Input
								placeholder='Min'
								value={form.male.min}
								onChange={e =>
									handleNormalChange('male', 'min', e.target.value)
								}
								disabled={form.male.value.trim() !== ''}
							/>
							<Input
								placeholder='Max'
								value={form.male.max}
								onChange={e =>
									handleNormalChange('male', 'max', e.target.value)
								}
								disabled={form.male.value.trim() !== ''}
							/>
							<Input
								placeholder='Qiymat'
								value={form.male.value}
								onChange={e =>
									handleNormalChange('male', 'value', e.target.value)
								}
								disabled={
									form.male.min.trim() !== '' || form.male.max.trim() !== ''
								}
							/>
						</div>

						<p className='font-medium text-sm mt-2'>Ayol:</p>
						<div className='grid grid-cols-3 gap-2'>
							<Input
								placeholder='Min'
								value={form.female.min}
								onChange={e =>
									handleNormalChange('female', 'min', e.target.value)
								}
								disabled={form.female.value.trim() !== ''}
							/>
							<Input
								placeholder='Max'
								value={form.female.max}
								onChange={e =>
									handleNormalChange('female', 'max', e.target.value)
								}
								disabled={form.female.value.trim() !== ''}
							/>
							<Input
								placeholder='Qiymat'
								value={form.female.value}
								onChange={e =>
									handleNormalChange('female', 'value', e.target.value)
								}
								disabled={
									form.female.min.trim() !== '' || form.female.max.trim() !== ''
								}
							/>
						</div> */}

						<p className='font-medium text-sm mt-2'>Erkak:</p>
						<div className='grid grid-cols-3 gap-2'>
							{/* MIN */}
							<Input
								placeholder='Min'
								value={form.male.min}
								onChange={e =>
									handleNormalChange('male', 'min', e.target.value)
								}
								disabled={form.male.value.trim() !== ''}
							/>

							{/* MAX */}
							<Input
								placeholder='Max'
								value={form.male.max}
								onChange={e =>
									handleNormalChange('male', 'max', e.target.value)
								}
								disabled={form.male.value.trim() !== ''}
							/>

							{/* VALUE */}
							<Input
								placeholder='Qiymat'
								value={form.male.value}
								onChange={e =>
									handleNormalChange('male', 'value', e.target.value)
								}
								disabled={
									(form.male.min && form.male.min !== '0') ||
									(form.male.max && form.male.max !== '0')
								}
							/>
						</div>

						<p className='font-medium text-sm mt-2'>Ayol:</p>
						<div className='grid grid-cols-3 gap-2'>
							{/* MIN */}
							<Input
								placeholder='Min'
								value={form.female.min}
								onChange={e =>
									handleNormalChange('female', 'min', e.target.value)
								}
								disabled={form.female.value.trim() !== ''}
							/>

							{/* MAX */}
							<Input
								placeholder='Max'
								value={form.female.max}
								onChange={e =>
									handleNormalChange('female', 'max', e.target.value)
								}
								disabled={form.female.value.trim() !== ''}
							/>

							{/* VALUE */}
							<Input
								placeholder='Qiymat'
								value={form.female.value}
								onChange={e =>
									handleNormalChange('female', 'value', e.target.value)
								}
								disabled={
									(form.female.min && form.female.min !== '0') ||
									(form.female.max && form.female.max !== '0')
								}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button variant='outline' onClick={() => setOpen(false)}>
							Bekor qilish
						</Button>
						<Button
							onClick={handleSubmit}
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
