/* === ATTRIBUTES === */
const GROUPS = {
  body: ['might','brawn','fortitude'],
  skill: ['finesse','reflex','tinker'],
  mind: ['arcane','spirit','scholarship'],
  style: ['speech','insight','awareness']
};

function val(id) {
  const e = document.getElementById(id);
  return e ? (parseFloat(e.value) || 0) : 0;
}

function recalcSkill(group, skill) {
  const out = document.getElementById(group + '_' + skill + '_total');
  const baseEl = document.getElementById(group + '_base');
  const modEl = document.getElementById(group + '_' + skill + '_mod');
  if (!out) return;
  const baseEmpty = baseEl ? baseEl.value === '' : true;
  const modEmpty = modEl ? modEl.value === '' : true;
  if (baseEmpty && modEmpty) {
    out.value = '';
    updateDerivedVitals();
    return;
  }
  out.value = val(group + '_base') + val(group + '_' + skill + '_mod');
  updateDerivedVitals();
}

function recalcGroup(group) {
  (GROUPS[group] || []).forEach(skill => recalcSkill(group, skill));
}

function recalcAll() {
  Object.keys(GROUPS).forEach(group => recalcGroup(group));
  updateDerivedVitals();
}

/* === BARS === */
function updateBar(barId, maxVal, curVal) {
  const max = parseFloat(maxVal) || 0;
  const cur = parseFloat(curVal) || 0;
  const pct = max > 0 ? Math.max(0, Math.min(100, (cur / max) * 100)) : 0;
  const bar = document.getElementById(barId);
  if (bar) bar.style.width = pct + '%';
}

/* === PIPS === */
function buildPips(containerId, maxN, cur, onSet) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  for (let i = 1; i <= maxN; i++) {
    const btn = document.createElement('button');
    btn.className = 'pip' + (i <= cur ? ' filled' : '');
    btn.onclick = () => onSet(cur === i ? 0 : i);
    container.appendChild(btn);
  }
}

let graceValue = 0;
function setGrace(n) { graceValue = n; buildPips('gracePips', 6, graceValue, setGrace); }
let finalBlowValue = 0;
function setFinalBlow(n) { finalBlowValue = n; buildPips('finalBlowPips', 4, finalBlowValue, setFinalBlow); }

/* === FEEDBACK === */
/* === PATHS === */
const FALLBACK_PATHS = [
  {
    id: 'occult_spellcasting',
    name: 'Occult Spellcasting',
    summary: 'Unlock forbidden void incantations, channeling entities and darkness to alter physical realities.',
    icon: '🔮',
    milestones: [
      { traits_required: 3, description: 'Eldritch Attunement', bonuses: { arcane: 1 }, flavor: '+1 Arcane. Spiritual pulse synchronizes with the void.' },
      { traits_required: 6, description: 'Vessel of Darkness', bonuses: { max_hp: 5, speed: 1 }, flavor: '+5 HP, +1 Speed. Power expands biological vessel limits.' },
      { traits_required: 9, description: 'Void Sovereign', bonuses: { spirit: 1 }, flavor: '+1 Spirit. Sliding psychic vectors off your aura.' }
    ]
  },
  {
    id: 'primal_warden',
    name: 'Primal Warden',
    summary: 'Form deep forest connections to leverage woodland agility, beast companions, and life vectors.',
    icon: '🌿',
    milestones: [
      { traits_required: 3, description: 'Bark Cover', bonuses: { fortitude: 1 }, flavor: '+1 Fortitude. Toughens skin like century bark.' },
      { traits_required: 6, description: 'Swift Wind', bonuses: { speed: 2 }, flavor: '+2 Speed. Attain natural predator velocity.' }
    ]
  }
];

const FALLBACK_TRAITS = [
  { id: 'void_whisper', path_id: 'occult_spellcasting', name: 'Void Whisper', description: 'Fine-tunes celestial psychic sensitivity to cosmic void echoes.', row: 1, col: 2, prerequisites: [], bonuses: { insight: 1 }, attribute: 'mind' },
  { id: 'eldritch_tongue', path_id: 'occult_spellcasting', name: 'Eldritch Tongue', description: 'Compiles syntactic knowledge of planar entities.', row: 2, col: 1, prerequisites: ['void_whisper'], bonuses: { scholarship: 1 }, attribute: 'mind' },
  { id: 'shadow_step', path_id: 'occult_spellcasting', name: 'Shadow Step', description: 'Slip between molecular structures to instantly jump dimensions.', row: 2, col: 2, prerequisites: ['void_whisper'], bonuses: { reflex: 1 }, attribute: 'skill' },
  { id: 'hex_manifest', path_id: 'occult_spellcasting', name: 'Hex Manifest', description: 'Project negative occult constructs directly into enemy vital flows.', row: 2, col: 3, prerequisites: ['void_whisper'], bonuses: { arcane: 1 }, attribute: 'mind' },
  { id: 'abyssal_lore', path_id: 'occult_spellcasting', name: 'Abyssal Lore', description: 'Grants complete comprehension of multi-planar treaties and geometry.', row: 3, col: 1, prerequisites: ['eldritch_tongue'], bonuses: { scholarship: 1 }, attribute: 'mind' },
  { id: 'umbral_shroud', path_id: 'occult_spellcasting', name: 'Umbral Shroud', description: 'Masks body light indices, increasing physical evasive capabilities.', row: 3, col: 2, prerequisites: ['shadow_step'], bonuses: { reflex: 1 }, attribute: 'skill' },
  { id: 'withering_grasp', path_id: 'occult_spellcasting', name: 'Withering Grasp', description: 'Decays organic elements on weapon contact.', row: 3, col: 3, prerequisites: ['hex_manifest'], bonuses: { fortitude: 1 }, attribute: 'body' },
  { id: 'star_pact', path_id: 'occult_spellcasting', name: 'Star Pact', description: 'Attunes internal life matrices directly to dying void configurations.', row: 4, col: 2, prerequisites: ['umbral_shroud'], bonuses: { spirit: 1 }, attribute: 'mind' },
  { id: 'roots_of_life', path_id: 'primal_warden', name: 'Roots of Life', description: 'Slowly draws terrestrial essence when remaining perfectly static.', row: 1, col: 2, prerequisites: [], bonuses: { max_hp: 5 }, attribute: 'body' },
  { id: 'barkskin_seal', path_id: 'primal_warden', name: 'Barkskin Seal', description: 'Hardens outer cell structures to blunt kinetic attacks.', row: 2, col: 1, prerequisites: ['roots_of_life'], bonuses: { fortitude: 1 }, attribute: 'body' },
  { id: 'gale_leap', path_id: 'primal_warden', name: 'Gale Leap', description: 'Vaults high distances by riding natural convective thermals.', row: 2, col: 3, prerequisites: ['roots_of_life'], bonuses: { reflex: 1 }, attribute: 'skill' }
];

