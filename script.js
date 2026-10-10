// ---------- Reduced motion check ----------
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) document.documentElement.classList.add('reduced-motion');

// ---------- Year ----------
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Navbar scroll ----------
const navbar = document.getElementById('navbar');
if (navbar) {
  const updateNav = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });
}

// ---------- Mobile menu ----------
const toggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (toggle && mobileMenu) {
  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  };
  const openMenu = () => {
    mobileMenu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  };
  toggle.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !toggle.contains(e.target)) {
      closeMenu();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
  });
}

// ---------- Cursor glow ----------
const glow = document.getElementById('cursor-glow');
if (glow && !prefersReducedMotion) {
  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  let tx = cx;
  let ty = cy;

  window.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  (function loop() {
    cx += (tx - cx) * 0.15;
    cy += (ty - cy) * 0.15;
    glow.style.transform = `translate3d(${cx - 180}px, ${cy - 180}px, 0)`;
    requestAnimationFrame(loop);
  })();
}

// ---------- Typing animation (home page only) ----------
const ROLES = ['AI/ML Enthusiast', 'Django Developer', 'Python Developer'];
const typedEl = document.getElementById('typed');
if (typedEl) {
  if (prefersReducedMotion) {
    typedEl.textContent = ROLES[0];
  } else {
    let ri = 0, ci = 0, deleting = false;
    const type = () => {
      const word = ROLES[ri % ROLES.length];
      typedEl.textContent = deleting ? word.substring(0, ci--) : word.substring(0, ci++);
      if (!deleting && ci === word.length + 1) { deleting = true; setTimeout(type, 1400); return; }
      if (deleting && ci === -1) { deleting = false; ri++; ci = 0; }
      setTimeout(type, deleting ? 45 : 75);
    };
    type();
  }
}

// ---------- Reveal on scroll (with stagger for grid children) ----------
const revealTargets = document.querySelectorAll('.reveal');
revealTargets.forEach(section => {
  const items = section.querySelectorAll('.card, .exp-card, .timeline-item');
  items.forEach((el, i) => { el.style.transitionDelay = prefersReducedMotion ? '0ms' : `${Math.min(i * 80, 320)}ms`; });
});
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
revealTargets.forEach(el => io.observe(el));

// ---------- Count-up stats ----------
const statObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.stat-num').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      if (prefersReducedMotion) { el.textContent = target + suffix; return; }
      const dur = 1500;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    statObs.unobserve(e.target);
  });
}, { threshold: 0.3 });
const sg = document.getElementById('statsGrid');
if (sg) statObs.observe(sg);

// ---------- Particle background ----------
(function particles() {
  const canvas = document.getElementById('particles');
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0, parts = [], resizeTimer;

  const build = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * DPR; canvas.height = h * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const count = Math.min(80, Math.floor((w * h) / 20000));
    parts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.6 + .4
    }));
  };
  build();
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  });

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(167,139,250,0.6)'; ctx.fill();
    }
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const a = parts[i], b = parts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.strokeStyle = `rgba(139,92,246,${(1 - d / 120) * 0.28})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

// ---------- Project tilt ----------
if (!prefersReducedMotion) {
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ---------- Project screenshot galleries (projects page) ----------
document.querySelectorAll('[data-gallery]').forEach(gallery => {
  const slides = Array.from(gallery.querySelectorAll('.gallery-slide'));
  const thumbs = Array.from(gallery.querySelectorAll('.thumb'));
  const prevBtn = gallery.querySelector('.gallery-nav.prev');
  const nextBtn = gallery.querySelector('.gallery-nav.next');
  const currentEl = gallery.querySelector('[data-current]');
  const totalEl = gallery.querySelector('[data-total]');
  if (!slides.length) return;

  let index = 0;
  if (totalEl) totalEl.textContent = slides.length;

  const show = (i) => {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('active', n === index));
    thumbs.forEach((t, n) => {
      t.classList.toggle('active', n === index);
      t.setAttribute('aria-selected', n === index ? 'true' : 'false');
    });
    if (currentEl) currentEl.textContent = index + 1;
  };

  prevBtn && prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn && nextBtn.addEventListener('click', () => show(index + 1));
  thumbs.forEach((t, n) => t.addEventListener('click', () => show(n)));

  gallery.querySelector('.gallery-main').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  // Basic touch swipe support
  let touchStartX = null;
  const main = gallery.querySelector('.gallery-main');
  main.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  main.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });
});

// ---------- Contact form (contact page only) ----------
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
if (form && status) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name.trim() || !data.email.trim() || !data.subject.trim() || data.message.trim().length < 5) {
      status.textContent = 'Please fill all fields (message ≥ 5 characters).';
      status.style.color = '#f87171';
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      status.textContent = 'Please enter a valid email.';
      status.style.color = '#f87171';
      return;
    }
    const subject = encodeURIComponent(data.subject);
    const body = encodeURIComponent(`From: ${data.name} <${data.email}>\n\n${data.message}`);
    window.location.href = `mailto:anishakumpakha36@gmail.com?subject=${subject}&body=${body}`;
    status.textContent = 'Opening your email client…';
    status.style.color = '';
    form.reset();
  });
}

// ---------- Smooth internal anchors ---------- (native via CSS scroll-behavior)
