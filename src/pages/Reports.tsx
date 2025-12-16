import {
	useGetAllAnalysisQuery,
	useGetAllBillingsQuery,
	useGetAllDoctorsQuery,
	useGetAllExaminationsQuery,
	useGetAllPatientsQuery,
	useGetAllRoomsQuery,
	useGetAllUsersQuery,
	useGetDiagnosisQuery,
} from '@/app/api/report/report'
import CantRead from '@/components/common/CantRead'
import { AnalysisChart } from '@/components/Reports/AnalysisChart'
import { BillingChart } from '@/components/Reports/BillingChart'
import { DateRangePicker } from '@/components/Reports/DateRangePicker'
import { DiagnosisChart } from '@/components/Reports/DiagnosisChart'
import { DoctorPerformanceTable } from '@/components/Reports/DoctorPerformanceTable'
import { ExaminationChart } from '@/components/Reports/ExaminationChart'
import { PatientChart } from '@/components/Reports/PatientChart'
import { ReportsPDFButton } from '@/components/Reports/ReportsPDF'
import { StatisticsCard } from '@/components/Reports/StatisticsCard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { useRouteActions } from '@/hooks/RBS'
import { Bed, DollarSign, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'

export enum REPORT_DATE_FILTER {
	DAILY = 'daily',
	THIS_WEEK = 'weekly',
	THIS_MONTH = 'monthly',
	QUARTERLY = 'quarterly',
	THIS_YEAR = 'yearly',
}

const Reports = () => {
	const { canRead } = useRouteActions('/reports')

	if (!canRead) return <CantRead />
	const [billingInterval, setBillingInterval] = useState<REPORT_DATE_FILTER>(
		REPORT_DATE_FILTER.DAILY
	)
	const [patientInterval, setPatientInterval] = useState<REPORT_DATE_FILTER>(
		REPORT_DATE_FILTER.DAILY
	)
	const [doctorInterval, setDoctorInterval] = useState<REPORT_DATE_FILTER>(
		REPORT_DATE_FILTER.DAILY
	)
	const [examinationInterval, setExaminationInterval] =
		useState<REPORT_DATE_FILTER>(REPORT_DATE_FILTER.DAILY)
	const [analysisInterval, setAnalysisInterval] = useState<REPORT_DATE_FILTER>(
		REPORT_DATE_FILTER.DAILY
	)
	const [dateRange, setDateRange] = useState<DateRange | undefined>()

	// API Queries - ular avtomatik refetch qiladilar interval o'zgarganda
	const { data: billingsData, isLoading: billingsLoading } =
		useGetAllBillingsQuery(
			{ interval: billingInterval, page: 1, limit: 50 },
			{ skip: false }
		)

	const { data: patientsData, isLoading: patientsLoading } =
		useGetAllPatientsQuery(
			{ interval: patientInterval, page: 1, limit: 50 },
			{ skip: false }
		)

	const { data: diagnosisData, isLoading: diagnosisLoading } =
		useGetDiagnosisQuery()

	const { data: doctorsData, isLoading: doctorsLoading } =
		useGetAllDoctorsQuery(
			{ interval: doctorInterval, page: 1, limit: 50 },
			{ skip: false }
		)

	const { data: examinationsData, isLoading: examinationsLoading } =
		useGetAllExaminationsQuery(
			{ interval: examinationInterval, page: 1, limit: 50 },
			{ skip: false }
		)

	const { data: analysisData, isLoading: analysisLoading } =
		useGetAllAnalysisQuery(
			{ interval: analysisInterval, page: 1, limit: 50 },
			{ skip: false }
		)

	const { data: roomsData, isLoading: roomsLoading } = useGetAllRoomsQuery()

	const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery()

	// Filter billing data by date range
	const filteredBillingData = useMemo(() => {
		if (!billingsData?.data || !dateRange?.from) return billingsData?.data || []

		return billingsData.data.filter(item => {
			const itemDate = new Date(item._id.year, item._id.month - 1, item._id.day)
			const from = dateRange.from!
			const to = dateRange.to || dateRange.from!

			return itemDate >= from && itemDate <= to
		})
	}, [billingsData?.data, dateRange])

	// Calculate statistics
	const totalBilling =
		filteredBillingData?.reduce((sum, item) => sum + item.totalAmount, 0) || 0

	const totalPatients =
		patientsData?.data?.reduce((sum, item) => sum + item.totalPatients, 0) || 0

	// Calculate revenue by service type with detailed breakdown
	const revenueByType = {
		XIZMAT: {
			total:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.XIZMAT.total,
					0
				) || 0,
			paid:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.XIZMAT.paid,
					0
				) || 0,
			debt:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.XIZMAT.debt,
					0
				) || 0,
		},
		TASVIR: {
			total:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.TASVIR.total,
					0
				) || 0,
			paid:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.TASVIR.paid,
					0
				) || 0,
			debt:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.TASVIR.debt,
					0
				) || 0,
		},
		KORIK: {
			total:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.KORIK.total,
					0
				) || 0,
			paid:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.KORIK.paid,
					0
				) || 0,
			debt:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.KORIK.debt,
					0
				) || 0,
		},
		TAHLIL: {
			total:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.TAHLIL.total,
					0
				) || 0,
			paid:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.TAHLIL.paid,
					0
				) || 0,
			debt:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.TAHLIL.debt,
					0
				) || 0,
		},
		XONA: {
			total:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.XONA.total,
					0
				) || 0,
			paid:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.XONA.paid,
					0
				) || 0,
			debt:
				filteredBillingData?.reduce(
					(sum, item) => sum + item.byType.XONA.debt,
					0
				) || 0,
		},
	}

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('uz-UZ', {
			notation: 'compact',
			compactDisplay: 'short',
		}).format(value)
	}

	const formatFullCurrency = (value: number) => {
		return new Intl.NumberFormat('uz-UZ').format(value) + ' сўм'
	}

	const isLoading =
		billingsLoading || patientsLoading || roomsLoading || usersLoading

	return (
		<div className='min-h-screen bg-background'>
			{/* Header with Export Buttons */}
			<div className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
				<div className='container mx-auto px-3 sm:px-4 lg:px-6 py-4'>
					<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
						<div>
							<h1 className='text-2xl font-bold tracking-tight'>Ҳисоботлар</h1>
							<p className='text-sm text-muted-foreground mt-1'>
								Тизим фаолияти статистикаси
							</p>
						</div>
						<div className='flex gap-2'>
							<ReportsPDFButton
								billingsData={billingsData?.data || []}
								patientsData={patientsData?.data || []}
								examinationsData={examinationsData?.data || []}
								analysisData={analysisData?.data || []}
								diagnosisData={diagnosisData?.data?.diagnosisStats || []}
								doctorsData={
									Array.isArray(doctorsData?.data) ? doctorsData.data : []
								}
								roomsData={roomsData?.data}
								usersData={usersData?.data}
								billingInterval={billingInterval}
								patientInterval={patientInterval}
								examinationInterval={examinationInterval}
								analysisInterval={analysisInterval}
								doctorInterval={doctorInterval}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<main className='container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6'>
				{/* KPI Cards */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
					<StatisticsCard
						title='Жами беморлар'
						value={totalPatients.toLocaleString()}
						icon={Users}
						variant='default'
					/>
					<StatisticsCard
						title='Жами даромад'
						value={formatCurrency(totalBilling) + ' сўм'}
						icon={DollarSign}
						variant='success'
					/>
					{/* <StatisticsCard
						title='Ташхислар'
						value={
							diagnosisData?.data?.totalExaminations.toLocaleString() || '0'
						}
						icon={Activity}
						variant='warning'
					/> */}
					<StatisticsCard
						title='Палата бандлиги'
						value={`${roomsData?.data?.occupancyRate.toFixed(1) || 0}%`}
						icon={Bed}
						description={`${roomsData?.data?.occupiedBeds || 0}/${
							roomsData?.data?.totalBeds || 0
						} бандлаштирилган`}
						variant='default'
					/>
				</div>

				{/* User Statistics */}
				{usersData?.data && (
					<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
						<Card className='p-4'>
							<h3 className='text-sm font-medium text-muted-foreground mb-2'>
								Шифокорлар
							</h3>
							<p className='text-2xl font-bold'>
								{usersData.data.doctor?.total ?? 0}
							</p>
							<div className='flex gap-4 mt-2 text-xs text-muted-foreground'>
								<span className='text-green-600'>
									Актив: {usersData.data.doctor?.active ?? 0}
								</span>
								<span className='text-red-600'>
									Ноактив: {usersData.data.doctor?.inactive ?? 0}
								</span>
							</div>
						</Card>
						<Card className='p-4'>
							<h3 className='text-sm font-medium text-muted-foreground mb-2'>
								Ҳамширалар
							</h3>
							<p className='text-2xl font-bold'>
								{usersData.data.nurse?.total ?? 0}
							</p>
							<div className='flex gap-4 mt-2 text-xs text-muted-foreground'>
								<span className='text-green-600'>
									Актив: {usersData.data.nurse?.active ?? 0}
								</span>
								<span className='text-red-600'>
									Ноактив: {usersData.data.nurse?.inactive ?? 0}
								</span>
							</div>
						</Card>
						<Card className='p-4'>
							<h3 className='text-sm font-medium text-muted-foreground mb-2'>
								Регистраторлар
							</h3>
							<p className='text-2xl font-bold'>
								{usersData.data.receptionist?.total ?? 0}
							</p>
							<div className='flex gap-4 mt-2 text-xs text-muted-foreground'>
								<span className='text-green-600'>
									Актив: {usersData.data.receptionist?.active ?? 0}
								</span>
								<span className='text-red-600'>
									Ноактив: {usersData.data.receptionist?.inactive ?? 0}
								</span>
							</div>
						</Card>
					</div>
				)}

				{/* Revenue by Service Type */}
				<div className='space-y-3'>
					<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
						<h2 className='text-lg font-semibold'>
							Хизмат турлари бўйича даромад
						</h2>
						<div className='w-full sm:w-[320px]'>
							<DateRangePicker
								dateRange={dateRange}
								onDateRangeChange={setDateRange}
							/>
						</div>
					</div>
					{dateRange?.from && (
						<p className='text-sm text-muted-foreground'>
							{dateRange.to
								? `Танланган давр: ${new Date(
										dateRange.from
								  ).toLocaleDateString('uz-UZ')} - ${new Date(
										dateRange.to
								  ).toLocaleDateString('uz-UZ')}`
								: `Танланган сана: ${new Date(
										dateRange.from
								  ).toLocaleDateString('uz-UZ')}`}
						</p>
					)}
					<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
						{/* XIZMAT Card */}
						<Card className='p-4 flex flex-col items-center text-center'>
							<h3 className='text-xs font-medium text-muted-foreground mb-3'>
								ХИЗМАТ
							</h3>
							<div className='mb-3'>
								{/* <p className='text-sm text-muted-foreground mb-1'>
									Жами миқдор
								</p> */}
								<p className='text-3xl font-bold text-purple-600'>
									{formatCurrency(revenueByType.XIZMAT.total)}
								</p>
							</div>
							<div className='w-full space-y-2 border-t pt-3'>
								<div className='flex justify-between text-xs'>
									<span className='text-muted-foreground'>Тўланган:</span>
									<span className='font-semibold text-green-600'>
										{formatCurrency(revenueByType.XIZMAT.paid)}
									</span>
								</div>
								<div className='flex justify-between text-xs'>
									<span className='text-muted-foreground'>Қарз:</span>
									<span className='font-semibold text-red-600'>
										{formatCurrency(revenueByType.XIZMAT.debt)}
									</span>
								</div>
							</div>
						</Card>

						{/* TASVIR Card */}
						<Card className='p-4 flex flex-col items-center text-center'>
							<h3 className='text-xs font-medium text-muted-foreground mb-3'>
								ТАСВИР
							</h3>
							<div className='mb-3'>
								{/* <p className='text-sm text-muted-foreground mb-1'>
									Жами миқдор
								</p> */}
								<p className='text-3xl font-bold text-cyan-600'>
									{formatCurrency(revenueByType.TASVIR.total)}
								</p>
							</div>
							<div className='w-full space-y-2 border-t pt-3'>
								<div className='flex justify-between text-xs'>
									<span className='text-muted-foreground'>Тўланган:</span>
									<span className='font-semibold text-green-600'>
										{formatCurrency(revenueByType.TASVIR.paid)}
									</span>
								</div>
								<div className='flex justify-between text-xs'>
									<span className='text-muted-foreground'>Қарз:</span>
									<span className='font-semibold text-red-600'>
										{formatCurrency(revenueByType.TASVIR.debt)}
									</span>
								</div>
							</div>
						</Card>

						{/* KORIK Card */}
						<Card className='p-4 flex flex-col items-center text-center'>
							<h3 className='text-xs font-medium text-muted-foreground mb-3'>
								КЎРИК
							</h3>
							<div className='mb-3'>
								{/* <p className='text-sm text-muted-foreground mb-1'>
									Жами миқдор
								</p> */}
								<p className='text-3xl font-bold text-pink-600'>
									{formatCurrency(revenueByType.KORIK.total)}
								</p>
							</div>
							<div className='w-full space-y-2 border-t pt-3'>
								<div className='flex justify-between text-xs'>
									<span className='text-muted-foreground'>Тўланган:</span>
									<span className='font-semibold text-green-600'>
										{formatCurrency(revenueByType.KORIK.paid)}
									</span>
								</div>
								<div className='flex justify-between text-xs'>
									<span className='text-muted-foreground'>Қарз:</span>
									<span className='font-semibold text-red-600'>
										{formatCurrency(revenueByType.KORIK.debt)}
									</span>
								</div>
							</div>
						</Card>

						{/* TAHLIL Card */}
						<Card className='p-4 flex flex-col items-center text-center'>
							<h3 className='text-xs font-medium text-muted-foreground mb-3'>
								ТАҲЛИЛ
							</h3>
							<div className='mb-3'>
								{/* <p className='text-sm text-muted-foreground mb-1'>
									Жами миқдор
								</p> */}
								<p className='text-3xl font-bold text-indigo-600'>
									{formatCurrency(revenueByType.TAHLIL.total)}
								</p>
							</div>
							<div className='w-full space-y-2 border-t pt-3'>
								<div className='flex justify-between text-xs'>
									<span className='text-muted-foreground'>Тўланған:</span>
									<span className='font-semibold text-green-600'>
										{formatCurrency(revenueByType.TAHLIL.paid)}
									</span>
								</div>
								<div className='flex justify-between text-xs'>
									<span className='text-muted-foreground'>Қарз:</span>
									<span className='font-semibold text-red-600'>
										{formatCurrency(revenueByType.TAHLIL.debt)}
									</span>
								</div>
							</div>
						</Card>

						{/* XONA Card */}
						<Card className='p-4 flex flex-col items-center text-center'>
							<h3 className='text-xs font-medium text-muted-foreground mb-3'>
								ХОНА
							</h3>
							<div className='mb-3'>
								{/* <p className='text-sm text-muted-foreground mb-1'>
									Жами миқдор
								</p> */}
								<p className='text-3xl font-bold text-teal-600'>
									{formatCurrency(revenueByType.XONA.total)}
								</p>
							</div>
							<div className='w-full space-y-2 border-t pt-3'>
								<div className='flex justify-between text-xs'>
									<span className='text-muted-foreground'>Тўланган:</span>
									<span className='font-semibold text-green-600'>
										{formatCurrency(revenueByType.XONA.paid)}
									</span>
								</div>
								<div className='flex justify-between text-xs'>
									<span className='text-muted-foreground'>Қарз:</span>
									<span className='font-semibold text-red-600'>
										{formatCurrency(revenueByType.XONA.debt)}
									</span>
								</div>
							</div>
						</Card>
					</div>
				</div>

				{/* Charts Section */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					{/* Billing Chart */}
					<BillingChart
						data={filteredBillingData || []}
						isLoading={billingsLoading}
						interval={billingInterval}
						onIntervalChange={setBillingInterval}
					/>

					{/* Patient Chart */}
					<PatientChart
						data={patientsData?.data || []}
						isLoading={patientsLoading}
						interval={patientInterval}
						onIntervalChange={setPatientInterval}
					/>

					{/* Examination Chart */}
					<ExaminationChart
						data={examinationsData?.data || []}
						isLoading={examinationsLoading}
						interval={examinationInterval}
						onIntervalChange={setExaminationInterval}
					/>

					{/* Analysis Chart */}
					<AnalysisChart
						data={analysisData?.data || []}
						isLoading={analysisLoading}
						interval={analysisInterval}
						onIntervalChange={setAnalysisInterval}
					/>

					{/* Diagnosis Chart */}
					<DiagnosisChart
						data={diagnosisData?.data?.diagnosisStats || []}
						isLoading={diagnosisLoading}
					/>

					{/* Doctor Performance Table */}
					<DoctorPerformanceTable
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						data={(doctorsData?.data || []) as any}
						isLoading={doctorsLoading}
						interval={doctorInterval}
						onIntervalChange={setDoctorInterval}
					/>
				</div>

				{/* Info Alert */}
				<Alert>
					<AlertDescription>
						Барча маълумотлар танланган давр бўйича кўрсатилган. Батафсил
						маълумот олиш учун давр танланг.
					</AlertDescription>
				</Alert>
			</main>
		</div>
	)
}

export default Reports
