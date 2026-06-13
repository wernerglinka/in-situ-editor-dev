/**
 * Google Calendar API provider
 * Fetches events from public Google Calendars
 */

import { getThreeMonthWindow, toISOString } from '../helpers/date-utils.js';

/**
 * Fetch events from a single Google Calendar
 * @param {Object} calendar - Calendar configuration object
 * @param {string} calendar.id - Google Calendar ID
 * @param {string} calendar.name - Display name for the calendar
 * @param {string} calendar.category - Category for styling/filtering
 * @param {string} apiKey - Google Calendar API key
 * @param {Date} centerDate - Center date for three-month window
 * @returns {Promise<Object>} Calendar fetch result
 */
export async function fetchGoogleCalendar(calendar, apiKey, centerDate = new Date()) {
  const { id, name = 'Calendar', category = 'default' } = calendar;

  try {
    const { startDate, endDate } = getThreeMonthWindow(centerDate);

    const params = new URLSearchParams({
      key: apiKey,
      timeMin: toISOString(startDate),
      timeMax: toISOString(endDate),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '2500'
    });

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(id)}/events?${params}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      calendarId: id,
      calendarName: name,
      calendarCategory: category,
      events: data.items || []
    };
  } catch (error) {
    console.error(`Failed to fetch calendar ${id}:`, error.message);

    return {
      success: false,
      calendarId: id,
      calendarName: name,
      calendarCategory: category,
      error: error.message,
      events: []
    };
  }
}

/**
 * Fetch events from multiple Google Calendars concurrently
 * @param {Array<Object>} calendars - Array of calendar configuration objects
 * @param {string} apiKey - Google Calendar API key
 * @param {Date} centerDate - Center date for three-month window
 * @returns {Promise<Array>} Array of calendar fetch results
 */
export async function fetchGoogleCalendars(calendars, apiKey, centerDate = new Date()) {
  if (!calendars || calendars.length === 0) {
    console.warn('No calendars configured');
    return [];
  }

  if (!apiKey) {
    console.error('Google Calendar API key is required');
    return calendars.map((cal) => ({
      success: false,
      calendarId: cal.id,
      calendarName: cal.name || 'Calendar',
      calendarCategory: cal.category || 'default',
      error: 'Missing API key',
      events: []
    }));
  }

  // Fetch all calendars concurrently
  const fetchPromises = calendars.map((calendar) =>
    fetchGoogleCalendar(calendar, apiKey, centerDate)
  );

  return await Promise.all(fetchPromises);
}

/**
 * Fetch events for a specific month (for dynamic loading)
 * Uses a three-month window to ensure recurring events are captured
 * @param {Object} calendar - Calendar configuration object
 * @param {string} apiKey - Google Calendar API key
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Promise<Object>} Calendar fetch result for the specified month
 */
export async function fetchCalendarMonth(calendar, apiKey, year, month) {
  const { id, name = 'Calendar', category = 'default' } = calendar;

  try {
    // Fetch a three-month window to capture recurring events
    // that originated outside the target month
    const centerDate = new Date(year, month, 15);
    const { startDate, endDate } = getThreeMonthWindow(centerDate);

    const params = new URLSearchParams({
      key: apiKey,
      timeMin: toISOString(startDate),
      timeMax: toISOString(endDate),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '2500'
    });

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(id)}/events?${params}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      calendarId: id,
      calendarName: name,
      calendarCategory: category,
      events: data.items || []
    };
  } catch (error) {
    console.error(`Failed to fetch calendar ${id} for ${year}-${month}:`, error.message);

    return {
      success: false,
      calendarId: id,
      calendarName: name,
      calendarCategory: category,
      error: error.message,
      events: []
    };
  }
}
