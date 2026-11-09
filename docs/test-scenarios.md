# EventHub — Booking Feature Test Scenarios

Generated: 2026-03-06
Scope: Booking creation (Flow 3) and management (Flow 4 — View, Cancel, Clear, Refund Eligibility)

---

## Happy Path

### TC-001: View bookings list with existing bookings
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in; user has at least one confirmed booking
**Steps**:
1. Navigate to `/bookings`
2. Observe the list of booking cards rendered
**Expected Results**: Each booking card displays booking reference, event name, quantity, total price, and "View Details" link
**Business Rule**: Flow 4 — Manage Bookings
**Suggested Layer**: E2E

---

### TC-002: View single booking detail page
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in; user has at least one confirmed booking
**Steps**:
1. Navigate to `/bookings`
2. Click "View Details" on any booking card
3. Observe the booking detail page at `/bookings/:id`
**Expected Results**: Page shows event details (title, date, venue, city, category), customer details (name, email, phone), payment summary (quantity, price per ticket, total paid), booking reference in breadcrumb and header, booking ID, and "Check eligibility for refund?" link
**Business Rule**: Booking model fields; Flow 4
**Suggested Layer**: E2E

---

### TC-003: Cancel a single booking from the detail page
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in; user has at least one confirmed booking
**Steps**:
1. Navigate to `/bookings/:id`
2. Click "Cancel Booking" button
3. Confirm in the dialog by clicking "Yes, cancel it"
4. Observe redirect and bookings list
**Expected Results**: Success toast "Booking cancelled successfully" appears; user is redirected to `/bookings`; cancelled booking no longer appears in the list
**Business Rule**: Booking cancellation deletes the record; seats released for dynamic events
**Suggested Layer**: E2E

---

### TC-004: Clear all bookings from the bookings list page
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in; user has at least one booking
**Steps**:
1. Navigate to `/bookings`
2. Click "Clear all bookings" link
3. Confirm the browser confirm dialog
4. Observe the page after clearing
**Expected Results**: All bookings are removed; page shows empty state "No bookings yet" with "Browse Events" button
**Business Rule**: `DELETE /api/bookings` clears all user bookings; `clearAllBookings` service method
**Suggested Layer**: E2E

---

### TC-005: Navigate back to bookings list from detail page
**Category**: Happy Path
**Priority**: P2
**Preconditions**: User is on a booking detail page
**Steps**:
1. Click "← Back to My Bookings" button at bottom of detail page
**Expected Results**: User is navigated to `/bookings`
**Business Rule**: UI navigation flow
**Suggested Layer**: E2E

---

### TC-006: Navigate to bookings via "View My Bookings" after completing a booking
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User just completed a booking (confirmation card shown)
**Steps**:
1. After booking confirmation, click "View My Bookings" link
2. Observe the bookings page
**Expected Results**: User lands on `/bookings` and the newly created booking appears in the list
**Business Rule**: Flow 3 → Flow 4 navigation
**Suggested Layer**: E2E

---

### TC-007: Lookup booking by reference via API
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User is authenticated; user has a booking with known `bookingRef`
**Steps**:
1. Send `GET /api/bookings/ref/:ref` with valid JWT and own booking ref
**Expected Results**: 200 response with full booking data including nested event
**Business Rule**: `GET /api/bookings/ref/:ref` endpoint
**Suggested Layer**: API

---

### TC-008: Complete a booking from the event detail page
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in; an upcoming event has at least one available seat
**Steps**:
1. Navigate to `/events` and select an event with a visible "Book Now" button
2. Enter a valid full name, email, and phone number; leave quantity at 1
3. Click "Confirm Booking"
**Expected Results**: A confirmation card appears with a booking reference, customer name, ticket quantity, and total; "View My Bookings" and "Browse More Events" links are available
**Business Rule**: Flow 3 — Book an Event; successful creation returns a confirmed booking
**Suggested Layer**: E2E

---

### TC-009: View the newly created booking from the confirmation card
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User has just completed a booking and the confirmation card is visible
**Steps**:
1. Click "View My Bookings"
2. Find the new booking using the reference shown on the confirmation card
3. Open "View Details"
**Expected Results**: The booking appears in the user's list and its detail page shows the same reference, event, customer, ticket quantity, and total
**Business Rule**: Flow 3 → Flow 4; users can view and manage their own bookings
**Suggested Layer**: E2E

---

