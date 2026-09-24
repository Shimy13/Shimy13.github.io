const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================================
// SÉQUENCE DE CONNEXION — entrée dans l'archive de l'unité 512
// ============================================================
const bootScreen = document.getElementById('bootScreen');
const bootLinesEl = document.getElementById('bootLines');
const bootSkipEl = document.getElementById('bootSkip');
const siteRoot = document.getElementById('siteRoot');

const bootSequence = [
  '> CONNEXION AU RÉSEAU D\'ARCHIVES...',
  '> RECHERCHE — UNITÉ 512...',
  '> UNITÉ LOCALISÉE — SIGNAL INSTABLE',
  '> POSITION ACTUELLE : INCONNUE',
  '> CHARGEMENT DU DOSSIER...',
  '> ACCÈS AUTORISÉ.'
];

let bootDismissed = false;
const BOOT_FLAG = 'archiveBootDone';

function revealSite(){
  if(bootDismissed) return;
  bootDismissed = true;
  try{ localStorage.setItem(BOOT_FLAG, '1'); } catch(e){}
  bootScreen.classList.add('is-hidden');
  siteRoot.classList.add('is-visible');
  triggerGlitch();
  setTimeout(() => { bootScreen.style.display = 'none'; }, 600);
  document.removeEventListener('keydown', revealSite);
  bootScreen.removeEventListener('click', revealSite);
}

function runBootSequence(){
  // si l'écran de connexion a déjà été vu pendant cette visite, on saute
  // directement au site — pas besoin de rejouer la séquence à chaque retour
  let alreadyBooted = false;
  try{ alreadyBooted = localStorage.getItem(BOOT_FLAG) === '1'; } catch(e){}
  if(alreadyBooted){
    bootDismissed = true;
    bootScreen.style.display = 'none';
    siteRoot.classList.add('is-visible');
    return;
  }

  // le clic / la touche pour passer doivent fonctionner dès le tout début,
  // pas seulement une fois l'animation terminée
  document.addEventListener('keydown', revealSite);
  bootScreen.addEventListener('click', revealSite);

  if(reduceMotion){
    bootLinesEl.textContent = bootSequence.join('\n');
    bootSkipEl.classList.add('is-visible');
    setTimeout(revealSite, 900);
    return;
  }

  let lineIndex = 0;
  const doneLines = [];

  function typeLine(){
    if(lineIndex >= bootSequence.length){
      bootSkipEl.classList.add('is-visible');
      setTimeout(revealSite, 2200);
      return;
    }
    const full = bootSequence[lineIndex];
    let charIndex = 0;
    (function typeChar(){
      const current = full.slice(0, charIndex);
      bootLinesEl.textContent = doneLines.concat(current).join('\n');
      if(charIndex <= full.length){
        charIndex++;
        setTimeout(typeChar, 22);
      } else {
        doneLines.push(full);
        lineIndex++;
        setTimeout(typeLine, 260);
      }
    })();
  }
  typeLine();
}

window.addEventListener('DOMContentLoaded', runBootSequence);

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
  const twEl = document.getElementById('typewriter');
  setTimeout(() => typewrite(twEl, twEl.dataset.fr, 40), reduceMotion ? 0 : 1600);
});

// boucle de statut dans le bloc de transmission
const loopPhrases = [
  'en attente de transmission entrante...',
  'aucune réponse pour l\'instant...',
  'canal ouvert.',
  'prêt·e à collaborer.'
];
const loopEl = document.getElementById('loop');
let loopIndex = 0;

function runLoop(){
  if(!loopEl || reduceMotion){ if(loopEl) loopEl.textContent = loopPhrases[0]; return; }
  const phrase = loopPhrases[loopIndex % loopPhrases.length];
  let i = 0;
  loopEl.textContent = '';
  const typeStep = setInterval(() => {
    loopEl.textContent = phrase.slice(0, i);
    i++;
    if(i > phrase.length){
      clearInterval(typeStep);
      setTimeout(() => {
        let j = phrase.length;
        const eraseStep = setInterval(() => {
          loopEl.textContent = phrase.slice(0, j);
          j--;
          if(j < 0){
            clearInterval(eraseStep);
            loopIndex++;
            setTimeout(runLoop, 400);
          }
        }, 25);
      }, 1700);
    }
  }, 45);
}
window.addEventListener('DOMContentLoaded', () => setTimeout(runLoop, reduceMotion ? 0 : 2200));

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

