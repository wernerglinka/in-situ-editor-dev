/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: MIT
 */

import { cleanupOrphanedImages } from '../utils/db-storage.js';

/**
 * Performs housekeeping on drafts by cleaning up orphaned images and
 * ensuring only referenced images are kept in the draft metadata.
 * @param {Array<Object>} drafts - The list of drafts.
 * @param {Function} saveDraftsFn - Function to save drafts to storage.
 */
export async function performHousekeeping(drafts, saveDraftsFn) {
  const allValidImageIds = [];
  drafts.forEach((draft) => {
    // Sections reference images by imageName/imageId; the legacy markdown
    // body referenced them as ./<name>. Treat either as a live reference —
    // the upstream content-only check pruned every section image and then
    // deleted its blob from IndexedDB as "orphaned".
    (draft.sections || []).forEach((s) => {
      if (s.imageId) {
        allValidImageIds.push(s.imageId);
      }
    });
    if (!draft.imageFiles || draft.imageFiles.length === 0) {
      return;
    }
    const sectionImageNames = new Set((draft.sections || []).map((s) => s.imageName).filter(Boolean));
    draft.imageFiles = draft.imageFiles.filter((img) => {
      const isReferenced =
        sectionImageNames.has(img.name) || (draft.content || '').includes(`./${img.name}`);
      if (isReferenced) {
        allValidImageIds.push(img.id);
      }
      return isReferenced;
    });
  });
  saveDraftsFn();
  await cleanupOrphanedImages(allValidImageIds);
}
