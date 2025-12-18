import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Image, Plus } from "lucide-react";
import { useState } from "react";
import { ImagingTypeTab } from "./components";
import { MedicalImageTab } from "./components";

const Radiology = () => {
  const [activeTab, setActiveTab] = useState("medical-images");

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Рентген / МРТ / КТ
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Тасвирлаш текширувлари бошқаруви
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
              <span className="hidden sm:inline">Тиббий тасвирлар</span>
              <span className="sm:hidden">Тасвирлар</span>
            </TabsTrigger>

            <TabsTrigger
              value="imaging-types"
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Текшириш турлари</span>
              <span className="sm:hidden">Турлар</span>
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
