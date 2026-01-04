import { useGetUncheckedPatientsQuery } from '@/app/api/dailyCheckup/dailyCheckupApi'
import { Card, CardContent } from '@/components/ui/card'
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
import { Bed, FileQuestion, Home, Phone, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const UncheckedPatientsTab = () => {
	const { t } = useTranslation('inpatient')
	const { data, isLoading } = useGetUncheckedPatientsQuery()

	return (
		<div className="space-y-4 sm:space-y-6">
			<Card className="card-shadow">
				<CardContent className="p-0">
					{isLoading ? (
						<div className="p-8 sm:p-12">
							<LoadingSpinner size="lg" text={t('dailyCheckup.loading')} className="justify-center" />
						</div>
					) : !data?.data || data.data.length === 0 ? (
						<div className="p-8 sm:p-12">
							<EmptyState
								icon={FileQuestion}
								title={t('dailyCheckup.noUncheckedPatients')}
								description={t('dailyCheckup.allPatientsMeasured')}
							/>
						</div>
					) : (
						<>
							{/* Stats */}
							<div className="p-4 border-b">
								<p className="text-sm text-muted-foreground">
									{t('dailyCheckup.total')}: <span className="font-semibold text-foreground">{data.total}</span> {t('dailyCheckup.patients')}
								</p>
							</div>

						{/* Mobile Card View */}
						<div className="block lg:hidden space-y-3 p-4">
							{data.data.map((item, index) => {
								const patientName = item.patient.fullname
								const genderText = item.patient.gender === 'male' ? t('dailyCheckup.male') : item.patient.gender === 'female' ? t('dailyCheckup.female') : item.patient.gender

								return (
									<Card key={index} className="card-shadow">
										<div className="p-3">
											<div className="flex items-start justify-between gap-2 mb-2">
												<div className="flex-1 min-w-0">
													<h3 className="font-semibold text-sm mb-0.5 truncate">
														{patientName}
													</h3>
													<p className="text-xs text-muted-foreground">
														{genderText}
													</p>
												</div>
											</div>

											<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t text-xs">
												<div className="flex items-center gap-1.5">
													<Home className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
													<span className="whitespace-nowrap">{item.room.room_name} ({item.room.floor_number}-{t('dailyCheckup.floorShort')})</span>
												</div>
												<div className="flex items-center gap-1.5">
													<Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
													<span className="whitespace-nowrap">{item.patient.phone}</span>
												</div>
												<div className="flex items-center gap-1.5">
													<Bed className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
													<span className="whitespace-nowrap">{t('dailyCheckup.bed')}: {item.bed_number}</span>
												</div>
											</div>
										</div>
									</Card>
								)
							})}
						</div>							{/* Desktop Table View */}
							<div className="hidden lg:block overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>{t('dailyCheckup.room')}</TableHead>
											<TableHead>{t('dailyCheckup.floor')}</TableHead>
											<TableHead>{t('dailyCheckup.patient')}</TableHead>
											<TableHead>{t('dailyCheckup.gender')}</TableHead>
											<TableHead>{t('dailyCheckup.phone')}</TableHead>
											<TableHead>{t('dailyCheckup.bed')}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{data.data.map((item, index) => {
											const patientName = item.patient.fullname
											const shouldTruncate = patientName.length > 20
											const genderText = item.patient.gender === 'male' ? t('dailyCheckup.male') : item.patient.gender === 'female' ? t('dailyCheckup.female') : item.patient.gender

											return (
												<TableRow key={index}>
													<TableCell>
														<span className="font-medium">{item.room.room_name}</span>
													</TableCell>
													<TableCell>{item.room.floor_number}-{t('dailyCheckup.floorLabel')}</TableCell>
													<TableCell>
														<div className="font-medium">
															{shouldTruncate ? (
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
													</TableCell>
													<TableCell>{genderText}</TableCell>
													<TableCell>{item.patient.phone}</TableCell>
													<TableCell>{item.bed_number}</TableCell>
												</TableRow>
											)
										})}
									</TableBody>
								</Table>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
