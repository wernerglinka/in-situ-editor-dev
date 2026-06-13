/**
 * Image Grid - Justified Gallery Layout
 *
 * Creates a justified gallery where images in each row share the same height
 * but have varying widths based on their aspect ratios. Each row fills 100%
 * of the container width. Row heights adjust to fit the images.
 *
 * Algorithm based on the Justified Image Grid plugin approach:
 * 1. Build rows by accumulating images until row height drops to target
 * 2. Calculate integer widths for each image
 * 3. Distribute remaining pixels one at a time to avoid subpixel issues
 *
 * @module image-grid
 */

/**
 * Simple debounce function to limit resize calculations.
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Distributes remaining pixels across row items one at a time.
 * This is the key to avoiding subpixel rendering issues.
 *
 * @param {number[]} widths - Array of image widths to adjust
 * @param {number} remaining - Pixels to distribute (positive or negative)
 */
function distributeRemainingPixels(widths, remaining) {
  const adjustment = remaining > 0 ? 1 : -1;
  let index = 0;

  while (remaining !== 0) {
    widths[index] += adjustment;
    remaining -= adjustment;
    index = (index + 1) % widths.length;
  }
}

/**
 * Calculates and applies justified layout to an image grid.
 * Uses the JIG approach: build rows, calculate widths, distribute pixels.
 *
 * @param {HTMLElement} grid - The grid container element
 * @param {Map<HTMLElement, number>} aspectRatioCache - Cache of calculated aspect ratios
 */
function layoutJustifiedGrid(grid, aspectRatioCache) {
  const gap = parseInt(grid.dataset.gap, 10) || 6;
  const targetRowHeight = parseInt(grid.dataset.targetRowHeight, 10) || 200;
  const items = Array.from(grid.querySelectorAll('.image-grid-item'));

  if (items.length === 0) {return;}

  // Reset to block to measure natural width
  grid.style.display = 'block';

  // Get container width - floor to ensure we don't exceed available space
  const containerWidth = Math.floor(grid.getBoundingClientRect().width);

  // Build image data with aspect ratios
  const imageData = items.map((item, index) => ({
    index,
    item,
    aspectRatio: aspectRatioCache.get(item) || 1
  }));

  // Build rows by accumulating images until row height reaches target
  const rows = [];
  let currentRow = [];
  let rowAspectSum = 0;

  imageData.forEach((img, i) => {
    currentRow.push(img);
    rowAspectSum += img.aspectRatio;

    // Calculate what the row height would be with current images
    const gapsWidth = (currentRow.length - 1) * gap;
    const rowHeight = (containerWidth - gapsWidth) / rowAspectSum;

    const isLastImage = i === imageData.length - 1;

    if (isLastImage) {
      // Last image - finalize this row
      rows.push({
        images: [...currentRow],
        aspectSum: rowAspectSum,
        height: rowHeight,
        isLastRow: true
      });
      return;
    }

    // Check if we should break the row here
    // Break when row height drops to or below target
    if (rowHeight <= targetRowHeight) {
      rows.push({
        images: [...currentRow],
        aspectSum: rowAspectSum,
        height: rowHeight,
        isLastRow: false
      });
      currentRow = [];
      rowAspectSum = 0;
    }
  });

  // Use flexbox with wrap for precise control
  grid.style.display = 'flex';
  grid.style.flexWrap = 'wrap';
  grid.style.alignItems = 'flex-start';

  // Process each row
  rows.forEach((row) => {
    const numImages = row.images.length;
    const gapsWidth = (numImages - 1) * gap;
    const availableWidth = containerWidth - gapsWidth;

    // For last row that would be too tall (e.g., just 1-2 images),
    // use target height and don't fill. But if the row has enough images
    // that it's reasonably close to target, still fill it.
    const maxLastRowHeight = targetRowHeight * 2;
    const fillRow = !row.isLastRow || row.height <= maxLastRowHeight;
    const rowHeight = Math.round(fillRow ? row.height : targetRowHeight);

    // Calculate initial widths based on aspect ratios
    const widths = row.images.map(({ aspectRatio }) => {
      if (fillRow) {
        // Proportional width to fill row
        return Math.round((aspectRatio / row.aspectSum) * availableWidth);
      }
      // Natural width at row height
      return Math.round(rowHeight * aspectRatio);
    });

    // For rows that fill: distribute remaining pixels to match exactly
    if (fillRow) {
      const totalWidth = widths.reduce((sum, w) => sum + w, 0);
      const remaining = availableWidth - totalWidth;

      if (remaining !== 0) {
        distributeRemainingPixels(widths, remaining);
      }
    }

    // Apply styles to each image using flex items
    row.images.forEach(({ item }, posInRow) => {
      const isLastInRow = posInRow === numImages - 1;

      // Last item in row uses flex-grow to absorb any fractional pixel remainder
      // This prevents gaps from subpixel rendering issues
      if (fillRow && isLastInRow) {
        item.style.flex = `1 0 ${widths[posInRow]}px`;
        item.style.maxWidth = `${widths[posInRow] + 1}px`;
      } else {
        item.style.flex = '0 0 auto';
        item.style.maxWidth = '';
      }

      item.style.width = `${widths[posInRow]}px`;
      item.style.height = `${rowHeight}px`;
      item.style.marginRight = isLastInRow ? '0' : `${gap}px`;
      item.style.marginBottom = `${gap}px`;
      item.style.boxSizing = 'border-box';
    });
  });

  // Mark grid as laid out
  grid.classList.add('is-laid-out');
}

