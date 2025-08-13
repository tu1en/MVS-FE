import { useCallback, useState } from 'react';
import roomService from '../services/roomService';
import { showNotification } from '../utils/courseManagementUtils';

const useScheduleValidation = () => {
  const [validationState, setValidationState] = useState({
    isValidating: false,
    conflicts: [],
    warnings: []
  });

  // Validate single schedule slot
  const validateScheduleSlot = useCallback(async (scheduleData, options = {}) => {
    const { silent = false } = options;
    const { roomId, date, startTime, endTime, classId } = scheduleData;
    
    if (!roomId || !date || !startTime || !endTime) {
      return {
        isValid: false,
        errors: ['Thiếu thông tin phòng học, ngày, hoặc giờ học']
      };
    }

    try {
      if (!silent) {
        setValidationState(prev => ({ ...prev, isValidating: true }));
      }

      const response = await roomService.checkRoomAvailability({
        roomId,
        date,
        startTime,
        endTime,
        excludeClassId: classId
      });

      const result = response.data;
      
      if (!silent) {
        setValidationState(prev => ({ 
          ...prev, 
          isValidating: false,
          conflicts: result.conflicts || [],
          warnings: result.warnings || []
        }));
      }

      return {
        isValid: result.isAvailable,
        conflicts: result.conflicts || [],
        warnings: result.warnings || [],
        suggestions: result.suggestions || []
      };

    } catch (error) {
      console.error('Schedule validation error:', error);
      if (!silent) {
        setValidationState(prev => ({ ...prev, isValidating: false }));
      }
      
      return {
        isValid: false,
        errors: ['Lỗi kiểm tra lịch học: ' + error.message]
      };
    }
  }, []);

  // Validate multiple schedule slots (for entire class schedule)
  const validateMultipleSlots = useCallback(async (scheduleSlots) => {
    if (!Array.isArray(scheduleSlots) || scheduleSlots.length === 0) {
      return {
        isValid: false,
        errors: ['Không có lịch học để kiểm tra']
      };
    }

    try {
      setValidationState(prev => ({ ...prev, isValidating: true }));

      const validationResults = await Promise.all(
        scheduleSlots.map(slot => validateScheduleSlot(slot, { silent: true }))
      );

      const allConflicts = validationResults.flatMap(result => result.conflicts || []);
      const allWarnings = validationResults.flatMap(result => result.warnings || []);
      const allErrors = validationResults.flatMap(result => result.errors || []);
      const allSuggestions = validationResults.flatMap(result => result.suggestions || []);

      const isValid = validationResults.every(result => result.isValid) && allErrors.length === 0;

      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        conflicts: allConflicts,
        warnings: allWarnings
      }));

      return {
        isValid,
        conflicts: allConflicts,
        warnings: allWarnings,
        errors: allErrors,
        suggestions: allSuggestions,
        details: validationResults
      };

    } catch (error) {
      console.error('Multiple schedule validation error:', error);
      setValidationState(prev => ({ ...prev, isValidating: false }));
      
      return {
        isValid: false,
        errors: ['Lỗi kiểm tra lịch học: ' + error.message]
      };
    }
  }, [validateScheduleSlot]);

  // Get alternative time slots when there's a conflict
  const getAlternativeSlots = useCallback(async (originalSlot, preferences = {}) => {
    const { date, startTime, endTime, roomId } = originalSlot;
    const { 
      preferredBuilding = null,
      preferredRoomType = null,
      minCapacity = 0,
      flexibleTime = true,
      flexibleDate = false 
    } = preferences;

    try {
      const searchParams = {
        date,
        startTime,
        endTime,
        minCapacity,
        building: preferredBuilding,
        type: preferredRoomType
      };

      // Search for alternative rooms at same time
      let alternatives = [];
      
      // Same time, different rooms
      const sameTimeResponse = await roomService.getAvailableRooms(searchParams);
      const sameTimeRooms = sameTimeResponse.data?.data || [];
      
      alternatives = alternatives.concat(
        sameTimeRooms
          .filter(room => room.id !== roomId)
          .map(room => ({
            type: 'same_time_different_room',
            room,
            date,
            startTime,
            endTime,
            score: calculateRoomScore(room, preferences)
          }))
      );

      // Different times, same room (if flexible time allowed)
      if (flexibleTime) {
        const timeAlternatives = await findAlternativeTimeSlots(originalSlot, preferences);
        alternatives = alternatives.concat(timeAlternatives);
      }

      // Different dates (if flexible date allowed)
      if (flexibleDate) {
        const dateAlternatives = await findAlternativeDateSlots(originalSlot, preferences);
        alternatives = alternatives.concat(dateAlternatives);
      }

      // Sort by score (higher is better)
      alternatives.sort((a, b) => b.score - a.score);

      return {
        success: true,
        alternatives: alternatives.slice(0, 10) // Return top 10 alternatives
      };

    } catch (error) {
      console.error('Error getting alternative slots:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, []);

  // Helper function to calculate room preference score
  const calculateRoomScore = useCallback((room, preferences) => {
    let score = 0;
    
    // Capacity match (prefer rooms close to required capacity)
    const capacityDiff = Math.abs((room.capacity || 0) - (preferences.minCapacity || 0));
    score += Math.max(0, 50 - capacityDiff); // Max 50 points for capacity
    
    // Building preference
    if (preferences.preferredBuilding && room.building === preferences.preferredBuilding) {
      score += 30;
    }
    
    // Room type preference
    if (preferences.preferredRoomType && room.type === preferences.preferredRoomType) {
      score += 20;
    }
    
    // Room status
    if (room.status === 'active') {
      score += 10;
    }
    
    return score;
  }, []);

  // Find alternative time slots for same room
  const findAlternativeTimeSlots = useCallback(async (originalSlot, preferences) => {
    // This would typically call an API to find available time slots
    // For now, return empty array - to be implemented based on backend capabilities
    return [];
  }, []);

  // Find alternative date slots
  const findAlternativeDateSlots = useCallback(async (originalSlot, preferences) => {
    // This would typically call an API to find available dates
    // For now, return empty array - to be implemented based on backend capabilities
    return [];
  }, []);

  // Clear validation state
  const clearValidation = useCallback(() => {
    setValidationState({
      isValidating: false,
      conflicts: [],
      warnings: []
    });
  }, []);

  // Show validation results as notifications
  const showValidationResults = useCallback((results) => {
    if (results.errors && results.errors.length > 0) {
      results.errors.forEach(error => {
        showNotification(error, 'error');
      });
    }
    
    if (results.conflicts && results.conflicts.length > 0) {
      showNotification(
        `Phát hiện ${results.conflicts.length} xung đột lịch học`, 
        'warning'
      );
    }
    
    if (results.warnings && results.warnings.length > 0) {
      results.warnings.forEach(warning => {
        showNotification(warning.message || warning, 'warning');
      });
    }
    
    if (results.isValid) {
      showNotification('Lịch học hợp lệ!', 'success');
    }
  }, []);

  return {
    validationState,
    validateScheduleSlot,
    validateMultipleSlots,
    getAlternativeSlots,
    clearValidation,
    showValidationResults
  };
};

export default useScheduleValidation;