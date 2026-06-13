/**
 * Date utility functions for calendar component
 */

/**
 * Get the start and end dates for a three-month window
 * @param {Date} centerDate - The center date (defaults to current month)
 * @returns {Object} Object with startDate and endDate
 */
export function getThreeMonthWindow(centerDate = new Date()) {
  const year = centerDate.getFullYear();
  const month = centerDate.getMonth();

  // Previous month
  const startDate = new Date(year, month - 1, 1);

  // Next month (last day)
  const endDate = new Date(year, month + 2, 0, 23, 59, 59, 999);

  return { startDate, endDate };
}

/**
 * Format date to ISO string for API calls
 * @param {Date} date - Date to format
 * @returns {string} ISO formatted date string
 */
export function toISOString(date) {
  return date.toISOString();
}

/**
 * Get month name from date
 * @param {Date} date - Date object
 * @returns {string} Month name (e.g., "January")
 */
export function getMonthName(date) {
  return date.toLocaleString('en-US', { month: 'long' });
}

/**
 * Get day of week name
 * @param {Date} date - Date object
 * @returns {string} Day name (e.g., "Monday")
 */
export function getDayName(date) {
  return date.toLocaleString('en-US', { weekday: 'long' });
}

/**
 * Get short day of week name
 * @param {Date} date - Date object
 * @returns {string} Short day name (e.g., "Mon")
 */
export function getShortDayName(date) {
  return date.toLocaleString('en-US', { weekday: 'short' });
}

/**
 * Format date as YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string to Date object
 * @param {string} dateString - ISO date string
 * @returns {Date} Date object
 */
export function parseISODate(dateString) {
  return new Date(dateString);
}

/**
 * Check if two dates are on the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if event is all-day
 * @param {Object} event - Calendar event object
 * @returns {boolean} True if all-day event
 */
export function isAllDayEvent(event) {
  // Google Calendar all-day events have 'date' instead of 'dateTime'
  return !!event.start.date && !event.start.dateTime;
}

/**
 * Format time from date object
 * @param {Date} date - Date object
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
export function formatTime(date) {
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get array of days in a month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Array<Date>} Array of Date objects for each day
 */
export function getDaysInMonth(year, month) {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

/**
 * Get the first day of week offset for a month (0 = Sunday)
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Day of week for first day of month
 */
export function getFirstDayOffset(year, month) {
  return new Date(year, month, 1).getDay();
}