### TC-010: Create a booking through the authenticated API
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User has a valid JWT; event exists and has enough seats
**Steps**:
1. Send `POST /api/bookings` with `eventId`, valid customer details, and a valid quantity
2. Read the response and retrieve the user's bookings
**Expected Results**: API returns 201 with a confirmed booking containing the submitted customer details, event, quantity, calculated total, and booking reference; the booking is present in the user's list
**Business Rule**: `POST /api/bookings` creates an authenticated user's booking
**Suggested Layer**: API

---

## Business Rules

### TC-100: FIFO pruning — 10th booking replaces oldest booking from a different event
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User has exactly 9 bookings (all for different events); user has JWT token
**Steps**:
1. Note the oldest booking ID
2. Create a new booking (10th) for a different event via `POST /api/bookings`
3. Retrieve all user bookings
**Expected Results**: Total booking count remains 9; the oldest booking is deleted; the new booking is present
**Business Rule**: Max 9 bookings per user; FIFO pruning prefers deleting from a different event
**Suggested Layer**: API

---

### TC-101: FIFO pruning — same-event fallback permanently burns a seat
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User has exactly 9 bookings all for the SAME event; enough seats remain
**Steps**:
1. Create a 10th booking for the same event
2. Retrieve the event's available seats
**Expected Results**: Oldest booking is deleted; new booking is created; `availableSeats` decremented by the new booking's quantity (seat permanently burned via `decrementSeats`)
**Business Rule**: `sameEventFallback` path in `bookingService.createBooking`
**Suggested Layer**: API

---

### TC-102: Booking reference first character matches event title first character
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User is logged in; event with known title exists (e.g., "Tech Conference Bangalore")
**Steps**:
1. Book the event
2. Read the `bookingRef` from the confirmation card or API response
**Expected Results**: `bookingRef` starts with the uppercase first character of the event title (e.g., "T-XXXXXX" for "Tech Conference")
**Business Rule**: `randomRef` function: prefix = `eventTitle[0].toUpperCase()`; Rule 7
**Suggested Layer**: E2E / API

---

### TC-103: Refund eligibility — single ticket booking is eligible
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User has a booking with quantity = 1
**Steps**:
1. Navigate to `/bookings/:id` for the single-ticket booking
2. Click "Check eligibility for refund?"
3. Wait for spinner to disappear (4 seconds)
4. Read the refund result
**Expected Results**: `#refund-result` shows green "Eligible for refund. Single-ticket bookings qualify for a full refund."
**Business Rule**: Rule 8 — quantity === 1 → eligible
**Suggested Layer**: E2E

---

### TC-104: Refund eligibility — multi-ticket booking is NOT eligible
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User has a booking with quantity > 1 (e.g., 3 tickets)
**Steps**:
1. Navigate to `/bookings/:id` for the multi-ticket booking
2. Click "Check eligibility for refund?"
3. Wait for spinner to disappear (4 seconds)
4. Read the refund result
**Expected Results**: `#refund-result` shows red "Not eligible for refund. Group bookings (3 tickets) are non-refundable." with correct quantity displayed
**Business Rule**: Rule 8 — quantity > 1 → not eligible
**Suggested Layer**: E2E

---

### TC-105: Refund eligibility spinner shows for approximately 4 seconds
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User is on a booking detail page
**Steps**:
1. Click "Check eligibility for refund?"
2. Immediately check for spinner
3. Observe when spinner disappears and result appears
**Expected Results**: `#refund-spinner` is visible immediately after clicking; spinner disappears and `#refund-result` appears after ~4 seconds
**Business Rule**: Rule 8 — `setTimeout(..., 4000)` in `RefundEligibility` component
**Suggested Layer**: E2E / Component

---

### TC-106: Total price is calculated as price × quantity
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User books an event with known price
**Steps**:
1. Book an event (e.g., price $1499, quantity 3)
2. View the booking detail page
**Expected Results**: "Total Paid" shows $4,497 (1499 × 3); `totalPrice` in API response equals `event.price × quantity`
**Business Rule**: Rule 9 — `totalPrice = event.price × quantity`
**Suggested Layer**: E2E / API

---

### TC-107: Bookings page shows max 10 bookings per page (pagination)
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User has more than 10 bookings visible in DB (unlikely with limit 9, but relevant for API pagination param)
**Steps**:
1. Send `GET /api/bookings?page=1&limit=10`
**Expected Results**: Response includes `pagination.limit = 10`, `pagination.totalPages`, and `data` array with at most 10 items
**Business Rule**: Rule 4 — max 9 bookings per user; API default limit = 10
**Suggested Layer**: API

