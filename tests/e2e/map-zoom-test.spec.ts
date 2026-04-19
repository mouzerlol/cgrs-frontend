import { test, expect } from '@playwright/test';

test.describe('Map Zoom Investigation', () => {
  test('investigates tile loading at different zoom levels', async ({ page }) => {
    await page.goto('/design-system');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get all map containers on the page
    const getTileInfo = async () => {
      return page.evaluate(() => {
        const containers = document.querySelectorAll('.leaflet-container');
        return Array.from(containers).map((container, i) => {
          const tiles = container.querySelectorAll('.leaflet-tile-container img');
          return {
            index: i,
            id: container.id,
            classes: container.className.substring(0, 50),
            tileCount: tiles.length,
            tileZooms: Array.from(tiles).slice(0, 6).map(t => {
              const src = t.getAttribute('src') || '';
              const match = src.match(/\/(\d+)\/\d+\/\d+\.png/);
              return match ? parseInt(match[1]) : 'no-match';
            }),
            loadedSrcs: Array.from(tiles).slice(0, 2).map(t => {
              const src = t.getAttribute('src') || '';
              return src.substring(0, 80);
            })
          };
        });
      });
    };

    const initial = await getTileInfo();
    console.log('Initial state:', JSON.stringify(initial, null, 2));

    // Now let's try to zoom using mouse wheel simulation
    const mapContainer = page.locator('.leaflet-container').first();
    await mapContainer.scrollIntoViewIfNeeded();

    // Try scrolling to zoom in
    await mapContainer.hover();
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(300);
    }

    const afterScroll = await getTileInfo();
    console.log('After scroll zoom:', JSON.stringify(afterScroll, null, 2));

    // Take screenshot
    await page.screenshot({ path: 'map-zoom-test.png', fullPage: true });
    console.log('Screenshot saved');
  });

  test('creates a simple test page to understand tile behavior', async ({ page }) => {
    // Create a minimal page to understand Leaflet zoom behavior
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      </head>
      <body>
        <div id="map" style="width: 500px; height: 400px;"></div>
        <div id="info"></div>
        <script>
          const map = L.map('map').setView([-36.9497, 174.7912], 16);

          // Test with maxZoom: 21, maxNativeZoom: 19
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 21,
            maxNativeZoom: 19,
            attribution: 'OSM'
          }).addTo(map);

          // Log tile events
          map.on('zoomend', function() {
            const info = document.getElementById('info');
            const tiles = document.querySelectorAll('.leaflet-tile-container img');
            const tileZooms = Array.from(tiles).slice(0,6).map(t => {
              const src = t.getAttribute('src') || '';
              const match = src.match(/\\/(\\d+)\\/\\d+\\/\\d+\\.png/);
              return match ? match[1] : '?';
            });
            info.innerHTML = 'Zoom: ' + map.getZoom() +
              ', MaxZoom: ' + map.getMaxZoom() +
              ', Tiles: ' + tiles.length +
              ', TileZooms: ' + tileZooms.join(', ');
          });
        </script>
      </body>
      </html>
    `);

    await page.waitForTimeout(3000); // Wait for tiles to load

    // Get initial state
    let info = await page.locator('#info').textContent();
    console.log('Initial:', info);

    // Zoom to 17
    await page.evaluate(() => {
      const map = window.L.map;
      const maps = document.querySelectorAll('.leaflet-container');
      maps.forEach(c => {
        if (c._leaflet_id) {
          const m = window.L.map._instances.get(c._leaflet_id);
          if (m) m.setZoom(17);
        }
      });
    });
    await page.waitForTimeout(1000);
    info = await page.locator('#info').textContent();
    console.log('After zoom 17:', info);

    // Zoom to 19
    await page.evaluate(() => {
      document.querySelectorAll('.leaflet-container').forEach(c => {
        if (c._leaflet_id) {
          const m = window.L.map._instances.get(c._leaflet_id);
          if (m) m.setZoom(19);
        }
      });
    });
    await page.waitForTimeout(1000);
    info = await page.locator('#info').textContent();
    console.log('After zoom 19:', info);

    // Zoom to 20
    await page.evaluate(() => {
      document.querySelectorAll('.leaflet-container').forEach(c => {
        if (c._leaflet_id) {
          const m = window.L.map._instances.get(c._leaflet_id);
          if (m) m.setZoom(20);
        }
      });
    });
    await page.waitForTimeout(1000);
    info = await page.locator('#info').textContent();
    console.log('After zoom 20:', info);

    // Zoom to 21
    await page.evaluate(() => {
      document.querySelectorAll('.leaflet-container').forEach(c => {
        if (c._leaflet_id) {
          const m = window.L.map._instances.get(c._leaflet_id);
          if (m) m.setZoom(21);
        }
      });
    });
    await page.waitForTimeout(1000);
    info = await page.locator('#info').textContent();
    console.log('After zoom 21:', info);

    await page.screenshot({ path: 'minimal-map-test.png' });
  });
});