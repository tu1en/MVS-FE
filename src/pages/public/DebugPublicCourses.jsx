import React, { useState, useEffect } from 'react';
import courseService from '../../services/courseService';

const DebugPublicCourses = () => {
  const [debugInfo, setDebugInfo] = useState({
    loading: true,
    response: null,
    error: null,
    apiUrl: 'http://localhost:8088/api/public/courses'
  });

  useEffect(() => {
    debugApi();
  }, []);

  const debugApi = async () => {
    console.log('🔍 Starting API debug...');
    
    try {
      setDebugInfo(prev => ({ ...prev, loading: true, error: null }));
      
      // Test the API call
      console.log('📡 Calling courseService.getPublicCourses()...');
      const response = await courseService.getPublicCourses();
      
      console.log('✅ API Response:', response);
      console.log('📊 Response data:', response.data);
      console.log('📈 Number of courses:', response.data?.length || 0);
      
      setDebugInfo(prev => ({
        ...prev,
        loading: false,
        response: response,
        error: null
      }));
      
    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('📋 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      setDebugInfo(prev => ({
        ...prev,
        loading: false,
        error: error,
        response: null
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-100 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">🔍 Public Courses API Debug</h1>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">API Information:</h2>
          <p><strong>API URL:</strong> {debugInfo.apiUrl}</p>
          <p><strong>Backend Expected:</strong> http://localhost:8088</p>
        </div>

        {debugInfo.loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <p>🔄 Loading API data...</p>
          </div>
        )}

        {debugInfo.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">❌ API Error:</h3>
            <p><strong>Message:</strong> {debugInfo.error.message}</p>
            <p><strong>Status:</strong> {debugInfo.error.response?.status}</p>
            <p><strong>Status Text:</strong> {debugInfo.error.response?.statusText}</p>
            {debugInfo.error.response?.data && (
              <div className="mt-2">
                <strong>Response Data:</strong>
                <pre className="bg-gray-200 p-2 rounded mt-1 text-xs overflow-auto">
                  {JSON.stringify(debugInfo.error.response.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {debugInfo.response && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">✅ API Success:</h3>
            <p><strong>Status:</strong> {debugInfo.response.status}</p>
            <p><strong>Courses Found:</strong> {debugInfo.response.data?.length || 0}</p>
            
            {debugInfo.response.data && debugInfo.response.data.length > 0 ? (
              <div className="mt-2">
                <strong>Course Data:</strong>
                <pre className="bg-gray-200 p-2 rounded mt-1 text-xs overflow-auto max-h-64">
                  {JSON.stringify(debugInfo.response.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="mt-2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded">
                <p><strong>⚠️ No courses found!</strong></p>
                <p>This means:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>Your backend API is working</li>
                  <li>But there are no courses with is_public = true in your database</li>
                  <li>You need to add some public courses to see them here</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">🛠️ Troubleshooting Steps:</h3>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Make sure your backend server is running on port 8088</li>
            <li>Check if the PublicCourseController endpoint exists</li>
            <li>Verify the database has courses with is_public = true</li>
            <li>Check browser console for additional error details</li>
          </ol>
        </div>

        <button 
          onClick={debugApi}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          🔄 Retry API Call
        </button>
      </div>
    </div>
  );
};

export default DebugPublicCourses;