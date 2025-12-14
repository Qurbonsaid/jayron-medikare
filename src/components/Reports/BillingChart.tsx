import { REPORT_DATE_FILTER } from '@/app/api/report/types'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { DollarSign } from 'lucide-react'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import { DateRangeFilter } from './DateRangeFilter'

interface BillingChartProps {
	data: {
		_id: {
			year: number
			month: number
			day: number
		}
		paidAmount: number
		byType: {
			XIZMAT: {
				total: number
				paid: number
				debt: number
			}
			TASVIR: {
				total: number
				paid: number
				debt: number
			}
			KORIK: {
				total: number
				paid: number
				debt: number
			}
			TAHLIL: {
				total: number
				paid: number
				debt: number
			}
			XONA: {
				total: number
				paid: number
				debt: number
			}
		}
		totalAmount: number
		debtAmount: number
	}[]
	isLoading: boolean
	interval: REPORT_DATE_FILTER
	onIntervalChange: (interval: REPORT_DATE_FILTER) => void
}

export const BillingChart = ({
	data,
	isLoading,
	interval,
	onIntervalChange,
}: BillingChartProps) => {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('uz-UZ').format(value) + ' сўм'
	}

	const formatDate = (item: BillingChartProps['data'][0]) => {
		const { year, month, day } = item._id
		return `${day}.${month}.${year}`
	}

	// Sort data by date (oldest to newest)
	const sortedData = [...data].sort((a, b) => {
		const aYear = a._id.year
		const aMonth = a._id.month
		const aDay = a._id.day
		const bYear = b._id.year
		const bMonth = b._id.month
		const bDay = b._id.day
		return (
			new Date(aYear, aMonth - 1, aDay).getTime() -
			new Date(bYear, bMonth - 1, bDay).getTime()
		)
	})

	const chartData = sortedData.map(item => ({
		name: formatDate(item),
		Жами: item.totalAmount,
		Тўланған: item.paidAmount,
		Қарз: item.debtAmount,
		'Хизмат (жами)': item.byType.XIZMAT.total,
		'Хизмат (тўланган)': item.byType.XIZMAT.paid,
		'Хизмат (қарз)': item.byType.XIZMAT.debt,
		'Тасвир (жами)': item.byType.TASVIR.total,
		'Тасвир (тўланган)': item.byType.TASVIR.paid,
		'Тасвир (қарз)': item.byType.TASVIR.debt,
		'Кўрик (жами)': item.byType.KORIK.total,
		'Кўрик (тўланган)': item.byType.KORIK.paid,
		'Кўрик (қарз)': item.byType.KORIK.debt,
		'Таҳлил (жами)': item.byType.TAHLIL.total,
		'Таҳлил (тўланган)': item.byType.TAHLIL.paid,
		'Таҳлил (қарз)': item.byType.TAHLIL.debt,
		'Хона (жами)': item.byType.XONA.total,
		'Хона (тўланган)': item.byType.XONA.paid,
		'Хона (қарз)': item.byType.XONA.debt,
	}))

	if (isLoading) {
		return (
			<Card className='p-6 flex items-center justify-center h-[400px]'>
				<LoadingSpinner size='lg' />
			</Card>
		)
	}

	return (
		<Card className='p-4 sm:p-6'>
			<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
				<h3 className='text-base sm:text-lg font-semibold flex items-center gap-2'>
					<DollarSign className='w-5 h-5 text-green-600' />
					Молиявий ҳисобот
				</h3>
				<div className='w-full sm:w-48'>
					<DateRangeFilter value={interval} onChange={onIntervalChange} />
				</div>
			</div>
			<ResponsiveContainer width='100%' height={400}>
				<BarChart data={chartData}>
					<CartesianGrid strokeDasharray='3 3' />
					<XAxis dataKey='name' />
					<YAxis />
					<Tooltip formatter={value => formatCurrency(value as number)} />
					<Legend wrapperStyle={{ fontSize: '12px' }} />
					<Bar dataKey='Жами' fill='#3b82f6' />
					<Bar dataKey='Тўланған' fill='#10b981' />
					<Bar dataKey='Қарз' fill='#ef4444' />
					{/* <Bar dataKey='Хизмат (жами)' fill='#8b5cf6' />
					<Bar dataKey='Хизмат (тўланған)' fill='#22c55e' />
					<Bar dataKey='Хизмат (қарз)' fill='#f87171' />
					<Bar dataKey='Тасвир (жами)' fill='#06b6d4' />
					<Bar dataKey='Тасвир (тўланған)' fill='#84cc16' />
					<Bar dataKey='Тасвир (қарз)' fill='#fb923c' />
					<Bar dataKey='Кўрик (жами)' fill='#ec4899' />
					<Bar dataKey='Кўрик (тўланған)' fill='#14b8a6' />
					<Bar dataKey='Кўрик (қарз)' fill='#f59e0b' />
					<Bar dataKey='Таҳлил (жами)' fill='#6366f1' />
					<Bar dataKey='Таҳлил (тўланган)' fill='#a3e635' />
					<Bar dataKey='Таҳлил (қарз)' fill='#fbbf24' />
					<Bar dataKey='Хона (жами)' fill='#14b8a6' />
					<Bar dataKey='Хона (тўланған)' fill='#4ade80' />
					<Bar dataKey='Хона (қарз)' fill='#fb7185' /> */}
				</BarChart>
			</ResponsiveContainer>
		</Card>
	)
}
