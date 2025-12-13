import { useGetAllImagingTypesQuery } from '@/app/api/radiologyApi';
import { ImagingType } from '@/app/api/radiologyApi/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useRouteActions } from '@/hooks/RBS';
import {
  Activity,
  Edit,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { IconLeft, IconRight } from 'react-day-picker';
import { DeleteWarnImagingType, NewImagingType, UpdateImagingType } from '.';

export const ImagingTypeTab = () => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ImagingType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Permission checks
  const { canCreate } = useRouteActions('/imaging-type');
  const { canUpdate, canDelete } = useRouteActions('/imaging-type/:id');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: imagingTypes, isLoading } = useGetAllImagingTypesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
  });

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex-1'>
          <h2 className='text-xl font-semibold'>Текшириш турлари</h2>
          <p className='text-sm text-muted-foreground'>
            МРТ, КТ, Рентген ва бошқа текшириш турларини бошқариш
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setShowNewModal(true)}
            className='w-full sm:w-auto'
          >
            <Plus className='mr-2 h-4 w-4' />
            Янги тур қўшиш
          </Button>
        )}
      </div>

      <Card className='card-shadow mb-4'>
        <div className='p-4 sm:p-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4'>
            <div className='sm:col-span-2 lg:col-span-8'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground' />
                <Input
                  placeholder='Номи бўйича қидириш...'
                  className='pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className='lg:col-span-4'>
              <Button
                variant='outline'
                className='w-full h-10 sm:h-12'
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedSearch('');
                  setCurrentPage(1);
                }}
                disabled={!searchQuery && currentPage === 1}
              >
                <Filter className='w-4 h-4 sm:w-5 sm:h-5' />
                <span className='ml-2'>Қидирувни тозалаш</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {imagingTypes && imagingTypes?.data && imagingTypes?.data.length > 0 && (
        <div className='flex items-start sm:items-center justify-between gap-3 mb-4'>
          <p className='text-sm sm:text-base text-muted-foreground'>
            Жами:{' '}
            <span className='font-semibold text-foreground'>
              {imagingTypes?.pagination?.total || 0}
            </span>{' '}
            тур
          </p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className='w-32 h-9 sm:h-10 text-sm'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='25'>25</SelectItem>
              <SelectItem value='50'>50</SelectItem>
              <SelectItem value='100'>100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isLoading ? (
        <Card className='card-shadow p-8 sm:p-12'>
          <LoadingSpinner
            size='lg'
            text='Юкланмоқда...'
            className='justify-center'
          />
        </Card>
      ) : imagingTypes?.data && imagingTypes?.data.length > 0 ? (
        <>
          {/* Desktop Table */}
          <Card className='card-shadow hidden lg:block'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-center'>№</TableHead>
                  <TableHead className='text-center'>Номи</TableHead>
                  <TableHead className='text-center'>Тавсиф</TableHead>
                  <TableHead className='text-right'>Ҳаракатлар</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imagingTypes?.data.map((type, idx) => (
                  <TableRow key={type._id}>
                    <TableCell className='text-center font-bold'>
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </TableCell>
                    <TableCell className='text-center font-semibold'>
                      {type.name}
                    </TableCell>
                    <TableCell className='text-center'>
                      {type.description || 'Тавсиф йўқ'}
                    </TableCell>
                    <TableCell className='flex justify-end pr-6'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='outline' className='w-8 h-8'>
                            <MoreHorizontal className='w-4 h-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {canUpdate && (
                            <DropdownMenuItem>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => {
                                  setSelectedType(type);
                                  setShowUpdateModal(true);
                                }}
                                className='w-full bg-yellow-600 text-white'
                              >
                                <Edit className='w-4 h-4 mr-2' />
                                Таҳрирлаш
                              </Button>
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => {
                                  setSelectedType(type);
                                  setShowDeleteModal(true);
                                }}
                                className='w-full bg-red-600 text-white'
                              >
                                <Trash2 className='w-4 h-4 mr-2' />
                                Ўчириш
                              </Button>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile Cards */}
          <div className='block lg:hidden space-y-3 sm:space-y-4'>
            {imagingTypes?.data.map((type, idx) => (
              <Card key={type._id} className='card-shadow relative'>
                <div className='p-4'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-base sm:text-lg mb-1'>
                        {(currentPage - 1) * itemsPerPage + idx + 1}.{' '}
                        {type.name}
                      </h3>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        {type.description || 'Тавсиф йўқ'}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline' className='w-8 h-8'>
                          <MoreHorizontal className='w-4 h-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => {
                              setSelectedType(type);
                              setShowUpdateModal(true);
                            }}
                            className='w-full bg-yellow-600 text-white'
                          >
                            <Edit className='w-4 h-4 mr-2' />
                            Таҳрирлаш
                          </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => {
                              setSelectedType(type);
                              setShowDeleteModal(true);
                            }}
                            className='w-full bg-red-600 text-white'
                          >
                            <Trash2 className='w-4 h-4 mr-2' />
                            Ўчириш
                          </Button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className='px-3 xl:px-6 py-2 xl:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3'>
            <div className='text-xs xl:text-sm text-muted-foreground min-w-max'>
              Sahifa {imagingTypes.pagination.page} dan{' '}
              {imagingTypes.pagination.pages} (Жами:{' '}
              {imagingTypes.pagination.total} та)
            </div>

            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={imagingTypes.pagination.prev === null}
                onClick={() => setCurrentPage(currentPage - 1)}
                className='text-xs xl:text-sm'
              >
                <IconLeft className='w-4 h-4' />
                <span className='hidden sm:inline'>Олдинги</span>
              </Button>
              {(() => {
                const pages = [];
                const showPages = new Set<number>();

                showPages.add(1);
                if (imagingTypes.pagination.pages > 1) {
                  showPages.add(imagingTypes.pagination.pages);
                }

                for (
                  let i = Math.max(2, currentPage - 1);
                  i <=
                  Math.min(imagingTypes.pagination.pages - 1, currentPage + 1);
                  i++
                ) {
                  showPages.add(i);
                }

                const sortedPages = Array.from(showPages).sort((a, b) => a - b);

                sortedPages.forEach((page, index) => {
                  if (index > 0 && sortedPages[index - 1] !== page - 1) {
                    pages.push(
                      <span
                        key={`ellipsis-${page}`}
                        className='px-1 flex items-center text-xs xl:text-sm'
                      >
                        ...
                      </span>
                    );
                  }

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
                disabled={imagingTypes.pagination.next === null}
                onClick={() => setCurrentPage(currentPage + 1)}
                className='text-xs xl:text-sm'
              >
                <span className='hidden sm:inline'>Кейинги</span>
                <IconRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Card className='card-shadow p-4 sm:p-0'>
          <EmptyState
            icon={Activity}
            title={
              searchQuery || currentPage > 1
                ? 'Ҳеч нарса топилмади'
                : 'Ҳали текшириш турлари йўқ'
            }
            description={
              searchQuery || currentPage > 1
                ? 'Қидирув сўзини текширинг ёки филтрни ўзгартиринг'
                : 'Биринчи текшириш турини қўшиш учун қуйидаги тугмани босинг'
            }
            actionLabel={
              searchQuery || currentPage > 1
                ? 'Филтрни тозалаш'
                : '+ Янги тур қўшиш'
            }
            onAction={() =>
              searchQuery || currentPage > 1
                ? (setSearchQuery(''),
                  setDebouncedSearch(''),
                  setCurrentPage(1))
                : setShowNewModal(true)
            }
          />
        </Card>
      )}

      <NewImagingType open={showNewModal} onOpenChange={setShowNewModal} />
      <UpdateImagingType
        open={showUpdateModal}
        onOpenChange={setShowUpdateModal}
        imagingType={selectedType}
      />
      <DeleteWarnImagingType
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        imagingType={selectedType}
      />
    </div>
  );
};
