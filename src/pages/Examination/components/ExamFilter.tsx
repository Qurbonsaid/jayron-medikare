import { ExamDataItem } from '@/app/api/examinationApi/types';

const ExamFilter = ({
  exams,
  searchQuery,
}: {
  exams: Array<ExamDataItem>;
  searchQuery: string;
}) => {
  return exams.filter((exam: ExamDataItem) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      exam.patient_id.fullname.toLowerCase().includes(query) ||
      exam.doctor_id.fullname.toLowerCase().includes(query) ||
      exam.patient_id.phone.includes(query)
    );
  });
};

export default ExamFilter;
