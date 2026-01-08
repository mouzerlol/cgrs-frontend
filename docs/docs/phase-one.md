# Phase 1: MVP Foundation - Comprehensive Requirements Specification

## Project Overview

**Project:** Coronation Gardens Residents Society (CGRS) Website  
**Domain:** `cgrs.co.nz`  
**Phase:** MVP Foundation (Static SPA)  
**Target Audience:** 300-property development residents in Mangere Bridge, Auckland  
**Timeline:** 4-6 weeks development  

## Executive Summary

Phase 1 delivers a modern, mobile-first community website that serves as the digital foundation for CGRS. The focus is on essential functionality, performance, and user experience while maintaining cost-effectiveness and operational simplicity.

## Technical Architecture

### Core Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (free tier)
- **Content Management:** JSON configuration files
- **Form Handling:** Formspree (free tier: 50 submissions/month)
- **CAPTCHA:** hCaptcha (free, privacy-focused)

### Project Structure
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── about/
│   ├── contact/
│   ├── news/
│   └── guidelines/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   ├── forms/           # Form components
│   └── content/         # Content-specific components
├── data/
│   ├── committee.json   # Committee profiles
│   ├── news.json        # News articles
│   ├── events.json      # Event calendar
│   └── site-config.json # Site settings
├── lib/
│   ├── utils.ts
│   └── constants.ts
└── types/
    └── index.ts
```

### Content Management Strategy
- **Phase 1:** JSON files for immediate functionality
- **Future Migration:** Structured for easy API/CMS integration
- **Update Process:** Developers handle content updates initially
- **Data Structure:** Consistent schema for future backend integration

## Design System

### Color Palette
**Primary Colors:**
- Vibrant Green: `#22C55E` (hills, trees, grass)
- Sky Blue: `#3B82F6` (clear skies)
- Warm Beige: `#F5F5DC` (wooden steps, natural textures)

**Secondary Colors:**
- Charcoal Grey: `#374151` (metal railings, modern accents)
- Earthy Brown: `#8B4513` (tree bark, natural elements)
- Clean White: `#FFFFFF` (townhouse facades, clouds)

**Accent Colors:**
- Coral Orange: `#F97316` (street furniture accents)
- Deep Teal: `#0F766E` (water elements)

### Typography
- **Primary Font:** Inter (Google Fonts) - Modern, readable
- **Headings:** Bold weights (600-700)
- **Body Text:** Regular weight (400)
- **Mobile Optimization:** Responsive font sizing

### Visual Design Principles
- **Clean Architecture:** Inspired by townhouse design
- **Natural Elements:** Organic shapes and gradients
- **Community Focus:** Warm, welcoming aesthetic
- **Mobile-First:** 40% mobile users prioritized
- **Performance Balance:** Visual effects without compromising speed

## Page Specifications

### 1. Home Page (`/`)

**Purpose:** Primary landing page showcasing community highlights and quick access to key information.

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ Header (Navigation)                 │
├─────────────────────────────────────┤
│ Hero Section                        │
│ - Development imagery (placeholder) │
│ - Community tagline                 │
│ - Quick action buttons              │
├─────────────────────────────────────┤
│ Latest News (3 most recent)        │
│ - Card-based layout                 │
│ - Read more links                   │
├─────────────────────────────────────┤
│ Upcoming Events (next 2 events)     │
│ - Event cards with dates            │
│ - RSVP/Info links                   │
├─────────────────────────────────────┤
│ Quick Links                         │
│ - Contact Committee                 │
│ - Report Issues                     │
│ - Community Guidelines              │
│ - Newsletter Signup                 │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

**Key Features:**
- Responsive hero section with placeholder imagery
- Dynamic news feed from JSON data
- Event calendar integration
- Quick action buttons for common tasks
- Newsletter signup form
- Mobile-optimized layout

**Content Requirements:**
- Welcome message highlighting community values
- 3-5 latest news articles
- Next 2 upcoming events
- Quick links to essential pages

### 2. About Page (`/about`)

**Purpose:** Society information, mission, values, and committee profiles.

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ Header (Navigation)                 │
├─────────────────────────────────────┤
│ Mission Statement                   │
│ - Society mission                   │
│ - Core values grid                  │
├─────────────────────────────────────┤
│ Committee Profiles                  │
│ - Chairperson (Louise Putt)         │
│ - Placeholder profiles              │
│ - Contact information               │
├─────────────────────────────────────┤
│ Development History                 │
│ - Brief development overview        │
│ - Community milestones              │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

**Content Requirements:**
- Mission: "Dedicated to maintaining an exceptional living environment through collective responsibility, cultural respect, and unwavering commitment to our shared community values."
- Core Values: Mutual Respect, Personal Accountability, Safety and Security, Cultural Inclusivity, Environmental Stewardship, Transparent Communication, Collaborative Problem Solving, Pride of Place, Supportive Neighborliness, Continuous Improvement
- Committee profiles with placeholder content
- Development history and milestones

