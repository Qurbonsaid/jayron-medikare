import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Image, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagingTypeTab } from "./components";
import { MedicalImageTab } from "./components";

const Radiology = () => {
  const { t } = useTranslation('radiology');
  const [activeTab, setActiveTab] = useState("medical-images");

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {t('title')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="medical-images"
              className="flex items-center gap-2"
            >
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">{t('medicalImages')}</span>
              <span className="sm:hidden">{t('images')}</span>
            </TabsTrigger>

            <TabsTrigger
              value="imaging-types"
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">{t('imagingTypes')}</span>
              <span className="sm:hidden">{t('types')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="medical-images">
            <MedicalImageTab />
          </TabsContent>

          <TabsContent value="imaging-types">
            <ImagingTypeTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Radiology;