let selectedPathId = 'occult_spellcasting';
let unlockedTraits = new Set();
let maxBudgetLimit = 2;
let activePathBonuses = {};

const POINTS_BY_LEVEL = [0, 2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2];

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getAttrColor(attr) {
  if (attr === 'body') return 'var(--clr-body)';
  if (attr === 'skill') return 'var(--clr-skill)';
  if (attr === 'mind') return 'var(--clr-mind)';
  if (attr === 'style') return 'var(--clr-style)';
  return 'var(--border)';
}

function initPathsSubtab() {
  handleLevelChange();
  renderPathsList();
  selectPath(selectedPathId);
  calculateCombinedBonuses();

  const levelInput = document.getElementById('charLevel');
  if (levelInput) levelInput.addEventListener('input', handleLevelChange);
  window.addEventListener('resize', drawTreeConnections);
}

function handleLevelChange() {
  const level = parseInt(document.getElementById('charLevel')?.value, 10) || 1;
  const levelAnchor = document.getElementById('budget-level-anchor');
  if (levelAnchor) levelAnchor.textContent = level;

  let totalPoints = 0;
  for (let i = 1; i <= Math.min(level, 12); i++) {
    totalPoints += POINTS_BY_LEVEL[i] || 0;
  }
  if (level > 12) {
    totalPoints += (level - 12);
  }

  maxBudgetLimit = totalPoints;
  const totalEl = document.getElementById('total-points');
  if (totalEl) totalEl.textContent = maxBudgetLimit;

  if (unlockedTraits.size > maxBudgetLimit) {
    triggerWarningToast('Level decreased. Spent trait points exceed budget!');
  }
}

