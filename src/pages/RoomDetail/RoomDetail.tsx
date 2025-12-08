import { useGetOneRoomQuery } from '@/app/api/roomApi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import handleIsLeavingToday from '@/lib/handleIsLeavingToday'
import { formatNumber, formatPhoneNumber } from '@/lib/utils'
import { formatDate } from 'date-fns'
import { Clock, HeartPulse, MoreHorizontal, Plus, Stethoscope, Trash2, User } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { MeasureBloodPressure } from './components/MeasureBloodPressure'
import { RemovePatient } from './components/RemovePatient'
import { RoomNewPatient } from './components/RoomNewPatient'
import { UpdateLeaveTime } from './components/UpdateLeaveTime'

const RoomDetail = () => {
	const [showRoomNewPatient, setShowRoomNewPatient] = useState(false)
	const [showRemovePatient, setShowRemovePatient] = useState(false)
	const [showUpdateLeaveTime, setShowUpdateLeaveTime] = useState(false)
	const [showMeasureBloodPressure, setShowMeasureBloodPressure] =
		useState(false)
	const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
		null
	)
	const [selectedExaminationId, setSelectedExaminationId] = useState<
		string | null
	>(null)

	const { id: roomId } = useParams()
	const { data: room, isLoading } = useGetOneRoomQuery(
		{ id: roomId },
		{ skip: !roomId }
	)

	return (
		<div className='min-h-screen bg-background p-4 sm:p-8 lg:p-12'>
			<div className='max-w-7xl mx-auto'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
					<div>
						<h1 className='text-2xl sm:text-3xl font-bold'>
							Xona Tafsilotlari
						</h1>
						<p className='text-sm sm:text-base text-muted-foreground'>
							Беморлар хонаси ҳақидаги маълумотларни кўриш ва бошқариш
						</p>
					</div>
					<Button
						className='w-full sm:w-auto'
						onClick={() => setShowRoomNewPatient(true)}
					>
						<Plus className='mr-2 h-4 w-4' />
						Янги бемор қўшиш
					</Button>
				</div>

				{isLoading ? (
					<Card className='card-shadow p-8 sm:p-12'>
						<LoadingSpinner
							size='lg'
							text='Юкланмоқда...'
							className='justify-center'
						/>
					</Card>
				) : (
					<div className='space-y-4'>
						<Card className='card-shadow p-4 lg:p-6'>
							<div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-6'>
								<div>
									<h3 className='text-sm font-medium text-muted-foreground'>
										Xona nomi
									</h3>
									<p className='mt-1 text-lg font-semibold'>
										{room?.data.room_name || 'бeлгиланмаган'}
									</p>
								</div>
								<div>
									<h3 className='text-sm font-medium text-muted-foreground'>
										Xona Narxi
									</h3>

									<p className='mt-1 text-lg font-semibold'>
										{formatNumber(room?.data.room_price)} so'm
									</p>
								</div>
								<div>
									<h3 className='text-sm font-medium text-muted-foreground'>
										Sig'im
									</h3>

									<p className='mt-1 text-lg font-semibold'>
										{room?.data.patient_capacity || 'бeлгиланмаган'} kishilik
									</p>
								</div>
								<div>
									<h3 className='text-sm font-medium text-muted-foreground'>
										Bandlik
									</h3>

									<p
										className={`mt-1 text-lg font-semibold ${
											room?.data.patient_occupied
												? room.data.patient_occupied ===
												  room.data.patient_capacity
													? 'text-red-600'
													: 'text-yellow-600'
												: 'text-green-600'
										}`}
									>
										{room?.data.patient_occupied
											? room.data.patient_occupied ===
											  room.data.patient_capacity
												? "To'liq band"
												: `${room.data.patient_occupied} ta band`
											: "Bo'sh"}
									</p>
								</div>
								<div>
									<h3 className='text-sm font-medium text-muted-foreground'>
										Xona qavati
									</h3>

									<p className='mt-1 text-lg font-semibold'>
										{room?.data.floor_number
											? room.data.floor_number + ' - qavat'
											: 'бeлгиланмаган'}
									</p>
								</div>
								<div>
									<h3 className='text-sm font-medium text-muted-foreground'>
										Tavsif
									</h3>

									<p className='mt-1 text-md font-semibold'>
										<Tooltip>
											<TooltipTrigger>
												<span>
													{room?.data.description
														? room?.data.description.length > 15
															? room?.data.description.slice(0, 15) + '...'
															: room?.data.description
														: 'Berilmagan'}
												</span>
											</TooltipTrigger>
											<TooltipContent>
												{room?.data.description || 'Berilmagan'}
											</TooltipContent>
										</Tooltip>
									</p>
								</div>
							</div>
						</Card>

						<Card className='card-shadow p-4 lg:p-6'>
							{room?.data.patients && room?.data.patients.length > 0 ? (
								<div className='w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6'>
									{room?.data.patients.map(patient => {
										const patientData =
											typeof patient.patient === 'string'
												? null
												: patient.patient

										return (
											<Card
												key={patient._id}
												className={`p-4 transition-smooth relative ${
													handleIsLeavingToday(patient.estimated_leave_time)
														? 'border-red-500 bg-red-100 hover:bg-red-200'
														: 'bg-green-100 border-green-500/50 hover:bg-green-200'
												}`}
											>
												<div className='absolute top-4 right-4'>
													<DropdownMenu>
														<DropdownMenuTrigger>
															<Button
																variant='default'
																className='w-8 h-6 border-green-500/50 bg-transparent hover:bg-green-500/20'
															>
																<MoreHorizontal className='w-8 h-6 text-black' />
															</Button>
														</DropdownMenuTrigger>

														<DropdownMenuContent>
															<DropdownMenuItem>
																<Button
																	size='sm'
																	variant='outline'
																	onClick={() => {
																		setShowMeasureBloodPressure(true)
																		setSelectedPatientId(
																			patientData?._id || null
																		)
																		setSelectedExaminationId(null)
																	}}
																	className='w-32 hover:bg-blue-600 hover:text-white transition-smooth text-xs xl:text-sm'
																>
																	<HeartPulse className='w-4 h-4' />
																	qon bosimi
																</Button>
															</DropdownMenuItem>
															<DropdownMenuItem>
																<Button
																	size='sm'
																	variant='outline'
																	onClick={() => {
																		setShowUpdateLeaveTime(true)
																		setSelectedPatientId(
																			patientData?._id || null
																		)
																	}}
																	className='w-32 hover:bg-yellow-600 hover:text-white transition-smooth text-xs xl:text-sm'
																>
																	<Clock className='w-4 h-4' />
																	o'zgartirish
																</Button>
															</DropdownMenuItem>
															<DropdownMenuItem>
																<Button
																	size='sm'
																	variant='outline'
																	onClick={() => {
																		setShowRemovePatient(true)
																		setSelectedPatientId(
																			patientData?._id || null
																		)
																	}}
																	className='w-32 hover:bg-red-600 hover:text-white transition-smooth text-xs xl:text-sm'
																>
																	<Trash2 className='w-4 h-4' />
																	Chiqarish
																</Button>
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>

												<div className='flex flex-col items-center text-center space-y-2'>
													<User className='h-8 w-8' />
													<div className='font-bold text-sm'>
														<span>{patientData?.fullname}</span>
													</div>
													<span className='text-sm font-semibold'>
														Tel:{' '}
														<strong>
															{formatPhoneNumber(patientData?.phone)}
														</strong>
													</span>

													<span className='text-sm font-semibold'>
														Kelgan:{' '}
														<strong>
															{formatDate(
																new Date(patient?.start_date),
																'dd.MM.yyyy'
															)}
														</strong>
													</span>

													<p className='text-sm font-medium'>
														Ketadi:
														<strong>
															{formatDate(
																new Date(patient?.estimated_leave_time),
																'dd.MM.yyyy'
															)}
														</strong>
													</p>
												</div>
											</Card>
										)
									})}
								</div>
							) : (
								<div className='flex items-center justify-center'>
									<h3>Беморлар топилмади</h3>
								</div>
							)}
						</Card>
					</div>
				)}

				<RoomNewPatient
					open={showRoomNewPatient}
					onOpenChange={setShowRoomNewPatient}
				/>

				<RemovePatient
					open={showRemovePatient}
					onOpenChange={setShowRemovePatient}
					patient_id={selectedPatientId}
				/>
				<UpdateLeaveTime
					open={showUpdateLeaveTime}
					onOpenChange={setShowUpdateLeaveTime}
					patient_id={selectedPatientId}
				/>
				<MeasureBloodPressure
					open={showMeasureBloodPressure}
					onOpenChange={setShowMeasureBloodPressure}
					patient_id={selectedPatientId}
					examination_id={selectedExaminationId}
				/>
			</div>
		</div>
	)
}

export default RoomDetail
