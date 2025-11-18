import React from 'react';
import { ComparisonResult } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface ResultTableProps {
  data: ComparisonResult[];
}

const ResultTable: React.FC<ResultTableProps> = ({ data }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
       <h2 className="text-2xl font-bold text-center p-6 text-gray-100 bg-gray-800">ผลการเปรียบเทียบ</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">หัวข้อ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">ค่าจากไฟล์อ้างอิง</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">ค่าจากไฟล์ที่วิเคราะห์</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">ผลการเปรียบเทียบ</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-800/60 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{item.topic}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.referenceValue}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.analysisValue}</td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-300">
                  <div className="flex items-start">
                    {item.comparison.pass ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mr-2 mt-0.5" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mr-2 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold ${item.comparison.pass ? 'text-green-400' : 'text-red-400'}`}>
                        {item.comparison.pass ? 'ผ่าน' : 'ไม่ผ่าน'}
                      </p>
                      <p className="text-gray-400">{item.comparison.reason}</p>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultTable;