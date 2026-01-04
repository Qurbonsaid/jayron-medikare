import type { Room } from '@/app/api/dailyCheckup/types'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { format } from 'date-fns'
import { Activity, Calendar, FileText, Home, Search, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Patient {
	_id: string
	fullname: string
}

interface Nurse {
	_id: string
	fullname: string
}

interface DailyCheckup {
	_id: string
	patient_id: Patient | string
	room_id?: Room | string
	nurse_id?: Nurse
	result?: {
		systolic: number
		diastolic: number
	}
	notes?: string
	created_at: string
}

interface DailyCheckupTableProps {
	checkups: DailyCheckup[]
	rooms: { _id: string; room_name: string }[]
	isLoading: boolean
}

export const DailyCheckupTable = ({ checkups, rooms, isLoading }: DailyCheckupTableProps) => {
	const { t } = useTranslation('inpatient')
	if (isLoading) {
		return (
			<div className="p-8 sm:p-12">
				<LoadingSpinner size="lg" text={t('dailyCheckup.loading')} className="justify-center" />
			</div>
		)
	}

	if (checkups.length === 0) {
		return (
			<div className="p-8 sm:p-12">
				<EmptyState
					icon={Search}
					title={t('dailyCheckup.noDataFound')}
					description={t('dailyCheckup.noBloodPressureRecords')}
				/>
			</div>
		)
	}

	return (
		<>
			{/* Mobile Card View */}
			<div className="block lg:hidden space-y-3 p-4">
				{checkups.map(checkup => {
					const patient = typeof checkup.patient_id === 'object' ? checkup.patient_id : null
					const roomId = typeof checkup.room_id === 'string' ? checkup.room_id : (checkup.room_id as Room)?._id
					const room = rooms.find(r => r._id === roomId) || (typeof checkup.room_id === 'object' ? checkup.room_id as Room : null)
					const nurse = checkup.nurse_id
					const patientName = patient?.fullname || '-'

					return (
						<Card key={checkup._id} className="card-shadow">
							<div className="p-3">
								<div className="flex items-start justify-between gap-2 mb-2">
									<div className="flex-1 min-w-0">
										<h3 className="font-semibold text-sm mb-0.5 truncate">
											{patientName}
										</h3>
										<p className="text-xs text-muted-foreground">
											{format(new Date(checkup.created_at), 'dd.MM.yyyy, HH:mm')}
										</p>
									</div>
									{checkup.result && (
										<div className="bg-primary/10 px-2.5 py-1.5 rounded-lg flex-shrink-0">
											<p className="font-bold text-base text-primary whitespace-nowrap">
												{checkup.result.systolic}/{checkup.result.diastolic}
											</p>
											<p className="text-[10px] text-muted-foreground text-center leading-none">mmHg</p>
										</div>
									)}
								</div>

								<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t text-xs">
									{room && (
										<div className="flex items-center gap-1.5">
											<Home className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
											<span className="whitespace-nowrap">{room.room_name}</span>
										</div>
									)}
									{nurse && (
										<div className="flex items-center gap-1.5">
											<User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
											<span className="truncate">{nurse.fullname}</span>
										</div>
									)}
									{checkup.notes && checkup.notes !== '-' && (
										<div className="flex items-center gap-1.5 w-full">
											<FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
											<span className="truncate">{checkup.notes}</span>
										</div>
									)}
								</div>
							</div>
						</Card>
					)
				})}
			</div>

			{/* Desktop Table View */}
			<div className="hidden lg:block overflow-x-auto">
				<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t('dailyCheckup.room')}</TableHead>
						<TableHead>{t('dailyCheckup.patient')}</TableHead>
						<TableHead>{t('dailyCheckup.bloodPressure')}</TableHead>
						<TableHead>{t('dailyCheckup.nurse')}</TableHead>
						<TableHead>{t('dailyCheckup.notes')}</TableHead>
						<TableHead>{t('dailyCheckup.date')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{checkups.map(checkup => {
						const patient = typeof checkup.patient_id === 'object' ? checkup.patient_id : null
						const roomId = typeof checkup.room_id === 'string' ? checkup.room_id : (checkup.room_id as Room)?._id
						const room = rooms.find(r => r._id === roomId) || (typeof checkup.room_id === 'object' ? checkup.room_id as Room : null)
						const nurse = checkup.nurse_id
						const patientName = patient?.fullname || '-'
						const shouldTruncatePatient = patientName.length > 20

						return (
							<TableRow key={checkup._id}>
								<TableCell>
									<span className="font-medium">{room?.room_name || '-'}</span>
								</TableCell>
								<TableCell>
									<div>
										<div className="font-medium">
											{shouldTruncatePatient ? (
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<span className="cursor-pointer">
																{patientName.slice(0, 20)}...
															</span>
														</TooltipTrigger>
														<TooltipContent>
															<p>{patientName}</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											) : (
												patientName
											)}
										</div>
									</div>
								</TableCell>
								<TableCell>
									{checkup.result ? (
										<span className="font-semibold text-lg">
											{checkup.result.systolic}/{checkup.result.diastolic}{' '}
											<span className="text-xs text-muted-foreground">mmHg</span>
										</span>
									) : (
										'-'
									)}
								</TableCell>
								<TableCell>{nurse?.fullname || '-'}</TableCell>
								<TableCell className="max-w-xs">
									{(() => {
										const notes = checkup.notes || '-'
										const shouldTruncateNotes = notes.length > 20
										return shouldTruncateNotes ? (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="cursor-pointer">
															{notes.slice(0, 20)}...
														</span>
													</TooltipTrigger>
													<TooltipContent>
														<p className="max-w-xs">{notes}</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										) : (
											notes
										)
									})()}
								</TableCell>
								<TableCell className="whitespace-nowrap">
									{format(new Date(checkup.created_at), 'dd.MM.yyyy, HH:mm')}
								</TableCell>
							</TableRow>
						)
					})}
				</TableBody>
			</Table>
		</div>
		</>
	)
}
