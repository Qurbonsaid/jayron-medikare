import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	ArrowLeft,
	Plus,
	ZoomIn,
	ZoomOut,
	RotateCw,
	RotateCcw,
	Maximize2,
	Ruler,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface RadiologyOrder {
	orderId: string
	patientName: string
	modality: string
	bodyPart: string
	status: string
	scheduledDate: string
	diagnostika: string
}

const Radiology = () => {
	const { t } = useTranslation('radiology')
	const navigate = useNavigate()
	const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
	const [isViewerOpen, setIsViewerOpen] = useState(false)
	const [zoom, setZoom] = useState(100)
	const [brightness, setBrightness] = useState(50)
	const [contrast, setContrast] = useState(50)
	const [rotation, setRotation] = useState(0)

	const orders: RadiologyOrder[] = [
		{
			orderId: 'RAD-2025-001',
			patientName: 'Алиев Анвар Рашидович',
			modality: t('mri'),
			bodyPart: t('head'),
			status: t('ordered'),
			scheduledDate: '08.10.2025 10:00',
			diagnostika: 'Revmatizm',
		},
		{
			orderId: 'RAD-2025-002',
			patientName: 'Каримова Нилуфар Азизовна',
			modality: t('ct'),
			bodyPart: t('chest'),
			status: t('inProgress'),
			scheduledDate: '07.10.2025 14:30',
			diagnostika: 'Revmatizm',
		},
	]

	const getStatusBadge = (status: string) => {
		const colors: Record<string, string> = {
			[t('ordered')]: 'bg-blue-100 text-blue-700',
			[t('inProgress')]: 'bg-yellow-100 text-yellow-700',
			[t('completed')]: 'bg-green-100 text-green-700',
			[t('reported')]: 'bg-purple-100 text-purple-700',
		}
		return <Badge className={colors[status] || ''}>{status}</Badge>
	}

	const handleSubmitOrder = () => {
		toast.success(t('orderCreated'))
		setIsOrderModalOpen(false)
	}

	const handleResetView = () => {
		setZoom(100)
		setBrightness(50)
		setContrast(50)
		setRotation(0)
	}

	return (
		<div className='min-h-screen bg-background'>
			{/* Header */}
			<header className='bg-card border-b border-border sticky top-0 z-10'>
				<div className='w-full px-3 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
					<div className='flex items-center gap-3'>
						{/* <Button
							variant='ghost'
							size='icon'
							onClick={() => navigate('/patients')}
						>
							<ArrowLeft className='w-5 h-5' />
						</Button> */}
						<div>
							<h1 className='text-lg sm:text-xl font-bold'>
								{t('title')}
							</h1>
							<p className='text-xs sm:text-sm text-muted-foreground'>
								{t('subtitle')}
							</p>
						</div>
					</div>
					<Button
						onClick={() => setIsOrderModalOpen(true)}
						className='w-full sm:w-auto'
					>
						<Plus className='w-4 h-4 mr-2' /> {t('newOrder')}
					</Button>
				</div>
			</header>

			{/* Main Content */}
			<main className='w-full px-3 sm:px-6 py-4 sm:py-6'>
				{/* Mobile Card View */}
				<div className='block lg:hidden space-y-3'>
					{orders.map(order => (
						<Card key={order.orderId} className='p-4 shadow-sm'>
							<div className='flex justify-between items-start mb-2'>
								<span className='text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded'>
									{order.orderId}
								</span>
								{getStatusBadge(order.status)}
							</div>
							<h3 className='font-semibold text-base'>{order.patientName}</h3>
							<p className='text-sm text-muted-foreground mb-1'>
								{order.modality} • {order.bodyPart}
							</p>
							<p className='text-xs text-muted-foreground mb-1'>
								{order.diagnostika}
							</p>
							<p className='text-xs text-muted-foreground mb-3'>
								{order.scheduledDate}
							</p>
							<Button
								size='sm'
								className='w-full'
								onClick={() => setIsViewerOpen(true)}
							>
								{t('viewReport')}
							</Button>
						</Card>
					))}
				</div>

				{/* Desktop Table View */}
				<Card className='hidden lg:block'>
					<div className='p-6'>
						<h2 className='text-xl font-semibold mb-4'>{t('noOrders') ? t('title') : t('title')}</h2>
						<table className='w-full text-sm'>
							<thead className='bg-muted/50'>
								<tr>
									<th className='px-4 py-2 text-left'>{t('orderNumber')}</th>
									<th className='px-4 py-2 text-left'>{t('patient')}</th>
									<th className='px-4 py-2 text-left'>{t('modality')}</th>
									<th className='px-4 py-2 text-left'>{t('indication')}</th>
									<th className='px-4 py-2 text-left'>{t('bodyPart')}</th>
									<th className='px-4 py-2 text-left'>{t('status')}</th>
									<th className='px-4 py-2 text-left'>{t('scheduledDate')}</th>
									<th className='px-4 py-2 text-left'></th>
								</tr>
							</thead>
							<tbody>
								{orders.map(order => (
									<tr
										key={order.orderId}
										className='border-b hover:bg-muted/50'
									>
										<td className='px-4 py-2'>{order.orderId}</td>
										<td className='px-4 py-2'>{order.patientName}</td>
										<td className='px-4 py-2'>
											<Badge variant='outline'>{order.modality}</Badge>
										</td>
										<td className='px-4 py-2'>{order.diagnostika}</td>
										<td className='px-4 py-2'>{order.bodyPart}</td>
										<td className='px-4 py-2'>
											{getStatusBadge(order.status)}
										</td>
										<td className='px-4 py-2'>{order.scheduledDate}</td>
										<td className='px-4 py-2'>
											<Button size='sm' onClick={() => setIsViewerOpen(true)}>
												{t('viewReport')}
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			</main>

			{/* New Order Modal */}
			<Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
				<DialogContent className='w-[95%] h-auto sm:max-w-2xl overflow-y-auto rounded-lg'>
					<DialogHeader>
						<DialogTitle className='text-lg sm:text-xl'>
							{t('newOrderModal.title')}
						</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						<div>
							<Label>{t('newOrderModal.selectPatient')}</Label>
							<Select>
								<SelectTrigger>
									<SelectValue placeholder={t('newOrderModal.selectPatientPlaceholder')} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='p1'>Алиев Анвар</SelectItem>
									<SelectItem value='p2'>Каримова Нилуфар</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<div>
								<Label>{t('modality')}</Label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder={t('newOrderModal.selectPlaceholder')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='mri'>{t('modalities.mri')}</SelectItem>
										<SelectItem value='ct'>{t('modalities.ct')}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>{t('bodyPart')}</Label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder={t('newOrderModal.selectPlaceholder')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='brain'>{t('bodyParts.brain')}</SelectItem>
										<SelectItem value='chest'>{t('bodyParts.chest')}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div>
							<Label>{t('newOrderModal.clinicalIndication')}</Label>
							<Textarea rows={3} placeholder={t('newOrderModal.indicationPlaceholder')} />
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<Label>{t('newOrderModal.priority')}</Label>
								<Select defaultValue='normal'>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='normal'>{t('priorities.normal')}</SelectItem>
										<SelectItem value='urgent'>{t('priorities.urgent')}</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label>{t('scheduledDate')}</Label>
								<Input type='datetime-local' />
							</div>
						</div>
						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => setIsOrderModalOpen(false)}
							>
								{t('cancel')}
							</Button>
							<Button onClick={handleSubmitOrder}>{t('submit')}</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>


			<Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
				<DialogContent className='w-[95%] h-[90%] sm:max-w-6xl sm:max-h-[95vh] overflow-y-auto rounded-lg p-3 sm:p-6'>
					<DialogHeader>
						<DialogTitle className='text-lg sm:text-xl'>
							{t('modalities.mri')} - {t('bodyParts.brain')} | Алиев Анвар
						</DialogTitle>
					</DialogHeader>

					<div className='flex flex-col md:grid md:grid-cols-12 gap-4 h-full'>
						{/* LEFT THUMBNAILS (scroll faqat desktopda) */}
						<div className='md:col-span-2 bg-muted/20 p-2 rounded-lg grid grid-cols-4 md:grid-cols-1 gap-2 order-2 md:order-1 md:overflow-y-auto md:max-h-[80vh]'>
							{[1, 2, 3, 4, 5, 6].map(i => (
								<div
									key={i}
									className='aspect-square bg-gray-700 rounded flex items-center justify-center text-white text-xs'
								>
									{t('viewer.slice')} {i}
								</div>
							))}
						</div>

						{/* CENTER VIEWER (hech qachon scroll bo‘lmaydi) */}
						<div className='md:col-span-7 bg-black rounded-lg relative flex flex-col items-center justify-center order-1 md:order-2 min-h-[200px] overflow-hidden'>
							<div
								style={{
									transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
									filter: `brightness(${brightness}%) contrast(${contrast}%)`,
									transition: 'all 0.2s',
								}}
								className='flex items-center justify-center my-4'
							>
								<div className='w-60 h-60 sm:w-96 sm:h-96 bg-gray-800 rounded-lg flex items-center justify-center text-white'>
									🧠
								</div>
							</div>

							{/* Controls */}
							<div className='bg-black/80 rounded-lg p-2 flex flex-wrap justify-center gap-2 mt-3'>
								<Button
									size='icon'
									variant='ghost'
									className='text-white'
									onClick={() => setZoom(Math.max(50, zoom - 10))}
								>
									<ZoomOut className='w-4 h-4' />
								</Button>
								<span className='text-xs sm:text-sm text-white'>{zoom}%</span>
								<Button
									size='icon'
									variant='ghost'
									className='text-white'
									onClick={() => setZoom(Math.min(200, zoom + 10))}
								>
									<ZoomIn className='w-4 h-4' />
								</Button>
								<Button
									size='icon'
									variant='ghost'
									className='text-white'
									onClick={() => setRotation(rotation - 90)}
								>
									<RotateCcw className='w-4 h-4' />
								</Button>
								<Button
									size='icon'
									variant='ghost'
									className='text-white'
									onClick={() => setRotation(rotation + 90)}
								>
									<RotateCw className='w-4 h-4' />
								</Button>
								<Button
									size='sm'
									variant='ghost'
									className='text-white'
									onClick={handleResetView}
								>
									{t('viewer.reset')}
								</Button>
							</div>
						</div>

						{/* RIGHT INFO (scroll faqat desktopda) */}
						<div
							className='
    md:col-span-3 
    space-y-3 
    order-3 
    md:order-3 
    md:overflow-y-auto 
    md:max-h-[80vh]
    w-full
    md:w-auto
    px-1 sm:px-0
  '
						>
							<Card className='p-3 sm:p-4'>
								<h3 className='font-semibold mb-3'>{t('viewer.examInfo')}</h3>
								<div className='space-y-2 text-sm'>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>{t('viewer.date')}:</span>
										<span className='font-medium'>07.10.2025</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>{t('modality')}:</span>
										<span className='font-medium'>{t('modalities.mri')}</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>{t('viewer.protocol')}:</span>
										<span className='font-medium'>T1, T2, FLAIR</span>
									</div>
								</div>
							</Card>

							<Card className='p-3 sm:p-4'>
								<h3 className='font-semibold mb-3'>{t('viewer.radiologistConclusion')}</h3>
								<div className='mb-3'>
									<Label className='text-xs'>{t('viewer.template')}</Label>
									<Select>
										<SelectTrigger className='h-8 text-sm'>
											<SelectValue placeholder={t('newOrderModal.selectPlaceholder')} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='normal'>{t('templates.normal')}</SelectItem>
											<SelectItem value='stroke'>{t('templates.stroke')}</SelectItem>
											<SelectItem value='tumor'>{t('templates.tumor')}</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<Textarea
									placeholder={t('viewer.conclusionPlaceholder')}
									rows={8}
									className='text-sm'
								/>
								<Button className='w-full mt-3' size='sm'>
									{t('viewer.submitConclusion')}
								</Button>
							</Card>

							<Card className='p-3 sm:p-4'>
								<div className='space-y-3'>
									<div>
										<Label className='text-xs'>{t('viewer.brightness')}: {brightness}%</Label>
										<input
											type='range'
											min='0'
											max='100'
											value={brightness}
											onChange={e => setBrightness(parseInt(e.target.value))}
											className='w-full'
										/>
									</div>
									<div>
										<Label className='text-xs'>{t('viewer.contrast')}: {contrast}%</Label>
										<input
											type='range'
											min='0'
											max='100'
											value={contrast}
											onChange={e => setContrast(parseInt(e.target.value))}
											className='w-full'
										/>
									</div>
								</div>
							</Card>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default Radiology
