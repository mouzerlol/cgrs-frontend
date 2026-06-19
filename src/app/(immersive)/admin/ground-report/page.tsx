'use client';

/**
 * Ground Report authoring page (managers only). One surface for:
 *  - Zone CRUD with a precinct picker fed by the frontend PRECINCTS constant.
 *  - Ground Report CRUD: zone + period-type toggle + calendar date (server resolves
 *    the week/month range) + archive/reactivate + soft-delete.
 *  - Image upload with the device→EXIF→manual-pin capture chain (a pin is required
 *    before save), drag-reorder, per-image captions, and an at-a-glance pin map.
 *
 * Visual register: the "operations room" management identity. Bone canvas, square
 * corners throughout, labelled destructive actions gated behind a confirm, and
 * toast feedback on every mutation.
 */

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Reorder } from 'framer-motion';
import {
  Archive,
  ImageIcon,
  ImagePlus,
  Images,
  MapPin,
  MapPinned,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import ConfirmActionModal from '@/components/work-management/ConfirmActionModal';
import ImageCaptureCard, { type PendingImage } from '@/components/ground-report/ImageCaptureCard';
import ReportLocationMap from '@/components/ground-report/ReportLocationMap';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { canAccessManagement } from '@/lib/auth';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/sonner';
import { cn } from '@/lib/utils';
import { PRECINCTS } from '@/data/map-data';
import {
  ALLOWED_IMAGE_CONTENT_TYPES,
  MAX_IMAGE_UPLOAD_BYTES,
} from '@/lib/api/groundReport';
import { getDeviceLocation, type CapturedCoord } from '@/lib/ground-report/capture';
import {
  useCreateReport,
  useCreateZone,
  useDeleteImage,
  useDeleteReport,
  useDeleteZone,
  useImagesQuery,
  useReorderImages,
  useReportsQuery,
  useUpdateReport,
  useUpdateZone,
  useUploadImage,
  useZonesQuery,
} from '@/hooks/useGroundReport';
import type {
  GroundReportCoordSource,
  GroundReportImageResponse,
  GroundReportPeriodType,
  GroundReportResponse,
  ZoneResponse,
} from '@/types/ground-report';

// ---- shared styling ---------------------------------------------------------

const inputClass =
  'w-full rounded-none border border-sage/40 bg-white px-3 py-2 text-sm text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest';
const labelClass = 'block text-xs font-semibold uppercase tracking-[0.15em] text-forest/50';
const panelClass = 'border border-sage/30 bg-white';
const sq = 'rounded-none';

const SOURCE_LABEL: Record<GroundReportCoordSource, string> = {
  device: 'Device GPS',
  exif: 'Photo EXIF',
  manual: 'Manual pin',
};

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

function preCheckImage(file: File): string | null {
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) return 'Image is larger than 30 MB.';
  if (file.type && !ALLOWED_IMAGE_CONTENT_TYPES.includes(file.type as never)) {
    return 'Only JPEG or PNG images are allowed.';
  }
  return null;
}

function formatPeriod(r: GroundReportResponse): string {
  const start = new Date(r.period_start);
  if (r.period_type === 'month') {
    return start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
  const end = new Date(r.period_end);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return `Week of ${fmt(start)} to ${fmt(end)}`;
}

// ---- small primitives -------------------------------------------------------

/** Live / archived pill. Amber == live on the management side (Amber Promotion Rule). */
function VisibilityBadge({ visibility }: { visibility: 'active' | 'archived' }) {
  const live = visibility === 'active';
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-none px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]',
        live ? 'bg-amber/20 text-amber-dark' : 'bg-forest/10 text-forest/60',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', live ? 'bg-amber-dark' : 'bg-forest/40')} />
      {live ? 'Live' : 'Archived'}
    </span>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-none bg-sage/15 px-2 py-0.5 font-mono text-[11px] text-forest/70">
      {children}
    </span>
  );
}

