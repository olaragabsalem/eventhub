# EventHub User Flows and Test Data

## Registration and login

1. Navigate to `/register`.
2. Enter a unique email and a valid password.
3. Submit the form and verify successful registration.
4. Alternatively, navigate to `/login` and sign in with valid credentials.

## Browse and filter events

1. Navigate to `/events`.
2. Search by title, description, or venue.
3. Filter by category or city.
4. Navigate pages when pagination is available.
5. Select an event to view details.

## Book an event

1. Open an event from its card.
2. Review date, venue, price, and available seats.
3. Choose a valid ticket quantity.
4. Fill out the customer form.
5. Confirm the booking and verify its reference.
6. Navigate to the bookings list or browse more events.

## Manage bookings

1. Navigate to `/bookings`.
2. Open a booking's details.
3. Verify booking, event, customer, and payment information.
4. Check refund eligibility when supported by the UI.
5. Cancel one booking or clear all bookings when appropriate.

## Admin event management

1. Navigate to `/admin/events`.
2. Create an event with valid title, category, city, venue, date, price, and seats.
3. Verify the success feedback and event list.
4. Edit or delete user-created events if supported.

## Cross-user access

1. Create a booking as User A and record its ID.
2. Sign in as User B using credentials supplied securely by the test environment.
3. Try to open User A's booking.
4. Verify access is denied.

## Test data safety

- Do not store shared-account passwords, tokens, or production secrets in this repository.
- Use unique test accounts where registration is available.
- Supply any required credentials through environment variables or the CI secret store.
- Do not log credential values or use shared accounts unless explicitly configured for the test environment.
