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
// 	priority: 'Оддий' | 'Шошилинч' | 'Жуда шошилинч'
// 	status: 'Кутилмоқда' | 'Тайёр' | 'Тасдиқланган'
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
// 			priority: 'Оддий',
// 			status: 'Кутилмоқда',
// 			diagnostika: 'Karonavirus',
// 		},
// 		{
// 			orderId: 'LAB-2025-002',
// 			patientName: 'Каримова Нилуфар Азизовна',
// 			testType: 'Биохимия қони',
// 			orderedDate: '07.10.2025 10:15',
// 			priority: 'Шошилинч',
// 			status: 'Тайёр',
// 			diagnostika: 'Revmatizm',
// 		},
// 		{
// 			orderId: 'LAB-2025-003',
// 			patientName: 'Усмонов Жахонгир Баходирович',
// 			testType: 'Умумий сийдик таҳлили',
// 			orderedDate: '06.10.2025 14:20',
// 			priority: 'Оддий',
// 			status: 'Тасдиқланган',
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
// 				Кутилмоқда: { class: 'bg-yellow-100 text-yellow-700', icon: Clock },
// 				Тайёр: { class: 'bg-green-100 text-green-700', icon: CheckCircle },
// 				Тасдиқланган: { class: 'bg-blue-100 text-blue-700', icon: FileText },
// 			}
// 		const config = variants[status] || variants['Кутилмоқда']
// 		const Icon = config.icon
// 		return (
// 			<Badge className={`${config.class} border px-2 py-1 text-xs`}>
// 				<Icon className='w-3 h-3 mr-1' />
// 				{status}
// 			</Badge>
// 		)
// 	}

// 	const getPriorityBadge = (priority: string) => {
// 		const colors: Record<string, string> = {
// 			Оддий: 'bg-gray-100 text-gray-700',
// 			Шошилинч: 'bg-yellow-100 text-yellow-700',
// 			'Жуда шошилинч': 'bg-red-100 text-red-700',
// 		}
// 		return (
// 			<Badge className={`${colors[priority]} border px-2 py-1 text-xs`}>
// 				{priority}
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
// 												{param.priority}
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
// 											{getPriorityBadge(param.priority)}
// 											</td>
// 											<td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
// 											{getStatusBadge(param.status)}
// 											</td>
// 											<td className='px-4 xl:px-6 py-3 xl:py-4'>
// 											<Button
// 											size='sm'
// 											onClick={() => openResultModal(param)}
// 											disabled={param.status === 'Тасдиқланган'}
// 											className='text-xs h-8'
// 										>
// 											{param.status === 'Кутилмоқда' ? 'Киритиш' : 'Кўриш'}
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

import { useState } from 'react'
import { useGetAllPatientAnalysisQuery } from '@/app/api/patientAnalysisApi/patientAnalysisApi'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'

interface Filters {
	page: number
	limit: number
	patient_id: string
	status: string
	level: string
	analysis_id: string
}

interface Patient {
	_id: string
	fullname: string
}

interface AnalysisType {
	_id: string
	name: string
}

interface PatientAnalysis {
	_id: string
	patient: Patient
	analysis_type: AnalysisType
	level: string
	status: string
}

interface AnalysisResponse {
	data: PatientAnalysis[]
	total: number
	page: number
	limit: number
}

const LabResults = () => {
	const [filters, setFilters] = useState<Filters>({
		page: 1,
		limit: 10,
		patient_id: '',
		status: '',
		level: '',
		analysis_id: '',
	})

	const { data, isFetching, isError, error, isSuccess } =
		useGetAllPatientAnalysisQuery(filters)

	const handleChange = (key: keyof Filters, value: string) => {
		setFilters(prev => ({ ...prev, [key]: value }))
	}

	return (
		<div className='p-6'>
			<h1 className='text-lg font-bold mb-4'>Таҳлил натижалари</h1>

			{/* Filters */}
			<Card className='p-4 mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6'>
				<div>
					<Label className='text-sm'>Бемор</Label>
					<Input
						placeholder='Patient ID киритинг'
						value={filters.patient_id}
						onChange={e => handleChange('patient_id', e.target.value)}
					/>
				</div>

				<div>
					<Label className='text-sm'>Ҳолат</Label>
					<Select
						value={filters.status || 'all'}
						onValueChange={v => handleChange('status', v === 'all' ? '' : v)}
					>
						<SelectTrigger>
							<SelectValue placeholder='Барча ҳолатлар' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Барча</SelectItem>
							<SelectItem value='PENDING'>Кутилмоқда</SelectItem>
							<SelectItem value='READY'>Тайёр</SelectItem>
							<SelectItem value='APPROVED'>Тасдиқланган</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label className='text-sm'>Даража</Label>
					<Select
						value={filters.level || 'all'}
						onValueChange={v => handleChange('level', v === 'all' ? '' : v)}
					>
						<SelectTrigger>
							<SelectValue placeholder='Барча' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Барча</SelectItem>
							<SelectItem value='ODDIY'>Oddiy</SelectItem>
							<SelectItem value='SHOSHILINCH'>Shoshilinch</SelectItem>
							<SelectItem value='JUDA_SHOSHILINCH'>Jуда шошилinch</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label className='text-sm'>Таҳлил ID</Label>
					<Input
						placeholder='Analysis ID киритинг'
						value={filters.analysis_id}
						onChange={e => handleChange('analysis_id', e.target.value)}
					/>
				</div>
			</Card>

			{/* Table */}
			<Card className='p-4'>
				{isFetching ? (
					<div className='flex justify-center py-8'>
						<Loader2 className='animate-spin w-6 h-6' />
					</div>
				) : (
					<table className='w-full border-collapse'>
						<thead className='bg-muted/50'>
							<tr>
								<th className='p-2 text-left text-sm'>#</th>
								<th className='p-2 text-left text-sm'>Бемор</th>
								<th className='p-2 text-left text-sm'>Таҳлил номи</th>
								<th className='p-2 text-left text-sm'>Даража</th>
								<th className='p-2 text-left text-sm'>Ҳолат</th>
							</tr>
						</thead>
						<tbody>
							{data?.data?.length ? (
								data.data.map((item, i) => (
									<tr key={item._id} className='border-b hover:bg-accent/50'>
										<td className='p-2 text-sm'>{i + 1}</td>
										<td className='p-2 text-sm'>{item.patient.fullname}</td>
										<td className='p-2 text-sm'>{item.analysis_type.name}</td>
										<td className='p-2 text-sm'>{item.level}</td>
										<td className='p-2 text-sm'>{item.status}</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={5} className='text-center py-4 text-sm'>
										Маълумот топилмади
									</td>
								</tr>
							)}
						</tbody>
					</table>
				)}
			</Card>
		</div>
	)
}

export default LabResults
