import {
  useDeleteExamMutation,
  useGetAllExamsQuery,
  useUpdateExamMutation,
} from '@/app/api/examinationApi/examinationApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import {
  AlertTriangle,
  Edit,
  FileText,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Visits = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  // Edit form state
  const [editComplaints, setEditComplaints] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDiagnosis, setEditDiagnosis] = useState('');

  // Fetch exams
  const {
    data: examsData,
    isLoading,
    refetch,
  } = useGetAllExamsQuery({
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
  });

  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteExamMutation();
  const handleRequest = useHandleRequest();

  const exams = examsData?.data || [];

  // Open edit modal
  const handleEditClick = (exam: any) => {
    setSelectedExam(exam);
    setEditComplaints(exam.complaints);
    setEditDescription(exam.description);
    setEditDiagnosis('');
    setIsEditModalOpen(true);
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editComplaints.trim()) {
      toast.error('Илтимос, шикоятни киритинг');
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await updateExam({
          id: selectedExam._id,
          body: {
            patient_id: selectedExam.patient_id._id,
            diagnosis: editDiagnosis,
            complaints: editComplaints,
            description: editDescription,
          },
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success('Кўрик муваффақиятли янгиланди');
        setIsEditModalOpen(false);
        refetch();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
      },
    });
  };

  // Open delete modal
  const handleDeleteClick = (exam: any) => {
    setSelectedExam(exam);
    setIsDeleteModalOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    await handleRequest({
      request: async () => {
        const res = await deleteExam(selectedExam._id).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success('Кўрик муваффақиятли ўчирилди');
        setIsDeleteModalOpen(false);
        refetch();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
      },
    });
  };

  // Filter exams by search
  const filteredExams = exams.filter((exam: any) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      exam.patient_id.fullname.toLowerCase().includes(query) ||
      exam.doctor_id.fullname.toLowerCase().includes(query) ||
      exam.patient_id.phone.includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { text: 'Фаол', class: 'bg-blue-500/10 text-blue-600' },
      completed: {
        text: 'Тугалланган',
        class: 'bg-green-500/10 text-green-600',
      },
      inactive: { text: 'Фаол эмас', class: 'bg-gray-500/10 text-gray-600' },
      deleted: { text: 'Ўчирилган', class: 'bg-red-500/10 text-red-600' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold mb-1 sm:mb-2'>
              Кўриклар
            </h1>
            <p className='text-sm sm:text-base text-muted-foreground'>
              Барча кўрикларни кўриш ва бошқариш
            </p>
          </div>
          <Button
            className='gradient-primary h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto'
            onClick={() => navigate('/new-visit')}
          >
            <Plus className='w-4 h-4 mr-2' />
            Янги Кўрик
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className='card-shadow mb-4 sm:mb-6'>
          <div className='p-4 sm:p-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
              <div className='sm:col-span-2'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground' />
                  <Input
                    placeholder='Бемор, шифокор ёки телефон бўйича қидириш...'
                    className='pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='h-10 sm:h-12 text-sm sm:text-base'>
                    <SelectValue placeholder='Статус' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Барчаси</SelectItem>
                    <SelectItem value='active'>Фаол</SelectItem>
                    <SelectItem value='completed'>Тугалланган</SelectItem>
                    <SelectItem value='inactive'>Фаол эмас</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Table */}
        {isLoading ? (
          <Card className='card-shadow p-8 sm:p-12'>
            <LoadingSpinner
              size='lg'
              text='Юкланмоқда...'
              className='justify-center'
            />
          </Card>
        ) : filteredExams.length === 0 ? (
          <Card className='card-shadow p-4 sm:p-0'>
            <EmptyState
              icon={FileText}
              title={searchQuery ? 'Ҳеч нарса топилмади' : 'Ҳали кўриклар йўқ'}
              description={
                searchQuery
                  ? 'Қидирув сўзини текширинг'
                  : 'Биринчи кўрикни яратиш учун қуйидаги тугмани босинг'
              }
              actionLabel={
                searchQuery ? 'Қидирувни тозалаш' : '+ Янги Кўрик Яратиш'
              }
              onAction={() =>
                searchQuery ? setSearchQuery('') : navigate('/new-visit')
              }
            />
          </Card>
        ) : (
          <Card className='card-shadow'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Бемор</TableHead>
                    <TableHead>Шифокор</TableHead>
                    <TableHead>Шикоят</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Сана</TableHead>
                    <TableHead className='text-right'>Ҳаракатлар</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam: any) => (
                    <TableRow key={exam._id}>
                      <TableCell>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {exam.patient_id.fullname}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {exam.patient_id.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className='font-medium'>
                          {exam.doctor_id.fullname}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className='text-sm line-clamp-2'>
                          {exam.complaints}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(exam.status)}</TableCell>
                      <TableCell className='text-sm'>
                        {new Date(exam.created_at).toLocaleDateString('uz-UZ')}
                      </TableCell>
                      <TableCell>
                        <div className='flex justify-end gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleEditClick(exam)}
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            className='text-red-600 hover:text-red-700'
                            onClick={() => handleDeleteClick(exam)}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {examsData?.pagination && (
              <div className='px-4 xl:px-6 py-3 xl:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3'>
                <div className='text-xs xl:text-sm text-muted-foreground'>
                  {examsData.pagination.prev_page
                    ? (examsData.pagination.page - 1) *
                        examsData.pagination.limit +
                      1
                    : 1}{' '}
                  -{' '}
                  {Math.min(
                    examsData.pagination.page * examsData.pagination.limit,
                    examsData.pagination.total_items
                  )}{' '}
                  дан {examsData.pagination.total_items} та кўрсатилмоқда
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className='text-xs xl:text-sm'
                  >
                    Олдинги
                  </Button>
                  {(() => {
                    const pages = [];
                    const showPages = new Set<number>();

                    // Har doim 1-sahifani ko'rsat
                    showPages.add(1);

                    // Har doim oxirgi sahifani ko'rsat
                    if (examsData.pagination.total_pages > 1) {
                      showPages.add(examsData.pagination.total_pages);
                    }

                    // Joriy sahifa va uning atrofidagi sahifalarni ko'rsat
                    for (
                      let i = Math.max(2, currentPage - 1);
                      i <=
                      Math.min(
                        examsData.pagination.total_pages - 1,
                        currentPage + 1
                      );
                      i++
                    ) {
                      showPages.add(i);
                    }

                    const sortedPages = Array.from(showPages).sort(
                      (a, b) => a - b
                    );

                    sortedPages.forEach((page, index) => {
                      // Ellipsis qo'shish agar sahifalar orasida bo'sh joy bo'lsa
                      if (index > 0 && sortedPages[index - 1] !== page - 1) {
                        pages.push(
                          <span
                            key={`ellipsis-${page}`}
                            className='px-2 flex items-center text-xs xl:text-sm'
                          >
                            ...
                          </span>
                        );
                      }

                      // Sahifa tugmasi
                      pages.push(
                        <Button
                          key={page}
                          variant='outline'
                          size='sm'
                          onClick={() => setCurrentPage(page)}
                          className={`text-xs xl:text-sm ${
                            page === currentPage
                              ? 'bg-primary text-white hover:bg-primary/60 hover:text-white'
                              : ''
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    });

                    return pages;
                  })()}
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage === examsData.pagination.total_pages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className='text-xs xl:text-sm'
                  >
                    Кейинги
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Кўрикни таҳрирлаш</DialogTitle>
              <DialogDescription>
                Кўрик маълумотларини ўзгартиринг
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              {/* Complaints */}
              <div className='space-y-2'>
                <Label>Шикоят</Label>
                <Textarea
                  placeholder='Бемор шикоятини киритинг...'
                  value={editComplaints}
                  onChange={(e) => setEditComplaints(e.target.value)}
                  className='min-h-24'
                />
              </div>

              {/* Diagnosis */}
              <div className='space-y-2'>
                <Label>Ташхис</Label>
                <Input
                  placeholder='Ташхисни киритинг...'
                  value={editDiagnosis}
                  onChange={(e) => setEditDiagnosis(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className='space-y-2'>
                <Label>Тавсия</Label>
                <Textarea
                  placeholder='Кўрик натижаси ва тавсияларни киритинг...'
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className='min-h-24'
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdating}
              >
                Бекор қилиш
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? 'Сақланмоқда...' : 'Сақлаш'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <AlertTriangle className='w-5 h-5 text-red-600' />
                Кўрикни ўчириш
              </DialogTitle>
              <DialogDescription>
                Сиз ҳақиқатан ҳам бу кўрикни ўчирмоқчимисиз? Бу амални қайтариб
                бўлмайди.
              </DialogDescription>
            </DialogHeader>

            {selectedExam && (
              <div className='py-4'>
                <div className='p-4 bg-muted rounded-lg space-y-2'>
                  <p className='text-sm'>
                    <span className='font-semibold'>Бемор:</span>{' '}
                    {selectedExam.patient_id.fullname}
                  </p>
                  <p className='text-sm'>
                    <span className='font-semibold'>Шифокор:</span>{' '}
                    {selectedExam.doctor_id.fullname}
                  </p>
                  <p className='text-sm'>
                    <span className='font-semibold'>Сана:</span>{' '}
                    {new Date(selectedExam.created_at).toLocaleDateString(
                      'uz-UZ'
                    )}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Бекор қилиш
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Ўчирилмоқда...' : 'Ўчириш'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Visits;
