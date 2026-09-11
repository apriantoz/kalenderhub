import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Schedule } from '@/lib/schedule-utils';

// 1. Export Ke Excel (.xlsx)
export const exportToExcel = (data: Schedule[], fileName = 'Rekap_Jadwal_Lab.xlsx') => {
  const formattedData = data.map((item, index) => ({
    No: index + 1,
    Hari: item.day,
    Jam: `${item.start_time} - ${item.end_time}`,
    Ruangan: item.room,
    'Mata Kuliah': item.course_name,
    'Program Studi': item.prodi,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal Lab');

  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 10 }, // Hari
    { wch: 18 }, // Jam
    { wch: 20 }, // Ruangan
    { wch: 30 }, // Mata Kuliah
    { wch: 25 }, // Prodi
  ];

  XLSX.writeFile(workbook, fileName);
};

// 2. Export Ke PDF (.pdf)
export const exportToPDF = (data: Schedule[], fileName = 'Rekap_Jadwal_Lab.pdf') => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(16);
  doc.text('REKAPITULASI JADWAL LABORATORIUM KOMPUTER', 14, 15);
  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 21);

  const tableColumn = ['No', 'Hari', 'Jam', 'Ruangan', 'Mata Kuliah', 'Program Studi'];
  const tableRows = data.map((item, index) => [
    index + 1,
    item.day,
    `${item.start_time} - ${item.end_time}`,
    item.room,
    item.course_name,
    item.prodi,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(fileName);
};