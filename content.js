(function () {
  'use strict';

  function findRichTextFieldWrappers(root = document) {
    const targets = [];
    const richTextRegions = root.querySelectorAll('[data-testid*="rich-text"]');
    richTextRegions.forEach(region => {
      const wrappers = region.querySelectorAll('[role="presentation"]');
      wrappers.forEach(w => {
        if (w.closest('[role="toolbar"]')) return;

        if (w instanceof HTMLElement && !targets.includes(w)) {
          targets.push(w);
        }
      });
      if (region instanceof HTMLElement && region.getAttribute('role') === 'presentation' && !targets.includes(region)) {
        if (!region.closest('[role="toolbar"]')) {
          targets.push(region);
        }
      }
    });
    return targets;
  }

  function isFieldEmpty(element) {
    const richTextRegion = element.closest('[data-testid*="rich-text"]');
    if (!richTextRegion) return false;

    const button = richTextRegion.querySelector('button');
    if (!button) return false;

    const ariaLabel = button.getAttribute('aria-label') || '';
    return ariaLabel.toLowerCase().startsWith('add');
  }

  const GUARD_MARKER = '_jiraEditGuarded';

  function installGuards(root = document) {
    const wrappers = findRichTextFieldWrappers(root);
    wrappers.forEach(w => {
      if (w[GUARD_MARKER]) return;
      w[GUARD_MARKER] = true;

      // Add title hint for discoverability
      if (!w.title) {
        w.title = '⌥ Option-click to edit';
      }

      w.addEventListener('click', ev => {
        if (ev.altKey || ev.metaKey || ev.ctrlKey) return;
        // Allow single-click on empty fields
        if (isFieldEmpty(ev.target)) return;
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      }, true);
      w.addEventListener('mousedown', ev => {
        if (ev.altKey || ev.metaKey || ev.ctrlKey) return;
        // Allow single-click on empty fields
        if (isFieldEmpty(ev.target)) return;
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      }, true);
    });
  }

  function onReady(fn) {
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }

  onReady(() => {
    installGuards(document);

    const observer = new MutationObserver(() => {
      installGuards(document);
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
})();
