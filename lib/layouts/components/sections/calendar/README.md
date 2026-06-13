# Calendar Component

A self-contained calendar component that displays Google Calendar events in a modern monthly grid view with navigation and detailed event viewing.

## Overview

The calendar component provides a complete solution for displaying public Google Calendar events on your website. It handles data fetching, transformation, rendering, and user interaction entirely within the component, requiring no external plugins or build-time processing.

## Features

- **Google Calendar Integration**: Fetches events from public Google Calendars using the Google Calendar API
- **Multi-Calendar Support**: Display events from multiple calendars with individual categorization and styling
- **Interactive UI**: Monthly grid view with previous/next navigation and event details panel
- **Performance Optimized**: Initial three-month data window with on-demand loading for additional months
- **Event Categorization**: Color-coded events based on calendar category (holiday, personal, work, default)
- **Event Types**: Visual distinction between all-day and timed events
- **Responsive Design**: Container query-based responsive layout that switches between grid and list views based on available width (< 768px shows list view)
- **Complete Calendar Grid**: Displays empty placeholder cells from adjacent months to maintain proper week alignment
- **Accessibility**: Proper ARIA attributes and keyboard navigation support

## Architecture

This component uses a hybrid approach:

1. **Build Time**: Component configuration is embedded in the page via data attributes
2. **Client Side**: JavaScript fetches calendar data, transforms it, and renders the calendar

### Module Structure

```
calendar/
├── manifest.json                    # Component configuration
├── calendar.njk                     # Nunjucks template
├── calendar.css                     # Component styles
├── calendar.js                      # Main client-side controller
├── calendar.yml                     # Example frontmatter
├── README.md                        # This file
└── modules/
    ├── providers/
    │   └── google-calendar.js       # Google Calendar API integration
    └── helpers/
        ├── date-utils.js            # Date manipulation utilities
        └── event-transformer.js     # Data transformation logic
```

## Configuration

### Google Calendar API Key

You need a Google Calendar API key to use this component:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API
4. Create credentials (API key)
5. Restrict the key to Google Calendar API only

### Method 1: Inline Configuration (Recommended)

Define the calendar configuration directly in your page YAML:

```yaml
sections:
  - sectionType: calendar
    calendars:
      apiKey: 'YOUR_GOOGLE_CALENDAR_API_KEY'
      calendars:
        - id: 'en.usa#holiday@group.v.calendar.google.com'
          name: 'US Holidays'
          category: 'holiday'
        - id: 'your-calendar@gmail.com'
          name: 'Personal Events'
          category: 'personal'
    text:
      title: 'Event Calendar'
      prose: 'View upcoming events and important dates'
```

**Calendar Properties:**
- `id` (required): Google Calendar ID
- `name` (optional): Display name for the calendar
- `category` (optional): Category for styling (default, holiday, personal, work)

### Method 2: External Data File (Optional)

For reusable configurations across multiple pages, create a JSON file in `lib/data/calendars/`:

```json
{
  "apiKey": "YOUR_GOOGLE_CALENDAR_API_KEY",
  "calendars": [
    {
      "id": "en.usa#holiday@group.v.calendar.google.com",
      "name": "US Holidays",
      "category": "holiday"
    },
    {
      "id": "your-calendar@gmail.com",
      "name": "Personal Events",
      "category": "personal"
    }
  ]
}
```

Then reference it in your page:

```yaml
sections:
  - sectionType: calendar
    calendars:
      source: 'example'  # References lib/data/calendars/example.json
    text:
      title: 'Event Calendar'
```

## Usage Examples

### Single Calendar (Inline)

```yaml
- sectionType: calendar
  calendars:
    apiKey: 'YOUR_API_KEY'
    calendars:
      - id: 'en.usa#holiday@group.v.calendar.google.com'
        name: 'US Holidays'
        category: 'holiday'
  text:
    title: 'Holiday Calendar'
```

### Multiple Calendars (Inline)

```yaml
- sectionType: calendar
  calendars:
    apiKey: 'YOUR_API_KEY'
    calendars:
      - id: 'en.usa#holiday@group.v.calendar.google.com'
        name: 'US Holidays'
        category: 'holiday'
      - id: 'work-calendar@company.com'
        name: 'Team Events'
        category: 'work'
      - id: 'personal@gmail.com'
        name: 'Personal'
        category: 'personal'
  text:
    title: 'All Events'
```

### Using External Data File

```yaml
- sectionType: calendar
  calendars:
    source: 'holidays'  # References lib/data/calendars/holidays.json
```

### Finding Calendar IDs

**For Public Calendars:**
1. Open Google Calendar
2. Click three dots next to calendar name
3. Select "Settings and sharing"
4. Scroll to "Integrate calendar"
5. Copy the Calendar ID

**Common Public Calendars:**
- US Holidays: `en.usa#holiday@group.v.calendar.google.com`
- UK Holidays: `en.uk#holiday@group.v.calendar.google.com`
- Canada Holidays: `en.canadian#holiday@group.v.calendar.google.com`

## Event Categories and Styling

The component includes four built-in category styles:

- **default**: Blue theme (CSS variable: `--calendar-event-default`)
- **holiday**: Red theme (CSS variable: `--calendar-event-holiday`)
- **personal**: Green theme (CSS variable: `--calendar-event-personal`)
- **work**: Indigo theme

