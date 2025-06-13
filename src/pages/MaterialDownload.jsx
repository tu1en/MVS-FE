import {
  Archive,
  Download,
  Eye,
  FileText,
  Filter,
  FolderOpen,
  Image,
  Search,
  Share2,
  Star,
  Upload,
  Video
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

const MaterialDownload = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState({});

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const mockMaterials = [
          {
            id: 1,
            title: 'Software Engineering Principles',
            fileName: 'se-principles.pdf',
            type: 'pdf',
            size: '2.5 MB',
            course: 'Software Engineering',
            uploadDate: '2024-01-15',
            uploader: 'Dr. Smith',
            downloads: 245,
            rating: 4.8,
            category: 'Lecture Notes',
            tags: ['fundamentals', 'design patterns', 'architecture'],
            description: 'Comprehensive guide to software engineering principles and best practices'
          },
          {
            id: 2,
            title: 'Database Design Tutorial',
            fileName: 'db-design.pdf',
            type: 'pdf',
            size: '1.8 MB',
            course: 'Database Systems',
            uploadDate: '2024-01-20',
            uploader: 'Prof. Johnson',
            downloads: 189,
            rating: 4.6,
            category: 'Tutorial',
            tags: ['database', 'normalization', 'SQL'],
            description: 'Step-by-step guide to database design and normalization'
          },
          {
            id: 3,
            title: 'Programming Assignment 1',
            fileName: 'prog-assignment-1.zip',
            type: 'archive',
            size: '512 KB',
            course: 'Programming Fundamentals',
            uploadDate: '2024-01-22',
            uploader: 'Teaching Assistant',
            downloads: 156,
            rating: 4.3,
            category: 'Assignment',
            tags: ['programming', 'loops', 'functions'],
            description: 'First programming assignment with starter code and requirements'
          }
        ];
        setMaterials(mockMaterials);
        setFilteredMaterials(mockMaterials);
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, []);

  // Filter materials based on search and filters
  useEffect(() => {
    let filtered = materials;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.uploader.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(material => material.type === selectedType);
    }

    // Course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(material => material.course === selectedCourse);
    }

    setFilteredMaterials(filtered);
  }, [searchTerm, selectedType, selectedCourse, materials]);

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'image':
        return <Image className="h-5 w-5 text-green-500" />;
      case 'archive':
        return <Archive className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDownload = async (materialId, fileName) => {
    try {
      setDownloadProgress(prev => ({ ...prev, [materialId]: 0 }));
      
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          const currentProgress = prev[materialId] || 0;
          const newProgress = Math.min(currentProgress + 10, 100);
          
          if (newProgress === 100) {
            clearInterval(progressInterval);
            // Remove progress after completion
            setTimeout(() => {
              setDownloadProgress(prev => {
                const updated = { ...prev };
                delete updated[materialId];
                return updated;
              });
            }, 1000);
          }
          
          return { ...prev, [materialId]: newProgress };
        });
      }, 200);

      // In a real app, you would call the actual download service
      // await MaterialService.downloadMaterial(materialId);
      
      console.log(`Downloading: ${fileName}`);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadProgress(prev => {
        const updated = { ...prev };
        delete updated[materialId];
        return updated;
      });
    }
  };

  const getUniqueValues = (field) => {
    return [...new Set(materials.map(material => material[field]))];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Course Materials</h1>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Material
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="archive">Archive</option>
            </select>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Courses</option>
              {getUniqueValues('course').map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <Card key={material.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getFileIcon(material.type)}
                  <CardTitle className="text-lg">{material.title}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">{material.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-gray-600">{material.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {material.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Course:</span>
                  <span className="font-medium">{material.course}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Size:</span>
                  <span>{material.size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Uploaded:</span>
                  <span>{material.uploadDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>By:</span>
                  <span>{material.uploader}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Downloads:</span>
                  <span>{material.downloads}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button 
                  onClick={() => handleDownload(material.id, material.fileName)}
                  className="flex-1"
                  disabled={downloadProgress[material.id] !== undefined}
                >
                  {downloadProgress[material.id] !== undefined ? (
                    <span>Downloading {downloadProgress[material.id]}%</span>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {downloadProgress[material.id] !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress[material.id]}%` }}
                  ></div>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No materials found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
          <Button className="mt-4">
            <Upload className="h-4 w-4 mr-2" />
            Upload First Material
          </Button>
        </div>
      )}
    </div>
  );
};

export default MaterialDownload;
