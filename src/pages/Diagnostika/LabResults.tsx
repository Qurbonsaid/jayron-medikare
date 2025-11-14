// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import {
// 	ArrowLeft,
// 	Download,
// 	TrendingUp,
// 	FileText,
// 	CheckCircle,
// 	Clock,
// 	Trash2,
// 	Edit,
// } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Card } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { Badge } from '@/components/ui/badge'
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogFooter,
// 	DialogTrigger,
// } from '@/components/ui/dialog'
// import { Checkbox } from '@/components/ui/checkbox'
// import { toast } from 'sonner'
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from '@/components/ui/select'

// interface TestResult {
// 	orderId: string
// 	patientName: string
// 	testType: string
// 	orderedDate: string
// 	diagnostika: string
// 	level: 'ODDIY' | 'SHOSHILINCH' | 'JUDA_SHOSHILINCH'
// 	status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
// }

// interface TestParameter {
// 	name: string
// 	unit: string
// 	normalRange: string
// 	result?: string
// }

// const LabResults = () => {
// 	const navigate = useNavigate()
// 	const [selectedOrder, setSelectedOrder] = useState<TestResult | null>(null)
// 	const [isModalOpen, setIsModalOpen] = useState(false)
// 	const [isVerified, setIsVerified] = useState(false)
// 	const [comments, setComments] = useState('')
// 	const [selectedPatient, setSelectedPatient] = useState('all')

// 	// Mock data
// 	const pendingResults: TestResult[] = [
// 		{
// 			orderId: 'LAB-2025-001',
// 			patientName: 'Алиев Анвар Рашидович',
// 			testType: 'Умумий қон таҳлили',
// 			orderedDate: '07.10.2025 09:30',
// 			level: 'ODDIY',
// 			status: 'PENDING',
// 			diagnostika: 'Karonavirus',
// 		},
// 		{
// 			orderId: 'LAB-2025-002',
// 			patientName: 'Каримова Нилуфар Азизовна',
// 			testType: 'Биохимия қони',
// 			orderedDate: '07.10.2025 10:15',
// 			level: 'SHOSHILINCH',
// 			status: 'COMPLETED',
// 			diagnostika: 'Revmatizm',
// 		},
// 		{
// 			orderId: 'LAB-2025-003',
// 			patientName: 'Усмонов Жахонгир Баходирович',
// 			testType: 'Умумий сийдик таҳлили',
// 			orderedDate: '06.10.2025 14:20',
// 			level: 'ODDIY',
// 			status: 'CANCELLED',
// 			diagnostika: 'Animiya',
// 		},
// 	]

// 	const [testParameters, setTestParameters] = useState<TestParameter[]>([
// 		{ name: 'Гемоглобин', unit: 'g/dL', normalRange: '13-17', result: '' },
// 		{ name: 'Эритроцит', unit: '10^12/L', normalRange: '4.0-5.5', result: '' },
// 		{ name: 'Лейкоцит', unit: '10^9/L', normalRange: '4.0-9.0', result: '' },
// 		{ name: 'Тромбоцит', unit: '10^9/L', normalRange: '150-400', result: '' },
// 		{ name: 'СОЭ', unit: 'mm/h', normalRange: '0-15', result: '' },
// 	])

// 	const getStatusBadge = (status: string) => {
// 		const variants: Record<string, { class: string; icon: React.ElementType }> =
// 			{
// 				PENDING: { class: 'bg-yellow-100 text-yellow-700', icon: Clock },
// 				COMPLETED: { class: 'bg-green-100 text-green-700', icon: CheckCircle },
// 				CANCELLED: { class: 'bg-blue-100 text-blue-700', icon: FileText },
// 			}
// 		const config = variants[status] || variants['PENDING']
// 		const Icon = config.icon
// 		return (
// 			<Badge className={`${config.class} border px-2 py-1 text-xs`}>
// 				<Icon className='w-3 h-3 mr-1' />
// 				{status}
// 			</Badge>
// 		)
// 	}

// 	const getlevelBadge = (level: string) => {
// 		const colors: Record<string, string> = {
// 			ODDIY: 'bg-gray-100 text-gray-700',
// 			SHOSHILINCH: 'bg-yellow-100 text-yellow-700',
// 			'JUDA_SHOSHILINCH': 'bg-red-100 text-red-700',
// 		}
// 		return (
// 			<Badge className={`${colors[level]} border px-2 py-1 text-xs`}>
// 				{level}
// 			</Badge>
// 		)
// 	}

// 	const calculateFlag = (value: string, normalRange: string) => {
// 		if (!value || !normalRange) return null
// 		const val = parseFloat(value)
// 		const [min, max] = normalRange.split('-').map(v => parseFloat(v))
// 		if (val < min) return { icon: '⬇️', color: 'text-blue-600' }
// 		if (val > max) return { icon: '⬆️', color: 'text-red-600' }
// 		return { icon: '✓', color: 'text-green-600' }
// 	}

