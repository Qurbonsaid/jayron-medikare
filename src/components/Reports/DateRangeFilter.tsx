import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

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
	const { t } = useTranslation('reports')

	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className='h-9 text-xs sm:text-sm'>
				<SelectValue placeholder={t('selectPeriod')} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={REPORT_DATE_FILTER.DAILY}>{t('daily')}</SelectItem>
				<SelectItem value={REPORT_DATE_FILTER.THIS_WEEK}>{t('weekly')}</SelectItem>
				<SelectItem value={REPORT_DATE_FILTER.THIS_MONTH}>{t('monthly')}</SelectItem>
				<SelectItem value={REPORT_DATE_FILTER.QUARTERLY}>{t('quarterly')}</SelectItem>
				<SelectItem value={REPORT_DATE_FILTER.THIS_YEAR}>{t('yearly')}</SelectItem>
			</SelectContent>
		</Select>
	)
}