/** Square icon-only action button for dense rails. */
function IconAction({
  label,
  onClick,
  tone = 'default',
  children,
}: {
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-none border transition-colors',
        tone === 'danger'
          ? 'border-sage/40 text-forest/60 hover:border-terracotta hover:bg-terracotta hover:text-bone'
          : 'border-sage/40 text-forest/70 hover:border-forest hover:bg-forest hover:text-bone',
      )}
    >
      {children}
    </button>
  );
}

// ---- confirm plumbing -------------------------------------------------------

interface ConfirmRequest {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
}
type RequestConfirm = (req: ConfirmRequest) => void;

// ---- zone editor ------------------------------------------------------------

function ZoneModal({ zone, onClose }: { zone: ZoneResponse | null; onClose: () => void }) {
  const create = useCreateZone();
  const update = useUpdateZone();
  const [label, setLabel] = useState(zone?.label ?? '');
  const [keys, setKeys] = useState<string[]>(zone?.precinct_keys ?? []);
  const [error, setError] = useState<string | null>(null);
  const saving = create.isPending || update.isPending;

  const toggleKey = (id: string) =>
    setKeys((prev) => (prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]));

  const handleSave = async () => {
    setError(null);
    if (!label.trim()) {
      setError('A label is required.');
      return;
    }
    try {
      if (zone) {
        await update.mutateAsync({ zoneId: zone.id, body: { label: label.trim(), precinct_keys: keys } });
        toast.success('Zone updated');
      } else {
        await create.mutateAsync({ label: label.trim(), precinct_keys: keys });
        toast.success('Zone created');
      }
      onClose();
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save the zone.'));
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={zone ? 'Edit zone' : 'New zone'} size="lg" className={sq}>
      <div className="space-y-5">
        <div>
          <label className={cn(labelClass, 'mb-1.5')} htmlFor="zone-label">
            Label
          </label>
          <input
            id="zone-label"
            className={inputClass}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. North Slope"
            data-testid="zone-label-input"
            autoFocus
          />
        </div>
        <div>
          <p className={cn(labelClass, 'mb-2')}>
            Precincts <span className="font-mono lowercase tracking-normal text-forest/40">· {keys.length} selected</span>
          </p>
          <div className="grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
            {PRECINCTS.map((p) => {
              const on = keys.includes(p.id);
              return (
                <label
                  key={p.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-none border px-2.5 py-2 text-sm transition-colors',
                    on ? 'border-forest bg-forest/5 text-forest' : 'border-sage/30 text-forest/70 hover:border-sage',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleKey(p.id)}
                    data-testid={`precinct-${p.id}`}
                    className="accent-forest"
                  />
                  {p.name}
                </label>
              );
            })}
          </div>
        </div>
        {error ? <p className="text-sm text-terracotta">{error}</p> : null}
        <div className="flex justify-end gap-2 border-t border-sage/20 pt-4">
          <Button variant="outline" className={sq} onClick={onClose}>
            Cancel
          </Button>
          <Button className={sq} onClick={handleSave} disabled={saving} data-testid="zone-save">
            {saving ? 'Saving…' : 'Save zone'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ---- report editor ----------------------------------------------------------

function ReportModal({ zoneId, onClose }: { zoneId: string; onClose: () => void }) {
  const create = useCreateReport();
  const [periodType, setPeriodType] = useState<GroundReportPeriodType>('week');
  const [pickedDate, setPickedDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    if (!pickedDate) {
      setError('Pick a date.');
      return;
    }
    try {
      await create.mutateAsync({ zone_id: zoneId, period_type: periodType, picked_date: pickedDate });
      toast.success('Report created');
      onClose();
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not create the report.'));
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="New ground report" size="md" className={sq}>
      <div className="space-y-5">
        <div>
          <p className={cn(labelClass, 'mb-2')}>Period</p>
          <div className="grid grid-cols-2 gap-0 border border-sage/40" role="radiogroup" aria-label="Period type">
            {(['week', 'month'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={periodType === t}
                onClick={() => setPeriodType(t)}
                data-testid={`period-${t}`}
                className={cn(
                  'px-3 py-2.5 text-sm font-medium capitalize transition-colors',
                  periodType === t ? 'bg-forest text-bone' : 'bg-white text-forest/70 hover:bg-sage/10',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={cn(labelClass, 'mb-1.5')} htmlFor="report-date">
            {periodType === 'week' ? 'Any day in the week' : 'Any day in the month'}
          </label>
          <input
            id="report-date"
            type="date"
            className={inputClass}
            value={pickedDate}
            onChange={(e) => setPickedDate(e.target.value)}
            data-testid="report-date"
          />
          <p className="mt-1.5 text-xs text-forest/50">The server snaps this to the full {periodType}.</p>
        </div>
        {error ? <p className="text-sm text-terracotta">{error}</p> : null}
        <div className="flex justify-end gap-2 border-t border-sage/20 pt-4">
          <Button variant="outline" className={sq} onClick={onClose}>
            Cancel
          </Button>
          <Button className={sq} onClick={handleSave} disabled={create.isPending} data-testid="report-save">
            {create.isPending ? 'Creating…' : 'Create report'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ---- image upload modal -----------------------------------------------------

function UploadImagesModal({ report, onClose }: { report: GroundReportResponse; onClose: () => void }) {
  const upload = useUploadImage();
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [batchDevice, setBatchDevice] = useState<CapturedCoord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: PendingImage[] = [];
    for (const file of Array.from(files)) {
      const issue = preCheckImage(file);
      if (issue) {
        setError(issue);
        continue;
      }
      next.push({ file, caption: '', coord: null, coordSource: 'manual' });
    }
    setPending((prev) => [...prev, ...next]);
  };

  const updateAt = (index: number, value: PendingImage) =>
    setPending((prev) => prev.map((p, i) => (i === index ? value : p)));
  const removeAt = (index: number) => setPending((prev) => prev.filter((_, i) => i !== index));

  const locatedCount = pending.filter((p) => p.coord != null).length;
  const allReady = pending.length > 0 && locatedCount === pending.length;

  const captureBatch = async () => {
    const coord = await getDeviceLocation();
    if (coord) setBatchDevice(coord);
    else setError('Device location unavailable — drop pins manually.');
  };

  const handleSave = async () => {
    if (!allReady) {
      setError('Every image needs a location pin before saving.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      for (const p of pending) {
        await upload.mutateAsync({
          reportId: report.id,
          file: p.file,
          lat: p.coord!.lat,
          lng: p.coord!.lng,
          coordSource: p.coordSource,
          accuracyM: p.accuracyM ?? null,
          caption: p.caption || null,
        });
      }
      toast.success(`${pending.length} photo${pending.length === 1 ? '' : 's'} uploaded`);
      onClose();
    } catch (e) {
      setError(apiErrorMessage(e, 'Some images failed to upload.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Add photos" size="xl" className={sq}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-none border border-forest bg-forest/5 px-3 py-2 text-sm font-medium text-forest transition-colors hover:bg-forest hover:text-bone">
            <ImagePlus className="h-4 w-4" /> Choose photos
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
              data-testid="image-file-input"
            />
          </label>
          <Button variant="outline" className={sq} onClick={captureBatch} type="button" data-testid="batch-gps">
            <MapPin className="mr-1.5 h-4 w-4" /> Use my location for all
          </Button>
        </div>

        {pending.length === 0 ? (
          <div className="border border-dashed border-sage/40 bg-bone-light px-4 py-10 text-center">
            <Images className="mx-auto mb-2 h-7 w-7 text-forest/30" aria-hidden="true" />
            <p className="text-sm text-forest/60">JPEG or PNG, up to 30 MB each.</p>
            <p className="mt-0.5 text-xs text-forest/40">Each photo needs a location before it can be saved.</p>
          </div>
        ) : (
          <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
            {pending.map((p, i) => (
              <ImageCaptureCard
                key={`${p.file.name}-${i}`}
                pending={p}
                index={i}
                batchDevice={batchDevice}
                onChange={updateAt}
                onRemove={removeAt}
              />
            ))}
          </div>
        )}

        {error ? <p className="text-sm text-terracotta">{error}</p> : null}
        <div className="flex items-center justify-between border-t border-sage/20 pt-4">
          <span className="font-mono text-xs text-forest/50" data-testid="ready-count">
            {locatedCount}/{pending.length} located
          </span>
          <div className="flex gap-2">
            <Button variant="outline" className={sq} onClick={onClose}>
              Cancel
            </Button>
            <Button className={sq} onClick={handleSave} disabled={!allReady || busy} data-testid="upload-save">
              {busy ? 'Uploading…' : `Upload ${pending.length || ''} photo${pending.length === 1 ? '' : 's'}`.trim()}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ---- photo tile -------------------------------------------------------------

function PhotoTile({
  img,
  index,
  onHover,
  onDelete,
}: {
  img: GroundReportImageResponse;
  index: number;
  onHover: (i: number | null) => void;
  onDelete: () => void;
}) {
  return (
    <Reorder.Item
      value={img}
      className="group relative h-[150px] w-[150px] shrink-0 cursor-grab overflow-hidden border border-sage/30 bg-sage/10 active:cursor-grabbing"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      whileDrag={{ scale: 1.04, zIndex: 30 }}
    >
      {img.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img.url}
          alt={img.caption || `Ground report photo ${index + 1}`}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center text-forest/40">
          <ImageIcon className="h-5 w-5" aria-hidden="true" />
          <span className="font-mono text-[10px]">{img.lat.toFixed(4)}, {img.lng.toFixed(4)}</span>
        </div>
      )}

      {/* order index, matches the map markers */}
      <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center bg-forest/85 font-mono text-[11px] font-semibold text-bone">
        {index + 1}
      </span>

      {/* delete */}
      <button
        type="button"
        aria-label={`Delete photo ${index + 1}`}
        onClick={onDelete}
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center bg-bone/90 text-forest/70 opacity-0 transition-opacity hover:bg-terracotta hover:text-bone group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {/* caption + source */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/85 to-transparent px-2 pb-1.5 pt-6">
        <p className="truncate text-[11px] font-medium text-bone">
          {img.caption || <span className="text-bone/60">No caption</span>}
        </p>
        <p className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide text-bone/70">
          <MapPin className="h-2.5 w-2.5" /> {SOURCE_LABEL[img.coord_source]}
        </p>
      </div>
    </Reorder.Item>
  );
}

// ---- report card ------------------------------------------------------------

function ReportCard({
  report,
  onAddPhotos,
  onToggle,
  onDelete,
  requestConfirm,
}: {
  report: GroundReportResponse;
  onAddPhotos: () => void;
  onToggle: () => void;
  onDelete: () => void;
  requestConfirm: RequestConfirm;
}) {
  const { data } = useImagesQuery(report.id);
  const reorder = useReorderImages();
  const del = useDeleteImage();
  const images = useMemo(() => data?.items ?? [], [data]);
  const [order, setOrder] = useState<GroundReportImageResponse[]>([]);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => setOrder(images), [images]);

  const points = order.map((o) => ({ id: o.id, lat: o.lat, lng: o.lng, label: o.caption }));
  const live = report.visibility === 'active';

  const confirmDeleteImage = (img: GroundReportImageResponse, idx: number) =>
    requestConfirm({
      title: 'Delete photo',
      message: `Remove photo ${idx + 1}${img.caption ? ` ("${img.caption}")` : ''}? This cannot be undone.`,
      confirmLabel: 'Delete photo',
      onConfirm: async () => {
        try {
          await del.mutateAsync({ reportId: report.id, imageId: img.id });
          toast.success('Photo deleted');
        } catch (e) {
          toast.error(apiErrorMessage(e, 'Could not delete the photo.'));
        }
      },
    });

  return (
    <div className={panelClass} data-testid={`report-${report.id}`}>
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sage/30 bg-bone-light px-4 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-display text-base text-forest">{formatPeriod(report)}</span>
          <VisibilityBadge visibility={report.visibility} />
          <MetaChip>{report.period_type}</MetaChip>
          <MetaChip>
            <Images className="h-3 w-3" /> {images.length}
          </MetaChip>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" className={sq} onClick={onAddPhotos} data-testid={`add-photos-${report.id}`}>
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Add photos
          </Button>
          <Button size="sm" variant="ghost" className={sq} onClick={onToggle} data-testid={`toggle-report-${report.id}`}>
            {live ? <Archive className="mr-1.5 h-3.5 w-3.5" /> : <RotateCcw className="mr-1.5 h-3.5 w-3.5" />}
            {live ? 'Archive' : 'Restore'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(sq, 'text-terracotta hover:bg-terracotta hover:text-bone')}
            onClick={onDelete}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* body */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
          <ImageIcon className="h-6 w-6 text-forest/25" aria-hidden="true" />
          <p className="text-sm text-forest/50">No photos yet.</p>
          <Button size="sm" variant="outline" className={sq} onClick={onAddPhotos}>
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Add the first photo
          </Button>
        </div>
      ) : (
        <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs text-forest/45">
              <span className="font-semibold uppercase tracking-[0.15em]">Photos</span>
              <span className="font-mono">· drag to reorder the reel</span>
            </p>
            <Reorder.Group
              axis="x"
              values={order}
              onReorder={setOrder}
              className="flex gap-2 overflow-x-auto pb-2"
              data-testid="image-strip"
            >
              {order.map((img, i) => (
                <PhotoTile
                  key={img.id}
                  img={img}
                  index={i}
                  onHover={setHover}
                  onDelete={() => confirmDeleteImage(img, i)}
                />
              ))}
            </Reorder.Group>
            <button
              type="button"
              onClick={() => reorder.mutate({ reportId: report.id, orderedIds: order.map((o) => o.id) })}
              className="mt-1 font-mono text-[11px] text-forest/40 underline-offset-2 hover:text-forest hover:underline"
            >
              Save order
            </button>
          </div>
          <div className="border-t border-sage/30 lg:border-l lg:border-t-0">
            <ReportLocationMap points={points} activeIndex={hover} className="h-full min-h-[260px]" />
          </div>
        </div>
      )}
    </div>
  );
}

// ---- reports panel ----------------------------------------------------------

function ReportsPanel({ zone, requestConfirm }: { zone: ZoneResponse; requestConfirm: RequestConfirm }) {
  const { data } = useReportsQuery(zone.id);
  const updateReport = useUpdateReport();
  const deleteReport = useDeleteReport();
  const [creating, setCreating] = useState(false);
  const [uploadingTo, setUploadingTo] = useState<GroundReportResponse | null>(null);
  const reports = data?.items ?? [];

  const toggle = async (r: GroundReportResponse) => {
    const next = r.visibility === 'active' ? 'archived' : 'active';
    try {
      await updateReport.mutateAsync({ reportId: r.id, body: { visibility: next } });
      toast.success(next === 'active' ? 'Report is live to members' : 'Report archived');
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Could not update the report.'));
    }
  };

  const confirmDelete = (r: GroundReportResponse) =>
    requestConfirm({
      title: 'Delete report',
      message: `Delete the ${formatPeriod(r)} report for ${zone.label}? Its photos are removed too. This cannot be undone.`,
      confirmLabel: 'Delete report',
      onConfirm: async () => {
        try {
          await deleteReport.mutateAsync({ reportId: r.id, zoneId: zone.id });
          toast.success('Report deleted');
        } catch (e) {
          toast.error(apiErrorMessage(e, 'Could not delete the report.'));
        }
      },
    });

  return (
    <div className={cn(panelClass, 'min-w-0')}>
      <div className="flex items-center justify-between border-b border-sage/30 bg-bone-light px-4 py-3">
        <div className="min-w-0">
          <p className={labelClass}>Reports</p>
          <h2 className="truncate font-display text-lg text-forest">{zone.label}</h2>
        </div>
        <Button size="sm" className={sq} onClick={() => setCreating(true)} data-testid="new-report">
          <Plus className="mr-1.5 h-4 w-4" /> New report
        </Button>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={<MapPinned className="h-7 w-7 text-forest" aria-hidden="true" />}
          title="No reports yet"
          description="Create a weekly or monthly report for this zone, then add located photos to it."
          action={
            <Button className={sq} onClick={() => setCreating(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> New report
            </Button>
          }
        />
      ) : (
        <div className="space-y-4 p-4">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              requestConfirm={requestConfirm}
              onAddPhotos={() => setUploadingTo(r)}
              onToggle={() => toggle(r)}
              onDelete={() => confirmDelete(r)}
            />
          ))}
        </div>
      )}

      {creating ? <ReportModal zoneId={zone.id} onClose={() => setCreating(false)} /> : null}
      {uploadingTo ? <UploadImagesModal report={uploadingTo} onClose={() => setUploadingTo(null)} /> : null}
    </div>
  );
}

// ---- zones rail -------------------------------------------------------------

function ZonesRail({
  zones,
  selectedId,
  onSelect,
  onNew,
  onEdit,
  onToggle,
  onDelete,
}: {
  zones: ZoneResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onEdit: (z: ZoneResponse) => void;
  onToggle: (z: ZoneResponse) => void;
  onDelete: (z: ZoneResponse) => void;
}) {
  return (
    <div className={cn(panelClass, 'flex h-full flex-col')}>
      <div className="flex items-center justify-between border-b border-sage/30 bg-bone-light px-4 py-3">
        <p className={labelClass}>Zones · {zones.length}</p>
        <Button size="sm" className={sq} onClick={onNew} data-testid="new-zone">
          <Plus className="mr-1 h-4 w-4" /> Zone
        </Button>
      </div>
      <ul className="flex-1 divide-y divide-sage/20 overflow-y-auto">
        {zones.map((z) => {
          const active = selectedId === z.id;
          return (
            <li key={z.id} data-testid={`zone-${z.id}`} className={cn(active ? 'bg-forest/5' : '')}>
              <button
                type="button"
                className="block w-full px-4 py-3 text-left"
                onClick={() => onSelect(z.id)}
                aria-current={active}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className={cn('truncate text-sm font-medium', active ? 'text-forest' : 'text-forest/80')}>
                    {z.label}
                  </span>
                  <VisibilityBadge visibility={z.visibility} />
                </span>
                <span className="mt-1 block font-mono text-[11px] text-forest/45">
                  {z.precinct_keys.length} precinct{z.precinct_keys.length === 1 ? '' : 's'}
                </span>
              </button>
              <div className="flex gap-1.5 px-4 pb-3">
                <IconAction label="Edit zone" onClick={() => onEdit(z)}>
                  <Pencil className="h-3.5 w-3.5" />
                </IconAction>
                <IconAction
                  label={z.visibility === 'active' ? 'Archive zone' : 'Restore zone'}
                  onClick={() => onToggle(z)}
                >
                  {z.visibility === 'active' ? <Archive className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                </IconAction>
                <IconAction label="Delete zone" tone="danger" onClick={() => onDelete(z)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </IconAction>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---- page -------------------------------------------------------------------

export default function AdminGroundReportPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const isSuperadmin = currentUser?.is_superadmin ?? false;
  const canManage = canAccessManagement(currentUser?.membership?.role, isSuperadmin);

  const { data: zoneData, isLoading } = useZonesQuery(canManage);
  const deleteZone = useDeleteZone();
  const updateZone = useUpdateZone();
  const [editingZone, setEditingZone] = useState<ZoneResponse | null>(null);
  const [creatingZone, setCreatingZone] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  const requestConfirm: RequestConfirm = (req) => setConfirm(req);

  const zones = useMemo(() => zoneData?.items ?? [], [zoneData]);
  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;

  // Default to the first zone so the working surface is never empty on arrival.
  useEffect(() => {
    if (!selectedZoneId && zones.length > 0) setSelectedZoneId(zones[0].id);
  }, [zones, selectedZoneId]);

  const toggleZone = async (z: ZoneResponse) => {
    const next = z.visibility === 'active' ? 'archived' : 'active';
    try {
      await updateZone.mutateAsync({ zoneId: z.id, body: { visibility: next } });
      toast.success(next === 'active' ? 'Zone restored' : 'Zone archived');
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Could not update the zone.'));
    }
  };

  const confirmDeleteZone = (z: ZoneResponse) =>
    requestConfirm({
      title: 'Delete zone',
      message: `Delete "${z.label}" and all of its reports and photos? This cannot be undone.`,
      confirmLabel: 'Delete zone',
      onConfirm: async () => {
        try {
          await deleteZone.mutateAsync(z.id);
          if (selectedZoneId === z.id) setSelectedZoneId(null);
          toast.success('Zone deleted');
        } catch (e) {
          toast.error(apiErrorMessage(e, 'Could not delete the zone.'));
        }
      },
    });

  const renderBody = () => {
    if (!isLoaded || isUserLoading || isLoading) {
      return (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className={cn(panelClass, 'h-72 animate-pulse bg-sage/5')} />
          <div className={cn(panelClass, 'h-72 animate-pulse bg-sage/5')} />
        </div>
      );
    }
    if (!isSignedIn || !canManage) {
      return (
        <div className={cn(panelClass, 'p-8 text-center')}>
          <p className="mx-auto max-w-md text-forest/70">
            You don&apos;t have permission to manage ground reports. This is available to committee
            members, the chairperson, and the society manager.
          </p>
        </div>
      );
    }
    if (zones.length === 0) {
      return (
        <div className={panelClass}>
          <EmptyState
            icon={<MapPinned className="h-7 w-7 text-forest" aria-hidden="true" />}
            title="No zones yet"
            description="Create a zone (a group of precincts), then add a weekly or monthly photo report for it."
            action={
              <Button className={sq} onClick={() => setCreatingZone(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> New zone
              </Button>
            }
          />
        </div>
      );
    }
    return (
      <div className="grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        <ZonesRail
          zones={zones}
          selectedId={selectedZoneId}
          onSelect={setSelectedZoneId}
          onNew={() => setCreatingZone(true)}
          onEdit={setEditingZone}
          onToggle={toggleZone}
          onDelete={confirmDeleteZone}
        />
        {selectedZone ? (
          <ReportsPanel zone={selectedZone} requestConfirm={requestConfirm} />
        ) : (
          <div className={cn(panelClass, 'flex items-center justify-center p-12 text-sm text-forest/50')}>
            Select a zone to manage its reports.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-bone">
      <WorkManagementNavBar
        title="Ground Report"
        showBackButton
        backHref="/admin"
        backLabel="Administration"
      />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6 md:p-8 lg:p-10">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-forest text-bone">
              <MapPinned className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">Ground report</p>
              <h1 className="font-display text-2xl text-forest">Location-tagged photo reports</h1>
              <p className="mt-0.5 text-sm text-forest/60">
                Build the weekly and monthly photo reel members see, organised by zone.
              </p>
            </div>
          </div>
          {renderBody()}
        </div>
      </main>

      {creatingZone ? <ZoneModal zone={null} onClose={() => setCreatingZone(false)} /> : null}
      {editingZone ? <ZoneModal zone={editingZone} onClose={() => setEditingZone(null)} /> : null}

      <ConfirmActionModal
        isOpen={confirm != null}
        onClose={() => setConfirm(null)}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel ?? 'Confirm'}
        intent="danger"
        onConfirm={async () => {
          await confirm?.onConfirm();
        }}
      />
    </div>
  );
}
