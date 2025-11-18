
import React, { useCallback, useState } from 'react';
import PhotoIcon from './icons/PhotoIcon';
import DocumentIcon from './icons/DocumentIcon';
import type { UploadedFile } from '../types';

interface FileUploadProps {
  title: string;
  onFileSelect: (file: File, previewUrl: string) => void;
  uploadedFile: UploadedFile | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ title, onFileSelect, uploadedFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileSelect(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow drop
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };


  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-dashed border-gray-600 transition-all duration-300">
      <h2 className="text-xl font-semibold text-center mb-4 text-gray-200">{title}</h2>
      <div 
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragging ? 'border-sky-400 bg-gray-700/50' : 'border-gray-500 hover:border-sky-500'}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => document.getElementById(`file-input-${title.replace(/\s+/g, '-')}`)?.click()}
      >
        <input
          type="file"
          id={`file-input-${title.replace(/\s+/g, '-')}`}
          className="hidden"
          accept="image/*,application/pdf"
          onChange={(e) => handleFileChange(e.target.files)}
        />
        {uploadedFile ? (
          <div className="text-center">
            {uploadedFile.file.type.startsWith('image/') ? (
              <img src={uploadedFile.previewUrl} alt="Preview" className="max-h-48 rounded-lg mx-auto shadow-md" />
            ) : (
              <div className="flex flex-col items-center text-gray-300">
                <DocumentIcon className="w-20 h-20" />
              </div>
            )}
            <p className="mt-4 text-sm font-medium text-gray-300 break-all">{uploadedFile.file.name}</p>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <div className="flex justify-center items-center">
                <PhotoIcon className="w-12 h-12 mr-2" />
                <DocumentIcon className="w-12 h-12 ml-2" />
            </div>
            <p className="mt-2 font-semibold">ลากและวางไฟล์ที่นี่</p>
            <p className="text-sm">หรือคลิกเพื่อเลือกไฟล์</p>
            <p className="text-xs mt-1 text-gray-500">(รูปภาพ หรือ PDF)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
