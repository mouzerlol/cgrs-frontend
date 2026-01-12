'use client';

import { useState } from 'react';
import PageHeader from '@/components/sections/PageHeader';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';

interface Notice {
  id: string;
  title: string;
  date: string;
  category: 'committee' | 'maintenance' | 'event' | 'general';
  content: string;
  important?: boolean;
}

export default function NoticeBoardPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);

  const notices: Notice[] = [
    {
      id: '1',
      title: 'Annual General Meeting - February 2026',
      date: 'February 15, 2026',
      category: 'event',
      content: 'Join us for our annual general meeting in the community center. Refreshments will be provided. Please RSVP by February 10.',
      important: true,
    },
    {
      id: '2',
      title: 'Water Maintenance Scheduled',
      date: 'February 20, 2026',
      category: 'maintenance',
      content: 'Water maintenance will occur on February 20th from 9am-12pm. Residents may experience low water pressure during this time.',
      important: true,
    },
    {
      id: '3',
      title: 'New Recycling Guidelines',
      date: 'February 1, 2026',
      category: 'general',
      content: 'Please ensure all recyclables are placed in the correct bins. Blue bins for paper and cardboard, yellow bin for glass and plastics. No plastic bags in recycling bins.',
      important: false,
    },
    {
      id: '4',
      title: 'Community Garden Update',
      date: 'January 28, 2026',
      category: 'general',
      content: 'The community garden is looking beautiful this season! Join us for our monthly garden working bee on the first Saturday of each month at 10am. No experience necessary.',
      important: false,
    },
    {
      id: '5',
      title: 'New Resident Welcome Package',
      date: 'January 15, 2026',
      category: 'committee',
      content: 'Welcome to Coronation Gardens! As a new resident, you will receive a welcome package including a resident handbook, community guidelines, and your first month\'s utility fees are waived.',
      important: true,
    },
    {
      id: '6',
      title: 'Building Access Control Update',
      date: 'January 10, 2026',
      category: 'maintenance',
      content: 'Building access control system upgrades have been completed. Please use your resident key fob for entry. If you experience any issues with access, contact the committee.',
      important: true,
    },
  ];

  const categories = [
    { id: 'all', label: 'All Notices' },
    { id: 'committee', label: 'Committee' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'event', label: 'Events' },
    { id: 'general', label: 'General' },
  ];

  const filteredNotices = selectedCategory === 'all' 
    ? notices 
    : notices.filter(notice => notice.category === selectedCategory);

  const categoryColors: Record<string, string> = {
    committee: '#D95D39',
    maintenance: '#E91E63',
    event: '#4CAF50',
    general: '#2196F3',
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Community Notice Board"
        description="Stay informed about community updates, maintenance schedules, committee announcements, and important notices."
        eyebrow="Notice Board"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section bg-sage-light">
        <div className="container max-w-5xl mx-auto py-12">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all
                  ${selectedCategory === cat.id 
                    ? 'bg-forest text-bone shadow-lg' 
                    : 'bg-white text-forest hover:bg-sage-light shadow-md hover:-translate-y-1'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Notices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNotices.length === 0 && (
              <div className="text-center py-16">
                <Icon name="calendar" size="xl" className="text-forest/30 mb-4" />
                <h3 className="font-display text-2xl font-medium mb-2">
                  No Notices Found
                </h3>
                <p className="opacity-60 max-w-md mx-auto">
                  There are currently no notices to display in this category. Check back soon for community updates.
                </p>
              </div>
            )}
            {filteredNotices.map((notice) => (
              <Card 
                key={notice.id}
                className={`
                  p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1
                  ${notice.important ? 'border-2 border-terracotta' : 'border border-sage/30'}
                `}
                onClick={() => setExpandedNotice(
                  expandedNotice === notice.id ? null : notice.id
                )}
              >
                {/* Notice Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-medium mb-2">
                      {notice.title}
                    </h3>
                    <p className="text-sm text-forest/60">
                      {notice.date}
                    </p>
                  </div>
                  {notice.important && (
                    <Icon name="calendar" size="md" className="text-terracotta flex-shrink-0 mr-3" />
                  )}
                  <span 
                    className={`
                      text-xs uppercase tracking-wider px-3 py-1 rounded-full
                      ${notice.category === 'committee' && 'bg-terracotta text-bone'}
                      ${notice.category === 'maintenance' && 'bg-[#E91E63] text-white'}
                      ${notice.category === 'event' && 'bg-[#4CAF50] text-white'}
                      ${notice.category === 'general' && 'bg-[#2196F3] text-white'}
                      ${!notice.category && 'bg-sage/30 text-forest'}
                    `}
                  >
                    {notice.category || 'Info'}
                  </span>
                </div>

                {/* Notice Content */}
                <div className="space-y-4">
                  <p className="text-base leading-relaxed">
                    {expandedNotice === notice.id 
                      ? notice.content 
                      : `${notice.content.substring(0, 150)}...`}
                  </p>
                </div>

                {/* Expand/Collapse Indicator */}
                <div className="text-center mt-4">
                  <button className="text-sm text-forest hover:text-terracotta transition-colors">
                    {expandedNotice === notice.id ? 'Show Less' : 'Read More'}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
