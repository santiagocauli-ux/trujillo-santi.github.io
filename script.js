// ---------- Nav scroll state + mobile toggle ----------
const nav = document.querySelector('.site-nav');
const navLinks = document.querySelector('.nav-links');
const navToggle = document.querySelector('.nav-toggle');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// highlight active section link
const sections = document.querySelectorAll('main section[id]');
const linkMap = {};
navLinks.querySelectorAll('a[href^="#"]').forEach(a => {
  linkMap[a.getAttribute('href').slice(1)] = a;
});
const obs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const link = linkMap[entry.target.id];
    if (!link) return;
    if (entry.isIntersecting) {
      Object.values(linkMap).forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -45% 0px' });
sections.forEach(s => obs.observe(s));

// ---------- Starfield (hero signature) ----------
const canvas = document.getElementById('starfield');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;

  function resize() {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    const count = Math.floor((w * h) / 14000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.75,
      r: Math.random() * 1.3 * devicePixelRatio + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.6
    }));
  }
  window.addEventListener('resize', resize);
  resize();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Trois étoiles filantes indépendantes, avec une légère variation de taille
  // et de vitesse pour que ça ne paraisse pas répétitif.
  const shootConfigs = [
    { sizeMul: 1,    speed: 0.012, chance: 0.0022 }, // taille de référence
    { sizeMul: 0.7,  speed: 0.016, chance: 0.0016 }, // plus petite, un peu plus rapide
    { sizeMul: 1.35, speed: 0.009, chance: 0.0011 }  // plus grande, plus lente
  ];
  const shoots = [null, null, null];

  function drawShootingStar(t) {
    shootConfigs.forEach((cfg, i) => {
      if (!shoots[i] && Math.random() < cfg.chance) {
        shoots[i] = {
          x: w * (0.5 + Math.random() * 0.35),
          y: h * (Math.random() * 0.18),
          len: 140 * devicePixelRatio * cfg.sizeMul,
          angle: 2.4,
          progress: 0,
          speed: cfg.speed,
          width: 1.4 * devicePixelRatio * cfg.sizeMul
        };
      }
      const s = shoots[i];
      if (s) {
        s.progress += s.speed;
        const x2 = s.x + Math.cos(s.angle) * s.len * s.progress;
        const y2 = s.y + Math.sin(s.angle) * s.len * s.progress;
        const x1 = x2 - Math.cos(s.angle) * s.len * 0.4;
        const y1 = y2 - Math.sin(s.angle) * s.len * 0.4;
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, 'rgba(244,237,226,0)');
        grad.addColorStop(1, 'rgba(244,237,226,0.9)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        if (s.progress > 1.3) shoots[i] = null;
      }
    });
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      const twinkle = 0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase);
      ctx.beginPath();
      ctx.fillStyle = `rgba(244,237,226,${0.15 + twinkle * 0.55})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    drawShootingStar(t);
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ---------- Lightbox ----------
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');
const lightboxClose = lightbox.querySelector('.lightbox-close');

document.querySelectorAll('.piece').forEach(piece => {
  piece.addEventListener('click', () => {
    const img = piece.querySelector('img');
    const title = piece.querySelector('.p-title')?.textContent || '';
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = title;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