// 	const handleResultChange = (index: number, value: string) => {
// 		const newParams = [...testParameters]
// 		newParams[index].result = value
// 		setTestParameters(newParams)
// 	}

// 	const openResultModal = (order: TestResult) => {
// 		setSelectedOrder(order)
// 		setIsModalOpen(true)
// 		setIsVerified(false)
// 		setComments('')
// 	}

// 	const handleSubmitResults = () => {
// 		if (!isVerified) {
// 			toast.error('Илтимос, натижаларни тасдиқланг')
// 			return
// 		}
// 		toast.success('Натижалар юборилди')
// 		setIsModalOpen(false)
// 	}

// 	return (
// 		<div className='min-h-screen bg-background'>
// 			{/* Header */}
// 			<header className='bg-card border-b sticky top-0 z-10'>
// 				<div className='w-full px-3 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
// 					<div className='flex items-center gap-3'>
// 						<Button
// 							variant='ghost'
// 							size='icon'
// 							onClick={() => navigate('/dashboard')}
// 						>
// 							<ArrowLeft className='w-5 h-5' />
// 						</Button>
// 						<div>
// 							<h1 className='text-lg sm:text-xl font-bold'>
// 								Таҳлил натижалари
// 							</h1>
// 							<p className='text-xs sm:text-sm text-muted-foreground'>
// 								Лаборатория текширувлари натижалари
// 							</p>
// 						</div>
// 					</div>
// 					<div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
// 						<Button
// 							variant='outline'
// 							className='w-full sm:w-auto text-xs sm:text-sm'
// 						>
// 							<TrendingUp className='w-4 h-4 mr-1' /> График
// 						</Button>
// 						<Button
// 							variant='outline'
// 							className='w-full sm:w-auto text-xs sm:text-sm'
// 						>
// 							<Download className='w-4 h-4 mr-1' /> PDF
// 						</Button>
// 					</div>
// 				</div>
// 			</header>

// 			{/* Content */}
// 			<main className='w-full  max-w-full'>
// 				{/* Filters */}
// 				<div className=''>
// 				<Card className='p-4 my-6 sm:p-6 shadow-md rounded-xl'>
// 					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
// 						<div>
// 							<Label className='text-sm'>Бемор танлаш</Label>
// 							<Select
// 								value={selectedPatient}
// 								onValueChange={setSelectedPatient}
// 							>
// 								<SelectTrigger className='mt-1'>
// 									<SelectValue placeholder='Барча беморлар' />
// 								</SelectTrigger>
// 								<SelectContent>
// 									<SelectItem value='all'>Барча беморлар</SelectItem>
// 									<SelectItem value='patient1'>Алиев Анвар</SelectItem>
// 									<SelectItem value='patient2'>Каримова Нилуфар</SelectItem>
// 								</SelectContent>
// 							</Select>
// 						</div>
// 						<div>
// 							<Label className='text-sm'>Бошланғич сана</Label>
// 							<Input type='date' className='mt-1' />
// 						</div>
// 						<div>
// 							<Label className='text-sm'>Тугаш санаси</Label>
// 							<Input type='date' className='mt-1' />
// 						</div>
// 					</div>
// 				</Card>
// 				</div>

// 				{/* Mobile Card View */}
// 				<div className='p-4 sm:p-6 block lg:hidden space-y-4'>
// 					{pendingResults.map((param, index) => (
// 						<div>
// 							<Card
// 								key={param.orderId}
// 								className='rounded-2xl shadow-md border border-gray-100 overflow-hidden'
// 							>
// 								<div className='p-3 space-y-2'>
// 									{/* Header */}
// 									<div className='flex items-start justify-between'>
// 										<div>
// 											<h3 className='font-semibold text-base text-gray-900'>
// 												{param.diagnostika}
// 											</h3>
// 											<p className='text-xs text-muted-foreground'>
// 												Nomi:{' '}
// 												<span className='font-medium'>{param.orderedDate}</span>
// 											</p>
// 										</div>
// 										<span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium'>
// 											#{index + 1}
// 										</span>
// 									</div>

// 									{/* Body info */}
// 									<div className='space-y-2 text-sm'>
// 										<div className='flex  gap-3'>
// 											<span className='text-muted-foreground'>Jinsi:</span>
// 											<span className='font-medium'>{param.patientName}</span>
// 										</div>
// 										<div className='flex  gap-3'>
// 											<span className='text-muted-foreground'>Qiymat:</span>
// 											<span className='font-medium text-blue-600'>
// 												{param.level}
// 											</span>
// 										</div>
// 										<div className='flex  gap-3'>
// 											<span className='text-muted-foreground'>Birligi:</span>
// 											<span className='font-medium'>{param.status}</span>
// 										</div>
// 									</div>
// 								</div>
// 							</Card>
// 						</div>
// 					))}
// 				</div>

