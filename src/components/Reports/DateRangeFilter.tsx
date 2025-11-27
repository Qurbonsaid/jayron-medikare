import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

export enum REPORT_DATE_FILTER {
	DAILY = 'daily',
	THIS_WEEK = 'weekly',
	THIS_MONTH = 'monthly',
	QUARTERLY = 'quarterly',
	THIS_YEAR = 'yearly',
}

interface DateRangeFilterProps {
	value: REPORT_DATE_FILTER
	onChange: (value: REPORT_DATE_FILTER) => void
}

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className='h-9 text-xs sm:text-sm'>
				<SelectValue placeholder='Давр танланг' />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={REPORT_DATE_FILTER.DAILY}>Кунлик</SelectItem>
				<SelectItem value={REPORT_DATE_FILTER.THIS_WEEK}>Ҳафталик</SelectItem>
				<SelectItem value={REPORT_DATE_FILTER.THIS_MONTH}>Ойлик</SelectItem>
				<SelectItem value={REPORT_DATE_FILTER.QUARTERLY}>Чоракли</SelectItem>
				<SelectItem value={REPORT_DATE_FILTER.THIS_YEAR}>Йиллик</SelectItem>
			</SelectContent>
		</Select>
	)
}
