import { useGetPatientAnalysisByIdQuery } from '@/app/api/patientAnalysisApi/patientAnalysisApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Props {
  analysisId: string;
  isMobile?: boolean;
}

export const AnalysisItem = ({ analysisId, isMobile = false }: Props) => {
  const { data, isLoading } = useGetPatientAnalysisByIdQuery(analysisId);

  if (isLoading) {
    return (
      <div className='py-3 px-4 text-center'>
        <LoadingSpinner className='w-4 h-4 mx-auto' />
      </div>
    );
  }

  if (!data?.data) {
    return null;
  }

  const analysis = data.data;

  if (isMobile) {
    return (
      <div className='p-4 border-b last:border-0'>
        <div className='space-y-2'>
          <div className='flex justify-between items-start'>
            <div>
              <div className='font-semibold text-sm'>
                {analysis.analysis_type.name}
              </div>
              <div className='text-xs text-primary font-medium mt-1'>
                {analysis.analysis_type.code}
              </div>
            </div>
            <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 uppercase'>
              {analysis.status}
            </span>
          </div>
          <div className='text-xs text-muted-foreground'>
            {new Date(analysis.created_at).toLocaleDateString('uz-UZ')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <tr className='border-b last:border-0'>
      <td className='py-3 px-4 text-sm'>{analysis.analysis_type.name}</td>
      <td className='py-3 px-4 text-sm'>
        <span className='text-primary font-medium'>
          {analysis.analysis_type.code}
        </span>
      </td>
      <td className='py-3 px-4 text-sm text-muted-foreground'>-</td>
      <td className='py-3 px-4'>
        <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 uppercase'>
          {analysis.status}
        </span>
      </td>
      <td className='py-3 px-4 text-sm text-right text-muted-foreground'>
        {new Date(analysis.created_at).toLocaleDateString('uz-UZ')}
      </td>
    </tr>
  );
};
