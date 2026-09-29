// ============================================================
// LANGUE FR / EN — commun à toutes les pages
// ------------------------------------------------------------
// Le texte français est celui écrit directement dans le HTML.
// La version anglaise est dans l'attribut data-en="..." de
// l'élément (elle peut contenir <br>, <a>, <b>...).
// Attributs traduits : data-en-aria-label, data-en-alt, data-en-title.
// Les œuvres (extraits, titres) n'ont volontairement pas de data-en.
// Le choix est mémorisé : il suit le visiteur d'une page à l'autre.
// ============================================================
(function(){
  var KEY = 'portfolioLang';
  var ATTRS = ['aria-label', 'alt', 'title'];
  var lang = 'fr';
  try{ if(localStorage.getItem(KEY) === 'en') lang = 'en'; } catch(e){}

  var textEls = [];
  var attrEls = [];

  function collect(){
    document.querySelectorAll('[data-en]').forEach(function(el){
      if(el.__frHtml !== undefined || el.id === 'typewriter') return;
      el.__frHtml = el.innerHTML;
      textEls.push(el);
    });
    ATTRS.forEach(function(attr){
      document.querySelectorAll('[data-en-' + attr + ']').forEach(function(el){
        el.__frAttr = el.__frAttr || {};
        if(el.__frAttr[attr] !== undefined) return;
        el.__frAttr[attr] = el.getAttribute(attr) || '';
        attrEls.push([el, attr]);
      });
    });
  }

  function apply(newLang){
    lang = newLang;
    collect();
    textEls.forEach(function(el){
      el.innerHTML = lang === 'en' ? el.getAttribute('data-en') : el.__frHtml;
    });
    attrEls.forEach(function(pair){
      var el = pair[0], attr = pair[1];
      el.setAttribute(attr, lang === 'en' ? el.getAttribute('data-en-' + attr) : el.__frAttr[attr]);
    });
    document.querySelectorAll('.lang-switch').forEach(function(btn){
      var fr = btn.querySelector('.lang-fr'), en = btn.querySelector('.lang-en');
      if(fr) fr.classList.toggle('is-active', lang === 'fr');
      if(en) en.classList.toggle('is-active', lang === 'en');
    });
    document.documentElement.lang = lang;
    try{ localStorage.setItem(KEY, lang); } catch(e){}
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  window.siteLang = function(){ return lang; };
  window.setSiteLang = apply;

  document.querySelectorAll('.lang-switch').forEach(function(btn){
    btn.addEventListener('click', function(){ apply(lang === 'fr' ? 'en' : 'fr'); });
  });

  apply(lang);
})();
