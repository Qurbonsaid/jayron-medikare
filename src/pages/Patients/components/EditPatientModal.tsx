import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { useState } from 'react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  allergies: string[];
  medicalHistory: Array<{ condition: string; year: string }>;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
  familyHistory: Array<{ relative: string; condition: string }>;
}

interface EditPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  onSave: (updatedPatient: Patient) => void;
}

const EditPatientModal = ({
  open,
  onOpenChange,
  patient,
  onSave,
}: EditPatientModalProps) => {
  const [formData, setFormData] = useState<Patient>(patient);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
  });
  const [newMedicalHistory, setNewMedicalHistory] = useState({
    condition: '',
    year: '',
  });
  const [newFamilyHistory, setNewFamilyHistory] = useState({
    relative: '',
    condition: '',
  });

  const handleChange = (field: keyof Patient, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }));
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const handleAddMedication = () => {
    if (newMedication.name.trim() && newMedication.dosage.trim()) {
      setFormData((prev) => ({
        ...prev,
        medications: [...prev.medications, newMedication],
      }));
      setNewMedication({ name: '', dosage: '', frequency: '' });
    }
  };

  const handleRemoveMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleAddMedicalHistory = () => {
    if (newMedicalHistory.condition.trim() && newMedicalHistory.year.trim()) {
      setFormData((prev) => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, newMedicalHistory],
      }));
      setNewMedicalHistory({ condition: '', year: '' });
    }
  };

  const handleRemoveMedicalHistory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index),
    }));
  };

  const handleAddFamilyHistory = () => {
    if (newFamilyHistory.relative.trim() && newFamilyHistory.condition.trim()) {
      setFormData((prev) => ({
        ...prev,
        familyHistory: [...prev.familyHistory, newFamilyHistory],
      }));
      setNewFamilyHistory({ relative: '', condition: '' });
    }
  };

  const handleRemoveFamilyHistory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      familyHistory: prev.familyHistory.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl font-bold'>
            Бемор маълумотларини таҳрирлаш
          </DialogTitle>
          <DialogDescription>
            Бемор маълумотларини янгиланг ва сақланг
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className='flex-1 overflow-hidden flex flex-col'
        >
          <Tabs
            defaultValue='basic'
            className='flex-1 overflow-hidden flex flex-col'
          >
            <TabsList className='grid w-full grid-cols-4 mb-4'>
              <TabsTrigger value='basic' className='text-xs sm:text-sm'>
                Асосий
              </TabsTrigger>
              <TabsTrigger value='medical' className='text-xs sm:text-sm'>
                Тиббий
              </TabsTrigger>
              <TabsTrigger value='medications' className='text-xs sm:text-sm'>
                Дорилар
              </TabsTrigger>
              <TabsTrigger value='family' className='text-xs sm:text-sm'>
                Оилавий
              </TabsTrigger>
            </TabsList>

            <div className='flex-1 overflow-y-auto pr-2'>
              {/* Basic Information */}
              <TabsContent value='basic' className='space-y-4 mt-0'>
                <div className='grid gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>
                      Исм фамилия <span className='text-danger'>*</span>
                    </Label>
                    <Input
                      id='name'
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='age'>
                        Ёш <span className='text-danger'>*</span>
                      </Label>
                      <Input
                        id='age'
                        type='number'
                        value={formData.age}
                        onChange={(e) =>
                          handleChange('age', parseInt(e.target.value))
                        }
                        required
                      />
                    </div>

                    <div className='grid gap-2'>
                      <Label htmlFor='gender'>
                        Жинс <span className='text-danger'>*</span>
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleChange('gender', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Эркак'>Эркак</SelectItem>
                          <SelectItem value='Аёл'>Аёл</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='phone'>
                      Телефон <span className='text-danger'>*</span>
                    </Label>
                    <Input
                      id='phone'
                      type='tel'
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='email'>Электрон почта</Label>
                    <Input
                      id='email'
                      type='email'
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='address'>Манзил</Label>
                    <Textarea
                      id='address'
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Allergies */}
                  <div className='grid gap-2'>
                    <Label>Аллергиялар</Label>
                    <div className='flex gap-2'>
                      <Input
                        placeholder='Аллергия қўшиш'
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAllergy();
                          }
                        }}
                      />
                      <Button type='button' onClick={handleAddAllergy}>
                        Қўшиш
                      </Button>
                    </div>
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {formData.allergies.map((allergy, index) => (
                        <Badge
                          key={index}
                          variant='destructive'
                          className='gap-1'
                        >
                          {allergy}
                          <X
                            className='w-3 h-3 cursor-pointer'
                            onClick={() => handleRemoveAllergy(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Medical History */}
              <TabsContent value='medical' className='space-y-4 mt-0'>
                <div className='space-y-4'>
                  <div className='grid gap-2'>
                    <Label>Тиббий тарих қўшиш</Label>
                    <div className='grid grid-cols-2 gap-2'>
                      <Input
                        placeholder='Касаллик'
                        value={newMedicalHistory.condition}
                        onChange={(e) =>
                          setNewMedicalHistory({
                            ...newMedicalHistory,
                            condition: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder='Йил'
                        value={newMedicalHistory.year}
                        onChange={(e) =>
                          setNewMedicalHistory({
                            ...newMedicalHistory,
                            year: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      type='button'
                      onClick={handleAddMedicalHistory}
                      className='w-full'
                    >
                      Тиббий тарих қўшиш
                    </Button>
                  </div>

                  <div className='space-y-2'>
                    {formData.medicalHistory.map((item, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-3 bg-accent rounded-lg'
                      >
                        <div>
                          <p className='font-semibold'>{item.condition}</p>
                          <p className='text-sm text-muted-foreground'>
                            {item.year}
                          </p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRemoveMedicalHistory(index)}
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Medications */}
              <TabsContent value='medications' className='space-y-4 mt-0'>
                <div className='space-y-4'>
                  <div className='grid gap-2'>
                    <Label>Дори қўшиш</Label>
                    <Input
                      placeholder='Дори номи'
                      value={newMedication.name}
                      onChange={(e) =>
                        setNewMedication({
                          ...newMedication,
                          name: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder='Дозаси'
                      value={newMedication.dosage}
                      onChange={(e) =>
                        setNewMedication({
                          ...newMedication,
                          dosage: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder='Қабул қилиш тартиби'
                      value={newMedication.frequency}
                      onChange={(e) =>
                        setNewMedication({
                          ...newMedication,
                          frequency: e.target.value,
                        })
                      }
                    />
                    <Button
                      type='button'
                      onClick={handleAddMedication}
                      className='w-full'
                    >
                      Дори қўшиш
                    </Button>
                  </div>

                  <div className='space-y-2'>
                    {formData.medications.map((med, index) => (
                      <div
                        key={index}
                        className='flex items-start justify-between p-3 bg-accent rounded-lg'
                      >
                        <div>
                          <p className='font-semibold'>{med.name}</p>
                          <p className='text-sm text-muted-foreground'>
                            {med.dosage}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {med.frequency}
                          </p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRemoveMedication(index)}
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Family History */}
              <TabsContent value='family' className='space-y-4 mt-0'>
                <div className='space-y-4'>
                  <div className='grid gap-2'>
                    <Label>Оилавий тарих қўшиш</Label>
                    <div className='grid grid-cols-2 gap-2'>
                      <Input
                        placeholder='Қариндош'
                        value={newFamilyHistory.relative}
                        onChange={(e) =>
                          setNewFamilyHistory({
                            ...newFamilyHistory,
                            relative: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder='Касаллик'
                        value={newFamilyHistory.condition}
                        onChange={(e) =>
                          setNewFamilyHistory({
                            ...newFamilyHistory,
                            condition: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      type='button'
                      onClick={handleAddFamilyHistory}
                      className='w-full'
                    >
                      Оилавий тарих қўшиш
                    </Button>
                  </div>

                  <div className='space-y-2'>
                    {formData.familyHistory.map((item, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-3 bg-accent rounded-lg'
                      >
                        <div>
                          <p className='font-semibold'>{item.relative}</p>
                          <p className='text-sm text-muted-foreground'>
                            {item.condition}
                          </p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRemoveFamilyHistory(index)}
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className='mt-4 gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Бекор қилиш
            </Button>
            <Button type='submit' className='gradient-primary'>
              Сақлаш
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientModal;
