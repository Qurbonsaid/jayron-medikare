import { Button } from '@/components/ui/button'
import {
	Document,
	Font,
	Page,
	pdf,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

export enum REPORT_DATE_FILTER {
	DAILY = 'daily',
	THIS_WEEK = 'weekly',
	THIS_MONTH = 'monthly',
	QUARTERLY = 'quarterly',
	THIS_YEAR = 'yearly',
}

// Kirill harflarini qo'llab-quvvatlovchi shriftni ro'yxatdan o'tkazish
Font.register({
	family: 'Roboto',
	fonts: [
		{
			src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
			fontWeight: 'normal',
		},
		{
			src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
			fontWeight: 'bold',
		},
	],
})

// PDF uchun stillar
const styles = StyleSheet.create({
	page: {
		flexDirection: 'column',
		backgroundColor: '#FFFFFF',
		padding: 20,
		fontFamily: 'Roboto',
		fontSize: 9,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
		borderBottom: '2pt solid #000',
		paddingBottom: 8,
	},
	headerLeft: {
		flex: 1,
		textAlign: 'left',
	},
	headerCenter: {
		flex: 1,
		textAlign: 'center',
	},
	headerRight: {
		flex: 1,
		textAlign: 'right',
	},
	title: {
		fontSize: 12,
		fontWeight: 'bold',
	},
	subtitle: {
		fontSize: 10,
		fontWeight: 'bold',
	},
	date: {
		fontSize: 9,
	},
	section: {
		marginBottom: 12,
		break: 'avoid',
	},
	sectionTitle: {
		fontSize: 10,
		fontWeight: 'bold',
		marginBottom: 2,
		backgroundColor: '#e9ecef',
		padding: 2,
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10,
		paddingVertical: 4,
		borderBottom: '1pt solid #e5e7eb',
	},
	summaryLabel: {
		fontSize: 9,
		color: '#374151',
		fontWeight: 'bold',
	},
	summaryValue: {
		fontSize: 9,
		color: '#111827',
		fontWeight: 'bold',
	},
	tableContainer: {
		marginBottom: 8,
		borderWidth: 1,
		borderColor: '#dee2e6',
		break: 'avoid',
	},
	tableRow: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#dee2e6',
		minHeight: 20,
	},
	tableHeader: {
		backgroundColor: '#e9ecef',
		fontWeight: 'bold',
	},
	tableCol: {
		flex: 1,
		paddingHorizontal: 4,
		paddingVertical: 3,
		justifyContent: 'center',
	},
	tableCell: {
		fontSize: 8,
	},
	tableCellBold: {
		fontSize: 8,
		fontWeight: 'bold',
	},
	footer: {
		position: 'absolute',
		bottom: 15,
		left: 20,
		right: 20,
		textAlign: 'center',
		fontSize: 7,
		color: '#6b7280',
		borderTop: '1pt solid #dee2e6',
		paddingTop: 8,
	},
})

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ReportsPDFProps {
	billingsData: any[]
	patientsData: any[]
	examinationsData: any[]
	analysisData: any[]
	diagnosisData: any[]
	doctorsData: any[]
	roomsData: any
	usersData: any
	billingInterval: REPORT_DATE_FILTER
	patientInterval: REPORT_DATE_FILTER
	examinationInterval: REPORT_DATE_FILTER
	analysisInterval: REPORT_DATE_FILTER
	doctorInterval: REPORT_DATE_FILTER
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const getIntervalLabel = (interval: REPORT_DATE_FILTER): string => {
	switch (interval) {
		case REPORT_DATE_FILTER.DAILY:
			return 'Кунлик'
		case REPORT_DATE_FILTER.THIS_WEEK:
			return 'Ҳафталик'
		case REPORT_DATE_FILTER.THIS_MONTH:
			return 'Ойлик'
		case REPORT_DATE_FILTER.QUARTERLY:
			return 'Чораклик'
		case REPORT_DATE_FILTER.THIS_YEAR:
			return 'Йиллик'
		default:
			return ''
	}
}

const ReportsPDFDocument: React.FC<ReportsPDFProps> = ({
	billingsData,
	patientsData,
	examinationsData,
	analysisData,
	diagnosisData,
	doctorsData,
	roomsData,
	usersData,
	billingInterval,
	patientInterval,
	examinationInterval,
	analysisInterval,
	doctorInterval,
}) => {
	const formatDate = (date: Date | string): string => {
		if (!date) return 'Кўрсатилмаган'
		const dateObj = new Date(date)
		return dateObj.toLocaleDateString('uz-UZ', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		})
	}

	const formatDateFromId = (dateId: {
		year: number
		month?: number
		day?: number
	}): string => {
		if (!dateId || !dateId.year) return 'Кўрсатилмаган'

		if (dateId.day) {
			// Kunlik format: 01.12.2025
			return `${String(dateId.day).padStart(2, '0')}.${String(
				dateId.month
			).padStart(2, '0')}.${dateId.year}`
		} else if (dateId.month) {
			// Oylik format: 12.2025
			return `${String(dateId.month).padStart(2, '0')}.${dateId.year}`
		} else {
			// Yillik format: 2025
			return String(dateId.year)
		}
	}

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('uz-UZ').format(value) + ' сўм'
	}

	const formatNumber = (value: number) => {
		return new Intl.NumberFormat('uz-UZ').format(value)
	}

	// Calculate totals
	const totalBilling = billingsData.reduce(
		(sum, item) => sum + item.totalAmount,
		0
	)
	const totalPatients = patientsData.reduce(
		(sum, item) => sum + item.totalPatients,
		0
	)

	// Calculate service type totals
	const serviceTypeTotals = {
		XIZMAT: {
			total: billingsData.reduce(
				(sum, item) => sum + (item.byType?.XIZMAT?.total || 0),
				0
			),
			paid: billingsData.reduce(
				(sum, item) => sum + (item.byType?.XIZMAT?.paid || 0),
				0
			),
			debt: billingsData.reduce(
				(sum, item) => sum + (item.byType?.XIZMAT?.debt || 0),
				0
			),
		},
		TASVIR: {
			total: billingsData.reduce(
				(sum, item) => sum + (item.byType?.TASVIR?.total || 0),
				0
			),
			paid: billingsData.reduce(
				(sum, item) => sum + (item.byType?.TASVIR?.paid || 0),
				0
			),
			debt: billingsData.reduce(
				(sum, item) => sum + (item.byType?.TASVIR?.debt || 0),
				0
			),
		},
		KORIK: {
			total: billingsData.reduce(
				(sum, item) => sum + (item.byType?.KORIK?.total || 0),
				0
			),
			paid: billingsData.reduce(
				(sum, item) => sum + (item.byType?.KORIK?.paid || 0),
				0
			),
			debt: billingsData.reduce(
				(sum, item) => sum + (item.byType?.KORIK?.debt || 0),
				0
			),
		},
		TAHLIL: {
			total: billingsData.reduce(
				(sum, item) => sum + (item.byType?.TAHLIL?.total || 0),
				0
			),
			paid: billingsData.reduce(
				(sum, item) => sum + (item.byType?.TAHLIL?.paid || 0),
				0
			),
			debt: billingsData.reduce(
				(sum, item) => sum + (item.byType?.TAHLIL?.debt || 0),
				0
			),
		},
		XONA: {
			total: billingsData.reduce(
				(sum, item) => sum + (item.byType?.XONA?.total || 0),
				0
			),
			paid: billingsData.reduce(
				(sum, item) => sum + (item.byType?.XONA?.paid || 0),
				0
			),
			debt: billingsData.reduce(
				(sum, item) => sum + (item.byType?.XONA?.debt || 0),
				0
			),
		},
	}

	const currentDate = new Date().toLocaleDateString('uz-UZ', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})

	return (
		<Document>
			<Page size='A4' style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.headerLeft}>
						<Text style={styles.title}>Клиника "Jayron medservis"</Text>
					</View>
					<View style={styles.headerCenter}>
						<Text style={styles.subtitle}>Тизим фаолияти ҳисоботи</Text>
					</View>
					<View style={styles.headerRight}>
						<Text style={styles.date}>{formatDate(new Date())}</Text>
					</View>
				</View>
				{/* KPI Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Асосий кўрсаткичлар</Text>
					<View style={styles.tableContainer}>
						<View style={[styles.tableRow, styles.tableHeader]}>
							<Text style={[styles.tableCol, styles.tableCell, { flex: 2 }]}>
								Кўрсаткич
							</Text>
							<Text style={[styles.tableCol, styles.tableCell]}>Қиймат</Text>
						</View>
						<View style={styles.tableRow}>
							<Text style={[styles.tableCol, styles.tableCell, { flex: 2 }]}>
								Жами беморлар
							</Text>
							<Text style={[styles.tableCol, styles.tableCell]}>
								{formatNumber(totalPatients)}
							</Text>
						</View>
						<View style={styles.tableRow}>
							<Text style={[styles.tableCol, styles.tableCell, { flex: 2 }]}>
								Жами даромад
							</Text>
							<Text style={[styles.tableCol, styles.tableCell]}>
								{formatCurrency(totalBilling)}
							</Text>
						</View>
						<View style={styles.tableRow}>
							<Text style={[styles.tableCol, styles.tableCell, { flex: 2 }]}>
								Палата бандлиги
							</Text>
							<Text style={[styles.tableCol, styles.tableCell]}>
								{roomsData?.occupancyRate?.toFixed(1) || 0}% (
								{roomsData?.occupiedBeds || 0}/{roomsData?.totalBeds || 0})
							</Text>
						</View>
						<View style={styles.tableRow}>
							<Text style={[styles.tableCol, styles.tableCell, { flex: 2 }]}>
								Жами ташхислар
							</Text>
							<Text style={[styles.tableCol, styles.tableCell]}>
								{diagnosisData?.length || 0}
							</Text>
						</View>
					</View>
				</View>
				{/* User Statistics */}
				{usersData && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Ходимлар статистикаси</Text>
						<View style={styles.tableContainer}>
							<View style={[styles.tableRow, styles.tableHeader]}>
								<Text style={[styles.tableCol, styles.tableCell]}>Лавозим</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>Жами</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>Актив</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>Ноактив</Text>
							</View>
							<View style={styles.tableRow}>
								<Text style={[styles.tableCol, styles.tableCell]}>
									Шифокорлар
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{usersData.doctor?.total ?? 0}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{usersData.doctor?.active ?? 0}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{usersData.doctor?.inactive ?? 0}
								</Text>
							</View>
							<View style={styles.tableRow}>
								<Text style={[styles.tableCol, styles.tableCell]}>
									Ҳамширалар
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{usersData.nurse?.total ?? 0}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{usersData.nurse?.active ?? 0}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{usersData.nurse?.inactive ?? 0}
								</Text>
							</View>
							<View style={styles.tableRow}>
								<Text style={[styles.tableCol, styles.tableCell]}>
									Регистраторлар
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{usersData.receptionist?.total ?? 0}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{usersData.receptionist?.active ?? 0}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{usersData.receptionist?.inactive ?? 0}
								</Text>
							</View>
						</View>
					</View>
				)}{' '}
				{/* Service Type Statistics */}
				{billingsData.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							Хизмат турлари бўйича статистика (
							{getIntervalLabel(billingInterval)})
						</Text>
						<View style={styles.tableContainer}>
							<View style={[styles.tableRow, styles.tableHeader]}>
								<Text style={[styles.tableCol, styles.tableCell]}>
									Хизмат тури
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>Жами</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									Тўланған
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>Қарз</Text>
							</View>
							<View style={styles.tableRow}>
								<Text style={[styles.tableCol, styles.tableCell]}>ХИЗМАТ</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.XIZMAT.total)}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.XIZMAT.paid)}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.XIZMAT.debt)}
								</Text>
							</View>
							<View style={styles.tableRow}>
								<Text style={[styles.tableCol, styles.tableCell]}>ТАСВИР</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.TASVIR.total)}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.TASVIR.paid)}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.TASVIR.debt)}
								</Text>
							</View>
							<View style={styles.tableRow}>
								<Text style={[styles.tableCol, styles.tableCell]}>КЎРИК</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.KORIK.total)}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.KORIK.paid)}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.KORIK.debt)}
								</Text>
							</View>
							<View style={styles.tableRow}>
								<Text style={[styles.tableCol, styles.tableCell]}>ТАҲЛИЛ</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.TAHLIL.total)}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.TAHLIL.paid)}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.TAHLIL.debt)}
								</Text>
							</View>
							<View style={styles.tableRow}>
								<Text style={[styles.tableCol, styles.tableCell]}>ХОНА</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.XONA.total)}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.XONA.paid)}
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									{formatCurrency(serviceTypeTotals.XONA.debt)}
								</Text>
							</View>
						</View>
					</View>
				)}
				{/* Billing Data */}
				{billingsData.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							Молиявий ҳисобот ({getIntervalLabel(billingInterval)})
						</Text>
						<View style={styles.tableContainer}>
							<View style={[styles.tableRow, styles.tableHeader]}>
								<Text style={[styles.tableCol, styles.tableCell]}>Сана</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>Жами</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									Тўланған
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>Қарз</Text>
							</View>
							{billingsData.map((item, index) => (
								<View key={index} style={styles.tableRow}>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{formatDateFromId(item._id)}
									</Text>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{formatCurrency(item.totalAmount)}
									</Text>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{formatCurrency(item.paidAmount)}
									</Text>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{formatCurrency(item.debtAmount)}
									</Text>
								</View>
							))}
						</View>
					</View>
				)}
				{/* Patient Data */}
				{patientsData.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							Беморлар статистикаси ({getIntervalLabel(patientInterval)})
						</Text>
						<View style={styles.tableContainer}>
							<View style={[styles.tableRow, styles.tableHeader]}>
								<Text style={[styles.tableCol, styles.tableCell]}>Сана</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>Жами</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>Актив</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>Ноактив</Text>
							</View>
							{patientsData.map((item, index) => (
								<View key={index} style={styles.tableRow}>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{formatDateFromId(item._id)}
									</Text>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{item.totalPatients}
									</Text>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{item.activePatients}
									</Text>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{item.inactivePatients}
									</Text>
								</View>
							))}
						</View>
					</View>
				)}
				{/* </Page> */}
				{/* Page 2 */}
				{/* <Page size='A4' style={styles.page}> */}
				{/* Examination Data */}
				{examinationsData.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							Кўриклар статистикаси ({getIntervalLabel(examinationInterval)})
						</Text>
						<View style={styles.tableContainer}>
							<View style={[styles.tableRow, styles.tableHeader]}>
								<Text style={[styles.tableCol, styles.tableCell]}>Сана</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									Жами кўриклар
								</Text>
								{/* <Text style={[styles.tableCol, styles.tableCell]}>Актив</Text> */}
								<Text style={[styles.tableCol, styles.tableCell]}>Сумма</Text>
							</View>
							{examinationsData.map((item, index) => (
								<View key={index} style={styles.tableRow}>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{formatDateFromId(item._id)}
									</Text>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{item.totalExaminations}
									</Text>
									{/* <Text style={[styles.tableCol, styles.tableCell]}>
										{item.activeExaminations}
									</Text> */}
									<Text style={[styles.tableCol, styles.tableCell]}>
										{formatCurrency(item.totalAmount)}
									</Text>
								</View>
							))}
						</View>
					</View>
				)}{' '}
				{/* Analysis Data */}
				{analysisData.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							Тахлиллар статистикаси ({getIntervalLabel(analysisInterval)})
						</Text>
						<View style={styles.tableContainer}>
							<View style={[styles.tableRow, styles.tableHeader]}>
								<Text style={[styles.tableCol, styles.tableCell]}>Сана</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									Жами тахлиллар
								</Text>
								{/* <Text style={[styles.tableCol, styles.tableCell]}>
									Тугалланган
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									Кутилмоқда
								</Text> */}
							</View>
							{analysisData.map((item, index) => (
								<View key={index} style={styles.tableRow}>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{formatDateFromId(item._id)}
									</Text>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{item.totalAnalyses}
									</Text>
									{/* <Text style={[styles.tableCol, styles.tableCell]}>
										{item.completedAnalyses}
									</Text>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{item.pendingAnalyses}
									</Text> */}
								</View>
							))}
						</View>
					</View>
				)}
				{/* Doctor Performance */}
				{doctorsData?.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							Шифокорлар фаолияти ({getIntervalLabel(doctorInterval)})
						</Text>
						<View style={styles.tableContainer}>
							<View style={[styles.tableRow, styles.tableHeader]}>
								<Text style={[styles.tableCol, styles.tableCell, { flex: 2 }]}>
									Сана
								</Text>
								<Text style={[styles.tableCol, styles.tableCell, { flex: 2 }]}>
									Шифокор
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									Telefon raqami
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>
									Кўриклар
								</Text>
								{/* <Text style={[styles.tableCol, styles.tableCell]}>
									Беморлар
								</Text> */}
							</View>
							{doctorsData.map((doctor, index) => (
								<View key={index} style={styles.tableRow}>
									<Text
										style={[styles.tableCol, styles.tableCell, { flex: 2 }]}
									>
										{formatDateFromId(doctor._id)}
									</Text>
									<Text
										style={[styles.tableCol, styles.tableCell, { flex: 2 }]}
									>
										{doctor.doctor_name || 'N/A'}
									</Text>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{doctor.doctor_phone || 'N/A'}
									</Text>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{doctor.totalExaminations || 0}
									</Text>
									{/* <Text style={[styles.tableCol, styles.tableCell]}>
										{doctor.uniquePatients || 0}
									</Text> */}
								</View>
							))}
						</View>
					</View>
				)}
				{/* Diagnosis Stats */}
				{diagnosisData.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Ташхислар бўйича статистика</Text>
						<View style={styles.tableContainer}>
							<View style={[styles.tableRow, styles.tableHeader]}>
								<Text style={[styles.tableCol, styles.tableCell, { flex: 2 }]}>
									Ташхис
								</Text>
								<Text style={[styles.tableCol, styles.tableCell]}>Сони</Text>
							</View>
							{diagnosisData.map((item, index) => (
								<View key={index} style={styles.tableRow}>
									<Text
										style={[styles.tableCol, styles.tableCell, { flex: 2 }]}
									>
										{item.diagnosis_name || 'N/A'}
									</Text>
									<Text style={[styles.tableCol, styles.tableCell]}>
										{item.count}
									</Text>
								</View>
							))}
						</View>
					</View>
				)}{' '}
				{/* Footer */}
				<View style={styles.footer}>
					<Text>
						Ушбу ҳисобот {currentDate} санада автоматик тарзда яратилган
					</Text>
					<Text style={{ marginTop: 3 }}>
						Клиника "Jayron medservis" | Барча ҳуқуқлар ҳимояланган
					</Text>
				</View>
			</Page>
		</Document>
	)
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ReportsPDFButtonProps {
	billingsData: any[]
	patientsData: any[]
	examinationsData: any[]
	analysisData: any[]
	diagnosisData: any[]
	doctorsData: any[]
	roomsData: any
	usersData: any
	billingInterval: REPORT_DATE_FILTER
	patientInterval: REPORT_DATE_FILTER
	examinationInterval: REPORT_DATE_FILTER
	analysisInterval: REPORT_DATE_FILTER
	doctorInterval: REPORT_DATE_FILTER
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const ReportsPDFButton: React.FC<ReportsPDFButtonProps> = props => {
	const [isGenerating, setIsGenerating] = useState(false)

	const generatePDF = async () => {
		setIsGenerating(true)
		try {
			const toastId = toast.loading('PDF тайёрланмоқда...')

			const blob = await pdf(<ReportsPDFDocument {...props} />).toBlob()

			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url

			const date = new Date()
				.toLocaleDateString('uz-UZ')
				.replace(/\//g, '.')
				.replace(/\s/g, '_')

			link.download = `Hisobot_${date}.pdf`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)

			URL.revokeObjectURL(url)

			toast.dismiss(toastId)
			toast.success('PDF муваффақиятли юкланди!')
		} catch (error) {
			console.error('PDF yaratishda xatolik:', error)
			toast.error('PDF яратишда хатолик юз берди')
		} finally {
			setIsGenerating(false)
		}
	}

	return (
		<Button
			variant='outline'
			size='sm'
			onClick={generatePDF}
			disabled={isGenerating}
			className='text-xs sm:text-sm'
		>
			<Download className='w-3 h-3 sm:w-4 sm:h-4 mr-2' />
			{isGenerating ? 'Юкланмоқда...' : 'PDF'}
		</Button>
	)
}
