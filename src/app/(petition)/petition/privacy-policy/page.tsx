import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Coronation Gardens Residents Society Petition',
  description: 'Privacy policy for the Coronation Gardens Residents Society petition.',
};

export default function PetitionPrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <Link
        href="/petition"
        className="font-body text-sm text-forest/60 hover:text-forest mb-6 inline-block"
      >
        ← Back to petition
      </Link>

      <h1 className="font-display text-3xl font-semibold text-forest mb-2">Privacy Policy</h1>
      <p className="font-body text-sm text-forest/60 mb-8">
        Coronation Gardens Residents Society — Petition to Replace Oaks Property
      </p>

      <div className="space-y-8 font-body text-forest">

        <section>
          <h2 className="font-display text-lg font-semibold mb-3">1. Identity of Collector</h2>
          <p className="leading-relaxed">
            This petition is organised by the Coronation Gardens Residents Society Committee
            (&ldquo;the Committee&rdquo;), acting on behalf of owners and tenants at Coronation
            Garden. The Committee can be contacted via the CGRS website at{' '}
            <Link href="/" className="underline hover:text-forest/80">cgrs.co.nz</Link>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-3">2. Purpose of Collection</h2>
          <p className="leading-relaxed">
            We are collecting signatures to present to the Coronation Gardens Residents Society at
            an Extraordinary General Meeting, with the purpose of initiating a formal review and
            replacement of our current property manager, Oaks Property. Your information will be
            used only in connection with this petition and related updates about its outcome. It
            will not be used for any other purpose.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-3">3. What Is Collected</h2>
          <p className="leading-relaxed">We collect the following personal information:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>First name and last name</li>
            <li>Email address</li>
            <li>Whether you are a tenant or property owner</li>
            <li>Property address (optional)</li>
          </ul>
          <p className="leading-relaxed mt-3">
            We also record your IP address for the purpose of fraud detection and to verify the
            authenticity of signatures.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-3">4. Legal Basis</h2>
          <p className="leading-relaxed">
            This petition collects and holds personal information in accordance with the New
            Zealand Privacy Act 2020 and its Information Privacy Principles (IPPs), including IPP
            1 (purpose of collection), IPP 3 (collection from individuals), IPP 5 (storage and
            security), IPP 9 (retention), and IPP 11 (limits on disclosure).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-3">5. Data Retention</h2>
          <p className="leading-relaxed">
            Your personal information will be retained only for as long as is necessary for the
            purpose of this petition. Once the petition has been formally delivered and the matter
            of property management has been resolved, all personal data collected through this
            petition will be securely deleted.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-3">6. Non-Disclosure</h2>
          <p className="leading-relaxed">
            Your email address and full personal details will <strong>not</strong> be shared with
            Oaks Property, any incoming property management company, or any other third party. The
            petition will be presented to the residents&rsquo; society showing names and unit
            numbers only, as required to demonstrate community support. No email list will be
            transferred or sold.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-3">7. Security</h2>
          <p className="leading-relaxed">
            Signature data is stored securely in an encrypted database with access restricted to
            the Committee. We use Cloudflare Turnstile to protect the petition form from automated
            abuse. Only authorised Committee members can access the full list of signatures.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-3">8. Your Rights</h2>
          <p className="leading-relaxed">
            Under the Privacy Act 2020, you have the right to access and correct personal
            information we hold about you. If you wish to access or correct your information, or
            withdraw your signature, please contact the Committee through the CGRS website. We
            will respond within a reasonable time.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-3">9. Updates and Communications</h2>
          <p className="leading-relaxed">
            We may use your email address to send you updates directly related to this petition
            — for example, to notify you when the petition has been formally submitted or when the
            matter has been resolved. We will not send you commercial messages or use your email
            for any unrelated purpose.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-3">10. Privacy Commissioner</h2>
          <p className="leading-relaxed">
            If you have concerns about how your information has been handled, you may contact the
            Office of the Privacy Commissioner:
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <strong>Phone:</strong>{' '}
              <a href="tel:0800803909" className="underline hover:text-forest/80">
                0800 803 909
              </a>
            </li>
            <li>
              <strong>Website:</strong>{' '}
              <a
                href="https://www.privacy.org.nz"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-forest/80"
              >
                www.privacy.org.nz
              </a>
            </li>
          </ul>
        </section>

        <section className="bg-forest/5 border border-forest/10 rounded-lg p-4">
          <h2 className="font-display text-lg font-semibold mb-3">11. Legal Disclaimer</h2>
          <p className="leading-relaxed text-sm">
            This privacy policy has been prepared in good faith based on current New Zealand
            legislation. It does not constitute legal advice. If you have concerns about your
            privacy rights in connection with this petition, we recommend consulting a{' '}
            <a
              href="https://www.communitylawcentre.org.nz"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-forest/80"
            >
              Community Law Centre
            </a>{' '}
            (free legal advice available throughout New Zealand) or contacting the Privacy
            Commissioner directly.
          </p>
        </section>

      </div>

      <Link
        href="/petition"
        className="font-body text-sm text-forest/60 hover:text-forest mt-8 inline-block"
      >
        ← Back to petition
      </Link>
    </div>
  );
}
