import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useDateLocale } from '@/hooks/useDateLocale'
import { CalendarIcon, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Room {
	_id: string
	room_name: string
}

interface Nurse {
	_id: string
	fullname: string
}

interface DailyCheckupFiltersProps {
	searchQuery: string
	setSearchQuery: (value: string) => void
	selectedDate: Date
	setSelectedDate: (date: Date) => void
	selectedRoomId: string
	setSelectedRoomId: (value: string) => void
	selectedNurseId: string
	setSelectedNurseId: (value: string) => void
	rooms: Room[]
	nurses: Nurse[]
	onClearFilters: () => void
}

export const DailyCheckupFilters = ({
	searchQuery,
	setSearchQuery,
	selectedDate,
	setSelectedDate,
	selectedRoomId,
	setSelectedRoomId,
	selectedNurseId,
	setSelectedNurseId,
	rooms,
	nurses,
	onClearFilters,
}: DailyCheckupFiltersProps) => {
	const { t } = useTranslation('inpatient')
	const dateLocale = useDateLocale()
	const goToPreviousDay = () => {
		const newDate = new Date(selectedDate)
		newDate.setDate(newDate.getDate() - 1)
		setSelectedDate(newDate)
	}

	const goToNextDay = () => {
		const today = new Date()
		const newDate = new Date(selectedDate)
		newDate.setDate(newDate.getDate() + 1)
		if (newDate <= today) {
			setSelectedDate(newDate)
		}
	}

	const isToday = selectedDate.toDateString() === new Date().toDateString()

	const hasActiveFilters =
		searchQuery ||
		selectedDate.toDateString() !== new Date().toDateString() ||
		selectedRoomId !== 'all' ||
		selectedNurseId !== 'all'

	return (
		<Card className="card-shadow">
			<CardHeader className="pb-3 sm:pb-4">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
					<h2 className="text-base sm:text-lg font-semibold">{t('dailyCheckup.filters')}</h2>
					<div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
						<Button 
							variant="outline" 
							size="icon" 
							onClick={goToPreviousDay}
							className="h-9 w-9 sm:h-10 sm:w-10"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className={cn(
										'flex-1 sm:flex-none sm:min-w-[180px] justify-start text-left font-normal h-9 sm:h-10 text-xs sm:text-sm',
										!selectedDate && 'text-muted-foreground'
									)}
								>
									<CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
									{selectedDate ? (
										format(selectedDate, 'PPP', { locale: dateLocale })
									) : (
										<span>{t('dailyCheckup.selectDate')}</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="center">
								<Calendar
									mode="single"
									selected={selectedDate}
									onSelect={date => setSelectedDate(date || new Date())}
									disabled={date => date > new Date()}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
						<Button 
							variant="outline" 
							size="icon" 
							onClick={goToNextDay} 
							disabled={isToday}
							className="h-9 w-9 sm:h-10 sm:w-10"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={onClearFilters} 
							disabled={!hasActiveFilters}
							className="h-9 sm:h-10 text-xs sm:text-sm flex-1 sm:flex-none"
						>
							<X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
							{t('dailyCheckup.clear')}
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
				{/* Search and filters */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
					{/* Search - full width on mobile, half on desktop */}
					<div className="w-full">
						<Label className="text-xs text-muted-foreground mb-2 block">{t('dailyCheckup.search')}</Label>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder={t('dailyCheckup.searchPlaceholder')}
								className="pl-10 h-10 sm:h-11 text-sm"
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					{/* Room and Nurse - stacked on mobile, side by side on larger screens */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						{/* Room Filter */}
						<div className="w-full">
							<Label className="text-xs text-muted-foreground mb-2 block">{t('dailyCheckup.room')}</Label>
							<Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
								<SelectTrigger className="h-10 sm:h-11 text-sm">
									<SelectValue placeholder={t('dailyCheckup.allRooms')} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t('dailyCheckup.all')}</SelectItem>
									{rooms.map(room => (
										<SelectItem key={room._id} value={room._id}>
											{room.room_name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Nurse Filter */}
						<div className="w-full">
							<Label className="text-xs text-muted-foreground mb-2 block">{t('dailyCheckup.nurse')}</Label>
							<Select value={selectedNurseId} onValueChange={setSelectedNurseId}>
								<SelectTrigger className="h-10 sm:h-11 text-sm">
									<SelectValue placeholder={t('dailyCheckup.allNurses')} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t('dailyCheckup.all')}</SelectItem>
									{nurses.map(nurse => (
										<SelectItem key={nurse._id} value={nurse._id}>
											{nurse.fullname}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
