import Card from '@/components/ui/Card';
import PageHeader from '@/components/sections/PageHeader';
import Link from 'next/link';

const LAST_UPDATED = '15 February 2026';

const DATA_COLLECTED = [
  {
    title: 'Contact Form Submissions',
    description:
      'When you submit a contact form or management request, we collect your name, email address, and the content of your message.',
  },
  {
    title: 'Account Registration',
    description:
      'If you register for an account, we collect your name, email address, and a password. Passwords are stored using industry-standard encryption.',
  },
  {
    title: 'Discussion Forum Posts',
    description:
      'When you participate in community discussions, we store your posts and display name alongside your contributions.',
  },
  {
    title: 'Event RSVPs',
    description:
      'When you respond to community events, we record your attendance preferences to help with event planning.',
  },
];

const USER_RIGHTS = [
  {
    title: 'Access Your Data',
    description: 'You can request a copy of the personal information we hold about you.',
  },
  {
    title: 'Correct Your Data',
    description:
      'You can ask us to correct any inaccurate or incomplete personal information.',
  },
  {
    title: 'Delete Your Data',
    description:
      'You can request that we delete your personal information, subject to any legal obligations we may have to retain it.',
  },
  {
    title: 'Withdraw Consent',
    description:
      'Where we rely on your consent to process data, you can withdraw that consent at any time.',
  },
];

