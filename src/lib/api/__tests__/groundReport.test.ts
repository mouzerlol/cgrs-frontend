import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createReport,
  createZone,
  deleteImage,
  getMemberGroundReport,
  listZones,
  reorderImages,
  updateReport,
  uploadImage,
} from '@/lib/api/groundReport';
import { apiRequest } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({ apiRequest: vi.fn() }));

const getToken = vi.fn(async () => 'token');

beforeEach(() => {
  vi.mocked(apiRequest).mockReset();
  getToken.mockClear();
});

describe('groundReport API client', () => {
  it('listZones GETs the zones endpoint', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ items: [] });
    await listZones(getToken);
    expect(apiRequest).toHaveBeenCalledWith('/api/v1/ground-report/zones', getToken);
  });

  it('createZone POSTs a JSON body', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ id: 'z1' });
    await createZone({ label: 'North Slope', precinct_keys: ['huri-street'] }, getToken);
    const [path, , opts] = vi.mocked(apiRequest).mock.calls[0];
    expect(path).toBe('/api/v1/ground-report/zones');
    expect(opts?.method).toBe('POST');
    expect(JSON.parse(opts?.body as string)).toEqual({
      label: 'North Slope',
      precinct_keys: ['huri-street'],
    });
  });

  it('createReport sends zone_id, period_type and picked_date', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ id: 'r1' });
    await createReport(
      { zone_id: 'z1', period_type: 'week', picked_date: '2026-06-18' },
      getToken,
    );
    const [path, , opts] = vi.mocked(apiRequest).mock.calls[0];
    expect(path).toBe('/api/v1/ground-report/reports');
    expect(JSON.parse(opts?.body as string)).toMatchObject({
      zone_id: 'z1',
      period_type: 'week',
      picked_date: '2026-06-18',
    });
  });

  it('updateReport PATCHes the report endpoint', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ id: 'r1' });
    await updateReport('r1', { visibility: 'archived' }, getToken);
    const [path, , opts] = vi.mocked(apiRequest).mock.calls[0];
    expect(path).toBe('/api/v1/ground-report/reports/r1');
    expect(opts?.method).toBe('PATCH');
  });

  it('uploadImage builds a multipart form with the coordinate', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ id: 'i1' });
    const file = new File(['x'], 'p.jpg', { type: 'image/jpeg' });
    await uploadImage(
      {
        reportId: 'r1',
        file,
        lat: -36.5,
        lng: 174.7,
        coordSource: 'device',
        accuracyM: 12,
        caption: 'hello',
      },
      getToken,
    );
    const [path, , opts] = vi.mocked(apiRequest).mock.calls[0];
    expect(path).toBe('/api/v1/ground-report/reports/r1/images');
    expect(opts?.method).toBe('POST');
    const form = opts?.body as FormData;
    expect(form.get('lat')).toBe('-36.5');
    expect(form.get('lng')).toBe('174.7');
    expect(form.get('coord_source')).toBe('device');
    expect(form.get('accuracy_m')).toBe('12');
    expect(form.get('caption')).toBe('hello');
    expect(form.get('file')).toBeInstanceOf(File);
  });

  it('reorderImages PATCHes the :reorder route with ordered_ids', async () => {
    vi.mocked(apiRequest).mockResolvedValue(undefined);
    await reorderImages('r1', ['b', 'a'], getToken);
    const [path, , opts] = vi.mocked(apiRequest).mock.calls[0];
    expect(path).toBe('/api/v1/ground-report/reports/r1/images:reorder');
    expect(JSON.parse(opts?.body as string)).toEqual({ ordered_ids: ['b', 'a'] });
  });

  it('deleteImage DELETEs the nested image route', async () => {
    vi.mocked(apiRequest).mockResolvedValue(undefined);
    await deleteImage('r1', 'i1', getToken);
    const [path, , opts] = vi.mocked(apiRequest).mock.calls[0];
    expect(path).toBe('/api/v1/ground-report/reports/r1/images/i1');
    expect(opts?.method).toBe('DELETE');
  });

  it('getMemberGroundReport GETs the :member route', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ zones: [] });
    await getMemberGroundReport(getToken);
    expect(apiRequest).toHaveBeenCalledWith('/api/v1/ground-report:member', getToken);
  });
});
