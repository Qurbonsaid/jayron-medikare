import { 
  FileImage, 
  FileText, 
  FileSpreadsheet,
  FileCode,
  Activity,
  File,
  type LucideIcon
} from 'lucide-react';

export type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'rtf' | 'mdfx' | 'other';

export interface FileTypeInfo {
  type: FileType;
  extension: string;
  canPreview: boolean;
}

/**
 * Get file type information from URL or filename
 */
export const getFileTypeInfo = (url: string): FileTypeInfo => {
  // Extract filename from URL
  const filename = url.split('/').pop()?.toLowerCase() || '';
  const extension = filename.split('.').pop() || '';

  // Image formats
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'];
  if (imageExtensions.includes(extension)) {
    return { type: 'image', extension, canPreview: true };
  }

  // PDF - react-pdf bilan ko'rsa bo'ladi
  if (extension === 'pdf') {
    return { type: 'pdf', extension, canPreview: true };
  }

  // Word documents - mammoth.js bilan ko'rsa bo'ladi
  const wordExtensions = ['doc', 'docx'];
  if (wordExtensions.includes(extension)) {
    return { type: 'word', extension, canPreview: true };
  }

  // Excel documents - xlsx.js bilan ko'rsa bo'ladi
  const excelExtensions = ['xls', 'xlsx', 'csv'];
  if (excelExtensions.includes(extension)) {
    return { type: 'excel', extension, canPreview: true };
  }

  // RTF - oddiy text parser bilan ko'rish mumkin
  if (extension === 'rtf') {
    return { type: 'rtf', extension, canPreview: true };
  }

  // MDFX (EEG medical format) - XML asosida, qisman ko'rish mumkin
  if (extension === 'mdfx') {
    return { type: 'mdfx', extension, canPreview: true };
  }

  // Other formats - download only
  return { type: 'other', extension, canPreview: false };
};

/**
 * Get file icon component based on type
 */
export const getFileIcon = (fileType: FileType | string): LucideIcon => {
  const icons: Record<string, LucideIcon> = {
    image: FileImage,
    pdf: FileText,
    word: FileText,
    excel: FileSpreadsheet,
    rtf: FileCode,
    mdfx: Activity,
    other: File,
  };
  return icons[fileType] || File;
};

/**
 * Get human-readable file type name
 */
export const getFileTypeName = (fileType: FileType): string => {
  const names: Record<FileType, string> = {
    image: 'Расм',
    pdf: 'PDF ҳужжат',
    word: 'Word ҳужжат',
    excel: 'Excel жадвал',
    rtf: 'RTF ҳужжат',
    mdfx: 'EEG маълумотлари',
    other: 'Файл',
  };
  return names[fileType];
};

/**
 * Download file from URL
 * MUHIM: Bu funksiya faqat "Юклаб олиш" tugmasi bosilganda ishlashi kerak!
 * Avtomatik chaqirmaslik kerak!
 */
export const downloadFile = (url: string, filename?: string): void => {
  // Yangi tab'da ochish - bu CORS muammolarini ham hal qiladi
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || url.split('/').pop() || 'download';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