---

### TC-108: Cancelling a booking releases seat count for dynamic events (computed)
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User has a dynamic (user-created) event with a booking
**Steps**:
1. Note the current available seats for the event (computed: totalSeats - booked quantities)
2. Cancel the booking for that event
3. Re-fetch the event detail
**Expected Results**: Available seats increase by the cancelled booking's quantity
**Business Rule**: Rule 6 — dynamic events compute seats as `totalSeats - sum(user's booking quantities)`; cancellation removes the booking record
**Suggested Layer**: API / E2E

---

### TC-109: Bookings list shows "Clear all bookings" button whenever bookings exist
**Category**: Business Rule
**Priority**: P2
**Preconditions**: User has at least one booking
**Steps**:
1. Navigate to `/bookings`
2. Look for "Clear all bookings" link
**Expected Results**: "Clear all bookings" link is visible in the top-right of the page header
**Business Rule**: Flow 4 — UI always shows clear option when bookings exist
**Suggested Layer**: E2E / Component

---

### TC-110: Booking quantity consumes the matching number of personal seats
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User owns a dynamic event with known total seats and no existing bookings for it
**Steps**:
1. Create a booking for 3 tickets
2. Retrieve the event detail and the user's bookings for that event
**Expected Results**: The booking quantity is 3 and the user's available seats decrease by 3; the next booking for that event is limited by the remaining personal availability
**Business Rule**: Rule 6 — dynamic-event availability is computed as total seats minus the user's booked quantities
**Suggested Layer**: API

---

### TC-111: Booking list filters by event and status
**Category**: Business Rule
**Priority**: P2
**Preconditions**: User has bookings for at least two events; bookings include the requested status
**Steps**:
1. Send `GET /api/bookings?eventId=<eventId>&status=confirmed` with the user's JWT
2. Inspect every returned booking and pagination metadata
**Expected Results**: Every returned booking belongs to the requested event and has confirmed status; pagination metadata matches the filtered result set
**Business Rule**: `GET /api/bookings` supports `eventId` and `status` filters scoped to the authenticated user
**Suggested Layer**: API

---

## Security

### TC-200: Cross-user booking access returns "Access Denied" (UI)
**Category**: Security
**Priority**: P0
**Preconditions**: Two test accounts exist (rahulshetty1@gmail.com and rahulshetty1@yahoo.com); User A has a booking
**Steps**:
1. Log in as User A, create a booking, note the booking ID
2. Log out (clear localStorage JWT)
3. Log in as User B
4. Navigate to `/bookings/:userA_booking_id`
**Expected Results**: Page shows "Access Denied" title and "You are not authorized to view this booking." description
**Business Rule**: Rule 2 — cross-user access returns 403; frontend renders "Access Denied" on 403 response
**Suggested Layer**: E2E

---

### TC-201: Cross-user booking access returns 403 via API
**Category**: Security
**Priority**: P0
**Preconditions**: User A has a booking; User B has a valid JWT
**Steps**:
1. Send `GET /api/bookings/:userA_booking_id` with User B's JWT
**Expected Results**: HTTP 403; response body contains "You are not authorized to view this booking"
**Business Rule**: `bookingService.getBookingById` — `booking.userId !== userId` → ForbiddenError
**Suggested Layer**: API

---

### TC-202: Cross-user booking cancellation cannot delete another user's booking
**Category**: Security
**Priority**: P0
**Preconditions**: User A has a booking; User B has a valid JWT
**Steps**:
1. Send `DELETE /api/bookings/:userA_booking_id` with User B's JWT
**Expected Results**: Request is rejected (404 with the current ownership-filtered lookup); User A's booking remains unchanged and is still accessible to User A
**Business Rule**: Cancellation lookup is constrained to the authenticated user; another user's booking cannot be deleted
**Suggested Layer**: API

---

### TC-203: Unauthenticated access to bookings list returns 401
**Category**: Security
**Priority**: P0
**Preconditions**: No valid JWT
**Steps**:
1. Send `GET /api/bookings` without Authorization header
**Expected Results**: HTTP 401; "Unauthorized" error message
**Business Rule**: Auth middleware on all `/api/bookings` routes
**Suggested Layer**: API

---

### TC-204: Unauthenticated access to booking detail returns 401
**Category**: Security
**Priority**: P0
**Preconditions**: No valid JWT
**Steps**:
1. Send `GET /api/bookings/:id` without Authorization header
**Expected Results**: HTTP 401; "Unauthorized" error message
**Business Rule**: Auth middleware
**Suggested Layer**: API

