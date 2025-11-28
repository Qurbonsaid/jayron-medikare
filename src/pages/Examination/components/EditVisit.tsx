import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

interface Props {
  isEditModalOpen: boolean;
  setIsEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editForm: {
    complaints: string;
    description: string;
    diagnosis: string;
  };
  setEditForm: React.Dispatch<
    React.SetStateAction<{
      complaints: string;
      description: string;
      diagnosis: string;
    }>
  >;
  diagnoses: any[];
  handleUpdate: () => void;
  isUpdating: boolean;
}

const EditVisit = ({
  isEditModalOpen,
  setIsEditModalOpen,
  editForm,
  setEditForm,
  diagnoses,
  handleUpdate,
  isUpdating,
}: Props) => {
  return (
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
              value={editForm.complaints}
              onChange={(e) =>
                setEditForm({ ...editForm, complaints: e.target.value })
              }
              className='min-h-24'
            />
          </div>

          {/* Diagnosis */}
          <div className='space-y-2'>
            <Label>Ташхис</Label>
            <Select
              value={editForm.diagnosis}
              onValueChange={(value) =>
                setEditForm({ ...editForm, diagnosis: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Ташхисни танланг...' />
              </SelectTrigger>
              <SelectContent>
                {diagnoses.map((diagnosis: any) => (
                  <SelectItem key={diagnosis._id} value={diagnosis._id}>
                    {diagnosis.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label>Тавсия</Label>
            <Textarea
              placeholder='Кўрик натижаси ва тавсияларни киритинг...'
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
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
  );
};

export default EditVisit;
