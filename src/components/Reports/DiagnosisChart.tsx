import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Activity } from 'lucide-react'
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts'

interface DiagnosisChartProps {
	data: {
		diagnosis_id: string
		diagnosis_name: string
		diagnosis_code: string
		diagnosis_description: string
		count: number
		percentage: number
	}[]
	isLoading: boolean
}

const COLORS = [
	'#3b82f6',
	'#10b981',
	'#f59e0b',
	'#ef4444',
	'#8b5cf6',
	'#ec4899',
	'#14b8a6',
	'#f97316',
]

export const DiagnosisChart = ({ data, isLoading }: DiagnosisChartProps) => {
	const chartData = data.map(item => ({
		name: `${item.diagnosis_name} (${item.diagnosis_code})`,
		value: item.count,
		percentage: item.percentage,
	}))

	if (isLoading) {
		return (
			<Card className='p-6 flex items-center justify-center h-[400px]'>
				<LoadingSpinner size='lg' />
			</Card>
		)
	}

	return (
		<Card className='p-4 sm:p-6'>
			<h3 className='text-base sm:text-lg font-semibold mb-4 flex items-center gap-2'>
				<Activity className='w-5 h-5 text-purple-600' />
				Ташхислар тақсимоти
			</h3>
			<ResponsiveContainer width='100%' height={350}>
				<PieChart>
					<Pie
						data={chartData}
						cx='50%'
						cy='50%'
						labelLine={false}
						label={({ name, percentage }) => `${percentage.toFixed(1)}%`}
						outerRadius={100}
						fill='#8884d8'
						dataKey='value'
					>
						{chartData.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={COLORS[index % COLORS.length]}
							/>
						))}
					</Pie>
					<Tooltip />
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		</Card>
	)
}
