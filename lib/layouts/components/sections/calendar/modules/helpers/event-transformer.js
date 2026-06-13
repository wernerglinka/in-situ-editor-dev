/**
 * Transform raw calendar events into structured month/day/event hierarchy
 */

import {
  formatDateKey,
  parseISODate,
  isAllDayEvent,
  getMonthName,
  getDayName,
  getShortDayName,
  formatTime,
  getDaysInMonth
} from './date-utils.js';

/**
 * Transform calendar events into hierarchical structure
 * @param {Array} calendarResults - Array of calendar fetch results
 * @returns {Array} Array of month objects with days and events
 */
export function transformCalendarData(calendarResults) {
  // Flatten all events from all calendars and add calendar metadata
  const allEvents = [];
  calendarResults.forEach((result) => {
    if (result.success && result.events) {
      result.events.forEach((event) => {
        allEvents.push({
          ...event,
          calendarName: result.calendarName,
          calendarCategory: result.calendarCategory
        });
      });
    }
  });

  // Group events by month
  const monthsMap = new Map();

  allEvents.forEach((event) => {
    const startDate = isAllDayEvent(event)
      ? parseISODate(event.start.date)
      : parseISODate(event.start.dateTime);

    const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    const dateKey = formatDateKey(startDate);

    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, {
        key: monthKey,
        monthName: getMonthName(startDate),
        year: startDate.getFullYear(),
        month: startDate.getMonth(),
        days: new Map()
      });
    }

    const month = monthsMap.get(monthKey);

    if (!month.days.has(dateKey)) {
      month.days.set(dateKey, {
        date: dateKey,
        dateObj: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
        dayName: getDayName(startDate),
        shortDayName: getShortDayName(startDate),
        dayNumber: startDate.getDate(),
        allDayEvents: [],
        timedEvents: []
      });
    }

    const day = month.days.get(dateKey);

    if (isAllDayEvent(event)) {
      day.allDayEvents.push(formatEvent(event, true));
    } else {
      day.timedEvents.push(formatEvent(event, false));
    }
  });

  // Convert maps to arrays and sort
  const months = Array.from(monthsMap.values()).map((month) => {
    // Get all days in the month, not just days with events
    const allDays = getDaysInMonth(month.year, month.month);
    const daysArray = allDays.map((dateObj) => {
      const dateKey = formatDateKey(dateObj);
      if (month.days.has(dateKey)) {
        return month.days.get(dateKey);
      } 
        return {
          date: dateKey,
          dateObj: dateObj,
          dayName: getDayName(dateObj),
          shortDayName: getShortDayName(dateObj),
          dayNumber: dateObj.getDate(),
          allDayEvents: [],
          timedEvents: []
        };
      
    });

    return {
      key: month.key,
      monthName: month.monthName,
      year: month.year,
      month: month.month,
      days: daysArray
    };
  });

  // Sort months chronologically
  months.sort((a, b) => {
    if (a.year !== b.year) {return a.year - b.year;}
    return a.month - b.month;
  });

  return months;
}

/**
 * Format individual event for display
 * @param {Object} event - Raw event object
 * @param {boolean} isAllDay - Whether event is all-day
 * @returns {Object} Formatted event object
 */
function formatEvent(event, isAllDay) {
  const formatted = {
    id: event.id,
    summary: event.summary || 'Untitled Event',
    description: event.description || '',
    location: event.location || '',
    calendarName: event.calendarName || '',
    calendarCategory: event.calendarCategory || '',
    htmlLink: event.htmlLink || '',
    isAllDay
  };

  if (isAllDay) {
    formatted.startDate = event.start.date;
    formatted.endDate = event.end.date;
  } else {
    const startDate = parseISODate(event.start.dateTime);
    const endDate = parseISODate(event.end.dateTime);

    formatted.startDateTime = event.start.dateTime;
    formatted.endDateTime = event.end.dateTime;
    formatted.startTime = formatTime(startDate);
    formatted.endTime = formatTime(endDate);
  }

  return formatted;
}

/**
 * Get month key for navigation
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {string} Month key (YYYY-MM)
 */
export function getMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}
