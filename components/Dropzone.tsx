import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';

interface DropzoneProps {
  onFileLoaded: (file: File) => void;
  label: string;
  subLabel?: string;
  acceptedFile?: File | null;
  id: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileLoaded, label, subLabel, acceptedFile, id }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileLoaded(e.dataTransfer.files[0]);
      }
    },
    [onFileLoaded]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileLoaded(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 flex flex-col items-center justify-center text-center h-48 group cursor-pointer
        ${acceptedFile 
          ? 'border-emerald-400 bg-emerald-50' 
          : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
        }`}
    >
      <input
        type="file"
        id={id}
        accept=".xlsx, .xls"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
      />
      
      {acceptedFile ? (
        <>
          <CheckCircle className="w-10 h-10 text-emerald-500 mb-3" />
          <p className="font-semibold text-emerald-700 truncate max-w-full px-4">{acceptedFile.name}</p>
          <p className="text-xs text-emerald-600 mt-1">File siap diproses</p>
        </>
      ) : (
        <>
          <div className="p-3 bg-blue-50 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          </div>
          <p className="font-medium text-slate-700">{label}</p>
          {subLabel && <p className="text-xs text-slate-400 mt-1">{subLabel}</p>}
          <p className="mt-4 text-xs font-semibold text-blue-600 uppercase tracking-wide">Browse or Drop</p>
        </>
      )}
    </div>
  );
};
