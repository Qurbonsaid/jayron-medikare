import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Filter, Phone, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewPatient from './components/NewPatient';

const Patients = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const allPatients = [
    {
      id: 'P-001',
      name: 'Алиев Жасур Абдуллаевич',
      age: 35,
      gender: 'Эркак',
      diagnosis: 'Ichterlama',
      phone: '+998 90 123 45 67',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-002',
      name: 'Каримова Нодира Рахимовна',
      age: 42,
      gender: 'Аёл',
      diagnosis: "Nam yo'tal",
      phone: '+998 91 234 56 78',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-003',
      name: 'Усмонов Азиз Шухратович',
      age: 28,
      gender: 'Эркак',
      diagnosis: 'Oq qon',
      phone: '+998 93 345 67 89',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-004',
      name: 'Рахимова Малика Ахмедовна',
      age: 55,
      gender: 'Аёл',
      diagnosis: "Ko'r ichak",
      phone: '+998 94 456 78 90',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-005',
      name: 'Хасанов Фаррух Баходирович',
      age: 31,
      gender: 'Эркак',
      diagnosis: 'Ich ketishi',
      phone: '+998 95 567 89 01',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-006',
      name: 'Турсунова Гулнора Азимовна',
      age: 39,
      gender: 'Аёл',
      diagnosis: 'Qandli diabet',
      phone: '+998 90 678 12 34',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-007',
      name: 'Эргашев Санжар Олимович',
      age: 45,
      gender: 'Эркак',
      diagnosis: 'Gipertaniya',
      phone: '+998 91 789 23 45',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-008',
      name: 'Абдуллаева Дилноза Рустамовна',
      age: 29,
      gender: 'Аёл',
      diagnosis: 'Anemiya',
      phone: '+998 93 890 34 56',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-009',
      name: 'Исмоилов Жахонгир Собирович',
      age: 52,
      gender: 'Эркак',
      diagnosis: 'Bronxit',
      phone: '+998 94 901 45 67',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-010',
      name: 'Назарова Шахноза Улугбековна',
      age: 33,
      gender: 'Аёл',
      diagnosis: 'Migren',
      phone: '+998 95 012 56 78',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-011',
      name: 'Холдоров Бахтиёр Мухаммадович',
      age: 48,
      gender: 'Эркак',
      diagnosis: 'Artrit',
      phone: '+998 90 123 67 89',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-012',
      name: 'Юлдашева Дилдора Акрамовна',
      age: 37,
      gender: 'Аёл',
      diagnosis: 'Gastrit',
      phone: '+998 91 234 78 90',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-013',
      name: 'Раҳмонов Элёр Тошматович',
      age: 41,
      gender: 'Эркак',
      diagnosis: 'Oshqozon yarasi',
      phone: '+998 93 345 89 01',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-014',
      name: 'Саидова Малохат Шермухамедовна',
      age: 26,
      gender: 'Аёл',
      diagnosis: 'Allergiya',
      phone: '+998 94 456 90 12',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-015',
      name: 'Ахмедов Отабек Элмуродович',
      age: 34,
      gender: 'Эркак',
      diagnosis: 'Sinusit',
      phone: '+998 95 567 01 23',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-016',
      name: 'Мирзаева Нигора Кодировна',
      age: 50,
      gender: 'Аёл',
      diagnosis: 'Tiroid bezasi',
      phone: '+998 90 678 23 45',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-017',
      name: 'Султонов Дилшод Абдумуродович',
      age: 44,
      gender: 'Эркак',
      diagnosis: 'Podagra',
      phone: '+998 91 789 34 56',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-018',
      name: 'Жўраева Феруза Камолидиновна',
      age: 38,
      gender: 'Аёл',
      diagnosis: 'Osteoporoz',
      phone: '+998 93 890 45 67',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-019',
      name: 'Умаров Sardor Исроилович',
      age: 27,
      gender: 'Эркак',
      diagnosis: 'Pneumonia',
      phone: '+998 94 901 56 78',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-020',
      name: 'Азизова Зебо Мухтаровна',
      age: 46,
      gender: 'Аёл',
      diagnosis: 'Toshsimon kasallik',
      phone: '+998 95 012 67 89',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-021',
      name: 'Ташманов Жавлон Нуриллаевич',
      age: 53,
      gender: 'Эркак',
      diagnosis: 'Yurak ishemik',
      phone: '+998 90 123 78 90',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-022',
      name: 'Камилова Севара Улугбековна',
      age: 32,
      gender: 'Аёл',
      diagnosis: 'Alergodermatit',
      phone: '+998 91 234 89 01',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-023',
      name: 'Ходжаев Бобур Азаматович',
      age: 40,
      gender: 'Эркак',
      diagnosis: 'Revmatizm',
      phone: '+998 93 345 90 12',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-024',
      name: 'Нуриддинова Лола Саидовна',
      age: 25,
      gender: 'Аёл',
      diagnosis: "Qon yo'qolish",
      phone: '+998 94 456 01 23',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-025',
      name: 'Собиров Элбек Махмудович',
      age: 49,
      gender: 'Эркак',
      diagnosis: 'Sirroz',
      phone: '+998 95 567 12 34',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-026',
      name: 'Рашидова Мухаббат Алишеровна',
      age: 36,
      gender: 'Аёл',
      diagnosis: 'Diskineziya',
      phone: '+998 90 678 34 56',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-027',
      name: 'Файзуллаев Акрам Шерзодович',
      age: 43,
      gender: 'Эркак',
      diagnosis: 'Pankreatit',
      phone: '+998 91 789 45 67',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-028',
      name: 'Олимова Гулрух Ботировна',
      age: 30,
      gender: 'Аёл',
      diagnosis: 'Kollit',
      phone: '+998 93 890 56 78',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-029',
      name: 'Махмудов Жасур Нодирович',
      age: 51,
      gender: 'Эркак',
      diagnosis: 'Tuxumdon sisti',
      phone: '+998 94 901 67 89',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-030',
      name: 'Исламова Дилбар Хамидовна',
      age: 28,
      gender: 'Аёл',
      diagnosis: 'Endometrioz',
      phone: '+998 95 012 78 90',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-031',
      name: 'Шарипов Улугбек Фаррухович',
      age: 47,
      gender: 'Эркак',
      diagnosis: 'Prostatit',
      phone: '+998 90 123 89 01',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-032',
      name: 'Мусаева Нилуфар Сулаймоновна',
      age: 35,
      gender: 'Аёл',
      diagnosis: 'Mastit',
      phone: '+998 91 234 90 12',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-033',
      name: 'Очилов Баходир Рустамович',
      age: 42,
      gender: 'Эркак',
      diagnosis: 'Gemorroy',
      phone: '+998 93 345 01 23',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-034',
      name: 'Каримова Дилафруз Абдувохидовна',
      age: 24,
      gender: 'Аёл',
      diagnosis: 'Varikoz',
      phone: '+998 94 456 12 34',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-035',
      name: 'Давронов Шухрат Анварович',
      age: 54,
      gender: 'Эркак',
      diagnosis: 'Ateroskleroz',
      phone: '+998 95 567 23 45',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-036',
      name: 'Якубова Зумрад Ахадовна',
      age: 33,
      gender: 'Аёл',
      diagnosis: 'Tromboz',
      phone: '+998 90 678 45 67',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-037',
      name: 'Назаров Шерзод Махмудович',
      age: 45,
      gender: 'Эркак',
      diagnosis: 'Insult',
      phone: '+998 91 789 56 78',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-038',
      name: 'Хусанова Малика Шакировна',
      age: 29,
      gender: 'Аёл',
      diagnosis: 'Epilepsiya',
      phone: '+998 93 890 67 89',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-039',
      name: 'Турсунов Бахром Азизович',
      age: 56,
      gender: 'Эркак',
      diagnosis: 'Parkinson',
      phone: '+998 94 901 78 90',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-040',
      name: 'Асқарова Нигина Толибовна',
      age: 31,
      gender: 'Аёл',
      diagnosis: 'Shizofreniya',
      phone: '+998 95 012 89 01',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-041',
      name: 'Рахимов Анвар Султонович',
      age: 48,
      gender: 'Эркак',
      diagnosis: 'Depressiya',
      phone: '+998 90 123 90 12',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-042',
      name: 'Мухаммедова Гулчехра Ибрагимовна',
      age: 37,
      gender: 'Аёл',
      diagnosis: 'Nevrastaniya',
      phone: '+998 91 234 01 23',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-043',
      name: 'Хайдаров Фазлиддин Мирзаевич',
      age: 41,
      gender: 'Эркак',
      diagnosis: 'Astma',
      phone: '+998 93 345 12 34',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-044',
      name: 'Юнусова Дилноза Содиқовна',
      age: 26,
      gender: 'Аёл',
      diagnosis: 'Tuberkulyoz',
      phone: '+998 94 456 23 45',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-045',
      name: 'Абдураҳмонов Жахонгир Баходирович',
      age: 50,
      gender: 'Эркак',
      diagnosis: 'Silikoz',
      phone: '+998 95 567 34 56',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-046',
      name: 'Сулаймонова Нилуфар Рашидовна',
      age: 34,
      gender: 'Аёл',
      diagnosis: 'Emfizema',
      phone: '+998 90 678 56 78',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-047',
      name: 'Латипов Жамшид Насриддинович',
      age: 44,
      gender: 'Эркак',
      diagnosis: 'Plevrit',
      phone: '+998 91 789 67 89',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-048',
      name: 'Абдуллоева Санобар Каримовна',
      age: 38,
      gender: 'Аёл',
      diagnosis: 'Laringit',
      phone: '+998 93 890 78 90',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-049',
      name: 'Ахмедов Дилшод Авазович',
      age: 27,
      gender: 'Эркак',
      diagnosis: 'Faringit',
      phone: '+998 94 901 89 01',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-050',
      name: 'Нурметова Севара Улуғбековна',
      age: 46,
      gender: 'Аёл',
      diagnosis: 'Tonzillit',
      phone: '+998 95 012 90 12',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-051',
      name: 'Умаров Фаррух Ботирович',
      age: 53,
      gender: 'Эркак',
      diagnosis: 'Otit',
      phone: '+998 90 111 22 33',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-052',
      name: 'Саидова Гулноза Абдувалиевна',
      age: 32,
      gender: 'Аёл',
      diagnosis: 'Genit',
      phone: '+998 91 222 33 44',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-053',
      name: 'Тошматов Санжар Олимович',
      age: 40,
      gender: 'Эркак',
      diagnosis: 'Konjunktivit',
      phone: '+998 93 333 44 55',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-054',
      name: 'Рахматова Лола Азизовна',
      age: 25,
      gender: 'Аёл',
      diagnosis: 'Glaukoma',
      phone: '+998 94 444 55 66',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-055',
      name: 'Каримов Элбек Маҳмудович',
      age: 49,
      gender: 'Эркак',
      diagnosis: 'Katarakta',
      phone: '+998 95 555 66 77',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-056',
      name: 'Азизова Мухаббат Улуғбековна',
      age: 36,
      gender: 'Аёл',
      diagnosis: 'Retinit',
      phone: '+998 90 666 77 88',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-057',
      name: 'Исмоилов Акрам Жалолович',
      age: 43,
      gender: 'Эркак',
      diagnosis: 'Stomatit',
      phone: '+998 91 777 88 99',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-058',
      name: 'Махмудова Гулрух Шермухамедовна',
      age: 30,
      gender: 'Аёл',
      diagnosis: 'Gingivit',
      phone: '+998 93 888 99 00',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-059',
      name: 'Жураев Жасур Олимжонович',
      age: 51,
      gender: 'Эркак',
      diagnosis: 'Periodontit',
      phone: '+998 94 999 00 11',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-060',
      name: 'Юсупова Дилбар Нодировна',
      age: 28,
      gender: 'Аёл',
      diagnosis: 'Karies',
      phone: '+998 95 000 11 22',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-061',
      name: 'Шарипов Улуғбек Баходирович',
      age: 47,
      gender: 'Эркак',
      diagnosis: 'Dermatit',
      phone: '+998 90 111 33 44',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-062',
      name: 'Нурова Нилуфар Камиловна',
      age: 35,
      gender: 'Аёл',
      diagnosis: 'Ekzema',
      phone: '+998 91 222 44 55',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-063',
      name: 'Очилов Баҳодир Мирзаевич',
      age: 42,
      gender: 'Эркак',
      diagnosis: 'Psoriaz',
      phone: '+998 93 333 55 66',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-064',
      name: 'Холова Дилафруз Толибовна',
      age: 24,
      gender: 'Аёл',
      diagnosis: 'Urtikaria',
      phone: '+998 94 444 66 77',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-065',
      name: 'Давронов Шухрат Жавлонович',
      age: 54,
      gender: 'Эркак',
      diagnosis: 'Qotur',
      phone: '+998 95 555 77 88',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-066',
      name: 'Якубова Зумрад Шермухамедовна',
      age: 33,
      gender: 'Аёл',
      diagnosis: 'Akne',
      phone: '+998 90 666 88 99',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-067',
      name: 'Назаров Шерзод Алишерович',
      age: 45,
      gender: 'Эркак',
      diagnosis: 'Furunkul',
      phone: '+998 91 777 99 00',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-068',
      name: 'Хусанова Малика Рустамовна',
      age: 29,
      gender: 'Аёл',
      diagnosis: 'Abses',
      phone: '+998 93 888 00 11',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-069',
      name: 'Турсунов Бахром Нодирович',
      age: 56,
      gender: 'Эркак',
      diagnosis: 'Flegmona',
      phone: '+998 94 999 11 22',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-070',
      name: 'Аскарова Нигина Махмудовна',
      age: 31,
      gender: 'Аёл',
      diagnosis: 'Limfadenit',
      phone: '+998 95 000 22 33',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-071',
      name: 'Рахимов Анвар Улуғбекович',
      age: 48,
      gender: 'Эркак',
      diagnosis: 'Peritonit',
      phone: '+998 90 111 44 55',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-072',
      name: 'Мухаммедова Гулчехра Собировна',
      age: 37,
      gender: 'Аёл',
      diagnosis: 'Appenditsit',
      phone: '+998 91 222 55 66',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-073',
      name: 'Хайдаров Фазлиддин Баходирович',
      age: 41,
      gender: 'Эркак',
      diagnosis: 'Xolesistit',
      phone: '+998 93 333 66 77',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-074',
      name: 'Юнусова Дилноза Рашидовна',
      age: 26,
      gender: 'Аёл',
      diagnosis: 'Nefrit',
      phone: '+998 94 444 77 88',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-075',
      name: 'Абдурахмонов Жахонгир Маҳмудович',
      age: 50,
      gender: 'Эркак',
      diagnosis: 'Pielonefrit',
      phone: '+998 95 555 88 99',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-076',
      name: 'Сулаймонова Нилуфар Абдувалиевна',
      age: 34,
      gender: 'Аёл',
      diagnosis: 'Glomerulonefrit',
      phone: '+998 90 666 99 00',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-077',
      name: 'Латипов Жамшид Олимович',
      age: 44,
      gender: 'Эркак',
      diagnosis: 'Sistit',
      phone: '+998 91 777 00 11',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-078',
      name: 'Абдуллоева Санобар Жалоловна',
      age: 38,
      gender: 'Аёл',
      diagnosis: 'Uretrit',
      phone: '+998 93 888 11 22',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-079',
      name: 'Ахмедов Дилшод Шерзодович',
      age: 27,
      gender: 'Эркак',
      diagnosis: 'Adenoma',
      phone: '+998 94 999 22 33',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-080',
      name: 'Нурметова Севара Маҳмудовна',
      age: 46,
      gender: 'Аёл',
      diagnosis: 'Mioma',
      phone: '+998 95 000 33 44',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-081',
      name: 'Умаров Фаррух Азизович',
      age: 53,
      gender: 'Эркак',
      diagnosis: 'Lipoma',
      phone: '+998 90 111 55 66',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-082',
      name: 'Саидова Гулноза Толибовна',
      age: 32,
      gender: 'Аёл',
      diagnosis: 'Fibroma',
      phone: '+998 91 222 66 77',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-083',
      name: 'Тошматов Санжар Улуғбекович',
      age: 40,
      gender: 'Эркак',
      diagnosis: 'Papilloma',
      phone: '+998 93 333 77 88',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-084',
      name: 'Рахматова Лола Рашидовна',
      age: 25,
      gender: 'Аёл',
      diagnosis: 'Polip',
      phone: '+998 94 444 88 99',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-085',
      name: 'Каримов Элбек Баходирович',
      age: 49,
      gender: 'Эркак',
      diagnosis: 'Kista',
      phone: '+998 95 555 99 00',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-086',
      name: 'Азизова Мухаббат Камиловна',
      age: 36,
      gender: 'Аёл',
      diagnosis: 'Gemangioma',
      phone: '+998 90 666 00 11',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-087',
      name: 'Исмоилов Акрам Нодирович',
      age: 43,
      gender: 'Эркак',
      diagnosis: 'Nevus',
      phone: '+998 91 777 11 22',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-088',
      name: 'Махмудова Гулрух Олимовна',
      age: 30,
      gender: 'Аёл',
      diagnosis: 'Verruka',
      phone: '+998 93 888 22 33',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-089',
      name: 'Жураев Жасур Маҳмудович',
      age: 51,
      gender: 'Эркак',
      diagnosis: 'Aterma',
      phone: '+998 94 999 33 44',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-090',
      name: 'Юсупова Дилбар Шермухамедовна',
      age: 28,
      gender: 'Аёл',
      diagnosis: 'Lipodistrofiya',
      phone: '+998 95 000 44 55',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-091',
      name: 'Шарипов Улуғбек Жалолович',
      age: 47,
      gender: 'Эркак',
      diagnosis: 'Sarkoidoz',
      phone: '+998 90 111 66 77',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-092',
      name: 'Нурова Нилуфар Абдувалиевна',
      age: 35,
      gender: 'Аёл',
      diagnosis: 'Amillo idoz',
      phone: '+998 91 222 77 88',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-093',
      name: 'Очилов Баходир Рустамович',
      age: 42,
      gender: 'Эркак',
      diagnosis: 'Gemoxromatoz',
      phone: '+998 93 333 88 99',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-094',
      name: 'Холова Дилафруз Собировна',
      age: 24,
      gender: 'Аёл',
      diagnosis: 'Porfiriniya',
      phone: '+998 94 444 99 00',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-095',
      name: 'Давронов Шухрат Нодирович',
      age: 54,
      gender: 'Эркак',
      diagnosis: 'Fenilketonuriya',
      phone: '+998 95 555 00 11',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-096',
      name: 'Якубова Зумрад Толибовна',
      age: 33,
      gender: 'Аёл',
      diagnosis: 'Galaktozemiya',
      phone: '+998 90 666 11 22',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-097',
      name: 'Назаров Шерзод Маҳмудович',
      age: 45,
      gender: 'Эркак',
      diagnosis: 'Mukopolisaxaridoz',
      phone: '+998 91 777 22 33',
      doctor: 'Др. Каримов',
    },
    {
      id: 'P-098',
      name: 'Хусанова Малика Камиловна',
      age: 29,
      gender: 'Аёл',
      diagnosis: 'Vilson kasalligi',
      phone: '+998 93 888 33 44',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-099',
      name: 'Турсунов Бахром Улуғбекович',
      age: 56,
      gender: 'Эркак',
      diagnosis: 'Gemofiliya',
      phone: '+998 94 999 44 55',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-100',
      name: 'Аскарова Нигина Рашидовна',
      age: 31,
      gender: 'Аёл',
      diagnosis: 'Trombositopeniya',
      phone: '+998 95 000 55 66',
      doctor: 'Др. Каримов',
    },
  ];

  const filteredPatients = allPatients.filter((p) => {
    // Search filter
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);

    // Gender filter
    const matchesGender =
      genderFilter === 'all' ||
      (genderFilter === 'male' && p.gender === 'Эркак') ||
      (genderFilter === 'female' && p.gender === 'Аёл');

    // Doctor filter
    const matchesDoctor = doctorFilter === 'all' || p.doctor === doctorFilter;

    return matchesSearch && matchesGender && matchesDoctor;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const patients = filteredPatients.slice(startIndex, endIndex);

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold mb-1 sm:mb-2'>
              Беморлар Рўйхати
            </h1>
            <p className='text-sm sm:text-base text-muted-foreground'>
              Барча беморларни кўриш ва бошқариш
            </p>
          </div>
          <Button
            className='gradient-primary h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto'
            onClick={() => setShowNewPatient(true)}
          >
            + Янги Бемор
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className='card-shadow mb-4 sm:mb-6'>
          <div className='p-4 sm:p-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4'>
              <div className='sm:col-span-2 lg:col-span-6'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground' />
                  <Input
                    placeholder='ФИО, телефон ёки ID бўйича қидириш...'
                    className='pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base'
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className='lg:col-span-2'>
                <Select
                  value={genderFilter}
                  onValueChange={(value) => {
                    setGenderFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className='h-10 sm:h-12 text-sm sm:text-base'>
                    <SelectValue placeholder='Жинси' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Барчаси</SelectItem>
                    <SelectItem value='male'>Эркак</SelectItem>
                    <SelectItem value='female'>Аёл</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='lg:col-span-2'>
                <Select
                  value={doctorFilter}
                  onValueChange={(value) => {
                    setDoctorFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className='h-10 sm:h-12 text-sm sm:text-base'>
                    <SelectValue placeholder='Шифокор' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Барчаси</SelectItem>
                    <SelectItem value='Др. Алимов'>Др. Алимов</SelectItem>
                    <SelectItem value='Др. Нурматова'>Др. Нурматова</SelectItem>
                    <SelectItem value='Др. Каримов'>Др. Каримов</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='lg:col-span-2'>
                <Button
                  variant='outline'
                  className='w-full h-10 sm:h-12'
                  onClick={() => {
                    setSearchQuery('');
                    setGenderFilter('all');
                    setDoctorFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  <Filter className='w-4 h-4 sm:w-5 sm:h-5' />
                  <span className='ml-2'>Тозалаш</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Counter */}
        {!isLoading && filteredPatients.length > 0 && (
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4'>
            <p className='text-sm sm:text-base text-muted-foreground'>
              Жами:{' '}
              <span className='font-semibold text-foreground'>
                {filteredPatients.length}
              </span>{' '}
              бемор
            </p>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className='w-full sm:w-32 h-9 sm:h-10 text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='10'>10</SelectItem>
                <SelectItem value='25'>25</SelectItem>
                <SelectItem value='50'>50</SelectItem>
                <SelectItem value='100'>100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Patients Table/Cards or Empty State */}
        {isLoading ? (
          <Card className='card-shadow p-8 sm:p-12'>
            <LoadingSpinner
              size='lg'
              text='Юкланмоқда...'
              className='justify-center'
            />
          </Card>
        ) : patients.length === 0 ? (
          <Card className='card-shadow p-4 sm:p-0'>
            <EmptyState
              icon={Users}
              title={searchQuery ? 'Ҳеч нарса топилмади' : 'Ҳали беморлар йўқ'}
              description={
                searchQuery
                  ? 'Қидирув сўзини текширинг ёки филтрни ўзгартиринг'
                  : 'Биринчи беморни қўшиш учун қуйидаги тугмани босинг'
              }
              actionLabel={
                searchQuery ? 'Филтрни тозалаш' : '+ Янги Бемор Қўшиш'
              }
              onAction={() =>
                searchQuery ? setSearchQuery('') : setShowNewPatient(true)
              }
            />
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className='block lg:hidden space-y-3 sm:space-y-4'>
              {patients.map((patient) => (
                <Card key={patient.id} className='card-shadow'>
                  <div className='p-4'>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded'>
                            {patient.id}
                          </span>
                        </div>
                        <h3 className='font-semibold text-base sm:text-lg mb-1'>
                          {patient.name}
                        </h3>
                        <p className='text-xs sm:text-sm text-muted-foreground'>
                          {patient.age} ёш / {patient.gender}
                        </p>
                      </div>
                    </div>
                    <div className='space-y-2 mb-3'>
                      <div className='flex items-center gap-2 text-xs sm:text-sm'>
                        <Phone className='w-4 h-4 text-muted-foreground' />
                        <span>{patient.phone}</span>
                      </div>
                      <div className='flex items-center gap-2 text-xs sm:text-sm'>
                        <Users className='w-4 h-4 text-muted-foreground' />
                        <span>{patient.doctor}</span>
                      </div>
                    </div>
                    <Button
                      size='sm'
                      className='w-full gradient-primary'
                      onClick={() => navigate(`/patient/${patient.id}`)}
                    >
                      <Eye className='w-4 h-4 mr-2' />
                      Кўриш
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className='card-shadow hidden lg:block'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-muted/50'>
                    <tr>
                      {Array(
                        'ID',
                        'ФИО',
                        'Ёш/Жинс',
                        'Телефон',
                        'Шифокор',
                        'Диагноз',
                        'Ҳаракатлар'
                      ).map((i) => (
                        <th
                          key={i}
                          className='px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold'
                        >
                          {i}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {patients.map((patient) => (
                      <tr
                        key={patient.id}
                        className='hover:bg-accent/50 transition-smooth'
                      >
                        <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-medium text-primary'>
                          {patient.id}
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4'>
                          <div className='font-medium text-sm xl:text-base'>
                            {patient.name}
                          </div>
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                          {patient.age} ёш / {patient.gender}
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                          {patient.phone}
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                          {patient.doctor}
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                          {patient.diagnosis}
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4'>
                          <div className='flex justify-center'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => navigate(`/patient/${patient.id}`)}
                              className='hover:bg-primary hover:text-white transition-smooth text-xs xl:text-sm'
                            >
                              <Eye className='w-3 h-3 xl:w-4 xl:h-4 mr-1 xl:mr-2' />
                              Кўриш
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className='px-4 xl:px-6 py-3 xl:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3'>
                <div className='text-xs xl:text-sm text-muted-foreground'>
                  {startIndex + 1}-{Math.min(endIndex, filteredPatients.length)}{' '}
                  дан {filteredPatients.length} та кўрсатилмоқда
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className='text-xs xl:text-sm'
                  >
                    Олдинги
                  </Button>
                  {(() => {
                    const pages = [];
                    const showPages = new Set<number>();

                    // Har doim 1-sahifani ko'rsat
                    showPages.add(1);

                    // Har doim oxirgi sahifani ko'rsat
                    if (totalPages > 1) {
                      showPages.add(totalPages);
                    }

                    // Joriy sahifa va uning atrofidagi sahifalarni ko'rsat
                    for (
                      let i = Math.max(2, currentPage - 1);
                      i <= Math.min(totalPages - 1, currentPage + 1);
                      i++
                    ) {
                      showPages.add(i);
                    }

                    const sortedPages = Array.from(showPages).sort(
                      (a, b) => a - b
                    );

                    sortedPages.forEach((page, index) => {
                      // Ellipsis qo'shish agar sahifalar orasida bo'sh joy bo'lsa
                      if (index > 0 && sortedPages[index - 1] !== page - 1) {
                        pages.push(
                          <span
                            key={`ellipsis-${page}`}
                            className='px-2 flex items-center text-xs xl:text-sm'
                          >
                            ...
                          </span>
                        );
                      }

                      // Sahifa tugmasi
                      pages.push(
                        <Button
                          key={page}
                          variant='outline'
                          size='sm'
                          onClick={() => setCurrentPage(page)}
                          className={`text-xs xl:text-sm ${
                            page === currentPage
                              ? 'bg-primary text-white hover:bg-primary/60 hover:text-white'
                              : ''
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    });

                    return pages;
                  })()}
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className='text-xs xl:text-sm'
                  >
                    Кейинги
                  </Button>
                </div>
              </div>
            </Card>

            {/* Mobile Pagination */}
            <div className='block lg:hidden mt-4'>
              <Card className='card-shadow p-4'>
                <div className='flex flex-col gap-3'>
                  <div className='text-xs sm:text-sm text-muted-foreground text-center'>
                    {startIndex + 1}-
                    {Math.min(endIndex, filteredPatients.length)} дан{' '}
                    {filteredPatients.length} та кўрсатилмоқда
                  </div>
                  <div className='flex gap-2 justify-center flex-wrap'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className='text-xs sm:text-sm px-3'
                    >
                      Олдинги
                    </Button>
                    {(() => {
                      const pages = [];
                      const showPages = new Set<number>();

                      // Har doim 1 va oxirgi sahifani ko'rsat
                      showPages.add(1);
                      if (totalPages > 1) {
                        showPages.add(totalPages);
                      }

                      // Joriy sahifa va uning atrofidagi 1 ta sahifani ko'rsat
                      if (currentPage > 1 && currentPage < totalPages) {
                        showPages.add(currentPage);
                      }
                      if (currentPage - 1 > 1) {
                        showPages.add(currentPage - 1);
                      }
                      if (currentPage + 1 < totalPages) {
                        showPages.add(currentPage + 1);
                      }

                      const sortedPages = Array.from(showPages).sort(
                        (a, b) => a - b
                      );

                      sortedPages.forEach((page, index) => {
                        // Ellipsis qo'shish
                        if (index > 0 && sortedPages[index - 1] !== page - 1) {
                          pages.push(
                            <span
                              key={`ellipsis-${page}`}
                              className='px-2 flex items-center text-xs sm:text-sm'
                            >
                              ...
                            </span>
                          );
                        }

                        // Sahifa tugmasi
                        pages.push(
                          <Button
                            key={page}
                            variant='outline'
                            size='sm'
                            onClick={() => setCurrentPage(page)}
                            className={`text-xs sm:text-sm px-3 min-w-[32px] ${
                              page === currentPage
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : ''
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      });

                      return pages;
                    })()}
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className='text-xs sm:text-sm px-3'
                    >
                      Кейинги
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </main>

      {/* New Patient Modal */}
      <NewPatient open={showNewPatient} onOpenChange={setShowNewPatient} />
    </div>
  );
};

export default Patients;
