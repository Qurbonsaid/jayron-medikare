import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import MedicationTemplates from './MedicationTemplates';
import ServiceTemplates from './ServiceTemplates';

export default function Templates() {
  const { t } = useTranslation('templates');

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>
            {t('pageTitle', 'Шаблонлар')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='medications' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='medications'>
                {t('tabs.medications', 'Дорилар')}
              </TabsTrigger>
              <TabsTrigger value='services'>
                {t('tabs.services', 'Хизматлар')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='medications' className='mt-6'>
              <MedicationTemplates />
            </TabsContent>

            <TabsContent value='services' className='mt-6'>
              <ServiceTemplates />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
