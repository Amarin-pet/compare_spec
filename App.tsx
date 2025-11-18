
import React, { useState, useCallback } from 'react';
import { ComparisonResult, UploadedFile } from './types';
import { analyzeDocuments } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ResultTable from './components/ResultTable';

const App: React.FC = () => {
  const [referenceFile, setReferenceFile] = useState<UploadedFile | null>(null);
  const [analysisFile, setAnalysisFile] = useState<UploadedFile | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!referenceFile || !analysisFile) {
      setError('กรุณาอัปโหลดไฟล์ทั้งสองฝั่ง');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setComparisonResult(null);

    try {
      const results = await analyzeDocuments(referenceFile.file, analysisFile.file);
      setComparisonResult(results);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [referenceFile, analysisFile]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
            เครื่องมือวิเคราะห์และเปรียบเทียบเอกสาร
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            อัปโหลดไฟล์อ้างอิงและไฟล์ที่ต้องการวิเคราะห์เพื่อเปรียบเทียบข้อมูลจำเพาะและราคา
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <FileUpload 
              title="ไฟล์อ้างอิง" 
              onFileSelect={(file, previewUrl) => setReferenceFile({ file, previewUrl })}
              uploadedFile={referenceFile}
            />
            <FileUpload 
              title="ไฟล์ที่ต้องการวิเคราะห์" 
              onFileSelect={(file, previewUrl) => setAnalysisFile({ file, previewUrl })}
              uploadedFile={analysisFile}
            />
          </div>

          <div className="text-center mb-8">
            <button
              onClick={handleAnalyze}
              disabled={!referenceFile || !analysisFile || isLoading}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading ? 'กำลังวิเคราะห์...' : 'เริ่มการวิเคราะห์'}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative text-center mb-6" role="alert">
              <strong className="font-bold">เกิดข้อผิดพลาด:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-lg">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400 mb-4"></div>
              <p className="text-lg text-gray-300">AI กำลังวิเคราะห์ข้อมูล... กรุณารอสักครู่</p>
            </div>
          )}

          {comparisonResult && (
            <ResultTable data={comparisonResult} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
