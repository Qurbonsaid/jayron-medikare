import { useNavigate } from 'react-router-dom'
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
import { Edit, Trash2, ArrowLeft, X } from 'lucide-react'
import { toast } from 'sonner'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import { Label } from '@/components/ui/label'
import {
	useCreateDiseaseMutation,
	useDeleteDiseaseMutation,
	useGetAllDiagnosisQuery,
	useUpdateDiseaseMutation,
} from '@/app/api/diagnosisApi'
import type {
	DiseaseCreateRequest,
	Disease,
} from '@/app/api/diagnosisApi/types'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface FormState {
	code: string
	name: string
	description: string
	symptoms: string[]
	causes: string[]
	treatments: string[]
	is_chronic: boolean
	is_contagious: boolean
}

const initialFormState: FormState = {
	code: '',
	name: '',
	description: '',
	symptoms: [],
	causes: [],
	treatments: [],
	is_chronic: false,
	is_contagious: false,
}

export default function AnalysisParamsModal() {
	const navigate = useNavigate()
	const handleRequest = useHandleRequest()

	const [page, setPage] = useState(1)
	const [limit] = useState(100)
	const [searchQuery, setSearchQuery] = useState('')

	const { data, isLoading, isError, refetch } = useGetAllDiagnosisQuery({
		page,
		limit,
		search: searchQuery || undefined,
	})

	const [createDisease, { isLoading: creating }] = useCreateDiseaseMutation()
	const [updateDisease, { isLoading: updating }] = useUpdateDiseaseMutation()
	const [deleteDisease, { isLoading: deleting }] = useDeleteDiseaseMutation()

	const [open, setOpen] = useState(false)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [editingDisease, setEditingDisease] = useState<Disease | null>(null)
	const [form, setForm] = useState<FormState>(initialFormState)
	const [errors, setErrors] = useState<Record<string, string>>({})

	// Temporary input values for array fields
	const [symptomInput, setSymptomInput] = useState('')
	const [causeInput, setCauseInput] = useState('')
	const [treatmentInput, setTreatmentInput] = useState('')

	// Auto refetch when data changes
	useEffect(() => {
		refetch()
	}, [page, limit])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }))
		setErrors(prev => ({ ...prev, [name]: '' }))
	}

	const handleAddItem = (
		type: 'symptoms' | 'causes' | 'treatments',
		value: string
	) => {
		if (!value.trim()) return

		if (form[type].includes(value.trim())) {
			toast.error('Bu element allaqachon mavjud')
			return
		}

		setForm(prev => ({
			...prev,
			[type]: [...prev[type], value.trim()],
		}))

		// Clear input
		if (type === 'symptoms') setSymptomInput('')
		if (type === 'causes') setCauseInput('')
		if (type === 'treatments') setTreatmentInput('')
	}

	const handleRemoveItem = (
		type: 'symptoms' | 'causes' | 'treatments',
		index: number
	) => {
		setForm(prev => ({
			...prev,
			[type]: prev[type].filter((_, i) => i !== index),
		}))
	}

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!form.code.trim()) newErrors.code = 'Kasallik kodi majburiy'
		if (!form.name.trim()) newErrors.name = 'Kasallik nomi majburiy'
		if (!form.description.trim()) newErrors.description = 'Tavsif majburiy'
		// if (form.symptoms.length === 0)
		//     newErrors.symptoms = 'Kamida bitta alomat kiriting'
		// if (form.causes.length === 0)
		//     newErrors.causes = 'Kamida bitta sabab kiriting'
		// if (form.treatments.length === 0)
		//     newErrors.treatments = 'Kamida bitta davolash usuli kiriting'

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async () => {
		if (!validate()) return

		const payload: DiseaseCreateRequest = {
			code: form.code,
			name: form.name,
			description: form.description,
			symptoms: form.symptoms,
			causes: form.causes,
			treatments: form.treatments,
			is_chronic: form.is_chronic,
			is_contagious: form.is_contagious,
		}

		if (editingDisease) {
			await handleRequest({
				request: () => updateDisease({ id: editingDisease._id, data: payload }),
				onSuccess: () => {
					toast.success('Kasallik muvaffaqiyatli yangilandi 🎉')
					handleClose()
					refetch()
				},
			})
		} else {
			await handleRequest({
				request: () => createDisease(payload),
				onSuccess: () => {
					toast.success("Kasallik muvaffaqiyatli qo'shildi 🎉")
					handleClose()
					refetch()
				},
			})
		}
	}

	const handleEdit = (disease: Disease) => {
		setEditingDisease(disease)
		setForm({
			code: disease.code,
			name: disease.name,
			description: disease.description,
			symptoms: disease.symptoms,
			causes: disease.causes,
			treatments: disease.treatments,
			is_chronic: disease.is_chronic,
			is_contagious: disease.is_contagious,
		})
		setOpen(true)
	}

	const handleDelete = async (id: string) => {
		await handleRequest({
			request: () => deleteDisease(id),
			onSuccess: () => {
				toast.success("Kasallik muvaffaqiyatli o'chirildi")
				setDeleteId(null)
				refetch()
			},
		})
	}

	const handleClose = () => {
		setOpen(false)
		setEditingDisease(null)
		setForm(initialFormState)
		setErrors({})
		setSymptomInput('')
		setCauseInput('')
		setTreatmentInput('')
	}

	if (isLoading) return <p className='p-4'>Yuklanmoqda...</p>
	if (isError || !data)
		return <p className='p-4 text-red-500'>Xatolik yuz berdi!</p>

	return (
		<div className='min-h-screen bg-background flex flex-col'>
			<header className='bg-card border-b'>
				<div className='w-full px-4 sm:px-6 py-5 flex items-center justify-between gap-3'>
					<div className='flex-1 max-w-md'>
						<Input
							placeholder='Kasallik qidirish...'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className='w-full'
						/>
					</div>

					<Button
						className='bg-blue-600 hover:bg-blue-700 text-white'
						onClick={() => setOpen(true)}
					>
						+ Kasallik qo'shish
					</Button>
				</div>
			</header>

			{/* Mobile Card View */}
			<div className='p-4 sm:p-6 block lg:hidden space-y-4'>
				{data?.data.map((param, index) => (
					<Card
						key={param._id}
						className='rounded-2xl shadow-md border border-gray-100 overflow-hidden'
					>
						<div className='p-3 space-y-2'>
							{/* Header */}
							<div className='flex items-start justify-between'>
								<div className='flex-1 min-w-0'>
									<h3 className='font-semibold text-base text-gray-900 truncate'>
										{param.code}
									</h3>
									<p className='text-xs text-muted-foreground'>
										Nomi: <span className='font-bold'>{param.name}</span>
									</p>
								</div>
								<span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium'>
									#{index + 1}
								</span>
							</div>

							{/* Body info */}
							<div className='space-y-1.5 text-xs sm:text-sm'>
								<div className='flex flex-col gap-1'>
									<span className='text-muted-foreground font-medium'>
										Alomatlari:
									</span>
									<span className='font-medium'>
										{param.symptoms.join(', ')}
									</span>
								</div>
								<div className='flex flex-col gap-1'>
									<span className='text-muted-foreground font-medium'>
										Sabablari:
									</span>
									<span className='font-medium'>{param.causes.join(', ')}</span>
								</div>
								<div className='flex flex-col gap-1'>
									<span className='text-muted-foreground font-medium'>
										Davolash:
									</span>
									<span className='font-medium'>
										{param.treatments.join(', ')}
									</span>
								</div>
								<div className='flex gap-4 mt-2'>
									<div className='flex items-center gap-1.5'>
										<span className='text-muted-foreground'>Surunkali:</span>
										<span
											className={`font-medium ${
												param.is_chronic ? 'text-orange-600' : 'text-gray-600'
											}`}
										>
											{param.is_chronic ? 'Ha' : "Yo'q"}
										</span>
									</div>
									<div className='flex items-center gap-1.5'>
										<span className='text-muted-foreground'>Yuqumli:</span>
										<span
											className={`font-medium ${
												param.is_contagious ? 'text-red-600' : 'text-gray-600'
											}`}
										>
											{param.is_contagious ? 'Ha' : "Yo'q"}
										</span>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className='flex gap-1.5 pt-2'>
								<Button
									variant='outline'
									size='sm'
									className='flex-1 flex items-center justify-center gap-1 text-[11px] sm:text-xs py-1.5 h-7'
									onClick={() => handleEdit(param)}
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
											className='flex-1 flex items-center justify-center gap-1 text-red-600 border-red-300 hover:bg-red-50 text-[11px] sm:text-xs py-1.5 h-7'
											onClick={() => setDeleteId(param._id)}
											disabled={deleting}
										>
											<Trash2 size={12} />
											O'chirish
										</Button>
									</DialogTrigger>
									<DialogContent className='max-w-xs rounded-xl'>
										<DialogTitle className='text-sm'>
											Kasallikni o'chirish
										</DialogTitle>
										<p className='text-xs text-muted-foreground'>
											Rostan ham ushbu kasallikni o'chirmoqchimisiz?
										</p>
										<DialogFooter className='flex justify-end gap-2 pt-2'>
											<Button
												variant='outline'
												size='sm'
												className='h-7 text-xs'
												onClick={() => setDeleteId(null)}
											>
												Yo'q
											</Button>
											<Button
												size='sm'
												className='bg-red-600 text-white h-7 text-xs'
												onClick={() => handleDelete(param._id)}
												disabled={deleting}
											>
												{deleting ? "O'chirilmoqda..." : 'Ha'}
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</div>
					</Card>
				))}
			</div>

			{/* Desktop Table View */}
			<div className='p-4 sm:p-6'>
				<Card className='card-shadow hidden lg:block'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-muted/50'>
								<tr>
									{[
										'Kasallik kodi',
										'Kasallik nomi',
										'Alomatlari',
										'Sabablari',
										'Davolash usullari',
										'Surunkalilik holati',
										'Yuqumlilik holati',
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
								{data?.data.map((param, index) => (
									<tr
										key={param._id}
										className='hover:bg-accent/50 transition-smooth'
									>
										<td className='px-3 xl:px-5 py-3 xl:py-4'>
											<div className='font-medium text-sm xl:text-base'>
												{param.code}
											</div>
										</td>
										<td className='px-3 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm'>
											{param.name}
										</td>
										<td className='px-3 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm'>
											{param.symptoms.join(', ')}
										</td>
										<td className='px-3 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm'>
											{param.causes.join(', ')}
										</td>
										<td className='px-3 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm'>
											{param.treatments.join(', ')}
										</td>
										<td className='px-3 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm'>
											{param.is_chronic ? 'Ha' : "Yo'q"}
										</td>
										<td className='px-3 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm'>
											{param.is_contagious ? 'Ha' : "Yo'q"}
										</td>
										<td className='px-3 xl:px-5 py-3 xl:py-4'>
											<div className='flex justify-center gap-3'>
												<Button
													size='icon'
													variant='outline'
													className='h-7 w-7'
													onClick={() => handleEdit(param)}
												>
													<Edit size={16} />
												</Button>

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
															disabled={deleting}
														>
															<Trash2 size={16} />
														</Button>
													</DialogTrigger>
													<DialogContent className='max-w-xs rounded-xl'>
														<DialogTitle>Kasallikni o'chirish</DialogTitle>
														<p className='text-sm text-muted-foreground'>
															Rostan ham ushbu kasallikni o'chirmoqchimisiz?
														</p>
														<DialogFooter className='flex justify-end gap-2'>
															<Button
																variant='outline'
																onClick={() => setDeleteId(null)}
															>
																Yo'q
															</Button>
															<Button
																className='bg-red-600 text-white'
																onClick={() => handleDelete(param._id)}
																disabled={deleting}
															>
																{deleting ? "O'chirilmoqda..." : 'Ha'}
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

			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className='w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh] max-w-xl '>
					<DialogHeader>
						<DialogTitle>
							{editingDisease
								? 'Kasallikni tahrirlash'
								: "Yangi kasallik qo'shish"}
						</DialogTitle>
					</DialogHeader>

					<div className='space-y-4'>
						{/* Code */}
						<div>
							<Label>Kasallik kodi *</Label>
							<Input
								name='code'
								value={form.code}
								onChange={handleChange}
								placeholder='Masalan: D001'
							/>
							{errors.code && (
								<p className='text-red-500 text-sm mt-1'>{errors.code}</p>
							)}
						</div>

						{/* Name */}
						<div>
							<Label>Kasallik nomi *</Label>
							<Input
								name='name'
								value={form.name}
								onChange={handleChange}
								placeholder='Masalan: Diabetes Mellitus'
							/>
							{errors.name && (
								<p className='text-red-500 text-sm mt-1'>{errors.name}</p>
							)}
						</div>

						{/* Description */}
						<div>
							<Label>Tavsif *</Label>
							<Textarea
								name='description'
								value={form.description}
								onChange={handleChange}
								placeholder="Kasallik haqida qisqacha ma'lumot"
								rows={3}
							/>
							{errors.description && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.description}
								</p>
							)}
						</div>

						{/* Symptoms */}
						<div>
							<Label>Alomatlari *</Label>
							<div className='flex gap-2'>
								<Input
									value={symptomInput}
									onChange={e => setSymptomInput(e.target.value)}
									placeholder='Alomat kiriting'
									onKeyPress={e => {
										if (e.key === 'Enter') {
											e.preventDefault()
											handleAddItem('symptoms', symptomInput)
										}
									}}
								/>
								<Button
									type='button'
									onClick={() => handleAddItem('symptoms', symptomInput)}
									size='sm'
								>
									Qo'shish
								</Button>
							</div>
							<div className='flex flex-wrap gap-2 mt-2'>
								{form.symptoms.map((symptom, index) => (
									<div
										key={index}
										className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2'
									>
										{symptom}
										<X
											size={14}
											className='cursor-pointer hover:text-blue-900'
											onClick={() => handleRemoveItem('symptoms', index)}
										/>
									</div>
								))}
							</div>
							{errors.symptoms && (
								<p className='text-red-500 text-sm mt-1'>{errors.symptoms}</p>
							)}
						</div>

						{/* Causes */}
						<div>
							<Label>Sabablari *</Label>
							<div className='flex gap-2'>
								<Input
									value={causeInput}
									onChange={e => setCauseInput(e.target.value)}
									placeholder='Sabab kiriting'
									onKeyPress={e => {
										if (e.key === 'Enter') {
											e.preventDefault()
											handleAddItem('causes', causeInput)
										}
									}}
								/>
								<Button
									type='button'
									onClick={() => handleAddItem('causes', causeInput)}
									size='sm'
								>
									Qo'shish
								</Button>
							</div>
							<div className='flex flex-wrap gap-2 mt-2'>
								{form.causes.map((cause, index) => (
									<div
										key={index}
										className='bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-2'
									>
										{cause}
										<X
											size={14}
											className='cursor-pointer hover:text-orange-900'
											onClick={() => handleRemoveItem('causes', index)}
										/>
									</div>
								))}
							</div>
							{errors.causes && (
								<p className='text-red-500 text-sm mt-1'>{errors.causes}</p>
							)}
						</div>

						{/* Treatments */}
						<div>
							<Label>Davolash usullari *</Label>
							<div className='flex gap-2'>
								<Input
									value={treatmentInput}
									onChange={e => setTreatmentInput(e.target.value)}
									placeholder='Davolash usuli kiriting'
									onKeyPress={e => {
										if (e.key === 'Enter') {
											e.preventDefault()
											handleAddItem('treatments', treatmentInput)
										}
									}}
								/>
								<Button
									type='button'
									onClick={() => handleAddItem('treatments', treatmentInput)}
									size='sm'
								>
									Qo'shish
								</Button>
							</div>
							<div className='flex flex-wrap gap-2 mt-2'>
								{form.treatments.map((treatment, index) => (
									<div
										key={index}
										className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2'
									>
										{treatment}
										<X
											size={14}
											className='cursor-pointer hover:text-green-900'
											onClick={() => handleRemoveItem('treatments', index)}
										/>
									</div>
								))}
							</div>
							{errors.treatments && (
								<p className='text-red-500 text-sm mt-1'>{errors.treatments}</p>
							)}
						</div>

						{/* Checkboxes */}
						<div className='flex gap-6'>
							<div className='flex items-center gap-2'>
								<Checkbox
									id='is_chronic'
									checked={form.is_chronic}
									onCheckedChange={checked =>
										setForm(prev => ({
											...prev,
											is_chronic: checked as boolean,
										}))
									}
								/>
								<Label htmlFor='is_chronic' className='cursor-pointer'>
									Surunkali kasallik
								</Label>
							</div>

							<div className='flex items-center gap-2'>
								<Checkbox
									id='is_contagious'
									checked={form.is_contagious}
									onCheckedChange={checked =>
										setForm(prev => ({
											...prev,
											is_contagious: checked as boolean,
										}))
									}
								/>
								<Label htmlFor='is_contagious' className='cursor-pointer'>
									Yuqumli kasallik
								</Label>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant='outline' onClick={handleClose}>
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
