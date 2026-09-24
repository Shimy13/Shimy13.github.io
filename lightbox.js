// ============================================================
// VISIONNEUSE PLEIN ÉCRAN — clic sur une photo de dossier
// ============================================================
(function(){
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.id = 'lightbox';
  lightbox.innerHTML =
    '<button type="button" class="lightbox-close" id="lightboxClose" aria-label="Fermer">&times; FERMER</button>' +
    '<img id="lightboxImg" src="" alt="">';
  document.body.appendChild(lightbox);

  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');

  function openLightbox(src, alt){
    if(!src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('is-open');
  }
  function closeLightbox(){
    lightbox.classList.remove('is-open');
  }

  document.addEventListener('click', function(e){
    const img = e.target.closest('.case-thumb img, .dossier-hero img, .gameplay-shot-frame img');
    if(!img || !img.naturalWidth) return;

    // si l'image est déjà un lien (ex: renvoie vers un plan externe),
    // on laisse le navigateur suivre le lien plutôt que d'ouvrir la visionneuse
    if(img.closest('a')) return;

    // les captures de gameplay utilisent object-fit:cover — l'image remplit
    // toujours entièrement son cadre, donc tout clic dedans est valide
    if(img.closest('.gameplay-shot-frame')){
      openLightbox(img.currentSrc || img.src, img.alt);
      return;
    }

    // avec object-fit:contain, l'élément <img> occupe tout le cadre
    // mais la photo réelle peut être plus petite (marges vides) —
    // on calcule la zone réellement occupée par l'image avant de zoomer
    const rect = img.getBoundingClientRect();
    const scale = Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
    const renderedW = img.naturalWidth * scale;
    const renderedH = img.naturalHeight * scale;
    const isTopAligned = img.closest('.case-thumb') !== null;
    const offsetX = (rect.width - renderedW) / 2;
    const offsetY = isTopAligned ? 0 : (rect.height - renderedH) / 2;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if(clickX >= offsetX && clickX <= offsetX + renderedW && clickY >= offsetY && clickY <= offsetY + renderedH){
      openLightbox(img.currentSrc || img.src, img.alt);
    }
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function(e){
    if(e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeLightbox();
  });
})();
