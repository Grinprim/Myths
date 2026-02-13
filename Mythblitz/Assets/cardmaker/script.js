function setText(id, value){
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
}

function clampNumber(value, min, max){
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function formatSignedNumber(n){
  const num = Number(n) || 0;
  if (num >= 0) return `+${num}`;
  return String(num);
}

function setLayerFromFile(inputEl, imgEl){
  if (!inputEl || !imgEl) return;
  const file = inputEl.files && inputEl.files[0];
  if (!file){
    // Use a transparent 1x1 pixel so html-to-image doesn't crash on an empty src
    imgEl.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    imgEl.style.display = 'none';
    return;
  }

  const url = URL.createObjectURL(file);
  imgEl.src = url;
  imgEl.style.display = 'block';
}

function rarityToClass(rarity){
  switch (rarity){
    case 'Common': return 'rarity-common';
    case 'Uncommon': return 'rarity-uncommon';
    case 'Rare': return 'rarity-rare';
    case 'Epic': return 'rarity-epic';
    case 'Legendary': return 'rarity-legendary';
    case 'Alt Art': return 'rarity-alt';
    default: return 'rarity-rare';
  }
}

function getRarityStyle(rarity){
  switch (rarity){
    case 'Common': return { a: '#9aa3ad', b: '#5c6672', shape: 'diamond' };
    case 'Uncommon': return { a: '#34d399', b: '#15803d', shape: 'diamond' };
    case 'Rare': return { a: '#60a5fa', b: '#1d4ed8', shape: 'diamond' };
    case 'Epic': return { a: '#f472b6', b: '#7c3aed', shape: 'diamond' };
    case 'Legendary': return { a: '#fb923c', b: '#f59e0b', shape: 'diamond' };
    case 'Alt Art': return { a: '#ff3b3b', b: '#2563eb', shape: 'alt' };
    default: return { a: '#60a5fa', b: '#1d4ed8', shape: 'diamond' };
  }
}

function renderRaritySvg(rarity){
  const stop1 = document.getElementById('rarityStop1');
  const stop2 = document.getElementById('rarityStop2');
  const diamond = document.getElementById('rarityDiamond');
  const diamondShine = document.getElementById('rarityDiamondShine');
  const alt = document.getElementById('rarityAlt');
  const altShine = document.getElementById('rarityAltShine');

  if (!stop1 || !stop2 || !diamond || !diamondShine || !alt || !altShine) return;

  const style = getRarityStyle(rarity);
  stop1.setAttribute('stop-color', style.a);
  stop2.setAttribute('stop-color', style.b);

  const isAlt = style.shape === 'alt';
  diamond.style.display = isAlt ? 'none' : 'block';
  diamondShine.style.display = isAlt ? 'none' : 'block';
  alt.style.display = isAlt ? 'block' : 'none';
  altShine.style.display = isAlt ? 'block' : 'none';
}

function renderManaSymbols({ count, regions }){
  const container = document.getElementById('manaSymbols');
  if (!container) return;
  container.innerHTML = '';

  const n = clampNumber(count, 1, 5);
  const list = (regions || []).slice(0, 5);
  const fallback = list[0] || 'Arcane';

  for (let i = 0; i < n; i++){
    const region = String(list[i] || fallback);
    const pip = document.createElement('div');
    pip.className = `manaSymbol manaRegion-${region}`;
    pip.setAttribute('aria-label', 'Mana symbol');
    pip.title = region;

    const img = document.createElement('img');
    img.className = 'manaSymbolImg';
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'eager';
    img.style.display = 'none';

    const regionFile = region.toLowerCase();
    img.src = `img/${regionFile}.png`;
    img.addEventListener('load', () => {
      pip.classList.add('hasIcon');
      img.style.display = 'block';
    });
    img.addEventListener('error', () => {
      pip.classList.remove('hasIcon');
      img.style.display = 'none';
    });

    pip.appendChild(img);
    container.appendChild(pip);
  }
}

function wire(){
  const statsFieldset = document.getElementById('statsFieldset');

  const cardEl = document.getElementById('cardPreview');
  const artImg = document.getElementById('artImg');
  const regionBadge = document.getElementById('regionBadge');

  const nameInput = document.getElementById('nameInput');
  const manaInput = document.getElementById('manaInput');
  const descInput = document.getElementById('descInput');
  const powerInput = document.getElementById('powerInput');
  const healthInput = document.getElementById('healthInput');
  const raritySelect = document.getElementById('raritySelect');
  const typeSelect = document.getElementById('typeSelect');
  const tagsInput = document.getElementById('tagsInput');

  const symbolCountInput = document.getElementById('symbolCountInput');
  const symbol1Select = document.getElementById('symbol1Select');
  const symbol2Select = document.getElementById('symbol2Select');
  const symbol3Select = document.getElementById('symbol3Select');
  const symbol4Select = document.getElementById('symbol4Select');
  const symbol5Select = document.getElementById('symbol5Select');

  const artScaleInput = document.getElementById('artScaleInput');
  const artXInput = document.getElementById('artXInput');
  const artYInput = document.getElementById('artYInput');

  const artFile = document.getElementById('artFile');

  const rarityGem = document.getElementById('rarityGem');

  const statsRow = document.querySelector('.stats');
  const powerBadge = document.querySelector('.statBadgePower');
  const healthBadge = document.querySelector('.statBadgeHealth');

  // Drag-to-move art
  let isDraggingArt = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOrigX = 0;
  let dragOrigY = 0;

  function updateArtInputsFromVars(x, y){
    if (artXInput) artXInput.value = String(Math.round(x));
    if (artYInput) artYInput.value = String(Math.round(y));
    syncArtTransform();
  }

  if (artImg && artXInput && artYInput){
    artImg.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      isDraggingArt = true;
      artImg.setPointerCapture(e.pointerId);
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragOrigX = Number(artXInput.value) || 0;
      dragOrigY = Number(artYInput.value) || 0;
      e.preventDefault();
    });

    artImg.addEventListener('pointermove', (e) => {
      if (!isDraggingArt) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      const nextX = clampNumber(dragOrigX + dx, -120, 120);
      const nextY = clampNumber(dragOrigY + dy, -120, 120);
      updateArtInputsFromVars(nextX, nextY);
    });

    const endDrag = () => { isDraggingArt = false; };
    artImg.addEventListener('pointerup', endDrag);
    artImg.addEventListener('pointercancel', endDrag);

    artImg.addEventListener('wheel', (e) => {
      if (!artScaleInput) return;
      e.preventDefault();
      const cur = Number(artScaleInput.value) || 1;
      const delta = e.deltaY > 0 ? -0.04 : 0.04;
      const next = clampNumber(cur + delta, 0.5, 2.5);
      artScaleInput.value = String(next);
      syncArtTransform();
    }, { passive: false });
  }

  const symbolSelects = [symbol1Select, symbol2Select, symbol3Select, symbol4Select, symbol5Select];

  function getSymbolRegions(){
    return symbolSelects.map(s => (s && s.value) ? s.value : 'Arcane');
  }

  function syncSymbolControls(){
    const n = clampNumber(symbolCountInput.value, 1, 5);
    for (let i = 0; i < symbolSelects.length; i++){
      const sel = symbolSelects[i];
      if (!sel) continue;
      const active = i < n;
      sel.disabled = !active;
      sel.classList.toggle('isHidden', !active);
    }
  }

  function syncArtTransform(){
    if (!cardEl) return;
    const scale = clampNumber(artScaleInput.value, 0.5, 2.5);
    const x = clampNumber(artXInput.value, -120, 120);
    const y = clampNumber(artYInput.value, -120, 120);
    cardEl.style.setProperty('--artScale', String(scale));
    cardEl.style.setProperty('--artX', `${x}px`);
    cardEl.style.setProperty('--artY', `${y}px`);
  }

  function syncTypeVisibility(){
    const isUnit = typeSelect.value === 'Unit';
    const isGear = typeSelect.value === 'Gear';
    const showStats = isUnit || isGear;
    if (statsFieldset){
      statsFieldset.classList.toggle('isHidden', !showStats);
    }
    if (powerInput){
      powerInput.disabled = !showStats;
      powerInput.min = isGear ? '-99' : '0';
      powerInput.max = '99';
    }
    if (healthInput){
      healthInput.disabled = !showStats;
      healthInput.min = isGear ? '-99' : '0';
      healthInput.max = '99';
    }

    if (statsRow){
      statsRow.classList.toggle('isNonUnit', !showStats);
    }
    if (powerBadge){
      powerBadge.classList.toggle('isHidden', !showStats);
    }
    if (healthBadge){
      healthBadge.classList.toggle('isHidden', !showStats);
    }

    if (cardEl){
      cardEl.classList.remove('type-Unit', 'type-Spell', 'type-Landmark', 'type-Gear');
      cardEl.classList.add(`type-${typeSelect.value}`);
    }
  }

  function syncText(){
    setText('nameText', (nameInput.value || '').trim() || '');
    setText('manaText', String(clampNumber(manaInput.value, 0, 99)));
    setText('tagsText', (tagsInput.value || '').trim());
    setText('descText', (descInput.value || '').trim());

    const isUnit = typeSelect.value === 'Unit';
    const isGear = typeSelect.value === 'Gear';

    const powerVal = isGear
      ? clampNumber(powerInput.value, -99, 99)
      : clampNumber(powerInput.value, 0, 99);
    const healthVal = isGear
      ? clampNumber(healthInput.value, -99, 99)
      : clampNumber(healthInput.value, 0, 99);

    setText('powerText', isGear ? formatSignedNumber(powerVal) : String(powerVal));
    setText('healthText', isGear ? formatSignedNumber(healthVal) : String(healthVal));

    const rarity = raritySelect.value;
    if (rarityGem){
      rarityGem.classList.remove(
        'rarity-common',
        'rarity-uncommon',
        'rarity-rare',
        'rarity-epic',
        'rarity-legendary',
        'rarity-alt'
      );
      const cls = rarityToClass(rarity);
      rarityGem.classList.add(cls);
    }

    renderRaritySvg(rarity);

    syncSymbolControls();
    renderManaSymbols({ count: symbolCountInput.value, regions: getSymbolRegions() });

    if (regionBadge){
      const mainRegion = String((symbol1Select && symbol1Select.value) ? symbol1Select.value : 'Arcane');
      regionBadge.classList.remove('manaRegion-Arcane', 'manaRegion-Divine', 'manaRegion-Elemental', 'manaRegion-Occult', 'manaRegion-Cosmic');
      regionBadge.classList.add(`manaRegion-${mainRegion}`);
      regionBadge.title = mainRegion;
    }

    syncArtTransform();

    const isAltArt = raritySelect.value === 'Alt Art';
    if (artImg){
      artImg.classList.toggle('artFull', isAltArt);
    }

    syncTypeVisibility();
  }

  function syncImages(){
    setLayerFromFile(artFile, artImg);
  }

  // Initial sync
  syncText();
  syncImages();

  // Text listeners
  for (const el of [nameInput, manaInput, descInput, powerInput, healthInput, raritySelect, typeSelect, tagsInput, symbolCountInput, symbol1Select, symbol2Select, symbol3Select, symbol4Select, symbol5Select, artScaleInput, artXInput, artYInput]){
    el.addEventListener('input', syncText);
    el.addEventListener('change', syncText);
  }

  if (artFile){
    artFile.addEventListener('change', syncImages);
  }

  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', () => {
    document.getElementById('cardForm').reset();
    nameInput.value = 'Sample Name';
    manaInput.value = 1;
    descInput.value = 'Sample Description';
    powerInput.value = 1;
    healthInput.value = 1;
    raritySelect.value = 'Common';
    typeSelect.value = 'Unit';
    tagsInput.value = 'Sample Tags';
    symbolCountInput.value = 1;
    symbol1Select.value = 'Arcane';
    symbol2Select.value = 'Arcane';
    symbol3Select.value = 'Arcane';
    symbol4Select.value = 'Arcane';
    symbol5Select.value = 'Arcane';
    artScaleInput.value = 1;
    artXInput.value = 0;
    artYInput.value = 0;
    if (artFile) artFile.value = '';
    syncText();
    syncImages();
  });
}

