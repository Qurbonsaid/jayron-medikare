import { useCreatePatientAnalysisMutation } from '@/app/api/patientAnalysisApi/patientAnalysisApi'
import {
	useGetAllPatientQuery,
	useGetPatientByIdQuery,
} from '@/app/api/patientApi/patientApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import { Printer, Save, Search, Send, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { OnePatientRes } from '@/app/api/patientApi/types'
import { useGetAllDiagnosticsQuery } from '@/app/api/diagnostic/diagnosticApi'
import { CreateReq } from '@/app/api/patientAnalysisApi/types'

interface Test {
	id: string
	name: string
	code: string
	selected: boolean
}
enum ExamLevel {
	ODDIY = 'ODDIY',
	SHOSHILINCH = 'SHOSHILINCH',
	JUDA_SHOSHILINCH = 'JUDA_SHOSHILINCH',
}

const LabOrder = () => {
	const { t } = useTranslation('diagnostics')
	const navigate = useNavigate()
	const location = useLocation()
	const [clinicalIndications, setClinicalIndications] = useState('')
	type Patient = OnePatientRes['data']
	const [patient, setPatient] = useState<Patient | null>(null)
	const [selectedPatientId, setSelectedPatientId] = useState<string>('')
	const [open, setOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [showErrors, setShowErrors] = useState(false)

	const { data: getAllAnalysis } = useGetAllDiagnosticsQuery()

	// 🔹 API ulanishi
	const [createPatientAnalysis, { isLoading: isCreating }] =
		useCreatePatientAnalysisMutation()
	const handleRequest = useHandleRequest()

	const patientIdFromState = location.state?.patientId
	const { data: patientsData } = useGetAllPatientQuery({ page: 1, limit: 100 , is_diagnosis:true })
	const { data: patientData } = useGetPatientByIdQuery(selectedPatientId, {
		skip: !selectedPatientId,
	})

	const patients = patientsData?.data || []

	useEffect(() => {
		if (patientIdFromState && !selectedPatientId) {
			setSelectedPatientId(patientIdFromState)
			navigate(location.pathname, { replace: true, state: {} })
		}
	}, [patientIdFromState, selectedPatientId, navigate, location.pathname])

	useEffect(() => {
		if (patientData?.data && selectedPatientId) {
			setPatient(patientData.data)
		}
	}, [patientData, selectedPatientId])

	const selectPatient = (patientId: string) => {
		setSelectedPatientId(patientId)
		setOpen(false)
	}

	const clearPatient = () => {
		setPatient(null)
		setSelectedPatientId('')
		setSearchQuery('')
		setShowErrors(false)
		setOpen(true)
	}

	const filteredPatients = patients.filter(p => {
		const query = searchQuery.toLowerCase().trim()
		if (!query) return true
		return (
			p.fullname.toLowerCase().includes(query) ||
			p.patient_id.toLowerCase().includes(query) ||
			p.phone.includes(query)
		)
	})

	const [priority, setPriority] = useState<ExamLevel>(ExamLevel.ODDIY)
	const [tests, setTests] = useState<Test[]>([])

	const selectedTests = tests.filter(t => t.selected)

	useEffect(() => {
		if (getAllAnalysis?.data) {
			const mappedTests: Test[] = getAllAnalysis.data.map(test => ({
				id: test._id,
				name: test.name,
				code: test.code,
				selected: false,
			}))
			setTests(mappedTests)
		}
	}, [getAllAnalysis?.data])

	const toggleTest = (id: string) => {
		setTests(prev =>
			prev.map(test =>
				test.id === id ? { ...test, selected: !test.selected } : test
			)
		)
	}

	const handleSave = async () => {
		setShowErrors(true)

		if (!selectedPatientId) {
			toast.error(t('pleaseSelectPatient'))
			return
		}
		if (!selectedTests.length) {
			toast.error(t('pleaseSelectAtLeastOneTest'))
			return
		}
		if (!clinicalIndications.trim()) {
			toast.error(t('pleaseEnterClinicalIndication'))
			return
		}

		await handleRequest({
			request: async () => {
				const reqBody: CreateReq = {
					analysis: selectedTests.map(t => t.id),
					patient: selectedPatientId,
					level: priority,
					clinical_indications: clinicalIndications,
					comment: '',
				}
				return await createPatientAnalysis(reqBody).unwrap()
			},
			onSuccess: () => {
				toast.success(t('analysisCreatedSuccess'))
				setTests(prev => prev.map(t => ({ ...t, selected: false })))
				setClinicalIndications('')
				setPriority(ExamLevel.ODDIY)
				setShowErrors(false)
				setPatient(null)
				setSelectedPatientId('')
				navigate('/lab-results')
			},
		 onError: (err) => {
        toast.error(err?.data?.error?.msg);
      },
		})
	}

	function formatDateAndAge(dob: string) {
		const birthDate = new Date(dob)
		const day = String(birthDate.getDate()).padStart(2, '0')
		const month = String(birthDate.getMonth() + 1).padStart(2, '0')
		const year = birthDate.getFullYear()
		const today = new Date()
		let age = today.getFullYear() - year
		const m = today.getMonth() - birthDate.getMonth()
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--
		}
		return `${day}.${month}.${year} (${age} ${t('yearsOld')})`
	}

	return (
		<div className='min-h-screen bg-background'>
			<main className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-5xl'>
				{/* Patient Search/Selection */}
				{!patient ? (
					<Card className='card-shadow mb-4 sm:mb-6'>
						<div className='p-4 sm:p-6'>
							<div className='flex items-center gap-3 mb-4'>
								<User className='w-5 h-5 sm:w-6 sm:h-6 text-primary' />
								<h3 className='text-base sm:text-lg font-bold'>
									{t('selectPatient')}
								</h3>
							</div>
							<Popover open={open} onOpenChange={setOpen}>
								<PopoverTrigger asChild>
									<Button
										variant='outline'
										role='combobox'
										aria-expanded={open}
										className='w-full justify-between h-10 sm:h-12 text-sm sm:text-base'
									>
										<span className='flex items-center gap-2'>
											<Search className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
											<span className='truncate'>{t('searchPatient')}</span>
										</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className='w-[calc(100vw-2rem)] sm:w-[600px] md:w-[700px] lg:w-[910px] p-0'
									align='start'
									side='bottom'
								>
									<Command shouldFilter={false}>
										<CommandInput
											placeholder={t('searchByNameIdOrPhone')}
											value={searchQuery}
											onValueChange={setSearchQuery}
											className='text-sm sm:text-base'
										/>
										<CommandList>
											<CommandEmpty className='py-6 text-sm sm:text-base'>
												{t('patientNotFound')}
											</CommandEmpty>
											<CommandGroup>
												{filteredPatients.map(p => (
													<CommandItem
														key={p._id}
														value={p._id}
														onSelect={() => selectPatient(p._id)}
														className='py-3'
													>
														<div className='flex flex-col w-full'>
															<span className='font-medium text-sm sm:text-base'>
																{p.fullname}
															</span>
															<span className='text-xs sm:text-sm text-muted-foreground'>
																ID: {p.patient_id} • {p.phone}
															</span>
														</div>
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
					</Card>
				) : (
					<>
						{/* Patient Banner */}
						{/* Header */}
						<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6'>
							<div>
								<h1 className='text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2'>
									{t('labOrder')}
								</h1>
								<p className='text-xs sm:text-sm md:text-base text-muted-foreground mt-1'>
									{t('createNewLabOrder')}
								</p>
							</div>
							<div className='flex flex-wrap gap-2'>
								<Button variant='outline' className='w-full sm:w-auto'>
									<Printer className='mr-2 h-4 w-4' />
									{t('print')}
								</Button>
								<Button className='w-full sm:w-auto'>
									<Send className='mr-2 h-4 w-4' />
									{t('send')}
								</Button>
							</div>
						</div>
						{/* Patient Info */}
						<Card className='mb-6'>
							<CardHeader>
								<CardTitle className='text-xl md:text-2xl font-bold'>
									{t('patientInfo')}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5'>
									<div>
										<Label className='font-normal'>{t('patientName')}</Label>
										<p className='font-medium'>{patient.fullname}</p>
									</div>
									<div>
										<Label className='font-normal'>{t('birthDate')}</Label>
										<p className='font-medium'>
											{formatDateAndAge(patient.date_of_birth)}
										</p>
									</div>
									<div>
										<Label className='font-normal'>ID</Label>
										<p className='font-medium'>{patient.patient_id}</p>
									</div>
									<div>
										<Label className='font-normal'>{t('phone')}</Label>
										<p className='font-medium'>{patient.phone}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</>
				)}

				{/* SOAP Form - Only show when patient is selected */}
				{patient && (
					<>
						<div className='space-y-4 sm:space-y-6'>
							{/* Test Selection */}
							<Card className='mb-6'>
								<CardHeader>
									<CardTitle className='text-xl md:text-2xl font-bold'>
										{t('selectTestTypes')}
									</CardTitle>
								</CardHeader>
								<CardContent>
									{/* <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
										{tests.map(test => (
											<div
												key={test.id}
												className='flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors'
											>
												<Checkbox
													id={test.id}
													checked={test.selected}
													onCheckedChange={() => toggleTest(test.id)}
												/>
												<Label
													htmlFor={test.id}
													className='flex-1 cursor-pointer text-sm'
												>
													{test.name}
													<Badge variant='secondary' className='ml-2 text-xs'>
														{test.code}
													</Badge>
												</Label>
											</div>
										))}
									</div> */}
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
										{tests.map(test => (
											<div
												key={test.id}
												className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
													showErrors && !selectedTests.length
														? 'border-red-500'
														: 'hover:bg-accent/50'
												}`}
											>
												<Checkbox
													id={test.id}
													checked={test.selected}
													onCheckedChange={() => toggleTest(test.id)}
												/>
												<Label
													htmlFor={test.id}
													className='flex-1 cursor-pointer text-sm'
												>
													{test.name}
													<Badge variant='secondary' className='ml-2 text-xs'>
														{test.code}
													</Badge>
												</Label>
											</div>
										))}
									</div>

									{selectedTests.length > 0 && (
										<div className='mt-4 p-3 bg-muted rounded-lg'>
											<p className='font-semibold text-sm'>
												{t('selectedTests')}: {selectedTests.length}
											</p>
											<div className='flex flex-wrap gap-2 mt-2'>
												{selectedTests.map(test => (
													<Badge
														key={test.id}
														variant='default'
														className='text-xs'
													>
														{test.name}
													</Badge>
												))}
											</div>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Priority */}
							<Card className='mb-6'>
								<CardHeader>
									<CardTitle className='text-xl md:text-2xl font-bold'>
										{t('priorityLevel')}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<RadioGroup
										value={priority}
										onValueChange={val => {
											const map: Record<string, ExamLevel> = {
												ODDIY: ExamLevel.ODDIY,
												SHOSHILINCH: ExamLevel.SHOSHILINCH,
												JUDA_SHOSHILINCH: ExamLevel.JUDA_SHOSHILINCH,
											}
											setPriority(map[val])
										}}
									>
										{[
											{
												value: 'ODDIY',
												label: t('normal'),
												desc: t('result24to48hours'),
												badge: t('normal'),
												badgeClass: 'bg-gray-200 text-black',
											},
											{
												value: 'SHOSHILINCH',
												label: t('urgent'),
												desc: t('result6to12hours'),
												badge: t('urgent'),
												badgeClass: 'bg-orange-500 text-white',
											},
											{
												value: 'JUDA_SHOSHILINCH',
												label: t('veryUrgent'),
												desc: t('result1to2hours'),
												badge: t('veryUrgent'),
												badgeClass: 'bg-red-600 text-white',
											},
										].map(item => (
											<div
												key={item.value}
												className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border mb-3'
											>
												<div className='flex items-center gap-3'>
													<RadioGroupItem value={item.value} id={item.value} />
													<Label
														htmlFor={item.value}
														className='cursor-pointer text-sm'
													>
														<span className='font-semibold'>{item.label}</span>
														<p className='text-xs text-muted-foreground'>
															{item.desc}
														</p>
													</Label>
												</div>
												<Badge className={`mt-2 sm:mt-0 ${item.badgeClass}`}>
													{item.badge}
												</Badge>
											</div>
										))}
									</RadioGroup>
								</CardContent>
							</Card>

							{/* Clinical Indication */}
							<Card className='mb-6'>
								<CardHeader>
									<CardTitle className='text-xl md:text-2xl font-bold'>
										{t('clinicalIndication')}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Label>{t('testReasonAndClinicalCondition')}</Label>
									<Textarea
										rows={5}
										className={`mt-2 w-full ${
											showErrors && !clinicalIndications.trim()
												? 'border-red-500'
												: ''
										}`}
											placeholder={t('exampleClinicalIndication')}
										value={clinicalIndications}
										onChange={e => setClinicalIndications(e.target.value)}
									/>
								</CardContent>
							</Card>
						</div>

						{/* Action Buttons */}
						<div className='mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center'>
							<Button
								variant='outline'
								size='lg'
								onClick={clearPatient}
								className='w-full sm:w-auto text-sm sm:text-base'
								disabled={isCreating}
							>
								<X className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
								{t('cancel')}
							</Button>
							<Button
								size='lg'
								className='gradient-success w-full sm:w-auto text-sm sm:text-base'
								onClick={handleSave}
								disabled={isCreating}
							>
								<Save className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
								{isCreating ? t('saving') : t('save')}
							</Button>
						</div>
					</>
				)}
			</main>
		</div>
	)
}

export default LabOrder
