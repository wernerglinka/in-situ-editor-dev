/**
 * Calendar Component
 * Client-side calendar rendering with Google Calendar integration
 */

import { fetchGoogleCalendars, fetchCalendarMonth } from './modules/providers/google-calendar.js';
import { transformCalendarData, getMonthKey } from './modules/helpers/event-transformer.js';
import { getFirstDayOffset } from './modules/helpers/date-utils.js';

class Calendar {
  constructor(element) {
    this.element = element;
    this.currentDate = new Date();
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.currentDate.getMonth();
    this.displayYear = this.currentYear;
    this.displayMonth = this.currentMonth;
    this.calendarData = new Map(); // Cache for fetched calendar data
    this.config = null;

    this.init();
  }

  async init() {
    // Parse configuration from data attribute
    const configData = this.element.getAttribute('data-calendar-config');
    if (!configData) {
      this.showError('Calendar configuration is missing');
      return;
    }

    try {
      this.config = JSON.parse(configData);
    } catch (error) {
      this.showError('Invalid calendar configuration');
      console.error('Failed to parse calendar config:', error);
      return;
    }

    if (!this.config.apiKey) {
      this.showError('Google Calendar API key is required');
      return;
    }

    if (!this.config.calendars || this.config.calendars.length === 0) {
      this.showError('No calendars configured');
      return;
    }

    // Get DOM elements
    this.elements = {
      title: this.element.querySelector('[data-calendar-title]'),
      grid: this.element.querySelector('[data-calendar-grid]'),
      days: this.element.querySelector('[data-calendar-days]'),
      list: this.element.querySelector('[data-calendar-list]'),
      loading: this.element.querySelector('[data-calendar-loading]'),
      error: this.element.querySelector('[data-calendar-error]'),
      prevBtn: this.element.querySelector('[data-action="prev-month"]'),
      nextBtn: this.element.querySelector('[data-action="next-month"]'),
      todayBtn: this.element.querySelector('[data-action="today"]'),
      eventDetails: this.element.querySelector('[data-event-details]'),
      closeDetailsBtn: this.element.querySelector('[data-action="close-details"]')
    };

    // Bind event listeners
    this.bindEvents();

    // Fetch initial three-month window
    await this.fetchInitialData();
  }