pages.forEach((p, i) => {
  const dot = document.createElement('button');
  dot.className = 'reel-dot' + (i === 0 ? ' is-active' : '');
  dot.setAttribute('aria-label', `Aller à la page ${i + 1}`);
  dot.addEventListener('click', () => goToPage(i));
  dotsWrap.appendChild(dot);
});
const dots = Array.from(dotsWrap.children);

if(pageTotalEl) pageTotalEl.textContent = String(total).padStart(2, '0');

function playPageEnter(index){
  // on retire la classe de toutes les pages, on force un reflow, puis on la
  // rajoute sur la page active — nécessaire pour rejouer l'animation CSS
  // à chaque fois, même si on revient sur une page déjà visitée
  pages.forEach(p => p.classList.remove('page-enter'));
  void pages[index].offsetWidth;
  pages[index].classList.add('page-enter');

  if(reduceMotion) return;

  // effet mat/brouillé + cercle de chargement, uniquement sur les éléments
  // porteurs d'info (dossiers, extraits, briefing) — pas sur les titres
  const cards = Array.from(pages[index].querySelectorAll('.case, .excerpt, .page-intro'));
  cards.forEach((card, i) => {
    const delay = Math.min(i, 5) * 60; // ms

    card.classList.remove('card-enter');
    void card.offsetWidth;

    const prevPosition = getComputedStyle(card).position;
    if(prevPosition === 'static'){ card.style.position = 'relative'; }

    setTimeout(() => {
      card.classList.add('card-enter');
      const spinner = document.createElement('span');
      spinner.className = 'page-enter-spinner';
      document.body.appendChild(spinner);

      let rafId;
      const track = () => {
        const rect = card.getBoundingClientRect();
        spinner.style.top = (rect.top + rect.height / 2 - 14) + 'px';
        spinner.style.left = (rect.left + rect.width / 2 - 14) + 'px';
        rafId = requestAnimationFrame(track);
      };
      track();

      setTimeout(() => {
        cancelAnimationFrame(rafId);
        spinner.remove();
      }, 1500);
    }, delay);
  });
}

function goToPage(index){
  index = Math.max(0, Math.min(total - 1, index));
  if(index === current) return;
  current = index;

  track.style.transform = `translateX(-${index * (100 / total)}%)`;
  triggerGlitch();
  playPageEnter(index);

  navLinks.forEach(link => {
    const linkIndex = Number(link.dataset.page);
    link.classList.toggle('is-active', linkIndex === index);
  });

  dots.forEach((d, i) => d.classList.toggle('is-active', i === index));

  if(pageCurrentEl) pageCurrentEl.textContent = String(index + 1).padStart(2, '0');
  if(prevBtn) prevBtn.disabled = index === 0;
  if(nextBtn) nextBtn.disabled = index === total - 1;

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

window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  const initial = pages.findIndex(p => p.id === hash);
  goToPage(initial >= 0 ? initial : 0);
  playPageEnter(current); // au cas où goToPage(0) n'a rien fait (page déjà "current")
  // forcer l'état correct des flèches au chargement
  if(prevBtn) prevBtn.disabled = current === 0;
  if(nextBtn) nextBtn.disabled = current === total - 1;
});

// ============================================================
// GLITCH — statique périodique (vieux matériel)
// ============================================================
const glitchOverlay = document.getElementById('glitchOverlay');

function triggerGlitch(){
  if(reduceMotion || !glitchOverlay) return;
  glitchOverlay.classList.remove('is-active');
  void glitchOverlay.offsetWidth; // reset animation
  glitchOverlay.classList.add('is-active');
}

function scheduleAmbientGlitch(){
  if(reduceMotion) return;
  const delay = 9000 + Math.random() * 9000;
  setTimeout(() => {
    triggerGlitch();
    scheduleAmbientGlitch();
  }, delay);
}
scheduleAmbientGlitch();

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
    if(el.id === 'typewriter') return; // géré par l'animation machine à écrire
    el.textContent = el.dataset[lang];
  });
  langSwitch.querySelector('.lang-fr').classList.toggle('is-active', lang === 'fr');
  langSwitch.querySelector('.lang-en').classList.toggle('is-active', lang === 'en');
  document.documentElement.lang = lang;
}

langSwitch.addEventListener('click', () => {
  applyLang(lang === 'fr' ? 'en' : 'fr');
});
