import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../../services/courseService';

const PublicCourseDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicCourses();
  }, []);

  const fetchPublicCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getPublicCourses();
      setCourses(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchPublicCourses}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Available Courses
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover our wide range of courses and start your learning journey today. 
          Browse through our course catalog and enroll in the ones that interest you.
        </p>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Courses Available
            </h3>
            <p className="text-gray-600">
              There are currently no public courses available for enrollment.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {course.name}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {course.description || 'No description available'}
                </p>
                
                <div className="mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {course.enrollmentFee ? 
                      `${course.enrollmentFee.toLocaleString('vi-VN')}đ` : 
                      'Free'
                    }
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 mb-6 space-y-1">
                  {course.instructorName && (
                    <p><strong>Instructor:</strong> {course.instructorName}</p>
                  )}
                  {course.duration && (
                    <p><strong>Duration:</strong> {course.duration} weeks</p>
                  )}
                  {course.maxStudentsPerTemplate && (
                    <p><strong>Max Students:</strong> {course.maxStudentsPerTemplate}</p>
                  )}
                  {course.subject && (
                    <p><strong>Subject:</strong> {course.subject}</p>
                  )}
                </div>
                
                <Link 
                  to={`/public/courses/${course.id}`}
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  View Details & Enroll
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-12 text-center">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Need Help?
          </h3>
          <p className="text-blue-700">
            If you have questions about our courses or need assistance with enrollment, 
            please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicCourseDashboard;