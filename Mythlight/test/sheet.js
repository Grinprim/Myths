/* === ATTRIBUTES === */
const GROUPS={body:['might','brawn','fortitude'],skill:['finesse','reflex','tinker'],mind:['arcane','spirit','scholarship'],style:['speech','insight','awareness']};
function val(id){const e=document.getElementById(id);return e?(parseFloat(e.value)||0):0;}
function recalcSkill(g,s){
  const o=document.getElementById(g+'_'+s+'_total');
  const baseEl=document.getElementById(g+'_'+ 'base');
  const modEl=document.getElementById(g+'_'+s+'_mod');
  if(!o)return;
  const baseEmpty=baseEl ? baseEl.value==='' : true;
  const modEmpty=modEl ? modEl.value==='' : true;
  if(baseEmpty && modEmpty){
    o.value='';
    updateDerivedVitals();
    return;
  }
  o.value=val(g+'_base')+val(g+'_'+s+'_mod');
  updateDerivedVitals();
}
function recalcGroup(g){(GROUPS[g]||[]).forEach(s=>recalcSkill(g,s));}
function recalcAll(){Object.keys(GROUPS).forEach(g=>recalcGroup(g));updateDerivedVitals();}

/* === BARS === */
function updateBar(barId,maxVal,curVal){
  const max=parseFloat(maxVal)||0,cur=parseFloat(curVal)||0;
  const pct=max>0?Math.max(0,Math.min(100,cur/max*100)):0;
  document.getElementById(barId).style.width=pct+'%';
}

/* === PIPS === */
function buildPips(cid,maxN,cur,onSet){
  const c=document.getElementById(cid);c.innerHTML='';
  for(let i=1;i<=maxN;i++){const b=document.createElement('button');b.className='pip'+(i<=cur?' filled':'');b.onclick=()=>onSet(cur===i?0:i);c.appendChild(b);}
}
let graceValue=0;
function setGrace(n){graceValue=n;buildPips('gracePips',6,graceValue,setGrace);}
let finalBlowValue=0;
function setFinalBlow(n){finalBlowValue=n;buildPips('finalBlowPips',4,finalBlowValue,setFinalBlow);}

/* === FEEDBACK === */
function showFeedback(msg){const el=document.getElementById('rollResult'),prev=el.textContent;el.textContent=msg;setTimeout(()=>el.textContent=prev,1500);}

/* === PORTRAIT === */
const PORT_SIZE=160, VIEWPORT_SIZE=220;
let portraitImg=null,portraitState={x:0,y:0,scale:1};
let edState={imgW:0,imgH:0,offsetX:0,offsetY:0,scale:1,dragging:false,lastX:0,lastY:0};

