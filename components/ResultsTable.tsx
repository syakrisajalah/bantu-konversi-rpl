import React from 'react';
import { StudentGradeRow } from '../types';
import { CheckCircle, XCircle, AlertTriangle, Trash2 } from 'lucide-react';

interface ResultsTableProps {
  data: StudentGradeRow[];
  onApplySuggestion: (rowNum: number, code: string) => void;
  onDeleteRow: (rowNum: number) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data, onApplySuggestion, onDeleteRow }) => {
  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
          <tr>
            <th className="px-4 py-3 text-center w-16">Status</th>
            <th className="px-4 py-3">NIM</th>
            <th className="px-4 py-3">Mata Kuliah (Asal)</th>
            <th className="px-4 py-3">Nilai</th>
            <th className="px-4 py-3">Kode Penyetaraan</th>
            <th className="px-4 py-3">Kurikulum</th>
            <th className="px-4 py-3">Info Validasi</th>
            <th className="px-4 py-3 text-center w-16">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic">
                Belum ada data. Silakan input data atau paste dari Excel.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.__rowNum__} className={`border-b hover:bg-slate-50 ${row.validationStatus === 'invalid' ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                <td className="px-4 py-3 text-center">
                  {row.validationStatus === 'valid' && <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />}
                  {row.validationStatus === 'invalid' && <XCircle className="w-5 h-5 text-red-500 mx-auto" />}
                  {row.validationStatus === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{row.nim}</td>
                <td className="px-4 py-3">{row.nama_mk}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold">{row.nilai_huruf}</span> <span className="text-slate-400">({row.nilai_angka})</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{row.kode_mk_penyetaraan}</td>
                <td className="px-4 py-3 text-xs">{row.kurikulum_mk_penyetaraan}</td>
                <td className="px-4 py-3">
                  {row.validationMessage && (
                     <span className={`text-xs ${row.validationStatus === 'invalid' ? 'text-red-600 font-semibold' : 'text-emerald-600'}`}>
                       {row.validationMessage}
                     </span>
                  )}
                  {row.suggestedCode && row.validationStatus === 'invalid' && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        Saran: <strong>{row.suggestedCode}</strong>
                      </span>
                      <button 
                        onClick={() => onApplySuggestion(row.__rowNum__, row.suggestedCode!)}
                        className="p-1 hover:bg-purple-200 rounded-full text-purple-600 transition-colors"
                        title="Terapkan Saran"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onDeleteRow(row.__rowNum__)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Baris"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
