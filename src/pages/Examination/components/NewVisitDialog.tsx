import { useCreateExamMutation } from '@/app/api/examinationApi/examinationApi';
import {
  useGetAllPatientQuery,
  useGetPatientByIdQuery,
} from '@/app/api/patientApi/patientApi';
import { useGetUsersQuery } from '@/app/api/userApi/userApi';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
import { Textarea } from '@/components/ui/textarea';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { Activity, FileText, Search, User, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { calculateAge } from './calculateAge';

interface NewVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preSelectedPatientId?: string;
}

const NewVisitDialog = ({
  open,
  onOpenChange,
  onSuccess,
  preSelectedPatientId,
}: NewVisitDialogProps) => {
  const [subjective, setSubjective] = useState('');
  const [description, setDescription] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  // Fetch all patients for search
  const { data: patientsData } = useGetAllPatientQuery({
    page: 1,
    limit: 100,
  });

  // Fetch selected patient details
  const { data: patientData } = useGetPatientByIdQuery(selectedPatientId, {
    skip: !selectedPatientId,
  });

  // Fetch doctors
  const { data: doctorsData } = useGetUsersQuery({
    page: 1,
    limit: 100,
    role: 'doctor',
  });

  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();
  const handleRequest = useHandleRequest();

  const patients = patientsData?.data || [];
  const doctors = doctorsData?.data || [];

  // Auto-select patient if provided
  useEffect(() => {
    if (preSelectedPatientId && open) {
      setSelectedPatientId(preSelectedPatientId);
    }
  }, [preSelectedPatientId, open]);

  // Update patient state when patient data is loaded
  useEffect(() => {
    if (patientData?.data && selectedPatientId) {
      setPatient(patientData.data);
    }
  }, [patientData, selectedPatientId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSubjective('');
        setDescription('');
        setPatient(null);
        setSelectedPatientId('');
        setSelectedDoctorId('');
        setSearchQuery('');
        setShowErrors(false);
      }, 200);
    }
  }, [open]);

  const selectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setPopoverOpen(false);
  };

  const clearPatient = () => {
    setPatient(null);
    setSelectedPatientId('');
    setSearchQuery('');
    setShowErrors(false);
  };

  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      p.fullname.toLowerCase().includes(query) ||
      p.patient_id.toLowerCase().includes(query) ||
      p.phone.includes(query)
    );
  });

  const handleSave = async () => {
    setShowErrors(true);

    if (!selectedPatientId) {
      toast.error('Илтимос, беморни танланг');
      return;
    }
    if (!selectedDoctorId) {
      toast.error('Илтимос, шифокорни танланг');
      return;
    }
    if (!subjective.trim()) {
      toast.error('Илтимос, бемор шикоятини киритинг');
      return;
    }

    await handleRequest({
      request: async () => {
        const request: any = {
          patient_id: selectedPatientId,
          doctor_id: selectedDoctorId,
          complaints: subjective,
        };
        if (description.trim()) {
          request.description = description;
        }
        const res = await createExam(request).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success('Кўрик муваффақиятли яратилди');
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Янги Кўрик Яратиш</DialogTitle>
          <DialogDescription>
            Бемор ва шифокорни танлаб, кўрик маълумотларини киритинг
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Patient Search/Selection */}
          {!patient ? (
            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <User className='w-4 h-4 text-primary' />
                Беморни танланг
              </Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={popoverOpen}
                    className='w-full justify-between h-12'
                  >
                    <span className='flex items-center gap-2'>
                      <Search className='w-4 h-4' />
                      <span className='truncate'>Беморни қидириш...</span>
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0' align='start'>
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder='Исм, ID ёки телефон орқали қидириш...'
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>Бемор топилмади</CommandEmpty>
                      <CommandGroup>
                        {filteredPatients.map((p) => (
                          <CommandItem
                            key={p._id}
                            value={p._id}
                            onSelect={() => selectPatient(p._id)}
                          >
                            <div className='flex flex-col w-full'>
                              <span className='font-medium'>{p.fullname}</span>
                              <span className='text-sm text-muted-foreground'>
                                ID: {p.patient_id} • {p.phone}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <>
              {/* Patient Info Banner */}
              <div className='bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h3 className='font-bold text-lg mb-1'>
                      {patient.fullname}
                      <span className='text-muted-foreground text-sm ml-2'>
                        ({calculateAge(patient.date_of_birth)} ёш,{' '}
                        {patient.gender === 'male' ? 'Эркак' : 'Аёл'})
                      </span>
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      ID: {patient.patient_id} • {patient.phone}
                    </p>
                    {patient?.allergies && patient.allergies.length > 0 && (
                      <div className='px-3 py-2 bg-red-50 border border-red-200 rounded-lg mt-2'>
                        <p className='text-sm font-semibold text-red-600'>
                          ⚠ Аллергия: {patient.allergies.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearPatient}
                    disabled={isCreating}
                  >
                    Ўзгартириш
                  </Button>
                </div>
              </div>

              {/* Doctor Selection */}
              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <UserCog className='w-4 h-4 text-primary' />
                  Шифокорни танланг
                </Label>
                <Select
                  value={selectedDoctorId}
                  onValueChange={setSelectedDoctorId}
                >
                  <SelectTrigger
                    className={`h-12 ${
                      showErrors && !selectedDoctorId ? 'border-red-500' : ''
                    }`}
                  >
                    <SelectValue placeholder='Шифокорни танланг...' />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor: any) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{doctor.fullname}</span>
                          <span className='text-xs text-muted-foreground'>
                            {doctor.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subjective - Complaints */}
              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <FileText className='w-4 h-4 text-primary' />
                  Бемор шикояти (Subjective)
                </Label>
                <Textarea
                  placeholder='Беморнинг шикоятларини, симптомларини ва касаллик тарихини ёзинг...'
                  className={`min-h-24 ${
                    showErrors && !subjective.trim() ? 'border-red-500' : ''
                  }`}
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <Activity className='w-4 h-4 text-primary' />
                  Изоҳ (Objective)
                </Label>
                <Textarea
                  placeholder='Изоҳни ёзинг...'
                  className='min-h-24'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Бекор қилиш
          </Button>
          <Button
            onClick={handleSave}
            disabled={isCreating || !patient}
            className='bg-green-600 hover:bg-green-700'
          >
            {isCreating ? 'Сақланмоқда...' : 'Сақлаш'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewVisitDialog;
