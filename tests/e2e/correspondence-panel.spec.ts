import { test, expect, type Route } from '@playwright/test';

const TASK_ID = '11111111-1111-1111-1111-111111111111';
const TASK_DETAIL_URL = `/work-management/board?task=${TASK_ID}`;

const SAMPLE_MESSAGES = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    thread_id: 'tttttttt-tttt-tttt-tttt-tttttttttttt',
    direction: 'inbound',
    subject: 'Roof leak — initial report',
    body_text: 'There is a leak in the corner of the lobby.',
    body_html: null,
    received_at: '2025-06-01T10:00:00Z',
    sent_at: null,
    sender: {
      type: 'user',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      avatar_url: null,
    },
    attachments: [
      {
        id: 'attach-1',
        filename: 'leak.jpg',
        content_type: 'image/jpeg',
        byte_size: 50_000,
        inline: false,
      },
    ],
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    thread_id: 'tttttttt-tttt-tttt-tttt-tttttttttttt',
    direction: 'outbound',
    subject: 'Re: Roof leak — initial report',
    body_text: 'Thanks for the report; sending plumber tomorrow morning.',
    body_html: null,
    received_at: null,
    sent_at: '2025-06-02T09:30:00Z',
    sender: {
      type: 'contact_unclaimed',
      name: 'Property Manager',
      email: 'manager@society.example',
      avatar_url: null,
    },
    attachments: [],
  },
];

test.describe('Correspondence panel', () => {
  test('renders empty state for a task with zero linked messages', async ({ page }) => {
    await page.route('**/api/v1/emails/messages/by-task/**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ messages: [], next_cursor: null }),
      });
    });

    await page.goto(TASK_DETAIL_URL);
    await page.getByRole('button', { name: /correspondence/i }).click();
    await expect(page.getByText(/no email correspondence is linked to this task yet/i)).toBeVisible();
  });

  test('renders messages chronologically with sender chips', async ({ page }) => {
    await page.route('**/api/v1/emails/messages/by-task/**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ messages: SAMPLE_MESSAGES, next_cursor: null }),
      });
    });

    await page.goto(TASK_DETAIL_URL);
    await page.getByRole('button', { name: /correspondence/i }).click();

    await expect(page.getByText('Alex Morgan')).toBeVisible();
    await expect(page.getByText('Property Manager')).toBeVisible();
    await expect(page.getByText(/there is a leak/i)).toBeVisible();
    await expect(page.getByText(/sending plumber tomorrow/i)).toBeVisible();
  });

  test('attachment download triggers fetch + redirect', async ({ page }) => {
    await page.route('**/api/v1/emails/messages/by-task/**', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ messages: SAMPLE_MESSAGES, next_cursor: null }),
      });
    });
    const presignedUrl = 'https://r2.example.com/signed/attach-1';
    await page.route('**/api/v1/emails/messages/*/attachments/*/download-url', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ download_url: presignedUrl, expires_in_seconds: 300 }),
      });
    });
    await page.route(presignedUrl, async (route: Route) => {
      await route.fulfill({ status: 200, body: 'fake-bytes' });
    });

    await page.goto(TASK_DETAIL_URL);
    await page.getByRole('button', { name: /correspondence/i }).click();
    await expect(page.getByText('leak.jpg')).toBeVisible();

    const requestPromise = page.waitForRequest('**/attachments/*/download-url');
    await page.getByRole('button', { name: /download/i }).first().click();
    const req = await requestPromise;
    expect(req.url()).toContain('/attachments/');
  });
});