function renderPathsList() {
  const parent = document.getElementById('path-selector-list');
  if (!parent) return;
  parent.innerHTML = '';

  FALLBACK_PATHS.forEach(path => {
    const invested = getInvestedCount(path.id);
    const isActive = path.id === selectedPathId;

    const el = document.createElement('div');
    el.className = `path-select-item flex items-center justify-between ${isActive ? 'active' : ''}`;
    el.onclick = () => selectPath(path.id);

    el.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-base">${path.icon || ''}</span>
        <span class="text-xs font-bold text-white tracking-wider">${path.name}</span>
      </div>
      <span class="text-xs font-mono font-bold text-purple-400">${invested} Unlocked</span>
    `;
    parent.appendChild(el);
  });
}

function getInvestedCount(pathId) {
  return FALLBACK_TRAITS.filter(t => t.path_id === pathId && unlockedTraits.has(t.id)).length;
}

function selectPath(pathId) {
  selectedPathId = pathId;
  const pathData = FALLBACK_PATHS.find(p => p.id === pathId);
  if (!pathData) return;

  renderPathsList();
  const titleEl = document.getElementById('active-path-title');
  const descEl = document.getElementById('active-path-desc');
  if (titleEl) titleEl.textContent = pathData.name;
  if (descEl) descEl.textContent = pathData.summary;

  renderConstellationNodes(pathId);
  renderMilestoneTimeline(pathData);
  renderLedgerDirectory(pathId);
  resetTooltip();
}

function renderMilestoneTimeline(pathData) {
  const container = document.getElementById('milestones-container');
  if (!container) return;
  container.innerHTML = '';

  const invested = getInvestedCount(pathData.id);

  pathData.milestones.forEach(m => {
    const achieved = invested >= m.traits_required;
    const div = document.createElement('div');
    div.className = 'relative flex flex-col transition-all';
    div.style.opacity = achieved ? '1' : '0.5';

    div.innerHTML = `
      <div class="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border bg-slate-950 flex items-center justify-center"
           style="border-color: ${achieved ? 'var(--accent2)' : '#334155'};">
      </div>
      <div class="flex items-center gap-1.5">
        <h4 class="text-xs font-bold ${achieved ? 'text-indigo-300' : 'text-slate-400'}">${m.description}</h4>
        <span class="text-[8px] px-1 bg-slate-900 border border-slate-800 text-slate-500 font-mono">${m.traits_required} Nodes</span>
      </div>
      <p class="text-[10px] text-slate-500 mt-0.5 leading-normal">${m.flavor || ''}</p>
    `;
    container.appendChild(div);
  });
}

function canUnlockTrait(trait) {
  if (!trait) return false;
  if (!trait.prerequisites || trait.prerequisites.length === 0) return true;
  return trait.prerequisites.every(id => unlockedTraits.has(id));
}

function canLockTrait(traitId, pathId) {
  const dependents = FALLBACK_TRAITS.filter(t => t.path_id === pathId && t.prerequisites.includes(traitId) && unlockedTraits.has(t.id));
  return dependents.length === 0;
}

function toggleTraitSelection(traitId) {
  const trait = FALLBACK_TRAITS.find(t => t.id === traitId);
  if (!trait) return;

  const isBought = unlockedTraits.has(traitId);

  if (isBought) {
    if (!canLockTrait(traitId, trait.path_id)) {
      triggerWarningToast('Dependency error: Child talents rely on this path node.');
      return;
    }
    unlockedTraits.delete(traitId);
  } else {
    if (!canUnlockTrait(trait)) {
      triggerWarningToast('Locked: Planar nodes leading to this are not unlocked.');
      return;
    }
    if (unlockedTraits.size >= maxBudgetLimit) {
      triggerWarningToast('Budget restriction: Reclaim points or gain levels.');
      return;
    }
    unlockedTraits.add(traitId);
  }

  updateNodeStates();
  drawTreeConnections();
  selectPath(selectedPathId);
  calculateCombinedBonuses();
}

function renderConstellationNodes(pathId) {
  const parent = document.getElementById('nodes-container');
  if (!parent) return;
  parent.innerHTML = '';

  const traits = FALLBACK_TRAITS.filter(t => t.path_id === pathId);
  const maxCol = 3;
  const maxRow = 4;

  traits.forEach(trait => {
    const btn = document.createElement('button');
    btn.id = `node-${trait.id}`;

    const leftPct = (trait.col / (maxCol + 1)) * 100;
    const topPct = (trait.row / (maxRow + 0.6)) * 100;

    btn.className = 'absolute node-bubble-paths z-10';
    btn.style.left = `calc(${leftPct}% - 19px)`;
    btn.style.top = `calc(${topPct}% - 19px)`;
    btn.textContent = getInitials(trait.name);
    btn.style.borderColor = getAttrColor(trait.attribute);

    btn.onclick = () => toggleTraitSelection(trait.id);
    btn.onmouseenter = () => showTooltip(trait);
    btn.onmouseleave = () => resetTooltip();

    parent.appendChild(btn);
  });

  setTimeout(() => {
    updateNodeStates();
    drawTreeConnections();
  }, 50);
}

function updateNodeStates() {
  const traits = FALLBACK_TRAITS.filter(t => t.path_id === selectedPathId);

  traits.forEach(t => {
    const el = document.getElementById(`node-${t.id}`);
    if (!el) return;

    el.classList.remove('locked', 'available', 'unlocked');

    if (unlockedTraits.has(t.id)) {
      el.classList.add('unlocked');
      el.style.borderColor = '#a5b4fc';
    } else if (canUnlockTrait(t)) {
      el.classList.add('available');
      el.style.borderColor = getAttrColor(t.attribute);
    } else {
      el.classList.add('locked');
      el.style.borderColor = '#334155';
    }
  });

  const spent = document.getElementById('spent-points');
  if (spent) spent.textContent = unlockedTraits.size;
}

function drawTreeConnections() {
  const canvas = document.getElementById('svg-canvas');
  const viewport = document.getElementById('tree-viewport');
  if (!canvas || !viewport) return;

  const vpRect = viewport.getBoundingClientRect();
  const traces = canvas.querySelectorAll('path');
  traces.forEach(p => p.remove());

  const traits = FALLBACK_TRAITS.filter(t => t.path_id === selectedPathId);

  traits.forEach(child => {
    child.prerequisites.forEach(pId => {
      const parentNode = traits.find(n => n.id === pId);
      if (!parentNode) return;

      const childEl = document.getElementById(`node-${child.id}`);
      const parentEl = document.getElementById(`node-${parentNode.id}`);
      if (!childEl || !parentEl) return;

      const cRect = childEl.getBoundingClientRect();
      const pRect = parentEl.getBoundingClientRect();

      const x1 = (pRect.left + pRect.width / 2) - vpRect.left;
      const y1 = (pRect.top + pRect.height / 2) - vpRect.top;
      const x2 = (cRect.left + cRect.width / 2) - vpRect.left;
      const y2 = (cRect.top + cRect.height / 2) - vpRect.top;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const dy = Math.abs(y2 - y1) * 0.25;
      const dStr = `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;

      path.setAttribute('d', dStr);
      path.setAttribute('fill', 'none');

      const unlocked = unlockedTraits.has(child.id) && unlockedTraits.has(parentNode.id);

      if (unlocked) {
        path.setAttribute('stroke', 'url(#line-unlocked)');
        path.setAttribute('stroke-width', '3');
        path.classList.add('connector-line-paths');
        path.setAttribute('filter', 'url(#glow)');
      } else {
        path.setAttribute('stroke', 'rgba(51, 65, 85, 0.45)');
        path.setAttribute('stroke-width', '1.5');
      }

      canvas.appendChild(path);
    });
  });
}

function showTooltip(trait) {
  const title = document.getElementById('info-name');
  const details = document.getElementById('info-details');
  if (!title || !details) return;

  title.textContent = `${trait.name} [${getInitials(trait.name)}]`;

  const bonusesStr = Object.entries(trait.bonuses).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ');
  const prereqsStr = trait.prerequisites.length > 0
    ? 'Prereq: ' + trait.prerequisites.map(id => FALLBACK_TRAITS.find(x => x.id === id)?.name).join(', ')
    : 'Initial Node';

  details.innerHTML = `
    <span class="text-purple-400 font-bold block text-[9px] uppercase tracking-wider">${prereqsStr}</span>
    <span class="text-slate-200 block mt-0.5">${trait.description}</span>
    <span class="text-indigo-300 font-semibold block text-[10px] mt-1">Gains: ${bonusesStr}</span>
  `;
}

