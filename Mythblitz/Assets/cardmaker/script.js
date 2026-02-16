// --- UTILS ---
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
  const descInput = document.getElementById('descInput');
  const powerInput = document.getElementById('powerInput');
  const healthInput = document.getElementById('healthInput');
  const raritySelect = document.getElementById('raritySelect');
  const typeSelect = document.getElementById('typeSelect');
  const tagsInput = document.getElementById('tagsInput');

  // Symbols
  const symbolCountInput = document.getElementById('symbolCountInput');
  const symbol1Select = document.getElementById('symbol1Select');
  const symbol2Select = document.getElementById('symbol2Select');
  const symbol3Select = document.getElementById('symbol3Select');
  const symbol4Select = document.getElementById('symbol4Select');
  const symbol5Select = document.getElementById('symbol5Select');

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
    
    // Type class for CSS fallback
    if (cardEl){
      cardEl.className = `card type-${type}`; 
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
    setText('nameText', (nameInput.value || '').trim() || '');
    setText('manaText', String(clampNumber(manaInput.value, 0, 99)));
    setText('tagsText', (tagsInput.value || '').trim());
    setText('descText', (descInput.value || '').trim());

    // Stats
    const isGear = typeSelect.value === 'Gear';
    const pVal = Number(powerInput.value);
    const hVal = Number(healthInput.value);
    if(statImgDamageNum) statImgDamageNum.textContent = isGear ? formatSignedNumber(pVal) : String(pVal);
    if(statImgHealthNum) statImgHealthNum.textContent = isGear ? formatSignedNumber(hVal) : String(hVal);

    // Rarity
    const rarity = raritySelect.value;
    if(rarityGem) rarityGem.className = 'rarityGem ' + rarityToClass(rarity);
    renderRaritySvg(rarity);

    // Symbols
    syncSymbolControls();
    renderManaSymbols({ count: symbolCountInput.value, regions: getSymbolRegions() });

    syncArtTransform();
    syncTypeVisibility();
    
    // Alt Art Toggle
    const isAltArt = raritySelect.value === 'Alt Art';
    if (artImg) artImg.classList.toggle('artFull', isAltArt);

    // Determine Border
    resolveBorder();
  }

  function syncArtFile(){
    setLayerFromFile(artFile, artImg);
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

  // Initial Sync
  syncText();

  // --- LISTENERS ---
  const inputs = [
    nameInput, manaInput, descInput, powerInput, healthInput, 
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