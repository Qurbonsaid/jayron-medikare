import { REPORT_DATE_FILTER } from '@/app/api/report/types'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { DollarSign } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'
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
import { DateRangePicker } from './DateRangePicker'

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
	const { t } = useTranslation('reports')
	const [dateRange, setDateRange] = useState<DateRange | undefined>()

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('uz-UZ').format(value) + ' ' + t('currency')
	}

	const formatCompactCurrency = (value: number) => {
		return new Intl.NumberFormat('uz-UZ', {
			notation: 'compact',
			compactDisplay: 'short',
		}).format(value)
	}

	const formatDate = (item: BillingChartProps['data'][0]) => {
		const { year, month, day } = item._id
		return `${day}.${month}.${year}`
	}

	// Filter data by date range
	const filteredData = useMemo(() => {
		if (!dateRange?.from) return data

		return data.filter(item => {
			const itemDate = new Date(item._id.year, item._id.month - 1, item._id.day)
			const from = dateRange.from!
			const to = dateRange.to || dateRange.from!

			return itemDate >= from && itemDate <= to
		})
	}, [data, dateRange])

	// Calculate totals by service type
	const serviceTypeTotals = useMemo(
		() => ({
			XIZMAT: {
				total: filteredData.reduce(
					(sum, item) => sum + item.byType.XIZMAT.total,
					0
				),
				paid: filteredData.reduce(
					(sum, item) => sum + item.byType.XIZMAT.paid,
					0
				),
				debt: filteredData.reduce(
					(sum, item) => sum + item.byType.XIZMAT.debt,
					0
				),
			},
			TASVIR: {
				total: filteredData.reduce(
					(sum, item) => sum + item.byType.TASVIR.total,
					0
				),
				paid: filteredData.reduce(
					(sum, item) => sum + item.byType.TASVIR.paid,
					0
				),
				debt: filteredData.reduce(
					(sum, item) => sum + item.byType.TASVIR.debt,
					0
				),
			},
			KORIK: {
				total: filteredData.reduce(
					(sum, item) => sum + item.byType.KORIK.total,
					0
				),
				paid: filteredData.reduce(
					(sum, item) => sum + item.byType.KORIK.paid,
					0
				),
				debt: filteredData.reduce(
					(sum, item) => sum + item.byType.KORIK.debt,
					0
				),
			},
			TAHLIL: {
				total: filteredData.reduce(
					(sum, item) => sum + item.byType.TAHLIL.total,
					0
				),
				paid: filteredData.reduce(
					(sum, item) => sum + item.byType.TAHLIL.paid,
					0
				),
				debt: filteredData.reduce(
					(sum, item) => sum + item.byType.TAHLIL.debt,
					0
				),
			},
			XONA: {
				total: filteredData.reduce(
					(sum, item) => sum + item.byType.XONA.total,
					0
				),
				paid: filteredData.reduce(
					(sum, item) => sum + item.byType.XONA.paid,
					0
				),
				debt: filteredData.reduce(
					(sum, item) => sum + item.byType.XONA.debt,
					0
				),
			},
		}),
		[filteredData]
	)

	// Sort data by date (oldest to newest)
	const sortedData = [...filteredData].sort((a, b) => {
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
		[t('total')]: item.totalAmount,
		[t('paid')]: item.paidAmount,
		[t('debt')]: item.debtAmount,
	}))

	if (isLoading) {
		return (
			<Card className='p-6 flex items-center justify-center h-[400px]'>
				<LoadingSpinner size='lg' />
			</Card>
		)
	}

	return (
		<div className='space-y-6'>
			{/* Header with DateRangePicker */}
			<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
				<h3 className='text-lg font-semibold flex items-center gap-2'>
					<DollarSign className='w-5 h-5 text-green-600' />
					{t('financialReport')}
				</h3>
				<div className='w-full sm:w-[320px]'>
					<DateRangePicker
						dateRange={dateRange}
						onDateRangeChange={setDateRange}
					/>
				</div>
			</div>

			{/* Date Range Info */}
			{dateRange?.from && (
				<p className='text-sm text-muted-foreground'>
					{dateRange.to
						? `${t('selectedPeriod')}: ${new Date(dateRange.from).toLocaleDateString(
								'uz-UZ'
						  )} - ${new Date(dateRange.to).toLocaleDateString('uz-UZ')}`
						: `${t('selectedDate')}: ${new Date(dateRange.from).toLocaleDateString(
								'uz-UZ'
						  )}`}
				</p>
			)}

			{/* Service Type Cards */}
			<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
				{/* XIZMAT Card */}
				<Card className='p-4 flex flex-col items-center text-center'>
					<h3 className='text-xs font-medium text-muted-foreground mb-3'>
						{t('service')}
					</h3>
					<div className='mb-3'>
						{/* <p className='text-sm text-muted-foreground mb-1'>Жами миқдор</p> */}
						<p className='text-3xl font-bold text-purple-600'>
							{formatCompactCurrency(serviceTypeTotals.XIZMAT.total)}
						</p>
					</div>
					<div className='w-full space-y-2 border-t pt-3'>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>{t('paid')}:</span>
							<span className='font-semibold text-green-600'>
								{formatCompactCurrency(serviceTypeTotals.XIZMAT.paid)}
							</span>
						</div>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>{t('debt')}:</span>
							<span className='font-semibold text-red-600'>
								{formatCompactCurrency(serviceTypeTotals.XIZMAT.debt)}
							</span>
						</div>
					</div>
				</Card>

				{/* TASVIR Card */}
				<Card className='p-4 flex flex-col items-center text-center'>
					<h3 className='text-xs font-medium text-muted-foreground mb-3'>
						{t('imaging')}
					</h3>
					<div className='mb-3'>
						{/* <p className='text-sm text-muted-foreground mb-1'>Жами миқдор</p> */}
						<p className='text-3xl font-bold text-cyan-600'>
							{formatCompactCurrency(serviceTypeTotals.TASVIR.total)}
						</p>
					</div>
					<div className='w-full space-y-2 border-t pt-3'>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>{t('paid')}:</span>
							<span className='font-semibold text-green-600'>
								{formatCompactCurrency(serviceTypeTotals.TASVIR.paid)}
							</span>
						</div>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>{t('debt')}:</span>
							<span className='font-semibold text-red-600'>
								{formatCompactCurrency(serviceTypeTotals.TASVIR.debt)}
							</span>
						</div>
					</div>
				</Card>

				{/* KORIK Card */}
				<Card className='p-4 flex flex-col items-center text-center'>
					<h3 className='text-xs font-medium text-muted-foreground mb-3'>
						{t('examination')}
					</h3>
					<div className='mb-3'>
						{/* <p className='text-sm text-muted-foreground mb-1'>Жами миқдор</p> */}
						<p className='text-3xl font-bold text-pink-600'>
							{formatCompactCurrency(serviceTypeTotals.KORIK.total)}
						</p>
					</div>
					<div className='w-full space-y-2 border-t pt-3'>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>{t('paid')}:</span>
							<span className='font-semibold text-green-600'>
								{formatCompactCurrency(serviceTypeTotals.KORIK.paid)}
							</span>
						</div>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>{t('debt')}:</span>
							<span className='font-semibold text-red-600'>
								{formatCompactCurrency(serviceTypeTotals.KORIK.debt)}
							</span>
						</div>
					</div>
				</Card>

				{/* TAHLIL Card */}
				<Card className='p-4 flex flex-col items-center text-center'>
					<h3 className='text-xs font-medium text-muted-foreground mb-3'>
						{t('analysis')}
					</h3>
					<div className='mb-3'>
						{/* <p className='text-sm text-muted-foreground mb-1'>Жами миқдор</p> */}
						<p className='text-3xl font-bold text-indigo-600'>
							{formatCompactCurrency(serviceTypeTotals.TAHLIL.total)}
						</p>
					</div>
					<div className='w-full space-y-2 border-t pt-3'>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>{t('paid')}:</span>
							<span className='font-semibold text-green-600'>
								{formatCompactCurrency(serviceTypeTotals.TAHLIL.paid)}
							</span>
						</div>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>{t('debt')}:</span>
							<span className='font-semibold text-red-600'>
								{formatCompactCurrency(serviceTypeTotals.TAHLIL.debt)}
							</span>
						</div>
					</div>
				</Card>

				{/* XONA Card */}
				<Card className='p-4 flex flex-col items-center text-center'>
					<h3 className='text-xs font-medium text-muted-foreground mb-3'>
						{t('room')}
					</h3>
					<div className='mb-3'>
						{/* <p className='text-sm text-muted-foreground mb-1'>Жами миқдор</p> */}
						<p className='text-3xl font-bold text-teal-600'>
							{formatCompactCurrency(serviceTypeTotals.XONA.total)}
						</p>
					</div>
					<div className='w-full space-y-2 border-t pt-3'>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>{t('paid')}:</span>
							<span className='font-semibold text-green-600'>
								{formatCompactCurrency(serviceTypeTotals.XONA.paid)}
							</span>
						</div>
						<div className='flex justify-between text-xs'>
							<span className='text-muted-foreground'>{t('debt')}:</span>
							<span className='font-semibold text-red-600'>
								{formatCompactCurrency(serviceTypeTotals.XONA.debt)}
							</span>
						</div>
					</div>
				</Card>
			</div>

			{/* Chart */}
			<Card className='p-4 sm:p-6'>
				<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
					<h3 className='text-base sm:text-lg font-semibold flex items-center gap-2'>
						<DollarSign className='w-5 h-5 text-green-600' />
						{t('generalChart')}
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
						<Bar dataKey={t('total')} fill='#3b82f6' />
						<Bar dataKey={t('paid')} fill='#10b981' />
						<Bar dataKey={t('debt')} fill='#ef4444' />
					</BarChart>
				</ResponsiveContainer>
			</Card>
		</div>
	)
}
