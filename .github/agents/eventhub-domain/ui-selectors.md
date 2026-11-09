# EventHub UI Selector Reference

These are documented selector examples, not guarantees. Verify each selector against the current source or rendered page before using it.

## Login

- Email: `getByPlaceholder('you@email.com')` or `getByLabel('Email')`
- Password: `getByLabel('Password')`
- Login button: `#login-btn`

## Home

- Browse events link: use an accessible link role and verify its current name.
- My Bookings link: navigation bar.

## Events

- Event cards: `getByTestId('event-card')`
- Book Now: `getByTestId('book-now-btn')` within the event card
- Sandbox banner: `getByText(/sandbox holds up to/i)`

## Event detail and booking

- Ticket count: `#ticket-count`
- Customer name: `getByLabel('Full Name')`
- Customer email: `#customer-email`
- Customer phone: verify current label or placeholder in source.
- Booking reference: `.booking-ref`

## Admin event form

- Title: `#event-title-input`
- Description: `#admin-event-form textarea`
- City, venue, date, price, and seats: prefer accessible labels.
- Add event button: `#add-event-btn`

## Bookings

- Booking cards: verify whether `data-testid="booking-card"` or `#booking-card` is current.
- View Details: accessible link name.
- Clear all: verify current button/link and conditional visibility.

## Booking detail

- Event title: `h1`
- Refund result: `#refund-result`
- Cancel action: accessible button name.
- For detail values, prefer visible labels and scope to the corresponding field rather than relying on undocumented test IDs.
