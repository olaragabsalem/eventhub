# EventHub API Reference

## Authentication (no authentication required)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password }` | `{ token, user: { id, email } }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user: { id, email } }` |
| GET | `/api/auth/me` | — | `{ user: { userId, email } }` |

## Events (authentication required)

| Method | Endpoint | Query/body | Response |
|---|---|---|---|
| GET | `/api/events` | `search`, `category`, `city`, `page`, `limit` | `{ data: Event[], pagination }` |
| GET | `/api/events/:id` | — | `{ data: Event }` |
| POST | `/api/events` | `CreateEventInput` | `{ data: Event }` |
| PUT | `/api/events/:id` | `UpdateEventInput` | `{ data: Event }` |
| DELETE | `/api/events/:id` | — | `{ message }` |

## Bookings (authentication required)

| Method | Endpoint | Query/body | Response |
|---|---|---|---|
| GET | `/api/bookings` | `eventId`, `status`, `page`, `limit` | `{ data: Booking[], pagination }` |
| GET | `/api/bookings/:id` | — | `{ data: Booking }` |
| GET | `/api/bookings/ref/:ref` | — | `{ data: Booking }` |
| POST | `/api/bookings` | `CreateBookingInput` | `{ data: Booking }` |
| DELETE | `/api/bookings` | — | Clear all current user's bookings |
| DELETE | `/api/bookings/:id` | — | Cancel one booking |

## Documented error scenarios

| Scenario | HTTP code | Message |
|---|---:|---|
| Invalid login credentials | 401 | Invalid credentials |
| Duplicate email registration | 409 | Email already registered |
| Missing authentication token | 401 | Unauthorized |
| Cross-user booking access | 403 | Forbidden / Access Denied |
| Edit static event | 403 | Cannot modify static events |
| Insufficient seats | 400 | Insufficient seats available |
| Event date is in the past | 400 | Event date must be in the future |
| Missing required fields | 400 | Validation error details |

Confirm endpoint behavior against the current backend source before relying on this reference in tests.