  bindEvents() {
    this.elements.prevBtn?.addEventListener('click', () => this.navigateMonth(-1));
    this.elements.nextBtn?.addEventListener('click', () => this.navigateMonth(1));
    this.elements.todayBtn?.addEventListener('click', () => this.goToToday());
    this.elements.closeDetailsBtn?.addEventListener('click', () => this.closeEventDetails());

    // Close details panel on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.elements.eventDetails.classList.contains('is-open')) {
        this.closeEventDetails();
      }
    });
  }

  goToToday() {
    const today = new Date();
    this.displayYear = today.getFullYear();
    this.displayMonth = today.getMonth();
    this.renderMonth();
  }

  async fetchInitialData() {
    this.showLoading();

    try {
      // Fetch three-month window centered on current month
      const results = await fetchGoogleCalendars(
        this.config.calendars,
        this.config.apiKey,
        new Date(this.currentYear, this.currentMonth, 15)
      );

      // Transform and cache the data
      const months = transformCalendarData(results);

      months.forEach((month) => {
        const key = getMonthKey(month.year, month.month);
        this.calendarData.set(key, month);
      });

      // Render current month
      this.renderMonth();
      this.hideLoading();
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
      this.showError('Failed to load calendar events');
    }
  }

  async navigateMonth(delta) {
    this.displayMonth += delta;

    if (this.displayMonth > 11) {
      this.displayMonth = 0;
      this.displayYear += 1;
    } else if (this.displayMonth < 0) {
      this.displayMonth = 11;
      this.displayYear -= 1;
    }

    const monthKey = getMonthKey(this.displayYear, this.displayMonth);

    // Check if we already have this month's data
    if (!this.calendarData.has(monthKey)) {
      await this.fetchMonth(this.displayYear, this.displayMonth);
    }

    this.renderMonth();
  }

  async fetchMonth(year, month) {
    this.showLoading();

    try {
      const results = await Promise.all(
        this.config.calendars.map((calendar) =>
          fetchCalendarMonth(calendar, this.config.apiKey, year, month)
        )
      );

      // Transform returns a three-month window, cache all months
      const months = transformCalendarData(results);

      months.forEach((monthData) => {
        const key = getMonthKey(monthData.year, monthData.month);
        this.calendarData.set(key, monthData);
      });

      this.hideLoading();
    } catch (error) {
      console.error('Failed to fetch month data:', error);
      this.showError('Failed to load calendar events');
    }
  }

  renderMonth() {
    const monthKey = getMonthKey(this.displayYear, this.displayMonth);
    const monthData = this.calendarData.get(monthKey);

    // Update title
    if (monthData) {
      this.elements.title.textContent = `${monthData.monthName} ${monthData.year}`;
    } else {
      const date = new Date(this.displayYear, this.displayMonth, 1);
      const monthName = date.toLocaleString('en-US', { month: 'long' });
      this.elements.title.textContent = `${monthName} ${this.displayYear}`;
    }

    // Clear existing views
    this.elements.days.innerHTML = '';
    this.elements.list.innerHTML = '';

    // Render Grid View
    this.renderGridView(monthData);

    // Render List View
    this.renderListView(monthData);
  }

  renderGridView(monthData) {
    // Get first day offset for calendar grid
    const firstDayOffset = getFirstDayOffset(this.displayYear, this.displayMonth);

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOffset; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'day day--other-month';
      this.elements.days.appendChild(emptyDay);
    }

    // Render days with events
    let daysInMonth;
    if (monthData) {
      monthData.days.forEach((day) => {
        const dayElement = this.createDayElement(day);
        this.elements.days.appendChild(dayElement);
      });
      daysInMonth = monthData.days.length;
    } else {
      // Render empty days if no data
      daysInMonth = new Date(this.displayYear, this.displayMonth + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const day = {
          dateObj: new Date(this.displayYear, this.displayMonth, i),
          dayNumber: i,
          allDayEvents: [],
          timedEvents: []
        };
        const dayElement = this.createDayElement(day);
        this.elements.days.appendChild(dayElement);
      }
    }

    // Add empty cells for days after month ends to fill the grid
    // Calculate how many cells are needed to complete the last week
    const totalCellsUsed = firstDayOffset + daysInMonth;
    const remainingCells = totalCellsUsed % 7 === 0 ? 0 : 7 - (totalCellsUsed % 7);

    for (let i = 0; i < remainingCells; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'day day--other-month';
      this.elements.days.appendChild(emptyDay);
    }
  }

  renderListView(monthData) {
    if (!monthData) {
      this.elements.list.innerHTML = '<p class="calendar__list-no-events">No events this month</p>';
      return;
    }

    // Only render days that have events
    const daysWithEvents = monthData.days.filter(
      (day) => day.allDayEvents.length > 0 || day.timedEvents.length > 0
    );

    if (daysWithEvents.length === 0) {
      this.elements.list.innerHTML = '<p class="calendar__list-no-events">No events this month</p>';
      return;
    }

    daysWithEvents.forEach((day) => {
      const dayContainer = document.createElement('div');
      dayContainer.className = 'list-day';

      // Day header
      const header = document.createElement('div');
      header.className = 'list-day-header';

      const dayNumber = document.createElement('div');
      dayNumber.className = 'list-day-number';
      dayNumber.textContent = day.dayNumber;

      const dayInfo = document.createElement('div');
      dayInfo.className = 'list-day-info';

      const dayName = document.createElement('div');
      dayName.className = 'list-day-name';
      dayName.textContent = day.dayName;

      const dayDate = document.createElement('div');
      dayDate.className = 'list-day-date';
      const dateObj = day.dateObj;
      dayDate.textContent = dateObj.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      dayInfo.appendChild(dayName);
      dayInfo.appendChild(dayDate);
      header.appendChild(dayNumber);
      header.appendChild(dayInfo);
      dayContainer.appendChild(header);

      // Events container
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'list-events';

      // All-day events first
      day.allDayEvents.forEach((event) => {
        const eventElement = this.createListEventElement(event);
        eventsContainer.appendChild(eventElement);
      });

      // Timed events
      day.timedEvents.forEach((event) => {
        const eventElement = this.createListEventElement(event);
        eventsContainer.appendChild(eventElement);
      });

      dayContainer.appendChild(eventsContainer);
      this.elements.list.appendChild(dayContainer);
    });
  }

  createListEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.className = `list-event list-event--${event.calendarCategory || 'default'}`;

    const title = document.createElement('div');
    title.className = 'list-event-title';
    title.textContent = event.summary;

    const time = document.createElement('div');
    time.className = 'list-event-time';
    if (event.isAllDay) {
      time.textContent = 'All day';
    } else {
      time.textContent = `${event.startTime} - ${event.endTime}`;
    }

    const calendar = document.createElement('div');
    calendar.className = 'list-event-calendar';
    calendar.textContent = event.calendarName || '';

    eventElement.appendChild(title);
    eventElement.appendChild(time);
    if (event.calendarName) {
      eventElement.appendChild(calendar);
    }

    // Click handler to show details
    eventElement.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showEventDetails(event);
    });

    return eventElement;
  }

  createDayElement(day) {
    const dayElement = document.createElement('div');
    dayElement.className = 'day';

    // Check if today
    const today = new Date();
    if (
      day.dateObj.getFullYear() === today.getFullYear() &&
      day.dateObj.getMonth() === today.getMonth() &&
      day.dateObj.getDate() === today.getDate()
    ) {
      dayElement.classList.add('day--today');
    }

    // Add has-events class if there are events
    const hasEvents = day.allDayEvents.length > 0 || day.timedEvents.length > 0;
    if (hasEvents) {
      dayElement.classList.add('day--has-events');
    }

    // Day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day.dayNumber;
    dayElement.appendChild(dayNumber);

    // Events container
    if (hasEvents) {
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'day-events';

      // Render all-day events first
      day.allDayEvents.slice(0, 3).forEach((event) => {
        const eventElement = this.createEventElement(event, true);
        eventsContainer.appendChild(eventElement);
      });

      // Render timed events
      const remainingSlots = 3 - day.allDayEvents.length;
      day.timedEvents.slice(0, remainingSlots).forEach((event) => {
        const eventElement = this.createEventElement(event, false);
        eventsContainer.appendChild(eventElement);
      });

      // Show "+X more" if there are more events
      const totalEvents = day.allDayEvents.length + day.timedEvents.length;
      if (totalEvents > 3) {
        const moreElement = document.createElement('div');
        moreElement.className = 'event event--more';
        moreElement.textContent = `+${totalEvents - 3} more`;
        eventsContainer.appendChild(moreElement);
      }

      dayElement.appendChild(eventsContainer);
    }

    return dayElement;
  }

  createEventElement(event, isAllDay) {
    const eventElement = document.createElement('div');
    eventElement.className = `event event--${event.calendarCategory || 'default'}`;

    if (isAllDay) {
      eventElement.classList.add('event--all-day');
    } else {
      eventElement.classList.add('event--timed');
    }

    // Event content
    const eventContent = document.createElement('span');
    if (!isAllDay && event.startTime) {
      eventContent.innerHTML = `<span class="event-time">${event.startTime}</span>${event.summary}`;
    } else {
      eventContent.textContent = event.summary;
    }

    eventElement.appendChild(eventContent);

    // Click handler to show details
    eventElement.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showEventDetails(event);
    });

    return eventElement;
  }

  showEventDetails(event) {
    const elements = {
      title: this.element.querySelector('[data-event-title]'),
      time: this.element.querySelector('[data-event-time]'),
      location: this.element.querySelector('[data-event-location]'),
      description: this.element.querySelector('[data-event-description]'),
      calendar: this.element.querySelector('[data-event-calendar]'),
      link: this.element.querySelector('[data-event-link]')
    };

    // Populate event details
    elements.title.textContent = event.summary;

    if (event.isAllDay) {
      elements.time.textContent = 'All day';
    } else {
      elements.time.textContent = `${event.startTime} - ${event.endTime}`;
    }

    elements.location.textContent = event.location || '';
    elements.location.style.display = event.location ? 'block' : 'none';

    elements.description.textContent = event.description || '';
    elements.description.style.display = event.description ? 'block' : 'none';

    elements.calendar.textContent = event.calendarName ? `Calendar: ${event.calendarName}` : '';
    elements.calendar.style.display = event.calendarName ? 'block' : 'none';

    if (event.htmlLink) {
      elements.link.href = event.htmlLink;
      elements.link.style.display = 'inline-block';
    } else {
      elements.link.style.display = 'none';
    }

    // Show the details panel
    this.elements.eventDetails.style.display = 'block';
    setTimeout(() => {
      this.elements.eventDetails.classList.add('is-open');
    }, 10);
  }

  closeEventDetails() {
    this.elements.eventDetails.classList.remove('is-open');
    setTimeout(() => {
      this.elements.eventDetails.style.display = 'none';
    }, 300);
  }

  showLoading() {
    this.elements.loading.style.display = 'block';
    this.elements.grid.style.opacity = '0.5';
  }

  hideLoading() {
    this.elements.loading.style.display = 'none';
    this.elements.grid.style.opacity = '1';
  }

  showError(message) {
    this.elements.error.textContent = message;
    this.elements.error.style.display = 'block';
    this.elements.loading.style.display = 'none';
    this.elements.grid.style.display = 'none';
  }
}

/**
 * Initialize all calendar components
 */
function initCalendars() {
  const calendarElements = document.querySelectorAll('[data-component="calendar"]');
  calendarElements.forEach((element) => {
    // Skip if already initialized
    if (element.dataset.initialized) {return;}
    element.dataset.initialized = 'true';

    new Calendar(element);
  });
}

// Register with page transitions for SWUP support
if (window.PageTransitions) {
  window.PageTransitions.registerComponent('calendar', initCalendars);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalendars);
} else {
  initCalendars();
}
