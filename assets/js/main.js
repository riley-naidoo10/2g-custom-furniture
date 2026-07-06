// 2G Custom Furniture — lightweight interactions for static hosting.
(function () {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelectorAll('.nav-links a');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 18);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      body.classList.toggle('nav-open');
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      body.classList.remove('nav-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const open = item.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
  });

  const form = document.querySelector('[data-quote-form]');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent('2G Custom Furniture Website Enquiry');
      const bodyLines = [
        'New website enquiry:',
        '',
        `Name: ${data.get('name') || ''}`,
        `Phone: ${data.get('phone') || ''}`,
        `Email: ${data.get('email') || ''}`,
        `Project type: ${data.get('project') || ''}`,
        `Location: ${data.get('location') || ''}`,
        '',
        'Project details:',
        data.get('message') || ''
      ];
      const mailto = `mailto:info@2gcustomfurniture.co.za?subject=${subject}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
      window.location.href = mailto;
    });
  }
})();
