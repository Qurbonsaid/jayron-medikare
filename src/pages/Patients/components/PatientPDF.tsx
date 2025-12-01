import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Agar kerak bo'lsa, shriftlarni yuklash
// Font.register({ family: 'Arial', src: '/path/to/font.ttf' });

// Styllarni aniqlash
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 10,
    marginBottom: 10,
    borderBottom: '1pt solid black',
    paddingBottom: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    marginBottom: 10,
  },
  subsection: {
    marginLeft: 10,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  underline: {
    textDecoration: 'underline',
  },
  patientInfo: {
    fontSize: 10,
    lineHeight: 1.5,
  }
});

// PDF hujjat komponenti
const MedicalDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Sarlavha va shtamp qismi */}
      <View style={styles.header}>
        <Text>O'zRSSV 26.06.2006y №287-sonli</Text>
        <Text>buyruq bilan tasdiqlangan O'zRSSV</Text>
        <Text style={{textAlign: 'center', marginTop: 5}}>nevrologiya va fizioterapiya klinikasi</Text>
        <Text style={{textAlign: 'center', fontWeight: 'bold'}}>027-X shaklidagi Tibbiy xujjat</Text>
        <Text style={{textAlign: 'center'}}>Kasallik tarixidan namuna N591</Text>
      </View>

      {/* Bemor ma'lumotlari */}
      <View style={styles.section}>
        <Text style={styles.bold}>Bemor: Boymatova Muhabbat 1974yil</Text>
        <Text style={styles.bold}>Yashash Joyi: Termiz shahri Tuproqqo'rg'on mahallasi</Text>
        <Text>Shifoxonaga tushgan kuni: 03.11.2025 yil</Text>
        <Text>Shifoxonadan javob berilgan kuni: 08.11.2025yil</Text>
      </View>

      {/* Diagnozlar */}
      <View style={styles.section}>
        <Text style={styles.bold}>Klinik tashxis: Insultdan so'ngi asoratlar chap tomonlama gemiparez.</Text>
        <Text style={styles.bold}>Yondosh: DE-libocqich, asteno-nevrotik sindrom va xotiraning sustlashganligi.</Text>
      </View>

      {/* Bemor shikoyatlari */}
      <View style={styles.section}>
        <Text style={styles.bold}>Bemorning qabul qilishda shikoyati:</Text>
        <Text style={styles.subsection}>
          Bemor so'zidan bosh o'g'rig'i, ko'ngil aynishi, xotirasi past, uyqusizlik, 
          qo'llarda qaltirash bezovta bo'lib turishi, bo'yin ko'krak bel sohasida og'riq, 
          kuchsiz ifodalangan umumiy darmonsizlik. Chap qo'l va oyoqda harakat cheklanganligi.
        </Text>
      </View>

      {/* Anamnez */}
      <View style={styles.section}>
        <Text style={styles.bold}>Anamnez:</Text>
        <Text style={styles.subsection}>
          Bemorning aytishicha bir necha yildan beri kasal hisoblaydi. Qon bosimini 
          ko'tarilishiga, asabiylashish, stress bilan bog'laydi. Ilgari bir necha marta 
          ambulator va statsionar ravishda davolangan.
        </Text>
      </View>

      {/* Hayot tarixi */}
      <View style={styles.section}>
        <Text style={styles.bold}>Anamnesis vitae:</Text>
        <Text style={styles.subsection}>
          Bemorning ilgari yuqumli va somatik kasalliklar bilan og'rimagan. 
          Zararli odatlari yo'q. Oilaviy sharoiti qulay. Dori va oziq ovqatlarga 
          allergik holati kuzatilmagan.
        </Text>
      </View>

      {/* Ob'ektiv status */}
      <View style={styles.section}>
        <Text style={styles.bold}>Status praesens objectives:</Text>
        <Text style={styles.subsection}>
          Umumiy ahvoli o'rta, hushi o'zida, holati to'shakli, teri va ko'rinib 
          turadigan shilliq qavatlari oqimtir rangda, puls 76 ta ritmik. 
          AQB 140/90, sm, ustki chegarada. Yurak tonlari aniq. O'pkasida 
          vezikulyar nafas eshitiladi. Qorin yumshoq, og'rigsiz, jigar va 
          taloq normada. Siyishi va najasi normada.
        </Text>
      </View>

      {/* Nevrologik status */}
      <View style={styles.section}>
        <Text style={styles.bold}>Status nevrologus:</Text>
        <Text style={styles.subsection}>
          Bosh perkussiyada og'rigsiz. Dansig-Kunakova Simptomi ikki tomonlama manfiy. D=S.
          I Juft Kamfora hidini ajratishi to'g'ri. II Juft ko'ruv o'tkirligi o'zgargan. 
          Ko'zlarda III-IV-VI faolajlik. Gorachilar dumaloq, chap tomonlama gorizantal 
          nistagm, anizokoriya yo'q. Fotoreaksiya saqlangan. D=S. V juft Valle nuqtalari 
          og'rigsiz. Yuzda yuzaki sezgi saqlangan. Chaynov muskullari ikki tomonlama 5 ballga teng.
        </Text>
      </View>
    </Page>

    {/* Ikkinchi sahifa */}
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.bold}>Davom:</Text>
        <Text style={styles.subsection}>
          VII juft Yuzi asimmetrik, chap tomonlama markaziy faolajlik. 
          VIII. Eshitish pasaymagan, Shovqinlar yo'q IX-X juft yutish saqlangan. 
          Yumshoq tanglay asimmetrik fonatsiyada qisqaradi. Tilcha o'rta chiziqda, qiyshaymagan.
          XI Juft Yelkalarni ko'taradi, boshi qiyshaymagan. XII Juft til o'rta chiziqda, qiyshaymagan. 
          Tilda atrofiya, fibrilyar, fastikulyar tortilishlar yo'q.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>Harakat sistemasi:</Text>
        <Text style={styles.subsection}>
          Chap tomonlama spastik gemiparez. Mushak kuchi o'ng qo'lda distalda 3 ball, 
          proksimalda 4 ball, o'ng oyoqda proksimalda 3 ball, proksimalda 4 ball.
          Pay reflekslari BR, TR chaqiriladi, PR, AR-chaqiriladi, chap tarafda kuchaygan. 
          Mushaklar tonusi gipertonusda, atrofiya holati aniq emas. 
          Patologik reflekslar Marinesko-Rodovich va Babinskiy reflekslari ikki tomonlama musbat.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>Sezgi sferasi:</Text>
        <Text style={styles.subsection}>buzilmagan</Text>
        
        <Text style={styles.bold}>Meningial simptomlar:</Text>
        <Text style={styles.subsection}>manfiy</Text>
        
        <Text style={styles.bold}>Miyacha:</Text>
        <Text style={styles.subsection}>
          BBSlari o'ng qo'lda to'g'ri bajaradi, chap qo'lda bajara olmaydi. 
          TTS bajara olmaydi. Adioxokinez chap qo'l ortda qoladi, dizmetriya aniq emas. 
          Romberg holatida tura oladi.
        </Text>
      </View>

      {/* Davolanish */}
      <View style={styles.section}>
        <Text style={styles.bold}>Davolanish:</Text>
        <Text style={styles.subsection}>
          Ekvator 10/5 Itab x2 marta ovqatdan so'ng har doim
          Furasemid 2.0 mushak orasiga kumora (20% - 10.0) v/i ga N5.
          Deprecc 20mg ln x lm ertalab 9:00da N16 kun.
          Prosulpin 50mg lt x lm obedda 13:00da N10
          Adep 30mg V4 t x lm kechqurum 20:00da N1 oy.
          Naklafen 3.0 mushak orasiga N5
        </Text>
      </View>

      {/* Fizioterapiya */}
      <View style={styles.section}>
        <Text style={styles.bold}>Fizioterapiya:</Text>
        <Text style={styles.subsection}>
          Zinda bosh bo'yin bel sohasiga. Massaj Bosh bo'yin bel quri oyoq soxalariga.
          Dorsanval bosh soxasiga. Ultrazuvuk indametatsin maz bilan belga.
          Almag-02 ko'krak umurtgalariga.
        </Text>
      </View>

      {/* Tavsiyalar */}
      <View style={styles.section}>
        <Text style={styles.bold}>Tavsiya:</Text>
        <Text style={styles.subsection}>
          1. ekvator 10/5 mg Itab 2 mahal har kuni
          2. trombopol 75 mg Itab 1 mahal kechqurum har kuni
          3. prosulpin 200mg V2 tab 1 mahal tushlik vaqtida 15 kun
          Yashash joyida nevrolog nazorati.
        </Text>
      </View>

      {/* Imzolar */}
      <View style={[styles.section, {marginTop: 30}]}>
        <Text>Boshvrach: Ubaydullayev.S.B.</Text>
        <Text>Bo'lim boshlig'i: Axmedov. B. U.</Text>
        <Text>Davolovchi vrach: Ubaydullaev S.B.</Text>
      </View>
    </Page>
  </Document>
);

interface Props {
  className ?: string;
  children?:React.ReactNode;
}

const PDFGenerator = ({className='px-4 py-3 text-[14px] bg-blue-500 text-white border-none rounded-[5px] cursor-pointer',children='PDF Yuklab Olish'}:Props) => {
  const generatePDF = async () => {
    const { pdf } = await import("@react-pdf/renderer");
    const blob = await pdf(<MedicalDocument />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Tibbiy_Xujjat_Boymatova_Muhabbat.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
      <button 
        onClick={generatePDF}
        // style={{
        //   padding: '10px 20px',
        //   fontSize: '16px',
        //   backgroundColor: '#4CAF50',
        //   color: 'white',
        //   border: 'none',
        //   borderRadius: '5px',
        //   cursor: 'pointer'
        // }}
        className={className}
      >
        {children}
      </button>
  );
};

export default PDFGenerator;