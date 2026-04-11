import { Metadata } from 'next';
import PageHeader from '@/components/sections/PageHeader';
import { DirectoryContent } from './DirectoryContent';

export const metadata: Metadata = {
  title: 'Member Directory | Coronation Gardens',
  description: 'View members of the Coronation Gardens community',
};

/**
 * Member Directory page.
 * Displays community members with roles (requires viewMemberDirectory capability).
 */
export default function DirectoryPage() {
  return (
    <div>
      <PageHeader
        title="Member Directory"
        description="View members of our community"
        eyebrow="Directory"
        eyebrowIconKey="users"
        variant="compact"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section bg-bone">
        <div className="container">
          <DirectoryContent />
        </div>
      </section>
    </div>
  );
}