// 				{/* Desktop Table View */}
// 				<div className='p-4 sm:p-6'>
// 					<Card className='card-shadow hidden lg:block'>
// 						<div className='overflow-x-auto'>
// 							<table className='w-full'>
// 								<thead className='bg-muted/50'>
// 									<tr>
// 										{[
// 											'ID',
// 											'Бемор',
// 											'Таҳлил тури',
// 											'Диагностика',
// 											'Устунлик',
// 											'Ҳолат',
// 											'Ҳаракат',
// 										].map(i => (
// 											<th
// 												key={i}
// 												className='px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold'
// 											>
// 												{i}
// 											</th>
// 										))}
// 									</tr>
// 								</thead>
// 								<tbody className='divide-y'>
// 									{pendingResults.map((param, index) => (
// 										<tr
// 											key={param.diagnostika}
// 											className='hover:bg-accent/50 transition-smooth'
// 										>
// 											<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-medium text-primary'>
// 												{index + 1}
// 											</td>
// 											<td className='px-4 xl:px-6 py-3 xl:py-4'>
// 												<div className='font-medium text-sm xl:text-base'>
// 													{param.patientName}
// 												</div>
// 											</td>
// 											<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
// 												{param.testType}
// 											</td>
// 											<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
// 												{param.patientName}
// 											</td>
// 											<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
// 											{getlevelBadge(param.level)}
// 											</td>
// 											<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
// 											{getStatusBadge(param.status)}
// 											</td>
// 											<td className='px-4 xl:px-6 py-3 xl:py-4'>
// 											<Button
// 											size='sm'
// 											onClick={() => openResultModal(param)}
// 											disabled={param.status === 'CANCELLED'}
// 											className='text-xs h-8'
// 										>
// 											{param.status === 'PENDING' ? 'Киритиш' : 'Кўриш'}
// 										</Button>
// 											</td>
// 										</tr>
// 									))}
// 								</tbody>
// 							</table>
// 						</div>
// 					</Card>
// 				</div>

// 			</main>

// 			{/* Modal */}
// 			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
// 				<DialogContent
// 					className='
//       w-[95%] h-[85%] sm:max-w-4xl sm:max-h-[90vh]
//       overflow-y-auto rounded-lg p-4 sm:p-6
//     '
// 				>
// 					<DialogHeader>
// 						<DialogTitle>{selectedOrder?.testType}</DialogTitle>
// 						<div className='text-sm text-muted-foreground'>
// 							{selectedOrder?.orderId} • {selectedOrder?.patientName}
// 						</div>
// 					</DialogHeader>

// 					{/* Jadval */}
// 					<div className='mt-4 overflow-x-auto'>
// 						<table className='w-full text-sm border'>
// 							<thead className='bg-muted'>
// 								<tr>
// 									<th className='px-2 py-2 text-left'>Тест</th>
// 									<th className='px-2 py-2 text-left'>Натижа</th>
// 									<th className='px-2 py-2 text-left'>Бирлик</th>
// 									<th className='px-2 py-2 text-left'>Меъёр</th>
// 									<th className='px-2 py-2 text-left'>Байроқ</th>
// 								</tr>
// 							</thead>
// 							<tbody>
// 								{testParameters.map((param, i) => {
// 									const flag = param.result
// 										? calculateFlag(param.result, param.normalRange)
// 										: null
// 									return (
// 										<tr key={i} className='border-b'>
// 											<td className='px-2 py-2'>{param.name}</td>
// 											<td className='px-2 py-2'>
// 												<Input
// 													type='number'
// 													value={param.result}
// 													onChange={e => handleResultChange(i, e.target.value)}
// 													className='w-24'
// 												/>
// 											</td>
// 											<td className='px-2 py-2'>{param.unit}</td>
// 											<td className='px-2 py-2'>{param.normalRange}</td>
// 											<td className='px-2 py-2'>
// 												{flag && (
// 													<span className={flag.color}>{flag.icon}</span>
// 												)}
// 											</td>
// 										</tr>
// 									)
// 								})}
// 							</tbody>
// 						</table>

// 						<div className='mt-4'>
// 							<Label>Изоҳ</Label>
// 							<Textarea
// 								value={comments}
// 								onChange={e => setComments(e.target.value)}
// 								rows={3}
// 							/>
// 						</div>

// 						<div className='flex items-center gap-2 mt-3'>
// 							<Checkbox
// 								id='verify'
// 								checked={isVerified}
// 								onCheckedChange={c => setIsVerified(!!c)}
// 							/>
// 							<Label htmlFor='verify'>Тасдиқлаш</Label>
// 						</div>

// 						<DialogFooter className='mt-4'>
// 							<Button variant='outline' onClick={() => setIsModalOpen(false)}>
// 								Бекор қилиш
// 							</Button>
// 							<Button
// 								onClick={handleSubmitResults}
// 								className='bg-green-600 text-white'
// 							>
// 								Юбориш
// 							</Button>
// 						</DialogFooter>
// 					</div>
// 				</DialogContent>
// 			</Dialog>
// 		</div>
// 	)
// }

// export default LabResults

// import { useState } from 'react'

