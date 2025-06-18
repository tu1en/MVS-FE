import {
    BookOpen,
    Calendar,
    Edit,
    Eye,
    FileText,
    Image,
    Pause,
    Play,
    Plus,
    Save,
    Trash2,
    Upload,
    Video
} from 'lucide-react';
// import MaterialService from '../services/materialService'; // Unused
import { useEffect, useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import LectureService from '../services/lectureService';

const LectureCreator = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [lecture, setLecture] = useState({
    title: '',
    description: '',
    course: '',
    duration: '',
    date: '',
    time: '',
    type: 'live', // live, recorded, hybrid
    objectives: [''],
    materials: [],
    agenda: [{ time: '', topic: '', duration: 30 }],
    recording: null,
    slides: [],
    assignments: [],
    assessment: {
      hasQuiz: false,
      hasAssignment: false,
      dueDate: '',
      instructions: ''
    }
  });
  
  const [courses, setCourses] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [savedLectures, setSavedLectures] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setCourses([
      { id: 1, name: 'Software Engineering', code: 'SE101' },
      { id: 2, name: 'Database Systems', code: 'DB201' },
      { id: 3, name: 'Web Development', code: 'WD301' },
      { id: 4, name: 'Mobile Programming', code: 'MP401' }
    ]);

    setSavedLectures([
      {
        id: 1,
        title: 'Introduction to Software Engineering',
        course: 'Software Engineering',
        date: '2024-01-20',
        time: '09:00',
        duration: '90 minutes',
        type: 'live',
        status: 'scheduled',
        attendees: 25
      },
      {
        id: 2,
        title: 'Database Design Principles',
        course: 'Database Systems',
        date: '2024-01-18',
        time: '14:00',
        duration: '120 minutes',
        type: 'recorded',
        status: 'completed',
        attendees: 30
      }
    ]);
  }, []);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleInputChange = (field, value) => {
    setLecture(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...lecture.objectives];
    newObjectives[index] = value;
    setLecture(prev => ({
      ...prev,
      objectives: newObjectives
    }));
  };

  const addObjective = () => {
    setLecture(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const removeObjective = (index) => {
    const newObjectives = lecture.objectives.filter((_, i) => i !== index);
    setLecture(prev => ({
      ...prev,
      objectives: newObjectives
    }));
  };

  const handleAgendaChange = (index, field, value) => {
    const newAgenda = [...lecture.agenda];
    newAgenda[index][field] = value;
    setLecture(prev => ({
      ...prev,
      agenda: newAgenda
    }));
  };

  const addAgendaItem = () => {
    setLecture(prev => ({
      ...prev,
      agenda: [...prev.agenda, { time: '', topic: '', duration: 30 }]
    }));
  };

  const removeAgendaItem = (index) => {
    const newAgenda = lecture.agenda.filter((_, i) => i !== index);
    setLecture(prev => ({
      ...prev,
      agenda: newAgenda
    }));
  };

  const handleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Stop recording logic here
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      // Start recording logic here
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveLecture = async () => {
    setLoading(true);
    try {
      // Use LectureService to create lecture
      const newLecture = await LectureService.createLecture({
        ...lecture,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      });
      
      setSavedLectures(prev => [newLecture, ...prev]);
      
      // Reset form
      setLecture({
        title: '',
        description: '',
        course: '',
        duration: '',
        date: '',
        time: '',
        type: 'live',
        objectives: [''],
        materials: [],
        agenda: [{ time: '', topic: '', duration: 30 }],
        recording: null,
        slides: [],
        assignments: [],
        assessment: {
          hasQuiz: false,
          hasAssignment: false,
          dueDate: '',
          instructions: ''
        }
      });
      
      alert('Lecture saved successfully!');
    } catch (error) {
      console.error('Error saving lecture:', error);
      alert('Error saving lecture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteLecture = (id) => {
    setSavedLectures(prev => prev.filter(lecture => lecture.id !== id));
  };

  const handleFileUpload = async (type, files) => {
    try {
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        
        // If we have a lecture ID (for editing), upload to that lecture
        if (lecture.id) {
          await LectureService.uploadLectureMaterial(lecture.id, formData, (progress) => {
            console.log(`Upload progress: ${progress}%`);
          });
        } else {
          // For new lectures, store temporarily until lecture is saved
          const fileObj = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
          };
          
          setLecture(prev => ({
            ...prev,
            [type]: [...prev[type], fileObj]
          }));
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    }
  };

  // const removeFile = (type, fileId) => {
  //   setLecture(prev => ({
  //     ...prev,
  //     [type]: prev[type].filter(file => file.id !== fileId)
  //   }));
  // };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lecture Creator</h1>
          <p className="text-gray-600 mt-1">Create and manage your lectures, content, and materials</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={saveLecture} 
            disabled={loading || !lecture.title}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Lecture'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Create New Lecture</CardTitle>
            </CardHeader>
            <CardBody>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                  <TabsTrigger value="recording">Recording</TabsTrigger>
                  <TabsTrigger value="assessment">Assessment</TabsTrigger>
                </TabsList>

                {/* Basic Information */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Lecture Title *</label>
                      <Input
                        placeholder="Enter lecture title"
                        value={lecture.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Course *</label>
                      <select
                        value={lecture.course}
                        onChange={(e) => handleInputChange('course', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.name}>
                            {course.code} - {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      placeholder="Describe what this lecture covers..."
                      value={lecture.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date *</label>
                      <Input
                        type="date"
                        value={lecture.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time *</label>
                      <Input
                        type="time"
                        value={lecture.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                      <Input
                        type="number"
                        placeholder="90"
                        value={lecture.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Lecture Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="live"
                          checked={lecture.type === 'live'}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="mr-2"
                        />
                        Live Session
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="recorded"
                          checked={lecture.type === 'recorded'}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="mr-2"
                        />
                        Pre-recorded
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="hybrid"
                          checked={lecture.type === 'hybrid'}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="mr-2"
                        />
                        Hybrid
                      </label>
                    </div>
                  </div>
                </TabsContent>

                {/* Content & Agenda */}
                <TabsContent value="content" className="space-y-4">
                  {/* Learning Objectives */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium">Learning Objectives</label>
                      <Button variant="outline" size="sm" onClick={addObjective}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Objective
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {lecture.objectives.map((objective, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Objective ${index + 1}`}
                            value={objective}
                            onChange={(e) => handleObjectiveChange(index, e.target.value)}
                            className="flex-1"
                          />
                          {lecture.objectives.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeObjective(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lecture Agenda */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium">Lecture Agenda</label>
                      <Button variant="outline" size="sm" onClick={addAgendaItem}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {lecture.agenda.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg">
                          <Input
                            placeholder="Time (e.g., 09:00)"
                            value={item.time}
                            onChange={(e) => handleAgendaChange(index, 'time', e.target.value)}
                          />
                          <Input
                            placeholder="Topic"
                            value={item.topic}
                            onChange={(e) => handleAgendaChange(index, 'topic', e.target.value)}
                            className="md:col-span-2"
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Duration (min)"
                              value={item.duration}
                              onChange={(e) => handleAgendaChange(index, 'duration', parseInt(e.target.value))}
                            />
                            {lecture.agenda.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeAgendaItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Materials */}
                <TabsContent value="materials" className="space-y-4">
                  {/* Slides */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Presentation Slides</label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                      onClick={() => document.getElementById('slides-upload').click()}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Click to upload slides or drag and drop</p>
                      <p className="text-sm text-gray-500">PDF, PPT, PPTX files supported</p>
                    </div>
                    <input
                      id="slides-upload"
                      type="file"
                      multiple
                      accept=".pdf,.ppt,.pptx"
                      onChange={(e) => handleFileUpload('slides', e.target.files)}
                      className="hidden"
                    />
                    {lecture.slides.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {lecture.slides.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(1)} MB)
                              </span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Additional Materials */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Additional Materials</label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                      onClick={() => document.getElementById('materials-upload').click()}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Upload supporting materials</p>
                      <p className="text-sm text-gray-500">Documents, videos, images, etc.</p>
                    </div>
                    <input
                      id="materials-upload"
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload('materials', e.target.files)}
                      className="hidden"
                    />
                    {lecture.materials.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {lecture.materials.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              {file.type.startsWith('image/') ? (
                                <Image className="h-4 w-4 text-green-500" />
                              ) : file.type.startsWith('video/') ? (
                                <Video className="h-4 w-4 text-purple-500" />
                              ) : (
                                <FileText className="h-4 w-4 text-blue-500" />
                              )}
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(1)} MB)
                              </span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Recording */}
                <TabsContent value="recording" className="space-y-4">
                  <div className="text-center p-8 border rounded-lg bg-gray-50">
                    <div className="mb-6">
                      <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                        isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-200'
                      }`}>
                        {isRecording ? (
                          <Pause className="h-8 w-8 text-red-600" />
                        ) : (
                          <Video className="h-8 w-8 text-gray-600" />
                        )}
                      </div>
                    </div>
                    
                    {isRecording && (
                      <div className="mb-4">
                        <div className="text-2xl font-mono text-red-600 mb-2">
                          {formatTime(recordingTime)}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-red-600">Recording in progress...</span>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={handleRecording}
                      className={`px-8 py-3 ${
                        isRecording 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <Pause className="h-5 w-5 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    
                    {!isRecording && (
                      <p className="text-sm text-gray-600 mt-4">
                        Record your lecture directly in the browser or upload a pre-recorded video
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-3">Or Upload Pre-recorded Video</label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                      onClick={() => document.getElementById('video-upload').click()}
                    >
                      <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Upload video file</p>
                      <p className="text-sm text-gray-500">MP4, MOV, AVI formats supported</p>
                    </div>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                    />
                  </div>
                </TabsContent>

                {/* Assessment */}
                <TabsContent value="assessment" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="hasQuiz"
                        checked={lecture.assessment.hasQuiz}
                        onChange={(e) => handleInputChange('assessment', {
                          ...lecture.assessment,
                          hasQuiz: e.target.checked
                        })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="hasQuiz" className="text-sm font-medium">
                        Include Quiz/Poll during lecture
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="hasAssignment"
                        checked={lecture.assessment.hasAssignment}
                        onChange={(e) => handleInputChange('assessment', {
                          ...lecture.assessment,
                          hasAssignment: e.target.checked
                        })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="hasAssignment" className="text-sm font-medium">
                        Assign homework/assignment after lecture
                      </label>
                    </div>
                    
                    {lecture.assessment.hasAssignment && (
                      <div className="ml-7 space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">Due Date</label>
                          <Input
                            type="date"
                            value={lecture.assessment.dueDate}
                            onChange={(e) => handleInputChange('assessment', {
                              ...lecture.assessment,
                              dueDate: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Assignment Instructions</label>
                          <Textarea
                            placeholder="Describe the assignment requirements..."
                            value={lecture.assessment.instructions}
                            onChange={(e) => handleInputChange('assessment', {
                              ...lecture.assessment,
                              instructions: e.target.value
                            })}
                            rows={4}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar - Saved Lectures */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Lectures
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {savedLectures.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No lectures created yet
                  </p>
                ) : (
                  savedLectures.map((savedLecture) => (
                    <div key={savedLecture.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {savedLecture.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {savedLecture.course}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant={savedLecture.status === 'completed' ? 'success' : 'secondary'}
                              className="text-xs"
                            >
                              {savedLecture.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {savedLecture.attendees} students
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {savedLecture.date} at {savedLecture.time}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 ml-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteLecture(savedLecture.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Lectures</span>
                  <span className="text-sm font-medium">{savedLectures.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="text-sm font-medium">
                    {savedLectures.filter(l => {
                      const lectureDate = new Date(l.date);
                      const now = new Date();
                      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      return lectureDate >= weekAgo && lectureDate <= now;
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg. Duration</span>
                  <span className="text-sm font-medium">90 min</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LectureCreator;
