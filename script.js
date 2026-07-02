const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================================
// Horloge du bandeau de statut
// ============================================================
function updateClock(){
  const el = document.getElementById('clock');
  if(!el) return;
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
updateClock();
setInterval(updateClock, 1000);

// ============================================================
// Effet machine à écrire — titre principal
// ============================================================
const heroTitleText = { fr: 'NARRATIVE & GAME DESIGN', en: 'NARRATIVE & GAME DESIGN' };

function typewrite(el, text, speed = 42){
  if(!el) return;
  if(reduceMotion){ el.textContent = text; return; }
  let i = 0;
  el.textContent = '';
  (function step(){
    if(i <= text.length){
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(step, speed);
    }
  })();
}

window.addEventListener('DOMContentLoaded', () => {
  typewrite(document.getElementById('typewriter'), heroTitleText.fr, 40);
});

// ============================================================
// PAGER — navigation en planches horizontales
// ============================================================
const track = document.getElementById('pagerTrack');
const pages = Array.from(document.querySelectorAll('.page'));
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const dotsWrap = document.getElementById('reelDots');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const pageCurrentEl = document.getElementById('pageCurrent');
const pageTotalEl = document.getElementById('pageTotal');

const total = pages.length;
let current = 0;

// génère les points de la bobine
pages.forEach((p, i) => {
  const dot = document.createElement('button');
  dot.className = 'reel-dot' + (i === 0 ? ' is-active' : '');
  dot.setAttribute('aria-label', `Aller à la page ${i + 1}`);
  dot.addEventListener('click', () => goToPage(i));
  dotsWrap.appendChild(dot);
});
const dots = Array.from(dotsWrap.children);

if(pageTotalEl) pageTotalEl.textContent = String(total).padStart(2, '0');

function goToPage(index){
  index = Math.max(0, Math.min(total - 1, index));
  current = index;

  track.style.transform = `translateX(-${index * (100 / total)}%)`;

  navLinks.forEach(link => {
    const linkIndex = Number(link.dataset.page);
    link.classList.toggle('is-active', linkIndex === index);
  });

  dots.forEach((d, i) => d.classList.toggle('is-active', i === index));

  if(pageCurrentEl) pageCurrentEl.textContent = String(index + 1).padStart(2, '0');
  if(prevBtn) prevBtn.disabled = index === 0;
  if(nextBtn) nextBtn.disabled = index === total - 1;

  // reset le scroll vertical de la page qu'on quitte / rejoint
  pages[index].scrollTop = 0;

  history.replaceState(null, '', '#' + pages[index].id);
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    goToPage(Number(link.dataset.page));
  });
});

prevBtn.addEventListener('click', () => goToPage(current - 1));
nextBtn.addEventListener('click', () => goToPage(current + 1));

document.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowRight') goToPage(current + 1);
  if(e.key === 'ArrowLeft') goToPage(current - 1);
});

// page initiale selon le hash de l'URL
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  const initial = pages.findIndex(p => p.id === hash);
  goToPage(initial >= 0 ? initial : 0);
});

// ============================================================
// Apparition au scroll — dossiers de projet / extraits
// ============================================================
const revealTargets = document.querySelectorAll('.case, .excerpt');
const barTargets = document.querySelectorAll('.diag-fill');

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
revealTargets.forEach(el => io.observe(el));

const barIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      barIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
barTargets.forEach(el => barIO.observe(el));

// ============================================================
// Switch FR / EN — infrastructure (contenu à traduire plus tard)
// ============================================================
const langSwitch = document.getElementById('langSwitch');
let lang = 'fr';

function applyLang(newLang){
  lang = newLang;
  document.querySelectorAll('[data-fr][data-en]').forEach(el => {
    el.textContent = el.dataset[lang];
  });
  langSwitch.querySelector('.lang-fr').classList.toggle('is-active', lang === 'fr');
  langSwitch.querySelector('.lang-en').classList.toggle('is-active', lang === 'en');
  document.documentElement.lang = lang;
}

langSwitch.addEventListener('click', () => {
  applyLang(lang === 'fr' ? 'en' : 'fr');
});