/**
 * Loads all images in a grid and calculates their aspect ratios.
 * Returns a promise that resolves when all images are loaded.
 *
 * @param {HTMLElement} grid - The grid container element
 * @returns {Promise<Map<HTMLElement, number>>} Map of items to their aspect ratios
 */
function loadImagesAndCalculateAspectRatios(grid) {
  const items = Array.from(grid.querySelectorAll('.image-grid-item'));
  const aspectRatioCache = new Map();

  const imagePromises = items.map((item) => {
    return new Promise((resolve) => {
      const img = item.querySelector('img');

      if (!img) {
        aspectRatioCache.set(item, 1);
        resolve();
        return;
      }

      // If image is already loaded, calculate immediately
      if (img.complete && img.naturalWidth > 0) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        aspectRatioCache.set(item, aspectRatio);
        resolve();
        return;
      }

      // Wait for image to load
      img.addEventListener(
        'load',
        () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          aspectRatioCache.set(item, aspectRatio);
          resolve();
        },
        { once: true }
      );

      // Handle load errors - fall back to 1:1 aspect ratio
      img.addEventListener(
        'error',
        () => {
          aspectRatioCache.set(item, 1);
          resolve();
        },
        { once: true }
      );
    });
  });

  return Promise.all(imagePromises).then(() => aspectRatioCache);
}

/**
 * Initializes all image grids on the page.
 * Waits for images to load, calculates aspect ratios, then applies layout.
 * Sets up resize observer for responsive relayout.
 */
function initImageGrids() {
  const grids = document.querySelectorAll('.js-image-grid');

  grids.forEach((grid) => {
    // Skip if already initialized
    if (grid.dataset.initialized) {return;}
    grid.dataset.initialized = 'true';

    // Load images and calculate aspect ratios, then layout
    loadImagesAndCalculateAspectRatios(grid).then((aspectRatioCache) => {
      // Initial layout
      layoutJustifiedGrid(grid, aspectRatioCache);

      // Relayout on resize using ResizeObserver for efficiency
      const resizeObserver = new ResizeObserver(
        debounce(() => {
          layoutJustifiedGrid(grid, aspectRatioCache);
        }, 50)
      );

      resizeObserver.observe(grid);

      // Store observer for cleanup
      grid._resizeObserver = resizeObserver;
    });
  });
}

/**
 * Cleanup image grids
 */
function cleanupImageGrids() {
  const grids = document.querySelectorAll('.js-image-grid[data-initialized]');
  grids.forEach((grid) => {
    if (grid._resizeObserver) {
      grid._resizeObserver.disconnect();
      grid._resizeObserver = null;
    }
  });
}

// Register with page transitions for SWUP support
if (window.PageTransitions) {
  window.PageTransitions.registerComponent('image-grid', initImageGrids);
  window.PageTransitions.registerCleanup('image-grid', cleanupImageGrids);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImageGrids);
} else {
  initImageGrids();
}
