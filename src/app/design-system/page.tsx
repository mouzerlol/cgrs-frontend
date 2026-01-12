'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardImageWrapper } from '@/components/ui/Card';
import Icon, { IconName } from '@/components/ui/Icon';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { CalendarCardSkeleton } from '@/components/ui/CalendarCardSkeleton';
import { EventCardSkeleton } from '@/components/ui/EventCardSkeleton';
import { NewsCardSkeleton } from '@/components/ui/NewsCardSkeleton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import Hero from '@/components/sections/Hero';
import PageHeader from '@/components/sections/PageHeader';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import UtilityDock, { UtilityDockItem } from '@/components/sections/UtilityDock';
import MapPreview, { MAP_VARIATIONS } from '@/components/ui/MapPreview';
import BaseMap from '@/components/map/BaseMap';
import MapMarker from '@/components/map/MapMarker';
import BoundaryMap from '@/components/layout/BoundaryMap';
import FooterMap from '@/components/layout/FooterMap';
import { cn } from '@/lib/utils';

const colors = [
  { name: 'Bone', class: 'bg-bone', hex: '#F4F1EA', textClass: 'text-forest' },
  { name: 'Forest', class: 'bg-forest', hex: '#1A2218', textClass: 'text-bone' },
  { name: 'Forest Light', class: 'bg-forest-light', hex: '#2C3E2D', textClass: 'text-bone' },
  { name: 'Terracotta', class: 'bg-terracotta', hex: '#D95D39', textClass: 'text-bone' },
  { name: 'Terracotta Dark', class: 'bg-terracotta-dark', hex: '#C74E2E', textClass: 'text-bone' },
  { name: 'Sage', class: 'bg-sage', hex: '#A8B5A0', textClass: 'text-forest' },
  { name: 'Sage Light', class: 'bg-sage-light', hex: '#E8EDE6', textClass: 'text-forest' },
];

const iconNames: IconName[] = [
  'amenities', 'calendar', 'user', 'document', 'mail', 'lightbulb', 
  'phone', 'phone-emergency', 'arrow-right', 'arrow-down', 'chevron-down'
];

const iconSizes = ['sm', 'md', 'lg', 'xl'] as const;

