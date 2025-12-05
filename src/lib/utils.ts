import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Telefon raqamni +998 92 694 42 47 formatida ko'rsatish
 * @param phone - Telefon raqam (har qanday formatda)
 * @returns Formatlangan telefon raqam
 */
export function formatPhoneNumber(phone: string | undefined | null): string {
  if (!phone) return "-";
  
  // Faqat raqamlarni qoldirish
  const cleaned = phone.replace(/\D/g, "");
  
  // Agar 998 bilan boshlanmasa, bo'sh qaytarish
  if (!cleaned.startsWith("998")) return phone;
  
  // Formatga keltirish: +998 92 694 42 47
  const match = cleaned.match(/^(998)(\d{2})(\d{3})(\d{2})(\d{2})$/);
  
  if (match) {
    return `+${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
  }
  
  // Agar to'liq emas (masalan +998 93 69)
  if (cleaned.length >= 5) {
    const prefix = cleaned.slice(0, 3); // 998
    const operator = cleaned.slice(3, 5); // 93
    const rest = cleaned.slice(5);
    
    let formatted = `+${prefix} ${operator}`;
    
    if (rest.length > 0) {
      // Har 3 raqamdan so'ng bo'sh joy
      if (rest.length <= 3) {
        formatted += ` ${rest}`;
      } else if (rest.length <= 5) {
        formatted += ` ${rest.slice(0, 3)} ${rest.slice(3)}`;
      } else {
        formatted += ` ${rest.slice(0, 3)} ${rest.slice(3, 5)} ${rest.slice(5)}`;
      }
    }
    
    return formatted;
  }
  
  return phone;
}

/**
 * Input uchun telefon raqamni formatlash (real-time)
 * @param value - Joriy qiymat
 * @returns Formatlangan qiymat input uchun
 */
export function formatPhoneInput(value: string): string {
  // Faqat raqamlar va + ni qoldirish
  const cleaned = value.replace(/[^\d+]/g, "");
  
  // Agar bo'sh yoki faqat +998 bo'lsa
  if (!cleaned || cleaned === "+998") return cleaned;
  
  // 998 bilan boshlanishini ta'minlash
  let numbers = cleaned.replace(/\D/g, "");
  if (!numbers.startsWith("998")) {
    numbers = "998" + numbers;
  }
  
  // Maksimal 12 raqam (998 + 9 raqam)
  if (numbers.length > 12) {
    numbers = numbers.slice(0, 12);
  }
  
  // Formatga keltirish
  if (numbers.length <= 3) {
    return `+${numbers}`;
  } else if (numbers.length <= 5) {
    return `+${numbers.slice(0, 3)} ${numbers.slice(3)}`;
  } else if (numbers.length <= 8) {
    return `+${numbers.slice(0, 3)} ${numbers.slice(3, 5)} ${numbers.slice(5)}`;
  } else if (numbers.length <= 10) {
    return `+${numbers.slice(0, 3)} ${numbers.slice(3, 5)} ${numbers.slice(5, 8)} ${numbers.slice(8)}`;
  } else {
    return `+${numbers.slice(0, 3)} ${numbers.slice(3, 5)} ${numbers.slice(5, 8)} ${numbers.slice(8, 10)} ${numbers.slice(10)}`;
  }
}

/**
 * Telefon raqamdan faqat raqamlarni olish (backend ga yuborish uchun)
 * @param phone - Formatlangan telefon
 * @returns Tozalangan telefon (+998901234567)
 */
export function cleanPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.startsWith("998") ? `+${cleaned}` : phone;
}

/**
 * Sonlarni formatlash: 100000 -> 100 000
 * @param num - Formatlash kerak bo'lgan son
 * @returns Formatlangan son
 */
export function formatNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === "") return "0";
  
  const number = typeof num === "string" ? parseFloat(num) : num;
  
  if (isNaN(number)) return "0";
  
  // Sonni bo'sh joy bilan formatlash
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
