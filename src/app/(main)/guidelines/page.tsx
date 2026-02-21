import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/sections/PageHeader';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Community Guidelines | Coronation Gardens',
  description:
    'Resident responsibilities, parking rules, noise policies, and community standards for Coronation Gardens in Mangere Bridge.',
};

const RESPONSIBILITIES = [
  {
    icon: '🏠',
    title: 'Property Maintenance',
    items: [
      'Keep your property clean and well-maintained',
      'Report maintenance issues promptly',
      'Follow approved exterior modification guidelines',
      'Maintain gardens and outdoor spaces',
    ],
  },
  {
    icon: '🚗',
    title: 'Parking & Vehicles',
    items: [
      'Park only in designated areas',
      'Do not block driveways or common areas',
      'Keep vehicles in good working condition',
      'Report illegal parking to the committee',
    ],
  },
  {
    icon: '🗑️',
    title: 'Waste Management',
    items: [
      'Use designated waste collection areas',
      'Follow recycling guidelines',
      'Dispose of large items properly',
      'Keep common areas clean',
    ],
  },
  {
    icon: '🔇',
    title: 'Noise & Consideration',
    items: [
      'Keep noise levels reasonable, especially at night',
      'Be considerate of neighbors during renovations',
      'Respect quiet hours (10 PM - 7 AM)',
      'Communicate with neighbors about planned activities',
    ],
  },
];

const BEHAVIORS = [
  { icon: '🤝', title: 'Respectful Conduct', desc: 'Treat all residents, visitors, and staff with respect and kindness. We value diversity and inclusivity in our community.' },
  { icon: '🛡️', title: 'Safety & Security', desc: 'Help maintain a safe environment by being aware of your surroundings and reporting any security concerns promptly.' },
  { icon: '🌱', title: 'Environmental Care', desc: 'Help protect our environment through sustainable practices, proper waste disposal, and conservation efforts.' },
];

/**
 * Guidelines page with new design system.
 */
export default function GuidelinesPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Community Guidelines"
        description="Shared values and expectations that maintain our living environment."
        eyebrow="Guidelines"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      {/* Introduction */}
      <section className="section bg-bone">
        <div className="container">
          <Card className="max-w-3xl mx-auto text-center p-8">
            <h2 className="font-display text-2xl font-medium mb-6">Welcome to Our Community</h2>
            <p className="text-lg opacity-70 mb-6">
              These guidelines are designed to ensure that Coronation Gardens remains a wonderful place
              for all residents to live, work, and enjoy. By following these guidelines, we create a
              harmonious environment where everyone can thrive.
            </p>
            <p className="opacity-60">
              These guidelines are based on our core values of mutual respect, personal accountability,
              and collaborative problem solving. They help us maintain the high standards that make
              our community special.
            </p>
          </Card>
        </div>
      </section>

      {/* Resident Responsibilities */}
      <section className="section bg-sage-light" id="parking">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">Your Role</span>
            <h2>Resident Responsibilities</h2>
            <p className="mt-4 opacity-70 max-w-xl mx-auto">
              Your role in maintaining our community standards and creating a positive living environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RESPONSIBILITIES.map((resp) => (
              <Card key={resp.title} hover className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">{resp.icon}</div>
                  <h3 className="font-display text-xl font-medium">{resp.title}</h3>
                </div>
                <ul className="space-y-3">
                  {resp.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 opacity-70">
                      <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Behavior */}
      <section className="section bg-bone" id="pets">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">How We Live</span>
            <h2>Community Behavior</h2>
            <p className="mt-4 opacity-70 max-w-xl mx-auto">
              How we interact with each other to create a supportive and inclusive community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BEHAVIORS.map((behavior) => (
              <Card key={behavior.title} hover className="text-center p-6">
                <div className="text-4xl mb-4">{behavior.icon}</div>
                <h3 className="font-display text-xl font-medium mb-4">{behavior.title}</h3>
                <p className="opacity-70">{behavior.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Procedures */}
      <section className="section bg-sage-light" id="faq">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">Need Help?</span>
            <h2>Contact Procedures</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="font-display text-xl font-medium mb-4">How to Report Issues</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-terracotta text-bone text-sm font-medium flex items-center justify-center flex-shrink-0">1</span>
                  <div>
                    <p className="font-medium">Contact the Committee</p>
                    <p className="text-sm opacity-60">Email: cgrscommittee@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-terracotta text-bone text-sm font-medium flex items-center justify-center flex-shrink-0">2</span>
                  <div>
                    <p className="font-medium">Provide Details</p>
                    <p className="text-sm opacity-60">Include location, description, and photos if applicable</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-terracotta text-bone text-sm font-medium flex items-center justify-center flex-shrink-0">3</span>
                  <div>
                    <p className="font-medium">Follow Up</p>
                    <p className="text-sm opacity-60">We'll acknowledge receipt and provide updates</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-xl font-medium mb-4">Emergency Contacts</h3>
              <div className="space-y-3">
                <div className="p-3 bg-terracotta/10 border border-terracotta/20 rounded-lg">
                  <p className="font-medium text-terracotta">Emergency Services</p>
                  <p className="text-sm opacity-70">Call 111 for police, fire, or medical emergencies</p>
                </div>
                <div className="p-3 bg-sage border border-sage rounded-lg">
                  <p className="font-medium">Urgent Maintenance</p>
                  <p className="text-sm opacity-70">Contact committee immediately for urgent issues</p>
                </div>
                <div className="p-3 bg-sage-light border border-sage rounded-lg">
                  <p className="font-medium">General Inquiries</p>
                  <p className="text-sm opacity-70">Use our contact form for non-urgent matters</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Committee Communication */}
      <section className="section bg-bone">
        <div className="container">
          <Card className="max-w-3xl mx-auto text-center p-8">
            <h2 className="font-display text-2xl font-medium mb-6">Committee Communication</h2>
            <p className="text-lg opacity-70 mb-8">
              Our committee is committed to transparent communication and collaborative problem solving.
              We encourage open dialogue and welcome your feedback.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { title: 'Regular Updates', desc: 'We provide regular updates through our newsletter and website' },
                { title: 'Meeting Participation', desc: 'Residents are welcome to attend committee meetings' },
                { title: 'Feedback Welcome', desc: 'We value your input on community matters' },
                { title: 'Quick Response', desc: 'We aim to respond to inquiries within 24-48 hours' },
              ].map((item) => (
                <div key={item.title} className="p-4 bg-sage-light rounded-lg text-left">
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm opacity-60">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" asChild>
                <Link href="/contact">Contact Committee</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/blog">Read Latest Blog</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-forest-light text-bone texture-dots">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-bone mb-4">Questions About Guidelines?</h2>
            <p className="text-lg opacity-80 mb-8">
              If you have questions about these guidelines or need clarification on any policies,
              please don't hesitate to contact our committee.
            </p>
            <Button variant="primary" size="lg" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
