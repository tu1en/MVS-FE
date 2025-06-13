import {
    Archive,
    Calendar,
    Download,
    Eye,
    FileText,
    FolderOpen,
    Image,
    Search,
    Share2,
    Upload,
    User,
    Video
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardBody } from '../components/ui/card';
import { Input } from '../components/ui/input';
import MaterialService from '../services/materialService';

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
        fileName: 'db-design-tutorial.mp4',
        type: 'video',
        size: '125 MB',
        course: 'Database Systems',
        uploadDate: '2024-01-12',
        uploader: 'Prof. Johnson',
        downloads: 189,
        rating: 4.6,
        category: 'Video Tutorial',
        tags: ['database', 'normalization', 'ER diagram'],
        description: 'Step-by-step tutorial on database design and normalization'
      }
    ];

    setTimeout(() => {
      setMaterials(mockMaterials);
      setFilteredMaterials(mockMaterials);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter materials based on search and filters
  useEffect(() => {
    let filtered = materials;

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(material => material.type === selectedType);
    }

    if (selectedCourse !== 'all') {
      filtered = filtered.filter(material => material.course === selectedCourse);
    }

    setFilteredMaterials(filtered);
  }, [searchTerm, selectedType, selectedCourse, materials]);

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'image':
        return <Image className="h-5 w-5 text-green-500" />;
      case 'archive':
        return <Archive className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDownload = async (material) => {
    try {
      setDownloadProgress(prev => ({ ...prev, [material.id]: 0 }));

      // Use MaterialService to download material with progress tracking
      const blob = await MaterialService.downloadMaterial(
        material.id,
        (progress) => {
          setDownloadProgress(prev => ({ ...prev, [material.id]: progress }));
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.fileName;
      a.click();
      window.URL.revokeObjectURL(url);

      // Remove progress after completion
      setTimeout(() => {
        setDownloadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[material.id];
          return newProgress;
        });
      }, 1000);

      // Update download count
      setMaterials(prev => prev.map(m => 
        m.id === material.id ? { ...m, downloads: m.downloads + 1 } : m
      ));
    } catch (error) {
      console.error('Error downloading material:', error);
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[material.id];
        return newProgress;
      });
      // Show error message to user
      alert('Error downloading file. Please try again.');
    }
  };

  const getTypeDisplayName = (type) => {
    const typeMap = {
      pdf: 'PDF Documents',
      video: 'Video Files',
      image: 'Images',
      document: 'Documents',
      archive: 'Archives'
    };
    return typeMap[type] || type;
  };

  const courses = [...new Set(materials.map(m => m.course))];
  const types = [...new Set(materials.map(m => m.type))];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Materials</h1>
          <p className="text-gray-600 mt-1">Download course materials, documents, and resources</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Material
          </Button>
          <Button className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            My Uploads
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search materials by title, tags, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{getTypeDisplayName(type)}</option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Materials List */}
      <div className="space-y-4">
        {filteredMaterials.length === 0 ? (
          <Card>
            <CardBody className="p-8 text-center">
              <div className="text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No materials found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* File Icon and Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getFileIcon(material.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {material.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {material.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {material.uploader}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {material.uploadDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {material.downloads} downloads
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{material.course}</Badge>
                        <Badge variant="outline">{material.category}</Badge>
                        <Badge variant="outline">{material.size}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {material.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:flex-shrink-0">
                    <Button
                      onClick={() => handleDownload(material)}
                      className="flex items-center gap-2"
                      disabled={downloadProgress[material.id] !== undefined}
                    >
                      <Download className="h-4 w-4" />
                      {downloadProgress[material.id] !== undefined
                        ? `${downloadProgress[material.id]}%`
                        : 'Download'
                      }
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Download Progress */}
                {downloadProgress[material.id] !== undefined && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${downloadProgress[material.id]}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredMaterials.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="px-8">
            Load More Materials
          </Button>
        </div>
      )}
    </div>
  );
};

export default MaterialDownload;