function resetTooltip() {
  const title = document.getElementById('info-name');
  const details = document.getElementById('info-details');
  if (!title || !details) return;
  title.textContent = 'Click or Hover a Talent Node';
  details.textContent = 'Visualized path nodes feature initials instead of unique art assets for maximum performance and readability.';
}

function renderLedgerDirectory(pathId) {
  const tbody = document.getElementById('ledger-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const traits = FALLBACK_TRAITS.filter(t => t.path_id === pathId);

  traits.forEach(t => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-900/60 hover:bg-slate-900/30 transition-colors';

    const unlocked = unlockedTraits.has(t.id);
    const canUnlock = canUnlockTrait(t);
    const initials = getInitials(t.name);

    let statusText = '<span class="text-slate-600 uppercase text-[9px]">Locked</span>';
    if (unlocked) {
      statusText = '<span class="text-indigo-400 font-bold uppercase text-[9px]">Unlocked</span>';
    } else if (canUnlock) {
      statusText = '<span class="text-emerald-400 font-bold uppercase text-[9px]">Available</span>';
    }

    const prereqNames = t.prerequisites.length > 0
      ? t.prerequisites.map(p => FALLBACK_TRAITS.find(x => x.id === p)?.name || p).join(', ')
      : '—';

    const bonusStr = Object.entries(t.bonuses).map(([k, v]) => `+${v} ${k}`).join(', ');

    tr.innerHTML = `
      <td class="p-2 font-mono font-bold text-slate-500">${initials}</td>
      <td class="p-2">
        <div class="font-bold text-slate-200">${t.name}</div>
        <div class="text-[10px] text-slate-400">${t.description}</div>
      </td>
      <td class="p-2 text-[10px] text-slate-500">${prereqNames}</td>
      <td class="p-2 text-[10px] text-indigo-300">${bonusStr}</td>
      <td class="p-2 text-right">${statusText}</td>
    `;

    tbody.appendChild(tr);
  });
}

function calculateCombinedBonuses() {
  const compiled = {};

  unlockedTraits.forEach(id => {
    const t = FALLBACK_TRAITS.find(x => x.id === id);
    if (t && t.bonuses) {
      Object.entries(t.bonuses).forEach(([stat, val]) => {
        compiled[stat] = (compiled[stat] || 0) + val;
      });
    }
  });

  FALLBACK_PATHS.forEach(p => {
    const points = getInvestedCount(p.id);
    p.milestones.forEach(m => {
      if (points >= m.traits_required) {
        Object.entries(m.bonuses).forEach(([stat, val]) => {
          compiled[stat] = (compiled[stat] || 0) + val;
        });
      }
    });
  });

  activePathBonuses = compiled;
  renderActivePassiveShelf(compiled);
  updateDerivedVitals();
}

function renderActivePassiveShelf(compiled) {
  const shelf = document.getElementById('bonuses-shelf');
  if (!shelf) return;
  shelf.innerHTML = '';

  const entries = Object.entries(compiled).filter(([, val]) => val > 0);

  if (entries.length === 0) {
    shelf.innerHTML = '<span class="text-[9px] text-slate-600 uppercase italic">Spend points to compile global passive benefits</span>';
    return;
  }

  entries.forEach(([stat, val]) => {
    const span = document.createElement('span');
    span.className = 'px-2.5 py-1 text-[10px] rounded-full border border-indigo-950 bg-indigo-950/40 font-semibold tracking-wider text-slate-300 uppercase';
    span.innerHTML = `${stat.replace('_', ' ')}: <strong class="text-purple-400 font-bold font-mono ml-0.5">+${val}</strong>`;
    shelf.appendChild(span);
  });
}

function resetAllTrees() {
  unlockedTraits.clear();
  selectPath(selectedPathId);
  calculateCombinedBonuses();
  triggerWarningToast('Trait point investments reclaimed.');
}

let bannerTimer = null;
function triggerWarningToast(msg) {
  const banner = document.getElementById('warning-toast');
  const text = document.getElementById('warning-msg');
  if (!banner || !text) return;

  text.textContent = msg;
  banner.classList.remove('opacity-0', 'translate-y-20');
  banner.classList.add('opacity-100', 'translate-y-0');

  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => {
    banner.classList.remove('opacity-100', 'translate-y-0');
    banner.classList.add('opacity-0', 'translate-y-20');
  }, 3500);
}

function paths_init() {
  initPathsSubtab();
}

function readPaths() {
  return {
    selected_path: selectedPathId,
    unlocked: Array.from(unlockedTraits),
    bonuses: { ...activePathBonuses }
  };
}

function applyPathImport(dataPaths) {
  const nextSelected = dataPaths?.selected_path || dataPaths?.selectedPathId || selectedPathId;
  const selectedValid = FALLBACK_PATHS.some(p => p.id === nextSelected);
  selectedPathId = selectedValid ? nextSelected : (FALLBACK_PATHS[0]?.id || selectedPathId);

  const unlocked = Array.isArray(dataPaths?.unlocked) ? dataPaths.unlocked : [];
  unlockedTraits = new Set(unlocked);

  renderPathsList();
  selectPath(selectedPathId);
  calculateCombinedBonuses();
}

