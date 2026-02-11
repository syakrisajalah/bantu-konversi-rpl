import * as XLSX from 'xlsx';
import { StudentGradeRow, CurriculumRow } from '../types';

export const readExcel = async <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<T>(sheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const exportToExcel = (data: StudentGradeRow[], filename: string) => {
  // Clean data for export (remove internal fields)
  const exportData = data.map(({ 
    nim, nama_mk, nilai_angka, nilai_huruf, kode_mk_penyetaraan, kurikulum_mk_penyetaraan 
  }) => ({
    nim,
    nama_mk,
    nilai_angka,
    nilai_huruf,
    kode_mk_penyetaraan,
    kurikulum_mk_penyetaraan
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil Konversi');
  XLSX.writeFile(workbook, filename);
};

// Helper to normalize keys to lowercase/trimmed for matching
export const normalizeKeys = (obj: any): any => {
  const newObj: any = {};
  Object.keys(obj).forEach((key) => {
    const cleanKey = key.toLowerCase().trim().replace(/ /g, '_');
    newObj[cleanKey] = obj[key];
  });
  return newObj;
};
