import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface StatisticsCardProps {
	title: string
	value: string | number
	icon: LucideIcon
	description?: string
	trend?: {
		value: number
		isPositive: boolean
	}
	variant?: 'default' | 'success' | 'warning' | 'danger'
}

export const StatisticsCard = ({
	title,
	value,
	icon: Icon,
	description,
	trend,
	variant = 'default',
}: StatisticsCardProps) => {
	const { t } = useTranslation('reports')
	const variantStyles = {
		default: 'bg-primary/10 text-primary',
		success:
			'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
		warning:
			'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
		danger: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
	}

	return (
		<Card className='p-4 sm:p-6 hover:shadow-lg transition-shadow'>
			<div className='flex items-start justify-between'>
				<div className='flex-1'>
					<p className='text-sm font-medium text-muted-foreground'>{title}</p>
					<p className='text-2xl sm:text-3xl font-bold mt-2'>{value}</p>
					{description && (
						<p className='text-xs text-muted-foreground mt-1'>{description}</p>
					)}
					{trend && (
						<div className='flex items-center gap-1 mt-2'>
							<span
								className={cn(
									'text-xs font-medium',
									trend.isPositive ? 'text-green-600' : 'text-red-600'
								)}
							>
								{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
							</span>
							<span className='text-xs text-muted-foreground'>{t('lastPeriod')}</span>
						</div>
					)}
				</div>
				<div className={cn('p-3 rounded-lg', variantStyles[variant])}>
					<Icon className='w-5 h-5 sm:w-6 sm:h-6' />
				</div>
			</div>
		</Card>
	)
}
