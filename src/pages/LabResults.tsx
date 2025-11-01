import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	ArrowLeft,
	Download,
	TrendingUp,
	FileText,
	CheckCircle,
	Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface TestResult {
	orderId: string
	patientName: string
	testType: string
	orderedDate: string
	diagnostika: string
	priority: 'Оддий' | 'Шошилинч' | 'Жуда шошилинч'
	status: 'Кутилмоқда' | 'Тайёр' | 'Тасдиқланган'
}

interface TestParameter {
	name: string
	unit: string
	normalRange: string
	result?: string
}

const LabResults = () => {
	const navigate = useNavigate()
	const [selectedOrder, setSelectedOrder] = useState<TestResult | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isVerified, setIsVerified] = useState(false)
	const [comments, setComments] = useState('')
	const [selectedPatient, setSelectedPatient] = useState('all')

	// Mock data
	const pendingResults: TestResult[] = [
		{
			orderId: 'LAB-2025-001',
			patientName: 'Алиев Анвар Рашидович',
			testType: 'Умумий қон таҳлили',
			orderedDate: '07.10.2025 09:30',
			priority: 'Оддий',
			status: 'Кутилмоқда',
			diagnostika: 'Karonavirus',
		},
		{
			orderId: 'LAB-2025-002',
			patientName: 'Каримова Нилуфар Азизовна',
			testType: 'Биохимия қони',
			orderedDate: '07.10.2025 10:15',
			priority: 'Шошилинч',
			status: 'Тайёр',
			diagnostika: 'Revmatizm',
		},
		{
			orderId: 'LAB-2025-003',
			patientName: 'Усмонов Жахонгир Баходирович',
			testType: 'Умумий сийдик таҳлили',
			orderedDate: '06.10.2025 14:20',
			priority: 'Оддий',
			status: 'Тасдиқланган',
			diagnostika: 'Animiya',
		},
	]

	const [testParameters, setTestParameters] = useState<TestParameter[]>([
		{ name: 'Гемоглобин', unit: 'g/dL', normalRange: '13-17', result: '' },
		{ name: 'Эритроцит', unit: '10^12/L', normalRange: '4.0-5.5', result: '' },
		{ name: 'Лейкоцит', unit: '10^9/L', normalRange: '4.0-9.0', result: '' },
		{ name: 'Тромбоцит', unit: '10^9/L', normalRange: '150-400', result: '' },
		{ name: 'СОЭ', unit: 'mm/h', normalRange: '0-15', result: '' },
	])

	const getStatusBadge = (status: string) => {
		const variants: Record<string, { class: string; icon: React.ElementType }> =
			{
				Кутилмоқда: { class: 'bg-yellow-100 text-yellow-700', icon: Clock },
				Тайёр: { class: 'bg-green-100 text-green-700', icon: CheckCircle },
				Тасдиқланган: { class: 'bg-blue-100 text-blue-700', icon: FileText },
			}
		const config = variants[status] || variants['Кутилмоқда']
		const Icon = config.icon
		return (
			<Badge className={`${config.class} border px-2 py-1 text-xs`}>
				<Icon className='w-3 h-3 mr-1' />
				{status}
			</Badge>
		)
	}

	const getPriorityBadge = (priority: string) => {
		const colors: Record<string, string> = {
			Оддий: 'bg-gray-100 text-gray-700',
			Шошилинч: 'bg-yellow-100 text-yellow-700',
			'Жуда шошилинч': 'bg-red-100 text-red-700',
		}
		return (
			<Badge className={`${colors[priority]} border px-2 py-1 text-xs`}>
				{priority}
			</Badge>
		)
	}

	const calculateFlag = (value: string, normalRange: string) => {
		if (!value || !normalRange) return null
		const val = parseFloat(value)
		const [min, max] = normalRange.split('-').map(v => parseFloat(v))
		if (val < min) return { icon: '⬇️', color: 'text-blue-600' }
		if (val > max) return { icon: '⬆️', color: 'text-red-600' }
		return { icon: '✓', color: 'text-green-600' }
	}

	const handleResultChange = (index: number, value: string) => {
		const newParams = [...testParameters]
		newParams[index].result = value
		setTestParameters(newParams)
	}

	const openResultModal = (order: TestResult) => {
		setSelectedOrder(order)
		setIsModalOpen(true)
		setIsVerified(false)
		setComments('')
	}

	const handleSubmitResults = () => {
		if (!isVerified) {
			toast.error('Илтимос, натижаларни тасдиқланг')
			return
		}
		toast.success('Натижалар юборилди')
		setIsModalOpen(false)
	}

	return (
		<div className='min-h-screen bg-background'>
			{/* Header */}
			<header className='bg-card border-b sticky top-0 z-10'>
				<div className='w-full px-3 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
					<div className='flex items-center gap-3'>
						<Button
							variant='ghost'
							size='icon'
							onClick={() => navigate('/dashboard')}
						>
							<ArrowLeft className='w-5 h-5' />
						</Button>
						<div>
							<h1 className='text-lg sm:text-xl font-bold'>
								Таҳлил натижалари
							</h1>
							<p className='text-xs sm:text-sm text-muted-foreground'>
								Лаборатория текширувлари натижалари
							</p>
						</div>
					</div>
					<div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
						<Button
							variant='outline'
							className='w-full sm:w-auto text-xs sm:text-sm'
						>
							<TrendingUp className='w-4 h-4 mr-1' /> График
						</Button>
						<Button
							variant='outline'
							className='w-full sm:w-auto text-xs sm:text-sm'
						>
							<Download className='w-4 h-4 mr-1' /> PDF
						</Button>
					</div>
				</div>
			</header>

			{/* Content */}
			<main className='w-full px-3 sm:px-4 py-4 sm:py-6 max-w-full'>
				{/* Filters */}
				<Card className='p-4 mb-6 shadow-md rounded-xl'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div>
							<Label className='text-sm'>Бемор танлаш</Label>
							<Select
								value={selectedPatient}
								onValueChange={setSelectedPatient}
							>
								<SelectTrigger className='mt-1'>
									<SelectValue placeholder='Барча беморлар' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>Барча беморлар</SelectItem>
									<SelectItem value='patient1'>Алиев Анвар</SelectItem>
									<SelectItem value='patient2'>Каримова Нилуфар</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label className='text-sm'>Бошланғич сана</Label>
							<Input type='date' className='mt-1' />
						</div>
						<div>
							<Label className='text-sm'>Тугаш санаси</Label>
							<Input type='date' className='mt-1' />
						</div>
					</div>
				</Card>
				{/* Mobile Cards */}
				<div className='block lg:hidden space-y-3'>
					{pendingResults.map(result => (
						<Card key={result.orderId} className='p-4 shadow-sm'>
							<div className='flex justify-between items-start mb-2'>
								<span className='text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded'>
									{result.orderId}
								</span>
								{getStatusBadge(result.status)}
							</div>
							<h3 className='font-semibold text-base'>{result.patientName}</h3>
							<p className='text-sm text-muted-foreground mb-1'>
								{result.testType}
							</p>
							<p className='text-xs text-muted-foreground mb-1'>
								{result.diagnostika}
							</p>
							<div className='flex justify-between items-center text-xs mb-3'>
								<span>{result.orderedDate}</span>
								{getPriorityBadge(result.priority)}
							</div>
							<Button
								size='sm'
								className='w-full'
								onClick={() => openResultModal(result)}
								disabled={result.status === 'Тасдиқланган'}
							>
								{result.status === 'Кутилмоқда' ? 'Киритиш' : 'Кўриш'}
							</Button>
						</Card>
					))}
				</div>

				{/* Desktop Table */}
				<Card className='hidden lg:block w-full max-w-full'>
					<table className='w-full table-fixed'>
						<thead className='bg-muted/50'>
							<tr>
								<th className='px-3 py-3 text-left text-xs font-semibold'>№</th>
								<th className='px-3 py-3 text-left text-xs font-semibold'>
									Бемор
								</th>
								<th className='px-3 py-3 text-left text-xs font-semibold'>
									Таҳлил тури
								</th>
								<th className='px-3 py-3 text-left text-xs font-semibold'>
									Сана
								</th>
								<th className='px-3 py-3 text-left text-xs font-semibold'>
									Диагностика
								</th>
								<th className='px-3 py-3 text-left text-xs font-semibold'>
									Устунлик
								</th>
								<th className='px-3 py-3 text-left text-xs font-semibold'>
									Ҳолат
								</th>
								<th className='px-3 py-3 text-left text-xs font-semibold'>
									Ҳаракат
								</th>
							</tr>
						</thead>
						<tbody>
							{pendingResults.map(result => (
								<tr key={result.orderId} className='border-b'>
									<td className='px-3 py-3'>{result.orderId}</td>
									<td className='px-3 py-3'>{result.patientName}</td>
									<td className='px-3 py-3'>{result.testType}</td>
									<td className='px-3 py-3'>{result.orderedDate}</td>
									<td className='px-3 py-3'>{result.diagnostika}</td>
									<td className='px-3 py-3'>
										{getPriorityBadge(result.priority)}
									</td>
									<td className='px-3 py-3'>{getStatusBadge(result.status)}</td>
									<td className='py-3 px-3'>
										<Button
											size='sm'
											onClick={() => openResultModal(result)}
											disabled={result.status === 'Тасдиқланган'}
											className='text-xs h-8'
										>
											{result.status === 'Кутилмоқда' ? 'Киритиш' : 'Кўриш'}
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</Card>
			</main>

			{/* Modal */}
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent
					className='
      w-[95%] h-[85%] sm:max-w-4xl sm:max-h-[90vh] 
      overflow-y-auto rounded-lg p-4 sm:p-6
    '
				>
					<DialogHeader>
						<DialogTitle>{selectedOrder?.testType}</DialogTitle>
						<div className='text-sm text-muted-foreground'>
							{selectedOrder?.orderId} • {selectedOrder?.patientName}
						</div>
					</DialogHeader>

					{/* Jadval */}
					<div className='mt-4 overflow-x-auto'>
						<table className='w-full text-sm border'>
							<thead className='bg-muted'>
								<tr>
									<th className='px-2 py-2 text-left'>Тест</th>
									<th className='px-2 py-2 text-left'>Натижа</th>
									<th className='px-2 py-2 text-left'>Бирлик</th>
									<th className='px-2 py-2 text-left'>Меъёр</th>
									<th className='px-2 py-2 text-left'>Байроқ</th>
								</tr>
							</thead>
							<tbody>
								{testParameters.map((param, i) => {
									const flag = param.result
										? calculateFlag(param.result, param.normalRange)
										: null
									return (
										<tr key={i} className='border-b'>
											<td className='px-2 py-2'>{param.name}</td>
											<td className='px-2 py-2'>
												<Input
													type='number'
													value={param.result}
													onChange={e => handleResultChange(i, e.target.value)}
													className='w-24'
												/>
											</td>
											<td className='px-2 py-2'>{param.unit}</td>
											<td className='px-2 py-2'>{param.normalRange}</td>
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
							<Button variant='outline' onClick={() => setIsModalOpen(false)}>
								Бекор қилиш
							</Button>
							<Button
								onClick={handleSubmitResults}
								className='bg-green-600 text-white'
							>
								Юбориш
							</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default LabResults