---

### TC-205: Unauthenticated DELETE /api/bookings returns 401
**Category**: Security
**Priority**: P0
**Preconditions**: No valid JWT
**Steps**:
1. Send `DELETE /api/bookings` without Authorization header
**Expected Results**: HTTP 401
**Business Rule**: Auth middleware; `clearAllBookings` requires authenticated user
**Suggested Layer**: API

---

### TC-206: Cross-user booking lookup by ref returns 403
**Category**: Security
**Priority**: P1
**Preconditions**: User A has a booking with known ref; User B has a valid JWT
**Steps**:
1. Send `GET /api/bookings/ref/:userA_ref` with User B's JWT
**Expected Results**: HTTP 403; "You do not own this booking"
**Business Rule**: `bookingService.getBookingByRef` — ownership check
**Suggested Layer**: API

---

### TC-207: Unauthenticated booking creation returns 401
**Category**: Security
**Priority**: P0
**Preconditions**: No valid JWT
**Steps**:
1. Send `POST /api/bookings` with otherwise valid event and customer data but no Authorization header
**Expected Results**: HTTP 401; no booking is created and event availability is unchanged
**Business Rule**: Authentication middleware applies to every `/api/bookings` route
**Suggested Layer**: API

---

### TC-208: Unauthenticated cancellation by ID returns 401
**Category**: Security
**Priority**: P1
**Preconditions**: A booking exists; request has no valid JWT
**Steps**:
1. Send `DELETE /api/bookings/:id` without an Authorization header
2. Retrieve the booking using its owner's JWT
**Expected Results**: Delete request returns 401; the owner's booking remains present
**Business Rule**: Authentication middleware protects booking cancellation
**Suggested Layer**: API

---

## Negative / Error

### TC-300: Navigate to non-existent booking ID shows "Booking not found"
**Category**: Negative
**Priority**: P1
**Preconditions**: User is logged in
**Steps**:
1. Navigate to `/bookings/99999` (ID that does not exist)
**Expected Results**: Page shows "Booking not found" and "This booking doesn't exist or may have been cancelled." with "View My Bookings" button
**Business Rule**: `bookingService.getBookingById` throws NotFoundError → API returns 404; frontend renders not-found empty state
**Suggested Layer**: E2E

---

### TC-301: GET /api/bookings/:id with non-existent ID returns 404
**Category**: Negative
**Priority**: P1
**Preconditions**: User is authenticated
**Steps**:
1. Send `GET /api/bookings/99999` with valid JWT
**Expected Results**: HTTP 404; error message "Booking with id 99999 not found"
**Business Rule**: `bookingService.getBookingById` — NotFoundError
**Suggested Layer**: API

---

### TC-302: Create booking with insufficient seats returns 400
**Category**: Negative
**Priority**: P0
**Preconditions**: User is authenticated; event has 0 personal available seats (all booked by this user)
**Steps**:
1. Send `POST /api/bookings` with `quantity: 1` for a fully-booked event
**Expected Results**: HTTP 400; "Only 0 seat(s) available, but 1 requested"
**Business Rule**: `bookingService.createBooking` — `InsufficientSeatsError` when `personalAvailable < quantity`
**Suggested Layer**: API

---

### TC-303: Create booking for non-existent event returns 404
**Category**: Negative
**Priority**: P1
**Preconditions**: User is authenticated
**Steps**:
1. Send `POST /api/bookings` with `eventId: 99999`
**Expected Results**: HTTP 404; "Event with id 99999 not found"
**Business Rule**: `bookingService.createBooking` — event lookup fails → NotFoundError
**Suggested Layer**: API

---

### TC-304: Create booking with missing required fields returns 400
**Category**: Negative
**Priority**: P1
**Preconditions**: User is authenticated
**Steps**:
1. Send `POST /api/bookings` with missing `customerName`, `customerEmail`, or `customerPhone`
**Expected Results**: HTTP 400; validation error message listing missing fields
**Business Rule**: Input validators on the bookings route
**Suggested Layer**: API

---

### TC-305: Create booking with quantity = 0 or negative returns 400
**Category**: Negative
**Priority**: P1
**Preconditions**: User is authenticated
**Steps**:
1. Send `POST /api/bookings` with `quantity: 0`
2. Send `POST /api/bookings` with `quantity: -1`
**Expected Results**: HTTP 400; validation error for both cases
**Business Rule**: quantity must be 1–10 per booking model
**Suggested Layer**: API