// import { useGetAllPatientAnalysisQuery } from '@/app/api/patientAnalysisApi/patientAnalysisApi'
// import { useGetDiagnosticByIdQuery } from '@/app/api/diagnostic/diagnosticApi'
// import { Card } from '@/components/ui/card'
// import { Label } from '@/components/ui/label'
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from '@/components/ui/select'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { CheckCircle, Clock, FileText, Loader2, X } from 'lucide-react'
// import {
// 	Dialog,
// 	DialogClose,
// 	DialogContent,
// 	DialogFooter,
// 	DialogHeader,
// 	DialogTitle,
// } from '@/components/ui/dialog'
// import { Textarea } from '@/components/ui/textarea'
// import { Checkbox } from '@/components/ui/checkbox'
// import { toast } from 'sonner'
// import { useGetAllPatientQuery } from '@/app/api/patientApi/patientApi'
// import { useGetAllDiagnosticsQuery } from '@/app/api/diagnostic/diagnosticApi'
// import { PATHS } from '@/app/api/patientAnalysisApi/path'
// import { Input } from '@/components/ui/input'

// // import { ExamStatus, ExamLevel } from '@/app/api/patientAnalysisApi/types'

// enum ExamLevel {
// 	ODDIY = 'ODDIY',
// 	SHOSHILINCH = 'SHOSHILINCH',
// 	JUDA_SHOSHILINCH = 'JUDA_SHOSHILINCH',
// }

// enum ExamStatus {
// 	PENDING = 'PENDING',
// 	COMPLETED = 'COMPLETED',
// 	CANCELLED = 'CANCELLED',
// }

// interface Filters {
// 	page: number
// 	limit: number
// 	patient?: string
// 	status?: string
// 	level?: string
// 	analysis_type?: string
// }

// const LabResults = () => {
// 	const [filters, setFilters] = useState<Filters>({
// 		page: 1,
// 		limit: 10,
// 		patient: '',
// 		status: '',
// 		level: '',
// 		analysis_type: '',
// 	})

// 	// 🔹 Query URL konsolga chiqarish
// 	console.log(
// 		'Query URL:',
// 		`${PATHS.GET_ALL}?${new URLSearchParams({
// 			page: filters.page.toString(),
// 			limit: filters.limit.toString(),
// 			...(filters.patient ? { patient: filters.patient } : {}),
// 			...(filters.status ? { status: filters.status } : {}),
// 			...(filters.level ? { level: filters.level } : {}),
// 			...(filters.analysis_type
// 				? { analysis_type: filters.analysis_type }
// 				: {}),
// 		})}`
// 	)

// 	const { data, isFetching } = useGetAllPatientAnalysisQuery(
// 		{
// 			page: filters.page,
// 			limit: filters.limit,
// 			...(filters.patient ? { patient: filters.patient } : {}),
// 			...(filters.status ? { status: filters.status } : {}),
// 			...(filters.level ? { level: filters.level } : {}),
// 			...(filters.analysis_type
// 				? { analysis_type: filters.analysis_type }
// 				: {}),
// 		},
// 		{ refetchOnMountOrArgChange: true }
// 	)

// 	const { data: patientsData, isFetching: isPatientsLoading } =
// 		useGetAllPatientQuery({
// 			page: 1,
// 			limit: 100,
// 		})

// 	const { data: diagnosticsData, isFetching: isDiagnosticsLoading } =
// 		useGetAllDiagnosticsQuery()

// 	const [isModalOpen, setIsModalOpen] = useState(false)
// 	const [selectedId, setSelectedId] = useState<string | null>(null)
// 	const [isVerified, setIsVerified] = useState(false)
// 	const [comments, setComments] = useState('')

// 	const { data: diagnosticData, isFetching: isDiagnosticLoading } =
// 		useGetDiagnosticByIdQuery(selectedId!, { skip: !selectedId })

// 	const selectedOrder = data?.data.find(item => item._id === selectedId)

// 	const handleChange = (key: keyof Filters, value: string) => {
// 		console.log('Filter change:', key, value)
// 		setFilters(prev => ({
// 			...prev,
// 			[key]: value === 'all' ? undefined : value,
// 		}))
// 	}

// 	const openResultModal = (id: string, analysisId: string) => {
// 		setSelectedId(analysisId)
// 		setIsModalOpen(true)
// 		setIsVerified(false)
// 		setComments('')
// 	}

// 	const handleSubmitResults = () => {
// 		if (!isVerified) {
// 			toast.error('Илтимос, натижаларни тасдиқланг')
// 			return
// 		}
// 		toast.success('Натижалар юборилди')
// 		setIsModalOpen(false)
// 	}