function inv_addItem(data) {
  _invItemId += 1;
  const grid = document.getElementById('inv_main_grid');
  if (!grid) return;
  const row = document.createElement('div');
  row.className = 'inv-item-row';
  row.dataset.itemId = _invItemId;
  row.innerHTML = `
    <div class="inv-item-top">
      <input type="text" placeholder="Name" class="inv-name" value="${_esc(data?.name || '')}" oninput="inv_weightUpdate(); inv_encumbranceUpdate();">
         <input type="number" placeholder="—" class="inv-weight" value="${data?.weight ?? ''}" min="0" oninput="inv_weightUpdate(); inv_encumbranceUpdate();">
      <button class="inv-item-remove" type="button" onclick="inv_removeItem(this)" title="Remove">×</button>
    </div>
    <textarea placeholder="Description" rows="4" class="inv-desc">${_esc(data?.desc || '')}</textarea>
  `;
  grid.appendChild(row);
  inv_weightUpdate();
}

function inv_removeItem(btn) {
  const row = btn.closest('.inv-item-row');
  if (row) row.remove();
  inv_weightUpdate();
  inv_encumbranceUpdate();
}

function inv_addSimple(containerId, namePh, descPh, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const slot = document.createElement('div');
  slot.className = 'inv-simple-slot';
  slot.innerHTML = `
    <input type="text" placeholder="${_esc(namePh)}" value="${_esc(data?.name || '')}">
    <textarea rows="2" placeholder="${_esc(descPh)}" style="resize:none;">${_esc(data?.desc || '')}</textarea>
  `;
  container.appendChild(slot);
}

function inv_init() {
  const mainGrid = document.getElementById('inv_main_grid');
  if (!mainGrid) return;
  if (mainGrid.querySelectorAll('.inv-item-row').length === 0) {
    for (let i = 0; i < INV_BASE_SLOTS; i++) inv_addItem();
  }
  const simpleSeed = [
    ['inv_potions_ingredients', 'Ingredient', 'Notes'],
    ['inv_potions_recipes', 'Potion', 'Recipe'],
    ['inv_crafts_components', 'Component', 'Notes'],
    ['inv_crafts_recipes', 'Craft', 'Recipe']
  ];
  simpleSeed.forEach(([id, np, dp]) => {
    const c = document.getElementById(id);
    if (c && c.querySelectorAll('.inv-simple-slot').length === 0) {
      for (let i = 0; i < INV_BASE_SIMPLE_SLOTS; i++) inv_addSimple(id, np, dp);
    }
  });
  inv_recalcMaxWeight();
  inv_weightUpdate();
  inv_encumbranceUpdate();
}

function inv_recalcMaxWeight() {
  const might = parseFloat(document.getElementById('body_might_total')?.value) || 0;
  const brawn = parseFloat(document.getElementById('body_brawn_total')?.value) || 0;
  const level = parseFloat(document.getElementById('charLevel')?.value) || 0;
  const backpack = parseFloat(document.getElementById('inv_backpack_bonus')?.value) || 0;
  const maxEl = document.getElementById('inv_max_weight');
  if (maxEl) {
    const max = might + brawn + level + backpack;
    maxEl.value = max > 0 ? max : '';
  }
}

function inv_weightUpdate() {
  let total = 0;
  document.querySelectorAll('#inv_main_grid .inv-weight').forEach(inp => {
    const v = parseFloat(inp.value);
    if (Number.isFinite(v)) total += v;
  });
  const curEl = document.getElementById('inv_current_weight');
  if (curEl) curEl.value = total > 0 ? total : '';
  inv_encumbranceUpdate();
}