---

### TC-306: Create booking with quantity > 10 returns 400
**Category**: Negative
**Priority**: P1
**Preconditions**: User is authenticated
**Steps**:
1. Send `POST /api/bookings` with `quantity: 11`
**Expected Results**: HTTP 400; validation error
**Business Rule**: quantity must be 1–10
**Suggested Layer**: API

---

### TC-307: Cancel a booking that has already been cancelled returns 404
**Category**: Negative
**Priority**: P1
**Preconditions**: User is authenticated; a booking exists
**Steps**:
1. Delete the booking via `DELETE /api/bookings/:id`
2. Attempt to delete the same booking again
**Expected Results**: HTTP 404; "Booking with id X not found"
**Business Rule**: `cancelBooking` uses `bookingRepository.findById` — not found after deletion
**Suggested Layer**: API

---

### TC-308: Bookings page shows error state when server is unreachable
**Category**: Negative
**Priority**: P2
**Preconditions**: Backend server is down or returns 500
**Steps**:
1. Navigate to `/bookings` with backend unavailable
**Expected Results**: Error empty state renders: "Couldn't load bookings", "Failed to connect to the server. Please try again.", and a "Retry" button
**Business Rule**: `isError` branch in `BookingsContent` component
**Suggested Layer**: Component / E2E

---

### TC-309: Create booking with a one-character name returns validation error
**Category**: Negative
**Priority**: P1
**Preconditions**: User is authenticated; target event exists and has seats
**Steps**:
1. Send `POST /api/bookings` with `customerName: "A"` and otherwise valid data
**Expected Results**: HTTP 400 identifies `customerName`; no booking is created
**Business Rule**: Customer name must contain at least 2 characters
**Suggested Layer**: API

---

### TC-310: Create booking with malformed email returns validation error
**Category**: Negative
**Priority**: P1
**Preconditions**: User is authenticated; target event exists and has seats
**Steps**:
1. Send `POST /api/bookings` with an invalid `customerEmail` (for example, `not-an-email`)
**Expected Results**: HTTP 400 identifies `customerEmail`; no booking is created
**Business Rule**: Customer email must be a valid email address
**Suggested Layer**: API

---

### TC-311: Create booking with invalid phone characters or fewer than 10 digits returns validation error
**Category**: Negative
**Priority**: P1
**Preconditions**: User is authenticated; target event exists and has seats
**Steps**:
1. Submit once with fewer than 10 phone characters/digits
2. Submit once with disallowed alphabetic characters in the phone
**Expected Results**: Each request returns HTTP 400 identifying `customerPhone`; no booking is created
**Business Rule**: Phone requires at least 10 characters and permits only digits, `+`, `-`, spaces, and parentheses
**Suggested Layer**: API

---

### TC-312: Create booking with a fractional quantity returns validation error
**Category**: Negative
**Priority**: P1
**Preconditions**: User is authenticated; target event exists and has seats
**Steps**:
1. Send `POST /api/bookings` with `quantity: 1.5` and otherwise valid data
**Expected Results**: HTTP 400 identifies `quantity`; no booking is created
**Business Rule**: Quantity must be an integer from 1 through 10
**Suggested Layer**: API

---

### TC-313: Create booking with a missing or non-positive event ID returns validation error
**Category**: Negative
**Priority**: P1
**Preconditions**: User is authenticated
**Steps**:
1. Submit a booking without `eventId`
2. Submit a booking with `eventId: 0`
**Expected Results**: Both requests return HTTP 400 identifying `eventId`; no booking is created
**Business Rule**: Event ID is required and must be a positive integer
**Suggested Layer**: API

---

### TC-314: Failed booking at the booking limit does not silently remove an existing booking
**Category**: Negative
**Priority**: P0
**Preconditions**: User has exactly 9 bookings; capture all booking references; target request has invalid customer data or insufficient seats
**Steps**:
1. Submit the invalid or impossible 10th booking request
2. Retrieve the user's bookings and compare them with the captured references
**Expected Results**: Request fails with the relevant validation or seat error; all 9 pre-existing bookings remain unchanged
**Business Rule**: FIFO pruning is intended to replace the oldest booking only when a new booking succeeds; a failed request must not destroy existing user data
**Suggested Layer**: API

---

## Edge Cases