// 	const getStatusBadge = (status: ExamStatus) => {
// 		const variants: Record<
// 			ExamStatus,
// 			{ class: string; icon: React.ElementType; text: string }
// 		> = {
// 			PENDING: {
// 				class: 'bg-yellow-100 text-yellow-700',
// 				icon: Clock,
// 				text: 'Kutilmoqda',
// 			},
// 			COMPLETED: {
// 				class: 'bg-green-100 text-green-700',
// 				icon: CheckCircle,
// 				text: 'Bajarilgan',
// 			},
// 			CANCELLED: {
// 				class: 'bg-blue-100 text-blue-700',
// 				icon: FileText,
// 				text: 'Bekor qilingan',
// 			},
// 		}
// 		const Icon = variants[status].icon
// 		return (
// 			<Badge className={`${variants[status].class} border px-2 py-1 text-xs`}>
// 				<Icon className='w-3 h-3 mr-1' />
// 				{variants[status].text}
// 			</Badge>
// 		)
// 	}

// 	const getLevelBadge = (level: ExamLevel) => {
// 		const colors: Record<ExamLevel, string> = {
// 			ODDIY: 'bg-gray-100 text-gray-700',
// 			SHOSHILINCH: 'bg-yellow-100 text-yellow-700',
// 			JUDA_SHOSHILINCH: 'bg-red-100 text-red-700',
// 		}
// 		const text: Record<ExamLevel, string> = {
// 			ODDIY: 'Oddiy',
// 			SHOSHILINCH: 'Shoshilinch',
// 			JUDA_SHOSHILINCH: 'Juda_shoshilinch',
// 		}
// 		return (
// 			<Badge className={`${colors[level]} border px-2 py-1 text-xs`}>
// 				{text[level]}
// 			</Badge>
// 		)
// 	}

// 		const calculateFlag = (value: string, normalRange: string) => {
// 		if (!value || !normalRange) return null
// 		const val = parseFloat(value)
// 		const [min, max] = normalRange.split('-').map(v => parseFloat(v))
// 		if (val < min) return { icon: '⬇️', color: 'text-blue-600' }
// 		if (val > max) return { icon: '⬆️', color: 'text-red-600' }
// 		return { icon: '✓', color: 'text-green-600' }
// 	}

// 		const handleResultChange = (index: number, value: string) => {
// 		const newParams = [...diagnosticData]
// 		newParams[index].result = value
// 		setTestParameters(newParams)
// 	}

// 	return (
// 		<div className='min-h-screen bg-background flex flex-col'>
// 			{/* 🔹 Filterlar */}
// 			<div className='p-4'>
// 				<Card className='p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
// 					{/* 1️⃣ Bemor select */}
// 					<div>
// 						<Label className='text-sm'>Бемор</Label>

// 						<Select
// 							value={filters.patient || 'all'}
// 							onValueChange={v => handleChange('patient', v)}
// 						>
// 							<SelectTrigger>
// 								<SelectValue placeholder='Барча беморлар' />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectItem value='all'>Барча</SelectItem>
// 								{patientsData?.data?.map(patient => (
// 									<SelectItem key={patient._id} value={patient._id}>
// 										{patient.fullname}
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 					</div>

// 					{/* 2️⃣ Status */}
// 					<div>
// 						<Label className='text-sm'>Ҳолат</Label>
// 						<Select
// 							value={filters.status || 'all'}
// 							onValueChange={v => handleChange('status', v)}
// 						>
// 							<SelectTrigger>
// 								<SelectValue placeholder='Барча ҳолатлар' />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectItem value='all'>Барча</SelectItem>
// 								<SelectItem value={ExamStatus.PENDING}>Kutilmoqda</SelectItem>
// 								<SelectItem value={ExamStatus.COMPLETED}>Bajarilgan</SelectItem>
// 								<SelectItem value={ExamStatus.CANCELLED}>
// 									Bekor qilingan
// 								</SelectItem>
// 							</SelectContent>
// 						</Select>
// 					</div>

// 					{/* 3️⃣ Level */}
// 					<div>
// 						<Label className='text-sm'>Даража</Label>
// 						<Select
// 							value={filters.level || 'all'}
// 							onValueChange={v => handleChange('level', v)}
// 						>
// 							<SelectTrigger>
// 								<SelectValue placeholder='Барча даражалар' />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectItem value='all'>Барча</SelectItem>
// 								<SelectItem value={ExamLevel.ODDIY}>Oddiy</SelectItem>
// 								<SelectItem value={ExamLevel.SHOSHILINCH}>
// 									Shoshilinch
// 								</SelectItem>
// 								<SelectItem value={ExamLevel.JUDA_SHOSHILINCH}>
// 									Juda shoshilinch
// 								</SelectItem>
// 							</SelectContent>
// 						</Select>
// 					</div>

// 					{/* 4️⃣ Tahlil select */}
// 					<div>
// 						<Label className='text-sm'>Таҳлил</Label>
// 						<Select
// 							value={filters.analysis_type || 'all'}
// 							onValueChange={v => handleChange('analysis_type', v)}
// 						>
// 							<SelectTrigger>
// 								<SelectValue placeholder='Барча таҳлиллар' />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectItem value='all'>Барча</SelectItem>
// 								{diagnosticsData?.data?.map(analysis => (
// 									<SelectItem key={analysis._id} value={analysis._id}>
// 										{analysis.name}
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 					</div>
// 				</Card>
// 			</div>

