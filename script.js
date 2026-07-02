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
  typewrite(document.getElementById('typewriter'), 'NARRATIVE & GAME DESIGN', 40);
});

// petite boucle dans le bloc de transmission
const loopPhrases = ['en attente de transmission entrante...', 'canal ouvert.', 'prêt·e à collaborer.'];
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
      }, 1600);
    }
  }, 45);
}
window.addEventListener('DOMContentLoaded', runLoop);

// ============================================================
// Apparition au scroll — dossiers de projet
// ============================================================
const revealTargets = document.querySelectorAll('.case');
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
