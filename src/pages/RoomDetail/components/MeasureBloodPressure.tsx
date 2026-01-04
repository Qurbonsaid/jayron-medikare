import {
	useCreateDailyCheckupMutation,
} from '@/app/api/dailyCheckup/dailyCheckupApi'
import { useMeQuery } from '@/app/api/authApi/authApi'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
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
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface MeasureBloodPressureProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	patient_id: string | null
	room_id: string | null
	refetch: () => void
}

export const MeasureBloodPressure = ({
	open,
	onOpenChange,
	patient_id,
	room_id,
	refetch,
}: MeasureBloodPressureProps) => {
	const { t } = useTranslation('inpatient')
	const [systolic, setSystolic] = useState('')
	const [diastolic, setDiastolic] = useState('')
	const [notes, setNotes] = useState('')

	const { data: currentUser } = useMeQuery()

	const [createDailyCheckup, { isLoading: isCreating }] =
		useCreateDailyCheckupMutation()

	useEffect(() => {
		if (open) {
			// Reset form when modal opens
			setSystolic('')
			setDiastolic('')
			setNotes('')
		}
	}, [open])

	const handleSubmit = async () => {
		// Validation
		if (!systolic || !diastolic) {
			toast.error(t('enterSystolicDiastolic'))
			return
		}

		if (!patient_id) {
			toast.error(t('patientDataNotFound'))
			return
		}

		if (!room_id) {
			toast.error(t('roomDataNotFound'))
			return
		}

		if (!currentUser?.data?._id) {
			toast.error(t('userDataNotFound'))
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
			toast.error(t('bloodPressureValuesInvalid'))
			return
		}

		try {
			// Swagger.json ga moslashtirish: patient_id, nurse_id, room_id, result
			const requestBody = {
				patient_id: patient_id,
				nurse_id: currentUser.data._id,
				room_id: room_id,
				result: {
					systolic: systolicNum,
					diastolic: diastolicNum,
				},
				notes: notes.trim() || undefined,
			}

			await createDailyCheckup(requestBody).unwrap()

			toast.success(t('bloodPressureSavedSuccess'))
			refetch() // Room ma'lumotlarini yangilash
			onOpenChange(false)
		} catch (error: unknown) {
			console.error('Error saving blood pressure:', error)
			const errorMessage =
				error &&
				typeof error === 'object' &&
				'data' in error &&
				error.data &&
				typeof error.data === 'object' &&
				'error' in error.data &&
				error.data.error &&
				typeof error.data.error === 'object' &&
				'msg' in error.data.error
					? String(error.data.error.msg)
					: t('errorOccurredTryAgain')
			toast.error(errorMessage)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader className='p-4 sm:p-6 pb-0'>
					<DialogTitle className='text-xl sm:text-2xl'>
						{t('measureBloodPressure')}
					</DialogTitle>
				</DialogHeader>

				<div className='p-4 sm:p-6 space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='systolic'>{t('systolicMmHg')}</Label>
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
							<Label htmlFor='diastolic'>{t('diastolicMmHg')}</Label>
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
					<Label htmlFor='notes'>{t('notesOptional')}</Label>
						<Textarea
							id='notes'
							placeholder={t('enterAdditionalInfo')}
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
						disabled={isCreating}
					>
						{t('cancel')}
					</Button>
					<Button
						type='submit'
						onClick={handleSubmit}
						disabled={isCreating}
						className='gradient-primary w-full sm:w-auto order-1 sm:order-2'
					>
						{isCreating ? t('saving') : t('save')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
