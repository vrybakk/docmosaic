'use client';

import { ImageSection } from '@/lib/types';
import { Document, Image, Page, pdf, StyleSheet } from '@react-pdf/renderer';

// A4 dimensions in points (72 DPI)
const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

// Our canvas dimensions (96 DPI)
const CANVAS_WIDTH = 794;
const CANVAS_HEIGHT = 1123;

// Scale factor from canvas pixels to PDF points
const SCALE_FACTOR = A4_WIDTH_PT / CANVAS_WIDTH;

// Compression quality settings
const COMPRESSION_SETTINGS = {
  high: 0.3, // Smaller file
  medium: 0.6, // Balanced
  low: 0.9, // Better quality
};

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  backgroundPDF: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

interface GeneratePDFOptions {
  compressionLevel?: 'high' | 'medium' | 'low';
  backgroundPDF?: string | null;
}

export async function generatePDF(sections: ImageSection[], options: GeneratePDFOptions = {}): Promise<Blob> {
  const { compressionLevel = 'medium', backgroundPDF = null } = options;

  const MyDocument = () => (
    <Document>
      <Page size='A4' style={styles.page}>
        {backgroundPDF && <Image src={backgroundPDF} style={styles.backgroundPDF} />}
        {sections.map((section) => (
          <Image
            key={section.id}
            src={section.imageUrl || ''}
            style={{
              position: 'absolute',
              left: section.x * SCALE_FACTOR,
              top: section.y * SCALE_FACTOR,
              width: section.width * SCALE_FACTOR,
              height: section.height * SCALE_FACTOR,
            }}
            // Apply compression based on selected level
            quality={COMPRESSION_SETTINGS[compressionLevel]}
          />
        ))}
      </Page>
    </Document>
  );

  return await pdf(<MyDocument />).toBlob();
}
