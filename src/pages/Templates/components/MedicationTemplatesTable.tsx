import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { TemplateTranslator } from '../medicationTemplateTypes';

interface MedicationTemplatesTableProps {
  t: TemplateTranslator;
  isLoading: boolean;
  templates: GetResponse[];
  canUpdate: boolean;
  canDelete: boolean;
  onView: (template: GetResponse) => void;
  onEdit: (template: GetResponse) => void;
  onDelete: (templateId: string) => void;
}

export default function MedicationTemplatesTable({
  t,
  isLoading,
  templates,
  canUpdate,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: MedicationTemplatesTableProps) {
  return (
    <div className='border rounded-lg'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.name', 'Номи')}</TableHead>
            <TableHead>{t('table.itemsCount', 'Дорилар сони')}</TableHead>
            <TableHead>{t('table.createdAt', 'Яратилган')}</TableHead>
            <TableHead className='text-right'>
              {t('table.actions', 'Амаллар')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className='text-center py-8'>
                {t('loading', 'Юкланмоқда...')}
              </TableCell>
            </TableRow>
          ) : templates.length > 0 ? (
            templates.map((template) => (
              <TableRow key={template._id}>
                <TableCell className='font-medium'>{template.name}</TableCell>
                <TableCell>{template.items.length}</TableCell>
                <TableCell>
                  {new Date(template.created_at).toLocaleDateString('uz-UZ')}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => onView(template)}
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                    {canUpdate && (
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onEdit(template)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(template._id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className='text-center py-8'>
                {t('noData', 'Маълумот топилмади')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