document.getElementById('portraitInput').addEventListener('change',function(){
  const file=this.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{const img=new Image();img.onload=()=>{portraitImg=img;openEditorWith(img);};img.src=e.target.result;};
  reader.readAsDataURL(file);this.value='';
});
function openPortraitEditor(){if(!portraitImg){document.getElementById('portraitInput').click();return;}openEditorWith(portraitImg);}
function chooseNewPortrait(){document.getElementById('portraitInput').click();}
function openEditorWith(img){
  const fit=Math.max(VIEWPORT_SIZE/img.width,VIEWPORT_SIZE/img.height);
  const hp=portraitImg===img&&portraitState.scale>0;
  edState={imgW:img.width,imgH:img.height,offsetX:hp?portraitState.x:0,offsetY:hp?portraitState.y:0,scale:hp?portraitState.scale:fit,dragging:false,lastX:0,lastY:0};
  const sl=document.getElementById('zoomSlider');sl.min=fit*0.5;sl.max=fit*6;sl.value=edState.scale;
  document.getElementById('portraitModal').classList.add('open');drawEditor();setupEditorEvents();
}
function closePortraitEditor(){document.getElementById('portraitModal').classList.remove('open');removeEditorEvents();}
function drawEditor(){
  const c=document.getElementById('editorCanvas'),ctx=c.getContext('2d');
  c.width=VIEWPORT_SIZE;c.height=VIEWPORT_SIZE;ctx.clearRect(0,0,VIEWPORT_SIZE,VIEWPORT_SIZE);
  if(!portraitImg)return;
  ctx.drawImage(portraitImg,VIEWPORT_SIZE/2+edState.offsetX-edState.imgW*edState.scale/2,VIEWPORT_SIZE/2+edState.offsetY-edState.imgH*edState.scale/2,edState.imgW*edState.scale,edState.imgH*edState.scale);
}
document.getElementById('zoomSlider').addEventListener('input',function(){edState.scale=parseFloat(this.value);drawEditor();});
let _evMove,_evUp;
function setupEditorEvents(){
  const vp=document.getElementById('editorViewport');
  _evMove=e=>{if(!edState.dragging)return;edState.offsetX+=e.clientX-edState.lastX;edState.offsetY+=e.clientY-edState.lastY;edState.lastX=e.clientX;edState.lastY=e.clientY;drawEditor();};
  _evUp=()=>{edState.dragging=false;};
  vp.addEventListener('mousedown',e=>{edState.dragging=true;edState.lastX=e.clientX;edState.lastY=e.clientY;});
  window.addEventListener('mousemove',_evMove);window.addEventListener('mouseup',_evUp);
  vp.addEventListener('touchstart',e=>{const t=e.touches[0];edState.dragging=true;edState.lastX=t.clientX;edState.lastY=t.clientY;},{passive:true});
  vp.addEventListener('touchmove',e=>{if(!edState.dragging)return;const t=e.touches[0];edState.offsetX+=t.clientX-edState.lastX;edState.offsetY+=t.clientY-edState.lastY;edState.lastX=t.clientX;edState.lastY=t.clientY;drawEditor();},{passive:true});
  vp.addEventListener('touchend',()=>{edState.dragging=false;});
}
function removeEditorEvents(){window.removeEventListener('mousemove',_evMove);window.removeEventListener('mouseup',_evUp);}
function applyPortrait(){
  portraitState={x:edState.offsetX,y:edState.offsetY,scale:edState.scale};
  const S=PORT_SIZE,c=document.getElementById('portraitCanvas'),ctx=c.getContext('2d');
  c.width=S;c.height=S;ctx.clearRect(0,0,S,S);ctx.save();
  ctx.beginPath();ctx.arc(S/2,S/2,S/2,0,Math.PI*2);ctx.clip();
  const s=edState.scale*(S/VIEWPORT_SIZE);
  ctx.drawImage(portraitImg,S/2+edState.offsetX*(S/VIEWPORT_SIZE)-edState.imgW*s/2,S/2+edState.offsetY*(S/VIEWPORT_SIZE)-edState.imgH*s/2,edState.imgW*s,edState.imgH*s);
  ctx.restore();
  localStorage.setItem('ml_portrait_data',portraitImg.src);
  localStorage.setItem('ml_portrait_state',JSON.stringify(portraitState));
  closePortraitEditor();
}
function renderPortraitFromState(imgSrc,state){
  const img=new Image();
  img.onload=()=>{
    portraitImg=img;portraitState=state;
    const S=PORT_SIZE,VP=VIEWPORT_SIZE,c=document.getElementById('portraitCanvas'),ctx=c.getContext('2d');
    c.width=S;c.height=S;ctx.clearRect(0,0,S,S);ctx.save();
    ctx.beginPath();ctx.arc(S/2,S/2,S/2,0,Math.PI*2);ctx.clip();
    const s=state.scale*(S/VP);
    ctx.drawImage(img,S/2+state.x*(S/VP)-img.width*s/2,S/2+state.y*(S/VP)-img.height*s/2,img.width*s,img.height*s);
    ctx.restore();
  };img.src=imgSrc;
}