function inv_encumbranceUpdate() {
  const cur = parseFloat(document.getElementById('inv_current_weight')?.value) || 0;
  const max = parseFloat(document.getElementById('inv_max_weight')?.value) || 0;
  ['enc_none', 'enc_enc', 'enc_over', 'enc_crushed'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  let activeId = 'enc_none';
  if (max > 0 && cur > max * 3) activeId = 'enc_crushed';
  else if (max > 0 && cur > max * 2) activeId = 'enc_over';
  else if (max > 0 && cur > max) activeId = 'enc_enc';
  const activeEl = document.getElementById(activeId);
  if (activeEl) activeEl.style.display = 'inline';

  const fill = document.getElementById('inv_weight_bar_fill');
  if (fill) {
    const pct = max > 0 ? Math.min((cur / max) * 100, 100) : 0;
    fill.style.width = pct + '%';
    fill.className = 'bar-fill';
    if (activeId === 'enc_none') fill.classList.add('green');
    if (activeId === 'enc_enc') fill.classList.add('yellow');
    if (activeId === 'enc_over') fill.classList.add('orange');
    if (activeId === 'enc_crushed') fill.classList.add('red');
  }
}

function _esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* === HELPERS & DERIVEDS === */
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getNumberValue(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const num = parseFloat(el.value);
  return Number.isFinite(num) ? num : 0;
}

function getTextValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function hasNumberInput(id) {
  const el = document.getElementById(id);
  return !!(el && el.value !== '');
}

function getSpeciesBonus(stat) { return 0; }
function getTraitBonus(stat) { return 0; }
function getItemBonus(stat) { return 0; }

function getPathBonus(stat) {
  return parseFloat(activePathBonuses[stat]) || 0;
}

function hasPathBonusInput() {
  return Object.values(activePathBonuses).some(val => (parseFloat(val) || 0) !== 0);
}

function updateDerivedVitals() {
  const level = getNumberValue('charLevel');
  const brawn = getNumberValue('body_base') + getNumberValue('body_brawn_mod');
  const fortitude = getNumberValue('body_base') + getNumberValue('body_fortitude_mod');

  const armorItemBonus = getNumberValue('armor_def') + getNumberValue('shield_def') + getNumberValue('cloak_def');
  const armorBonus = getSpeciesBonus('armor') + getPathBonus('armor') + getTraitBonus('armor') + getItemBonus('armor');
  const speedBonus = getSpeciesBonus('speed') + getPathBonus('speed') + getTraitBonus('speed') + getItemBonus('speed');
  const hpBonus = getSpeciesBonus('max_hp') + getPathBonus('max_hp') + getTraitBonus('max_hp') + getItemBonus('max_hp');
  const manaBonus = getSpeciesBonus('max_mana') + getPathBonus('max_mana') + getTraitBonus('max_mana') + getItemBonus('max_mana');

  const shouldCalc =
    hasNumberInput('charLevel') ||
    hasNumberInput('body_base') ||
    hasNumberInput('body_brawn_mod') ||
    hasNumberInput('body_fortitude_mod') ||
    hasNumberInput('armor_def') ||
    hasNumberInput('shield_def') ||
    hasNumberInput('cloak_def') ||
    hasPathBonusInput();

  const baseArmor = 4 + fortitude;
  const totalArmor = Math.max(0, baseArmor + armorItemBonus + armorBonus);
  const baseSpeed = 5;
  const totalSpeed = Math.max(0, baseSpeed + speedBonus);

  let maxHp = 0;
  if (level > 0) maxHp = (6 + brawn) + (level - 1) * (2 + brawn);
  maxHp = Math.max(0, maxHp + hpBonus);

  let maxMana = level > 0 ? level : 0;
  maxMana = Math.max(0, maxMana + manaBonus);

  const armorEl = document.getElementById('armor');
  const speedEl = document.getElementById('speed');
  const maxHpEl = document.getElementById('maxHealth');
  const maxManaEl = document.getElementById('maxMana');

  if (!shouldCalc) {
    if (armorEl) armorEl.value = '';
    if (speedEl && !speedEl.dataset.manual) speedEl.value = '';
    if (maxHpEl) maxHpEl.value = '';
    if (maxManaEl) maxManaEl.value = '';
  } else {
    if (armorEl) armorEl.value = Number.isFinite(totalArmor) ? totalArmor : '';
    if (speedEl && !speedEl.dataset.manual) speedEl.value = Number.isFinite(totalSpeed) ? totalSpeed : '';
    if (maxHpEl) maxHpEl.value = Number.isFinite(maxHp) ? maxHp : '';
    if (maxManaEl) maxManaEl.value = Number.isFinite(maxMana) ? maxMana : '';
  }

  updateBar('healthBar', maxHpEl ? maxHpEl.value : 0, document.getElementById('currentHealth')?.value || 0);
  updateBar('manaBar', maxManaEl ? maxManaEl.value : 0, document.getElementById('currentMana')?.value || 0);

  if (typeof inv_recalcMaxWeight === 'function') {
    inv_recalcMaxWeight();
    inv_encumbranceUpdate();
  }
}

/* === SAVE / LOAD / CLEAR === */
let fileHandle = null;

function readInvMain() {
  const rows = document.querySelectorAll('#inv_main_grid .inv-item-row');
  return Array.from(rows).map(row => ({
    name: row.querySelector('.inv-name')?.value || '',
    weight: parseFloat(row.querySelector('.inv-weight')?.value) || 0,
    desc: row.querySelector('.inv-desc')?.value || ''
  }));
}

function readInvSimple(containerId) {
  const rows = document.querySelectorAll(`#${containerId} .inv-simple-slot`);
  return Array.from(rows).map(row => ({
    name: row.querySelector('input')?.value || '',
    desc: row.querySelector('textarea')?.value || ''
  }));
}

function buildJsonExport() {
  return {
    version: '1.0',
    info: {
      name: getTextValue('charName'),
      species: getTextValue('charRace'),
      age: getNumberValue('charAge'),
      level: getNumberValue('charLevel'),
      avatar_data: portraitImg ? portraitImg.src : '',
      avatar_state: portraitImg ? portraitState : null
    },
    vitals: {
      armor: getNumberValue('armor'),
      speed: getNumberValue('speed'),
      max_hp: getNumberValue('maxHealth'),
      current_hp: getNumberValue('currentHealth'),
      max_mana: getNumberValue('maxMana'),
      current_mana: getNumberValue('currentMana'),
      exhaustion: parseInt(getTextValue('exhaustion'), 10) || 0,
      final_blows: finalBlowValue || 0,
      grace: graceValue || 0
    },
    attributes: {
      body: { base: getNumberValue('body_base'), might_mod: getNumberValue('body_might_mod'), brawn_mod: getNumberValue('body_brawn_mod'), fortitude_mod: getNumberValue('body_fortitude_mod') },
      skill: { base: getNumberValue('skill_base'), finesse_mod: getNumberValue('skill_finesse_mod'), reflex_mod: getNumberValue('skill_reflex_mod'), tinker_mod: getNumberValue('skill_tinker_mod') },
      mind: { base: getNumberValue('mind_base'), arcane_mod: getNumberValue('mind_arcane_mod'), spirit_mod: getNumberValue('mind_spirit_mod'), scholarship_mod: getNumberValue('mind_scholarship_mod') },
      style: { base: getNumberValue('style_base'), speech_mod: getNumberValue('style_speech_mod'), insight_mod: getNumberValue('style_insight_mod'), awareness_mod: getNumberValue('style_awareness_mod') }
    },
    equipment: {
      armor_slot: { name: getTextValue('armor_name'), defense: getTextValue('armor_def') === '' ? null : getNumberValue('armor_def'), notes: getTextValue('armor_notes') },
      shield_slot: { name: getTextValue('shield_name'), defense: getTextValue('shield_def') === '' ? null : getNumberValue('shield_def'), notes: getTextValue('shield_notes') },
      cloak_slot: { name: getTextValue('cloak_name'), defense: getTextValue('cloak_def') === '' ? null : getNumberValue('cloak_def'), notes: getTextValue('cloak_notes') },
      weapons: weapons.map(w => ({ name: w.name || '', damage: w.damage || '', attack: w.attack || '', notes: w.notes || '' }))
    },
    inventory: {
      money: {
        copper: getNumberValue('inv_copper'),
        silver: getNumberValue('inv_silver'),
        gold: getNumberValue('inv_gold'),
        platinum: getNumberValue('inv_platinum')
      },
      weight: {
        backpack_bonus: getNumberValue('inv_backpack_bonus')
      },
      items: readInvMain(),
      potions: {
        ingredients: readInvSimple('inv_potions_ingredients'),
        recipes: readInvSimple('inv_potions_recipes')
      },
      crafts: {
        components: readInvSimple('inv_crafts_components'),
        recipes: readInvSimple('inv_crafts_recipes')
      }
    },
    paths: readPaths(),
    notes: getTextValue('notes'),
    traits: [],
    spells: [],
    custom_traits: [],
    custom_spells: []
  };
}

function applyJsonImport(data) {
  if (!data) return;
  const info = data.info || {};
  const vitals = data.vitals || {};
  const attrs = data.attributes || {};
  const equip = data.equipment || {};
  const inv = data.inventory || {};

  const setVal = (id, value) => { const el = document.getElementById(id); if (el) el.value = value; };
  const setNumber = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (value === null || value === undefined) { el.value = ''; return; }
    el.value = value;
  };

  setVal('charName', info.name || '');
  setVal('charRace', info.species || '');
  setNumber('charAge', info.age);
  setNumber('charLevel', info.level);

  setNumber('currentHealth', vitals.current_hp);
  setNumber('currentMana', vitals.current_mana);
  setNumber('exhaustion', vitals.exhaustion);

  const speedEl = document.getElementById('speed');
  if (speedEl && typeof vitals.speed === 'number') speedEl.dataset.manual = 'true';

  if (typeof vitals.final_blows === 'number') setFinalBlow(vitals.final_blows);
  if (typeof vitals.grace === 'number') setGrace(vitals.grace);

  const body = attrs.body || {};
  setNumber('body_base', body.base);
  setNumber('body_might_mod', body.might_mod);
  setNumber('body_brawn_mod', body.brawn_mod);
  setNumber('body_fortitude_mod', body.fortitude_mod);

  const skill = attrs.skill || {};
  setNumber('skill_base', skill.base);
  setNumber('skill_finesse_mod', skill.finesse_mod);
  setNumber('skill_reflex_mod', skill.reflex_mod);
  setNumber('skill_tinker_mod', skill.tinker_mod);

  const mind = attrs.mind || {};
  setNumber('mind_base', mind.base);
  setNumber('mind_arcane_mod', mind.arcane_mod);
  setNumber('mind_spirit_mod', mind.spirit_mod);
  setNumber('mind_scholarship_mod', mind.scholarship_mod);

  const style = attrs.style || {};
  setNumber('style_base', style.base);
  setNumber('style_speech_mod', style.speech_mod);
  setNumber('style_insight_mod', style.insight_mod);
  setNumber('style_awareness_mod', style.awareness_mod);

  const armorSlot = equip.armor_slot || {};
  setVal('armor_name', armorSlot.name || '');
  setNumber('armor_def', armorSlot.defense);
  setVal('armor_notes', armorSlot.notes || '');

  const shieldSlot = equip.shield_slot || {};
  setVal('shield_name', shieldSlot.name || '');
  setNumber('shield_def', shieldSlot.defense);
  setVal('shield_notes', shieldSlot.notes || '');

  const cloakSlot = equip.cloak_slot || {};
  setVal('cloak_name', cloakSlot.name || '');
  setNumber('cloak_def', cloakSlot.defense);
  setVal('cloak_notes', cloakSlot.notes || '');

  const money = inv.money || {};
  setNumber('inv_copper', money.copper);
  setNumber('inv_silver', money.silver);
  setNumber('inv_gold', money.gold);
  setNumber('inv_platinum', money.platinum);
  setNumber('inv_backpack_bonus', (inv.weight || {}).backpack_bonus);

  const mainGrid = document.getElementById('inv_main_grid');
  if (mainGrid) mainGrid.innerHTML = '';
  _invItemId = 0;
  const items = Array.isArray(inv.items) ? inv.items : [];
  if (items.length === 0) {
    for (let i = 0; i < INV_BASE_SLOTS; i++) inv_addItem();
  } else {
    items.forEach(item => inv_addItem({ name: item.name, weight: item.weight, desc: item.desc }));
  }

  const simpleRestore = (containerId, list, namePh, descPh) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const rows = Array.isArray(list) ? list : [];
    if (rows.length === 0) {
      for (let i = 0; i < INV_BASE_SIMPLE_SLOTS; i++) inv_addSimple(containerId, namePh, descPh);
      return;
    }
    rows.forEach(row => inv_addSimple(containerId, namePh, descPh, row));
  };
  simpleRestore('inv_potions_ingredients', (inv.potions || {}).ingredients, 'Ingredient', 'Notes');
  simpleRestore('inv_potions_recipes', (inv.potions || {}).recipes, 'Potion', 'Recipe');
  simpleRestore('inv_crafts_components', (inv.crafts || {}).components, 'Component', 'Notes');
  simpleRestore('inv_crafts_recipes', (inv.crafts || {}).recipes, 'Craft', 'Recipe');

  weapons = [];
  weaponCount = 0;
  const weaponList = Array.isArray(equip.weapons) ? equip.weapons : [];
  weaponList.forEach(w => {
    weaponCount += 1;
    weapons.push({ id: weaponCount, name: w.name || '', damage: w.damage || '', attack: w.attack || '', notes: w.notes || '' });
  });
  if (weapons.length === 0) { addWeapon(); addWeapon(); addWeapon(); }
  renderWeapons();

  applyPathImport(data.paths);

  setVal('notes', data.notes || '');
  recalcAll();
  inv_recalcMaxWeight();
  inv_weightUpdate();
  inv_encumbranceUpdate();

  if (info.avatar_data) renderPortraitFromState(info.avatar_data, info.avatar_state || { x: 0, y: 0, scale: 1 });
}

