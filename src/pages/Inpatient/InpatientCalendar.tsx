import { useState } from "react";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data types
interface Patient {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  bedNumber: number;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  patients: Patient[];
}

// Mock data - bu keyinchalik real API dan keladi
const mockCorpusData = [
  { id: 1, name: "Corpus 1", rooms: [] },
  { id: 2, name: "Corpus 2", rooms: [] },
  { id: 3, name: "Corpus 3", rooms: [] },
  { id: 4, name: "Corpus 4", rooms: [] },
];

const mockRoomsData: Record<string, Room> = {
  "101-xona": {
    id: "101",
    name: "101-xona",
    capacity: 3,
    patients: [
      {
        id: 1,
        name: "Aliyev Jasur",
        startDate: "24 Noy",
        endDate: "28 Noy",
        bedNumber: 1
      },
      {
        id: 2,
        name: "Karimova Dildora",
        startDate: "25 Noy",
        endDate: "27 Noy",
        bedNumber: 2
      },
      {
        id: 3,
        name: "Toshmatov Ali",
        startDate: "26 Noy",
        endDate: "30 Noy",
        bedNumber: 3
      }
    ]
  },
  "102-xona": {
    id: "102",
    name: "102-xona",
    capacity: 4,
    patients: [
      {
        id: 4,
        name: "Rahimov Bobur",
        startDate: "24 Noy",
        endDate: "29 Noy",
        bedNumber: 1
      },
      {
        id: 5,
        name: "Ismoilov Sardor",
        startDate: "25 Noy",
        endDate: "28 Noy",
        bedNumber: 2
      }
    ]
  },
  "103-xona": {
    id: "103",
    name: "103-xona",
    capacity: 2,
    patients: []
  }
};

const weekDays = [
  { name: "Dushanba", date: "26 Noy", fullDate: "26 Nov" },
  { name: "Seshanba", date: "27 Noy", fullDate: "27 Nov" },
  { name: "Chorshanba", date: "28 Noy", fullDate: "28 Nov" },
  { name: "Payshanba", date: "29 Noy", fullDate: "29 Nov" },
  { name: "Juma", date: "30 Noy", fullDate: "30 Nov" },
  { name: "Shanba", date: "1 Dek", fullDate: "1 Dec" },
  { name: "Yakshanba", date: "2 Dek", fullDate: "2 Dec" },
];

const InpatientCalendar = () => {
  const [selectedCorpus, setSelectedCorpus] = useState(1);
  const [currentWeek, setCurrentWeek] = useState("26 Noy - 2 Dek 2025");

  const isPatientInDay = (patient: Patient, dayDate: string) => {
    // Bu yerda real date comparison bo'ladi
    const dayNum = parseInt(dayDate.split(' ')[0]);
    const startNum = parseInt(patient.startDate.split(' ')[0]);
    const endNum = parseInt(patient.endDate.split(' ')[0]);
    
    return dayNum >= startNum && dayNum <= endNum;
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Стационар Календари</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Хоналар ва беморлар бандлигининг календар кўриниши
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Фильтр
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Бугун
            </Button>
          </div>
        </div>

        {/* Calendar Card */}
        <Card className="card-shadow">
          <CardHeader className="pb-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-lg font-semibold">{currentWeek}</h3>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Corpus Tabs */}
            <Tabs value={selectedCorpus.toString()} onValueChange={(value) => setSelectedCorpus(parseInt(value))}>
              <TabsList className="grid w-full grid-cols-4 mb-4">
                {mockCorpusData.map((corpus) => (
                  <TabsTrigger 
                    key={corpus.id} 
                    value={corpus.id.toString()}
                    className="text-sm font-medium"
                  >
                    {corpus.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCorpus.toString()}>
                <CardContent className="p-0">
                  {/* Calendar Table - Mobile view qo'shimcha responsive scroll */}
                  <div className="overflow-x-auto overflow-y-hidden max-w-full">
                    <div className="min-w-[800px]"> {/* Minimum width to prevent squashing */}
                      <table className="w-full border-collapse table-fixed">
                        {/* Header Row */}
                        <thead>
                          <tr>
                            <th className="border border-gray-300 p-2 sm:p-3 bg-gray-50 w-24 sm:w-32 text-left font-medium text-xs sm:text-sm">
                              Xona / Joy
                            </th>
                            {weekDays.map((day) => (
                              <th key={day.name} className="border border-gray-300 p-2 sm:p-3 bg-gray-50 w-20 sm:w-28 text-center">
                                <div className="font-medium text-xs sm:text-sm">{day.name}</div>
                                <div className="text-xs text-gray-600">{day.date}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>

                        {/* Room Rows */}
                        <tbody>
                          {Object.entries(mockRoomsData).map(([roomKey, room]) => {
                            // Room bandlik holatini hisoblash
                            const occupiedBeds = room.patients.length;
                            const totalCapacity = room.capacity;
                            let roomBgColor = "bg-green-200"; // Bo'sh
                            let roomStatus = "Bo'sh";
                            
                            if (occupiedBeds > 0 && occupiedBeds < totalCapacity) {
                              roomBgColor = "bg-yellow-200"; // Qisman band
                              roomStatus = `${occupiedBeds}/${totalCapacity} Band`;
                            } else if (occupiedBeds === totalCapacity) {
                              roomBgColor = "bg-red-200"; // To'liq band
                              roomStatus = "To'liq Band";
                            }
                            
                            return (
                              <React.Fragment key={roomKey}>
                                {/* Room Header */}
                                <tr className={roomBgColor}>
                                  <td colSpan={8} className="border border-gray-300 p-2 font-semibold text-gray-800">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                      <span className="text-xs sm:text-sm">{room.name}</span>
                                      <span className="text-xs text-gray-600">
                                        {totalCapacity} joylik - {roomStatus}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                                
                                {/* Bed Rows */}
                                {Array.from({ length: room.capacity }, (_, bedIndex) => {
                                  const bedNumber = bedIndex + 1;
                                  const patient = room.patients.find(p => p.bedNumber === bedNumber);
                                  
                                  return (
                                    <tr key={`${roomKey}-bed-${bedNumber}`}>
                                      <td className="border border-gray-300 p-2 sm:p-3 bg-white font-medium text-xs sm:text-sm">
                                        {bedNumber}-joy
                                      </td>
                                      {weekDays.map((day) => (
                                        <td key={`${roomKey}-${bedNumber}-${day.name}`} className="border border-gray-300 p-1 sm:p-2 bg-white">
                                          {patient && isPatientInDay(patient, day.date) ? (
                                            <div className="bg-blue-100 border border-blue-300 text-blue-800 rounded px-1 sm:px-2 py-1 text-xs text-center">
                                              <div className="truncate" title={patient.name}>
                                                {patient.name}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="text-center text-gray-400 text-xs">Bo'sh</div>
                                          )}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default InpatientCalendar;