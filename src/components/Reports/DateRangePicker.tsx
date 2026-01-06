import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useDateLocale } from '@/hooks/useDateLocale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

interface DateRangePickerProps {
	dateRange: DateRange | undefined
	onDateRangeChange: (range: DateRange | undefined) => void
}

export const DateRangePicker = ({
	dateRange,
	onDateRangeChange,
}: DateRangePickerProps) => {
	const { t } = useTranslation('reports')
	const dateLocale = useDateLocale()
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className='flex flex-col gap-2'>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						className={cn(
							'w-full justify-start text-left font-normal',
							!dateRange && 'text-muted-foreground'
						)}
					>
						<CalendarIcon className='mr-2 h-4 w-4' />
						{dateRange?.from ? (
							dateRange.to ? (
								<>
									{format(dateRange.from, 'dd MMM yyyy', { locale: dateLocale })} -{' '}
									{format(dateRange.to, 'dd MMM yyyy', { locale: dateLocale })}
								</>
							) : (
								format(dateRange.from, 'dd MMM yyyy', { locale: dateLocale })
							)
						) : (
							<span>{t('selectDateRange')}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-auto p-0' align='start'>
					<Calendar
						initialFocus
						mode='range'
						defaultMonth={dateRange?.from}
						selected={dateRange}
						onSelect={onDateRangeChange}
						numberOfMonths={2}
						locale={dateLocale}
					/>
					<div className='flex gap-2 p-3 border-t'>
						<Button
							variant='outline'
							size='sm'
							className='flex-1'
							onClick={() => {
								onDateRangeChange(undefined)
								setIsOpen(false)
							}}
						>
							{t('clear')}
						</Button>
						<Button
							size='sm'
							className='flex-1'
							onClick={() => setIsOpen(false)}
						>
							{t('apply')}
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