// 			{/* 🔹 Jadval */}
// 			{isFetching ? (
// 				<div className='flex justify-center py-8'>
// 					<Loader2 className='animate-spin w-6 h-6' />
// 				</div>
// 			) : (
// 				<div className='p-4 sm:p-6'>
// 					<Card className='card-shadow hidden lg:block'>
// 						<div className='overflow-x-auto'>
// 							<table className='w-full'>
// 								<thead className='bg-muted/50'>
// 									<tr>
// 										{[
// 											'ID',
// 											'Бемор',
// 											'Таҳлил тури',
// 											'caнa',
// 											'Устунлик',
// 											'Ҳолат',
// 											'Ҳаракат',
// 										].map(i => (
// 											<th
// 												key={i}
// 												className='px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold'
// 											>
// 												{i}
// 											</th>
// 										))}
// 									</tr>
// 								</thead>
// 								<tbody className='divide-y'>
// 									{data?.data?.length ? (
// 										data.data.map((param, i) => (
// 											<tr
// 												key={param._id}
// 												className='hover:bg-accent/50 transition-smooth'
// 											>
// 												<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-medium text-primary'>
// 													{i + 1}
// 												</td>
// 												<td className='px-4 xl:px-6 py-3 xl:py-4'>
// 													<div className='font-medium text-sm xl:text-base'>
// 														{param.patient.fullname}
// 													</div>
// 												</td>
// 												<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
// 													{param.analysis_type.name}
// 												</td>
// 												<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
// 													{param.created_at
// 														? new Date(param.created_at).toLocaleDateString()
// 														: '-'}
// 												</td>
// 												<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
// 													{getLevelBadge(param.level)}
// 												</td>
// 												<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
// 													{getStatusBadge(param.status)}
// 												</td>
// 												<td className='px-4 xl:px-6 py-3 xl:py-4'>
// 													<Button
// 														size='sm'
// 														onClick={() => {
// 															setIsModalOpen(true)
// 															openResultModal(
// 																param._id,
// 																param.analysis_type._id
// 															)
// 														}}
// 														disabled={param.status === 'CANCELLED'}
// 														className='text-xs h-8'
// 													>
// 														{param.status === 'PENDING' ? 'Киритиш' : 'Кўриш'}
// 													</Button>
// 												</td>
// 											</tr>
// 										))
// 									) : (
// 										<tr>
// 											<td colSpan={7} className='text-center py-4 text-sm'>
// 												Маълумот топилмади
// 											</td>
// 										</tr>
// 									)}
// 								</tbody>
// 							</table>
// 						</div>
// 					</Card>
// 				</div>
// 			)}

// 			{/* 🔹 Jadval - Mobile */}
// 			{isFetching ? (
// 				<div className='flex justify-center py-8'>
// 					<Loader2 className='animate-spin w-6 h-6' />
// 				</div>
// 			) : (
// 				<div className='p-4 sm:p-6 block lg:hidden space-y-4'>
// 					{data?.data?.length ? (
// 						data.data.map((param, i) => (
// 							<Card
// 								key={param._id}
// 								className='rounded-2xl shadow-md border border-gray-100 overflow-hidden'
// 							>
// 								<div className='p-4 space-y-2'>
// 									{/* Header */}
// 									<div className='flex justify-between items-start'>
// 										<div>
// 											<h3 className='font-semibold text-base'>
// 												{param.analysis_type.name}
// 											</h3>
// 											<p className='text-xs text-muted-foreground'>
// 												Бемор:{' '}
// 												<span className='font-medium'>
// 													{param.patient.fullname}
// 												</span>
// 											</p>
// 											<p className='text-xs text-muted-foreground'>
// 												Сана:{' '}
// 												<span className='font-medium'>
// 													{new Date(param.created_at).toLocaleDateString()}
// 												</span>
// 											</p>
// 										</div>
// 										<span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium'>
// 											#{i + 1}
// 										</span>
// 									</div>

// 									{/* Body */}
// 									<div className='flex items-center justify-between space-y-1 text-sm'>
// 										<div className='space-y-1'>
// 											<div className='flex gap-4'>
// 												<span className='text-muted-foreground'>Даража:</span>
// 												{getLevelBadge(param.level)}
// 											</div>
// 											<div className='flex gap-4'>
// 												<span className='text-muted-foreground'>Ҳолат:</span>
// 												{getStatusBadge(param.status)}
// 											</div>
// 										</div>
// 										<div className='flex justify-end mt-2'>
// 											<Button
// 												size='sm'
// 												onClick={() =>
// 													openResultModal(param._id, param.analysis_type._id)
// 												}
// 												disabled={param.status === 'CANCELLED'}
// 											>
// 												{param.status === 'PENDING' ? 'Киритиш' : 'Кўриш'}
// 											</Button>
// 										</div>
// 									</div>
// 								</div>
// 							</Card>
// 						))
// 					) : (
// 						<div className='text-center py-4 text-sm'>Маълумот топилмади</div>
// 					)}
// 				</div>
// 			)}