### TC-400: Exactly 9 bookings — adding a 10th prunes oldest from a DIFFERENT event (preferred)
**Category**: Edge Case
**Priority**: P0
**Preconditions**: User has exactly 9 bookings across multiple events
**Steps**:
1. Note the ID of the oldest booking (different event from the new booking's event)
2. Create a new (10th) booking for Event X
3. Check the bookings list
**Expected Results**: Count stays at 9; oldest booking (different event) is gone; new booking is present
**Business Rule**: `findOldestUserBookingExcludingEvent` preferential pruning in `bookingService.createBooking`
**Suggested Layer**: API

---

### TC-401: Exactly 9 bookings all from same event — 10th triggers same-event fallback and burns seat
**Category**: Edge Case
**Priority**: P1
**Preconditions**: User has 9 bookings all for Event X
**Steps**:
1. Create a new booking for Event X (10th)
2. Re-fetch Event X's available seats
**Expected Results**: Oldest booking removed; new booking created; `availableSeats` is permanently decremented by the new quantity (seat burned via `eventRepository.decrementSeats`)
**Business Rule**: `sameEventFallback = true` → `decrementSeats` called in `bookingService.createBooking`
**Suggested Layer**: API

---

### TC-402: Booking with quantity = 1 (minimum) — full happy path
**Category**: Edge Case
**Priority**: P1
**Preconditions**: User is logged in; event has available seats
**Steps**:
1. Navigate to event detail page
2. Leave quantity at 1 (default minimum)
3. Fill customer form and confirm booking
**Expected Results**: Booking created with `quantity: 1`; `totalPrice = price × 1`; booking ref generated
**Business Rule**: quantity boundary: 1 is minimum
**Suggested Layer**: E2E

---

### TC-403: Booking with quantity = 10 (maximum)
**Category**: Edge Case
**Priority**: P1
**Preconditions**: User is logged in; event has >= 10 available seats
**Steps**:
1. Navigate to event detail; click "+" 9 times to reach quantity 10
2. Fill form and confirm booking
**Expected Results**: Booking created with `quantity: 10`; `totalPrice = price × 10`; increment button disabled at 10
**Business Rule**: quantity boundary: 10 is maximum; UI should prevent going above 10
**Suggested Layer**: E2E

---

### TC-404: Refund eligibility boundary — quantity = 2 is NOT eligible (just above threshold)
**Category**: Edge Case
**Priority**: P1
**Preconditions**: User has a booking with quantity = 2
**Steps**:
1. Navigate to booking detail
2. Click "Check eligibility for refund?"
3. Wait 4 seconds
**Expected Results**: Result shows "Not eligible for refund. Group bookings (2 tickets) are non-refundable."
**Business Rule**: Rule 8 — threshold is quantity === 1; quantity = 2 is the first ineligible value
**Suggested Layer**: E2E

---

### TC-405: Booking reference uniqueness — collision retry mechanism
**Category**: Edge Case
**Priority**: P2
**Preconditions**: Many bookings exist with the same event title prefix (stress scenario)
**Steps**:
1. Create many bookings for events starting with the same letter
2. Verify each `bookingRef` is unique in DB
**Expected Results**: All booking references are unique; no duplicates; fallback timestamp-based ref used after 10 failed attempts
**Business Rule**: `generateUniqueRef` — up to 10 retries, then timestamp fallback
**Suggested Layer**: Unit

---

### TC-406: Clear all bookings when only one booking exists
**Category**: Edge Case
**Priority**: P2
**Preconditions**: User has exactly 1 booking
**Steps**:
1. Navigate to `/bookings`
2. Click "Clear all bookings" and confirm
**Expected Results**: Booking is deleted; page shows empty state; `DELETE /api/bookings` returns `{ deleted: 1 }`
**Business Rule**: `clearAllBookings` — `deleteAllForUser` returns count of deleted records
**Suggested Layer**: E2E / API

---

### TC-407: Pagination on bookings list (API) — page 2 with partial results
**Category**: Edge Case
**Priority**: P2
**Preconditions**: User has more than the default page limit of bookings visible in API
**Steps**:
1. Send `GET /api/bookings?page=2&limit=5`
**Expected Results**: Returns page 2 results; `pagination.page = 2`; `data` array contains at most 5 items
**Business Rule**: Pagination behavior in `bookingService.getBookings`
**Suggested Layer**: API

---

### TC-408: Event title starting with a number — booking ref prefix is uppercase of that character
**Category**: Edge Case
**Priority**: P2
**Preconditions**: An event exists whose title starts with a digit (e.g., "100 Days Festival")
**Steps**:
1. Book the event
2. Check the `bookingRef`
**Expected Results**: `bookingRef` starts with "1-XXXXXX" (digit is used as-is, `toUpperCase()` has no effect on digits)
**Business Rule**: `randomRef` — `prefix = (eventTitle?.[0] ?? 'E').toUpperCase()`
**Suggested Layer**: API / Unit

---

### TC-409: Available seats below the per-booking maximum constrain the quantity selector
**Category**: Edge Case
**Priority**: P1
**Preconditions**: User is logged in; selected event has between 1 and 9 available seats
**Steps**:
1. Open the event detail page
2. Increase the ticket quantity until the increment control becomes disabled
3. Submit the maximum selectable quantity
**Expected Results**: Selector maximum equals the lesser of 10 and available seats; the booking succeeds without exceeding availability
**Business Rule**: Flow 3 quantity selection is limited to 1–10 tickets and cannot exceed available seats
**Suggested Layer**: E2E

---

### TC-410: Zero-price event booking has a zero total
**Category**: Edge Case
**Priority**: P2
**Preconditions**: User is authenticated; a valid event exists with price 0 and available seats
**Steps**:
1. Create a booking for 2 tickets
2. Inspect the response and booking detail payment summary
**Expected Results**: Booking is confirmed and `totalPrice` is 0; no negative or invalid amount is displayed
**Business Rule**: Event price may be 0; total price equals price multiplied by quantity
**Suggested Layer**: API / E2E

---

## UI State

### TC-500: Bookings list shows skeleton loading state while fetching
**Category**: UI State
**Priority**: P1
**Preconditions**: User navigates to `/bookings` (slow network or first load)
**Steps**:
1. Navigate to `/bookings` with throttled network
2. Observe the page before data loads
**Expected Results**: 5 `BookingCardSkeleton` placeholders are shown while `isLoading = true`; no real booking data yet
**Business Rule**: `isLoading` branch in `BookingsContent`
**Suggested Layer**: Component / E2E

---

### TC-501: Bookings list shows empty state when user has no bookings
**Category**: UI State
**Priority**: P1
**Preconditions**: User is logged in with zero bookings
**Steps**:
1. Navigate to `/bookings`
**Expected Results**: Empty state renders with "No bookings yet", "You haven't booked any events yet..." description, and "Browse Events" button linking to `/events`
**Business Rule**: `bookings.length === 0` branch in `BookingsContent`
**Suggested Layer**: E2E / Component

---

### TC-502: Booking detail page shows loading spinner while fetching
**Category**: UI State
**Priority**: P2
**Preconditions**: User navigates to `/bookings/:id` on slow network
**Steps**:
1. Navigate to `/bookings/:id` with throttled network
2. Observe the page before data loads
**Expected Results**: Full-screen spinner (`Spinner size="lg"`) is visible while `isLoading = true`
**Business Rule**: `isLoading` branch in `BookingDetailPage`
**Suggested Layer**: Component

---

### TC-503: Cancel booking confirmation dialog appears before deletion
**Category**: UI State
**Priority**: P0
**Preconditions**: User is on a booking detail page
**Steps**:
1. Click "Cancel Booking" button
2. Observe dialog
**Expected Results**: `ConfirmDialog` appears with title "Cancel this booking?", description mentioning the booking ref and seat count, "Yes, cancel it" and close buttons
**Business Rule**: Two-step confirmation prevents accidental cancellations
**Suggested Layer**: E2E / Component

---

### TC-504: Cancel booking dialog close without confirming does NOT cancel
**Category**: UI State
**Priority**: P1
**Preconditions**: User is on a booking detail page
**Steps**:
1. Click "Cancel Booking"
2. Click the close/dismiss button on the dialog (not "Yes, cancel it")
3. Observe booking status
**Expected Results**: Dialog closes; booking remains in the list; no API call made
**Business Rule**: `onClose` sets `confirm = false`; `handleCancel` only runs on confirm
**Suggested Layer**: E2E

---

### TC-505: Booking detail breadcrumb displays the booking reference
**Category**: UI State
**Priority**: P2
**Preconditions**: User navigates to a valid booking detail page
**Steps**:
1. Navigate to `/bookings/:id`
2. Observe the breadcrumb nav at the top
**Expected Results**: Breadcrumb shows "My Bookings / {bookingRef}" where bookingRef is in monospace font
**Business Rule**: Breadcrumb uses `booking.bookingRef`
**Suggested Layer**: E2E

---

### TC-506: Cancel booking success — toast and redirect
**Category**: UI State
**Priority**: P0
**Preconditions**: User confirms booking cancellation
**Steps**:
1. Confirm cancellation in the dialog
2. Observe page transition and notifications
**Expected Results**: Success toast "Booking cancelled successfully" appears; user is redirected to `/bookings`
**Business Rule**: `onSuccess` callback in `handleCancel`
**Suggested Layer**: E2E

---

### TC-507: "Clear all bookings" button shows "Clearing..." while in progress
**Category**: UI State
**Priority**: P2
**Preconditions**: User has bookings; network is slow
**Steps**:
1. Click "Clear all bookings" and confirm dialog
2. Observe the button state while request is in flight
**Expected Results**: Button text changes to "Clearing…" and is disabled (`disabled:opacity-50`) during the API call
**Business Rule**: `clearing` state variable in `BookingsContent`
**Suggested Layer**: Component / E2E

---

### TC-508: Refund eligibility — "Check eligibility" button hidden after result shown
**Category**: UI State
**Priority**: P2
**Preconditions**: User is on a booking detail page in idle refund state
**Steps**:
1. Click "Check eligibility for refund?"
2. Wait for result to appear
**Expected Results**: After status transitions from "idle" → "checking" → "eligible/ineligible", the initial button is no longer visible; spinner replaces it during check; result card replaces spinner after 4 seconds
**Business Rule**: `RefundEligibility` component status state machine: idle → checking → eligible/ineligible
**Suggested Layer**: E2E / Component

---

### TC-509: Booking detail shows "Access Denied" state for 403 errors
**Category**: UI State
**Priority**: P0
**Preconditions**: Another user's booking ID is known
**Steps**:
1. Log in as User B
2. Navigate to `/bookings/:userA_booking_id`
3. Observe the rendered state
**Expected Results**: `EmptyState` with title "Access Denied" and description "You are not authorized to view this booking." renders (not "Booking not found")
**Business Rule**: Frontend checks `error.status === 403` to differentiate Access Denied vs Not Found
**Suggested Layer**: E2E

---

### TC-510: Bookings page pagination UI renders when total exceeds page size
**Category**: UI State
**Priority**: P2
**Preconditions**: API returns `pagination.totalPages > 1`
**Steps**:
1. Navigate to `/bookings` with enough bookings to trigger multi-page response
2. Observe pagination controls
**Expected Results**: `Pagination` component renders with correct `currentPage` and `totalPages`; clicking next page updates URL `?page=N` and loads next page of bookings
**Business Rule**: Pagination in `BookingsContent` driven by `pagination` from API response
**Suggested Layer**: E2E / Component

---

### TC-511: Booking form quantity controls and total update together
**Category**: UI State
**Priority**: P1
**Preconditions**: User is logged in; selected event has at least 3 available seats
**Steps**:
1. Open the event detail page and note the default quantity and total
2. Click "+" twice, then click "−" once
**Expected Results**: Quantity and price summary update after each change; final quantity is 2 and total is twice the event's per-ticket price
**Business Rule**: Flow 3 quantity selector and Rule 9 price calculation
**Suggested Layer**: Component / E2E

---

### TC-512: Booking form prevents decrementing below one ticket
**Category**: UI State
**Priority**: P2
**Preconditions**: User is on an event detail page with at least one available seat
**Steps**:
1. Leave quantity at its default value of 1
2. Inspect and attempt to activate the decrement control
**Expected Results**: Quantity remains 1 and the decrement control is disabled
**Business Rule**: Quantity minimum is 1
**Suggested Layer**: Component / E2E

---

### TC-513: Sold-out event cannot be submitted for booking
**Category**: UI State
**Priority**: P1
**Preconditions**: Event has zero available seats
**Steps**:
1. Open the event detail page
2. Inspect the booking form's submit control
**Expected Results**: Submit control is disabled and labeled "Sold Out"; no booking request can be submitted from the form
**Business Rule**: Booking is unavailable when event availability is zero
**Suggested Layer**: E2E / Component

---

### TC-514: Booking form displays field validation and does not submit invalid values
**Category**: UI State
**Priority**: P1
**Preconditions**: User is logged in; event has available seats
**Steps**:
1. Leave name, email, and phone blank or enter invalid values
2. Click "Confirm Booking"
**Expected Results**: Inline validation messages identify invalid fields; no confirmation card appears and no booking is created
**Business Rule**: Booking form requires a name of at least 2 characters, valid email, valid 10-digit phone, and a valid ticket quantity
**Suggested Layer**: E2E / Component
