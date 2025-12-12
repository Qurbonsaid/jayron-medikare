import {
	useGetOneDailyCheckupQuery,
	useUpdateDailyCheckupMutation,
} from '@/app/api/dailyCheckup/dailyCheckupApi'
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
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface UpdateBloodPressureProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	dailyCheckupId: string | null
	refetch: () => void
}

const UpdateBloodPressure = ({
	open,
	onOpenChange,
	dailyCheckupId,
	refetch,
}: UpdateBloodPressureProps) => {
	const [systolic, setSystolic] = useState('')
	const [diastolic, setDiastolic] = useState('')
	const [notes, setNotes] = useState('')

	const { data: dailyCheckup, isLoading: isLoadingCheckup } =
		useGetOneDailyCheckupQuery(dailyCheckupId || '', {
			skip: !dailyCheckupId,
		})

	const [updateDailyCheckup, { isLoading: isUpdating }] =
		useUpdateDailyCheckupMutation()

	useEffect(() => {
		if (open && dailyCheckup?.data) {
			// Ma'lumotlarni formaga yuklash
			const result = dailyCheckup.data.result
			if (result) {
				setSystolic(result.systolic?.toString() || '')
				setDiastolic(result.diastolic?.toString() || '')
			}
			setNotes(dailyCheckup.data.notes || '')
		}
	}, [open, dailyCheckup])

	const handleSubmit = async () => {
		// Validation
		if (!systolic || !diastolic) {
			toast.error('Систолик ва диастолик қийматларни киритинг')
			return
		}

		if (!dailyCheckupId) {
			toast.error('Қон босими маълумотлари топилмади')
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
			const requestBody = {
				result: {
					systolic: systolicNum,
					diastolic: diastolicNum,
				},
				notes: notes.trim() || undefined,
			}

		await updateDailyCheckup({
			id: dailyCheckupId,
			body: requestBody,
		}).unwrap()

		toast.success('Қон босими муваффақиятли янгиланди')
		refetch() // Room ma'lumotlarini yangilash
		onOpenChange(false)
		} catch (error: unknown) {
			console.error('Error updating blood pressure:', error)
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
					: 'Хатолик юз берди. Қайта уриниб кўринг'
			toast.error(errorMessage)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader className='p-4 sm:p-6 pb-0'>
					<DialogTitle className='text-xl sm:text-2xl'>
						Қон босимини ўзгартириш
					</DialogTitle>
				</DialogHeader>

				<div className='p-4 sm:p-6 space-y-4'>
					{isLoadingCheckup ? (
						<div className='text-center py-4'>Юкланмоқда...</div>
					) : (
						<>
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
								<Label htmlFor='notes'>Изоҳ (ихтиёрий)</Label>
								<Textarea
									id='notes'
									placeholder='Қўшимча маълумот киритинг...'
									value={notes}
									onChange={e => setNotes(e.target.value)}
									rows={3}
								/>
							</div>
						</>
					)}
				</div>

				<DialogFooter className='p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-0'>
					<Button
						type='button'
						variant='outline'
						onClick={() => onOpenChange(false)}
						className='w-full sm:w-auto order-2 sm:order-1'
						disabled={isUpdating}
					>
						Бекор қилиш
					</Button>
					<Button
						type='submit'
						onClick={handleSubmit}
						disabled={isUpdating || isLoadingCheckup}
						className='gradient-primary w-full sm:w-auto order-1 sm:order-2'
					>
						{isUpdating ? 'Сақланмоқда...' : 'Сақлаш'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default UpdateBloodPressure