async function saveJsonToFile(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${(data.info?.name || 'character').trim() || 'character'}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function collectData() {
  const data = {};
  document.querySelectorAll('[id]').forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') data[el.id] = el.value;
  });
  data._grace = graceValue;
  data._finalBlow = finalBlowValue;
  data._weapons = JSON.parse(JSON.stringify(weapons));
  data._pathUnlocked = readPaths().unlocked;
  data._pathSelected = readPaths().selected_path;
  return data;
}

function applyData(data) {
  Object.entries(data).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) el.value = value;
  });
  const speedEl = document.getElementById('speed');
  if (speedEl && speedEl.value !== '') speedEl.dataset.manual = 'true';
  if (data._grace !== undefined) { graceValue = data._grace; buildPips('gracePips', 6, graceValue, setGrace); }
  if (data._finalBlow !== undefined) { finalBlowValue = data._finalBlow; buildPips('finalBlowPips', 4, finalBlowValue, setFinalBlow); }
  if (data._weapons) {
    weapons = [];
    weaponCount = 0;
    data._weapons.forEach(w => { weaponCount = Math.max(weaponCount, w.id); weapons.push(w); });
    renderWeapons();
  }
  if (data._pathUnlocked || data._pathSelected) {
    applyPathImport({ unlocked: data._pathUnlocked || [], selected_path: data._pathSelected });
  }
  recalcAll();
}

