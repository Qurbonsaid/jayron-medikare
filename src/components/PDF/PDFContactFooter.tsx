/**
 * PDF Contact Footer Component
 * Displays clinic contact information at the bottom of PDF pages
 */

import { Settings } from '@/app/api/settingsApi/types.d';
import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { styles } from './PDFUtils';

interface PDFContactFooterProps {
  settings?: Settings;
}

export const PDFContactFooter: React.FC<PDFContactFooterProps> = ({ settings }) => {
  if (!settings?.contacts || settings.contacts.length === 0) {
    return null;
  }

  return (
    <View style={[styles.patientInfo, { marginTop: 8 }]}>
      <Text style={styles.sectionTitle}>Aloqa ma&apos;lumotlari</Text>
      {settings.contacts.map((contact, index) => (
        <View key={`${contact.full_name}-${contact.phone}-${index}`}>
          <Text style={styles.bold}>
            {contact.full_name || '-'}: {contact.phone || '-'}
          </Text>
        </View>
      ))}
    </View>
  );
};
