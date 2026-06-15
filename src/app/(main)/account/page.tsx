/**
 * Account landing - placeholder for a future account dashboard.
 * Rendered by the account layout as `children` when no tab is active (bare `/account`).
 */
export default function AccountPage() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
      <h1 className="font-display text-2xl text-forest">Your account</h1>
      <p className="max-w-md text-forest/70">
        A dashboard for your CGRS account is on the way. In the meantime, use the menu to view your
        profile, properties, reported issues, bookmarks, and verification.
      </p>
    </div>
  );
}
