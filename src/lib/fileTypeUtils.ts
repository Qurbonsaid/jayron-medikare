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

  // PDF
  if (extension === 'pdf') {
    return { type: 'pdf', extension, canPreview: true };
  }

  // Word documents
  const wordExtensions = ['doc', 'docx'];
  if (wordExtensions.includes(extension)) {
    return { type: 'word', extension, canPreview: true };
  }

  // Excel documents
  const excelExtensions = ['xls', 'xlsx', 'csv'];
  if (excelExtensions.includes(extension)) {
    return { type: 'excel', extension, canPreview: true };
  }

  // RTF
  if (extension === 'rtf') {
    return { type: 'rtf', extension, canPreview: true };
  }

  // MDFX (EEG medical format)
  if (extension === 'mdfx') {
    return { type: 'mdfx', extension, canPreview: true };
  }

  // Other formats - download only
  return { type: 'other', extension, canPreview: false };
};

/**
 * Get file icon component based on type
 */
export const getFileIcon = (fileType: FileType) => {
  const icons = {
    image: FileImage,
    pdf: FileText,
    word: FileText,
    excel: FileSpreadsheet,
    rtf: FileCode,
    mdfx: Activity,
    other: File,
  } as const;
  return icons[fileType];
};

/**
 * Get human-readable file type name
 */
export const getFileTypeName = (fileType: FileType): string => {
  const names: Record<FileType, string> = {
    image: 'Image',
    pdf: 'PDF Document',
    word: 'Word Document',
    excel: 'Excel Spreadsheet',
    rtf: 'RTF Document',
    mdfx: 'EEG Medical Data',
    other: 'File',
  };
  return names[fileType];
};

/**
 * Download file from URL
 */
export const downloadFile = async (url: string, filename?: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || url.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
};
