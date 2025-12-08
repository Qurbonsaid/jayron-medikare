import {
	useAddEntryDailyCheckupMutation,
	useCreateDailyCheckupMutation,
	useGetAlldailyCheckupQuery,
} from '@/app/api/dailyCheckup/dailyCheckupApi'
import { useGetAllExamsQuery } from '@/app/api/examinationApi/examinationApi'
import { useGetAllPrescriptionsQuery } from '@/app/api/prescription/prescriptionApi'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface MeasureBloodPressureProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	patient_id: string | null
	examination_id: string | null
}

export const MeasureBloodPressure = ({
	open,
	onOpenChange,
	patient_id,
	examination_id: propExaminationId,
}: MeasureBloodPressureProps) => {
	const [systolic, setSystolic] = useState('')
	const [diastolic, setDiastolic] = useState('')
	const [notes, setNotes] = useState('')
	const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

	const { data: dailyCheckups, refetch } = useGetAlldailyCheckupQuery()
	const { data: examinations, isLoading: isLoadingExam } = useGetAllExamsQuery(
		{ patient_id: patient_id || '' },
		{ skip: !patient_id }
	)
	const { data: prescriptions } = useGetAllPrescriptionsQuery({
		page: 1,
		limit: 100,
	} as any)

	const [createDailyCheckup, { isLoading: isCreating }] =
		useCreateDailyCheckupMutation()
	const [addEntry, { isLoading: isAdding }] = useAddEntryDailyCheckupMutation()

	// Get examination_id from the patient's active examination
	const examination_id =
		propExaminationId ||
		(examinations?.data && examinations.data.length > 0
			? examinations.data[0]._id
			: null)

	useEffect(() => {
		if (open && patient_id) {
			console.log('Patient ID:', patient_id)
			console.log('Examinations data:', examinations)
			console.log('Examination ID:', examination_id)
			console.log('Prescriptions data:', prescriptions)
		}
	}, [open, patient_id, examinations, examination_id, prescriptions])

	useEffect(() => {
		if (open) {
			// Reset form when modal opens
			setSystolic('')
			setDiastolic('')
			setNotes('')
			setDate(format(new Date(), 'yyyy-MM-dd'))
		}
	}, [open])

	const findTodayDailyCheckup = () => {
		if (!dailyCheckups?.data || !patient_id) return null

		const today = format(new Date(), 'yyyy-MM-dd')

		return dailyCheckups.data.find(checkup => {
			const checkupPatientId =
				typeof checkup.patient_id === 'string'
					? checkup.patient_id
					: checkup.patient_id._id

			// Check if patient matches
			if (checkupPatientId === patient_id) {
				// Check if there's already an entry for today
				const hasEntryToday = checkup.entries.some(entry => {
					const entryDate = format(new Date(entry.date), 'yyyy-MM-dd')
					return entryDate === today
				})
				// Return this checkup if it's for today or if it's the most recent one
				return !hasEntryToday
			}
			return false
		})
	}

	const handleSubmit = async () => {
		// Validation
		if (!systolic || !diastolic) {
			toast.error('Систолик ва диастолик қийматларни киритинг')
			return
		}

		if (!patient_id) {
			toast.error('Бемор маълумотлари топилмади')
			return
		}

		const systolicNum = parseInt(systolic)
		const diastolicNum = parseInt(diastolic)

		if (
			isNaN(systolicNum) ||
			isNaN(diastolicNum) ||
			systolicNum <= 0 ||
			diastolicNum <= 0
		) {
			toast.error('Қон босими қийматлари нотўғри')
			return
		}

		try {
			const entryData = {
				date: new Date(date).toISOString(),
				blood_pressure: {
					systolic: systolicNum,
					diastolic: diastolicNum,
				},
				notes: notes.trim(),
			}

			const existingCheckup = findTodayDailyCheckup()

			if (existingCheckup) {
				// Add entry to existing daily checkup
				await addEntry({
					id: existingCheckup._id,
					body: entryData,
				}).unwrap()

				toast.success('Қон босими маълумотлари қўшилди')
			} else {
				// Create new daily checkup with first entry
				if (!examination_id) {
					console.error('Examination ID not found:', {
						patient_id,
						examinations,
						propExaminationId,
					})
					toast.error(
						'Кўрик маълумотлари топилмади. Илтимос, аввал беморга кўрик яратинг.'
					)
					return
				}

				await createDailyCheckup({
					...entryData,
					examination_id,
				}).unwrap()

				toast.success('Кунлик текширув яратилди ва қон босими қўшилди')
			}

			refetch()
			onOpenChange(false)
		} catch (error: unknown) {
			console.error('Error saving blood pressure:', error)
			const errorMessage =
				error &&
				typeof error === 'object' &&
				'data' in error &&
				error.data &&
				typeof error.data === 'object' &&
				'message' in error.data
					? String(error.data.message)
					: 'Хатолик юз берди. Қайта уриниб кўринг'
			toast.error(errorMessage)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader className='p-4 sm:p-6 pb-0'>
					<DialogTitle className='text-xl sm:text-2xl'>
						Қон босимини ўлчаш
					</DialogTitle>
				</DialogHeader>

				<div className='p-4 sm:p-6 space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='systolic'>Систолик (мм рт.ст.)</Label>
							<Input
								id='systolic'
								type='number'
								placeholder='120'
								value={systolic}
								onChange={e => setSystolic(e.target.value)}
								min='1'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='diastolic'>Диастолик (мм рт.ст.)</Label>
							<Input
								id='diastolic'
								type='number'
								placeholder='80'
								value={diastolic}
								onChange={e => setDiastolic(e.target.value)}
								min='1'
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='date'>Сана</Label>
						<Input
							id='date'
							type='date'
							value={date}
							onChange={e => setDate(e.target.value)}
							max={format(new Date(), 'yyyy-MM-dd')}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='notes'>Изоҳ (ихтиёрий)</Label>
						<Textarea
							id='notes'
							placeholder='Қўшимча маълумот киритинг...'
							value={notes}
							onChange={e => setNotes(e.target.value)}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter className='p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-0'>
					<Button
						type='button'
						variant='outline'
						onClick={() => onOpenChange(false)}
						className='w-full sm:w-auto order-2 sm:order-1'
						disabled={isCreating || isAdding}
					>
						Бекор қилиш
					</Button>
					<Button
						type='submit'
						onClick={handleSubmit}
						disabled={isCreating || isAdding || isLoadingExam}
						className='gradient-primary w-full sm:w-auto order-1 sm:order-2'
					>
						{isCreating || isAdding
							? 'Сақланмоқда...'
							: isLoadingExam
							? 'Юкланмоқда...'
							: 'Сақлаш'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
