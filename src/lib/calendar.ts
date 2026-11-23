/*
 * Calendar files: 1 event as an iCalendar document (RFC 5545), which every
 * calendar app imports. Times are floating rather than pinned to a zone, so a
 * window booked for 12:00 opens at 12:00 on the calendar of whoever is home.
 */

/** 1 event, as {@link calendarFile} writes it. */
export interface CalendarEvent {
  /** Stable for the same event, so importing it twice updates it rather than adding a second. */
  uid: string
  /** The day, as `YYYY-MM-DD`. */
  date: string
  /** Start and end as 24-hour `HH:mm`, in the place the event happens. */
  from: string
  to: string
  title: string
  location?: string
  description?: string
  url?: string
}

const encoder = new TextEncoder()

/** An `.ics` document holding 1 event, with the line endings and folding the format requires. */
export function calendarFile(event: CalendarEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Appica//Store//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escape(event.uid)}`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${floating(event.date, event.from)}`,
    `DTEND:${floating(event.date, event.to)}`,
    `SUMMARY:${escape(event.title)}`,
    ...(event.location ? [`LOCATION:${escape(event.location)}`] : []),
    ...(event.description ? [`DESCRIPTION:${escape(event.description)}`] : []),
    ...(event.url ? [`URL:${event.url}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return `${lines.map(fold).join('\r\n')}\r\n`
}

/** A moment in UTC, e.g. `20261013T090412Z`. */
function utc(at: Date): string {
  return at.toISOString().replace(/[-:]|\.\d{3}/g, '')
}

/** A day and a time as a floating timestamp, e.g. `20261016T120000`. */
function floating(date: string, time: string): string {
  return `${date.replaceAll('-', '')}T${time.replace(':', '')}00`
}

/** Text with the 4 characters the format reserves escaped. */
function escape(text: string): string {
  return text.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\r?\n/g, '\\n')
}

/** A line split every 75 octets, each continuation starting with a space. */
function fold(line: string): string {
  const parts: string[] = []
  let part = ''
  let octets = 0

  for (const char of line) {
    const size = encoder.encode(char).length
    // The space opening a continuation counts toward its 75.
    if (octets + size > (parts.length === 0 ? 75 : 74)) {
      parts.push(part)
      part = ''
      octets = 0
    }
    part += char
    octets += size
  }

  return [...parts, part].join('\r\n ')
}