/**
 * Privacy Policy page - server component.
 * Covers data collection, usage, storage, and user rights
 * in accordance with the New Zealand Privacy Act 2020.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Privacy Policy"
        description="How we collect, use, and protect your personal information."
        eyebrow="Legal"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      {/* Introduction */}
      <section className="section bg-bone">
        <div className="container">
          <Card className="max-w-3xl mx-auto p-8">
            <h2 className="font-display text-2xl font-medium mb-6">Our Commitment to Your Privacy</h2>
            <p className="text-lg opacity-70 mb-4">
              The Coronation Gardens Residents Society (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
              is committed to protecting the privacy of our residents and website visitors. This policy
              explains how we collect, use, store, and protect your personal information in accordance
              with the{' '}
              <a
                href="https://www.legislation.govt.nz/act/public/2020/0031/latest/LMS23223.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta hover:underline"
              >
                New Zealand Privacy Act 2020
              </a>
              .
            </p>
            <p className="text-sm opacity-50">Last updated: {LAST_UPDATED}</p>
          </Card>
        </div>
      </section>

      {/* Information We Collect */}
      <section className="section bg-sage-light">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">Information</span>
            <h2>What We Collect</h2>
            <p className="mt-4 opacity-70 max-w-xl mx-auto">
              We only collect personal information that is necessary for the operation of our
              community website and services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {DATA_COLLECTED.map((item) => (
              <Card key={item.title} className="p-6">
                <h3 className="font-display text-xl font-medium mb-3">{item.title}</h3>
                <p className="opacity-70">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How We Use Your Data */}
      <section className="section bg-bone">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">Purpose</span>
            <h2>How We Use Your Information</h2>
          </div>

          <Card className="max-w-3xl mx-auto p-8">
            <ul className="space-y-4">
              {[
                'To respond to your enquiries and management requests',
                'To manage your community account and forum participation',
                'To send you relevant community updates and event notifications',
                'To improve our website and services for residents',
                'To comply with our legal obligations under New Zealand law',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 opacity-70">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 opacity-70">
              We will never sell your personal information to third parties or use it for purposes
              beyond those described in this policy without your explicit consent.
            </p>
          </Card>
        </div>
      </section>

      {/* Data Storage & Security */}
      <section className="section bg-sage-light">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">Security</span>
            <h2>Data Storage and Security</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="font-display text-xl font-medium mb-4">Storage</h3>
              <p className="opacity-70 mb-3">
                Your data is stored securely using industry-standard hosting services. We take
                reasonable steps to ensure your information is protected from unauthorised access,
                modification, or disclosure.
              </p>
              <p className="opacity-70">
                We retain your personal information only for as long as necessary to fulfil the
                purposes for which it was collected, or as required by law.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-xl font-medium mb-4">Security Measures</h3>
              <ul className="space-y-3">
                {[
                  'HTTPS encryption for all data in transit',
                  'Encrypted password storage using secure hashing',
                  'Regular security reviews of our systems',
                  'Access controls limiting who can view personal data',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 opacity-70">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Cookies & Tracking */}
      <section className="section bg-bone">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">Cookies</span>
            <h2>Cookies and Tracking</h2>
          </div>

          <Card className="max-w-3xl mx-auto p-8">
            <p className="opacity-70 mb-4">
              Our website uses only essential cookies that are necessary for the site to function
              correctly, such as session management for logged-in users. We do not use advertising
              or marketing cookies.
            </p>
            <p className="opacity-70">
              We do not use analytics tracking services that collect personally identifiable
              information. Any future analytics would be implemented with privacy-respecting,
              cookieless solutions.
            </p>
          </Card>
        </div>
      </section>

      {/* Third-Party Services */}
      <section className="section bg-sage-light">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">Third Parties</span>
            <h2>Third-Party Services</h2>
            <p className="mt-4 opacity-70 max-w-xl mx-auto">
              Our website uses the following third-party services that may process limited data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="font-display text-xl font-medium mb-3">OpenStreetMap</h3>
              <p className="opacity-70">
                We use OpenStreetMap tiles via CARTO to display maps on our site. When you view a
                map, your browser requests tiles from CARTO&apos;s servers, which may log your IP
                address. See the{' '}
                <a
                  href="https://carto.com/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terracotta hover:underline"
                >
                  CARTO privacy policy
                </a>
                .
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-xl font-medium mb-3">Google Fonts</h3>
              <p className="opacity-70">
                We load typefaces (Fraunces and Manrope) from Google Fonts. When you visit our site,
                your browser connects to Google&apos;s servers to download font files. See{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terracotta hover:underline"
                >
                  Google&apos;s privacy policy
                </a>
                .
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-xl font-medium mb-3">Vercel</h3>
              <p className="opacity-70">
                Our website is hosted on Vercel. Vercel may collect standard web server logs
                including IP addresses and request metadata. See the{' '}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terracotta hover:underline"
                >
                  Vercel privacy policy
                </a>
                .
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="section bg-bone">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">Your Rights</span>
            <h2>Your Privacy Rights</h2>
            <p className="mt-4 opacity-70 max-w-xl mx-auto">
              Under the New Zealand Privacy Act 2020, you have the following rights regarding your
              personal information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {USER_RIGHTS.map((right) => (
              <Card key={right.title} className="p-6">
                <h3 className="font-display text-xl font-medium mb-3">{right.title}</h3>
                <p className="opacity-70">{right.description}</p>
              </Card>
            ))}
          </div>

          <Card className="max-w-3xl mx-auto mt-8 p-6">
            <p className="opacity-70">
              If you believe we have breached the Privacy Act 2020, you may lodge a complaint with
              the{' '}
              <a
                href="https://www.privacy.org.nz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta hover:underline"
              >
                Office of the Privacy Commissioner
              </a>
              .
            </p>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section className="section bg-forest-light text-bone texture-dots">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-bone mb-4">Privacy Concerns?</h2>
            <p className="text-lg opacity-80 mb-4">
              If you have any questions about this privacy policy or wish to exercise your privacy
              rights, please contact our committee.
            </p>
            <p className="text-lg opacity-80 mb-8">
              Email:{' '}
              <a
                href="mailto:cgrscommittee@gmail.com"
                className="text-terracotta hover:underline"
              >
                cgrscommittee@gmail.com
              </a>
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-lg bg-terracotta px-6 py-3 font-medium text-bone hover:bg-terracotta-dark transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
