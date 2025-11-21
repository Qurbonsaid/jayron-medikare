import { useState, useEffect } from 'react'
import {
	useGetAllPatientAnalysisQuery,
	useGetPatientAnalysisByIdQuery,
} from '@/app/api/patientAnalysisApi/patientAnalysisApi'
import { useGetDiagnosticByIdQuery } from '@/app/api/diagnostic/diagnosticApi'
import { useGetAllPatientQuery } from '@/app/api/patientApi/patientApi'
import { useGetAllDiagnosticsQuery } from '@/app/api/diagnostic/diagnosticApi'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

import { CheckCircle, Clock, FileText, Loader2, X } from 'lucide-react'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
// import { GetByIdRes } from '@/app/api/patientAnalysisApi/types'

// --- fayl boshida importlarga qo'shing:
import { useUpdatePatientAnalysisMutation } from '@/app/api/patientAnalysisApi/patientAnalysisApi'
import type { UpdateReq } from '@/app/api/patientAnalysisApi/types' // agar export qilsangiz
import { PATHS } from '@/app/api/patientAnalysisApi/path'

enum ExamLevel {
	ODDIY = 'ODDIY',
	SHOSHILINCH = 'SHOSHILINCH',
	JUDA_SHOSHILINCH = 'JUDA_SHOSHILINCH',
}

enum ExamStatus {
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}

interface Filters {
	page: number
	limit: number
	patient?: string
	status?: string
	level?: string
	analysis_type?: string
}

interface NormalRange {
	male: { min: number; max: number }
	female?: { min: number; max: number }
}

interface TestParameter {
	parameter_name: string
	unit: string
	normal_range?: NormalRange
	result?: string
}

interface PatientAnalysis {
	_id: string
	patient: { fullname: string }
	analysis_type: { name: string }
	created_at: string
	level: ExamLevel
	status: ExamStatus
}

interface Filters {
	page: number
	limit: number
	patient?: string
	status?: string
	level?: string
	analysis_type?: string
}

interface GetByIdRes {
	success: boolean
	data: {
		_id: string
		analysis_type: {
			_id: string
			code: string
			name: string
			description: string
		}
		patient: {
			_id: string
			patient_id: string
			fullname: string
			phone: string
			gender: 'male' | 'female' | 'general'
			date_of_birth: string
		}
		results: GetByIdResults[]
		level: ExamLevel
		clinical_indications: string
		comment: string
		status: ExamStatus
		created_at: string
		updated_at: string
	}
}

interface GetByIdResults {
	analysis_parameter_type: {
		normal_range: {
			male: {
				min: number
				max: number
				value: string
			}
			female: {
				min: number
				max: number
				value: string
			}
			general: {
				min: number
				max: number
				value: string
			}
		}
		_id: string
		parameter_code: string
		parameter_name: string
		unit: string
		value_type: 'NUMBER' | 'STRING'
		gender_type: 'GENERAL' | 'MALE_FEMALE'
	}
	analysis_parameter_value: number | string
	_id: string
}

