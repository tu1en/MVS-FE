import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClassroomList from '../components/classroom/ClassroomList';
import ClassroomForm from '../components/classroom/ClassroomForm';
import SessionList from '../components/session/SessionList';
import SlotList from '../components/slot/SlotList';

/**
 * Routes cho Classroom Management Module
 */
const ClassroomRoutes = () => {
  return (
    <Routes>
      {/* Classroom Routes */}
      <Route path="/" element={<ClassroomList />} />
      <Route path="/create" element={<ClassroomForm mode="create" />} />
      <Route path="/:id" element={<ClassroomList />} />
      <Route path="/:id/edit" element={<ClassroomForm mode="edit" />} />
      
      {/* Session Routes */}
      <Route path="/:classroomId/sessions" element={<SessionList />} />
      <Route path="/:classroomId/sessions/create" element={<SessionForm mode="create" />} />
      <Route path="/sessions/:id" element={<SessionList />} />
      <Route path="/sessions/:id/edit" element={<SessionForm mode="edit" />} />
      
      {/* Slot Routes */}
      <Route path="/sessions/:sessionId/slots" element={<SlotList />} />
      <Route path="/sessions/:sessionId/slots/create" element={<SlotForm mode="create" />} />
      <Route path="/slots/:id" element={<SlotList />} />
      <Route path="/slots/:id/edit" element={<SlotForm mode="edit" />} />
    </Routes>
  );
};

export default ClassroomRoutes;
