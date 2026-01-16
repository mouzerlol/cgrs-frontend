---
name: Map Page with Interactive Development Map
overview: Create a dedicated `/map` page with a large, interactive Leaflet map showing Coronation Gardens development with full controls, boundary highlighting, road names, and additional features for exploring the community.
todos:
  - id: create_map_page
    content: Create /map page route with PageHeader
    status: completed
  - id: create_interactive_map
    content: Create InteractiveMap component with full Leaflet controls
    status: completed
  - id: share_boundary_coords
    content: Extract boundary coordinates to shared constant
    status: completed
  - id: add_poi_data
    content: Add POI data structure for community locations
    status: completed
  - id: update_footer_link
    content: Update Footer to link to /map
    status: completed
  - id: add_map_styles
    content: Add responsive CSS for map page
    status: completed
---

## Overview

Create a new Map page at `/map` with an interactive Leaflet map that allows users to explore Coronation Gardens in detail.

## Files to Create/Modify

### 1. Create Page Route

**File:** `src/app/map/page.tsx`

```tsx
'use client';

import PageHeader from '@/components/sections/PageHeader';
import InteractiveMap from '@/components/map/InteractiveMap';

export default function MapPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Explore Coronation Gardens"
        description="View our community boundaries, nearby amenities, and points of interest."
        eyebrow="Community Map"
        backgroundImage="/images/mangere-mountain.jpg"
      />
      <InteractiveMap />
    </div>
  );
}
```

### 2. Create Interactive Map Component

**File:** `src/components/map/InteractiveMap.tsx`

- Enable all Leaflet controls (zoom, attribution, etc.)
- Higher zoom level (17-18)
- Terracotta boundary polygon (same coordinates as BoundaryMap)
- Street names labels
- Points of interest markers (park, facilities, etc.)
- Fullscreen button
- Layer controls
- Location finder

### 3. Modify Footer to Link to Map

**File:** `src/components/layout/Footer.tsx`

```tsx
<Link href="/map" className="footer-map-link">
  <BoundaryMap />
</Link>
```

### 4. Add CSS for Map Page

**File:** `src/app/globals.css`

- Map container styles
- Full-width map layout
- Side panel for location info
- Responsive breakpoints

## Suggested Features

1. **Interactive Controls**

   - Zoom in/out buttons
   - Fullscreen toggle
   - Current location button
   - Layer selector (boundaries, POIs, etc.)

2. **Points of Interest**

   - Community facilities
   - Parks and green spaces
   - Parking areas
   - Entry points

3. **Location Info Panel**

   - Click on boundary for details
   - Lot information
   - Community resources

4. **Map Features**

   - Terracotta boundary outline (2px)
   - Subtle fill (12% opacity)
   - All street names visible
   - POI markers with tooltips

## Implementation Steps

1. Create `/map` page route
2. Build `InteractiveMap` component with full controls
3. Extract boundary coordinates to shared constant
4. Add POI data structure
5. Update Footer to link to `/map`
6. Add responsive CSS styles

## Questions

**Q: Should the POI (points of interest) markers be:**

- A) Just shown on the map (passive)
- B) Clickable with information popups (interactive)
- C) Both (show on map AND clickable)

**Q: Do you want a sidebar panel showing location details when clicking on the map, or just inline popups?**