interface SectionProps {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

function Section({ id, title, description, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24 mb-16">
      <div className="mb-8">
        <h2 className="font-display text-3xl font-medium mb-2">{title}</h2>
        <p className="opacity-60">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ColorSwatch({ name, hex, textClass, class: bgClass }: typeof colors[0]) {
  return (
    <div className="flex flex-col">
      <div className={cn('h-24 rounded-lg shadow-md mb-2 flex items-center justify-center', bgClass)}>
        <span className={cn('text-xs font-medium opacity-0', textClass)}>Aa</span>
      </div>
      <div className="space-y-1">
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs opacity-50 font-mono">{hex}</p>
        <p className="text-xs opacity-40">{bgClass}</p>
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const sections = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards' },
    { id: 'icons', label: 'Icons' },
    { id: 'forms', label: 'Form Elements' },
    { id: 'components', label: 'Components' },
    { id: 'map-components', label: 'Map Components' },
  ];

  return (
    <div className="min-h-screen bg-bone">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-forest/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <span className="text-bone font-display text-lg">Design System</span>
              <span className="bg-terracotta/20 text-terracotta text-xs px-2 py-0.5 rounded">Internal</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded transition-colors whitespace-nowrap',
                    'text-bone/60 hover:text-bone hover:bg-white/5'
                  )}
                >
                  {section.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-14">
        {/* Header */}
        <header className="bg-forest text-bone py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl mb-4">Design System</h1>
            <p className="opacity-70 max-w-2xl">
              A comprehensive reference guide for the CGRS design system. This page documents all 
              design tokens, components, and their variations for consistent implementation.
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Color Palette */}
          <Section
            id="colors"
            title="Color Palette"
            description="The core color palette derived from the Tailwind configuration."
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {colors.map((color) => (
                <div
                  key={color.name}
                  className="cursor-pointer"
                  onClick={() => copyToClipboard(color.hex)}
                >
                  <ColorSwatch {...color} />
                  {copied === color.hex && (
                    <p className="text-xs text-terracotta mt-1">Copied!</p>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Typography */}
          <Section
            id="typography"
            title="Typography"
            description="Font families and sizing scale used throughout the application."
          >
            <Card className="p-8">
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Font Families</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-sage-light rounded-lg">
                      <p className="text-xs opacity-50 mb-1">Display (Serif)</p>
                      <p className="font-display text-2xl">Fraunces</p>
                      <p className="text-sm opacity-60 mt-2">Headings, titles, display text</p>
                    </div>
                    <div className="p-4 bg-sage-light rounded-lg">
                      <p className="text-xs opacity-50 mb-1">Body (Sans-serif)</p>
                      <p className="font-body text-2xl">Manrope</p>
                      <p className="text-sm opacity-60 mt-2">Body text, UI elements, forms</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Type Scale</h3>
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-4 p-4 bg-sage-light rounded-lg">
                      <span className="text-xs opacity-40 w-24 font-mono">display</span>
                      <span className="text-xs opacity-40 w-20">clamp(2.5rem, 8vw, 5rem)</span>
                      <p className="font-display text-4xl">Display Heading</p>
                    </div>
                    <div className="flex items-baseline gap-4 p-4 bg-sage-light rounded-lg">
                      <span className="text-xs opacity-40 w-24 font-mono">heading-lg</span>
                      <span className="text-xs opacity-40 w-20">clamp(2rem, 5vw, 3.5rem)</span>
                      <p className="font-display text-3xl">Large Heading</p>
                    </div>
                    <div className="flex items-baseline gap-4 p-4 bg-sage-light rounded-lg">
                      <span className="text-xs opacity-40 w-24 font-mono">heading-md</span>
                      <span className="text-xs opacity-40 w-20">clamp(1.25rem, 3vw, 1.75rem)</span>
                      <p className="font-display text-2xl">Medium Heading</p>
                    </div>
                    <div className="flex items-baseline gap-4 p-4 bg-sage-light rounded-lg">
                      <span className="text-xs opacity-40 w-24 font-mono">base</span>
                      <span className="text-xs opacity-40 w-20">1rem / 16px</span>
                      <p className="font-body">Base body text</p>
                    </div>
                    <div className="flex items-baseline gap-4 p-4 bg-sage-light rounded-lg">
                      <span className="text-xs opacity-40 w-24 font-mono">sm</span>
                      <span className="text-xs opacity-40 w-20">0.875rem / 14px</span>
                      <p className="font-body text-sm">Small body text</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Section>

          {/* Spacing */}
          <Section
            id="spacing"
            title="Spacing Scale"
            description="Consistent spacing values for margins, padding, and gaps."
          >
            <Card className="p-8">
              <div className="space-y-4">
                {[
                  { name: 'xs', value: '0.5rem', pixels: '8px' },
                  { name: 'sm', value: '1rem', pixels: '16px' },
                  { name: 'md', value: '1.5rem', pixels: '24px' },
                  { name: 'lg', value: '2.5rem', pixels: '40px' },
                  { name: 'xl', value: '4rem', pixels: '64px' },
                  { name: '2xl', value: '6rem', pixels: '96px' },
                ].map((space) => (
                  <div key={space.name} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium">{space.name}</div>
                    <div className="text-xs opacity-40 w-20 font-mono">{space.value}</div>
                    <div className="text-xs opacity-40 w-16">{space.pixels}</div>
                    <div
                      className="h-8 bg-terracotta rounded"
                      style={{ width: space.value }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          {/* Buttons */}
          <Section
            id="buttons"
            title="Buttons"
            description="Button component with multiple variants and sizes."
          >
            <Card className="p-8">
              <div className="space-y-8">
                {/* Variants */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Variants</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="nav">Nav Button</Button>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Sizes</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                {/* States */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">States</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button>Default</Button>
                    <Button disabled>Disabled</Button>
                    <Button className="opacity-50">Hover</Button>
                    <Button className="scale-95">Active</Button>
                  </div>
                </div>

                {/* With Icons */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">With Icons</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button>
                      <Icon name="arrow-right" size="sm" className="mr-2" />
                      With Icon
                    </Button>
                    <Button variant="outline">
                      Download
                      <Icon name="document" size="sm" className="ml-2" />
                    </Button>
                    <Button variant="ghost">
                      <Icon name="mail" size="sm" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Section>

          {/* Cards */}
          <Section
            id="cards"
            title="Cards"
            description="Card component with different variants and hover effects."
          >
            <Card className="p-8">
              <div className="space-y-8">
                {/* Variants */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Variants</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card variant="default" className="p-6">
                      <p className="font-medium">Default Card</p>
                      <p className="text-sm opacity-60 mt-1">White background</p>
                    </Card>
                    <Card variant="sage" className="p-6">
                      <p className="font-medium">Sage Card</p>
                      <p className="text-sm opacity-60 mt-1">Sage light background</p>
                    </Card>
                    <Card variant="accent" className="p-6">
                      <p className="font-medium">Accent Card</p>
                      <p className="text-sm opacity-60 mt-1">Terracotta background</p>
                    </Card>
                  </div>
                </div>

                {/* Hover Effect */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">With Hover</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card variant="default" hover className="p-6">
                      <p className="font-medium">Hover Me</p>
                      <p className="text-sm opacity-60 mt-1">Lift & shadow effect</p>
                    </Card>
                    <Card variant="sage" hover className="p-6">
                      <p className="font-medium">Hover Me</p>
                      <p className="text-sm opacity-60 mt-1">Works with sage variant</p>
                    </Card>
                    <Card variant="accent" hover className="p-6">
                      <p className="font-medium">Hover Me</p>
                      <p className="text-sm opacity-60 mt-1">Works with accent variant</p>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>
          </Section>

          {/* Icons */}
          <Section
            id="icons"
            title="Icons"
            description="Icon component with built-in SVG definitions and size variants."
          >
            <Card className="p-8">
              <div className="space-y-8">
                {/* All Icons Grid */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Available Icons</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {iconNames.map((name) => (
                      <div
                        key={name}
                        className="flex flex-col items-center gap-2 p-4 bg-sage-light rounded-lg cursor-pointer hover:bg-sage/30 transition-colors"
                        onClick={() => copyToClipboard(name)}
                      >
                        <Icon name={name} size="lg" />
                        <span className="text-xs opacity-50 capitalize">{name.replace('-', ' ')}</span>
                        {copied === name && <span className="text-xs text-terracotta">Copied!</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size Variants */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Size Variants</h3>
                  <div className="flex items-end gap-8">
                    {iconSizes.map((size) => (
                      <div key={size} className="flex flex-col items-center gap-2">
                        <Icon name="calendar" size={size} />
                        <span className="text-xs opacity-50 capitalize">{size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Section>

          {/* Form Elements */}
          <Section
            id="forms"
            title="Form Elements"
            description="Form input styles and states used throughout the application."
          >
            <Card className="p-8">
              <div className="space-y-6">
                {/* Text Inputs */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Text Inputs</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Default Input</label>
                      <input
                        type="text"
                        placeholder="Enter text..."
                        className="w-full px-4 py-3 bg-white border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">With Value</label>
                      <input
                        type="text"
                        value="Sample text"
                        readOnly
                        className="w-full px-4 py-3 bg-white border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Error State</label>
                      <input
                        type="text"
                        placeholder="Error input..."
                        className="w-full px-4 py-3 bg-white border border-terracotta rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50"
                      />
                      <p suppressHydrationWarning className="mt-1 text-sm text-terracotta">This field is required</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Disabled</label>
                      <input
                        type="text"
                        placeholder="Disabled..."
                        disabled
                        className="w-full px-4 py-3 bg-sage-light border border-sage/30 rounded-lg opacity-50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Textarea */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Textarea</h3>
                  <textarea
                    placeholder="Enter long text..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta resize-none"
                  />
                </div>

                {/* Select */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Select</h3>
                  <select className="w-full px-4 py-3 bg-white border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta">
                    <option>Select an option...</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>

                {/* Checkboxes & Radios */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Checkboxes & Radios</h3>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 rounded border-sage/50 text-terracotta focus:ring-terracotta/50" />
                      <span>Checkbox</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-sage/50 text-terracotta focus:ring-terracotta/50" />
                      <span>Checked</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="radio" className="w-5 h-5 border-sage/50 text-terracotta focus:ring-terracotta/50" />
                      <span>Radio Option</span>
                    </label>
                  </div>
                </div>

                {/* Buttons in Forms */}
                <div>
                  <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Form Buttons</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button type="submit">Submit Form</Button>
                    <Button type="button" variant="outline">Cancel</Button>
                    <Button type="button" variant="ghost">Reset</Button>
                  </div>
                </div>
              </div>
            </Card>
          </Section>

          {/* Components */}
          <Section
            id="components"
            title="Components"
            description="Complete component examples including layout, section, and utility components."
          >
            <div className="space-y-12">
              {/* Component Tabs */}
              <Tab.Group>
                <Tab.List className="flex flex-wrap gap-2 border-b border-sage/20 pb-4 mb-6">
                  {[
                    { id: 'skeleton', label: 'Skeleton Loaders' },
                    { id: 'error', label: 'Error Boundary' },
                    { id: 'cards', label: 'Card Sub-components' },
                    { id: 'layout', label: 'Layout' },
                    { id: 'sections', label: 'Sections' },
                    { id: 'maps', label: 'Map Customization' },
                    { id: 'map-components', label: 'Map Components' },
                  ].map((tab) => (
                    <Tab key={tab.id} className={({ selected }: { selected: boolean }) =>
                      cn(
                        'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                        selected
                          ? 'bg-forest text-bone'
                          : 'text-forest/60 hover:text-forest hover:bg-sage-light'
                      )
                    }>
                      {tab.label}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    {/* Skeleton Loaders */}
                    <Card className="p-8">
                      <h3 className="text-sm font-medium mb-6 opacity-50 uppercase tracking-wider">Skeleton Loaders</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <p className="text-xs opacity-50 mb-2">Base Skeleton</p>
                          <Skeleton className="h-20 w-full" />
                        </div>
                        <div>
                          <p className="text-xs opacity-50 mb-2">Skeleton Text</p>
                          <SkeletonText lines={3} />
                        </div>
                        <div>
                          <p className="text-xs opacity-50 mb-2">Calendar Card Skeleton</p>
                          <CalendarCardSkeleton />
                        </div>
                        <div>
                          <p className="text-xs opacity-50 mb-2">Event Card Skeleton</p>
                          <EventCardSkeleton />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs opacity-50 mb-2">News Card Skeleton</p>
                        <div className="max-w-md">
                          <NewsCardSkeleton />
                        </div>
                      </div>
                    </Card>
                  </Tab.Panel>
                  <Tab.Panel>
                    {/* Error Boundary */}
                    <Card className="p-8">
                      <h3 className="text-sm font-medium mb-6 opacity-50 uppercase tracking-wider">Error Boundary</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs opacity-50 mb-2">Normal Content</p>
                          <Card variant="sage" className="p-4">
                            <p className="text-sm">This content renders normally without errors.</p>
                          </Card>
                        </div>
                        <div>
                          <p className="text-xs opacity-50 mb-2">With Error Boundary (click to trigger)</p>
                          <ErrorBoundary
                            fallback={
                              <Card variant="accent" className="p-4">
                                <p className="text-sm font-medium">Something went wrong!</p>
                                <p className="text-xs opacity-70 mt-1">Error caught by boundary</p>
                              </Card>
                            }
                          >
                            <Card variant="sage" className="p-4">
                              <p className="text-sm">Content protected by error boundary</p>
                            </Card>
                          </ErrorBoundary>
                        </div>
                      </div>
                    </Card>
                  </Tab.Panel>
                  <Tab.Panel>
                    {/* Card Sub-components */}
                    <Card className="p-8">
                      <h3 className="text-sm font-medium mb-6 opacity-50 uppercase tracking-wider">Card Sub-components</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs opacity-50 mb-2">Card Image Wrapper</p>
                          <Card>
                            <CardImageWrapper>
                              <div className="w-full h-[200px] bg-sage-light flex items-center justify-center">
                                <Icon name="calendar" size="xl" className="opacity-50" />
                              </div>
                            </CardImageWrapper>
                            <CardContent>
                              <p className="font-medium">Image Card Example</p>
                              <p className="text-sm opacity-60 mt-1">Used for news and feature cards</p>
                            </CardContent>
                          </Card>
                        </div>
                        <div>
                          <p className="text-xs opacity-50 mb-2">Card Content Wrapper</p>
                          <Card variant="sage">
                            <CardContent>
                              <p className="font-medium">Padded Content</p>
                              <p className="text-sm opacity-60 mt-1">Provides consistent padding for card content</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </Card>
                  </Tab.Panel>
                  <Tab.Panel>
                    {/* Layout Components */}
                    <Card className="p-8">
                      <h3 className="text-sm font-medium mb-6 opacity-50 uppercase tracking-wider">Layout Components</h3>
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs opacity-50 mb-2">Header (Navigation)</p>
                          <div className="border border-sage/20 rounded-lg overflow-hidden">
                            <Header />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs opacity-50 mb-2">Footer</p>
                          <div className="border border-sage/20 rounded-lg overflow-hidden">
                            <Footer />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Tab.Panel>
                  <Tab.Panel>
                    {/* Section Components */}
                    <Card className="p-8">
                      <h3 className="text-sm font-medium mb-6 opacity-50 uppercase tracking-wider">Section Components</h3>
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs opacity-50 mb-2">Page Header</p>
                          <PageHeader
                            title="Page Header Example"
                            description="This is a page header component with an optional eyebrow label and description text."
                            eyebrow="Eyebrow Label"
                          />
                        </div>
                        <div>
                          <p className="text-xs opacity-50 mb-2">Hero Section</p>
                          <Card className="overflow-hidden">
                            <Hero
                              title="Hero Section"
                              subtitle="Full viewport hero with parallax background"
                              backgroundImage="/images/hero-bg.svg"
                            />
                          </Card>
                        </div>
                        <div>
                          <p className="text-xs opacity-50 mb-2">Utility Dock (Default)</p>
                          <div className="border border-sage/20 rounded-lg bg-sage-light p-4 pt-20 overflow-visible">
                            <UtilityDock />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs opacity-50 mb-2">Utility Dock (Custom Items)</p>
                          <div className="border border-sage/20 rounded-lg bg-sage-light p-4 pt-20 overflow-visible">
                            <UtilityDock
                              items={[
                                { name: 'Docs', href: '/docs', icon: 'document', label: 'Documents' },
                                { name: 'Calendar', href: '/calendar', icon: 'calendar', label: 'Calendar' },
                                { name: 'Help', href: '/help', icon: 'lightbulb', label: 'Help' },
                              ]}
                              useIconComponent
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Tab.Panel>
                  
                  {/* Map Customization Panel */}
                  <Tab.Panel>
                    <Card className="p-6 mb-6">
                      <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Customizing Leaflet Maps</h3>
                      <p className="text-sm mb-4">
                        Leaflet maps can be customized through CSS targeting specific elements. Below are the key elements and properties you can modify.
                      </p>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium mb-3">Customizable Elements</h4>
                          <div className="space-y-3 text-sm">
                            <div className="bg-sage-light p-3 rounded">
                              <code className="text-xs text-terracotta">.leaflet-container</code>
                              <p className="opacity-60 text-xs mt-1">Main map container wrapper</p>
                            </div>
                            <div className="bg-sage-light p-3 rounded">
                              <code className="text-xs text-terracotta">.leaflet-tile-pane</code>
                              <p className="opacity-60 text-xs mt-1">Layer containing all map tiles - apply filters here</p>
                            </div>
                            <div className="bg-sage-light p-3 rounded">
                              <code className="text-xs text-terracotta">.leaflet-tile</code>
                              <p className="opacity-60 text-xs mt-1">Individual tiles - control opacity, transitions</p>
                            </div>
                            <div className="bg-sage-light p-3 rounded">
                              <code className="text-xs text-terracotta">.leaflet-marker-icon</code>
                              <p className="opacity-60 text-xs mt-1">Custom markers - size, shadow, animation</p>
                            </div>
                            <div className="bg-sage-light p-3 rounded">
                              <code className="text-xs text-terracotta">.leaflet-popup</code>
                              <p className="opacity-60 text-xs mt-1">Popup windows - styling, border radius, shadows</p>
                            </div>
                            <div className="bg-sage-light p-3 rounded">
                              <code className="text-xs text-terracotta">.leaflet-control-zoom</code>
                              <p className="opacity-60 text-xs mt-1">Zoom control buttons</p>
                            </div>
                            <div className="bg-sage-light p-3 rounded">
                              <code className="text-xs text-terracotta">.leaflet-control-attribution</code>
                              <p className="opacity-60 text-xs mt-1">Attribution text in corner</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-3">CSS Properties</h4>
                          <div className="bg-sage-light p-3 rounded mb-3">
                            <p className="text-xs font-medium mb-2">Filter Examples for Stadia Toner:</p>
                            <code className="text-xs text-forest block whitespace-pre-wrap">{`.leaflet-tile-pane {
  filter: sepia(0.25) saturate(0.9) contrast(0.95);
}`}</code>
                          </div>
                          <div className="bg-sage-light p-3 rounded">
                            <p className="text-xs font-medium mb-2">Warm Tone (Cream Background):</p>
                            <code className="text-xs text-forest block whitespace-pre-wrap">{`/* Filter on tiles */
filter: sepia(0.25) saturate(0.9) contrast(0.95);

/* Background color on container */
background-color: #F4F1EA; /* Bone color */`}</code>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 mb-6">
                      <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Stadia Toner Variants</h3>
                      <p className="text-sm mb-4">
                        The following examples use Stadia Toner as a base, demonstrating different customization approaches.
                      </p>
                    </Card>
                    
                    <Card className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(MAP_VARIATIONS).map(([key, variation]) => (
                          <div key={key}>
                            <p className="text-xs opacity-50 mb-2">{variation.description}</p>
                            <MapPreview
                              tileUrl={variation.tileUrl}
                              filter={variation.filter}
                              height="180px"
                              className="border border-sage/30"
                              overlayUrl={variation.overlayUrl}
                              backgroundColor={variation.backgroundColor}
                              customCss={variation.customCss}
                            />
                            <p className="text-xs mt-2 font-medium">{variation.name}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Tab.Panel>

                  {/* Map Components Panel */}
                  <Tab.Panel>
                    <Card className="p-6 mb-6">
                      <h3 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Reusable Map Components</h3>
                      <p className="text-sm mb-4">
                        These components provide modular, reusable building blocks for Leaflet maps.
                        All map components wrap BaseMap for consistent initialization and behavior.
                      </p>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* BaseMap */}
                      <Card className="p-6">
                        <h4 className="text-sm font-medium mb-3">BaseMap</h4>
                        <p className="text-xs opacity-60 mb-4">
                          Foundation component for all maps. Handles initialization, tile loading, and map configuration.
                        </p>
                        <div className="bg-sage-light p-3 rounded mb-3">
                          <code className="text-xs text-terracotta block whitespace-pre-wrap">{`<BaseMap
  center={[-36.9497, 174.7912]}
  zoom={16}
  tileUrl="https://tiles.stadiamaps.com/..."
  zoomControl={true}
  onMapReady={(map) => console.log(map)}
>
  {/* Child components like MapMarker */}
</BaseMap>`}</code>
                        </div>
                        <div className="h-[200px] rounded-lg overflow-hidden border border-sage/30">
                          <BaseMap
                            center={[-36.9497, 174.7912]}
                            zoom={15}
                            tileUrl="https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png"
                            tileOptions={{ maxZoom: 18 }}
                          />
                        </div>
                      </Card>

                      {/* MapMarker */}
                      <Card className="p-6">
                        <h4 className="text-sm font-medium mb-3">MapMarker</h4>
                        <p className="text-xs opacity-60 mb-4">
                          SVG-based markers with customizable color, size, and popup content.
                        </p>
                        <div className="bg-sage-light p-3 rounded mb-3">
                          <code className="text-xs text-terracotta block whitespace-pre-wrap">{`<MapMarker
  map={mapInstance}
  position={[-36.9497, 174.7912]}
  color="#D95D39"
  size={32}
  popup="Location info"
  onCreate={(marker) => markers.set(id, marker)}
/>`}</code>
                        </div>
                        <div className="h-[200px] rounded-lg overflow-hidden border border-sage/30">
                          <BaseMap
                            center={[-36.9497, 174.7912]}
                            zoom={15}
                            tileUrl="https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png"
                            tileOptions={{ maxZoom: 18 }}
                          >
                            <MapMarker
                              map={null}
                              position={[-36.9497, 174.7912]}
                              color="#D95D39"
                              size={32}
                            />
                          </BaseMap>
                        </div>
                      </Card>
                    </div>

                    <Card className="p-6 mb-6">
                      <h4 className="text-sm font-medium mb-3">Component Hierarchy</h4>
                      <div className="bg-sage-light p-4 rounded">
                        <div className="text-sm space-y-2 font-mono">
                          <p><span className="text-terracotta">BaseMap</span> - Root map container</p>
                          <p className="pl-4">└─ <span className="text-terracotta">MapMarker</span> - POI markers (multiple)</p>
                          <p className="pl-4">└─ <span className="text-terracotta">GeoJSON</span> - Boundary polygons</p>
                          <p className="pl-4">└─ <span className="text-terracotta">TileLayer</span> - Additional overlays</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="text-sm font-medium mb-4 opacity-50 uppercase tracking-wider">Component Examples</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* BoundaryMap */}
                        <div>
                          <p className="text-xs opacity-50 mb-2">BoundaryMap (160px height)</p>
                          <BoundaryMap className="border border-sage/30" height="160px" />
                          <p className="text-xs mt-2 font-medium">Boundary Map</p>
                        </div>

                        {/* FooterMap */}
                        <div>
                          <p className="text-xs opacity-50 mb-2">FooterMap (160px height, Toner theme)</p>
                          <FooterMap className="border border-sage/30" />
                          <p className="text-xs mt-2 font-medium">Footer Map (Stadia Toner)</p>
                        </div>
                      </div>
                    </Card>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </Section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-forest text-bone py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="opacity-60">Design System v1.0 — For internal development use</p>
        </div>
      </footer>
    </div>
  );
}
