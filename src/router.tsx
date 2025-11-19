import Appointments from "@/pages/Appointments/Appointments";
import Billing from "@/pages/Billing";
import Dashboard from "@/pages/Dashboard";
import Inpatient from "@/pages/Inpatient/Inpatient";
import LabResults from "@/pages/Diagnostika/LabResults";
import PatientPortal from "@/pages/PatientPortal";
import PatientProfile from "@/pages/Patients/PatientProfile";
import Patients from "@/pages/Patients/Patients";
import RadiologyOld from "@/pages/Radiology";
import RadiologyNew from "@/pages/Radiology/RadiologyNew";
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

export const routers = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/patients", element: <Patients /> },
  { path: "/patient/:id", element: <PatientProfile /> },
  { path: "/new-visit", element: <NewVisit /> },
  { path: "/appointments", element: <Appointments /> },
  { path: "/prescription", element: <Prescription /> },
  { path: "/visits", element: <Visits /> },
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
  { path: "/radiology", element: <RadiologyNew /> },
  { path: "/radiology-old", element: <RadiologyOld /> },
  { path: "/settings", element: <Settings /> },
  { path: "/profile", element: <Profil /> },
  { path: "/patient-portal", element: <PatientPortal /> },
];

export const navigator = [
  {
    path: "/dashboard",
    to: null,
    title: "Бош саҳифа",
  },
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
    title: (
      <div>
        <h1 className="text-xl font-bold">Янги Кўрик</h1>
        <p className="text-sm text-muted-foreground">SOAP Ёзув</p>
      </div>
    ),
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
    path: "/medicine",
    to: null,
    title: "Дори-дармон",
  },
  {
    path: "/inpatient/:id",
    to: "/inpatient",
    title: "Стационар",
  },
  {
    path: "/room/:id",
    to: -1,
    title: "Стационар",
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
