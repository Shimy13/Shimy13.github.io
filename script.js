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
// Année dans le footer
// ============================================================
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

// ============================================================
// Effet machine à écrire — titre principal
// ============================================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Titre tapé au chargement : une phrase par langue.
// -> à traduire quand la version anglaise sera prête.
const TITLES = {
  fr: 'NARRATIVE & GAME DESIGN',
  en: 'NARRATIVE & GAME DESIGN'
};

function typewrite(el, text, speed = 45){
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
  typewrite(document.getElementById('typewriter'), TITLES[currentLang], 40);
});

// petite boucle dans le bloc de transmission — une liste par langue
// -> à traduire quand la version anglaise sera prête.
const LOOP_PHRASES = {
  fr: ['en attente de transmission entrante...', 'canal ouvert.', 'prêt·e à collaborer.'],
  en: ['en attente de transmission entrante...', 'canal ouvert.', 'prêt·e à collaborer.']
};
const loopEl = document.getElementById('loop');
let loopIndex = 0;
let loopTimer = null;

function runLoop(){
  if(!loopEl || reduceMotion){ if(loopEl) loopEl.textContent = LOOP_PHRASES[currentLang][0]; return; }
  const phrases = LOOP_PHRASES[currentLang];
  const phrase = phrases[loopIndex % phrases.length];
  let i = 0;
  loopEl.textContent = '';
  const typeStep = setInterval(() => {
    loopEl.textContent = phrase.slice(0, i);
    i++;
    if(i > phrase.length){
      clearInterval(typeStep);
      loopTimer = setTimeout(() => {
        let j = phrase.length;
        const eraseStep = setInterval(() => {
          loopEl.textContent = phrase.slice(0, j);
          j--;
          if(j < 0){
            clearInterval(eraseStep);
            loopIndex++;
            loopTimer = setTimeout(runLoop, 400);
          }
        }, 25);
      }, 1600);
    }
  }, 45);
}
window.addEventListener('DOMContentLoaded', runLoop);

// ============================================================
// Apparition au scroll — dossiers de projet + barres de diagnostic
// ============================================================
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.case').forEach(el => io.observe(el));

const barIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      barIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.diag-fill').forEach(el => barIO.observe(el));

// ============================================================
// NAVIGATION HORIZONTALE ENTRE PANNEAUX
// ============================================================
const viewport = document.getElementById('viewport');
const track = document.getElementById('track');
const panels = Array.from(document.querySelectorAll('.panel'));
const tabs = Array.from(document.querySelectorAll('.tab'));

function currentPanelIndex(){
  let closest = 0, closestDist = Infinity;
  panels.forEach((p, i) => {
    const dist = Math.abs(p.offsetLeft - viewport.scrollLeft);
    if(dist < closestDist){ closestDist = dist; closest = i; }
  });
  return closest;
}

function goToPanel(index){
  const clamped = Math.max(0, Math.min(panels.length - 1, index));
  viewport.scrollTo({ left: panels[clamped].offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
}

function setActiveTab(index){
  tabs.forEach((t, i) => t.classList.toggle('is-active', i === index));
}

// clic sur un onglet ou un bouton [data-target]
document.querySelectorAll('[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const idx = panels.findIndex(p => p.id === btn.dataset.target);
    if(idx !== -1) goToPanel(idx);
  });
});

// molette : navigue à l'intérieur d'un panneau tant qu'il y a du contenu
// à lire en dessous/au-dessus, sinon passe au panneau suivant/précédent.
let wheelCooldown = false;

viewport.addEventListener('wheel', (e) => {
  // swipe horizontal natif (trackpad) : on laisse faire, pas de conversion
  if(Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

  const scroller = e.target.closest('.panel-scroll');
  const goingDown = e.deltaY > 0;

  if(scroller){
    const atTop = scroller.scrollTop <= 1;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
    if(goingDown && !atBottom) return;   // laisse défiler vers le bas normalement
    if(!goingDown && !atTop) return;     // laisse défiler vers le haut normalement
  }

  // on est à une extrémité (ou pas de contenu scrollable) : on change de panneau
  e.preventDefault();
  if(wheelCooldown) return;
  wheelCooldown = true;
  setTimeout(() => wheelCooldown = false, 650);

  const idx = currentPanelIndex();
  goToPanel(idx + (goingDown ? 1 : -1));
}, { passive: false });

// clavier : flèches gauche/droite pour changer de panneau
window.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowRight'){ goToPanel(currentPanelIndex() + 1); }
  if(e.key === 'ArrowLeft'){ goToPanel(currentPanelIndex() - 1); }
});

// suit le scroll pour mettre à jour l'onglet actif
let scrollRAF = null;
viewport.addEventListener('scroll', () => {
  if(scrollRAF) return;
  scrollRAF = requestAnimationFrame(() => {
    setActiveTab(currentPanelIndex());
    scrollRAF = null;
  });
});

// ============================================================
// SWITCH FR / EN
// — pour l'instant le contenu EN est identique au FR (placeholders
//   à traduire). Éditez les attributs data-en dans le HTML, et les
//   objets TITLES / LOOP_PHRASES ci-dessus, quand la version FR
//   sera figée.
// ============================================================
let currentLang = 'fr';
const btnFr = document.getElementById('lang-fr');
const btnEn = document.getElementById('lang-en');

function applyLang(lang){
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-fr]').forEach(el => {
    const val = el.dataset[lang];
    if(val !== undefined) el.innerHTML = val;
  });
  btnFr.classList.toggle('is-active', lang === 'fr');
  btnFr.setAttribute('aria-pressed', lang === 'fr');
  btnEn.classList.toggle('is-active', lang === 'en');
  btnEn.setAttribute('aria-pressed', lang === 'en');

  // relance la boucle de transmission dans la bonne langue
  if(loopTimer) clearTimeout(loopTimer);
  loopIndex = 0;
  runLoop();
}

btnFr.addEventListener('click', () => applyLang('fr'));
btnEn.addEventListener('click', () => applyLang('en'));
