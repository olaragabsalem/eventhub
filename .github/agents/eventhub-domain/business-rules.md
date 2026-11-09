# EventHub Business Rules

## User journey

- Users register or sign in, browse events, select an event, and book tickets.
- Booking reduces available seats and generates a booking reference.
- The booking reference's first character matches the first letter of the event title.
- Users can view and cancel their bookings. The bookings page also supports clearing all bookings.
- Users can create events through the Admin UI or API.

## User sandbox isolation

- Users see only their own dynamic events and bookings.
- Seeded static events are shared.
- Accessing another user's booking returns 403 Forbidden ("Access Denied").
- Deleting a user cascades to that user's events and bookings.

## Event limits

- Each account can keep up to 6 user-created events; when full, the oldest is replaced.
- Static events do not count toward the limit and cannot be edited or deleted.
- The events list is paginated; verify the current page size in application code.

## Booking limits

- Each user can keep up to 9 bookings; when full, the oldest is replaced.
- Cancelling a booking frees its seats.
- "Clear All Bookings" removes all bookings for the current user.

## Sandbox notices

- Events and bookings pages may show a sandbox-limit banner depending on item counts.
- Verify current display thresholds and wording in the frontend before asserting them.

## Seat availability

- Static event availability is stored on the event.
- Dynamic event availability is calculated per user from total seats and that user's bookings.
- Booking confirmation reduces the user's available seat count.

## Booking references

- Format: `[FIRST_LETTER]-[6_RANDOM_ALPHANUMERIC]`.
- The first letter is the uppercase first letter of the event title.
- Reference uniqueness is enforced with collision retry.

## Refund eligibility

- Single-ticket bookings are eligible for a full refund.
- Multi-ticket bookings are not eligible; the UI explains that group bookings are non-refundable.
- The UI displays a short spinner before showing the result; verify its current duration in source.
- Refund eligibility is frontend-only.

## Price calculation

- `totalPrice = event.price × quantity`.
- The event price is per ticket.

Confirm domain details against the current application source when documentation and behavior differ.
