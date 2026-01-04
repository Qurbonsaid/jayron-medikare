import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckedPatientsTab } from './CheckedPatientsTab'
import { UncheckedPatientsTab } from './UncheckedPatientsTab'
import { Activity } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const DailyCheckup = () => {
	const { t } = useTranslation('inpatient')
	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

				{/* Tabs */}
				<Tabs defaultValue="checked" className="w-full">
					<TabsList className="grid w-full grid-cols-2 h-auto">
						<TabsTrigger 
							value="checked" 
							className="text-xs sm:text-sm py-2 sm:py-2.5"
						>
							{t('dailyCheckup.checked')}
						</TabsTrigger>
						<TabsTrigger 
							value="unchecked"
							className="text-xs sm:text-sm py-2 sm:py-2.5"
						>
							{t('dailyCheckup.unchecked')}
						</TabsTrigger>
					</TabsList>
					<TabsContent value="checked" className="mt-4 sm:mt-6">
						<CheckedPatientsTab />
					</TabsContent>
					<TabsContent value="unchecked" className="mt-4 sm:mt-6">
						<UncheckedPatientsTab />
					</TabsContent>
				</Tabs>
			</main>
		</div>
	)
}

export default DailyCheckup