/* === WEAPONS === */
let weaponCount=0,weapons=[];
function addWeapon(data){weaponCount++;weapons.push(data||{id:weaponCount,name:'',damage:'',attack:'',notes:''});renderWeapons();}
function removeWeapon(id){weapons=weapons.filter(w=>w.id!==id);renderWeapons();}
function renderWeapons(){
  const list=document.getElementById('weaponsList');list.innerHTML='';
  weapons.forEach((w,idx)=>{
    const card=document.createElement('div');card.className='weapon-card';
    card.innerHTML=`
      <div class="wfield">
        <div class="wlabel">Weapon ${idx+1}</div>
        <input type="text" placeholder="Name" value="${esc(w.name)}" oninput="upW(${w.id},'name',this.value)">
      </div>
      <div class="wfield">
        <div class="wlabel">Damage</div>
        <input type="text" placeholder="—" value="${esc(w.damage)}" oninput="upW(${w.id},'damage',this.value)">
      </div>
      <div class="wfield">
        <div class="wlabel">Attack</div>
        <input type="text" placeholder="—" value="${esc(w.attack)}" oninput="upW(${w.id},'attack',this.value)">
      </div>
      <button class="weapon-remove" onclick="removeWeapon(${w.id})" title="Remove">×</button>
      <div class="weapon-notes">
        <div class="wlabel">Notes</div>
        <textarea rows="2" oninput="upW(${w.id},'notes',this.value)">${esc(w.notes)}</textarea>
      </div>`;
    list.appendChild(card);
  });
}
function upW(id,field,value){const w=weapons.find(w=>w.id===id);if(w)w[field]=value;}

/* === INVENTORY === */
let invCount=0,invItems=[];
function addInvItem(data){invCount++;invItems.push(data||{id:invCount,name:'',qty:1});renderInv();}
function removeInvItem(id){invItems=invItems.filter(i=>i.id!==id);renderInv();}
function renderInv(){
  const list=document.getElementById('invList');list.innerHTML='';
  invItems.forEach(item=>{
    const row=document.createElement('div');row.className='inv-item';
    row.innerHTML=`
      <input type="text" placeholder="Item name" value="${esc(item.name)}" oninput="upInv(${item.id},'name',this.value)">
      <input type="number" min="0" value="${item.qty}" oninput="upInv(${item.id},'qty',this.value)">
      <button class="inv-remove" onclick="removeInvItem(${item.id})" title="Remove">×</button>`;
    list.appendChild(row);
  });
}
function upInv(id,field,value){const i=invItems.find(i=>i.id===id);if(i)i[field]=value;}

/* === HELPERS === */
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

/* === SAVE / LOAD / CLEAR === */
let fileHandle=null;

function getNumberValue(id){
  const el=document.getElementById(id);
  if(!el)return 0;
  const num=parseFloat(el.value);
  return Number.isFinite(num)?num:0;
}

function getTextValue(id){
  const el=document.getElementById(id);
  return el?el.value:'';
}

function getSpeciesBonus(stat){return 0;}
function getPathBonus(stat){return 0;}
function getTraitBonus(stat){return 0;}
function getItemBonus(stat){return 0;}

