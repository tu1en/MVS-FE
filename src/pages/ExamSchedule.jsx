import React from 'react';

function ExamSchedule() {
  // Mock data - replace with actual API call later
  const examSchedule = [
    {
      class: '10A1',
      classType: 'Luyện đề',
      subject: 'Toán',
      examType: 'mock',
      examDate: '2025-06-10'
    },
    {
      class: '10A1',
      classType: 'Luyện đề',
      subject: 'Vật lý',
      examType: 'final',
      examDate: '2025-06-20'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 bg-[#f3e8ff] min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Lịch Thi</h1>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại Lớp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn Học</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại Thi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Thi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {examSchedule.map((exam, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.class}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.classType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.examType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.examDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExamSchedule; 