### 3. Contact Page (`/contact`)

**Purpose:** Contact form and committee directory.

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ Header (Navigation)                 │
├─────────────────────────────────────┤
│ Contact Form                        │
│ - Name, Email, Subject, Message     │
│ - hCaptcha integration              │
│ - Formspree submission              │
├─────────────────────────────────────┤
│ Committee Directory                 │
│ - Primary contact: cgrscommittee@gmail.com │
│ - Chairperson: Louise Putt          │
│ - Additional contacts (placeholders)│
├─────────────────────────────────────┤
│ Quick Contact Options               │
│ - Report Issues                     │
│ - Maintenance Requests              │
│ - General Inquiries                 │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

**Form Specifications:**
- **Fields:** Name, Email, Subject, Message
- **Validation:** Client-side validation with TypeScript
- **Spam Protection:** hCaptcha integration
- **Submission:** Formspree integration (free tier)
- **Success State:** Thank you message with next steps
- **Error Handling:** User-friendly error messages

### 4. News Page (`/news`)

**Purpose:** Archive of community updates and announcements.

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ Header (Navigation)                 │
├─────────────────────────────────────┤
│ Page Header                         │
│ - "Community News & Updates"       │
│ - Brief description                 │
├─────────────────────────────────────┤
│ News Articles                       │
│ - Card-based layout                 │
│ - Date, title, excerpt              │
│ - Read more functionality           │
│ - Pagination (if needed)            │
├─────────────────────────────────────┤
│ Categories/Filtering                │
│ - Maintenance Updates               │
│ - Community Events                  │
│ - Policy Changes                    │
│ - General Announcements             │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

**Content Types:**
- Maintenance notices
- Community events
- Policy changes
- Social gatherings
- General announcements

### 5. Community Guidelines Page (`/guidelines`)

**Purpose:** Clear rules and expectations for residents.

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ Header (Navigation)                 │
├─────────────────────────────────────┤
│ Page Header                         │
│ - "Community Guidelines"            │
│ - Introduction                      │
├─────────────────────────────────────┤
│ Resident Responsibilities           │
│ - Property maintenance              │
│ - Common area usage                 │
│ - Noise guidelines                  │
├─────────────────────────────────────┤
│ Community Behavior                  │
│ - Respectful conduct                │
│ - Safety protocols                 │
│ - Environmental care                │
├─────────────────────────────────────┤
│ Contact Procedures                  │
│ - How to report issues              │
│ - Emergency contacts                │
│ - Committee communication           │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

## Component Specifications

### Navigation Component
- **Mobile-First:** Hamburger menu for mobile
- **Desktop:** Horizontal navigation
- **Active States:** Clear indication of current page
- **Accessibility:** Keyboard navigation support

### News Card Component
- **Layout:** Image, title, date, excerpt
- **Responsive:** Stacked on mobile, side-by-side on desktop
- **Interactive:** Hover effects and click states
- **Performance:** Lazy loading for images

### Contact Form Component
- **Validation:** Real-time validation feedback
- **Accessibility:** Proper labels and ARIA attributes
- **Error Handling:** Clear error messages
- **Success State:** Confirmation message

### Event Calendar Component
- **Display:** Upcoming events list
- **Format:** Date, title, description, location
- **Interactive:** Click for more details
- **Responsive:** Mobile-optimized layout

## Performance Optimization Strategy

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Lighthouse Score:** > 90

### Optimization Techniques
- **Image Optimization:** Next.js Image component with WebP format
- **Code Splitting:** Dynamic imports for non-critical components
- **Lazy Loading:** Images and components below the fold
- **Font Optimization:** Google Fonts with display=swap
- **CSS Optimization:** Tailwind CSS purging
- **Bundle Analysis:** Regular bundle size monitoring

### Mobile Performance
- **Touch Optimization:** 44px minimum touch targets
- **Viewport Optimization:** Proper viewport meta tag
- **Network Optimization:** Efficient loading strategies
- **Battery Optimization:** Minimal JavaScript execution

## Content Management Structure

### JSON Data Files

**committee.json:**
```json
{
  "chairperson": {
    "name": "Louise Putt",
    "role": "Chairperson",
    "email": "cgrscommittee@gmail.com",
    "bio": "Placeholder bio text",
    "image": "/images/committee/louise-putt.jpg"
  },
  "members": [
    {
      "name": "Committee Member 1",
      "role": "Treasurer",
      "bio": "Placeholder bio text",
      "image": "/images/committee/member1.jpg"
    }
  ]
}
```

**news.json:**
```json
{
  "articles": [
    {
      "id": "1",
      "title": "Community Update - January 2024",
      "excerpt": "Brief description of the update...",
      "content": "Full article content...",
      "date": "2024-01-15",
      "category": "general",
      "image": "/images/news/article1.jpg",
      "featured": true
    }
  ]
}
```

