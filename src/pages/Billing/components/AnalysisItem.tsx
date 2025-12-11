import { Analysis } from '@/app/api/examinationApi/types';

interface Props {
  analysis: Analysis;
  isMobile?: boolean;
}

export const AnalysisItem = ({ analysis, isMobile = false }: Props) => {
  const analysisType = analysis.analysis_type;
  const code = (analysisType as any)?.code || analysisType?.description || '-';

  if (isMobile) {
    return (
      <div className='p-4 border-b last:border-0'>
        <div className='space-y-2'>
          <div className='flex justify-between items-start'>
            <div>
              <div className='font-semibold text-sm'>
                {analysisType?.name || '-'}
              </div>
              <div className='text-xs text-primary font-medium mt-1'>
                {code}
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
      <td className='py-3 px-4 text-sm'>{analysisType?.name || '-'}</td>
      <td className='py-3 px-4 text-sm'>
        <span className='text-primary font-medium'>{code}</span>
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