function updateDerivedVitals(){
  const level=getNumberValue('charLevel');
  const brawn=getNumberValue('body_base')+getNumberValue('body_brawn_mod');
  const fortitude=getNumberValue('body_base')+getNumberValue('body_fortitude_mod');

  const armorItemBonus=getNumberValue('armor_def')+getNumberValue('shield_def')+getNumberValue('cloak_def');
  const armorBonus=getSpeciesBonus('armor')+getPathBonus('armor')+getTraitBonus('armor')+getItemBonus('armor');
  const speedBonus=getSpeciesBonus('speed')+getPathBonus('speed')+getTraitBonus('speed')+getItemBonus('speed');
  const hpBonus=getSpeciesBonus('max_hp')+getPathBonus('max_hp')+getTraitBonus('max_hp')+getItemBonus('max_hp');
  const manaBonus=getSpeciesBonus('max_mana')+getPathBonus('max_mana')+getTraitBonus('max_mana')+getItemBonus('max_mana');

  const baseArmor=4+fortitude;
  const totalArmor=Math.max(0,baseArmor+armorItemBonus+armorBonus);
  const baseSpeed=5;
  const totalSpeed=Math.max(0,baseSpeed+speedBonus);

  let maxHp=0;
  if(level>0){
    maxHp=(6+brawn)+(level-1)*(2+brawn);
  }
  maxHp=Math.max(0,maxHp+hpBonus);

  let maxMana=level>0?level:0;
  maxMana=Math.max(0,maxMana+manaBonus);

  const armorEl=document.getElementById('armor');
  const speedEl=document.getElementById('speed');
  const maxHpEl=document.getElementById('maxHealth');
  const maxManaEl=document.getElementById('maxMana');
  if(armorEl)armorEl.value=Number.isFinite(totalArmor)?totalArmor:'';
  if(speedEl)speedEl.value=Number.isFinite(totalSpeed)?totalSpeed:'';
  if(maxHpEl)maxHpEl.value=Number.isFinite(maxHp)?maxHp:'';
  if(maxManaEl)maxManaEl.value=Number.isFinite(maxMana)?maxMana:'';

  updateBar('healthBar',maxHpEl?maxHpEl.value:0,document.getElementById('currentHealth').value);
  updateBar('manaBar',maxManaEl?maxManaEl.value:0,document.getElementById('currentMana').value);
}

function buildJsonExport(){
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
      exhaustion: parseInt(getTextValue('exhaustion'),10) || 0,
      final_blows: finalBlowValue || 0,
      grace: graceValue || 0
    },
    attributes: {
      body: {
        base: getNumberValue('body_base'),
        might_mod: getNumberValue('body_might_mod'),
        brawn_mod: getNumberValue('body_brawn_mod'),
        fortitude_mod: getNumberValue('body_fortitude_mod')
      },
      skill: {
        base: getNumberValue('skill_base'),
        finesse_mod: getNumberValue('skill_finesse_mod'),
        reflex_mod: getNumberValue('skill_reflex_mod'),
        tinker_mod: getNumberValue('skill_tinker_mod')
      },
      mind: {
        base: getNumberValue('mind_base'),
        arcane_mod: getNumberValue('mind_arcane_mod'),
        spirit_mod: getNumberValue('mind_spirit_mod'),
        scholarship_mod: getNumberValue('mind_scholarship_mod')
      },
      style: {
        base: getNumberValue('style_base'),
        speech_mod: getNumberValue('style_speech_mod'),
        insight_mod: getNumberValue('style_insight_mod'),
        awareness_mod: getNumberValue('style_awareness_mod')
      }
    },
    equipment: {
      armor_slot: {
        name: getTextValue('armor_name'),
        defense: getTextValue('armor_def') === '' ? null : getNumberValue('armor_def'),
        notes: getTextValue('armor_notes')
      },
      shield_slot: {
        name: getTextValue('shield_name'),
        defense: getTextValue('shield_def') === '' ? null : getNumberValue('shield_def'),
        notes: getTextValue('shield_notes')
      },
      cloak_slot: {
        name: getTextValue('cloak_name'),
        defense: getTextValue('cloak_def') === '' ? null : getNumberValue('cloak_def'),
        notes: getTextValue('cloak_notes')
      },
      weapons: weapons.map(w=>({
        name: w.name || '',
        damage: w.damage || '',
        attack: w.attack || '',
        notes: w.notes || ''
      }))
    },
    notes: getTextValue('notes'),
    traits: [],
    spells: [],
    custom_traits: [],
    custom_spells: []
  };
}

