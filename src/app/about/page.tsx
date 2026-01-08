import { CommitteeMember } from '@/types';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/sections/PageHeader';
import Link from 'next/link';

// Import data
import committeeData from '@/data/committee.json';
import siteConfig from '@/data/site-config.json';

/**
 * About page with new design system.
 */
export default function AboutPage() {
  const committee = committeeData as { chairperson: CommitteeMember; members: CommitteeMember[] };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="About Coronation Gardens"
        description="Learn about our community, mission, and the dedicated committee that serves our residents."
        eyebrow="About Us"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      {/* Mission Section */}
      <section className="section bg-bone">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-eyebrow block mb-4">Our Mission</span>
            <p className="text-xl leading-relaxed opacity-80 mb-12">
              {siteConfig.mission}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {siteConfig.values.slice(0, 6).map((value, index) => (
                <Card key={index} hover className="p-4 text-center">
                  <h3 className="text-lg font-display font-medium">{value}</h3>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {siteConfig.values.slice(6).map((value, index) => (
                <Card key={index + 6} hover className="p-4 text-center">
                  <h3 className="text-lg font-display font-medium">{value}</h3>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Committee Section */}
      <section className="section bg-sage-light">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-eyebrow block mb-4">Leadership</span>
            <h2>Our Committee</h2>
            <p className="mt-4 text-lg opacity-70 max-w-2xl mx-auto">
              Meet the dedicated volunteers who work to maintain our exceptional community.
            </p>
          </div>

          {/* Chairperson */}
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="text-center p-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-sage rounded-full flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="font-display text-2xl font-medium mb-2">
                {committee.chairperson.name}
              </h3>
              <p className="text-terracotta font-semibold mb-4">
                {committee.chairperson.role}
              </p>
              <p className="opacity-70 mb-4 max-w-lg mx-auto">
                {committee.chairperson.bio}
              </p>
              <p className="text-sm opacity-50">
                {committee.chairperson.email}
              </p>
            </Card>
          </div>

          {/* Committee Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {committee.members.map((member, index) => (
              <Card key={index} hover className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-sage-light rounded-full flex items-center justify-center border border-sage">
                  <span className="text-xl">👤</span>
                </div>
                <h3 className="font-display text-xl font-medium mb-2">
                  {member.name}
                </h3>
                <p className="text-terracotta font-medium text-sm mb-3">
                  {member.role}
                </p>
                <p className="text-sm opacity-70">
                  {member.bio}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="section bg-bone">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-eyebrow block mb-4">Our Home</span>
              <h2>Our Community</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card hover className="p-6">
                <h3 className="font-display text-xl font-medium mb-4">Location</h3>
                <p className="opacity-70 mb-4">
                  Coronation Gardens is located in the beautiful Māngere Bridge area of Auckland,
                  offering residents easy access to the city while maintaining a peaceful,
                  community-focused environment.
                </p>
                <ul className="space-y-2 opacity-70">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    Close to Auckland CBD
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    Excellent transport links
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    Beautiful natural surroundings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    Family-friendly environment
                  </li>
                </ul>
              </Card>

              <Card hover className="p-6">
                <h3 className="font-display text-xl font-medium mb-4">Development</h3>
                <p className="opacity-70 mb-4">
                  Our 300-property development features modern townhouses designed with
                  community living in mind, creating a harmonious environment for all residents.
                </p>
                <ul className="space-y-2 opacity-70">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    300 modern townhouses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    Well-maintained common areas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    Community facilities
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    Sustainable living practices
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-forest-light text-bone texture-dots">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-bone mb-4">Get in Touch</h2>
            <p className="text-lg opacity-80 mb-8">
              Have questions about our community or want to learn more?
              We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" asChild>
                <Link href="/contact">Contact Committee</Link>
              </Button>
              <Button variant="nav" size="lg" asChild>
                <Link href="/news">Read Latest News</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
