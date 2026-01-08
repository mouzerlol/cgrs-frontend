'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import PageHeader from '@/components/sections/PageHeader';
import ContactForm from '@/components/forms/ContactForm';
import { ContactFormData } from '@/types';
import { EMERGENCY_CONTACT } from '@/lib/constants';
import Link from 'next/link';

// Import data
import committeeData from '@/data/committee.json';
import siteConfig from '@/data/site-config.json';

const QUICK_CONTACT_OPTIONS = [
  { title: 'Report Issues', desc: 'Maintenance, parking, or other concerns', action: 'Report' },
  { title: 'General Inquiry', desc: 'Questions about the community or services', action: 'Ask' },
  { title: 'Committee Meeting', desc: 'Request to attend or speak at meetings', action: 'Request' },
];

const FAQ_ITEMS = [
  { q: 'How do I report maintenance issues?', a: `Use the contact form or email us directly at ${siteConfig.contact.email}. Please include details about the issue and its location.` },
  { q: 'When are committee meetings held?', a: 'Committee meetings are typically held monthly. Check our news section for upcoming meeting dates and times.' },
  { q: 'How can I get involved in the community?', a: 'We welcome community involvement! Contact us to learn about volunteer opportunities and community events.' },
  { q: 'Where can I find community guidelines?', a: 'Our community guidelines are available on our dedicated guidelines page. They outline resident responsibilities and community expectations.' },
];

/**
 * Contact page with new design system.
 */
export default function ContactPage() {
  const [, setContactFormData] = useState<ContactFormData | null>(null);

  const handleFormSubmit = (data: ContactFormData) => {
    setContactFormData(data);
    console.log('Form submitted:', data);
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Contact Us"
        description="Get in touch with our committee. We're here to help and answer your questions."
        eyebrow="Get in Touch"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      {/* Contact Form and Info */}
      <section className="section bg-bone">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <ContactForm onSubmit={handleFormSubmit} />
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Primary Contact */}
              <Card className="p-6">
                <h3 className="font-display text-xl font-medium mb-6">Primary Contact</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm uppercase tracking-wider text-terracotta mb-1">Committee Email</h4>
                    <p className="opacity-70">{siteConfig.contact.email}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm uppercase tracking-wider text-terracotta mb-1">Chairperson</h4>
                    <p className="opacity-70">{siteConfig.contact.chairperson}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm uppercase tracking-wider text-terracotta mb-1">Response Time</h4>
                    <p className="opacity-70">We typically respond within 24-48 hours</p>
                  </div>
                </div>
              </Card>

              {/* Emergency Contact */}
              <div className="emergency-info p-6 rounded-[20px]">
                <Icon name="phone-emergency" size="lg" className="stroke-bone flex-shrink-0" />
                <div>
                  <strong className="text-xs font-medium tracking-wider uppercase opacity-90 text-bone block">
                    {EMERGENCY_CONTACT.label}
                  </strong>
                  <a
                    href={`tel:${EMERGENCY_CONTACT.tel}`}
                    className="font-display text-xl font-semibold text-bone hover:underline"
                  >
                    {EMERGENCY_CONTACT.phone}
                  </a>
                </div>
              </div>

              {/* Quick Contact Options */}
              <Card className="p-6">
                <h3 className="font-display text-xl font-medium mb-6">Quick Contact Options</h3>
                <div className="space-y-3">
                  {QUICK_CONTACT_OPTIONS.map((option) => (
                    <div key={option.title} className="flex items-center justify-between p-3 bg-sage-light rounded-lg">
                      <div>
                        <h4 className="font-medium">{option.title}</h4>
                        <p className="text-sm opacity-60">{option.desc}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="#form">{option.action}</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Committee Directory */}
              <Card className="p-6">
                <h3 className="font-display text-xl font-medium mb-6">Committee Directory</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border-b border-sage/20">
                    <div>
                      <h4 className="font-medium">{committeeData.chairperson.name}</h4>
                      <p className="text-sm opacity-60">{committeeData.chairperson.role}</p>
                    </div>
                    <span className="text-xs bg-terracotta text-bone px-2 py-0.5 rounded">Primary</span>
                  </div>
                  {committeeData.members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-b border-sage/20 last:border-0">
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm opacity-60">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-sage-light">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">Help</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {FAQ_ITEMS.map((item) => (
              <Card key={item.q} hover className="p-6">
                <h3 className="font-display text-lg font-medium mb-3">{item.q}</h3>
                <p className="text-sm opacity-70">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-forest-light text-bone texture-dots">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-bone mb-4">Need More Information?</h2>
            <p className="text-lg opacity-80 mb-8">
              Explore our website to learn more about our community, guidelines, and latest news.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" asChild>
                <Link href="/guidelines">Community Guidelines</Link>
              </Button>
              <Button variant="nav" size="lg" asChild>
                <Link href="/news">Latest News</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