function setupExportButton() {
  const exportBtn = document.getElementById('exportBtn');
  const cardEl = document.getElementById('cardPreview');
  
  if (!exportBtn || !cardEl) return;

  exportBtn.addEventListener('click', async () => {
    const format = document.getElementById('exportFormat').value;
    const originalText = exportBtn.textContent;
    exportBtn.textContent = 'Processing...';
    exportBtn.disabled = true;

    try {
      // Configuration for high quality render + CORS bypass
      const options = { 
        pixelRatio: 3, 
        skipFonts: false,
        useCORS: true, 
        allowTaint: true,
        backgroundColor: null // Prevents default white backgrounds on rounded corners
      };

      let dataUrl;
      if (format === 'svg') {
        dataUrl = await window.htmlToImage.toSvg(cardEl, options);
      } else {
        dataUrl = await window.htmlToImage.toPng(cardEl, options);
      }

      // Sanitize user input for safe filenames
      const rawName = document.getElementById('nameInput').value || 'card';
      const fileName = rawName.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();

      if (format === 'pdf') {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ 
          orientation: 'portrait', 
          unit: 'mm', 
          format: [69, 94] 
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, 69, 94);
        pdf.save(`${fileName}.pdf`);
      } else {
        const link = document.createElement('a');
        link.download = `${fileName}.${format}`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Export Error:", err);
      alert("Export failed. If using external images, ensure you are running a local server to avoid CORS blockages.");
    } finally {
      exportBtn.textContent = originalText;
      exportBtn.disabled = false;
    }
  });
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', () => {
    wire();
    setupExportButton();
  });
} else {
  wire();
  setupExportButton();
}