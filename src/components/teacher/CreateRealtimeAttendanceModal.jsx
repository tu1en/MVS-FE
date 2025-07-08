import React, { useState } from 'react';
import toast from 'react-hot-toast';
import attendanceSessionService from '../../services/attendanceSessionService';

const CreateRealtimeAttendanceModal = ({ classroomId, onSessionCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState(5); // Default duration 5 minutes
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const sessionData = {
        classroomId: classroomId,
        durationInMinutes: parseInt(duration, 10),
      };
      const newSession = await attendanceSessionService.createSession(sessionData);
      toast.success('Attendance session started successfully!');
      onSessionCreated(newSession); // Callback to parent component
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create attendance session:", error);
      toast.error(error.response?.data?.message || 'Failed to start session. Is there another session already active?');
    } finally {
      setIsLoading(false);
    }
  };

  // The component is temporarily disabled because UI components (Dialog, Label, Button) are missing.
  // TODO: Install or create the required components from your UI library (e.g., shadcn/ui).
  // npx shadcn-ui@latest add dialog
  // npx shadcn-ui@latest add label
  // npx shadcn-ui@latest add button

  return (
    <div>
      <p>Start Attendance Session (UI Disabled)</p>
      <form onSubmit={handleSubmit}>
        <input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="1"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Starting...' : 'Start Session'}
        </button>
      </form>
    </div>
  );
  
  /*
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Start Attendance Session</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start Real-time Attendance</DialogTitle>
          <DialogDescription>
            Set the duration for the attendance session. Students will be able to join within this time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="col-span-3"
                min="1"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Starting...' : 'Start Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
  */
};

export default CreateRealtimeAttendanceModal; 