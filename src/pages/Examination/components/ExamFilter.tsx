const ExamFilter = ({exams,searchQuery}:{exams:Array<any>,searchQuery:string}) => {
  return exams.filter((exam: any) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      exam.patient_id.fullname.toLowerCase().includes(query) ||
      exam.doctor_id.fullname.toLowerCase().includes(query) ||
      exam.patient_id.phone.includes(query)
    );
  });
}

export default ExamFilter