function applyJsonImport(data){
  if(!data)return;
  const info=data.info||{};
  const vitals=data.vitals||{};
  const attrs=data.attributes||{};
  const equip=data.equipment||{};

  const setVal=(id,value)=>{const el=document.getElementById(id);if(el)el.value=value;};
  const setNumber=(id,value)=>{
    const el=document.getElementById(id);
    if(!el)return;
    if(value===0 || value===null || value===undefined){
      el.value='';
      return;
    }
    el.value=value;
  };

  setVal('charName',info.name||'');
  setVal('charRace',info.species||'');
  setNumber('charAge',info.age);
  setNumber('charLevel',info.level);

  setNumber('currentHealth',vitals.current_hp);
  setNumber('currentMana',vitals.current_mana);
  setNumber('exhaustion',vitals.exhaustion);

  if(typeof vitals.final_blows==='number')setFinalBlow(vitals.final_blows);
  if(typeof vitals.grace==='number')setGrace(vitals.grace);

  const body=attrs.body||{};
  setNumber('body_base',body.base);
  setNumber('body_might_mod',body.might_mod);
  setNumber('body_brawn_mod',body.brawn_mod);
  setNumber('body_fortitude_mod',body.fortitude_mod);

  const skill=attrs.skill||{};
  setNumber('skill_base',skill.base);
  setNumber('skill_finesse_mod',skill.finesse_mod);
  setNumber('skill_reflex_mod',skill.reflex_mod);
  setNumber('skill_tinker_mod',skill.tinker_mod);

  const mind=attrs.mind||{};
  setNumber('mind_base',mind.base);
  setNumber('mind_arcane_mod',mind.arcane_mod);
  setNumber('mind_spirit_mod',mind.spirit_mod);
  setNumber('mind_scholarship_mod',mind.scholarship_mod);

  const style=attrs.style||{};
  setNumber('style_base',style.base);
  setNumber('style_speech_mod',style.speech_mod);
  setNumber('style_insight_mod',style.insight_mod);
  setNumber('style_awareness_mod',style.awareness_mod);

  const armorSlot=equip.armor_slot||{};
  setVal('armor_name',armorSlot.name||'');
  setNumber('armor_def',armorSlot.defense);
  setVal('armor_notes',armorSlot.notes||'');

  const shieldSlot=equip.shield_slot||{};
  setVal('shield_name',shieldSlot.name||'');
  setNumber('shield_def',shieldSlot.defense);
  setVal('shield_notes',shieldSlot.notes||'');

  const cloakSlot=equip.cloak_slot||{};
  setVal('cloak_name',cloakSlot.name||'');
  setNumber('cloak_def',cloakSlot.defense);
  setVal('cloak_notes',cloakSlot.notes||'');

  weapons=[];
  weaponCount=0;
  const weaponList=Array.isArray(equip.weapons)?equip.weapons:[];
  weaponList.forEach(w=>{weaponCount+=1;weapons.push({id:weaponCount,name:w.name||'',damage:w.damage||'',attack:w.attack||'',notes:w.notes||''});});
  if(weapons.length===0){addWeapon();addWeapon();addWeapon();}
  renderWeapons();

  setVal('notes',data.notes||'');
  recalcAll();

  if(info.avatar_data){
    renderPortraitFromState(info.avatar_data,info.avatar_state||{x:0,y:0,scale:1});
  }
}

