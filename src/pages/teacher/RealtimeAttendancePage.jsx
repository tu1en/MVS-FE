import { Clock, Users, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import attendanceSessionService from '../../services/attendanceSessionService';

const RealtimeAttendancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { classroomId } = useParams();
  
  // The session object is passed via location state when navigating
  const [session, setSession] = useState(location.state?.session);
  const [attendees, setAttendees] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionClosed, setIsSessionClosed] = useState(session?.isOpen === false);

  const calculateTimeLeft = useCallback(() => {
    if (!session || !session.expiresAt) return 0;
    const now = new Date();
    const expiry = new Date(session.expiresAt);
    const seconds = Math.max(0, Math.floor((expiry - now) / 1000));
    return seconds;
  }, [session]);
  
  // Effect for countdown timer
  useEffect(() => {
    if (!session || isSessionClosed) {
      setTimeLeft(0);
      return;
    };
    
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsSessionClosed(true);
          toast.error("Attendance session has expired.");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, isSessionClosed, calculateTimeLeft]);

  // Effect for fetching attendees periodically
  useEffect(() => {
    if (!session || isSessionClosed) return;

    const fetchAttendees = async () => {
      try {
        const data = await attendanceSessionService.getSessionAttendance(session.id);
        setAttendees(data);
      } catch (error) {
        console.error("Failed to fetch attendees:", error);
      }
    };
    
    fetchAttendees(); // Initial fetch
    const interval = setInterval(fetchAttendees, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [session, isSessionClosed]);

  const handleCloseSession = async () => {
    setIsLoading(true);
    try {
      await attendanceSessionService.closeSession(session.id);
      toast.success("Session closed successfully.");
      setIsSessionClosed(true);
      setTimeLeft(0);
    } catch (error) {
      console.error("Failed to close session:", error);
      toast.error(error.response?.data?.message || "Failed to close session.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <h2 className="text-2xl font-bold mb-4">No active session found.</h2>
        <Button onClick={() => navigate(`/teacher/courses/${classroomId}`)}>
            Go back to Classroom
        </Button>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Real-time Attendance</CardTitle>
          <CardContent>
            <p>Session for Classroom ID: {session.classroom.id}</p>
          </CardContent>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          {/* Left side: QR Code and Timer */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Scan QR Code to Join</h3>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <QRCodeSVG value={JSON.stringify({ sessionId: session.id })} size={256} />
            </div>
            <div className="mt-6 text-center">
              {isSessionClosed ? (
                 <Badge variant="destructive" className="text-lg p-2">Session Closed</Badge>
              ) : (
                <>
                  <div className="text-lg font-semibold">Time Remaining</div>
                  <div className="text-4xl font-bold text-primary">
                    <Clock className="inline-block w-8 h-8 mr-2" />
                    {formatTime(timeLeft)}
                  </div>
                </>
              )}
            </div>
             <Button 
                onClick={handleCloseSession} 
                disabled={isLoading || isSessionClosed} 
                className="mt-6 w-full"
                variant="destructive"
            >
                <XCircle className="mr-2 h-4 w-4" />
                {isLoading ? 'Closing...' : 'Close Session Now'}
            </Button>
          </div>

          {/* Right side: Attendees List */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="mr-2" />
                Attendees ({attendees.length})
            </h3>
            <div className="flex-grow bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
              {attendees.length > 0 ? (
                <ul>
                  {attendees.map((att, index) => (
                    <li key={index} className="flex items-center justify-between p-2 border-b">
                      <span>{att.studentName} (ID: {att.studentId})</span>
                       <Badge variant="secondary">{new Date(att.timestamp).toLocaleTimeString()}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No students have checked in yet.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeAttendancePage; 