import { useState, useEffect } from 'react';
import { getPrograms } from '../../shared/api';
import type { Program } from '../../database/supabase';
import { MOCK_PROGRAMS, ERROR_MESSAGES } from '../../core/constants';

export function useProgramsData() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setIsLoadingPrograms(true);
        const data = await getPrograms();
        console.log("Fetched programs:", data); // Debug log
        setPrograms(data);
        setDbError(null);
      } catch (error) {
        console.error("Error fetching programs:", error);
        setDbError(ERROR_MESSAGES.PROGRAMS_LOAD_FAILED);
        // Set mock programs as fallback
        setPrograms(MOCK_PROGRAMS);
      } finally {
        setIsLoadingPrograms(false);
      }
    }
    fetchPrograms();
  }, []);

  return {
    programs,
    isLoadingPrograms,
    dbError,
    setDbError // For manual error handling
  };
}