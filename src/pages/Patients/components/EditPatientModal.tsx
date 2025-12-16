import { useUpdatePatientMutation } from '@/app/api/patientApi/patientApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Patient {
  _id: string;
  patient_id: string;
  fullname: string;
  phone: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  address?: string;
  email?: string;
  allergies?: string[];
  regular_medications?: {
    medicine: string;
    schedule: string;
    _id: string;
  }[];
  passport: {
    series: string;
    number: string;
  };
}

interface EditPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  onSuccess?: () => void;
}

const EditPatientModal = ({
  open,
  onOpenChange,
  patient,
  onSuccess,
}: EditPatientModalProps) => {
  const [updatePatient, { isLoading }] = useUpdatePatientMutation();

  const [formData, setFormData] = useState<{
    fullname: string;
    phone: string;
    gender: 'male' | 'female';
    date_of_birth: Date;
    address: string;
    email: string;
    allergies: string[];
    regular_medications: Array<{ medicine: string; schedule: string }>;
    passport: { series: string; number: string };
  }>({
    fullname: patient.fullname,
    phone: patient.phone,
    gender: patient.gender,
    date_of_birth: new Date(patient.date_of_birth),
    address: patient.address || '',
    email: patient.email || '',
    allergies: patient.allergies || [],
    regular_medications:
      patient.regular_medications?.map((med) => ({
        medicine: med.medicine,
        schedule: med.schedule,
      })) || [],
    passport: {
      series: patient.passport.series,
      number: patient.passport.number,
    },
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [medicineInput, setMedicineInput] = useState('');
  const [scheduleInput, setScheduleInput] = useState('');
  const [dateInput, setDateInput] = useState<string | null>(null);

  useEffect(() => {
    if (open && patient) {
      setFormData({
        fullname: patient.fullname,
        phone: patient.phone,
        gender: patient.gender,
        date_of_birth: new Date(patient.date_of_birth),
        address: patient.address || '',
        email: patient.email || '',
        allergies: patient.allergies || [],
        regular_medications:
          patient.regular_medications?.map((med) => ({
            medicine: med.medicine,
            schedule: med.schedule,
          })) || [],
        passport: {
          series: patient.passport.series,
          number: patient.passport.number,
        },
      });
      setDateInput(null);
    }
  }, [patient, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...(prev.allergies || []), newAllergy.trim()],
      }));
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleAddMedication = () => {
    if (medicineInput.trim() && scheduleInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        regular_medications: [
          ...(prev.regular_medications || []),
          {
            medicine: medicineInput.trim(),
            schedule: scheduleInput.trim(),
          },
        ],
      }));
      setMedicineInput('');
      setScheduleInput('');
    }
  };

  const handleRemoveMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      regular_medications:
        prev.regular_medications?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleRequest = useHandleRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await handleRequest({
      request: async () => {
        const result = await updatePatient({
          id: patient._id,
          body: {
            ...formData,
            date_of_birth: format(formData.date_of_birth, 'yyyy-MM-dd'),
            regular_medications: formData.regular_medications?.map((med) => ({
              medicine: med.medicine,
              schedule: med.schedule,
            })),
          },
        }).unwrap();
        return result;
      },
      onSuccess: (data) => {
        toast.success(data?.message);
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err?.data?.error?.msg);
      },
    });
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
            <TabsList className='grid w-full grid-cols-2 mb-4'>
              <TabsTrigger value='basic' className='text-xs sm:text-sm'>
                Асосий маълумотлар
              </TabsTrigger>
              <TabsTrigger value='medical' className='text-xs sm:text-sm'>
                Доимий дорилар
              </TabsTrigger>
            </TabsList>

            <div className='flex-1 overflow-y-auto px-2'>
              {/* Basic Information */}
              <TabsContent value='basic' className='space-y-4 mt-0'>
                <div className='grid gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='fullname'>
                      Исм фамилия <span className='text-danger'>*</span>
                    </Label>
                    <Input
                      id='fullname'
                      value={formData.fullname}
                      onChange={(e) => handleChange('fullname', e.target.value)}
                      required
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='date_of_birth'>
                        Туғилган сана <span className='text-danger'>*</span>
                      </Label>
                      <div className='flex gap-2'>
                        <Input
                          className='border-slate-400 border-2 flex-1'
                          placeholder='КК.ОО.ЙЙЙЙ (01.01.1990)'
                          value={
                            dateInput !== null && dateInput !== undefined
                              ? dateInput
                              : formData.date_of_birth
                              ? format(formData.date_of_birth, 'dd.MM.yyyy')
                              : ''
                          }
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, '');
                            // If empty, clear the input field completely
                            if (value === '') {
                              setDateInput('');
                              // Don't update date_of_birth, let validation handle it
                              return;
                            }
                            const parts = value.split('.');
                            if (parts.length > 3) {
                              value = parts.slice(0, 3).join('.');
                            }
                            const digitsOnly = value.replace(/\./g, '');
                            let formatted = '';
                            if (digitsOnly.length > 0) {
                              formatted = digitsOnly.slice(0, 2);
                              if (digitsOnly.length >= 3) {
                                formatted += '.' + digitsOnly.slice(2, 4);
                              }
                              if (digitsOnly.length >= 5) {
                                formatted += '.' + digitsOnly.slice(4, 8);
                              }
                            }
                            setDateInput(formatted);
                            // Parse complete date only if it's exactly 10 characters
                            if (formatted.length === 10) {
                              const [day, month, year] = formatted.split('.');
                              const dayNum = parseInt(day);
                              const monthNum = parseInt(month);
                              const yearNum = parseInt(year);
                              if (
                                dayNum >= 1 &&
                                dayNum <= 31 &&
                                monthNum >= 1 &&
                                monthNum <= 12 &&
                                yearNum >= 1900 &&
                                yearNum <= new Date().getFullYear()
                              ) {
                                const date = new Date(
                                  yearNum,
                                  monthNum - 1,
                                  dayNum
                                );
                                if (date.getDate() === dayNum) {
                                  handleChange('date_of_birth', date);
                                } else {
                                  // Invalid date, don't update
                                }
                              } else {
                                // Invalid date values, don't update
                              }
                            } else {
                              // Not complete date, don't update the date field
                            }
                          }}
                          onKeyDown={(e) => {
                            // Allow Backspace and Delete to work properly
                            if (e.key === 'Backspace' || e.key === 'Delete') {
                              // If the field is empty or user is trying to delete, allow it
                              const currentValue = e.currentTarget.value;
                              if (currentValue === '' || currentValue.length <= 1) {
                                setDateInput('');
                                // Don't update date_of_birth, let validation handle it
                              }
                            }
                          }}
                          maxLength={10}
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              className='border-2 border-slate-400'
                            >
                              <CalendarIcon className='h-4 w-4' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={formData.date_of_birth}
                              onSelect={(date) => {
                                if (date) {
                                  handleChange('date_of_birth', date);
                                  setDateInput(format(date, 'dd.MM.yyyy'));
                                }
                              }}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className='grid gap-2'>
                      <Label htmlFor='gender'>
                        Жинс <span className='text-danger'>*</span>
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value: 'male' | 'female') =>
                          handleChange('gender', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='male'>Эркак</SelectItem>
                          <SelectItem value='female'>Аёл</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='passport_series'>
                        Паспорт серияси <span className='text-danger'>*</span>
                      </Label>
                      <Input
                        id='passport_series'
                        value={formData.passport.series}
                        onChange={(e) =>
                          handleChange('passport', {
                            ...formData.passport,
                            series: e.target.value.toUpperCase(),
                          })
                        }
                        maxLength={2}
                        placeholder='AA'
                        required
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='passport_number'>
                        Паспорт рақами <span className='text-danger'>*</span>
                      </Label>
                      <Input
                        id='passport_number'
                        value={formData.passport.number}
                        onChange={(e) =>
                          handleChange('passport', {
                            ...formData.passport,
                            number: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        maxLength={7}
                        placeholder='1234567'
                        required
                      />
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
                    {formData.allergies && formData.allergies.length > 0 && (
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
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Medications */}
              <TabsContent value='medical' className='space-y-4 mt-0'>
                <div className='space-y-4 px-2'>
                  <div className='grid gap-2'>
                    <Label>Дори қўшиш</Label>
                    <div className='grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-2'>
                      <Input
                        placeholder='Дори номи'
                        value={medicineInput}
                        onChange={(e) => setMedicineInput(e.target.value)}
                      />
                      <Input
                        placeholder='Қабул вақти'
                        value={scheduleInput}
                        onChange={(e) => setScheduleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMedication();
                          }
                        }}
                      />
                      <Button
                        type='button'
                        size='icon'
                        onClick={handleAddMedication}
                      >
                        <Plus className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>

                  {formData.regular_medications &&
                    formData.regular_medications.length > 0 && (
                      <div className='space-y-2'>
                        {formData.regular_medications.map((med, index) => (
                          <div
                            key={index}
                            className='flex items-start justify-between p-3 bg-accent rounded-lg'
                          >
                            <div>
                              <p className='font-semibold'>{med.medicine}</p>
                              <p className='text-sm text-muted-foreground'>
                                {med.schedule}
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
                    )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className='mt-4 gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Бекор қилиш
            </Button>
            <Button
              type='submit'
              className='gradient-primary'
              disabled={isLoading}
            >
              {isLoading ? 'Сақланмоқда...' : 'Сақлаш'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientModal;
