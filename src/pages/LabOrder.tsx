import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { FileText, Printer, Send } from 'lucide-react'

interface Test {
	id: string
	name: string
	code: string
	selected: boolean
}

const LabOrder = () => {
	const [priority, setPriority] = useState('normal')
	const [barcode, setBarcode] = useState('')
	const [tests, setTests] = useState<Test[]>([
		{ id: '1', name: 'Умумий қон таҳлили', code: 'CBC', selected: false },
		{ id: '2', name: 'Биохимик қон таҳлили', code: 'BIO', selected: false },
		{ id: '3', name: 'Қанд миқдори', code: 'GLU', selected: false },
		{ id: '4', name: 'Умумий сийдик таҳлили', code: 'UA', selected: false },
		{ id: '5', name: 'Липид профили', code: 'LIP', selected: false },
		{ id: '6', name: 'Жигар функцияси', code: 'LFT', selected: false },
		{ id: '7', name: 'Буйрак функцияси', code: 'RFT', selected: false },
		{ id: '8', name: 'Тиреоид гормонлари', code: 'THY', selected: false },
	])

	const toggleTest = (id: string) => {
		setTests(
			tests.map(test =>
				test.id === id ? { ...test, selected: !test.selected } : test
			)
		)
	}

	const generateBarcode = () => {
		const code = `LAB-${Date.now().toString().slice(-8)}`
		setBarcode(code)
	}

	const selectedTests = tests.filter(t => t.selected)

	return (
		<div className='min-h-screen bg-background p-4 sm:p-6 md:p-8'>
			<div className='max-w-5xl mx-auto w-full'>
				{/* Header */}
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6'>
					<div>
						<h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-foreground'>
							Таҳлил Буюртмаси
						</h1>
						<p className='text-xs sm:text-sm md:text-base text-muted-foreground mt-1'>
							Янги лаборатория буюртмаси яратиш
						</p>
					</div>
					<div className='flex flex-wrap gap-2 sm:gap-3'>
						<Button variant='outline' className='w-full sm:w-auto'>
							<Printer className='mr-2 h-4 w-4' />
							Чоп Этиш
						</Button>
						<Button className='w-full sm:w-auto'>
							<Send className='mr-2 h-4 w-4' />
							Юбориш
						</Button>
					</div>
				</div>

				{/* Patient Info */}
				<Card className='mb-6'>
					<CardHeader>
						<CardTitle className='text-sm sm:text-base md:text-lg'>
							Бемор Маълумоти
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
							<div>
								<Label className='text-xs sm:text-sm md:text-base'>
									Бемор Исми
								</Label>
								<p className='font-semibold text-xs sm:text-sm md:text-base'>
									Каримов Жавлон Алишерович
								</p>
							</div>
							<div>
								<Label className='text-xs sm:text-sm md:text-base'>
									Туғилган Сана
								</Label>
								<p className='font-semibold text-xs sm:text-sm md:text-base'>
									20.08.1978 (46 йош)
								</p>
							</div>
							<div>
								<Label className='text-xs sm:text-sm md:text-base'>ID</Label>
								<p className='font-semibold text-xs sm:text-sm md:text-base'>
									#PAT-2025-001
								</p>
							</div>
							<div>
								<Label className='text-xs sm:text-sm md:text-base'>
									Телефон
								</Label>
								<p className='font-semibold text-xs sm:text-sm md:text-base'>
									+998 91 234 56 78
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Test Selection */}
				<Card className='mb-6'>
					<CardHeader>
						<CardTitle className='text-sm sm:text-base md:text-lg'>
							Таҳлил Турларини Танланг
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4'>
							{tests.map(test => (
								<div
									key={test.id}
									className='flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors'
								>
									<Checkbox
										id={test.id}
										checked={test.selected}
										onCheckedChange={() => toggleTest(test.id)}
									/>
									<Label
										htmlFor={test.id}
										className='flex-1 cursor-pointer font-normal text-xs sm:text-sm md:text-base'
									>
										{test.name}
										<Badge
											variant='secondary'
											className='ml-2 text-[10px] sm:text-xs md:text-sm'
										>
											{test.code}
										</Badge>
									</Label>
								</div>
							))}
						</div>

						<div className='mt-4 p-4 bg-muted rounded-lg'>
							<p className='text-xs sm:text-sm md:text-base font-semibold'>
								Танланган таҳлиллар: {selectedTests.length}
							</p>
							{selectedTests.length > 0 && (
								<div className='flex flex-wrap gap-2 mt-2'>
									{selectedTests.map(test => (
										<Badge
											key={test.id}
											variant='default'
											className='text-[10px] sm:text-xs md:text-sm'
										>
											{test.name}
										</Badge>
									))}
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Priority Selection */}
				<Card className='mb-6'>
					<CardHeader>
						<CardTitle className='text-sm sm:text-base md:text-lg'>
							Устувор Даража
						</CardTitle>
					</CardHeader>
					<CardContent>
						<RadioGroup value={priority} onValueChange={setPriority}>
							{[
								{
									value: 'normal',
									label: 'Оддий',
									desc: 'Натижа 24-48 соат ичида',
									badge: 'Оддий',
									badgeClass: 'bg-gray-200',
                  text:'text-black'
								},
								{
									value: 'urgent',
									label: 'Шошилинч',
									desc: 'Натижа 6-12 соат ичида',
									badge: 'Шошилинч',
									badgeClass: 'bg-orange-500 text-white',
								},
								{
									value: 'stat',
									label: 'Жуда Шошилинч',
									desc: 'Натижа 1-2 соат ичида',
									badge: 'Жуда Шошилинч',
									badgeClass: 'bg-red-600',
								},
							].map(item => (
								<div
									key={item.value}
									className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-border mb-3'
								>
									<div className='flex items-center gap-3'>
										<RadioGroupItem value={item.value} id={item.value} />
										<Label
											htmlFor={item.value}
											className='cursor-pointer font-normal text-xs sm:text-sm md:text-base'
										>
											<span className='font-semibold'>{item.label}</span>
											<p className='text-xs sm:text-sm md:text-base text-muted-foreground'>
												{item.desc}
											</p>
										</Label>
									</div>
									<Badge className={`mt-2 sm:mt-0 ${item.badgeClass} ${item.text}`}>
										{item.badge}
									</Badge>
								</div>
							))}
						</RadioGroup>
					</CardContent>
				</Card>

				{/* Barcode Generator */}
				<Card className='mb-6'>
					<CardHeader>
						<CardTitle className='text-sm sm:text-base md:text-lg'>
							Намуна Штрих-Коди
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4'>
							<div className='flex-1'>
								<Label className='text-xs sm:text-sm md:text-base'>
									Штрих-Код
								</Label>
								<div className='mt-2 p-4 bg-muted rounded-lg text-center text-xs sm:text-sm md:text-base'>
									{barcode ? (
										<div>
											<div className='text-lg sm:text-xl md:text-2xl font-mono font-bold mb-2'>
												{barcode}
											</div>
											<div className='h-10 sm:h-12 md:h-16 bg-card flex items-center justify-center'>
												<div className='text-2xl sm:text-3xl md:text-4xl font-mono tracking-widest'>
													||||||||||||
												</div>
											</div>
										</div>
									) : (
										<p className='text-muted-foreground text-xs sm:text-sm md:text-base'>
											Штрих-код яратилмаган
										</p>
									)}
								</div>
							</div>
							<Button onClick={generateBarcode} className='w-full sm:w-auto'>
								<FileText className='mr-2 h-4 w-4' />
								Штрих-Код Яратиш
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Clinical Indication */}
				<Card className='mb-6'>
					<CardHeader>
						<CardTitle className='text-sm sm:text-base md:text-lg'>
							Клиник Кўрсатма
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Label className='text-xs sm:text-sm md:text-base'>
							Таҳлил сабаби ва клиник ахвол
						</Label>
						<Textarea
							placeholder='Мисол: Беморда қондаги қанд миқдори ошган...'
							rows={5}
							className='mt-2 w-full text-xs sm:text-sm md:text-base'
						/>
					</CardContent>
				</Card>

				{/* Lab Assignment */}
				<Card className='mb-6'>
					<CardHeader>
						<CardTitle className='text-sm sm:text-base md:text-lg'>
							Лаборант Тайинлаш
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='p-4 bg-muted rounded-lg text-xs sm:text-sm md:text-base'>
							<p className='text-muted-foreground mb-2'>
								Автоматик тайинланган:
							</p>
							<p className='font-semibold'>
								Лаборант: Исмоилова Нигора Фарходовна
							</p>
							<p className='text-muted-foreground mt-1'>
								Бўш лаборант (Навбатдаги: 3 таҳлил)
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className='flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6'>
					<Button
						variant='outline'
						className='w-full sm:w-auto text-xs sm:text-sm md:text-base'
					>
						Бекор Қилиш
					</Button>
					<Button
						variant='secondary'
						className='w-full sm:w-auto text-xs sm:text-sm md:text-base'
					>
						Сақлаш
					</Button>
					<Button className='w-full sm:w-auto text-xs sm:text-sm md:text-base'>
						Тасдиқлаш ва Юбориш
					</Button>
				</div>
			</div>
		</div>
	)
}

export default LabOrder
