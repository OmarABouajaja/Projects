import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";

// Allow testing time from console (dev mode only)
declare global {
  interface Window {
    __TEST_TUNISIAN_TIME__?: Date;
    __TEST_TIME_CHANGE__?: () => void;
  }
}

const isDev = import.meta.env.DEV;

interface TimeStatus {
  isOpen: boolean;
  hoursUntilOpen: number;
  minutesUntilOpen: number;
  currentTime: string;
  currentHour: number;
}

const TUNISIAN_TIMEZONE = "Africa/Tunis";
const OPENING_HOUR = 9;
const CLOSING_HOUR = 1; // 1:00 AM (01:00)

/**
 * Custom hook to get Tunisian time and store status
 * Test time override (window.__TEST_TUNISIAN_TIME__) is only available in dev mode
 */
// Helper function to calculate status (defined outside hook to avoid initialization issues)
const calculateStatus = (): TimeStatus => {
    try {
      // Use test time only in dev mode, otherwise use current time
      const now = (isDev && window.__TEST_TUNISIAN_TIME__) ? window.__TEST_TUNISIAN_TIME__ : new Date();
      
      // Get current time in Tunisian timezone
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: TUNISIAN_TIMEZONE,
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });
      
      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: TUNISIAN_TIMEZONE,
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      });

      const parts = formatter.formatToParts(now);
      const hourPart = parts.find(part => part.type === 'hour');
      const minutePart = parts.find(part => part.type === 'minute');
      
      const tunisianHour = hourPart ? parseInt(hourPart.value, 10) : 0;
      const tunisianMinute = minutePart ? parseInt(minutePart.value, 10) : 0;
      const currentTime = timeFormatter.format(now);
      
      // Store is open from 9:00 AM to 1:00 AM (next day)
      // So: hour >= 9 OR hour < 1
      const isOpen = tunisianHour >= OPENING_HOUR || tunisianHour < CLOSING_HOUR;
      
      let hoursUntilOpen = 0;
      let minutesUntilOpen = 0;
      
      if (!isOpen) {
        // Calculate time until 9 AM
        const currentMinutes = tunisianHour * 60 + tunisianMinute;
        const openingMinutes = OPENING_HOUR * 60;
        const totalMinutesUntil = openingMinutes - currentMinutes;
        
        hoursUntilOpen = Math.floor(totalMinutesUntil / 60);
        minutesUntilOpen = totalMinutesUntil % 60;
      }
      
      return {
        isOpen,
        hoursUntilOpen,
        minutesUntilOpen,
        currentTime,
        currentHour: tunisianHour,
      };
    } catch (error) {
      logger.error("Error calculating Tunisian time:", error);
      // Fallback to current time
      const now = new Date();
      return {
        isOpen: now.getHours() >= OPENING_HOUR,
        hoursUntilOpen: 0,
        minutesUntilOpen: 0,
        currentTime: now.toLocaleTimeString(),
        currentHour: now.getHours(),
      };
    }
  };

export const useTunisianTime = (): TimeStatus => {
  const [status, setStatus] = useState<TimeStatus>(() => {
    return calculateStatus();
  });

  useEffect(() => {
    const updateStatus = () => {
      setStatus(calculateStatus());
    };

    // Initial check
    updateStatus();

    // Listen for test time changes (dev mode only)
    let handleTestTimeChange: (() => void) | null = null;
    if (isDev) {
      handleTestTimeChange = () => updateStatus();
      window.__TEST_TIME_CHANGE__ = handleTestTimeChange;
      window.addEventListener('testTimeChange', handleTestTimeChange);
    }

    // Update every minute (only if not using test time in dev mode)
    // Use longer interval to reduce re-renders - only update when status might change
    const interval = (isDev && window.__TEST_TUNISIAN_TIME__) 
      ? null 
      : setInterval(updateStatus, 60000);
    
    return () => {
      if (interval) clearInterval(interval);
      if (isDev && handleTestTimeChange) {
        window.removeEventListener('testTimeChange', handleTestTimeChange);
        delete window.__TEST_TIME_CHANGE__;
      }
    };
  }, []); // Empty deps - calculateStatus doesn't depend on any props/state

  return status;
};

