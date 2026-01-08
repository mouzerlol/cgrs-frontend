# CGRS Frontend - Coronation Gardens Residents Society Website

A modern, responsive website for the Coronation Gardens Residents Society in Mangere Bridge, Auckland.

## 🚀 Features

- **Modern Design**: Clean, mobile-first design with custom color palette inspired by the local area
- **Responsive Layout**: Optimized for all devices with 40% mobile user focus
- **Performance Optimized**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Content Management**: JSON-based content system ready for future CMS integration
- **Contact Forms**: Client-side validation with spam protection (hCaptcha ready)
- **SEO Optimized**: Meta tags, structured data, and semantic HTML

## 📱 Pages

- **Home**: Hero section, latest news, upcoming events, quick links
- **About**: Mission, values, committee profiles, community information
- **Contact**: Contact form, committee directory, FAQ section
- **News**: Article listings, categories, newsletter signup
- **Guidelines**: Community rules, resident responsibilities, contact procedures

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Deployment**: Vercel (static export)
- **Content**: JSON files (future CMS ready)
- **Forms**: Formspree integration ready
- **CAPTCHA**: hCaptcha integration ready

## 🎨 Design System

### Color Palette
- **Primary**: Vibrant Green (#22C55E), Sky Blue (#3B82F6), Warm Beige (#F5F5DC)
- **Secondary**: Charcoal Grey (#374151), Earthy Brown (#8B4513), Clean White (#FFFFFF)
- **Accents**: Coral Orange (#F97316), Deep Teal (#0F766E)

### Typography
- **Font**: Inter (Google Fonts)
- **Mobile-First**: Responsive font sizing
- **Accessibility**: WCAG 2.1 AA compliant

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cgrs-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/
│   ├── contact/
│   ├── news/
│   ├── guidelines/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Layout components
│   ├── forms/              # Form components
│   └── content/            # Content-specific components
├── data/                   # JSON content files
│   ├── committee.json
│   ├── news.json
│   ├── events.json
│   └── site-config.json
├── lib/                    # Utility functions
│   ├── utils.ts
│   └── constants.ts
└── types/                  # TypeScript definitions
    └── index.ts
```

## 📝 Content Management

Content is currently managed through JSON files in the `src/data/` directory:

- **committee.json**: Committee member profiles
- **news.json**: News articles and updates
- **events.json**: Community events
- **site-config.json**: Site settings and configuration

### Future CMS Integration

The JSON structure is designed for easy migration to:
- Headless CMS (Strapi, Sanity)
- API-based content management
- Database integration

## 🔧 Configuration

### Tailwind CSS
Custom color palette and design tokens are configured in `tailwind.config.js`.

### Next.js
Static export configuration in `next.config.js` for Vercel deployment.

### TypeScript
Strict type checking with custom type definitions for content and components.

## 📱 Mobile Optimization

- **Mobile-First Design**: 40% of users are mobile
- **Touch-Friendly**: 44px minimum touch targets
- **Performance**: Optimized images and lazy loading
- **Responsive**: Breakpoints for all screen sizes

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `out`
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
# Upload the 'out' directory to your hosting provider
```

## 🔒 Security Features

- **Form Validation**: Client-side validation with TypeScript
- **Spam Protection**: hCaptcha integration ready
- **Input Sanitization**: XSS protection
- **HTTPS**: SSL certificate support

## 📊 Performance

- **Lighthouse Score**: Target >90
- **Core Web Vitals**: Optimized for all metrics
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic code splitting
- **Bundle Size**: Optimized bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or support, contact the CGRS committee:
- Email: cgrscommittee@gmail.com
- Chairperson: Louise Putt

## 📄 License

This project is proprietary to the Coronation Gardens Residents Society.

---

Built with ❤️ for the Coronation Gardens community
