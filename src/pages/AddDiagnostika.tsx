import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from '@/components/ui/dialog'
import {
	useGetAllDiagnosticsQuery,
	useCreateDiagnosticMutation,
	useUpdateDiagnosticMutation,
	useDeleteDiagnosticMutation,
} from '@/app/api/diagnostic/diagnosticApi'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'

export default function DiagnosticsPage() {
	const navigate = useNavigate()
	const [searchCode, setSearchCode] = useState('')
	const [searchName, setSearchName] = useState('')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [newCode, setNewCode] = useState('')
	const [newName, setNewName] = useState('')
	const [newDescription, setNewDescription] = useState('')
	const [editingId, setEditingId] = useState<string | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)

	const { data, isLoading, isError } = useGetAllDiagnosticsQuery()
	const [createDiagnostic, { isLoading: isCreating }] =
		useCreateDiagnosticMutation()
	const [updateDiagnostic, { isLoading: isUpdating }] =
		useUpdateDiagnosticMutation()
	const [deleteDiagnostic, { isLoading: isDeleting }] =
		useDeleteDiagnosticMutation()
	const handleRequest = useHandleRequest()

	// Search filter
	const filtered = data?.data.filter(
		item =>
			item.code.toLowerCase().includes(searchCode.toLowerCase()) &&
			item.name.toLowerCase().includes(searchName.toLowerCase())
	)

	// Qo‘shish yoki Tahrirlash handler
	const handleSave = async () => {
		if (!newCode || !newName)
			return toast.error('Code va Name kiritilishi shart!')

		if (editingId) {
			await handleRequest({
				request: async () =>
					updateDiagnostic({
						id: editingId,
						body: { code: newCode, name: newName, description: newDescription },
					}).unwrap(),
				onSuccess: res => {
					toast.success(res.message)
					setIsDialogOpen(false)
					clearForm()
				},
				onError: error => {
					toast.error('Tahrirlashda xatolik')
					console.error(error)
				},
			})
		} else {
			await handleRequest({
				request: async () =>
					createDiagnostic({
						code: newCode,
						name: newName,
						description: newDescription,
					}).unwrap(),
				onSuccess: res => {
					toast.success(res.message)
					setIsDialogOpen(false)
					clearForm()
				},
				onError: error => {
					toast.error('Qo‘shishda xatolik')
					console.error(error)
				},
			})
		}
	}

	const clearForm = () => {
		setNewCode('')
		setNewName('')
		setNewDescription('')
		setEditingId(null)
	}

	const openEditDialog = (item: (typeof filtered)[0]) => {
		setEditingId(item._id)
		setNewCode(item.code)
		setNewName(item.name)
		setNewDescription(item.description)
		setIsDialogOpen(true)
	}

	const openDeleteDialog = (id: string) => {
		setDeleteId(id)
		setIsDeleteDialogOpen(true)
	}

	const handleDelete = async () => {
		if (!deleteId) return
		await handleRequest({
			request: async () => deleteDiagnostic(deleteId).unwrap(),
			onSuccess: res => {
				toast.success('Tahlil muvaffaqiyatli o‘chirildi')
				setIsDeleteDialogOpen(false)
				setDeleteId(null)
			},
			onError: error => {
				toast.error('O‘chirishda xatolik')
				console.error(error)
			},
		})
	}

	if (isLoading) return <p>Yuklanmoqda...</p>
	if (isError) return <p>Xatolik yuz berdi!</p>

	return (
		<div className='p-4 sm:p-6 space-y-6'>
			{/* HEADER */}
			<div className='flex flex-col sm:flex-row gap-3 sm:items-center justify-between'>
				<div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
					<Input
						placeholder='Tahlil kodi bo‘yicha qidirish...'
						value={searchCode}
						onChange={e => setSearchCode(e.target.value)}
						className='w-full sm:w-64'
					/>
          
					<Input
						placeholder='Tahlil nomi bo‘yicha qidirish...'
						value={searchName}
						onChange={e => setSearchName(e.target.value)}
						className='w-full sm:w-64'
					/>
				</div>
				<Button
					className='bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2'
					onClick={() => {
            setIsDialogOpen(true)
            clearForm()
          }}
				>
					<Plus size={18} /> Qo‘shish
				</Button>
			</div>

			{/* CREATE / EDIT DIALOG */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className='w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh]'>
					<DialogHeader>
						<DialogTitle>
							{editingId ? 'Tahlilni tahrirlash' : 'Yangi tahlil qo‘shish'}
						</DialogTitle>
					</DialogHeader>
					<div className='flex flex-col gap-3 mt-2'>
						<Label>Tahlil kodi</Label>
						<Input
							placeholder='Codi kiriting'
							value={newCode}
							onChange={e => setNewCode(e.target.value)}
						/>
						<Label>Tahlil nomi</Label>
						<Input
							placeholder='Nomini kiriting'
							value={newName}
							onChange={e => setNewName(e.target.value)}
						/>
						<Label>Tahlil ta'rifi</Label>
						<Input
							placeholder='Tarif bering ...'
							value={newDescription}
							onChange={e => setNewDescription(e.target.value)}
						/>
					</div>
					<DialogFooter className='mt-4'>
						<Button variant='outline' onClick={() => setIsDialogOpen(false)}>
							Bekor qilish
						</Button>
						<Button
							className='bg-blue-600 hover:bg-blue-700 text-white '
							onClick={handleSave}
							disabled={isCreating || isUpdating}
						>
							Saqlash
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* DELETE DIALOG */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className='w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh]'>
					<DialogTitle>Tahlilni o‘chirish</DialogTitle>
					<DialogDescription>Rostan ham ushbu tahlil o‘chirilsinmi?</DialogDescription>
					<DialogFooter className='flex justify-end gap-2'>
						<Button
							variant='outline'
							onClick={() => setIsDeleteDialogOpen(false)}
						>
							Yo‘q
						</Button>
						<Button
							variant='destructive'
							onClick={handleDelete}
							disabled={isDeleting}
						>
							Ha, o‘chirish
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* CARDS */}
			<div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
				{filtered?.map(item => (
					<Card
						key={item._id}
						className='rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 cursor-pointer'
						onClick={() => navigate(`/analysisById/${item._id}`)}
					>
						<CardContent className='p-5 flex items-start justify-between'>
							<div>
								<p className='text-sm text-gray-500 font-medium'>{item.name}</p>
								<h3 className='text-base sm:text-lg font-semibold text-gray-800'>
									{item.code}
								</h3>
								<p className='text-xs text-gray-500 mt-1'>{item.description}</p>
								<p className='text-xs text-gray-400 mt-1'>
									Parametrlar soni: {item.analysis_parameters?.length || 0}
								</p>
							</div>
							<div className='flex items-center gap-2'>
								<Button
									size='icon'
									variant='outline'
									className='h-8 w-8'
									onClick={e => {
										e.stopPropagation()
										openEditDialog(item)
									}}
								>
									<Edit size={16} />
								</Button>
								<Button
									size='icon'
									variant='outline'
									className='h-8 w-8 text-red-500 border-red-300 hover:bg-red-50'
									onClick={e => {
										e.stopPropagation()
										openDeleteDialog(item._id)
									}}
								>
									<Trash2 size={16} />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* NO DATA */}
			{filtered?.length === 0 && (
				<p className='text-center text-gray-500 py-8'>
					Hech qanday tahlil topilmadi 😔
				</p>
			)}
		</div>
	)
}
