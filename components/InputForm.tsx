import React, { useState, useRef } from 'react';
import { Plus, ListPlus, FileText, Layers } from 'lucide-react';
import { StudentGradeRow } from '../types';

interface InputFormProps {
  onAddRows: (data: Omit<StudentGradeRow, '__rowNum__' | 'validationStatus'>[]) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onAddRows }) => {
  const [mode, setMode] = useState<'bulk' | 'single'>('bulk');
  const nimInputRef = useRef<HTMLInputElement>(null);
  
  // Single Mode State
  const [singleData, setSingleData] = useState({
    nim: '', nama_mk: '', nilai_angka: '', nilai_huruf: '', kode_mk_penyetaraan: '', kurikulum_mk_penyetaraan: ''
  });

  // Bulk Mode State
  const [bulkData, setBulkData] = useState({
    nim: '',
    kurikulum: '',
    namaMk: '',
    nilaiAngka: '',
    nilaiHuruf: '',
    kodeMk: ''
  });

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSingleData({ ...singleData, [e.target.name]: e.target.value });
  };

  const handleBulkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBulkData({ ...bulkData, [e.target.name]: e.target.value });
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleData.nim || !singleData.nama_mk) return;
    onAddRows([{ ...singleData, nilai_angka: Number(singleData.nilai_angka) || 0 }]);
    // Reset fields except NIM/Kurikulum for convenience
    setSingleData(prev => ({ ...prev, nama_mk: '', nilai_angka: '', nilai_huruf: '', kode_mk_penyetaraan: '' }));
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Helper to split by newline and filter out empty lines to ensure alignment
    const cleanLines = (text: string) => text.split('\n').map(l => l.trim()).filter(l => l !== '');

    const names = cleanLines(bulkData.namaMk);
    const nums = cleanLines(bulkData.nilaiAngka);
    const grades = cleanLines(bulkData.nilaiHuruf);
    const codes = cleanLines(bulkData.kodeMk);

    const rows: Omit<StudentGradeRow, '__rowNum__' | 'validationStatus'>[] = [];

    // Use name list as the driver
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        
        // Safety check if other columns have fewer rows
        const valStr = (nums[i] || '').replace(',', '.');
        
        rows.push({
            nim: bulkData.nim,
            nama_mk: name,
            nilai_angka: valStr ? parseFloat(valStr) : 0,
            nilai_huruf: (grades[i] || ''),
            kode_mk_penyetaraan: (codes[i] || ''),
            kurikulum_mk_penyetaraan: bulkData.kurikulum
        });
    }

    if (rows.length > 0) {
        onAddRows(rows);
        // Clear NIM and list fields, Keep Kurikulum. 
        setBulkData(prev => ({ ...prev, nim: '', namaMk: '', nilaiAngka: '', nilaiHuruf: '', kodeMk: '' }));
        // Focus back on NIM input for the next student
        setTimeout(() => {
          nimInputRef.current?.focus();
        }, 100);
    }
  };

  const getRowCount = (text: string) => text.split('\n').filter(l => l.trim()).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setMode('bulk')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'bulk' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Layers className="w-4 h-4" /> Bulk Input (Per Kolom)
        </button>
        <button
          onClick={() => setMode('single')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mode === 'single' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <FileText className="w-4 h-4" /> Single Input
        </button>
      </div>

      <div className="p-6">
        {mode === 'bulk' ? (
          <form onSubmit={handleBulkSubmit} className="space-y-4">
             {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">NIM (Mahasiswa Berikutnya)</label>
                    <input
                        ref={nimInputRef}
                        required
                        name="nim"
                        value={bulkData.nim}
                        onChange={handleBulkChange}
                        placeholder="Contoh: 12345678"
                        className="w-full p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Kurikulum (Tetap)</label>
                    <input
                        name="kurikulum"
                        value={bulkData.kurikulum}
                        onChange={handleBulkChange}
                        placeholder="Contoh: Kurikulum 2024"
                        className="w-full p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Column Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                    <div className="flex justify-between items-baseline mb-1">
                         <label className="text-xs font-semibold text-slate-700">Nama MK <span className="text-red-500">*</span></label>
                         <span className="text-[10px] text-slate-400">{getRowCount(bulkData.namaMk)} baris</span>
                    </div>
                    <textarea
                        required
                        name="namaMk"
                        value={bulkData.namaMk}
                        onChange={handleBulkChange}
                        className="flex-1 p-2 border border-slate-300 rounded text-xs font-mono h-48 focus:ring-2 focus:ring-blue-500 whitespace-pre"
                        placeholder="Paste kolom Nama MK..."
                    />
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-between items-baseline mb-1">
                         <label className="text-xs font-semibold text-slate-700">Nilai Angka</label>
                         <span className="text-[10px] text-slate-400">{getRowCount(bulkData.nilaiAngka)} baris</span>
                    </div>
                    <textarea
                        name="nilaiAngka"
                        value={bulkData.nilaiAngka}
                        onChange={handleBulkChange}
                        className="flex-1 p-2 border border-slate-300 rounded text-xs font-mono h-48 focus:ring-2 focus:ring-blue-500 whitespace-pre"
                        placeholder="Paste kolom Nilai..."
                    />
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-between items-baseline mb-1">
                         <label className="text-xs font-semibold text-slate-700">Nilai Huruf</label>
                         <span className="text-[10px] text-slate-400">{getRowCount(bulkData.nilaiHuruf)} baris</span>
                    </div>
                    <textarea
                        name="nilaiHuruf"
                        value={bulkData.nilaiHuruf}
                        onChange={handleBulkChange}
                        className="flex-1 p-2 border border-slate-300 rounded text-xs font-mono h-48 focus:ring-2 focus:ring-blue-500 whitespace-pre"
                        placeholder="Paste kolom Huruf..."
                    />
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-between items-baseline mb-1">
                         <label className="text-xs font-semibold text-slate-700">Kode Penyetaraan</label>
                         <span className="text-[10px] text-slate-400">{getRowCount(bulkData.kodeMk)} baris</span>
                    </div>
                    <textarea
                        name="kodeMk"
                        value={bulkData.kodeMk}
                        onChange={handleBulkChange}
                        className="flex-1 p-2 border border-slate-300 rounded text-xs font-mono h-48 focus:ring-2 focus:ring-blue-500 whitespace-pre"
                        placeholder="Paste kolom Kode..."
                    />
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm"
                >
                    <ListPlus className="w-4 h-4" /> Tambah & Lanjut ke Mahasiswa Berikutnya
                </button>
                <button
                    type="button"
                    onClick={() => setBulkData(prev => ({ ...prev, namaMk: '', nilaiAngka: '', nilaiHuruf: '', kodeMk: '' }))}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors"
                >
                    Clear Kolom
                </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">NIM</label>
              <input required name="nim" value={singleData.nim} onChange={handleSingleChange} className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Nama MK</label>
              <input required name="nama_mk" value={singleData.nama_mk} onChange={handleSingleChange} className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-1">
                <div className="flex gap-2">
                    <div className="w-1/2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Angka</label>
                        <input name="nilai_angka" value={singleData.nilai_angka} onChange={handleSingleChange} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Huruf</label>
                        <input name="nilai_huruf" value={singleData.nilai_huruf} onChange={handleSingleChange} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                </div>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Kode Baru</label>
              <input name="kode_mk_penyetaraan" value={singleData.kode_mk_penyetaraan} onChange={handleSingleChange} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Kurikulum</label>
              <input name="kurikulum_mk_penyetaraan" value={singleData.kurikulum_mk_penyetaraan} onChange={handleSingleChange} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-1">
              <button type="submit" className="w-full p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm flex items-center justify-center gap-1">
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};