import { test, expect } from '@playwright/test';

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';
const TEST_PASSWORD = 'BookingTest1!';

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatEventDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

async function registerTestUser(page) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `booking-e2e-${suffix}@example.com`;

  await page.goto(`${BASE_URL}/register`);
  await page.getByTestId('register-email').fill(email);
  await page.getByTestId('register-password').fill(TEST_PASSWORD);
  await page.getByPlaceholder('Repeat your password').fill(TEST_PASSWORD);
  await page.getByTestId('register-btn').click();
  await expect(page.getByRole('link', { name: /Browse Events/i }).first()).toBeVisible();
}

async function createBooking(page) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const customerName = `Booking Test ${suffix}`;
  const customerEmail = `customer-${suffix}@example.com`;
  const customerPhone = '9876543210';

  await page.goto(`${BASE_URL}/events`);
  const eventCard = page.getByTestId('event-card').filter({
    has: page.getByRole('link', { name: 'Book Now', exact: true }),
  }).first();
  await expect(eventCard).toBeVisible();

  const eventTitle = (await eventCard.locator('h3').textContent())?.trim();
  expect(eventTitle).toBeTruthy();

  const eventResponsePromise = page.waitForResponse((response) =>
    response.request().resourceType() === 'xhr' &&
    /\/events\/\d+$/.test(new URL(response.url()).pathname),
  );
  await eventCard.getByRole('link', { name: 'Book Now', exact: true }).click();
  await expect(page).toHaveURL(/\/events\/\d+$/);
  const eventResponse = await eventResponsePromise;
  expect(eventResponse.status()).toBe(200);
  const event = (await eventResponse.json()).data;

  await page.getByLabel('Full Name').fill(customerName);
  await page.getByLabel('Email').fill(customerEmail);
  await page.getByLabel('Phone Number').fill(customerPhone);

  const bookingResponsePromise = page.waitForResponse((response) =>
    response.request().method() === 'POST' &&
    /\/bookings$/.test(new URL(response.url()).pathname),
  );
  await page.getByRole('button', { name: 'Confirm Booking' }).click();
  const bookingResponse = await bookingResponsePromise;
  expect(bookingResponse.status()).toBe(201);
  const createdBooking = (await bookingResponse.json()).data;

  await expect(page.getByText('Booking Confirmed! 🎉')).toBeVisible();
  const bookingRef = (await page.locator('.booking-ref').textContent())?.trim();
  expect(bookingRef).toBeTruthy();

  return { bookingRef, eventTitle, event, createdBooking, customerName, customerEmail, customerPhone };
}

async function getDetailFieldValue(page, label) {
  const value = page.getByText(label, { exact: true })
    .locator('xpath=..')
    .locator('span')
    .nth(1);
  await expect(value).toBeVisible();
  return (await value.innerText()).trim();
}

test.describe('Booking flow', () => {
  test('TC-001: displays booking reference, event, quantity, price, and details link', async ({ page }) => {
    await registerTestUser(page);
    const { bookingRef, eventTitle } = await createBooking(page);

    await page.goto(`${BASE_URL}/bookings`);
    const bookingCard = page.getByTestId('booking-card').filter({ hasText: bookingRef });

    await expect(bookingCard).toBeVisible();
    await expect(bookingCard).toContainText(eventTitle);
    await expect(bookingCard).toContainText(bookingRef);
    await expect(bookingCard).toContainText(/1 ticket\b/);
    await expect(bookingCard).toContainText(/\$\s?[\d,]+/);
    await expect(bookingCard.getByRole('link', { name: 'View Details' })).toBeVisible();
  });

  test('TC-002: displays booking, event, customer, payment, and refund details', async ({ page }) => {
    await registerTestUser(page);
    const booking = await createBooking(page);

    await page.goto(`${BASE_URL}/bookings`);
    const bookingCard = page.getByTestId('booking-card').filter({ hasText: booking.bookingRef });
    await expect(bookingCard).toBeVisible();
    const bookingId = (await bookingCard.getByTestId('booking-id').textContent())?.trim();
    expect(bookingId).toMatch(/^#\d+$/);

    await bookingCard.getByRole('link', { name: 'View Details' }).click();
    await expect(page).toHaveURL(/\/bookings\/\d+$/);

    await expect(page.getByText(booking.bookingRef, { exact: true })).toHaveCount(2);
    await expect(page.getByText(bookingId, { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: booking.eventTitle })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Event Details' })).toBeVisible();
    expect(await getDetailFieldValue(page, 'Event')).toBe(booking.event.title);
    expect(await getDetailFieldValue(page, 'Category')).toBe(booking.event.category);
    expect(await getDetailFieldValue(page, 'Date')).toBe(formatEventDate(booking.event.eventDate));
    expect(await getDetailFieldValue(page, 'Venue')).toBe(booking.event.venue);
    expect(await getDetailFieldValue(page, 'City')).toBe(booking.event.city);

    await expect(page.getByRole('heading', { name: 'Customer Details' })).toBeVisible();
    for (const value of [booking.customerName, booking.customerEmail, booking.customerPhone]) {
      await expect(page.getByText(value, { exact: true })).toBeVisible();
    }

    await expect(page.getByRole('heading', { name: 'Payment Summary' })).toBeVisible();
    expect(await getDetailFieldValue(page, 'Tickets')).toBe(String(booking.createdBooking.quantity));
    expect(await getDetailFieldValue(page, 'Price per ticket')).toBe(formatPrice(booking.event.price));
    expect(await getDetailFieldValue(page, 'Total Paid')).toBe(formatPrice(booking.createdBooking.totalPrice));
    expect(Number(booking.createdBooking.totalPrice)).toBeCloseTo(
      Number(booking.event.price) * booking.createdBooking.quantity,
      2,
    );
    expect(await getDetailFieldValue(page, 'Booking ID')).toBe(bookingId);
    await expect(page.getByRole('button', { name: 'Check eligibility for refund?' })).toBeVisible();
  });

  test('TC-003: cancels a booking from its detail page and removes it from the list', async ({ page }) => {
    await registerTestUser(page);
    const { bookingRef } = await createBooking(page);

    await page.goto(`${BASE_URL}/bookings`);
    const bookingCard = page.getByTestId('booking-card').filter({ hasText: bookingRef });
    await bookingCard.getByRole('link', { name: 'View Details' }).click();
    await expect(page).toHaveURL(/\/bookings\/\d+$/);

    await page.getByRole('button', { name: 'Cancel Booking' }).click();
    await expect(page.getByText('Cancel this booking?')).toBeVisible();
    await page.getByRole('button', { name: 'Yes, cancel it' }).click();

    await expect(page).toHaveURL(/\/bookings\/?$/);
    await expect(page.getByText('Booking cancelled successfully')).toBeVisible();
    await expect(
      page.getByTestId('booking-card').filter({ hasText: bookingRef }),
    ).toHaveCount(0);
  });
});
