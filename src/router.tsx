import Appointments from "@/pages/Appointments/Appointments";
// import Dashboard from "@/pages/Dashboard";
import Inpatient from "@/pages/Inpatient/Inpatient";
import LabResults from "@/pages/Diagnostika/LabResults";
import PatientPortal from "@/pages/PatientPortal";
import PatientProfile from "@/pages/Patients/PatientProfile";
import Patients from "@/pages/Patients/Patients";
import Radiology from "@/pages/Radiology/RadiologyNew";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Tizim/Settings";
import LabOrder from "@/pages/Diagnostika/LabOrder";
import Profil from "./pages/Tizim/Profil";
import AddDiagnostika from "./pages/Diagnostika/AddDiagnostika";
import NewVisit from "./pages/Examination/NewVisit";
import Prescription from "./pages/Examination/Prescription";
import Visits from "./pages/Examination/Visits";
import AnalysisParamsModal from "./pages/Diagnostika/AnalysisParamsModal";
import Rooms from "./pages/Rooms/Rooms";
import Medicine from "./pages/Medicine/Medicine";
import RoomDetail from "./pages/RoomDetail/RoomDetail";
import ExaminationDetail from "./pages/Examination/ExaminationDetail";
import Service from "./pages/Examination/Service/Service";
import Billing from "./pages/Billing/Billing";

export const routers = [
  // { path: "/dashboard", element: <Dashboard /> },
  { path: "/patients", element: <Patients /> },
  { path: "/patient/:id", element: <PatientProfile /> },
  { path: "/new-visit", element: <NewVisit /> },
  { path: "/examination/:id", element: <ExaminationDetail /> },
  { path: "/appointments", element: <Appointments /> },
  { path: "/prescription", element: <Prescription /> },
  { path: "/visits", element: <Visits /> },
  // { path: "/disease", element: <Disease /> },
  { path: "/service", element: <Service /> },
  { path: "/add-diagnostika", element: <AddDiagnostika /> },
  { path: "/analysisById/:id", element: <AnalysisParamsModal /> },
  { path: "/lab-order", element: <LabOrder /> },
  { path: "/inpatient", element: <Inpatient /> },
  { path: "/inpatient/:id", element: <Rooms /> },
  { path: "/room/:id", element: <RoomDetail /> },
  { path: "/medicine", element: <Medicine /> },
  { path: "/lab-results", element: <LabResults /> },
  { path: "/billing", element: <Billing /> },
  { path: "/reports", element: <Reports /> },
  { path: "/radiology", element: <Radiology /> },
  { path: "/settings", element: <Settings /> },
  { path: "/profile", element: <Profil /> },
  { path: "/patient-portal", element: <PatientPortal /> },
];

export const navigator = [
  // {
  //   path: "/dashboard",
  //   to: null,
  //   title: "Бош саҳифа",
  // },
  {
    path: "/patients",
    to: null,
    title: "Беморлар",
  },
  {
    path: "/patient/:id",
    to: "/patients",
    title: "Бемор профили",
  },
  {
    path: "/new-visit",
    to: null,
    title: "Янги Кўрик",
  },
  {
    path: "/appointments",
    to: null,
    title: "Учрашувлар",
  },
  {
    path: "/prescription",
    to: null,
    title: "Рецептлар",
  },
  {
    path: "/visits",
    to: null,
    title: "Кўриклар",
  },
  {
    path: "/disease",
    to: null,
    title: "Касалликлар",
  },
  {
    path: "/service",
    to: null,
    title: "Хизматлар",
  },
  {
    path: "/examination/:id",
    to: "/visits",
    title: "Кўрик Тафсилотлари",
  },
  {
    path: "/add-diagnostika",
    to: null,
    title: "Диагностика қўшиш",
  },
  {
    path: "/analysisById/:id",
    to: null,
    title: "Tahlil parametrlari",
  },
  {
    path: "/lab-order",
    to: null,
    title: "Лаборатория буюртмаси",
  },
  {
    path: "/inpatient",
    to: null,
    title: "Стационар",
  },
  {
    path: "/inpatient/:id",
    to: "/inpatient",
    title: "Стационар",
  },
  {
    path:"/medicine",
    to:null,
    title:"Дори-дармонлар",
  },
  {
    path: "/lab-results",
    to: null,
    title: "Таҳлил натижалари",
  },
  {
    path: "/billing",
    to: null,
    title: "Ҳисоб-китоб",
  },
  {
    path: "/reports",
    to: null,
    title: "Ҳисоботлар",
  },
  {
    path: "/radiology",
    to: null,
    title: "Рентген",
  },
  {
    path: "/settings",
    to: null,
    title: (
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Созламалар</h1>
          <p className="text-sm text-muted-foreground">
            Тизим ва фойдаланувчи созламалари
          </p>
        </div>
      </div>
    ),
  },
  {
    path: "/profile",
    to: null,
    title: "Профил",
  },
  {
    path: "/patient-portal",
    to: null,
    title: "Бемор портали",
  },
];
