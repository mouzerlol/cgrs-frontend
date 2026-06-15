/**
 * Verification self-service page — state-adaptive layout.
 * Drives the full state matrix by stubbing the verification API with page.route,
 * so each state is deterministic without seeding the backend.
 *
 * Run (authenticated): npx playwright test tests/e2e/verification-self-service.spec.ts --project=chromium-authenticated
 */
import { test, expect, type Page, type Route } from '@playwright/test';

const PAGE_URL = '/account/verification';

type State = {
  verified?: number;
  pending?: null | { type: 'resident' | 'owner'; method: 'peer' | 'qr_mail' | 'role_management' };
  responses?: number;
};

function verifiedProperties(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    property_id: `prop-${i}`,
    street_name: 'Huri Street',
    street_number: String(40 + i),
    verification_type: i % 2 === 0 ? 'owner' : 'resident',
    verified_at: '2026-04-04T00:00:00Z',
    unit_number: null,
    property_type: 'house',
    bedrooms: null,
    bathrooms: null,
    parking_spaces: null,
    lat: null,
    lng: null,
    image_url: null,
    co_members: [],
  }));
}

async function json(route: Route, body: unknown) {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
}

async function stubVerification(page: Page, state: State) {
  const verified = state.verified ?? 0;
  const pending = state.pending ?? null;
  const responses = state.responses ?? 0;

  // Profile layout prerequisites — render the section regardless of backend state.
  await page.route('**/api/v1/bootstrap', (r) => json(r, {}));
  await page.route('**/api/v1/users/me', (r) =>
    json(r, {
      user: {
        id: 'u-e2e',
        clerk_user_id: 'user_e2e',
        email: 'cgrs-e2e@example.com',
        first_name: 'Test',
        last_name: 'Resident',
        avatar_url: null,
        created_at: '2026-01-01T00:00:00Z',
      },
      membership: {
        id: 'm-e2e',
        community_id: 'c-e2e',
        user_id: 'u-e2e',
        role: 'resident',
        created_at: '2026-01-01T00:00:00Z',
      },
      is_superadmin: false,
      capabilities: [],
    }),
  );
  await page.route('**/api/v1/notifications/unread-count', (r) => json(r, { total: 0, by_section: [] }));

  await page.route('**/api/v1/properties/my-properties', (r) =>
    json(r, { verified_properties: verifiedProperties(verified), pending_requests: [] }),
  );
  await page.route('**/api/v1/properties/verification/status', (r) =>
    json(r, {
      is_verified: verified > 0,
      role: verified > 0 ? 'owner' : null,
      has_pending_request: !!pending,
      pending_address: pending ? 'Huri Street 50' : null,
      pending_type: pending?.type ?? null,
      pending_verification_method: pending?.method ?? null,
    }),
  );
  await page.route('**/api/v1/properties/verification/pending', (r) =>
    json(r, {
      my_pending_requests: [],
      pending_responses: Array.from({ length: responses }, (_, i) => ({
        id: `resp-${i}`,
        property_id: `prop-x-${i}`,
        street_name: 'Huri Street',
        street_number: '99',
        verification_type: 'resident',
        requester_name: 'Jane',
        requester_email: 'jane@example.com',
        created_at: '2026-04-01T00:00:00Z',
      })),
    }),
  );
  await page.route('**/api/v1/properties/verification/history', (r) => json(r, []));
  await page.route('**/api/v1/properties/streets', (r) =>
    json(r, [{ id: 's1', name: 'Huri Street', created_at: '2026-01-01T00:00:00Z' }]),
  );
}

const verifyAnother = (page: Page) => page.getByRole('button', { name: /verify another property/i });

test.describe('Verification self-service — state matrix', () => {
  test('NONE: shows the resident/owner flow, no badges, no button', async ({ page }) => {
    await stubVerification(page, { verified: 0, pending: null });
    await page.goto(PAGE_URL);

    await expect(page.getByRole('button', { name: /become a resident/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /become an owner/i })).toBeVisible();
    await expect(page.getByTestId('badge-wall')).toHaveCount(0);
    await expect(verifyAnother(page)).toHaveCount(0);
  });

  for (const method of ['peer', 'qr_mail', 'role_management'] as const) {
    test(`PENDING (${method}): shows pending section, hides the button`, async ({ page }) => {
      await stubVerification(page, {
        verified: 0,
        pending: { type: method === 'role_management' ? 'owner' : 'resident', method },
      });
      await page.goto(PAGE_URL);

      await expect(page.locator('[data-section="pending"]')).toBeVisible();
      await expect(verifyAnother(page)).toHaveCount(0);
    });
  }

  test('VERIFIED + no pending: badges visible, button visible', async ({ page }) => {
    await stubVerification(page, { verified: 2, pending: null });
    await page.goto(PAGE_URL);

    await expect(page.getByTestId('property-badge')).toHaveCount(2);
    await expect(verifyAnother(page)).toBeVisible();
    const link = page.getByRole('link', { name: /view my propert/i });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('href', '/account/my-property');
  });

  test('VERIFIED + pending: badges + pending shown, button hidden', async ({ page }) => {
    await stubVerification(page, { verified: 1, pending: { type: 'resident', method: 'peer' } });
    await page.goto(PAGE_URL);

    await expect(page.getByTestId('property-badge')).toHaveCount(1);
    await expect(page.locator('[data-section="pending"]')).toBeVisible();
    await expect(verifyAnother(page)).toHaveCount(0);
  });

  test('responses-needed section renders', async ({ page }) => {
    await stubVerification(page, { verified: 1, pending: null, responses: 1 });
    await page.goto(PAGE_URL);
    await expect(page.locator('[data-section="responses"]')).toBeVisible();
  });

  test('section order is badges → pending → responses', async ({ page }) => {
    await stubVerification(page, { verified: 1, pending: { type: 'resident', method: 'peer' }, responses: 1 });
    await page.goto(PAGE_URL);
    // Wait for the section stack to render before reading DOM order.
    await expect(page.locator('[data-section="responses"]')).toBeVisible();
    const sections = await page.locator('[data-section]').evaluateAll((els) =>
      els.map((e) => (e as HTMLElement).dataset.section),
    );
    expect(sections).toEqual(['badges', 'pending', 'responses', 'history']);
  });

  test('verify-another reveals the flow inline', async ({ page }) => {
    await stubVerification(page, { verified: 1, pending: null });
    await page.goto(PAGE_URL);
    await expect(page.getByRole('button', { name: /become a resident/i })).toHaveCount(0);
    await verifyAnother(page).click();
    await expect(page.getByRole('button', { name: /become a resident/i })).toBeVisible();
  });
});

test.describe('Verification self-service — responsive badge grid', () => {
  test('badges are two-up on desktop, stacked on mobile', async ({ page }) => {
    await stubVerification(page, { verified: 2, pending: null });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(PAGE_URL);
    const badges = page.getByTestId('property-badge');
    await expect(badges).toHaveCount(2);
    const a = await badges.nth(0).boundingBox();
    const b = await badges.nth(1).boundingBox();
    // Side by side: roughly the same top.
    expect(Math.abs((a!.y) - (b!.y))).toBeLessThan(20);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    const a2 = await page.getByTestId('property-badge').nth(0).boundingBox();
    const b2 = await page.getByTestId('property-badge').nth(1).boundingBox();
    // Stacked: clearly different tops.
    expect(b2!.y - a2!.y).toBeGreaterThan(20);
  });
});
