import { useGetOneRoomQuery } from '@/app/api/roomApi';
import type { Patient } from '@/app/api/roomApi/types';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RoleConstants } from '@/constants/Roles';
import { useRouteActions } from '@/hooks/RBS';
import handleIsLeavingToday from '@/lib/handleIsLeavingToday';
import { formatNumber, formatPhoneNumber } from '@/lib/utils';
import { formatDate } from 'date-fns';
import {
  Clock,
  HeartPulse,
  MoreHorizontal,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MeasureBloodPressure } from './components/MeasureBloodPressure';
import { RemovePatient } from './components/RemovePatient';
import { RoomNewPatient } from './components/RoomNewPatient';
import UpdateBloodPressure from './components/UpdateBloodPressure.tsx';
import { UpdateLeaveTime } from './components/UpdateLeaveTime';

const RoomDetail = () => {
  const { t } = useTranslation('inpatient');
  const [showRoomNewPatient, setShowRoomNewPatient] = useState(false);
  const [showRemovePatient, setShowRemovePatient] = useState(false);
  const [showUpdateLeaveTime, setShowUpdateLeaveTime] = useState(false);
  const [showMeasureBloodPressure, setShowMeasureBloodPressure] =
    useState(false);
  const [showUpdateBloodPressure, setShowUpdateBloodPressure] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const [selectedDailyCheckupId, setSelectedDailyCheckupId] = useState<
    string | null
  >(null);

  const { id: roomId } = useParams();

  // Permission checks - CEO, ADMIN, RECEPTIONIST can manage patients, NURSE can measure blood pressure
  const { userRole } = useRouteActions('/room/:id');
  const showActionButtons =
    userRole === RoleConstants.CEO ||
    userRole === RoleConstants.ADMIN ||
    userRole === RoleConstants.RECEPTIONIST || 
    userRole === RoleConstants.DOCTOR || 
    userRole === RoleConstants.NURSE;

  // Nurse can only measure/update blood pressure
  const canMeasureBloodPressure =
    showActionButtons
  const {
    data: room,
    isLoading,
    refetch,
  } = useGetOneRoomQuery({ id: roomId }, { skip: !roomId });

  // Bemorlar uchun qon bosimi ma'lumotlarini room API dan olish
  const patientBloodPressureMap = useMemo(() => {
    const map: Record<
      string,
      { hasData: boolean; checkupId: string | null; lastReading?: string }
    > = {};
    if (room?.data.patients) {
      room.data.patients.forEach((patient: Patient) => {
        const patientId =
          typeof patient.patient === 'string'
            ? patient.patient
            : patient.patient._id;

        const dailyCheckup = patient.daily_checkup;
        map[patientId] = {
          hasData: dailyCheckup?.do_it || false,
          checkupId: dailyCheckup?.daily_checkup_id || null,
          lastReading: undefined, // Room API bu ma'lumotni bermaydi, faqat do_it beradi
        };
      });
    }
    return map;
  }, [room?.data.patients]);

  return (
    <div className='min-h-screen bg-background p-4 sm:p-8 lg:p-12'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold'>
              {t('roomDetails')}
            </h1>
            <p className='text-sm sm:text-base text-muted-foreground'>
              {t('roomDetailsDescription')}
            </p>
          </div>
          {showActionButtons && (
            <Button
              className='w-full sm:w-auto'
              onClick={() => setShowRoomNewPatient(true)}
            >
              <Plus className='mr-2 h-4 w-4' />
              {t('addNewPatient')}
            </Button>
          )}
        </div>

        {isLoading ? (
          <Card className='card-shadow p-8 sm:p-12'>
            <LoadingSpinner
              size='lg'
              text={t('loading')}
              className='justify-center'
            />
          </Card>
        ) : (
          <div className='space-y-4'>
            <Card className='card-shadow p-4 lg:p-6'>
              <div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-6'>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground'>
                    {t('roomName')}
                  </h3>
                  <p className='mt-1 text-lg font-semibold'>
                    {room?.data.room_name || t('notSpecified')}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground'>
                    {t('roomPrice')}
                  </h3>

                  <p className='mt-1 text-lg font-semibold'>
                    {formatNumber(room?.data.room_price)} {t('sum')}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground'>
                    {t('capacityLabel')}
                  </h3>

                  <p className='mt-1 text-lg font-semibold'>
                    {room?.data.patient_capacity || t('notSpecified')} {t('persons')}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground'>
                    {t('occupancy')}
                  </h3>

                  <p
                    className={`mt-1 text-lg font-semibold ${room?.data.patient_occupied
                        ? room.data.patient_occupied ===
                          room.data.patient_capacity
                          ? 'text-red-600'
                          : 'text-yellow-600'
                        : 'text-green-600'
                      }`}
                  >
                    {room?.data.patient_occupied
                      ? room.data.patient_occupied ===
                        room.data.patient_capacity
                        ? t('fullyOccupied')
                        : t('occupiedCount', { count: room.data.patient_occupied })
                      : t('empty')}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground'>
                    {t('roomFloor')}
                  </h3>

                  <p className='mt-1 text-lg font-semibold'>
                    {room?.data.floor_number
                      ? room.data.floor_number + ' - ' + t('floorSuffix')
                      : t('notSpecified')}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground'>
                    {t('description')}
                  </h3>

                  <p className='mt-1 text-md font-semibold'>
                    <Tooltip>
                      <TooltipTrigger>
                        <span>
                          {room?.data.description
                            ? room?.data.description.length > 15
                              ? room?.data.description.slice(0, 15) + '...'
                              : room?.data.description
                            : t('notProvided')}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {room?.data.description || t('notProvided')}
                      </TooltipContent>
                    </Tooltip>
                  </p>
                </div>
              </div>
            </Card>

            <Card className='card-shadow p-4 lg:p-6'>
              {room?.data.patients && room?.data.patients.length > 0 ? (
                <div className='w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6'>
                  {room?.data.patients.map((patient) => {
                    const patientData =
                      typeof patient.patient === 'string'
                        ? null
                        : patient.patient;

                    return (
                      <Card
                        key={patient._id}
                        className={`p-4 transition-smooth relative ${handleIsLeavingToday(patient.estimated_leave_time)
                            ? 'border-red-500 bg-red-100 hover:bg-red-200'
                            : 'bg-green-100 border-green-500/50 hover:bg-green-200'
                          }`}
                      >
                        {showActionButtons && (
                          <div className='absolute top-4 right-4'>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div
                                  className='w-8 h-6 flex items-center justify-center border border-green-500/50 bg-transparent hover:bg-green-500/20 rounded cursor-pointer'
                                >
                                  <MoreHorizontal className='w-5 h-5 text-black' />
                                </div>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() => {
                                    const bpData =
                                      patientBloodPressureMap[
                                      patientData?._id || ''
                                      ];
                                    if (bpData?.hasData && bpData.checkupId) {
                                      setShowUpdateBloodPressure(true);
                                      setSelectedPatientId(
                                        patientData?._id || null
                                      );
                                      setSelectedDailyCheckupId(
                                        bpData.checkupId
                                      );
                                    } else {
                                      setShowMeasureBloodPressure(true);
                                      setSelectedPatientId(
                                        patientData?._id || null
                                      );
                                    }
                                  }}
                                  className='flex items-center gap-2 cursor-pointer hover:bg-blue-100'
                                >
                                  <HeartPulse className='w-4 h-4' />
                                  <span>
                                    {patientBloodPressureMap[
                                      patientData?._id || ''
                                    ]?.hasData
                                      ? t('change')
                                      : t('bloodPressure')}
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setShowUpdateLeaveTime(true);
                                    setSelectedPatientId(
                                      patientData?._id || null
                                    );
                                  }}
                                  className='flex items-center gap-2 cursor-pointer hover:bg-yellow-100'
                                >
                                  <Clock className='w-4 h-4' />
                                  <span>{t('changeLeaveTime')}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setShowRemovePatient(true);
                                    setSelectedPatientId(
                                      patientData?._id || null
                                    );
                                  }}
                                  className='flex items-center gap-2 cursor-pointer hover:bg-red-100'
                                >
                                  <Trash2 className='w-4 h-4' />
                                  <span>{t('discharge')}</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                        <div className='flex flex-col items-center text-center space-y-2'>
                          <User className='h-8 w-8' />
                          <div className='font-bold text-sm'>
                            <span>{patientData?.fullname}</span>
                          </div>

                          <span className='text-sm font-semibold'>
                            {t('phone')}{' '}
                            <strong>
                              {formatPhoneNumber(patientData?.phone)}
                            </strong>
                          </span>

                          <span className='text-sm font-semibold'>
                            {t('arrivedDate')}{' '}
                            <strong>
                              {formatDate(
                                new Date(patient?.start_date),
                                'dd.MM.yyyy'
                              )}
                            </strong>
                          </span>

                          <p className='text-sm font-medium'>
                            {t('leavingDate')}
                            <strong>
                              {formatDate(
                                new Date(patient?.estimated_leave_time),
                                'dd.MM.yyyy'
                              )}
                            </strong>
                          </p>

                          <Badge
                            variant={
                              patientBloodPressureMap[patientData?._id || '']
                                ?.hasData
                                ? 'default'
                                : 'secondary'
                            }
                            className={`text-xs ${canMeasureBloodPressure ? 'cursor-pointer hover:opacity-80' : ''}`}
                            onClick={() => {
                              if (!canMeasureBloodPressure) return;
                              const bpData =
                                patientBloodPressureMap[patientData?._id || ''];
                              if (bpData?.hasData && bpData.checkupId) {
                                setShowUpdateBloodPressure(true);
                                setSelectedPatientId(patientData?._id || null);
                                setSelectedDailyCheckupId(bpData.checkupId);
                              } else {
                                setShowMeasureBloodPressure(true);
                                setSelectedPatientId(patientData?._id || null);
                              }
                            }}
                          >
                            {patientBloodPressureMap[patientData?._id || '']
                              ?.hasData
                              ? t('pressureMeasured')
                              : t('pressureNotMeasured')}
                          </Badge>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className='flex items-center justify-center'>
                  <h3>{t('noPatientsFound')}</h3>
                </div>
              )}
            </Card>
          </div>
        )}

        <RoomNewPatient
          open={showRoomNewPatient}
          onOpenChange={setShowRoomNewPatient}
        />

        <RemovePatient
          open={showRemovePatient}
          onOpenChange={setShowRemovePatient}
          patient_id={selectedPatientId}
        />
        <UpdateLeaveTime
          open={showUpdateLeaveTime}
          onOpenChange={setShowUpdateLeaveTime}
          patient_id={selectedPatientId}
        />
        <MeasureBloodPressure
          open={showMeasureBloodPressure}
          onOpenChange={setShowMeasureBloodPressure}
          patient_id={selectedPatientId}
          room_id={roomId || null}
          refetch={refetch}
        />
        <UpdateBloodPressure
          open={showUpdateBloodPressure}
          onOpenChange={setShowUpdateBloodPressure}
          dailyCheckupId={selectedDailyCheckupId}
          refetch={refetch}
        />
      </div>
    </div>
  );
};

export default RoomDetail;
