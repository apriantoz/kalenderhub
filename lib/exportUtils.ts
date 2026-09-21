import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Schedule } from '@/lib/schedule';

// Helper: Mapping urutan hari agar sorting-nya sesuai (bukan abjad)
const dayOrder: { [key: string]: number } = {
  'Senin': 1,
  'Selasa': 2,
  'Rabu': 3,
  'Kamis': 4,
  'Jumat': 5,
  'Sabtu': 6,
  'Minggu': 7,
};

// Fungsi Universal untuk Sorting Schedule (Aman dari undefined)
const sortScheduleData = (data: Schedule[]): Schedule[] => {
  return [...data].sort((a, b) => {
    // 1. Urutkan berdasarkan Hari
    const dayA = dayOrder[a.day || ''] || 99;
    const dayB = dayOrder[b.day || ''] || 99;
    if (dayA !== dayB) return dayA - dayB;

    // 2. Jika hari sama, urutkan berdasarkan Jam Mulai (start_time)
    const timeA = a.start_time || '';
    const timeB = b.start_time || '';
    if (timeA !== timeB) {
      return timeA.localeCompare(timeB);
    }

    // 3. Jika jam sama, urutkan berdasarkan Ruangan
    const roomA = a.room || '';
    const roomB = b.room || '';
    return roomA.localeCompare(roomB);
  });
};

// ==========================================
// 1. Export Ke Excel (.xlsx) - Menggunakan ExcelJS
// ==========================================
export const exportToExcel = async (
  data: Schedule[],
  fileName = 'Rekap_Jadwal_Lab.xlsx'
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Jadwal Lab');

  const sortedData = sortScheduleData(data);

  worksheet.columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Hari', key: 'day', width: 12 },
    { header: 'Jam', key: 'time', width: 18 },
    { header: 'Ruangan', key: 'room', width: 22 },
    { header: 'Mata Kuliah', key: 'course_name', width: 32 },
    { header: 'Program Studi', key: 'prodi', width: 28 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1E293B' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  sortedData.forEach((item, index) => {
    worksheet.addRow({
      no: index + 1,
      day: item.day || '-',
      time: `${item.start_time || ''} - ${item.end_time || ''}`,
      room: item.room || '-',
      course_name: item.course_name || '-',
      prodi: item.prodi || '-',
    });
  });

  worksheet.getColumn('no').alignment = { horizontal: 'center' };
  worksheet.getColumn('time').alignment = { horizontal: 'center' };

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), fileName);
};

// ==========================================
// 2. Export Ke PDF (.pdf) - Menggunakan jsPDF
// ==========================================
export const exportToPDF = (
  data: Schedule[],
  fileName = 'Rekap_Jadwal_Lab.pdf'
): void => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const sortedData = sortScheduleData(data);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('REKAPITULASI JADWAL LABORATORIUM KOMPUTER', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    14,
    21
  );

  const tableColumn = ['No', 'Hari', 'Jam', 'Ruangan', 'Mata Kuliah', 'Program Studi'];
  
  // Memastikan tipe data bersih dari undefined (diberi fallback string kosong)
  const tableRows = sortedData.map((item, index) => [
    index + 1,
    item.day || '-',
    `${item.start_time || ''} - ${item.end_time || ''}`,
    item.room || '-',
    item.course_name || '-',
    item.prodi || '-',
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 3, font: 'helvetica' },
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 }, // No
      1: { cellWidth: 25 },                  // Hari
      2: { halign: 'center', cellWidth: 35 }, // Jam
      3: { cellWidth: 40 },                  // Ruangan
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: (dataArg) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Halaman ${dataArg.pageNumber} dari ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    },
  });

  doc.save(fileName);
};