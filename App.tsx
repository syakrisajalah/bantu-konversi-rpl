import React, { useState, useEffect } from 'react';
import { readExcel, exportToExcel, normalizeKeys } from './services/excelService';
import { findSmartMatches } from './services/geminiService';
import { Dropzone } from './components/Dropzone';
import { InputForm } from './components/InputForm';
import { ResultsTable } from './components/ResultsTable';
import { StudentGradeRow, CurriculumRow, ProcessingStats } from './types';
import { FileDown, RefreshCw, BrainCircuit, AlertCircle, Trash2 } from 'lucide-react';

export default function App() {
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);
  
  const [studentData, setStudentData] = useState<StudentGradeRow[]>([]);
  const [curriculumData, setCurriculumData] = useState<CurriculumRow[]>([]);
  
  const [stats, setStats] = useState<ProcessingStats>({ total: 0, valid: 0, invalid: 0 });
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load curriculum when file changes
  const handleCurriculumFile = async (file: File) => {
    setCurriculumFile(file);
    try {
      const rawCurriculumData = await readExcel<any>(file);
      const normalizedCurriculumData = rawCurriculumData.map(row => normalizeKeys(row));
      setCurriculumData(normalizedCurriculumData);
      
      // Re-validate existing student data against new curriculum
      revalidateData(studentData, normalizedCurriculumData);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg("Gagal membaca file kurikulum: " + err.message);
    }
  };

  const validateRow = (row: Omit<StudentGradeRow, '__rowNum__' | 'validationStatus'>, currData: CurriculumRow[]): StudentGradeRow => {
    if (currData.length === 0) {
      return {
        ...row,
        __rowNum__: Date.now() + Math.random(), // Unique ID
        validationStatus: 'warning',
        validationMessage: 'Kurikulum belum diupload'
      };
    }

    const validCodes = new Set(currData.map((c: any) => String(c.kode_mk || '').trim()));
    const codeToCheck = String(row.kode_mk_penyetaraan || '').trim();
    const isValid = validCodes.has(codeToCheck);

    return {
      ...row,
      __rowNum__: Date.now() + Math.random(),
      validationStatus: isValid ? 'valid' : 'invalid',
      validationMessage: isValid ? 'Kode Valid' : 'Kode Tidak Ditemukan',
    };
  };

  const revalidateData = (currentRows: StudentGradeRow[], currData: CurriculumRow[]) => {
    const validCodes = new Set(currData.map((c: any) => String(c.kode_mk || '').trim()));
    
    let valid = 0;
    let invalid = 0;

    const updatedRows = currentRows.map(row => {
       const codeToCheck = String(row.kode_mk_penyetaraan || '').trim();
       const isValid = validCodes.has(codeToCheck);
       
       if (isValid) valid++; else invalid++;

       return {
         ...row,
         validationStatus: isValid ? 'valid' : 'invalid',
         validationMessage: isValid ? 'Kode Valid' : 'Kode Tidak Ditemukan'
       } as StudentGradeRow; 
    });

    setStudentData(updatedRows);
    setStats({ total: updatedRows.length, valid, invalid });
  };

  const handleAddRows = (newRowsData: Omit<StudentGradeRow, '__rowNum__' | 'validationStatus'>[]) => {
    const validatedRows = newRowsData.map(row => validateRow(row, curriculumData));
    
    setStudentData(prev => {
      const newData = [...prev, ...validatedRows];
      updateStats(newData);
      return newData;
    });
  };

  const handleDeleteRow = (rowNum: number) => {
    setStudentData(prev => {
      const newData = prev.filter(row => row.__rowNum__ !== rowNum);
      updateStats(newData);
      return newData;
    });
  };

  const handleClearAll = () => {
    // Directly clear without confirm to ensure it works in all environments
    setStudentData([]);
    updateStats([]);
    setErrorMsg(null);
  };

  const updateStats = (data: StudentGradeRow[]) => {
    const valid = data.filter(r => r.validationStatus === 'valid').length;
    const invalid = data.filter(r => r.validationStatus === 'invalid').length;
    setStats({ total: data.length, valid, invalid });
  };

  const handleSmartFix = async () => {
    if (!studentData.length || !curriculumData.length) return;
    setIsAiProcessing(true);

    try {
      const invalidRows = studentData.filter(r => r.validationStatus === 'invalid');
      if (invalidRows.length === 0) return;

      const matches = await findSmartMatches(
        invalidRows.map(r => ({ nama_mk: r.nama_mk, kode_mk_current: r.kode_mk_penyetaraan })),
        curriculumData
      );

      setStudentData(prev => prev.map(row => {
        if (row.validationStatus !== 'invalid') return row;
        const match = matches.find(m => m.original_name === row.nama_mk);
        if (match && match.suggested_code !== "NO_MATCH") {
          return {
            ...row,
            suggestedCode: match.suggested_code,
            suggestedName: match.reason
          };
        }
        return row;
      }));

    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal melakukan AI Matching. Pastikan API Key valid.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const applySuggestion = (rowNum: number, newCode: string) => {
    setStudentData(prev => {
      const newData = prev.map(row => {
        if (row.__rowNum__ === rowNum) {
          return {
            ...row,
            kode_mk_penyetaraan: newCode,
            validationStatus: 'valid' as const,
            validationMessage: 'Diperbaiki oleh AI',
            suggestedCode: undefined
          };
        }
        return row;
      });
      updateStats(newData);
      return newData;
    });
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
    exportToExcel(studentData, `Rekap_Konversi_Gabungan_${timestamp}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">UniConvert AI</h1>
            <p className="text-slate-500 mt-1">Input Data Manual & Validasi Kurikulum</p>
          </div>
          
          {/* Reference Upload */}
          <div className="w-full md:w-96">
            <Dropzone 
              id="file-curr" 
              label="Upload Kurikulum Acuan" 
              subLabel="Untuk Validasi (Kode MK, Nama MK)"
              onFileLoaded={handleCurriculumFile} 
              acceptedFile={curriculumFile} 
            />
          </div>
        </div>

        {/* Error Display */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Main Workspace */}
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Left: Input Form */}
          <div className="lg:col-span-4">
            <InputForm onAddRows={handleAddRows} />
          </div>

          {/* Center: Table & Stats */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex gap-6 divide-x divide-slate-200">
                <div className="pl-2">
                   <p className="text-xs text-slate-500 uppercase font-bold">Total</p>
                   <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                </div>
                <div className="pl-6">
                   <p className="text-xs text-emerald-600 uppercase font-bold">Valid</p>
                   <p className="text-2xl font-bold text-emerald-600">{stats.valid}</p>
                </div>
                <div className="pl-6">
                   <p className="text-xs text-red-600 uppercase font-bold">Invalid</p>
                   <p className="text-2xl font-bold text-red-600">{stats.invalid}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {stats.total > 0 && (
                   <button 
                     type="button"
                     onClick={handleClearAll}
                     className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg shadow-sm transition-colors border border-red-200"
                   >
                     <Trash2 className="w-4 h-4" />
                     Hapus Semua
                   </button>
                )}

                {stats.invalid > 0 && curriculumData.length > 0 && (
                  <button 
                    type="button"
                    onClick={handleSmartFix}
                    disabled={isAiProcessing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all hover:scale-105 disabled:opacity-50"
                  >
                    {isAiProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                    Perbaiki dengan AI
                  </button>
                )}
                
                <button 
                  type="button"
                  onClick={handleExport}
                  disabled={stats.total === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all hover:scale-105 disabled:opacity-50 disabled:bg-slate-400"
                >
                  <FileDown className="w-4 h-4" />
                  Export Excel
                </button>
              </div>
            </div>

            {/* Table */}
            <ResultsTable 
              data={studentData} 
              onApplySuggestion={applySuggestion} 
              onDeleteRow={handleDeleteRow}
            />
          </div>
        </div>

      </div>
    </div>
  );
}