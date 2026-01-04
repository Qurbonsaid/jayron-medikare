import { useGetAllDiagnosisQuery } from '@/app/api/diagnosisApi/diagnosisApi';
import {
  useCompleteExamsMutation,
  useDeleteExamMutation,
  useGetAllExamsQuery,
  useUpdateExamMutation,
} from '@/app/api/examinationApi/examinationApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
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
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { usePermission } from '@/hooks/usePermission';
import { Eye, FileText, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getStatusBadge } from '../../components/common/StatusBadge';
import DeleteVisit from './components/DeleteVisit';
import EditVisit from './components/EditVisit';
import ExamFilter from './components/ExamFilter';
import VisitDetail from './components/VisitDetail';

const Examinations = () => {
  const { t } = useTranslation('examinations');
  const { canCreate } = usePermission('examinations');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [treatmentTypeFilter, setTreatmentTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    complaints: '',
    description: '',
    diagnosis: '',
  });

  // Fetch exams
  const {
    data: examsData,
    isLoading,
    refetch,
  } = useGetAllExamsQuery({
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
    treatment_type:
      treatmentTypeFilter !== 'all'
        ? (treatmentTypeFilter as 'stasionar' | 'ambulator')
        : undefined,
  });

  // Fetch all diagnosis
  const { data: diagnosisData } = useGetAllDiagnosisQuery({});

  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteExamMutation();
  const [completeExam, { isLoading: isCompleting }] =
    useCompleteExamsMutation();
  const handleRequest = useHandleRequest();

  const exams = examsData?.data || [];
  const diagnoses = diagnosisData?.data || [];

  // Open detail modal
  const handleDetailClick = (exam: any) => {
    setSelectedExam(exam);
    setIsDetailModalOpen(true);
  };

  // Open edit modal from detail
  const handleEditFromDetail = () => {
    setEditForm({
      complaints: selectedExam.complaints || '',
      description: selectedExam.description || '',
      diagnosis: selectedExam.diagnosis?._id || selectedExam.diagnosis || '',
    });
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Open delete modal from detail
  const handleDeleteFromDetail = () => {
    setIsDetailModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  // Handle complete exam
  const handleCompleteExam = async () => {
    await handleRequest({
      request: async () => {
        const res = await completeExam(selectedExam._id).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('completed'));
        setIsDetailModalOpen(false);
        refetch();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || t('errorOccurred'));
      },
    });
  };

  // Open edit modal
  const handleEditClick = (exam: any) => {
    setSelectedExam(exam);
    setEditForm({
      complaints: exam.complaints || '',
      description: exam.description || '',
      diagnosis: exam.diagnosis?._id || exam.diagnosis || '',
    });
    setIsEditModalOpen(true);
  };

  // Handle update
  const handleUpdate = async () => {
    if (!editForm.complaints.trim()) {
      toast.error(t('enterComplaintRequired'));
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await updateExam({
          id: selectedExam._id,
          body: {
            patient_id: selectedExam.patient_id._id,
            diagnosis: editForm.diagnosis,
            complaints: editForm.complaints,
            description: editForm.description,
          },
        });
        return res;
      },
      onSuccess: () => {
        toast.success(t('updated'));
        setIsEditModalOpen(false);
        refetch();
      },
      onError: (err) => {
        toast.error(err?.error?.msg || t('errorOccurred'));
      },
    });
  };

  // Handle delete
  const handleDelete = async () => {
    await handleRequest({
      request: async () => {
        const res = await deleteExam(selectedExam._id).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('deleted'));
        setIsDeleteModalOpen(false);
        refetch();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || t('errorOccurred'));
      },
    });
  };

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold mb-1 sm:mb-2'>
              {t('title')}
            </h1>
            <p className='text-sm sm:text-base text-muted-foreground'>
              {t('subtitle')}
            </p>
          </div>
          {canCreate && (
            <Button
              className='gradient-primary h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto'
              onClick={() => navigate('/new-visit')}
            >
              <Plus className='w-4 h-4 mr-2' />
              {t('newExamination')}
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <Card className='card-shadow mb-4 sm:mb-6'>
          <div className='p-4 sm:p-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
              <div className='sm:col-span-2'>
                <label className='block text-sm font-medium text-muted-foreground mb-1.5'>
                  {t('search')}
                </label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground' />
                  <Input
                    placeholder={t('searchPlaceholder')}
                    className='pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-muted-foreground mb-1.5'>
                  {t('status')}
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='h-10 sm:h-12 text-sm sm:text-base'>
                    <SelectValue placeholder={t('status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>{t('all')}</SelectItem>
                    <SelectItem value='completed'>{t('statusCompleted')}</SelectItem>
                    <SelectItem value='pending'>{t('pending')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='block text-sm font-medium text-muted-foreground mb-1.5'>
                  {t('treatmentType')}
                </label>
                <Select
                  value={treatmentTypeFilter}
                  onValueChange={setTreatmentTypeFilter}
                >
                  <SelectTrigger className='h-10 sm:h-12 text-sm sm:text-base'>
                    <SelectValue placeholder={t('treatmentType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>{t('all')}</SelectItem>
                    <SelectItem value='ambulator'>{t('ambulatory')}</SelectItem>
                    <SelectItem value='stasionar'>{t('stationary')}</SelectItem>
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
              text={t('loadingExaminations')}
              className='justify-center'
            />
          </Card>
        ) : ExamFilter({ exams, searchQuery }).length === 0 ? (
          <Card className='card-shadow p-4 sm:p-0'>
            <EmptyState
              icon={FileText}
              title={searchQuery ? t('notFound') : t('noExamsYet')}
              description={
                searchQuery
                  ? t('checkSearch')
                  : t('createFirstExam')
              }
              actionLabel={
                searchQuery ? t('clearSearch') : t('createNew')
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
                    <TableHead>{t('patient')}</TableHead>
                    <TableHead>{t('doctor')}</TableHead>
                    <TableHead>{t('complaint')}</TableHead>
                    <TableHead>{t('type')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className='min-w-[120px]'>{t('date')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ExamFilter({ exams, searchQuery }).map((exam: any) => (
                    <TableRow key={exam._id}>
                      <TableCell>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {exam?.patient_id?.fullname}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {exam?.patient_id?.phone}
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
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            exam.treatment_type === 'stasionar'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {exam.treatment_type === 'stasionar'
                            ? t('stationary')
                            : t('ambulatory')}
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
                            className='text-primary hover:text-primary/80'
                            onClick={() => navigate(`/examination/${exam._id}`)}
                            title={t('examinationDetails')}
                          >
                            <Eye className='w-4 h-4 mr-1' />
                            {t('examinationDetails')}
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
              <div className='px-4 sm:px-6 py-4 border-t'>
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                  {/* Items per page */}
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>
                      {t('pagination.perPage')}:
                    </span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className='h-9 w-20 text-sm'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='10'>10</SelectItem>
                        <SelectItem value='20'>20</SelectItem>
                        <SelectItem value='50'>50</SelectItem>
                        <SelectItem value='100'>100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Page info and navigation */}
                  <div className='flex flex-col sm:flex-row items-center gap-3'>
                    {/* Page info */}
                    <div className='text-sm text-muted-foreground whitespace-nowrap'>
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
                      {t('pagination.of')} {examsData.pagination.total_items} {t('pagination.items')}
                    </div>

                    {/* Page buttons */}
                    <div className='flex items-center gap-1'>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className='h-9 px-3'
                      >
                        {t('pagination.previous')}
                      </Button>

                      <div className='flex items-center gap-1'>
                        {(() => {
                          const pages = [];
                          const showPages = new Set<number>();

                          // Always show first page
                          showPages.add(1);

                          // Always show last page
                          if (examsData.pagination.total_pages > 1) {
                            showPages.add(examsData.pagination.total_pages);
                          }

                          // Show current page and surrounding pages
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
                            // Add ellipsis if there's a gap
                            if (
                              index > 0 &&
                              sortedPages[index - 1] !== page - 1
                            ) {
                              pages.push(
                                <span
                                  key={`ellipsis-${page}`}
                                  className='px-2 text-sm text-muted-foreground'
                                >
                                  ...
                                </span>
                              );
                            }

                            // Add page button
                            pages.push(
                              <Button
                                key={page}
                                variant={
                                  page === currentPage ? 'default' : 'outline'
                                }
                                size='sm'
                                onClick={() => setCurrentPage(page)}
                                className='h-9 w-9 p-0'
                              >
                                {page}
                              </Button>
                            );
                          });

                          return pages;
                        })()}
                      </div>

                      <Button
                        variant='outline'
                        size='sm'
                        disabled={
                          currentPage === examsData.pagination.total_pages
                        }
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className='h-9 px-3'
                      >
                        {t('pagination.next')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Detail Modal */}
        <VisitDetail
          isDetailModalOpen={isDetailModalOpen}
          setIsDetailModalOpen={setIsDetailModalOpen}
          selectedExam={selectedExam}
          handleEditFromDetail={handleEditFromDetail}
          handleDeleteFromDetail={handleDeleteFromDetail}
          handleCompleteExam={handleCompleteExam}
          isCompleting={isCompleting}
        />

        {/* Edit Modal */}
        <EditVisit
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          editForm={editForm}
          setEditForm={setEditForm}
          diagnoses={diagnoses}
          handleUpdate={handleUpdate}
          isUpdating={isUpdating}
        />

        {/* Delete Confirmation Modal */}
        <DeleteVisit
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          selectedExam={selectedExam}
          handleDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </main>
    </div>
  );
};

export default Examinations;