// 			{/* 🔹 Modal */}
// 			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
// 				<DialogContent className=' rounded-lg flex flex-col'>
// 					{/* X (close) tugmasi */}
// 					<DialogClose asChild>
// 						<button className='absolute right-4 top-4 text-muted-foreground hover:text-foreground'>
// 							<X className='w-5 h-5' />
// 						</button>
// 					</DialogClose>

// 					{/* Header */}
// 					<div className='sticky top-0 bg-background z-10 border-b p-4 sm:p-6'>
// 						<DialogHeader>
// 							<DialogTitle>{selectedOrder?.analysis_type.name}</DialogTitle>
// 							<div className='text-sm text-muted-foreground'>
// 								{selectedOrder?.patient.fullname}
// 							</div>
// 						</DialogHeader>
// 					</div>

// 					{/* Kontent */}
// 					<div className='overflow-y-auto p-4 sm:p-6'>
// 						{isDiagnosticLoading ? (
// 							<div className='flex justify-center py-8'>
// 								<Loader2 className='animate-spin w-6 h-6' />
// 							</div>
// 						) : (
// 							<>
// 								<table className='w-full text-sm border'>
// 									<thead className='bg-muted'>
// 										<tr>
// 											<th className='px-2 py-2 text-left'>Параметр</th>
// 											<th className='px-2 py-2 text-left'>Бирлик</th>
// 											<th className='px-2 py-2 text-left'>Меъёр</th>
// 										</tr>
// 									</thead>
// 									<tbody>
// 										{diagnosticData?.data.analysis_parameters?.map(param => (
// 											<tr key={param._id} className='border-b'>
// 												<td className='px-2 py-2'>{param.parameter_name}</td>
// 												<td className='px-2 py-2'>{param.unit}</td>
// 												<td className='px-2 py-2'>
// 													{param.normal_range?.general.value ||
// 														`${param.normal_range?.general.min}-${param.normal_range?.general.max}`}
// 												</td>
// 											</tr>
// 										))}
// 									</tbody>
// 								</table>

// 								<div className='mt-4'>
// 									<Label>Изоҳ</Label>
// 									<Textarea
// 										value={comments}
// 										onChange={e => setComments(e.target.value)}
// 										rows={3}
// 									/>
// 								</div>

// 								<div className='flex items-center gap-2 mt-3'>
// 									<Checkbox
// 										id='verify'
// 										checked={isVerified}
// 										onCheckedChange={c => setIsVerified(!!c)}
// 									/>
// 									<Label htmlFor='verify'>Тасдиқлаш</Label>
// 								</div>

// 								<DialogFooter className='mt-4'>
// 									<Button
// 										variant='outline'
// 										onClick={() => setIsModalOpen(false)}
// 									>
// 										Бекор қилиш
// 									</Button>
// 									<Button
// 										onClick={handleSubmitResults}
// 										className='bg-green-600 text-white'
// 									>
// 										Юбориш
// 									</Button>
// 								</DialogFooter>
// 							</>
// 						)}
// 					</div>
// 				</DialogContent>
// 			</Dialog>

// 			{/* Modal */}
// 			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
// 				<DialogContent
// 					className='
//       w-[95%] h-[85%] sm:max-w-4xl sm:max-h-[90vh]
//       overflow-y-auto rounded-lg p-4 sm:p-6
//     '
// 				>
// 					<DialogHeader>
// 						<DialogTitle>{selectedOrder?.analysis_type.name}</DialogTitle>
// 						<div className='text-sm text-muted-foreground'>
// 							{selectedOrder?.patient.fullname}
// 						</div>
// 					</DialogHeader>

// 					{/* Jadval */}
// 					<div className='mt-4 overflow-x-auto'>
// 						{isDiagnosticLoading ? (
// 							<div className='flex justify-center py-8'>
// 								<Loader2 className='animate-spin w-6 h-6' />
// 							</div>
// 						) : (
// 							<>
// 								<table className='w-full text-sm border'>
// 									<thead className='bg-muted'>
// 										<tr>
// 											<th className='px-2 py-2 text-left'>Тест</th>
// 											<th className='px-2 py-2 text-left'>Натижа</th>
// 											<th className='px-2 py-2 text-left'>Бирлик</th>
// 											<th className='px-2 py-2 text-left'>Меъёр</th>
// 											<th className='px-2 py-2 text-left'>Байроқ</th>
// 										</tr>
// 									</thead>
// 									<tbody>
// 										{diagnosticData?.data.analysis_parameters?.map(param => {
// 											const flag = param.
// 												? calculateFlag(param.result, param.normalRange)
// 												: null
// 											return (
// 												<tr key={i} className='border-b'>
// 													<td className='px-2 py-2'>{param.name}</td>
// 													<td className='px-2 py-2'>
// 														<Input
// 															type='number'
// 															value={param.result}
// 															onChange={e =>
// 																handleResultChange(i, e.target.value)
// 															}
// 															className='w-24'
// 														/>
// 													</td>
// 													<td className='px-2 py-2'>{param.unit}</td>
// 													<td className='px-2 py-2'>
// 														{param.normal_range.male.max}-
// 														{param.normal_range.female.max}
// 													</td>
// 													<td className='px-2 py-2'>
// 														{flag && (
// 															<span className={flag.color}>{flag.icon}</span>
// 														)}
// 													</td>
// 												</tr>
// 											)
// 										})}
// 									</tbody>
// 								</table>

