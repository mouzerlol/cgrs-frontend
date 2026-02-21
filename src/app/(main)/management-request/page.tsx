import { Metadata } from 'next';
import PageHeader from '@/components/sections/PageHeader';
import { ManagementRequestForm } from '@/components/management-request/ManagementRequestForm';

export const metadata: Metadata = {
  title: 'Management Request | Coronation Gardens',
  description:
    'Submit maintenance requests, report issues, or contact Coronation Gardens society management about parking, waste management, and more.',
};

/**
 * Management Request Portal page.
 * Allows residents to submit various types of requests to the body corporate committee.
 */
export default function ManagementRequestPage() {
  return (
    <div>
      <PageHeader
        title="Management Request"
        description="Submit a request or report an issue to society management"
        eyebrow="Request Portal"
        variant="compact"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section bg-bone">
        <div className="container">
          <ManagementRequestForm />
        </div>
      </section>
    </div>
  );
}
