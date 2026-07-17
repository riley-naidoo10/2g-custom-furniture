// 2G Custom Furniture — lightweight, accessible interactions for static hosting.
(function () {
  'use strict';

  const body = document.body;
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelectorAll('.nav-links a');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Splash screen: full brand reveal once per browser session, then fast page transitions.
  const splash = document.getElementById('site-splash');
  let splashSeen = false;
  try { splashSeen = sessionStorage.getItem('2g-splash-seen') === '1'; } catch (_) {}

  function hideSplash(delay) {
    if (!splash) return;
    window.setTimeout(() => {
      splash.classList.add('is-hidden');
      splash.setAttribute('aria-hidden', 'true');
      body.classList.remove('splash-active');
    }, delay);
  }

  if (splash && !reduceMotion && !splashSeen) {
    body.classList.add('splash-active');
    splash.setAttribute('aria-hidden', 'false');
    try { sessionStorage.setItem('2g-splash-seen', '1'); } catch (_) {}
    // Allow the logo reveal to complete without making visitors wait unnecessarily.
    if (document.readyState === 'complete') hideSplash(1450);
    else window.addEventListener('load', () => hideSplash(1100), { once: true });
    window.setTimeout(() => hideSplash(0), 2100);
  } else if (splash) {
    splash.classList.add('is-hidden');
  }

  // Header and mobile navigation.
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 18);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function closeMenu() {
    body.classList.remove('nav-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
      body.classList.toggle('nav-open');
    });
  }

  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Prevent a stale open drawer after device rotation or resizing to desktop.
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && body.classList.contains('nav-open')) closeMenu();
  }, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && body.classList.contains('nav-open')) closeMenu();
  });

  // Refined entrance reveals.
  const revealEls = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.11, rootMargin: '0px 0px -4% 0px' });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // FAQ accordion.
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      if (!item) return;
      const open = item.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
      const icon = button.querySelector('span:last-child');
      if (icon) icon.textContent = open ? '−' : '+';
    });
  });

  // Static quote form: open a fully populated email draft.
  const form = document.querySelector('[data-quote-form]');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent('2G Custom Furniture Website Enquiry');
      const bodyLines = [
        'New website enquiry:', '',
        `Name: ${data.get('name') || ''}`,
        `Phone: ${data.get('phone') || ''}`,
        `Email: ${data.get('email') || ''}`,
        `Project type: ${data.get('project') || ''}`,
        `Location: ${data.get('location') || ''}`, '',
        'Project details:', data.get('message') || ''
      ];
      window.location.href = `mailto:info@2gcustom.co.za?subject=${subject}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
    });
  }

  // Every project image on the main pages opens the dedicated gallery.
  if (body.dataset.page !== 'gallery') {
    function categoryForImage(img) {
      const article = img.closest('article[id]');
      if (article && ['custom','kitchens','bedrooms','living','office','vanities','repairs'].includes(article.id)) return article.id;
      const src = (img.getAttribute('src') || '').toLowerCase();
      if (src.includes('bedroom') || src.includes('walkin')) return 'bedrooms';
      if (src.includes('kitchen')) return 'kitchens';
      if (src.includes('living') || src.includes('fireplace')) return 'living';
      if (src.includes('vanit')) return 'vanities';
      if (src.includes('repair') || src.includes('refurb')) return 'repairs';
      if (src.includes('office') || src.includes('workstation')) return 'office';
      return 'custom';
    }

    function openGalleryFor(img) {
      const category = categoryForImage(img);
      const destination = `gallery.html?filter=${encodeURIComponent(category)}#gallery-grid`;
      if (reduceMotion) {
        window.location.href = destination;
        return;
      }
      body.classList.add('page-leaving');
      window.setTimeout(() => { window.location.href = destination; }, 430);
    }

    document.querySelectorAll('main img[data-gallery-link="true"]').forEach(img => {
      img.classList.add('gallery-linked-image');
      img.setAttribute('role', 'link');
      img.setAttribute('tabindex', '0');
      img.setAttribute('aria-label', `${img.alt || 'Project image'}. View in gallery.`);
      img.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        openGalleryFor(img);
      });
      img.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openGalleryFor(img);
        }
      });
    });

    document.querySelectorAll('.hero-media').forEach(media => {
      media.addEventListener('click', () => {
        const img = media.querySelector('img[data-gallery-link="true"]');
        if (img) openGalleryFor(img);
      });
    });
  }

  // Filterable gallery and keyboard-friendly lightbox.
  const galleryCards = Array.from(document.querySelectorAll('.gallery-card'));
  const filterButtons = document.querySelectorAll('.gallery-filter');
  const lightbox = document.querySelector('.lightbox');
  let visibleCards = galleryCards;
  let activeIndex = 0;
  let lastFocusedCard = null;

  function applyFilter(filter, updateUrl = true) {
    visibleCards = [];
    galleryCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.hidden = !show;
      if (show) visibleCards.push(card);
    });
    filterButtons.forEach(button => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (updateUrl && history.replaceState) {
      const url = new URL(window.location.href);
      if (filter === 'all') url.searchParams.delete('filter');
      else url.searchParams.set('filter', filter);
      try { history.replaceState(null, '', url.pathname + url.search + url.hash); } catch (_) {}
    }
  }

  if (galleryCards.length) {
    const requested = new URLSearchParams(window.location.search).get('filter');
    const valid = Array.from(filterButtons).some(button => button.dataset.filter === requested);
    applyFilter(valid ? requested : 'all', false);

    filterButtons.forEach(button => {
      button.addEventListener('click', () => applyFilter(button.dataset.filter));
    });
  }

  function renderLightbox(index) {
    if (!lightbox || !visibleCards.length) return;
    activeIndex = (index + visibleCards.length) % visibleCards.length;
    const card = visibleCards[activeIndex];
    const image = lightbox.querySelector('figure img');
    const caption = lightbox.querySelector('figcaption');
    image.src = card.dataset.full;
    image.alt = card.dataset.caption || card.querySelector('img')?.alt || 'Project image';
    caption.textContent = card.dataset.caption || '';
  }

  function openLightbox(card) {
    if (!lightbox) return;
    lastFocusedCard = card;
    activeIndex = Math.max(0, visibleCards.indexOf(card));
    renderLightbox(activeIndex);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('lightbox-open');
    lightbox.querySelector('.lightbox-close')?.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('lightbox-open');
    if (lastFocusedCard) lastFocusedCard.focus();
  }

  galleryCards.forEach(card => card.addEventListener('click', () => openLightbox(card)));
  lightbox?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox?.querySelector('.lightbox-prev')?.addEventListener('click', () => renderLightbox(activeIndex - 1));
  lightbox?.querySelector('.lightbox-next')?.addEventListener('click', () => renderLightbox(activeIndex + 1));
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', event => {
    if (!lightbox?.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') renderLightbox(activeIndex - 1);
    if (event.key === 'ArrowRight') renderLightbox(activeIndex + 1);
  });

  // Polished transition for same-site page navigation. Hash links stay instant/smooth.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank' || link.hasAttribute('download')) return;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname && destination.search === window.location.search) return;
    if (reduceMotion) return;
    event.preventDefault();
    body.classList.add('page-leaving');
    window.setTimeout(() => { window.location.href = destination.href; }, 430);
  });

  window.addEventListener('pageshow', () => body.classList.remove('page-leaving'));
})();
