import { useState, useEffect } from 'react';
import { getUserPoints, saveUserPoints } from '../../shared/api';
import { POINTS_SAVE_DEBOUNCE_MS, ERROR_MESSAGES } from '../../core/constants';

// Debounce utility
function useDebouncedEffect(effect: () => void, deps: any[], delay: number) {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);
    return () => clearTimeout(handler);
  }, [...deps, delay]);
}

export function usePointsManagement(userId: string) {
  const [userPoints, setUserPoints] = useState<{ [programId: number]: number }>({});
  const [pointsError, setPointsError] = useState<string | null>(null);

  // Fetch user points on mount
  useEffect(() => {
    async function fetchPoints() {
      try {
        const points = await getUserPoints(userId);
        setUserPoints(points);
      } catch (err) {
        setPointsError(ERROR_MESSAGES.POINTS_LOAD_FAILED);
      }
    }
    fetchPoints();
  }, [userId]);

  // Save user points when they change (debounced)
  useDebouncedEffect(() => {
    async function savePoints() {
      try {
        await saveUserPoints(userId, userPoints);
        setPointsError(null);
      } catch (err) {
        setPointsError(ERROR_MESSAGES.POINTS_SAVE_FAILED);
      }
    }
    if (Object.keys(userPoints).length > 0) {
      savePoints();
    }
  }, [userPoints, userId], POINTS_SAVE_DEBOUNCE_MS);

  const updateUserPoints = (programId: number, value: number) => {
    setUserPoints(prev => ({
      ...prev,
      [programId]: value
    }));
  };

  return {
    userPoints,
    pointsError,
    updateUserPoints,
    setPointsError // For manual error handling
  };
}