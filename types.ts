export interface StudentGradeRow {
  nim: string;
  nama_mk: string;
  nilai_angka: number | string;
  nilai_huruf: string;
  kode_mk_penyetaraan: string;
  kurikulum_mk_penyetaraan: string;
  // Internal app fields
  __rowNum__: number;
  validationStatus?: 'valid' | 'invalid' | 'warning';
  validationMessage?: string;
  suggestedCode?: string;
  suggestedName?: string;
}

export interface CurriculumRow {
  kode_mk: string;
  nama_mk: string;
  sks?: number;
  [key: string]: any;
}

export interface ProcessingStats {
  total: number;
  valid: number;
  invalid: number;
}