**events.json:**
```json
{
  "events": [
    {
      "id": "1",
      "title": "Community Meeting",
      "date": "2024-02-15",
      "time": "7:00 PM",
      "location": "Community Center",
      "description": "Monthly community meeting...",
      "rsvp": false
    }
  ]
}
```

## Integration Points

### Formspree Integration
- **Endpoint:** Formspree form endpoint
- **Fields:** name, email, subject, message
- **Validation:** Client-side validation before submission
- **Success Handling:** Thank you page redirect
- **Error Handling:** User-friendly error messages

### hCaptcha Integration
- **Implementation:** hCaptcha widget in contact form
- **Configuration:** Site key and secret key setup
- **User Experience:** Minimal friction for legitimate users
- **Accessibility:** Screen reader compatible

### Future API Integration
- **Data Structure:** JSON files structured for easy API migration
- **Endpoints:** Planned REST API endpoints
- **Authentication:** Future JWT token integration
- **Content Management:** Headless CMS integration ready

## SEO and Accessibility

### SEO Optimization
- **Meta Tags:** Dynamic meta tags for each page
- **Structured Data:** JSON-LD markup for organization
- **Sitemap:** XML sitemap generation
- **Robots.txt:** Proper crawling instructions
- **Open Graph:** Social media sharing optimization

### Accessibility (WCAG 2.1 AA)
- **Keyboard Navigation:** Full keyboard accessibility
- **Screen Readers:** Proper ARIA labels and roles
- **Color Contrast:** Minimum 4.5:1 contrast ratio
- **Focus Management:** Clear focus indicators
- **Alt Text:** Descriptive image alt text

## Development Workflow

### Phase 1 Development Steps
1. **Project Setup:** Next.js with TypeScript and Tailwind
2. **Design System:** Component library and color palette
3. **Layout Components:** Header, footer, navigation
4. **Page Development:** Home, About, Contact, News, Guidelines
5. **Form Integration:** Contact form with Formspree and hCaptcha
6. **Content Integration:** JSON data files and dynamic content
7. **Performance Optimization:** Image optimization and code splitting
8. **Testing:** Cross-browser and mobile testing
9. **Deployment:** Vercel deployment and domain setup

### Quality Assurance
- **Code Review:** All code reviewed before deployment
- **Testing:** Manual testing on multiple devices
- **Performance:** Lighthouse audits and optimization
- **Accessibility:** Screen reader and keyboard testing
- **Cross-Browser:** Testing on Chrome, Firefox, Safari, Edge

## Success Metrics

### Phase 1 Success Criteria
- [ ] All MVP pages functional and responsive
- [ ] Contact form working with spam protection
- [ ] Mobile-first design implemented
- [ ] Performance targets met (Lighthouse >90)
- [ ] SEO optimization implemented
- [ ] Accessibility compliance achieved
- [ ] Content management system ready
- [ ] Deployment successful on Vercel

### User Experience Metrics
- **Page Load Time:** < 3 seconds on mobile
- **Form Completion Rate:** > 80% for contact form
- **Mobile Usability:** 100% mobile-responsive
- **Accessibility Score:** WCAG 2.1 AA compliance
- **User Satisfaction:** Positive feedback from committee

## Risk Mitigation

### Technical Risks
- **Performance Issues:** Regular performance monitoring and optimization
- **Mobile Compatibility:** Extensive mobile testing
- **Form Spam:** hCaptcha integration and monitoring
- **Content Updates:** Clear documentation for content management

### Mitigation Strategies
- **Incremental Development:** Regular testing and validation
- **Fallback Solutions:** Graceful degradation for critical features
- **Performance Monitoring:** Continuous performance tracking
- **User Feedback:** Regular feedback collection and iteration

## Future Migration Path

### Phase 2 Preparation
- **Content Structure:** JSON files designed for easy API migration
- **Component Architecture:** Modular components for CMS integration
- **Data Flow:** Separation of data and presentation layers
- **Authentication Ready:** Structure prepared for user authentication

### Backend Integration
- **API Endpoints:** Planned REST API structure
- **Database Design:** Schema prepared for future database
- **Authentication:** JWT token integration ready
- **Content Management:** Headless CMS integration prepared

## Conclusion

Phase 1 delivers a solid foundation for the CGRS website that balances functionality, performance, and cost-effectiveness. The JSON-based content management provides immediate functionality while maintaining a clear path for future enhancements and backend integration.

The mobile-first approach ensures optimal user experience for the 40% mobile user base, while the performance optimization strategy guarantees fast loading times and excellent Core Web Vitals scores.

This specification provides a comprehensive roadmap for development while maintaining flexibility for future growth and enhancement.