async function saveSheet() {
  const data = buildJsonExport();
  try {
    await saveJsonToFile(data);
    showFeedback('Saved.');
  } catch (error) {
    console.error(error);
    showFeedback('Save canceled.');
  }
}

async function loadSheet() {
  try {
    if (window.showOpenFilePicker) {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
        multiple: false
      });
      const file = await handle.getFile();
      const text = await file.text();
      applyJsonImport(JSON.parse(text));
      showFeedback('Loaded.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      applyJsonImport(JSON.parse(text));
      showFeedback('Loaded.');
    };
    input.click();
  } catch (error) {
    console.error(error);
    showFeedback('Load canceled.');
  }
}

function clearSheet() {
  if (!confirm('Clear all fields?')) return;
  ['ml_sheet', 'ml_portrait_data', 'ml_portrait_state'].forEach(k => localStorage.removeItem(k));
  document.querySelectorAll('input[type=text],input[type=number],textarea').forEach(el => { el.value = ''; });
  document.querySelectorAll('select').forEach(el => { el.selectedIndex = 0; });
  const speedEl = document.getElementById('speed');
  if (speedEl) speedEl.dataset.manual = '';

  portraitImg = null;
  portraitState = { x: 0, y: 0, scale: 1 };
  const portraitCanvas = document.getElementById('portraitCanvas');
  if (portraitCanvas) portraitCanvas.getContext('2d').clearRect(0, 0, PORT_SIZE, PORT_SIZE);

  weapons = [];
  weaponCount = 0;
  addWeapon(); addWeapon(); addWeapon();

  unlockedTraits.clear();
  selectedPathId = FALLBACK_PATHS[0]?.id || selectedPathId;
  renderPathsList();
  selectPath(selectedPathId);
  calculateCombinedBonuses();

  graceValue = 0;
  buildPips('gracePips', 6, 0, setGrace);
  finalBlowValue = 0;
  buildPips('finalBlowPips', 4, 0, setFinalBlow);

  recalcAll();

  const mainGrid = document.getElementById('inv_main_grid');
  if (mainGrid) mainGrid.innerHTML = '';
  ['inv_potions_ingredients', 'inv_potions_recipes', 'inv_crafts_components', 'inv_crafts_recipes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  _invItemId = 0;
  inv_init();
  showFeedback('Cleared.');
}

/* Tab Management */
function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(el => {
    el.style.display = (el.id === 'tab-' + name) ? '' : 'none';
  });
  document.querySelectorAll('.subtab').forEach(btn => {
    const key = btn.textContent.trim().toLowerCase();
    btn.classList.toggle('active', key === name);
  });
  if (name === 'paths') {
    setTimeout(drawTreeConnections, 60);
  }
}

/* === INIT === */
window.addEventListener('DOMContentLoaded', () => {
  showTab('main');
  buildPips('gracePips', 6, 0, setGrace);
  buildPips('finalBlowPips', 4, 0, setFinalBlow);
  inv_init();
  paths_init();
  recalcAll();

  ['charLevel', 'armor_def', 'shield_def', 'cloak_def'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateDerivedVitals);
  });

  const raw = localStorage.getItem('ml_sheet');
  if (raw) {
    applyData(JSON.parse(raw));
    const imgSrc = localStorage.getItem('ml_portrait_data');
    const stateRaw = localStorage.getItem('ml_portrait_state');
    if (imgSrc && stateRaw) renderPortraitFromState(imgSrc, JSON.parse(stateRaw));
  }
  if (weapons.length === 0) { addWeapon(); addWeapon(); addWeapon(); }

  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', event => {
      event.stopPropagation();
      menu.classList.toggle('hidden');
    });
    document.addEventListener('click', () => {
      if (!menu.classList.contains('hidden')) menu.classList.add('hidden');
    });
  }
});

document.addEventListener('input', () => {
  if (typeof inv_recalcMaxWeight === 'function') inv_recalcMaxWeight();
  if (typeof inv_encumbranceUpdate === 'function') inv_encumbranceUpdate();
});
