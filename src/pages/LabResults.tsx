import { useState } from 'react'
import {
	ArrowLeft,
	Download,
	TrendingUp,
	FileText,
	CheckCircle,
	Clock,
	AlertCircle,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Toaster } from 'sonner'

interface TestResult {
	orderId: string
	patientName: string
	testType: string
	orderedDate: string
	priority: 'Оддий' | 'Шошилинч' | 'Жуда шошилинч'
	status: 'Кутилмоқда' | 'Тайёр' | 'Тасдиқланган'
}

interface TestParameter {
	name: string
	unit: string
	normalRange: string
	result?: string
}

// Dummy hook replacement for canvas environment
const useNavigate = () => {
	// This function simulates navigation in a browser-like environment
	return (path: string) => console.log(`Navigating to: ${path}`)
}

const LabResults = () => {
	const navigate = useNavigate()
	const [selectedOrder, setSelectedOrder] = useState<TestResult | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isVerified, setIsVerified] = useState(false)
	const [comments, setComments] = useState('')
	const [viewMode, setViewMode] = useState<'table' | 'graph'>('table')
	const [selectedPatient, setSelectedPatient] = useState('all')

	const pendingResults: TestResult[] = [
		{
			orderId: 'LAB-2025-001',
			patientName: 'Алиев Анвар Рашидович',
			testType: 'Умумий қон таҳлили',
			orderedDate: '07.10.2025 09:30',
			priority: 'Оддий',
			status: 'Кутилмоқда',
		},
		{
			orderId: 'LAB-2025-002',
			patientName: 'Каримова Нилуфар Азизовна',
			testType: 'Биохимия қони',
			orderedDate: '07.10.2025 10:15',
			priority: 'Шошилинч',
			status: 'Тайёр',
		},
		{
			orderId: 'LAB-2025-003',
			patientName: 'Усмонов Жахонгир Баходирович',
			testType: 'Умумий сийдик таҳлили',
			orderedDate: '06.10.2025 14:20',
			priority: 'Оддий',
			status: 'Тасдиқланган',
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
				Кутилмоқда: {
					class: 'bg-warning/10 text-warning border-warning/20',
					icon: Clock,
				},
				Тайёр: {
					class: 'bg-success/10 text-success border-success/20',
					icon: CheckCircle,
				},
				Тасдиқланган: {
					class: 'bg-primary/10 text-primary border-primary/20',
					icon: FileText,
				},
			}
		const config = variants[status] || variants['Кутилмоқда']
		const Icon = config.icon
		return (
			<Badge className={`${config.class} border`}>
				<Icon className='w-3 h-3 mr-1' />
				{status}
			</Badge>
		)
	}

	const getPriorityBadge = (priority: string) => {
		const colors: Record<string, string> = {
			Оддий: 'bg-gray-100 text-gray-700',
			Шошилинч: 'bg-warning/10 text-warning border-warning/20 border',
			'Жуда шошилинч': 'bg-danger/10 text-danger border-danger/20 border',
		}
		return (
			<Badge className={colors[priority] || colors['Оддий']}>{priority}</Badge>
		)
	}

	const calculateFlag = (value: string, normalRange: string) => {
		if (!value || !normalRange) return null
		const val = parseFloat(value)
		const [min, max] = normalRange.split('-').map(v => parseFloat(v))
		if (val < min)
			return { icon: '⬇️', color: 'text-blue-600', bg: 'bg-blue-50' }
		if (val > max) return { icon: '⬆️', color: 'text-danger', bg: 'bg-red-50' }
		return { icon: '✓', color: 'text-success', bg: 'bg-green-50' }
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
		// Ensure all parameters are reset/cleared when opening the modal
		setTestParameters(testParameters.map(p => ({ ...p, result: '' })))
	}

	const handleSubmitResults = () => {
		if (!isVerified) {
			toast.error('Илтимос, натижаларни тасдиқланг')
			return
		}

		// Check for critical values
		const hasCritical = testParameters.some(param => {
			if (!param.result) return false
			const flag = calculateFlag(param.result, param.normalRange)
			return flag && flag.icon !== '✓'
		})

		if (hasCritical) {
			toast.warning('Огоҳлантириш: Танқидий қийматлар аниқланди!', {
				description: 'Шифокорга автоматик хабар юборилди',
			})
		}

		toast.success('Натижалар муваффақиятли юборилди', {
			description: 'Шифокорга билдиришнома юборилди',
		})
		setIsModalOpen(false)
	}

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900 font-sans'>
			<Toaster position='top-right' />
			{/* Header - Responsive design added */}
			<header className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm'>
				<div className='container mx-auto px-4 py-3 sm:py-4'>
					<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
						<div className='flex items-center gap-2 sm:gap-4'>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => navigate('/dashboard')}
								className='flex-shrink-0'
							>
								<ArrowLeft className='w-5 h-5' />
							</Button>
							<div>
								<h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white'>
									Таҳлил натижалари
								</h1>
								<p className='text-xs sm:text-sm text-muted-foreground'>
									Лаборатория текширувлари натижалари
								</p>
							</div>
						</div>
						{/* Buttons stack/wrap responsively */}
						<div className='flex items-center gap-2 flex-wrap justify-end sm:justify-start'>
							<Button
								variant='outline'
								onClick={() =>
									setViewMode(viewMode === 'table' ? 'graph' : 'table')
								}
								className='text-sm px-3 py-2 h-auto'
							>
								{viewMode === 'table' ? (
									<TrendingUp className='w-4 h-4 mr-2' />
								) : (
									<FileText className='w-4 h-4 mr-2' />
								)}
								{viewMode === 'table' ? 'График' : 'Жадвал'}
							</Button>
							<Button variant='outline' className='text-sm px-3 py-2 h-auto'>
								<Download className='w-4 h-4 mr-2' />
								PDF
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className='container mx-auto px-4 py-6'>
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

				{/* Pending Results Table / Card View (NO SCROLL) */}
				<Card className='rounded-xl shadow-md'>
					<div className='p-4 sm:p-6'>
						<h2 className='text-xl font-semibold mb-4'>
							Кутилаётган натижалар
						</h2>

						{/* Desktop Table View (md and up) */}
						<div className='hidden md:block border rounded-lg overflow-hidden'>
							<table className='w-full divide-y divide-gray-200'>
								<thead>
									<tr className='bg-gray-50 dark:bg-gray-700'>
										<th className='text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-300'>
											Буюртма №
										</th>
										<th className='text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-300'>
											Бемор
										</th>
										<th className='text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-300'>
											Таҳлил тури
										</th>
										<th className='text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-300'>
											Сана
										</th>
										<th className='text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-300'>
											Устунлик
										</th>
										<th className='text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-300'>
											Ҳолат
										</th>
										<th className='text-left py-3 px-4 font-medium text-sm text-gray-500 dark:text-gray-300'>
											Ҳаракатлар
										</th>
									</tr>
								</thead>
								<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200'>
									{pendingResults.map(result => (
										<tr
											key={result.orderId}
											className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
										>
											<td className='py-3 px-4 font-medium text-sm'>
												{result.orderId}
											</td>
											<td className='py-3 px-4 text-sm'>
												{result.patientName}
											</td>
											<td className='py-3 px-4 text-sm'>{result.testType}</td>
											<td className='py-3 px-4 text-xs text-muted-foreground'>
												{result.orderedDate}
											</td>
											<td className='py-3 px-4'>
												{getPriorityBadge(result.priority)}
											</td>
											<td className='py-3 px-4'>
												{getStatusBadge(result.status)}
											</td>
											<td className='py-3 px-4'>
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
						</div>

						{/* Mobile Card View (below md) */}
						<div className='md:hidden space-y-4'>
							{pendingResults.map(result => (
								<div
									key={result.orderId}
									className='border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm bg-white dark:bg-gray-800'
								>
									<div className='flex justify-between items-start mb-2'>
										<h3 className='font-semibold text-base text-primary dark:text-primary-light'>
											{result.orderId}
										</h3>
										{getPriorityBadge(result.priority)}
									</div>

									<div className='space-y-1 text-sm'>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>Бемор:</span>
											<span className='font-medium text-right'>
												{result.patientName}
											</span>
										</div>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>
												Таҳлил тури:
											</span>
											<span className='font-medium text-right'>
												{result.testType}
											</span>
										</div>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>Сана:</span>
											<span className='text-right'>{result.orderedDate}</span>
										</div>
										<div className='flex justify-between items-center pt-1'>
											<span className='text-muted-foreground'>Ҳолат:</span>
											<div>{getStatusBadge(result.status)}</div>
										</div>
									</div>

									<div className='mt-3 border-t pt-3 flex justify-end'>
										<Button
											size='sm'
											onClick={() => openResultModal(result)}
											disabled={result.status === 'Тасдиқланган'}
											className='text-xs h-8'
										>
											{result.status === 'Кутилмоқда'
												? 'Натижа киритиш'
												: 'Натижани кўриш'}
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				</Card>
			</main>

			{/* Result Entry Modal (No change needed here as table inside modal only requires vertical scroll if content is too long) */}

			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent
					className='
			w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-4xl
			h-[98vh] max-h-[98vh] sm:max-h-[90vh]
			flex flex-col
			rounded-none sm:rounded-xl
		'
				>
					{/* Sticky header */}
					<DialogHeader className='sticky top-0 z-10 bg-background pb-2 border-b'>
						<DialogTitle className='text-lg sm:text-2xl font-bold text-gray-900 truncate'>
							{selectedOrder?.testType}
						</DialogTitle>
						<div className='flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1 text-gray-600'>
							<span>Буюртма: {selectedOrder?.orderId}</span>
							<span className='hidden sm:inline'>•</span>
							<span>Бемор: {selectedOrder?.patientName}</span>
						</div>
					</DialogHeader>

					{/* Scrollable body */}
					<div className='flex-1 overflow-y-auto px-1 sm:px-2 space-y-6 pt-2 pb-6'>
						{/* Table */}
						<div className='border rounded-lg overflow-x-auto shadow-sm'>
							<table className='w-full min-w-[500px] border-collapse'>
								<thead className='bg-gray-100 sticky top-0 z-10 border-b'>
									<tr>
										{['Тест', 'Натижа', 'Бирлик', 'Меъёр', 'Байроқ'].map(
											(t, i) => (
												<th
													key={i}
													className='py-2 px-3 text-left font-semibold text-[11px] sm:text-sm text-gray-700'
												>
													{t}
												</th>
											)
										)}
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200'>
									{testParameters.map((param, index) => {
										const flag = param.result
											? calculateFlag(param.result, param.normalRange)
											: null
										return (
											<tr
												key={index}
												className={`text-[11px] sm:text-sm hover:bg-gray-50 transition-colors ${
													flag ? flag.bg : ''
												}`}
											>
												<td className='py-2 px-3 font-medium text-gray-800'>
													{param.name}
												</td>
												<td className='py-2 px-3'>
													<Input
														type='number'
														step='0.01'
														value={param.result ?? ''}
														onChange={e =>
															handleResultChange(index, e.target.value)
														}
														className='w-full h-8 sm:h-9 text-center text-[11px] sm:text-sm border-gray-300'
														placeholder='0.00'
													/>
												</td>
												<td className='py-2 px-3 text-gray-500'>
													{param.unit}
												</td>
												<td className='py-2 px-3 text-gray-500'>
													{param.normalRange}
												</td>
												<td className='py-2 px-3'>
													{flag && (
														<span
															className={`text-lg sm:text-xl ${flag.color}`}
														>
															{flag.icon}
														</span>
													)}
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>

						{/* Comment */}
						<div>
							<Label className='text-[12px] sm:text-sm text-gray-700'>
								Изоҳ (ихтиёрий)
							</Label>
							<Textarea
								value={comments}
								onChange={e => setComments(e.target.value)}
								placeholder='Қўшимча изоҳлар...'
								rows={2}
								className='mt-1 resize-none text-[12px] sm:text-sm'
							/>
						</div>

						{/* Verify block */}
						<div className='flex items-start sm:items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-200 text-[12px] sm:text-sm'>
							<Checkbox
								id='verify'
								checked={isVerified}
								onCheckedChange={checked => setIsVerified(checked === true)}
							/>
							<label
								htmlFor='verify'
								className='font-medium leading-none cursor-pointer text-gray-700'
							>
								Тасдиқланган - Лаборант: Иброҳимова Нилуфар
							</label>
						</div>
						<DialogFooter className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3 px-2 border-t mt-auto'>
							<Button
								variant='outline'
								onClick={() => setIsModalOpen(false)}
								className='w-full sm:w-auto text-[12px] sm:text-sm text-gray-700 hover:bg-gray-100'
							>
								Бекор қилиш
							</Button>
							<Button
								variant='secondary'
								onClick={() => toast.success('Драфт сақланди')}
								className='w-full sm:w-auto text-[12px] sm:text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
							>
								Драфт сақлаш
							</Button>
							<Button
								onClick={handleSubmitResults}
								className='bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-[12px] sm:text-sm text-white'
								disabled={!isVerified}
							>
								<CheckCircle className='w-4 h-4 mr-2' />
								Юбориш ва хабар бериш
							</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default LabResults
