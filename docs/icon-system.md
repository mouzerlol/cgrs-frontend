# Icon System Guide

## Overview

The project uses **Iconify** as the unified icon framework, with **MDI (Material Design Icons)** as the primary icon set. Iconify allows accessing icons from 100+ different icon sets through a single API.

## Iconify Framework

Iconify provides a unified interface to access icons from multiple collections:

```tsx
import { Icon } from '@iconify/react';

// Access any icon from any icon set
<Icon icon="mdi:facebook" />
<Icon icon="mdi:facebook-messenger" />
<Icon icon="heroicons:phone" />
<Icon icon="lucide:calendar" />
```

## Usage

### Custom Icons (Built-in)

```tsx
import Icon from '@/components/ui/Icon';

// Custom brand icons
<Icon name="nextdoor" size="lg" />
```

**Available custom icons:**
- `nextdoor` - Custom Nextdoor icon

### Iconify Icons (MDI - Material Design Icons)

```tsx
import Icon from '@/components/ui/Icon';

// Social media icons
<Icon name="mdi:facebook" size="lg" />
<Icon name="mdi:facebook-messenger" size="lg" />
<Icon name="mdi:instagram" size="lg" />
<Icon name="mdi:whatsapp" size="lg" />
<Icon name="mdi:twitter" size="lg" />
<Icon name="mdi:linkedin" size="lg" />

// UI icons
<Icon name="mdi:phone" size="md" />
<Icon name="mdi:email" size="md" />
<Icon name="mdi:calendar" size="md" />
<Icon name="mdi:chevron-right" size="md" />
<Icon name="mdi:account" size="md" />
<Icon name="mdi:home" size="md" />
<Icon name="mdi:information" size="md" />
```

## Icon Sets Available

- `@iconify-json/mdi` - Material Design Icons (6,000+ icons) - PRIMARY SET
- `@iconify-json/heroicons-outline` - Heroicons outline (optional)

### Adding More Icon Sets

```bash
# Lucide (clean outline icons)
npm install @iconify-json/lucide

# Tabler (modern UI icons)
npm install @iconify-json/tabler

# Phosphor (versatile icons)
npm install @iconify-json/phosphor

# Usage
<Icon name="lucide:calendar" size="md" />
<Icon name="tabler:home" size="md" />
<Icon name="phosphor:calendar" size="md" />
```

## Sizes

```tsx
<Icon name="icon-name" size="sm" />  // 16px
<Icon name="icon-name" size="md" />  // 24px (default)
<Icon name="icon-name" size="lg" />  // 32px
<Icon name="icon-name" size="xl" />  // 40px
```

## Finding Icons

Browse MDI icons at:
- https://pictogrammers.com/library/mdi/
- https://iconify.design/icon-sets.html
- https://icones.js.org (search any icon set)

## Social Media Icons (MDI)

```tsx
// Facebook
<Icon name="mdi:facebook" size="lg" />

// Messenger
<Icon name="mdi:facebook-messenger" size="lg" />

// Instagram
<Icon name="mdi:instagram" size="lg" />

// WhatsApp
<Icon name="mdi:whatsapp" size="lg" />

// X/Twitter
<Icon name="mdi:twitter" size="lg" />

// LinkedIn
<Icon name="mdi:linkedin" size="lg" />

// YouTube
<Icon name="mdi:youtube" size="lg" />
```

## Why Iconify + MDI?

- **Unified API** - Single component to access 200,000+ icons
- **Tree-shakeable** - Only bundled icons you actually use
- **MDI is comprehensive** - 6,000+ icons covers most use cases
- **Framework agnostic** - Works with React, Vue, Svelte, vanilla JS
- **No vendor lock-in** - Can switch icon sets without code changes