// 								<div className='mt-4'>
// 									<Label>Изоҳ</Label>
// 									<Textarea
// 										value={comments}
// 										onChange={e => setComments(e.target.value)}
// 										rows={3}
// 									/>
// 								</div>

// 								<div className='flex items-center gap-2 mt-3'>
// 									<Checkbox
// 										id='verify'
// 										checked={isVerified}
// 										onCheckedChange={c => setIsVerified(!!c)}
// 									/>
// 									<Label htmlFor='verify'>Тасдиқлаш</Label>
// 								</div>

// 								<DialogFooter className='mt-4'>
// 									<Button
// 										variant='outline'
// 										onClick={() => setIsModalOpen(false)}
// 									>
// 										Бекор қилиш
// 									</Button>
// 									<Button
// 										onClick={handleSubmitResults}
// 										className='bg-green-600 text-white'
// 									>
// 										Юбориш
// 									</Button>
// 								</DialogFooter>
// 							</>
// 						)}
// 					</div>
// 				</DialogContent>
// 			</Dialog>
// 		</div>
// 	)
// }

// export default LabResults

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

	const { data: patientsData } = useGetAllPatientQuery({ page: 1, limit: 100 })
	const { data: diagnosticsData } = useGetAllDiagnosticsQuery()

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
		if (!isVerified) {
			toast.error('Илтимос, натижаларни тасдиқланг')
			return
		}
		if (!selectedOrderId) {
			toast.error('Таҳлил танланмади')
			return
		}
		console.log('Submitting results for Order ID :', selectedOrderId)

		try {
			// map front params to backend body.results
			const resultsPayload = testParameters.map(p => ({
				analysis_parameter_type: p.analysis_parameter_type._id, // parametr turi idsi
				analysis_parameter_value:
					// agar empty string bo'lsa null yoki '' jo'natishni backenda kutganiga qarab o'zgartiring
					p.analysis_parameter_value === '' ||
					p.analysis_parameter_value === undefined
						? '' // yoki null
						: p.analysis_parameter_value,
			}))

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

			console.log('Selected Order ID:', selectedOrderId)

			// yuborish
			const res = await updatePatientAnalysis({
				id: selectedOrderId,
				body,
			}).unwrap()

			if (res?.success) {
				toast.success('Натижалар муваффақиятли сақланди')
				// yangilashlar: qayta olish (refetch) va modalni yopish
				setIsModalOpen(false)
				// agar getAllPatientAnalysisQuery ning refetch kerak bo'lsa: RTK Query hooklarda refetchOnMountOrArgChange ishlamasa, qo'shimcha invalidation bilan qilgan bo'lsak, cache avtomatik yangilanadi.
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

	const handleResultChange = (index: number, value: string) => {
		const newParams = [...testParameters]
		newParams[index].analysis_parameter_value = value
		setTestParameters(newParams)
	}

	useEffect(() => {
		if (diagnosticData?.data) {
			const cleared = diagnosticData.data.results.map(r => ({
				...r,
				analysis_parameter_value: '', // modal ochilganda hammasi bo'sh
			}))
			setTestParameters(cleared)
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
			{isFetching ? (
				<div className='flex justify-center py-8'>
					<Loader2 className='animate-spin w-6 h-6' />
				</div>
			) : (
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

			{/* Modal */}
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className='w-[95%] h-[85%] sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6'>
					{/* <DialogClose asChild>
            <button className='absolute right-4 top-4 text-muted-foreground hover:text-foreground'>
              <X className='w-5 h-5' />
            </button>
          </DialogClose> */}

					<DialogHeader>
						<DialogTitle>{selectedOrder?.analysis_type.name}</DialogTitle>
						<div className='text-sm text-muted-foreground'>
							{selectedOrder?.patient.fullname}
						</div>
					</DialogHeader>

					<div className='mt-4 overflow-x-auto'>
						{isDiagnosticLoading ? (
							<div className='flex justify-center py-8'>
								<Loader2 className='animate-spin w-6 h-6' />
							</div>
						) : (
							<>
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
												patientGender && // <-- SHU YERDA TEKSHIR
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
															// placeholder={() => {
															//   const r = getGenderRange(param, patientGender)
															//   if (!r) return ''
															//   if (r.value) return r.value
															//   return `${r.min} - ${r.max}`
															// }}
															className='w-32'
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
										{isUpdating ? 'Юборилмоқда...' : 'Юбориш'}
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
