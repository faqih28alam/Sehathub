import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');

export interface PrescriptionPdfData {
  prescriptionId: string;
  patientName: string;
  patientNationality: string | null;
  doctorName: string;
  doctorSpecialization: string | null;
  issuedAt: Date;
  notes: string | null;
  items: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string | null;
  }>;
}

@Injectable()
export class PdfService {
  generatePrescriptionPdf(data: PrescriptionPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const PINK = '#E0004D';
      const DARK = '#333333';
      const MUTED = '#6B7280';
      const BORDER = '#E5E7EB';

      // Header bar
      doc.rect(0, 0, doc.page.width, 90).fill(PINK);

      // Clinic name
      doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('SehatHub', 50, 28);
      doc.fontSize(10).font('Helvetica').text('Layanan Kesehatan Digital', 50, 54);

      // "RESEP" label top-right
      doc.fontSize(10).font('Helvetica-Bold').text('RESEP DOKTER', 0, 38, { align: 'right' });

      doc.moveDown(3);

      // Patient & doctor info
      const infoY = 110;
      doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text('Pasien', 50, infoY);
      doc.font('Helvetica').fillColor(DARK).text(data.patientName, 50, infoY + 16);
      if (data.patientNationality) {
        doc.fillColor(MUTED).text(data.patientNationality, 50, infoY + 30);
      }

      doc.fillColor(DARK).font('Helvetica-Bold').text('Dokter', 300, infoY);
      doc.font('Helvetica').fillColor(DARK).text(`dr. ${data.doctorName}`, 300, infoY + 16);
      if (data.doctorSpecialization) {
        doc.fillColor(MUTED).text(data.doctorSpecialization, 300, infoY + 30);
      }

      doc.fillColor(DARK).font('Helvetica-Bold').text('Tanggal', 450, infoY);
      doc.font('Helvetica').fillColor(DARK).text(
        data.issuedAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        450,
        infoY + 16,
      );

      // Divider
      doc.moveTo(50, 165).lineTo(doc.page.width - 50, 165).strokeColor(BORDER).stroke();

      // Prescription items
      let y = 185;
      doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text('Daftar Obat', 50, y);
      y += 20;

      data.items.forEach((item, idx) => {
        // Item number circle
        doc.circle(62, y + 8, 10).fill(PINK);
        doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold').text(String(idx + 1), 58, y + 3);

        // Medication name + dosage
        doc
          .fillColor(DARK)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(`${item.medication} — ${item.dosage}`, 80, y);
        y += 16;

        // Frequency & duration
        doc
          .fillColor(MUTED)
          .fontSize(10)
          .font('Helvetica')
          .text(`${item.frequency} selama ${item.duration}`, 80, y);
        y += 14;

        if (item.notes) {
          doc.fillColor(MUTED).fontSize(9).text(`Catatan: ${item.notes}`, 80, y);
          y += 14;
        }

        y += 8;

        // Light separator between items
        if (idx < data.items.length - 1) {
          doc.moveTo(80, y - 4).lineTo(doc.page.width - 50, y - 4).strokeColor(BORDER).lineWidth(0.5).stroke();
        }
      });

      // Doctor notes
      if (data.notes) {
        y += 10;
        doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor(BORDER).stroke();
        y += 14;
        doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text('Catatan Dokter', 50, y);
        y += 14;
        doc.fillColor(DARK).fontSize(10).font('Helvetica').text(data.notes, 50, y, { width: 460 });
        y += doc.heightOfString(data.notes, { width: 460 }) + 10;
      }

      // Signature area
      const sigY = Math.max(y + 40, doc.page.height - 130);
      doc.moveTo(50, sigY).lineTo(doc.page.width - 50, sigY).strokeColor(BORDER).lineWidth(0.5).stroke();
      doc
        .fillColor(MUTED)
        .fontSize(9)
        .text('Tanda Tangan Dokter', doc.page.width - 200, sigY + 60, { width: 150, align: 'center' });
      doc.moveTo(doc.page.width - 200, sigY + 58).lineTo(doc.page.width - 50, sigY + 58).strokeColor(DARK).stroke();
      doc.fillColor(DARK).font('Helvetica-Bold').text(`dr. ${data.doctorName}`, doc.page.width - 200, sigY + 64, {
        width: 150,
        align: 'center',
      });

      // Footer
      doc
        .fillColor(MUTED)
        .fontSize(8)
        .font('Helvetica')
        .text(
          `ID Resep: ${data.prescriptionId} • Diterbitkan oleh SehatHub • Dokumen ini sah tanpa tanda tangan basah`,
          50,
          doc.page.height - 40,
          { align: 'center', width: doc.page.width - 100 },
        );

      doc.end();
    });
  }
}
