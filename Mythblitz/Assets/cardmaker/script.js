// --- UTILS ---
function setText(id, value){
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
}

function setHtml(id, value){
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = value;
}

function escapeHtml(value){
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderDescriptionText(raw){
  let html = escapeHtml(raw);
  html = html
    .replace(/\[b\](.*?)\[\/b\]/gis, '<strong>$1</strong>')
    .replace(/\[i\](.*?)\[\/i\]/gis, '<em>$1</em>')
    .replace(/\[u\](.*?)\[\/u\]/gis, '<u>$1</u>')
    .replace(/\[\/b\]/gi, '</strong>')
    .replace(/\[\/i\]/gi, '</em>')
    .replace(/\[\/u\]/gi, '</u>')
    .replace(/\[b\]/gi, '<strong>')
    .replace(/\[i\]/gi, '<em>')
    .replace(/\[u\]/gi, '<u>')
    .replace(/\[br\]/gi, '<br>')
    .replace(/\n/g, '<br>');
  return html;
}

function fitTextToSingleLine(el, maxSize = 10, minSize = 6){
  if (!el) return;

  el.style.fontSize = `${maxSize}px`;
  el.style.letterSpacing = '1px';

  let size = maxSize;
  while (size > minSize && el.scrollWidth > el.clientWidth) {
    size -= 0.25;
    el.style.fontSize = `${size}px`;
  }

  if (el.scrollWidth > el.clientWidth) {
    el.style.letterSpacing = '0.2px';
    while (size > minSize && el.scrollWidth > el.clientWidth) {
      size -= 0.25;
      el.style.fontSize = `${size}px`;
    }
  }
}

function fitDescriptionToBox(el, maxSize = 13, minSize = 8){
  if (!el) return;

  let size = maxSize;
  let line = 1.4;
  el.style.overflow = 'hidden';
  el.style.fontSize = `${size}px`;
  el.style.lineHeight = `${line}`;

  while (size > minSize && el.scrollHeight > el.clientHeight) {
    size -= 0.25;
    if (line > 1.1) line -= 0.01;
    el.style.fontSize = `${size}px`;
    el.style.lineHeight = `${line}`;
  }

  if (el.scrollHeight > el.clientHeight) {
    while (size > 6 && el.scrollHeight > el.clientHeight) {
      size -= 0.25;
      if (line > 1.02) line -= 0.01;
      el.style.fontSize = `${size}px`;
      el.style.lineHeight = `${line}`;
    }
  }
}

function fitTextToBox(el, maxSize = 25, minSize = 2){
  if (!el) return;

  // Reset inline size first so each pass can grow back to the stylesheet base.
  el.style.fontSize = '';
  const cssSize = parseFloat(window.getComputedStyle(el).fontSize);
  let size = Number.isFinite(cssSize) ? Math.min(cssSize, maxSize) : maxSize;
  el.style.fontSize = `${size}px`;

  while (size > minSize && (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)) {
    size -= 0.25;
    el.style.fontSize = `${size}px`;
  }
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

// Handles simple image previews (Art)
function setLayerFromFile(inputEl, imgEl){
  if (!inputEl || !imgEl) return;
  const file = inputEl.files && inputEl.files[0];
  if (!file){
    // 1x1 Transparent pixel
    imgEl.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    imgEl.style.display = 'none';
    return;
  }
  const url = URL.createObjectURL(file);
  imgEl.src = url;
  imgEl.style.display = 'block';
}

// --- RARITY LOGIC ---
function rarityToClass(rarity){
  switch (rarity){
    case 'Alt Art': return 'rarity-alt';
    default: return 'rarity-std';
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

  if (!stop1 || !stop2) return;

  const style = getRarityStyle(rarity);
  stop1.setAttribute('stop-color', style.a);
  stop2.setAttribute('stop-color', style.b);

  const isAlt = style.shape === 'alt';
  if(diamond) diamond.style.display = isAlt ? 'none' : 'block';
  if(diamondShine) diamondShine.style.display = isAlt ? 'none' : 'block';
  if(alt) alt.style.display = isAlt ? 'block' : 'none';
  if(altShine) altShine.style.display = isAlt ? 'block' : 'none';
}

function renderManaSymbols({ count, regions }){
  const container = document.getElementById('manaSymbols');
  if (!container) return;
  container.innerHTML = '';

  const n = clampNumber(count, 0, 5); // Allow 0
  const list = (regions || []).slice(0, 5);
  const fallback = list[0] || 'Arcane';

  for (let i = 0; i < n; i++){
    const region = String(list[i] || fallback);
    const pip = document.createElement('div');
    pip.className = `manaSymbol manaRegion-${region}`;
    
    const img = document.createElement('img');
    img.className = 'manaSymbolImg';
    img.alt = region;
    img.style.display = 'none';

    // Requires files like img/arcane.png
    const regionFile = region.toLowerCase();
    img.src = `img/${regionFile}.png`;
    
    img.onload = () => { img.style.display = 'block'; };
    
    pip.appendChild(img);
    container.appendChild(pip);
  }
}

// --- MAIN WIRING ---
function wire(){
  // Elements
  const statsFieldset = document.getElementById('statsFieldset');
  const cardEl = document.getElementById('cardPreview');
  const artImg = document.getElementById('artImg');
  const cardBorder = document.getElementById('cardBorder');

  // Inputs
  const nameInput = document.getElementById('nameInput');
  const manaInput = document.getElementById('manaInput');
  const manaXInput = document.getElementById('manaXInput');
  const explainManaInput = document.getElementById('explainManaInput');
  const descInput = document.getElementById('descInput');
  const descHeightInput = document.getElementById('descHeightInput');
  const descHideInput = document.getElementById('descHideInput');
  const powerInput = document.getElementById('powerInput');
  const healthInput = document.getElementById('healthInput');
  const raritySelect = document.getElementById('raritySelect');
  const typeSelect = document.getElementById('typeSelect');
  const tagsInput = document.getElementById('tagsInput');
  const nameTextEl = document.getElementById('nameText');
  const tagsTextEl = document.getElementById('tagsText');
  const descTextEl = document.getElementById('descText');
  const descToolButtons = Array.from(document.querySelectorAll('.textToolBtn'));

  // Symbols
  const symbolCountInput = document.getElementById('symbolCountInput');
  const symbol1Select = document.getElementById('symbol1Select');
  const symbol2Select = document.getElementById('symbol2Select');
  const symbol3Select = document.getElementById('symbol3Select');
  const symbol4Select = document.getElementById('symbol4Select');
  const symbol5Select = document.getElementById('symbol5Select');
  const region2Wrap = document.getElementById('region2Wrap');
  const region3Wrap = document.getElementById('region3Wrap');
  const region4Wrap = document.getElementById('region4Wrap');
  const region5Wrap = document.getElementById('region5Wrap');

  // Art Controls
  const artScaleInput = document.getElementById('artScaleInput');
  const artXInput = document.getElementById('artXInput');
  const artYInput = document.getElementById('artYInput');
  const artFile = document.getElementById('artFile');
  
  // Custom Border Controls
  const borderFile = document.getElementById('borderFile');
  const removeBorderBtn = document.getElementById('removeBorderBtn');

  // Stats Display
  const statsRow = document.querySelector('.stats');
  const statImgDamageNum = document.getElementById('statImgDamageNum');
  const statImgHealthNum = document.getElementById('statImgHealthNum');

  // Rarity Gem
  const rarityGem = document.getElementById('rarityGem');

  // State
  let customBorderURL = null; // Stores the object URL of manually uploaded border
  
  // --- DRAG LOGIC ---
  let isDraggingArt = false;
  let dragStartX = 0, dragStartY = 0, dragOrigX = 0, dragOrigY = 0;

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
      updateArtInputsFromVars(dragOrigX + dx, dragOrigY + dy);
    });
    const endDrag = () => { isDraggingArt = false; };
    artImg.addEventListener('pointerup', endDrag);
    artImg.addEventListener('pointercancel', endDrag);

    artImg.addEventListener('wheel', (e) => {
      if (!artScaleInput) return;
      e.preventDefault();
      const cur = Number(artScaleInput.value) || 1;
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      artScaleInput.value = String(clampNumber(cur + delta, 0.1, 5));
      syncArtTransform();
    }, { passive: false });
  }

  // --- SYNC HELPERS ---
  const symbolSelects = [symbol1Select, symbol2Select, symbol3Select, symbol4Select, symbol5Select];
  const symbolWrappers = [null, region2Wrap, region3Wrap, region4Wrap, region5Wrap];

  function getSymbolRegions(){
    return symbolSelects.map(s => (s && s.value) ? s.value : 'Arcane');
  }

  function syncSymbolControls(){
    const n = clampNumber(symbolCountInput.value, 0, 5);
    for (let i = 0; i < symbolSelects.length; i++){
      const sel = symbolSelects[i];
      if (!sel) continue;
      const active = i < n;
      sel.classList.toggle('isHidden', !active);
      const wrap = symbolWrappers[i];
      if (wrap) wrap.classList.toggle('isHidden', !active);
    }
  }

  function syncArtTransform(){
    if (!cardEl) return;
    const scale = clampNumber(artScaleInput.value, 0.1, 5);
    const x = Number(artXInput.value) || 0;
    const y = Number(artYInput.value) || 0;
    cardEl.style.setProperty('--artScale', String(scale));
    cardEl.style.setProperty('--artX', `${x}px`);
    cardEl.style.setProperty('--artY', `${y}px`);
  }

  function syncTypeVisibility(){
    const type = typeSelect.value;
    const isUnit = type === 'Unit';
    const isGear = type === 'Gear';
    const showStats = isUnit || isGear;
    
    if (statsFieldset) statsFieldset.classList.toggle('isHidden', !showStats);
    if (statsRow) statsRow.classList.toggle('isHidden', !showStats);
    
    // Preserve card mode classes while updating type class
    if (cardEl){
      cardEl.classList.remove('type-Unit', 'type-Spell', 'type-Landmark', 'type-Gear');
      cardEl.classList.add(`type-${type}`);
    }
  }

  // --- BORDER RESOLUTION ---
  function resolveBorder() {
    if (!cardBorder) return;
    
    // 1. If Custom Upload exists, use it.
    if (customBorderURL) {
      cardBorder.src = customBorderURL;
      cardBorder.style.display = 'block';
      cardEl.classList.add('has-custom-border');
      if(removeBorderBtn) removeBorderBtn.style.display = 'inline-block';
      return;
    }

    // 2. Fallback to Automatic Type Border
    if(removeBorderBtn) removeBorderBtn.style.display = 'none';
    
    const type = typeSelect.value.toLowerCase();
    const borderPath = `img/${type}-border.png`;

    // Try loading automatic border
    const tempImg = new Image();
    tempImg.src = borderPath;
    tempImg.onload = () => {
      cardBorder.src = borderPath;
      cardBorder.style.display = 'block';
      cardEl.classList.add('has-custom-border');
    };
    tempImg.onerror = () => {
      // 3. No border found -> Use CSS fallback
      cardBorder.style.display = 'none';
      cardEl.classList.remove('has-custom-border');
    };
  }

  // --- MAIN SYNC ---
  function syncText(){
    const manaValue = clampNumber(manaInput.value, 0, 12);
    if (manaInput && String(manaInput.value) !== String(manaValue)) {
      manaInput.value = String(manaValue);
    }
    const manaDisplay = (manaXInput && manaXInput.checked) ? 'X' : String(manaValue);

    let descRaw = (descInput.value || '').trim();
    if (explainManaInput && explainManaInput.checked) {
      const manaExplainLine = `Mana Cost: ${manaDisplay}`;
      descRaw = descRaw ? `${manaExplainLine}[br]${descRaw}` : manaExplainLine;
    }

    setText('nameText', (nameInput.value || '').trim() || '');
    setText('manaText', manaDisplay);
    setText('tagsText', (tagsInput.value || '').trim());
    setHtml('descText', renderDescriptionText(descRaw));

    // Stats
    const isGear = typeSelect.value === 'Gear';
    const pVal = clampNumber(powerInput.value, 0, 999);
    if (powerInput && String(powerInput.value) !== String(pVal)) {
      powerInput.value = String(pVal);
    }
    const hVal = clampNumber(healthInput.value, 1, 999);
    if (healthInput && String(healthInput.value) !== String(hVal)) {
      healthInput.value = String(hVal);
    }
    const leftFallback = isGear ? formatSignedNumber(pVal) : String(pVal);
    const rightFallback = isGear ? formatSignedNumber(hVal) : String(hVal);

    if(statImgDamageNum) {
      statImgDamageNum.textContent = leftFallback;
    }
    if(statImgHealthNum) {
      statImgHealthNum.textContent = rightFallback;
    }

    if (cardEl) {
      const descHeight = clampNumber((descHeightInput && descHeightInput.value) || 125, 80, 220);
      cardEl.style.setProperty('--descHeight', `${descHeight}px`);

      const descHidden = !!(descHideInput && descHideInput.checked);
      cardEl.classList.toggle('desc-hidden', descHidden);

      // Keep tags 20px above the highest stat slot when description is hidden
      const css = window.getComputedStyle(cardEl);
      const statsBottom = parseFloat(css.getPropertyValue('--statsBottom')) || 10;
      const leftY = parseFloat(css.getPropertyValue('--statSlotLeftY')) || 0;
      const leftH = parseFloat(css.getPropertyValue('--statSlotLeftH')) || 0;
      const rightY = parseFloat(css.getPropertyValue('--statSlotRightY')) || 0;
      const rightH = parseFloat(css.getPropertyValue('--statSlotRightH')) || 0;
      const topOfStats = Math.max(leftY + leftH, rightY + rightH);
      const tagsBottomHidden = Math.max(0, statsBottom + topOfStats + 20);
      cardEl.style.setProperty('--tagsBottomHidden', `${tagsBottomHidden}px`);
    }

    // Rarity
    const rarity = raritySelect.value;
    if(rarityGem) rarityGem.className = 'rarityGem ' + rarityToClass(rarity);
    renderRaritySvg(rarity);

    // Symbols
    syncSymbolControls();
    renderManaSymbols({ count: symbolCountInput.value, regions: getSymbolRegions() });

    syncArtTransform();
    syncTypeVisibility();
    
    // Keep art frame position consistent across rarities, including Alt Art.
    if (artImg) artImg.classList.remove('artFull');

    // Determine Border
    resolveBorder();

    fitTextToSingleLine(tagsTextEl);
    fitTextToSingleLine(nameTextEl, 15, 7);
    fitDescriptionToBox(descTextEl);
    fitTextToBox(statImgDamageNum);
    fitTextToBox(statImgHealthNum);
  }

  function syncArtFile(){
    setLayerFromFile(artFile, artImg);

    // New uploads start centered in the art frame.
    if (artXInput) artXInput.value = '0';
    if (artYInput) artYInput.value = '0';
    if (artScaleInput) artScaleInput.value = '1';
    syncArtTransform();
  }

  function handleCustomBorderUpload() {
    const file = borderFile.files && borderFile.files[0];
    if (file) {
      customBorderURL = URL.createObjectURL(file);
      resolveBorder();
    }
  }

  function clearCustomBorder() {
    customBorderURL = null;
    if(borderFile) borderFile.value = ''; // Reset input
    resolveBorder();
  }

  function applyTextTool(startToken, endToken = ''){
    if (!descInput) return;

    const start = descInput.selectionStart || 0;
    const end = descInput.selectionEnd || 0;
    const current = descInput.value || '';
    const selected = current.slice(start, end);
    const insertion = `${startToken}${selected}${endToken}`;

    descInput.value = `${current.slice(0, start)}${insertion}${current.slice(end)}`;

    const caretStart = start + startToken.length;
    const caretEnd = caretStart + selected.length;
    descInput.focus();
    descInput.setSelectionRange(caretStart, caretEnd);
    syncText();
  }

  // Initial Sync
  syncText();

  // --- LISTENERS ---
  const inputs = [
    nameInput, manaInput, manaXInput, explainManaInput, descInput, descHeightInput, descHideInput, powerInput, healthInput,
    raritySelect, typeSelect, tagsInput, symbolCountInput, 
    symbol1Select, symbol2Select, symbol3Select, symbol4Select, symbol5Select, 
    artScaleInput, artXInput, artYInput
  ];
  inputs.forEach(el => {
    if(el) {
      el.addEventListener('input', syncText);
      el.addEventListener('change', syncText);
    }
  });

  if(artFile) artFile.addEventListener('change', syncArtFile);
  
  if(borderFile) borderFile.addEventListener('change', handleCustomBorderUpload);
  if(removeBorderBtn) removeBorderBtn.addEventListener('click', clearCustomBorder);

  descToolButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const insert = btn.dataset.insert;
      const wrapStart = btn.dataset.wrapStart;
      const wrapEnd = btn.dataset.wrapEnd || '';

      if (insert) {
        applyTextTool(insert, '');
      } else if (wrapStart) {
        applyTextTool(wrapStart, wrapEnd);
      }
    });
  });

  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('cardForm').reset();
      customBorderURL = null;
      if(removeBorderBtn) removeBorderBtn.style.display = 'none';
      if(artImg) {
        artImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; 
        artImg.style.display = 'none';
      }
      syncText();
    });
  }

  window.addEventListener('resize', () => {
    fitTextToSingleLine(tagsTextEl);
    fitTextToSingleLine(nameTextEl, 15, 7);
    fitDescriptionToBox(descTextEl);
    fitTextToBox(statImgDamageNum);
    fitTextToBox(statImgHealthNum);
  });
}

// --- EXPORT FUNCTION ---
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
      const tagsEl = document.getElementById('tagsText');
      const nameEl = document.getElementById('nameText');
      const descEl = document.getElementById('descText');
      fitTextToSingleLine(tagsEl);
      fitTextToSingleLine(nameEl, 15, 7);
      fitDescriptionToBox(descEl);

      const options = { 
        pixelRatio: 3, 
        skipFonts: false,
        useCORS: true, 
        allowTaint: true,
        backgroundColor: null 
      };

      let dataUrl;
      if (format === 'svg') {
        dataUrl = await window.htmlToImage.toSvg(cardEl, options);
      } else {
        dataUrl = await window.htmlToImage.toPng(cardEl, options);
      }

      const rawName = document.getElementById('nameInput').value || 'card';
      const fileName = rawName.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();

      if (format === 'pdf') {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [69, 94] });
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
      alert("Export failed. If using external images, check console.");
    } finally {
      exportBtn.textContent = originalText;
      exportBtn.disabled = false;
    }
  });
}

// --- INIT ---
if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', () => {
    wire();
    setupExportButton();
  });
} else {
  wire();
  setupExportButton();
}