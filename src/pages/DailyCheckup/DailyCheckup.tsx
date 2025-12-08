import {
	useAddEntryDailyCheckupMutation,
	useCreateDailyCheckupMutation,
	useDeleteDailyCheckupMutation,
	useGetAlldailyCheckupQuery,
} from '@/app/api/dailyCheckup/dailyCheckupApi'
import { useGetAllExamsQuery } from '@/app/api/examinationApi/examinationApi'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import { format } from 'date-fns'
import { Calendar, Plus, Trash2, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

interface CreateDailyCheckupForm {
	examination_id: string
	date: string
	systolic: string
	diastolic: string
	notes: string
}

interface AddEntryForm {
	date: string
	systolic: string
	diastolic: string
	notes: string
}

const DailyCheckup = () => {
	const [selectedPatientId, setSelectedPatientId] = useState<string>('all')
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [isAddEntryDialogOpen, setIsAddEntryDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedCheckupId, setSelectedCheckupId] = useState<string>('')
	const [selectedEntryId, setSelectedEntryId] = useState<string>('')
	const [deleteType, setDeleteType] = useState<'checkup' | 'entry'>('checkup')
	const [expandedPatients, setExpandedPatients] = useState<
		Record<string, boolean>
	>({})
	const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
		{}
	)
	const [selectedPatientForCreate, setSelectedPatientForCreate] =
		useState<string>('')

	const [createForm, setCreateForm] = useState<CreateDailyCheckupForm>({
		examination_id: '',
		date: new Date().toISOString().slice(0, 16),
		systolic: '',
		diastolic: '',
		notes: '',
	})

	const [addEntryForm, setAddEntryForm] = useState<AddEntryForm>({
		date: new Date().toISOString().slice(0, 16),
		systolic: '',
		diastolic: '',
		notes: '',
	})

	// API queries
	const { data: dailyCheckupsData, isLoading: isLoadingCheckups } =
		useGetAlldailyCheckupQuery({
			page: 1,
			limit: 100,
			patient_id: selectedPatientId === 'all' ? '' : selectedPatientId,
			doctor_id: '',
			examination_status: undefined,
		})

	const { data: examsData } = useGetAllExamsQuery({
		page: 1,
		limit: 100,
	})

	const [createDailyCheckup, { isLoading: isCreating }] =
		useCreateDailyCheckupMutation()
	const [addEntry, { isLoading: isAddingEntry }] =
		useAddEntryDailyCheckupMutation()
	const [deleteDailyCheckup, { isLoading: isDeleting }] =
		useDeleteDailyCheckupMutation()

	const handleRequest = useHandleRequest()

	const dailyCheckups = useMemo(
		() => dailyCheckupsData?.data || [],
		[dailyCheckupsData]
	)
	const examinations = examsData?.data || []

	// Get unique patients from dailyCheckups
	const uniquePatients = useMemo(() => {
		const patientsMap = new Map()
		dailyCheckups.forEach(checkup => {
			if (!patientsMap.has(checkup.patient_id._id)) {
				patientsMap.set(checkup.patient_id._id, checkup.patient_id)
			}
		})
		return Array.from(patientsMap.values())
	}, [dailyCheckups])

	// Group entries by date
	const groupEntriesByDate = (entries: Entry[]) => {
		const grouped = entries.reduce((acc, entry) => {
			const dateKey = format(new Date(entry.date), 'yyyy-MM-dd')
			if (!acc[dateKey]) {
				acc[dateKey] = []
			}
			acc[dateKey].push(entry)
			return acc
		}, {} as Record<string, Entry[]>)
		return grouped
	}

	// Get latest entry from checkup
	const getLatestEntry = (checkup: (typeof dailyCheckups)[0]) => {
		if (!checkup.entries || checkup.entries.length === 0) return null
		return checkup.entries.reduce((latest: Entry, entry: Entry) => {
			return new Date(entry.date) > new Date(latest.date) ? entry : latest
		})
	}

	// Handle create daily checkup
	const handleCreateDailyCheckup = async () => {
		if (!createForm.examination_id) {
			toast.error("Iltimos, ko'rikni tanlang")
			return
		}
		if (!createForm.systolic || !createForm.diastolic) {
			toast.error('Iltimos, qon bosimini kiriting')
			return
		}

		await handleRequest({
			request: async () => {
				const res = await createDailyCheckup({
					examination_id: createForm.examination_id,
					date: new Date(createForm.date).toISOString(),
					blood_pressure: {
						systolic: Number(createForm.systolic),
						diastolic: Number(createForm.diastolic),
					},
					notes: createForm.notes,
				}).unwrap()
				return res
			},
			onSuccess: () => {
				toast.success("Kunlik ko'rik muvaffaqiyatli yaratildi")
				setIsCreateDialogOpen(false)
				setCreateForm({
					examination_id: '',
					date: new Date().toISOString().slice(0, 16),
					systolic: '',
					diastolic: '',
					notes: '',
				})
				setSelectedPatientForCreate('')
			},
			onError: error => {
				toast.error(error?.data?.error?.msg || 'Xatolik yuz berdi')
			},
		})
	}

	// Handle add entry
	const handleAddEntry = async () => {
		if (!addEntryForm.systolic || !addEntryForm.diastolic) {
			toast.error('Iltimos, qon bosimini kiriting')
			return
		}

		await handleRequest({
			request: async () => {
				const res = await addEntry({
					id: selectedCheckupId,
					body: {
						date: new Date(addEntryForm.date).toISOString(),
						blood_pressure: {
							systolic: Number(addEntryForm.systolic),
							diastolic: Number(addEntryForm.diastolic),
						},
						notes: addEntryForm.notes,
					},
				}).unwrap()
				return res
			},
			onSuccess: () => {
				toast.success("Yozuv muvaffaqiyatli qo'shildi")
				setIsAddEntryDialogOpen(false)
				setAddEntryForm({
					date: new Date().toISOString().split('T')[0],
					systolic: '',
					diastolic: '',
					notes: '',
				})
			},
			onError: error => {
				toast.error(error?.data?.error?.msg || 'Xatolik yuz berdi')
			},
		})
	}

	// Handle delete
	const handleDelete = async () => {
		await handleRequest({
			request: async () => {
				const res = await deleteDailyCheckup({
					id: selectedCheckupId,
					entry_id: selectedEntryId,
				}).unwrap()
				return res
			},
			onSuccess: () => {
				toast.success(
					deleteType === 'entry'
						? "Yozuv muvaffaqiyatli o'chirildi"
						: "Kunlik ko'rik muvaffaqiyatli o'chirildi"
				)
				setIsDeleteDialogOpen(false)
			},
			onError: error => {
				toast.error(error?.data?.error?.msg || 'Xatolik yuz berdi')
			},
		})
	}

	// Get examinations for selected patient
	const getExaminationsForPatient = (patientId: string) => {
		if (!patientId) return []
		const checkups = dailyCheckups.filter(c => c.patient_id._id === patientId)
		return checkups.map(c => c.examination_id)
	}

	if (isLoadingCheckups) {
		return (
			<div className='flex h-full items-center justify-center'>
				<LoadingSpinner />
			</div>
		)
	}

	return (
		<div className='container mx-auto space-y-6 p-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold'>Kunlik Ko'riklar</h1>
					<p className='text-muted-foreground'>
						Bemorlarning kunlik tekshiruv ma'lumotlarini boshqaring
					</p>
				</div>
				<Button onClick={() => setIsCreateDialogOpen(true)}>
					<Plus className='mr-2 h-4 w-4' />
					Yangi Kunlik Ko'rik
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center text-lg'>
						<User className='mr-2 h-5 w-5' />
						Filtrlar
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex items-center gap-4'>
						<div className='flex-1'>
							<Label>Bemor</Label>
							<Select
								value={selectedPatientId}
								onValueChange={setSelectedPatientId}
							>
								<SelectTrigger>
									<SelectValue placeholder='Bemorni tanlang' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>Barcha bemorlar</SelectItem>
									{uniquePatients.map(patient => (
										<SelectItem key={patient._id} value={patient._id}>
											{patient.fullname} - {patient.patient_id}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Daily Checkups List */}
			<Card>
				<CardHeader>
					<CardTitle>Kunlik Ko'riklar Ro'yxati</CardTitle>
				</CardHeader>
				<CardContent>
					{dailyCheckups.length === 0 ? (
						<div className='py-12 text-center text-muted-foreground'>
							<Calendar className='mx-auto mb-4 h-12 w-12 opacity-50' />
							<p>Hozircha kunlik ko'riklar yo'q</p>
						</div>
					) : (
						<div className='space-y-6'>
							{dailyCheckups.map(checkup => (
								<Card key={checkup._id} className='overflow-hidden'>
									<CardHeader className='bg-muted/50'>
										<div className='flex items-center justify-between'>
											<div>
												<h3 className='font-semibold'>
													{checkup.patient_id.fullname}
												</h3>
												<p className='text-sm text-muted-foreground'>
													ID: {checkup.patient_id.patient_id} | Shifokor:{' '}
													{checkup.doctor_id.fullname}
												</p>
											</div>
											<div className='flex gap-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => {
														setSelectedCheckupId(checkup._id)
														setIsAddEntryDialogOpen(true)
													}}
												>
													<Plus className='mr-1 h-4 w-4' />
													Yozuv Qo'shish
												</Button>
												<Button
													variant='destructive'
													size='sm'
													onClick={() => {
														setSelectedCheckupId(checkup._id)
														setSelectedEntryId('')
														setDeleteType('checkup')
														setIsDeleteDialogOpen(true)
													}}
												>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</div>
									</CardHeader>
									<CardContent className='pt-6'>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Sana</TableHead>
													<TableHead>Qon Bosimi</TableHead>
													<TableHead>Eslatmalar</TableHead>
													<TableHead className='text-right'>Amallar</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{checkup.entries.map(entry => (
													<TableRow key={entry._id}>
														<TableCell>
															{format(
																new Date(entry.date),
																'dd.MM.yyyy, HH:mm'
															)}
														</TableCell>
														<TableCell>
															{entry.blood_pressure.systolic}/
															{entry.blood_pressure.diastolic} mmHg
														</TableCell>
														<TableCell className='max-w-md'>
															{entry.notes || '-'}
														</TableCell>
														<TableCell className='text-right'>
															<Button
																variant='ghost'
																size='sm'
																onClick={() => {
																	setSelectedCheckupId(checkup._id)
																	setSelectedEntryId(entry._id || '')
																	setDeleteType('entry')
																	setIsDeleteDialogOpen(true)
																}}
															>
																<Trash2 className='h-4 w-4 text-destructive' />
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create Daily Checkup Dialog */}
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle>Yangi Kunlik Ko'rik Yaratish</DialogTitle>
						<DialogDescription>
							Bemor uchun yangi kunlik ko'rik yarating
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div>
							<Label>Bemor</Label>
							<Select
								value={
									createForm.examination_id
										? dailyCheckups.find(
												c => c.examination_id._id === createForm.examination_id
										  )?.patient_id._id || ''
										: ''
								}
								onValueChange={patientId => {
									setCreateForm(prev => ({
										...prev,
										examination_id: '',
									}))
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder='Bemorni tanlang' />
								</SelectTrigger>
								<SelectContent>
									{uniquePatients.map(patient => (
										<SelectItem key={patient._id} value={patient._id}>
											{patient.fullname} - {patient.patient_id}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Ko'rik (Examination ID)</Label>
							<Input
								placeholder='Examination ID ni kiriting'
								value={createForm.examination_id}
								onChange={e =>
									setCreateForm(prev => ({
										...prev,
										examination_id: e.target.value,
									}))
								}
							/>
							<p className='mt-1 text-xs text-muted-foreground'>
								Bemorning mavjud examination ID sini kiriting
							</p>
						</div>
						<div>
							<Label>Sana</Label>
							<Input
								type='date'
								value={createForm.date}
								onChange={e =>
									setCreateForm(prev => ({ ...prev, date: e.target.value }))
								}
							/>
						</div>
						{/* <div>
							<Label>Soat</Label>
							<Input
								type='time'
								value={createForm.time}
								onChange={e =>
									setCreateForm(prev => ({ ...prev, time: e.target.value }))
								}
							/>
						</div>{' '} */}
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label>Sistolik bosim (mmHg)</Label>
								<Input
									type='number'
									placeholder='120'
									value={createForm.systolic}
									onChange={e =>
										setCreateForm(prev => ({
											...prev,
											systolic: e.target.value,
										}))
									}
								/>
							</div>
							<div>
								<Label>Diastolik bosim (mmHg)</Label>
								<Input
									type='number'
									placeholder='80'
									value={createForm.diastolic}
									onChange={e =>
										setCreateForm(prev => ({
											...prev,
											diastolic: e.target.value,
										}))
									}
								/>
							</div>
						</div>
						<div>
							<Label>Eslatmalar</Label>
							<Textarea
								placeholder="Qo'shimcha eslatmalar..."
								value={createForm.notes}
								onChange={e =>
									setCreateForm(prev => ({ ...prev, notes: e.target.value }))
								}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setIsCreateDialogOpen(false)}
							disabled={isCreating}
						>
							Bekor qilish
						</Button>
						<Button onClick={handleCreateDailyCheckup} disabled={isCreating}>
							{isCreating ? 'Yaratilmoqda...' : 'Yaratish'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Add Entry Dialog */}
			<Dialog
				open={isAddEntryDialogOpen}
				onOpenChange={setIsAddEntryDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Yangi Yozuv Qo'shish</DialogTitle>
						<DialogDescription>
							Kunlik ko'rikka yangi yozuv qo'shing
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div>
							<Label>Sana</Label>
							<Input
								type='date'
								value={addEntryForm.date}
								onChange={e =>
									setAddEntryForm(prev => ({
										...prev,
										date: e.target.value,
									}))
								}
							/>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label>Sistolik bosim (mmHg)</Label>
								<Input
									type='number'
									placeholder='120'
									value={addEntryForm.systolic}
									onChange={e =>
										setAddEntryForm(prev => ({
											...prev,
											systolic: e.target.value,
										}))
									}
								/>
							</div>
							<div>
								<Label>Diastolik bosim (mmHg)</Label>
								<Input
									type='number'
									placeholder='80'
									value={addEntryForm.diastolic}
									onChange={e =>
										setAddEntryForm(prev => ({
											...prev,
											diastolic: e.target.value,
										}))
									}
								/>
							</div>
						</div>
						<div>
							<Label>Eslatmalar</Label>
							<Textarea
								placeholder="Qo'shimcha eslatmalar..."
								value={addEntryForm.notes}
								onChange={e =>
									setAddEntryForm(prev => ({
										...prev,
										notes: e.target.value,
									}))
								}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setIsAddEntryDialogOpen(false)}
							disabled={isAddingEntry}
						>
							Bekor qilish
						</Button>
						<Button onClick={handleAddEntry} disabled={isAddingEntry}>
							{isAddingEntry ? "Qo'shilmoqda..." : "Qo'shish"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Ishonchingiz komilmi?</AlertDialogTitle>
						<AlertDialogDescription>
							{deleteType === 'entry'
								? "Bu yozuvni o'chirmoqchimisiz? Bu amalni bekor qilish mumkin emas."
								: "Bu kunlik ko'rik va uning barcha yozuvlarini o'chirmoqchimisiz? Bu amalni bekor qilish mumkin emas."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>
							Bekor qilish
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
							{isDeleting ? "O'chirilmoqda..." : "O'chirish"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}

export default DailyCheckup