Custom categories can be added by extending the CSS:

```css
.calendar .event--custom {
  background: #your-light-color;
  color: #your-dark-color;
  border-left: 3px solid #your-accent-color;
}
```

## Data Flow

### Initial Load (Three-Month Window)

1. Component reads configuration from `data-calendar-config` attribute
2. Fetches previous month, current month, and next month events
3. Transforms events into hierarchical structure (months → days → events)
4. Caches data client-side
5. Renders current month

### Month Navigation

1. User clicks previous/next button
2. Component checks if month data is already cached
3. If not cached, fetches that month from Google Calendar API
4. Transforms and caches the new data
5. Renders the requested month

### Event Details

1. User clicks an event in the calendar
2. Event details panel slides in from right
3. Displays full event information
4. Provides link to view in Google Calendar

## Data Structure

### Calendar Grid Layout

The calendar automatically fills the grid with empty placeholder cells to maintain proper week alignment:

- **Leading cells**: Empty cells from the previous month (e.g., if month starts on Wednesday, 3 empty cells are added for Sun-Tue)
- **Month days**: All days in the current month (28-31 days)
- **Trailing cells**: Empty cells from the next month to complete the last week
- **Complete weeks**: The grid always shows complete weeks (total cells divisible by 7)

These placeholder cells have the `day--other-month` class with a light gray background and are not interactive.

### Transformed Calendar Data

```javascript
{
  months: [
    {
      key: "2024-01",
      monthName: "January",
      year: 2024,
      month: 0,
      days: [
        {
          date: "2024-01-01",
          dateObj: Date,
          dayName: "Monday",
          shortDayName: "Mon",
          dayNumber: 1,
          allDayEvents: [...],
          timedEvents: [...]
        }
      ]
    }
  ]
}
```

### Event Object

```javascript
{
  id: "event-id",
  summary: "Event Title",
  description: "Event description",
  location: "Event location",
  calendarName: "Calendar Name",
  calendarCategory: "holiday",
  htmlLink: "https://calendar.google.com/...",
  isAllDay: true,
  startDate: "2024-01-01",
  endDate: "2024-01-02",
  // OR for timed events:
  startDateTime: "2024-01-01T14:00:00Z",
  endDateTime: "2024-01-01T15:00:00Z",
  startTime: "2:00 PM",
  endTime: "3:00 PM"
}
```

## Responsive Behavior

The calendar uses CSS Container Queries to provide responsive layouts based on the component's available width, not the viewport size. This makes it work correctly in sidebars, columns, or any layout context.

### Grid View (Default)
- Displays when calendar container is **768px or wider**
- Traditional monthly grid with 7 columns (Sun-Sat)
- Shows up to 3 events per day with "+X more" indicator
- Empty placeholder cells from adjacent months maintain proper week alignment

### List View (Narrow Containers)
- Displays when calendar container is **less than 768px**
- Vertical list of days with events
- Shows full event details for each day
- Only displays days that have events
- Better for mobile devices and narrow sidebars

The switch between views happens automatically based on the container width, with no JavaScript required for the layout change.

## Customization

### CSS Variables

Override these CSS custom properties to customize appearance:

```css
.calendar {
  --calendar-bg: #ffffff;
  --calendar-border: #e5e7eb;
  --calendar-text: #1f2937;
  --calendar-text-muted: #6b7280;
  --calendar-primary: #3b82f6;
  --calendar-hover: #f3f4f6;
  --calendar-today: #fbbf24;
  --calendar-event-default: #3b82f6;
  --calendar-event-holiday: #ef4444;
  --calendar-event-personal: #10b981;
  --calendar-spacing: 1rem;
}
```

### Display Limits

The component shows up to 3 events per day in the grid view. Additional events are indicated with a "+X more" indicator. All events are accessible via the day's events when clicked.

## Dependencies

### Required Partials
- `text`: For optional header title and prose
- `commons`: Base container and styling

### Browser Requirements
- ES6 module support
- Fetch API
- Modern CSS Grid support
- CSS Container Queries support (for responsive layout)
- JavaScript enabled

**Browser Compatibility:**
- Chrome/Edge 105+
- Safari 16+
- Firefox 110+

## Performance Considerations

- **API Quota**: Google Calendar API has daily quotas (check your project limits)
- **Caching**: Events are cached client-side to minimize API calls
- **Initial Load**: Fetches 3 months of data (typically 1-3 API calls depending on number of calendars)
- **Navigation**: Loads additional months on-demand
- **Rate Limiting**: Consider implementing request throttling for high-traffic sites

## Error Handling

The component gracefully handles various error scenarios:

- **Missing API Key**: Shows user-friendly error message
- **Invalid Configuration**: Logs error and displays error state
- **Network Failures**: Shows "temporarily unavailable" message
- **Empty Calendars**: Displays empty calendar grid
- **API Errors**: Logs to console, continues build

## Accessibility

- Semantic HTML structure
- ARIA labels for navigation controls
- Keyboard navigation support (Escape to close details panel)
- Focus management
- Screen reader friendly event information

## Testing

Run the component test suite:

```bash
npm test
```

Test the component in development:

```bash
npm start
```

Navigate to the calendar demo page to see it in action.

## License

This component is part of the Nunjucks Components library.
