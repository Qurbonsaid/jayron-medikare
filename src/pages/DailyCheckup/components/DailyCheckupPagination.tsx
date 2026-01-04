import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DailyCheckupPaginationProps {
	currentPage: number
	totalPages: number
	itemsPerPage: number
	totalItems: number
	onPageChange: (page: number) => void
	onItemsPerPageChange: (value: number) => void
}

export const DailyCheckupPagination = ({
	currentPage,
	totalPages,
	itemsPerPage,
	totalItems,
	onPageChange,
	onItemsPerPageChange,
}: DailyCheckupPaginationProps) => {
	const { t } = useTranslation('inpatient')
	if (totalPages <= 1) return null

	const startIndex = (currentPage - 1) * itemsPerPage
	const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

	// Generate page numbers with ellipsis
	const getPageNumbers = () => {
		const pages: (number | string)[] = []
		const showPages = new Set<number>()

		// Always show first page
		showPages.add(1)

		// Always show last page
		if (totalPages > 1) {
			showPages.add(totalPages)
		}

		// Show current page and neighbors
		for (
			let i = Math.max(2, currentPage - 1);
			i <= Math.min(totalPages - 1, currentPage + 1);
			i++
		) {
			showPages.add(i)
		}

		const sortedPages = Array.from(showPages).sort((a, b) => a - b)

		sortedPages.forEach((page, index) => {
			// Add ellipsis if there's a gap
			if (index > 0) {
				const prevPage = sortedPages[index - 1]
				if (page - prevPage > 1) {
					pages.push('...')
				}
			}
			pages.push(page)
		})

		return pages
	}

	return (
		<div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
			<div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
				<p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
					{startIndex + 1}-{endIndex} / {totalItems}
				</p>
				<Select
					value={itemsPerPage.toString()}
					onValueChange={value => onItemsPerPageChange(Number(value))}
				>
					<SelectTrigger className="w-24 sm:w-32 h-8 sm:h-9 text-xs sm:text-sm">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="10">10 {t('dailyCheckup.items')}</SelectItem>
						<SelectItem value="20">20 {t('dailyCheckup.items')}</SelectItem>
						<SelectItem value="50">50 {t('dailyCheckup.items')}</SelectItem>
						<SelectItem value="100">100 {t('dailyCheckup.items')}</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="flex items-center gap-1 sm:gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="h-8 sm:h-9 px-2 sm:px-3"
				>
					<ChevronLeft className="w-4 h-4" />
					<span className="hidden sm:inline ml-1">{t('dailyCheckup.previous')}</span>
				</Button>
				<div className="flex items-center gap-1">
					{getPageNumbers().map((page, index) => {
						if (page === '...') {
							return (
								<span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
									...
								</span>
							)
						}
						return (
							<Button
								key={page}
								variant={currentPage === page ? 'default' : 'outline'}
								size="sm"
								onClick={() => onPageChange(page as number)}
								className="h-8 sm:h-9 w-8 sm:w-10 p-0 text-xs sm:text-sm"
							>
								{page}
							</Button>
						)
					})}
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="h-8 sm:h-9 px-2 sm:px-3"
				>
					<span className="hidden sm:inline mr-1">{t('dailyCheckup.next')}</span>
					<ChevronRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	)
}
