import { MedicationApi } from '@/app/api/medication/medication';
import React from 'react';
import type { MedicationOptionItem } from '../medicationTemplateTypes';

const MEDICATION_LIMIT = 20;

export function useMedicationOptions() {
  const [medicationSearch, setMedicationSearch] = React.useState('');
  const [medicationPage, setMedicationPage] = React.useState(1);
  const [allMedications, setAllMedications] = React.useState<
    MedicationOptionItem[]
  >([]);

  const {
    data: medicationsData,
    isLoading: isMedicationsLoading,
    refetch: refetchMedications,
  } = MedicationApi.useGetAllMedicationsQuery({
    page: medicationPage,
    limit: MEDICATION_LIMIT,
    search: medicationSearch,
  });

  React.useEffect(() => {
    if (!medicationsData?.data) return;

    setAllMedications((prev) => {
      const merged =
        medicationPage === 1
          ? medicationsData.data
          : [...prev, ...medicationsData.data];

      const uniqueById = new Map(
        merged.map((medication) => [medication._id, medication])
      );
      return Array.from(uniqueById.values());
    });
  }, [medicationsData, medicationPage]);

  React.useEffect(() => {
    setMedicationPage(1);
    setAllMedications([]);
  }, [medicationSearch]);

  const hasMoreMedications = medicationsData
    ? medicationPage < medicationsData.pagination.total_pages
    : false;

  const onMedicationListScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrollPercentage =
      (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;

    if (scrollPercentage <= 80 || isMedicationsLoading || !hasMoreMedications) {
      return;
    }

    setMedicationPage((prev) => prev + 1);
  };

  const mergeTemplateMedications = (template: GetResponse) => {
    const templateMedications: MedicationOptionItem[] = template.items
      .map((item) => item.medication_id)
      .filter(
        (
          medication
        ): medication is NonNullable<(typeof template.items)[number]['medication_id']> =>
          medication !== null
      )
      .map((medication) => ({
        _id: medication._id,
        name: medication.name,
        form: medication.form,
        dosage: '',
        is_active: true,
        created_at: '',
        updated_at: '',
      }));

    setAllMedications((prev) => {
      const existingIds = new Set(prev.map((medication) => medication._id));
      const newMedications = templateMedications.filter(
        (medication) => !existingIds.has(medication._id)
      );
      return [...newMedications, ...prev];
    });
  };

  const ensureDefaultMedicationPage = async () => {
    setMedicationSearch('');
    setMedicationPage(1);
    await refetchMedications();
  };

  return {
    medicationSearch,
    setMedicationSearch,
    allMedications,
    isMedicationsLoading,
    hasMoreMedications,
    onMedicationListScroll,
    mergeTemplateMedications,
    ensureDefaultMedicationPage,
  };
}
