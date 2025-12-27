import { useGetAlldailyCheckupQuery } from '@/app/api/dailyCheckup/dailyCheckupApi'
import { useGetRoomsFromRoomApiQuery } from '@/app/api/roomApi/roomApi'
import { useGetUsersQuery } from '@/app/api/userApi/userApi'
import { Card, CardContent } from '@/components/ui/card'
import { DailyCheckupFilters } from './components/DailyCheckupFilters'
import { DailyCheckupTable } from './components/DailyCheckupTable'
import { DailyCheckupPagination } from './components/DailyCheckupPagination'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

export const CheckedPatientsTab = () => {
	const { t } = useTranslation('inpatient')
	// State for filters
	const [searchQuery, setSearchQuery] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [selectedDate, setSelectedDate] = useState<Date>(new Date())
	const [selectedRoomId, setSelectedRoomId] = useState('all')
	const [selectedNurseId, setSelectedNurseId] = useState('all')

	// State for pagination
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(10)

	// Debounce search - optimized to 300ms
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery)
			setCurrentPage(1)
		}, 300)
		return () => clearTimeout(timer)
	}, [searchQuery])

	// Format date for API (YYYY-MM-DD format)
	const formattedDate = useMemo(() => {
		return format(selectedDate, 'yyyy-MM-dd')
	}, [selectedDate])

	// API queries - All filtering done on backend
	const { data: dailyCheckups, isLoading, isFetching } = useGetAlldailyCheckupQuery({
		page: currentPage,
		limit: itemsPerPage,
		doctor_id: selectedNurseId !== 'all' ? selectedNurseId : undefined,
		room_id: selectedRoomId !== 'all' ? selectedRoomId : undefined,
		search: debouncedSearch || undefined,
		current_date: formattedDate,
		examination_status: undefined,
	})

	const { data: roomsData } = useGetRoomsFromRoomApiQuery({
		page: 1,
		limit: 100,
		search: '',
	})

	const { data: nursesData } = useGetUsersQuery({
		page: 1,
		limit: 100,
		role: 'nurse',
	})

	// Memoized data
	const rooms = useMemo(() => roomsData?.data || [], [roomsData])
	const nurses = useMemo(() => nursesData?.data || [], [nursesData])
	const checkups = useMemo(() => dailyCheckups?.data || [], [dailyCheckups])
	
	// Handle both camelCase and snake_case pagination from backend
	const pagination = useMemo(() => {
		if (!dailyCheckups?.pagination) return null
		const p = dailyCheckups.pagination
		return {
			total: p.total || p.total_items || 0,
			page: p.page || currentPage,
			totalPages: p.totalPages || p.total_pages || 1,
		}
	}, [dailyCheckups, currentPage])

	// Clear filters
	const clearFilters = useCallback(() => {
		setSearchQuery('')
		setDebouncedSearch('')
		setSelectedDate(new Date())
		setSelectedRoomId('all')
		setSelectedNurseId('all')
		setCurrentPage(1)
	}, [])

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}, [])

	const handleItemsPerPageChange = useCallback((value: number) => {
		setItemsPerPage(value)
		setCurrentPage(1)
	}, [])

	const handleDateChange = useCallback((date: Date) => {
		setSelectedDate(date)
		setCurrentPage(1)
	}, [])

	const handleRoomChange = useCallback((value: string) => {
		setSelectedRoomId(value)
		setCurrentPage(1)
	}, [])

	const handleNurseChange = useCallback((value: string) => {
		setSelectedNurseId(value)
		setCurrentPage(1)
	}, [])

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Filters */}
			<DailyCheckupFilters
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				selectedDate={selectedDate}
				setSelectedDate={handleDateChange}
				selectedRoomId={selectedRoomId}
				setSelectedRoomId={handleRoomChange}
				selectedNurseId={selectedNurseId}
				setSelectedNurseId={handleNurseChange}
				rooms={rooms}
				nurses={nurses}
				onClearFilters={clearFilters}
			/>

			{/* Table Card */}
			<Card className="card-shadow">
				<CardContent className="p-0">
					{/* Stats */}
					{!isLoading && !isFetching && checkups.length > 0 && pagination && (
						<div className="p-4 border-b">
							<p className="text-sm text-muted-foreground">
								{t('dailyCheckup.total')}: <span className="font-semibold text-foreground">{pagination.total}</span> {t('dailyCheckup.records')}
							</p>
						</div>
					)}

					{/* Table */}
					<DailyCheckupTable 
						checkups={checkups} 
						rooms={rooms} 
						isLoading={isLoading || isFetching} 
					/>

					{/* Pagination */}
					{pagination && pagination.totalPages > 1 && (
						<DailyCheckupPagination
							currentPage={currentPage}
							totalPages={pagination.totalPages}
							itemsPerPage={itemsPerPage}
							totalItems={pagination.total}
							onPageChange={handlePageChange}
							onItemsPerPageChange={handleItemsPerPageChange}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
