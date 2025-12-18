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
import { AnalysisChart } from '@/components/Reports/AnalysisChart'
import { BillingChart } from '@/components/Reports/BillingChart'
import { DiagnosisChart } from '@/components/Reports/DiagnosisChart'
import { DoctorPerformanceTable } from '@/components/Reports/DoctorPerformanceTable'
import { ExaminationChart } from '@/components/Reports/ExaminationChart'
import { PatientChart } from '@/components/Reports/PatientChart'
import { ReportsPDFButton } from '@/components/Reports/ReportsPDF'
import { StatisticsCard } from '@/components/Reports/StatisticsCard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Bed, DollarSign, Users } from 'lucide-react'
import { useState } from 'react'

export enum REPORT_DATE_FILTER {
	DAILY = 'daily',
	THIS_WEEK = 'weekly',
	THIS_MONTH = 'monthly',
	QUARTERLY = 'quarterly',
	THIS_YEAR = 'yearly',
}

const Reports = () => {
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

	// Calculate statistics
	const totalBilling =
		billingsData?.data?.reduce((sum, item) => sum + item.totalAmount, 0) || 0

	const totalPatients =
		patientsData?.data?.reduce((sum, item) => sum + item.totalPatients, 0) || 0

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('uz-UZ', {
			notation: 'compact',
			compactDisplay: 'short',
		}).format(value)
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

				{/* Billing Chart - Full Width with Service Type Cards */}
				<BillingChart
					data={billingsData?.data || []}
					isLoading={billingsLoading}
					interval={billingInterval}
					onIntervalChange={setBillingInterval}
				/>

				{/* Charts Section */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
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