const LabResults = () => {
	const [filters, setFilters] = useState<Filters>({ page: 1, limit: 10 })
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
	const [isVerified, setIsVerified] = useState(false)
	const [comments, setComments] = useState('')
	const [testParameters, setTestParameters] = useState<GetByIdResults[]>([])

	const { data, isFetching } = useGetAllPatientAnalysisQuery(
		{ page: filters.page, limit: filters.limit, ...filters },
		{ refetchOnMountOrArgChange: true }
	)
	const selectedOrder = data?.data.find(item => item._id === selectedOrderId)

	const { data: patientsData } = useGetAllPatientQuery({
		page: 1,
		limit: 100,
		is_diagnosis: true,
	})
	const { data: diagnosticsData } = useGetAllDiagnosticsQuery()
	const [showErrors, setShowErrors] = useState(false)

	const {
		data: diagnosticData,
		isFetching: isDiagnosticLoading,
		refetch: refetchDiagnostic,
	} = useGetPatientAnalysisByIdQuery(selectedOrderId ?? '', {
		skip: !selectedOrderId, // faqat ID bo'lsa chaqiriladi
	})

	useEffect(() => {
		if (selectedOrderId) {
			refetchDiagnostic()
		}
	}, [selectedOrderId, refetchDiagnostic])

	// diagnosticData.data.analysis_parameters ni TestParameter[] deb aytish
	useEffect(() => {
		if (diagnosticData?.data) {
			setTestParameters(diagnosticData.data.results as GetByIdResults[])
		}
	}, [diagnosticData])

	const handleChange = (key: keyof Filters, value: string) => {
		setFilters(prev => ({
			...prev,
			[key]: value === 'all' ? undefined : value,
		}))
	}

	const openResultModal = (orderId: string) => {
		const order = data?.data.find(item => item._id === orderId)
		if (!order) {
			toast.error('Таҳлил топилмади') // yoki boshqa xabar
			return
		}
		setSelectedOrderId(orderId)
		setIsModalOpen(true)
		setIsVerified(false)
		setComments('')
	}

	// const handleSubmitResults = () => {
	// 	if (!isVerified) {
	// 		toast.error('Илтимос, натижаларни тасдиқланг')
	// 		return
	// 	}
	// 	toast.success('Натижалар юборилди')
	// 	setIsModalOpen(false)
	// }

	// ichida komponent
	const [updatePatientAnalysis, { isLoading: isUpdating }] =
		useUpdatePatientAnalysisMutation()

	// ... boshqa kodlar

	const handleSubmitResults = async () => {
		setShowErrors(true)

		// ❗ IKKINCHI: bo‘sh / xato inputlarni tekshirish
		const hasErrors = testParameters.some(p => {
			return !p.analysis_parameter_value || p.error
		})

		if (hasErrors) {
			toast.error('Бўш қийматлар бор. Илтимос, барчасини тўлдиринг.')
			return
		}
		// ❗ BIRINCHI: tasdiqlash
		if (!isVerified) {
			toast.error('Илтимос, натижаларни тасдиқланг')
			return
		}

		if (!selectedOrderId) {
			toast.error('Таҳлил танланмади')
			return
		}

		try {
			// map front params to backend body.results
			const resultsPayload = testParameters.map(p => {
				const isNumber = p.analysis_parameter_type.value_type === 'NUMBER'

				let finalValue: number | string = p.analysis_parameter_value

				// value_type NUMBER bo‘lsa → numberga aylantirib yuboramiz
				if (isNumber) {
					finalValue =
						p.analysis_parameter_value === '' ||
						p.analysis_parameter_value === null ||
						isNaN(Number(p.analysis_parameter_value))
							? null
							: Number(p.analysis_parameter_value)
				}

				return {
					analysis_parameter_type: p.analysis_parameter_type._id,
					analysis_parameter_value: finalValue,
				}
			})

			const body: UpdateReq = {
				results: resultsPayload,
				status: ExamStatus.COMPLETED, // talab qilindingizdek
				level:
					selectedOrder?.level ??
					diagnosticData?.data?.level ??
					ExamLevel.ODDIY,
				clinical_indications: diagnosticData?.data?.clinical_indications ?? '',
				comment: comments ?? '',
			}

			// yuborish
			const res = await updatePatientAnalysis({
				id: selectedOrderId,
				body,
			}).unwrap()
			setShowErrors(false)

			if (res?.success) {
				toast.success('Натижалар муваффақиятли сақланди')
				// yangilashlar: qayta olish (refetch) va modalni yopish
				setIsModalOpen(false)
				setComments(body.comment)
			} else {
				toast.error(res?.message || 'Серверда хатолик')
			}
		} catch (error: any) {
			console.error('Update error', error)
			const msg =
				error?.data?.message ||
				error?.data?.msg ||
				error?.message ||
				'Хатолик юз берди'
			toast.error(msg)
		}
	}

	const getStatusBadge = (status: ExamStatus) => {
		const variants: Record<
			ExamStatus,
			{ class: string; icon: React.ElementType; text: string }
		> = {
			PENDING: {
				class: 'bg-yellow-100 text-yellow-700',
				icon: Clock,
				text: 'Kutilmoqda',
			},
			COMPLETED: {
				class: 'bg-green-100 text-green-700',
				icon: CheckCircle,
				text: 'Bajarilgan',
			},
			CANCELLED: {
				class: 'bg-blue-100 text-blue-700',
				icon: FileText,
				text: 'Bekor qilingan',
			},
		}
		const Icon = variants[status].icon
		return (
			<Badge className={`${variants[status].class} border px-2 py-1 text-xs`}>
				<Icon className='w-3 h-3 mr-1' /> {variants[status].text}
			</Badge>
		)
	}

	const getLevelBadge = (level: ExamLevel) => {
		const colors: Record<ExamLevel, string> = {
			ODDIY: 'bg-gray-100 text-gray-700',
			SHOSHILINCH: 'bg-yellow-100 text-yellow-700',
			JUDA_SHOSHILINCH: 'bg-red-100 text-red-700',
		}
		const text: Record<ExamLevel, string> = {
			ODDIY: 'Oddiy',
			SHOSHILINCH: 'Shoshilinch',
			JUDA_SHOSHILINCH: 'Juda_shoshilinch',
		}
		return (
			<Badge className={`${colors[level]} border px-2 py-1 text-xs`}>
				{text[level]}
			</Badge>
		)
	}

	const calculateFlag = (
		value: string,
		normalRange: {
			male: { min: number; max: number }
			female?: { min: number; max: number }
		}
	) => {
		if (!value || !normalRange) return null
		const val = parseFloat(value)
		const min = normalRange.male.min
		const max = normalRange.male.max
		if (val < min) return { icon: '⬇️', color: 'text-blue-600' }
		if (val > max) return { icon: '⬆️', color: 'text-red-600' }
		return { icon: '✓', color: 'text-green-600' }
	}

	// const handleResultChange = (index: number, value: string) => {
	// 	const updated = [...testParameters]

	// 	updated[index].analysis_parameter_value = value

	// 	// VALIDATSIYA: bo‘sh bo‘lsa error=true
	// 	if (!value || value.trim() === '') {
	// 		updated[index].error = true
	// 	} else {
	// 		updated[index].error = false
	// 	}

	// 	setTestParameters(updated)
	// }
	const handleResultChange = (index: number, value: string | number) => {
		setTestParameters(prev => {
			const updated = [...prev]
			const isEmpty =
				value === '' ||
				value === null ||
				(typeof value === 'string' && value.trim() === '')

			updated[index] = {
				...updated[index],
				analysis_parameter_value: value,
				error: isEmpty, // ❗ yagona joyda set qilamiz
			}

			return updated
		})
	}

	useEffect(() => {
		if (diagnosticData?.data) {
			const cleaned = diagnosticData.data.results.map(r => ({
				...r,
				analysis_parameter_value:
					!r.analysis_parameter_value ||
					r.analysis_parameter_value === 0 ||
					r.analysis_parameter_value === ''
						? ''
						: r.analysis_parameter_value.toString(),
				error: false, // 🔥 validation uchun qo‘shdik
			}))

			setTestParameters(cleaned)
			setComments(diagnosticData.data.comment ?? '')
		}
	}, [diagnosticData])

	const patientGender = diagnosticData?.data?.patient?.gender

	const getGenderRange = (param: GetByIdResults) => {
		const range = param.analysis_parameter_type.normal_range
		const type = param.analysis_parameter_type.gender_type

		if (!range) return null

		// GENERAL bo‘lsa umumiy
		if (type === 'GENERAL') {
			return range.general
		}

		// MALE_FEMALE bo‘lsa patient genderga qarab
		if (patientGender === 'male') return range.male
		if (patientGender === 'female') return range.female

		return range.general
	}

	return (
		<div className='min-h-screen bg-background flex flex-col'>
			{/* Filters */}
			<div className='p-4'>
				<Card className='p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					<div>
						<Label>Бемор</Label>
						<Select
							value={filters.patient || 'all'}
							onValueChange={v => handleChange('patient', v)}
						>
							<SelectTrigger>
								<SelectValue placeholder='Барча беморлар' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Барча</SelectItem>
								{patientsData?.data?.map(p => (
									<SelectItem key={p._id} value={p._id}>
										{p.fullname}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>Ҳолат</Label>
						<Select
							value={filters.status || 'all'}
							onValueChange={v => handleChange('status', v)}
						>
							<SelectTrigger>
								<SelectValue placeholder='Барча ҳолатлар' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Барча</SelectItem>
								<SelectItem value={ExamStatus.PENDING}>Kutilmoqda</SelectItem>
								<SelectItem value={ExamStatus.COMPLETED}>Bajarilgan</SelectItem>
								<SelectItem value={ExamStatus.CANCELLED}>
									Bekor qilingan
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>Даража</Label>
						<Select
							value={filters.level || 'all'}
							onValueChange={v => handleChange('level', v)}
						>
							<SelectTrigger>
								<SelectValue placeholder='Барча даражалар' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Барча</SelectItem>
								<SelectItem value={ExamLevel.ODDIY}>Oddiy</SelectItem>
								<SelectItem value={ExamLevel.SHOSHILINCH}>
									Shoshilinch
								</SelectItem>
								<SelectItem value={ExamLevel.JUDA_SHOSHILINCH}>
									Juda shoshilinch
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>Таҳлил</Label>
						<Select
							value={filters.analysis_type || 'all'}
							onValueChange={v => handleChange('analysis_type', v)}
						>
							<SelectTrigger>
								<SelectValue placeholder='Барча таҳлиллар' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Барча</SelectItem>
								{diagnosticsData?.data?.map(d => (
									<SelectItem key={d._id} value={d._id}>
										{d.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</Card>
			</div>

			{/* Desktop Table */}
			{isFetching && (
				<div className='p-4 sm:p-6'>
					<Card className='card-shadow hidden lg:block'>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-muted/50'>
									<tr>
										{[
											'ID',
											'Бемор',
											'Таҳлил тури',
											'Сана',
											'Даража',
											'Ҳолат',
											'Ҳаракат',
										].map(h => (
											<th
												key={h}
												className='px-4 py-3 text-left text-xs font-semibold'
											>
												{h}
											</th>
										))}
									</tr>
								</thead>
								<tbody className='divide-y'>
									{data?.data?.length ? (
										data.data.map((p, i) => (
											<tr key={p._id} className='hover:bg-accent/50'>
												<td className='px-4 py-3 text-xs font-medium text-primary'>
													{i + 1}
												</td>
												<td className='px-4 py-3'>{p.patient.fullname}</td>
												<td className='px-4 py-3 text-xs'>
													{p.analysis_type.name}
												</td>
												<td className='px-4 py-3 text-xs'>
													{p.created_at
														? new Date(p.created_at).toLocaleDateString()
														: '-'}
												</td>
												<td className='px-4 py-3 text-xs'>
													{getLevelBadge(p.level)}
												</td>
												<td className='px-4 py-3 text-xs'>
													{getStatusBadge(p.status)}
												</td>
												<td className='px-4 py-3'>
													<Button
														size='sm'
														onClick={() => openResultModal(p._id)}
														disabled={p.status === 'CANCELLED'}
														className='text-xs h-8'
													>
														{p.status === 'PENDING' ? 'Киритиш' : 'Кўриш'}
													</Button>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan={7} className='text-center py-4 text-sm'>
												Маълумот топилмади
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</Card>
				</div>
			)}

			{/* Mobile Table */}
			{isFetching ? (
				<div className='flex justify-center py-8'>
					<Loader2 className='animate-spin w-6 h-6' />
				</div>
			) : (
				<div className='p-4 sm:p-6 block lg:hidden space-y-4'>
					{data?.data?.length ? (
						data.data.map((p, i) => (
							<Card
								key={p._id}
								className='rounded-2xl shadow-md border border-gray-100 overflow-hidden'
							>
								<div className='p-4 space-y-2'>
									<div className='flex justify-between items-start'>
										<div>
											<h3 className='font-semibold text-base'>
												{p.analysis_type.name}
											</h3>
											<p className='text-xs text-muted-foreground'>
												Бемор:{' '}
												<span className='font-medium'>
													{p.patient.fullname}
												</span>
											</p>
											<p className='text-xs text-muted-foreground'>
												Сана:{' '}
												<span className='font-medium'>
													{new Date(p.created_at).toLocaleDateString()}
												</span>
											</p>
										</div>
										<span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium'>
											#{i + 1}
										</span>
									</div>
									<div className='flex items-center justify-between space-y-1 text-sm'>
										<div className='space-y-1'>
											<div className='flex gap-4'>
												<span className='text-muted-foreground'>Даража:</span>
												{getLevelBadge(p.level)}
											</div>
											<div className='flex gap-4'>
												<span className='text-muted-foreground'>Ҳолат:</span>
												{getStatusBadge(p.status)}
											</div>
										</div>
										<div className='flex justify-end mt-2'>
											<Button
												size='sm'
												className='text-xs py-1 px-2'
												onClick={() => openResultModal(p._id)}
												disabled={p.status === 'CANCELLED'}
											>
												{p.status === 'PENDING' ? 'Киритиш' : 'Кўриш'}
											</Button>
										</div>
									</div>
								</div>
							</Card>
						))
					) : (
						<div className='text-center py-4 text-sm'>Маълумот топилмади</div>
					)}
				</div>
			)}

			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className='w-[95%] h-[85%] sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6'>
					<DialogHeader>
						<DialogTitle>{selectedOrder?.analysis_type.name}</DialogTitle>
						<div className='text-sm text-muted-foreground'>
							{selectedOrder?.patient.fullname}
						</div>
						<DialogDescription>
							Clinic ko'rsatma : {selectedOrder?.clinical_indications}
						</DialogDescription>
					</DialogHeader>

					<div className='mt-4'>
						{isDiagnosticLoading ? (
							<div className='flex justify-center py-8'>
								<Loader2 className='animate-spin w-6 h-6' />
							</div>
						) : (
							<>
								{/* Desktop table */}
								<div className='hidden sm:block overflow-x-auto'>
									<table className='w-full text-sm border'>
										<thead className='bg-muted'>
											<tr>
												<th className='px-2 py-2 text-left'>Тест</th>
												<th className='px-2 py-2 text-left'>Натижа</th>
												<th className='px-2 py-2 text-left'>Меъёр</th>
												<th className='px-2 py-2 text-left'>Бирлик</th>
												<th className='px-2 py-2 text-left'>Байроқ</th>
											</tr>
										</thead>
										<tbody>
											{testParameters.map((param, i) => {
												const flag =
													param.analysis_parameter_value &&
													patientGender &&
													(() => {
														const r = getGenderRange(param, patientGender)
														if (!r) return null
														return calculateFlag(
															param.analysis_parameter_value.toString(),
															{ male: r }
														)
													})()
												return (
													<tr key={param._id}>
														<td className='px-2 py-2'>
															{param.analysis_parameter_type.parameter_name}
														</td>
														<td className='px-2 py-2'>
															<Input
																type={
																	param.analysis_parameter_type.value_type ===
																	'NUMBER'
																		? 'number'
																		: 'text'
																}
																onKeyDown={e => {
																	if (
																		param.analysis_parameter_type.value_type ===
																		'NUMBER'
																	) {
																		if (
																			e.key === ',' ||
																			e.key === 'e' ||
																			e.key === 'E' ||
																			e.key === '+' ||
																			e.key === '-'
																		) {
																			e.preventDefault()
																		}
																	}
																}}
																value={param.analysis_parameter_value ?? ''}
																onChange={e => {
																	let value: string | number = e.target.value
																	if (
																		param.analysis_parameter_type.value_type ===
																		'NUMBER'
																	) {
																		value =
																			e.target.value === ''
																				? ''
																				: Number(e.target.value)
																	}
																	handleResultChange(i, value)
																}}
																className={`w-32 ${
																	showErrors && param.error
																		? 'border-red-500 focus-visible:ring-red-500'
																		: ''
																}`}
															/>
														</td>
														<td className='px-2 py-2'>
															{(() => {
																const r = getGenderRange(param, patientGender)
																if (!r) return '-'

																if (r.value) return r.value // STRING holati
																return `${r.min} - ${r.max}` // NUMBER holati
															})()}
														</td>
														<td className='px-2 py-2'>
															{param.analysis_parameter_type.unit}
														</td>
														<td className='px-2 py-2'>
															{flag && (
																<span className={flag.color}>{flag.icon}</span>
															)}
														</td>
													</tr>
												)
											})}
										</tbody>
									</table>
								</div>

								{/* Mobile cards */}
								<div className='sm:hidden space-y-4'>
									{testParameters.map((param, i) => {
										const flag =
											param.analysis_parameter_value &&
											patientGender &&
											(() => {
												const r = getGenderRange(param, patientGender)
												if (!r) return null
												return calculateFlag(
													param.analysis_parameter_value.toString(),
													{ male: r }
												)
											})()
										return (
											<div
												key={param._id}
												className='bg-white shadow-md rounded-lg p-4 border border-gray-200'
											>
												<div className='flex justify-between items-center mb-2'>
													<h3 className='font-semibold text-gray-800'>
														{param.analysis_parameter_type.parameter_name}
													</h3>
													{flag && (
														<span className={`${flag.color} text-lg`}>
															{flag.icon}
														</span>
													)}
												</div>
												<Input
													type={
														param.analysis_parameter_type.value_type ===
														'NUMBER'
															? 'number'
															: 'text'
													}
													onKeyDown={e => {
														if (
															param.analysis_parameter_type.value_type ===
															'NUMBER'
														) {
															if (
																e.key === ',' ||
																e.key === 'e' ||
																e.key === 'E' ||
																e.key === '+' ||
																e.key === '-'
															) {
																e.preventDefault()
															}
														}
													}}
													value={param.analysis_parameter_value ?? ''}
													onChange={e => {
														let value: string | number = e.target.value
														if (
															param.analysis_parameter_type.value_type ===
															'NUMBER'
														) {
															value =
																e.target.value === ''
																	? ''
																	: Number(e.target.value)
														}
														handleResultChange(i, value)
													}}
													className={`w-32 ${
														showErrors && param.error
															? 'border-red-500 focus-visible:ring-red-500'
															: ''
													}`}
												/>

												<div className='flex justify-between text-sm text-muted-foreground'>
													<span>
														Бирлик: {param.analysis_parameter_type.unit}
													</span>
													<span>
														Меъёр:{' '}
														{(() => {
															const r = getGenderRange(param, patientGender)
															if (!r) return '-'

															if (r.value) return r.value // STRING holati
															return `${r.min} - ${r.max}` // NUMBER holati
														})()}
													</span>
												</div>
											</div>
										)
									})}
								</div>

								{/* Comments & verify */}
								<div className='mt-4'>
									<Label>Изоҳ</Label>
									<Textarea
										value={comments}
										onChange={e => setComments(e.target.value)}
										rows={3}
									/>
								</div>

								<div className='flex items-center gap-2 mt-3'>
									<Checkbox
										id='verify'
										checked={isVerified}
										onCheckedChange={c => setIsVerified(!!c)}
									/>
									<Label htmlFor='verify'>Тасдиқлаш</Label>
								</div>

								<DialogFooter className='mt-4'>
									<Button
										variant='outline'
										onClick={() => setIsModalOpen(false)}
									>
										Бекор қилиш
									</Button>
									<Button
										onClick={handleSubmitResults}
										className='bg-green-600 text-white'
										disabled={isUpdating}
									>
										{diagnosticData?.data?.status === ExamStatus.COMPLETED
											? 'Таҳрирлаш'
											: 'Сақлаш'}
									</Button>
								</DialogFooter>
							</>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default LabResults