async function saveJsonToFile(data){
  const json=JSON.stringify(data,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  link.download=`${(data.info?.name||'character').trim()||'character'}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function replaceJsonFile(data){
  if(!fileHandle) return false;
  const json=JSON.stringify(data,null,2);
  const writable=await fileHandle.createWritable();
  await writable.write(json);
  await writable.close();
  return true;
}

function collectData(){
  const data={};
  document.querySelectorAll('[id]').forEach(el=>{if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.tagName==='SELECT')data[el.id]=el.value;});
  data._grace=graceValue;data._finalBlow=finalBlowValue;
  data._weapons=JSON.parse(JSON.stringify(weapons));
  data._inv=JSON.parse(JSON.stringify(invItems));
  return data;
}
function applyData(data){
  Object.entries(data).forEach(([id,value])=>{const el=document.getElementById(id);if(el&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.tagName==='SELECT'))el.value=value;});
  if(data._grace!==undefined){graceValue=data._grace;buildPips('gracePips',6,graceValue,setGrace);}
  if(data._finalBlow!==undefined){finalBlowValue=data._finalBlow;buildPips('finalBlowPips',4,finalBlowValue,setFinalBlow);}
  if(data._weapons){weapons=[];weaponCount=0;data._weapons.forEach(w=>{weaponCount=Math.max(weaponCount,w.id);weapons.push(w);});renderWeapons();}
  if(data._inv){invItems=[];invCount=0;data._inv.forEach(i=>{invCount=Math.max(invCount,i.id);invItems.push(i);});renderInv();}
  recalcAll();
}
async function saveSheet(){
  const data=buildJsonExport();
  try {
    await saveJsonToFile(data);
    showFeedback('Saved.');
  } catch (error) {
    console.error(error);
    showFeedback('Save canceled.');
  }
}

async function loadSheet(){
  try {
    if(window.showOpenFilePicker){
      const [handle]=await window.showOpenFilePicker({
        types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
        multiple: false
      });
      const file=await handle.getFile();
      const text=await file.text();
      const json=JSON.parse(text);
      fileHandle=handle;
      applyJsonImport(json);
      showFeedback('Loaded.');
      return;
    }
    const input=document.createElement('input');
    input.type='file';
    input.accept='.json,application/json';
    input.onchange=async()=>{
      const file=input.files?.[0];
      if(!file)return;
      const text=await file.text();
      applyJsonImport(JSON.parse(text));
      showFeedback('Loaded.');
    };
    input.click();
  } catch (error) {
    console.error(error);
    showFeedback('Load canceled.');
  }
}
function clearSheet(){
  if(!confirm('Clear all fields?'))return;
  ['ml_sheet','ml_portrait_data','ml_portrait_state'].forEach(k=>localStorage.removeItem(k));
  document.querySelectorAll('input[type=text],input[type=number],textarea').forEach(el=>el.value=el.defaultValue||'');
  document.querySelectorAll('select').forEach(el=>el.selectedIndex=0);
  portraitImg=null;portraitState={x:0,y:0,scale:1};
  document.getElementById('portraitCanvas').getContext('2d').clearRect(0,0,PORT_SIZE,PORT_SIZE);
  weapons=[];weaponCount=0;addWeapon();addWeapon();addWeapon();
  invItems=[];invCount=0;renderInv();
  graceValue=0;buildPips('gracePips',6,0,setGrace);
  finalBlowValue=0;buildPips('finalBlowPips',4,0,setFinalBlow);
  recalcAll();
  showFeedback('Cleared.');
}

/* === INIT === */
window.addEventListener('DOMContentLoaded',()=>{
  buildPips('gracePips',6,0,setGrace);
  buildPips('finalBlowPips',4,0,setFinalBlow);
  recalcAll();
  ['charLevel','armor_def','shield_def','cloak_def'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.addEventListener('input',updateDerivedVitals);
  });
  const raw=localStorage.getItem('ml_sheet');
  if(raw){
    applyData(JSON.parse(raw));
    const imgSrc=localStorage.getItem('ml_portrait_data'),stateRaw=localStorage.getItem('ml_portrait_state');
    if(imgSrc&&stateRaw)renderPortraitFromState(imgSrc,JSON.parse(stateRaw));
  }
  if(weapons.length===0){
    addWeapon();
    addWeapon();
    addWeapon();
  }
});
