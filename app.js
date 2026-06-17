const CLUES={easy:46,medium:36,hard:28,expert:22};
let board=[],sol=[],given=[],notes=[],sel=-1,mode='normal',mistakes=0,hLeft=3,hUsed=0,elapsed=0,tInt=null,hist=[],diff='medium',paused=false,over=false;

// ── Persistence ─────────────────────────────────────────────────────────────
const SAVE_KEY = 'sudoku-saved-game';

function saveGame() {
  if (over) { clearSave(); return; }
  const state = {
    board: board.slice(),
    sol: sol.slice(),
    given: given.slice(),
    notes: notes.map(s => [...s]),
    sel, mode, mistakes, hLeft, hUsed, elapsed,
    hist: hist.map(h => ({ i: h.i, v: h.v, nt: [...h.nt] })),
    diff
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e) {}
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch(e) {}
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s;
  } catch(e) { return null; }
}

function hasSavedGame() {
  return !!loadSave();
}

function resumeGame() {
  const s = loadSave();
  if (!s) return;
  board   = s.board;
  sol     = s.sol;
  given   = s.given;
  notes   = s.notes.map(arr => new Set(arr));
  sel     = s.sel ?? -1;
  mode    = s.mode ?? 'normal';
  mistakes= s.mistakes ?? 0;
  hLeft   = s.hLeft ?? 3;
  hUsed   = s.hUsed ?? 0;
  elapsed = s.elapsed ?? 0;
  hist    = (s.hist ?? []).map(h => ({ i: h.i, v: h.v, nt: new Set(h.nt) }));
  diff    = s.diff ?? 'medium';
  paused  = false;
  over    = false;

  go('game-scr');
  clearInterval(tInt);
  const existOv = document.getElementById('pause-overlay');
  if (existOv) existOv.remove();
  document.getElementById('pause-icon').textContent = '⏸️';
  document.getElementById('diff-lbl').textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
  document.getElementById('hl').textContent = hLeft;
  document.getElementById('win-wrap').classList.remove('show');
  document.getElementById('gameover-wrap').classList.remove('show');
  updErrDots(); renderGrid(); buildKp(); setModeUI(mode); buildLights();
  tInt = setInterval(() => { if (!paused) { elapsed++; updTimer(); autoSaveThrottle(); } }, 1000);
  updTimer();
}

// Auto-save at most once every 5 seconds to avoid excessive writes
let _saveTimer = null;
function autoSaveThrottle() {
  if (_saveTimer) return;
  _saveTimer = setTimeout(() => { saveGame(); _saveTimer = null; }, 5000);
}

// ── Splash: show/hide Continue button ───────────────────────────────────────
function updateSplashContinue() {
  let btn = document.getElementById('continue-btn');
  if (hasSavedGame()) {
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'continue-btn';
      btn.className = 's-btn';
      btn.innerHTML = '<i class="ei">▶️</i>Continue game';
      btn.onclick = resumeGame;
      // Insert as first button
      const sbtns = document.querySelector('.s-btns');
      sbtns.insertBefore(btn, sbtns.firstChild);
    }
    btn.style.display = '';
  } else {
    if (btn) btn.style.display = 'none';
  }
}

// ── Navigation ───────────────────────────────────────────────────────────────
function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'splash') updateSplashContinue();
}

function pickD(el) {
  document.querySelectorAll('.d-item').forEach(d => d.classList.remove('sel'));
  el.classList.add('sel');
  diff = el.dataset.d;
}
function dailyGame() { diff = 'medium'; startGame(); }

// ── Puzzle generation ────────────────────────────────────────────────────────
function shuf(a) { for (let i=a.length-1;i>0;i--) { const j=0|Math.random()*(i+1);[a[i],a[j]]=[a[j],a[i]]; } return a; }
function makeFull() { const b=Array(81).fill(0); fill(b); return b; }
function fill(b) { const e=b.indexOf(0); if(e<0) return true; for (const n of shuf([1,2,3,4,5,6,7,8,9])) { if(ok(b,e,n)) { b[e]=n; if(fill(b)) return true; b[e]=0; } } return false; }
function ok(b,i,n) { const r=0|i/9,c=i%9; for(let j=0;j<9;j++) { if(b[r*9+j]===n&&j!==c) return false; if(b[j*9+c]===n&&j!==r) return false; } const br=(0|r/3)*3,bc=(0|c/3)*3; for(let dr=0;dr<3;dr++) for(let dc=0;dc<3;dc++) { const x=(br+dr)*9+(bc+dc); if(x!==i&&b[x]===n) return false; } return true; }

// ── Start game ───────────────────────────────────────────────────────────────
function startGame() {
  go('game-scr');
  clearInterval(tInt); elapsed=0; mistakes=0; hLeft=3; hUsed=0; hist=[]; sel=-1; mode='normal'; paused=false; over=false;
  const existOv = document.getElementById('pause-overlay'); if(existOv) existOv.remove();
  document.getElementById('pause-icon').textContent = '⏸️';
  sol = makeFull(); board = sol.slice();
  given = Array(81).fill(false);
  notes = Array(81).fill(null).map(() => new Set());
  const rm = shuf([...Array(81).keys()]).slice(0, 81-CLUES[diff]);
  rm.forEach(i => board[i]=0);
  for (let i=0;i<81;i++) if(board[i]) given[i]=true;
  document.getElementById('diff-lbl').textContent = diff.charAt(0).toUpperCase()+diff.slice(1);
  document.getElementById('hl').textContent = hLeft;
  document.getElementById('win-wrap').classList.remove('show');
  document.getElementById('gameover-wrap').classList.remove('show');
  updErrDots(); renderGrid(); buildKp(); setModeUI('normal'); buildLights();
  saveGame(); // save initial state immediately
  tInt = setInterval(() => { if(!paused) { elapsed++; updTimer(); autoSaveThrottle(); } }, 1000);
  updTimer();
}

// ── Grid rendering ───────────────────────────────────────────────────────────
function renderGrid() {
  const g=document.getElementById('grid'); g.innerHTML='';
  for (let i=0;i<81;i++) {
    const r=0|i/9, c=i%9;
    const boxR=0|r/3, boxC=0|c/3;
    const cell=document.createElement('div');
    cell.className='cell'+((boxR+boxC)%2===0?' alt':'')+(given[i]?' given':'');
    if((r+1)%3===0&&r<8) cell.classList.add('row-end');
    cell.dataset.i=i;
    cell.addEventListener('click',()=>selCell(i));
    if(board[i]) {
      cell.textContent=board[i];
      if(!given[i]&&board[i]!==sol[i]) cell.classList.add('wrong');
    } else if(notes[i].size) {
      const ng=document.createElement('div'); ng.className='notes-g';
      for(let n=1;n<=9;n++) { const nd=document.createElement('div'); nd.className='nn'; nd.textContent=notes[i].has(n)?n:''; ng.appendChild(nd); }
      cell.appendChild(ng);
    }
    g.appendChild(cell);
  }
  if(sel>=0) applyHi(sel);
}

function selCell(i) { if(over) return; sel=i; applyHi(i); }
function applyHi(i) {
  const cells=document.querySelectorAll('.cell');
  const r=0|i/9, c=i%9, br=0|r/3, bc=0|c/3, val=board[i];
  cells.forEach((cell,idx) => {
    cell.classList.remove('selected','hi','same');
    const cr=0|idx/9, cc=idx%9;
    const rel=cr===r||cc===c||(0|cr/3)===br&&(0|cc/3)===bc;
    if(idx===i) cell.classList.add('selected');
    else if(rel) cell.classList.add('hi');
    if(val>0&&board[idx]===val&&idx!==i) cell.classList.add('same');
  });
}

// ── Input ────────────────────────────────────────────────────────────────────
function input(n) {
  if(over||sel<0||given[sel]) return;
  hist.push({i:sel, v:board[sel], nt:new Set(notes[sel])});
  if(mode==='notes') {
    n===0 ? notes[sel].clear() : (notes[sel].has(n)?notes[sel].delete(n):notes[sel].add(n));
    renderGrid(); saveGame(); return;
  }
  const idx=sel;
  if(n===0) { board[idx]=0; notes[idx].clear(); renderGrid(); buildKp(); saveGame(); return; }
  board[idx]=n; notes[idx].clear();
  const correct=n===sol[idx];
  if(!correct) { mistakes++; updErrDots(); }
  renderGrid(); buildKp(); saveGame();
  const cellEl=document.querySelectorAll('.cell')[idx];
  if(correct) {
    celebrateCorrect(cellEl);
    const {anyLine,boxDone}=checkCompletions(idx);
    const wonNow=checkWin();
    if(wonNow) { showToast(pick(PRAISE_WIN),true); runLights(2800); }
    else if(boxDone) { showToast(pick(PRAISE_LINE),true); runBoxLights(boxDone); }
    else if(anyLine) { showToast(pick(PRAISE_LINE),true); }
    else { showToast(pick(PRAISE_SMALL),false); }
  } else {
    celebrateWrong(cellEl);
    if(mistakes>=3) gameOver();
  }
}

function gameOver() {
  over=true;
  clearInterval(tInt);
  clearSave(); // no point saving a lost game
  const m=0|elapsed/60, s=elapsed%60;
  document.getElementById('got').textContent=m+':'+(s<10?'0':'')+s;
  document.getElementById('god').textContent=diff.charAt(0).toUpperCase()+diff.slice(1);
  document.getElementById('goh').textContent=hUsed;
  setTimeout(()=>document.getElementById('gameover-wrap').classList.add('show'),650);
}

// ── Celebration helpers ───────────────────────────────────────────────────────
function celebrateCorrect(cellEl) {
  if(!cellEl) return;
  cellEl.classList.add('correct-burst');
  spawnRipple(cellEl,'rgba(110,231,183,.55)');
  spawnParticles(cellEl,['#6ee7b7','#a7f3d0','#fde68a'],9,false);
  setTimeout(()=>cellEl.classList.remove('correct-burst'),600);
}
function celebrateWrong(cellEl) {
  if(!cellEl) return;
  cellEl.classList.add('wrong-burst');
  spawnRipple(cellEl,'rgba(231,76,60,.5)');
  spawnParticles(cellEl,['#ff6b6b','#ff9b9b'],6,true);
  setTimeout(()=>cellEl.classList.remove('wrong-burst'),580);
}
function spawnRipple(cellEl,color) {
  const wrap=document.querySelector('.grid-wrap'); if(!wrap) return;
  const wr=wrap.getBoundingClientRect(), cr=cellEl.getBoundingClientRect();
  const r=document.createElement('div'); r.className='ripple';
  r.style.cssText=`left:${cr.left-wr.left+cr.width/2}px;top:${cr.top-wr.top+cr.height/2}px;width:${cr.width}px;height:${cr.height}px;--rc:${color}`;
  wrap.appendChild(r); r.addEventListener('animationend',()=>r.remove());
}
function spawnParticles(cellEl,colors,count,fall) {
  const wrap=document.querySelector('.grid-wrap'); if(!wrap) return;
  const wr=wrap.getBoundingClientRect(), cr=cellEl.getBoundingClientRect();
  const cx=cr.left-wr.left+cr.width/2, cy=cr.top-wr.top+cr.height/2;
  for(let i=0;i<count;i++) {
    const p=document.createElement('div'); p.className='particle';
    const angle=fall?(Math.PI/2+(Math.random()*.9-.45)):Math.random()*Math.PI*2;
    const dist=fall?14+Math.random()*16:22+Math.random()*32;
    const dx=Math.cos(angle)*dist*(fall?.5:1);
    const dy=fall?Math.sin(angle)*dist:Math.sin(angle)*dist-8;
    const sz=fall?3+Math.random()*2:4+Math.random()*3;
    const dur=(fall?.5:.62)+Math.random()*.18;
    p.style.cssText=`left:${cx}px;top:${cy}px;width:${sz}px;height:${sz}px;background:${colors[0|Math.random()*colors.length]};--dx:${dx.toFixed(1)}px;--dy:${dy.toFixed(1)}px;animation-duration:${dur.toFixed(2)}s`;
    wrap.appendChild(p); p.addEventListener('animationend',()=>p.remove());
  }
}
function checkCompletions(idx) {
  const r=0|idx/9, c=idx%9, br=(0|r/3)*3, bc=(0|c/3)*3;
  const rowI=[...Array(9)].map((_,j)=>r*9+j);
  const colI=[...Array(9)].map((_,j)=>j*9+c);
  const boxI=[]; for(let dr=0;dr<3;dr++) for(let dc=0;dc<3;dc++) boxI.push((br+dr)*9+(bc+dc));
  let anyLine=false, boxDone=null;
  if(rowI.every(x=>board[x]&&board[x]===sol[x])) { sweepLine(rowI); anyLine=true; }
  if(colI.every(x=>board[x]&&board[x]===sol[x])) { sweepLine(colI); anyLine=true; }
  if(boxI.every(x=>board[x]&&board[x]===sol[x])) { sweepLine(boxI); anyLine=true; boxDone=boxI; }
  return {anyLine,boxDone};
}
function sweepLine(group) {
  const cells=document.querySelectorAll('.cell');
  group.forEach((idx,k) => {
    setTimeout(()=>{
      const c=cells[idx]; if(!c) return;
      c.classList.add('line-sweep');
      setTimeout(()=>c.classList.remove('line-sweep'),520);
    },k*35);
  });
}
function confettiBurst() {
  const wrap=document.querySelector('.grid-wrap'); if(!wrap) return;
  const rect=wrap.getBoundingClientRect();
  const colors=['#6ee7b7','#a7f3d0','#fde68a','#fca5a5','#93c5fd','#f0abfc'];
  for(let i=0;i<46;i++) {
    const p=document.createElement('div'); p.className='confetti';
    const x=Math.random()*rect.width, drift=Math.random()*60-30, rot=Math.random()*360, dur=1.1+Math.random()*.9, delay=Math.random()*.4;
    p.style.cssText=`left:${x}px;top:-10px;background:${colors[0|Math.random()*colors.length]};--drift:${drift.toFixed(1)}px;--rot:${rot.toFixed(0)}deg;animation-duration:${dur.toFixed(2)}s;animation-delay:${delay.toFixed(2)}s`;
    wrap.appendChild(p); p.addEventListener('animationend',()=>p.remove());
  }
}

// ── Praise / lights ───────────────────────────────────────────────────────────
const PRAISE_SMALL=['Nice! 👍','Great! ✨','Awesome! 🔥','Yes! 🙌','Smooth! 😎','Sharp! 🎯','Sweet! 🍬','Boom! 💥','On fire! 🔥','Crushing it! 💪','Sweet spot! 🎯','Solid! 💯'];
const PRAISE_LINE=['AMAZING! 🤩','FANTASTIC! 🎉','INCREDIBLE! 🚀','PERFECT! 🌟','BOOM! 💥','OUTSTANDING! 🏆','LEGENDARY! 👑','UNSTOPPABLE! ⚡'];
const PRAISE_WIN=['AMAZING! YOU DID IT! 🎉🥳','PUZZLE MASTER! 👑✨','INCREDIBLE WORK! 🚀🌟','FLAWLESS VICTORY! 🏆🎊','ON FIRE TODAY! 🔥🎉','GENIUS MOVE! 🧠✨'];
function pick(arr) { return arr[0|Math.random()*arr.length]; }
function showToast(text,big) {
  const host=document.querySelector('.g-body-inner'); if(!host) return;
  let t=document.getElementById('praise-toast');
  if(!t) { t=document.createElement('div'); t.id='praise-toast'; t.className='praise-toast'; host.appendChild(t); }
  t.classList.remove('show','big');
  t.textContent=text;
  void t.offsetWidth;
  if(big) t.classList.add('big');
  t.classList.add('show');
  clearTimeout(t._h);
  t._h=setTimeout(()=>t.classList.remove('show'),big?1900:1150);
}
function perimeterPoint(t) {
  const p=t*4;
  if(p<1) return{x:p*100,y:0};
  if(p<2) return{x:100,y:(p-1)*100};
  if(p<3) return{x:100-(p-2)*100,y:100};
  return{x:0,y:100-(p-3)*100};
}
function buildLights() {
  const wrap=document.querySelector('.grid-wrap'); if(!wrap) return;
  let lc=document.getElementById('light-chase');
  if(!lc) { lc=document.createElement('div'); lc.id='light-chase'; lc.className='light-chase'; wrap.appendChild(lc); }
  lc.innerHTML='';
  const N=28, dur=1.1;
  for(let i=0;i<N;i++) {
    const b=document.createElement('span'); b.className='lbulb';
    const t=i/N, pt=perimeterPoint(t);
    b.style.left=pt.x+'%'; b.style.top=pt.y+'%';
    b.style.animationDelay=(t*dur).toFixed(2)+'s';
    lc.appendChild(b);
  }
}
function runLights(duration) {
  const lc=document.getElementById('light-chase'); if(!lc) return;
  lc.classList.add('on');
  clearTimeout(lc._t);
  lc._t=setTimeout(()=>lc.classList.remove('on'),duration);
}
function runBoxLights(boxGroup) {
  const wrap=document.querySelector('.grid-wrap'); if(!wrap) return;
  const top=boxGroup[0], r=0|top/9, c=top%9;
  const ring=document.createElement('div'); ring.className='box-chase';
  ring.style.left=(c/9*100)+'%'; ring.style.top=(r/9*100)+'%';
  ring.style.width=(3/9*100)+'%'; ring.style.height=(3/9*100)+'%';
  wrap.appendChild(ring);
  const N=16, dur=.85;
  for(let i=0;i<N;i++) {
    const b=document.createElement('span'); b.className='lbulb';
    const t=i/N, pt=perimeterPoint(t);
    b.style.left=pt.x+'%'; b.style.top=pt.y+'%';
    b.style.animationDuration=dur+'s';
    b.style.animationDelay=(t*dur).toFixed(2)+'s';
    b.style.animationPlayState='running';
    ring.appendChild(b);
  }
  setTimeout(()=>ring.remove(),1500);
}

// ── Controls ──────────────────────────────────────────────────────────────────
function doErase() {
  if(over||sel<0||given[sel]) return;
  hist.push({i:sel,v:board[sel],nt:new Set(notes[sel])});
  board[sel]=0; notes[sel].clear();
  renderGrid(); buildKp(); saveGame();
}
function doUndo() {
  if(over||!hist.length) return;
  const h=hist.pop();
  board[h.i]=h.v; notes[h.i]=h.nt;
  renderGrid(); buildKp(); saveGame();
}
function doHint() {
  if(over||!hLeft) return;
  const empty=[];
  for(let i=0;i<81;i++) if(!given[i]&&(board[i]===0||board[i]!==sol[i])) empty.push(i);
  if(!empty.length) return;
  const i=empty[0|Math.random()*empty.length];
  hist.push({i,v:board[i],nt:new Set(notes[i])});
  board[i]=sol[i]; notes[i].clear(); given[i]=true; hLeft--; hUsed++;
  document.getElementById('hl').textContent=hLeft;
  sel=i; renderGrid(); buildKp(); saveGame();
  const {anyLine,boxDone}=checkCompletions(i);
  const wonNow=checkWin();
  if(wonNow) { showToast(pick(PRAISE_WIN),true); runLights(2800); }
  else if(boxDone) { showToast(pick(PRAISE_LINE),true); runBoxLights(boxDone); }
  else if(anyLine) { showToast(pick(PRAISE_LINE),true); }
  const c=document.querySelectorAll('.cell')[i];
  c.classList.add('hint-flash'); celebrateCorrect(c);
  setTimeout(()=>c.classList.remove('hint-flash'),600);
}

function updErrDots() {
  const d=document.getElementById('err-dots'); d.innerHTML='';
  for(let m=1;m<=3;m++) { const s=document.createElement('span'); s.className='e-dot'+(mistakes>=m?' on':''); d.appendChild(s); }
}
function updTimer() { const m=0|elapsed/60,s=elapsed%60; document.getElementById('timer').textContent=m+':'+(s<10?'0':'')+s; }

function togglePause() {
  paused=!paused;
  document.getElementById('pause-icon').textContent=paused?'▶️':'⏸️';
  let ov=document.getElementById('pause-overlay');
  if(paused) {
    if(!ov) {
      ov=document.createElement('div');
      ov.id='pause-overlay';
      ov.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(8,14,22,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;cursor:pointer';
      ov.onclick=togglePause;
      ov.innerHTML=`
<svg width="140" height="200" viewBox="0 0 140 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .sw{animation:floatS 3s ease-in-out infinite}
      .sh{animation:headB 3s ease-in-out infinite}
      .sb{animation:bodyB 3s ease-in-out infinite;transform-origin:70px 68px}
      .sal{animation:armL 3s ease-in-out infinite;transform-origin:70px 80px}
      .sar{animation:armR 3s ease-in-out infinite;transform-origin:70px 80px}
      .sll{animation:legL 3s ease-in-out infinite;transform-origin:70px 118px}
      .slr{animation:legR 3s ease-in-out infinite;transform-origin:70px 118px}
      .sey{animation:blink 4s ease-in-out infinite;transform-origin:70px 44px}
      .bbl{animation:bubbleAnim 3s ease-in-out infinite}
      @keyframes floatS{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      @keyframes headB{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      @keyframes bodyB{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.06)}}
      @keyframes armL{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-10deg)}}
      @keyframes armR{0%,100%{transform:rotate(0deg)}50%{transform:rotate(10deg)}}
      @keyframes legL{0%,100%{transform:rotate(0deg)}50%{transform:rotate(4deg)}}
      @keyframes legR{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-4deg)}}
      @keyframes blink{0%,88%,100%{transform:scaleY(1)}92%,96%{transform:scaleY(0.1)}}
      @keyframes bubbleAnim{0%,100%{opacity:0;transform:scale(0.6) translate(0,6px)}25%,75%{opacity:1;transform:scale(1) translate(0,0)}90%{opacity:0;transform:scale(0.8) translate(0,-6px)}}
    </style>
  </defs>
  <g class="sw">
    <g class="bbl" style="transform-origin:105px 25px">
      <rect x="82" y="10" width="46" height="26" rx="10" fill="#1c3d62" stroke="#4a7aaa" stroke-width="1.5"/>
      <text x="105" y="27" text-anchor="middle" font-size="12" fill="#93c5fd" font-family="system-ui">haa~</text>
      <polygon points="90,34 82,44 96,35" fill="#1c3d62" stroke="#4a7aaa" stroke-width="1" stroke-linejoin="round"/>
    </g>
    <g class="sh">
      <circle cx="70" cy="46" r="20" fill="#1c3d62" stroke="#4a7aaa" stroke-width="2.5"/>
      <ellipse cx="55" cy="52" rx="5" ry="3" fill="#ff8fa3" opacity=".5"/>
      <ellipse cx="85" cy="52" rx="5" ry="3" fill="#ff8fa3" opacity=".5"/>
      <g class="sey">
        <ellipse cx="62" cy="44" rx="4" ry="4.5" fill="#93c5fd"/>
        <ellipse cx="78" cy="44" rx="4" ry="4.5" fill="#93c5fd"/>
        <circle cx="63" cy="44" r="2.2" fill="#0d1b2a"/>
        <circle cx="79" cy="44" r="2.2" fill="#0d1b2a"/>
        <circle cx="64" cy="43" r="1" fill="white"/>
        <circle cx="80" cy="43" r="1" fill="white"/>
      </g>
      <path d="M61 55 Q70 64 79 55" stroke="#93c5fd" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    </g>
    <g class="sb">
      <line x1="70" y1="66" x2="70" y2="118" stroke="#4a7aaa" stroke-width="3.5" stroke-linecap="round"/>
      <g class="sal">
        <line x1="70" y1="80" x2="38" y2="105" stroke="#4a7aaa" stroke-width="3" stroke-linecap="round"/>
        <circle cx="36" cy="107" r="5" fill="#1c3d62" stroke="#4a7aaa" stroke-width="1.8"/>
        <text x="36" y="111" text-anchor="middle" font-size="8">✋</text>
      </g>
      <g class="sar">
        <line x1="70" y1="80" x2="102" y2="105" stroke="#4a7aaa" stroke-width="3" stroke-linecap="round"/>
        <circle cx="104" cy="107" r="5" fill="#1c3d62" stroke="#4a7aaa" stroke-width="1.8"/>
      </g>
      <g class="sll">
        <line x1="70" y1="118" x2="50" y2="162" stroke="#4a7aaa" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="46" cy="166" rx="9" ry="5" fill="#c0392b" opacity=".9"/>
      </g>
      <g class="slr">
        <line x1="70" y1="118" x2="90" y2="162" stroke="#4a7aaa" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="94" cy="166" rx="9" ry="5" fill="#c0392b" opacity=".9"/>
      </g>
    </g>
  </g>
</svg>
<div style="font-size:20px;font-weight:300;letter-spacing:5px;color:#f0f6ff;text-shadow:0 0 16px rgba(147,197,253,.5)">⏸️ PAUSED</div>
<div style="font-size:12px;color:#6a8faf;letter-spacing:.5px;margin-top:-4px">tap anywhere to resume ▶️</div>`;
      document.getElementById('game-scr').appendChild(ov);
    }
    ov.style.display='flex';
  } else {
    if(ov) ov.style.display='none';
  }
}

function setMode(m) { mode=m; setModeUI(m); }
function setModeUI(m) {
  mode=m;
  document.querySelectorAll('.m-btn').forEach((b,i)=>b.classList.toggle('on',(m==='normal'&&i===0)||(m==='notes'&&i===1)));
}
function buildKp() {
  const kp=document.getElementById('keypad'); kp.innerHTML='';
  for(let n=1;n<=9;n++) {
    const cnt=board.filter(v=>v===n).length;
    const btn=document.createElement('button');
    btn.className='key'+(cnt>=9?' used':'');
    btn.innerHTML=n+(cnt<9?`<span class="rem">${9-cnt}</span>`:'');
    btn.onclick=()=>input(n); kp.appendChild(btn);
  }
  const er=document.createElement('button');
  er.className='key'; er.innerHTML='🧹';
  er.onclick=()=>input(0); kp.appendChild(er);
}

function checkWin() {
  if(!board.every((v,i)=>v===sol[i])) return false;
  clearInterval(tInt);
  clearSave(); // game is done, remove save
  confettiBurst();
  const m=0|elapsed/60, s=elapsed%60;
  document.getElementById('wt').textContent=m+':'+(s<10?'0':'')+s;
  document.getElementById('wm').textContent=mistakes;
  document.getElementById('wh').textContent=hUsed;
  document.getElementById('win-msg').textContent=mistakes===0?'Perfect — no mistakes!':mistakes<=2?'Well played!':'Solved it!';
  // Save score and show new best banner if applicable
  const isNew = checkAndSaveScore(diff, elapsed, mistakes);
  if (isNew) {
    const b = document.getElementById('newbest-banner');
    b.classList.add('show');
    setTimeout(() => b.classList.remove('show'), 3000);
  }
  setTimeout(()=>document.getElementById('win-wrap').classList.add('show'),1100);
  return true;
}

// ── Keyboard ─────────────────────────────────────────────────────────────────
document.addEventListener('keydown',e=>{
  if(!document.getElementById('game-scr').classList.contains('active')||over) return;
  if(e.key>='1'&&e.key<='9') { input(+e.key); return; }
  if(e.key==='Backspace'||e.key==='Delete'||e.key==='0') { input(0); return; }
  if(e.key==='n'||e.key==='N') { setMode(mode==='normal'?'notes':'normal'); return; }
  if((e.ctrlKey||e.metaKey)&&e.key==='z') { doUndo(); return; }
  if(sel<0) return;
  const r=0|sel/9, c=sel%9;
  if(e.key==='ArrowUp'&&r>0) { selCell(sel-9); e.preventDefault(); }
  if(e.key==='ArrowDown'&&r<8) { selCell(sel+9); e.preventDefault(); }
  if(e.key==='ArrowLeft'&&c>0) { selCell(sel-1); e.preventDefault(); }
  if(e.key==='ArrowRight'&&c<8) { selCell(sel+1); e.preventDefault(); }
});

// Save on page hide (tab switch, app close, etc.)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && !over) saveGame();
});
window.addEventListener('pagehide', () => { if (!over) saveGame(); });

// ── High Score System (localStorage — works fully offline) ────────────────────
const HS_KEY = 'sudoku-hs';

function loadHS() {
  try {
    const raw = localStorage.getItem(HS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e) { return {}; }
}

function saveHS(scores) {
  try {
    localStorage.setItem(HS_KEY, JSON.stringify(scores));
  } catch(e) {}
}

// Returns true if this is a new personal best
function checkAndSaveScore(d, time, mist) {
  const scores = loadHS();
  const prev = scores[d];
  let isNew = false;
  if (!prev || time < prev.time || (time === prev.time && mist < prev.mistakes)) {
    scores[d] = { time, mistakes: mist };
    saveHS(scores);
    isNew = true;
  }
  return isNew;
}

function fmtTime(s) { const m=0|s/60,r=s%60; return m+':'+(r<10?'0':'')+r; }

function showHS() {
  const scores = loadHS();
  const diffs = ['easy','medium','hard','expert'];
  const tb = document.getElementById('hs-body');
  tb.innerHTML = '';
  diffs.forEach(d => {
    const tr = document.createElement('tr');
    const s = scores[d];
    if (s) {
      tr.innerHTML = `<td>${d.charAt(0).toUpperCase()+d.slice(1)}</td><td class="val">${fmtTime(s.time)}</td><td class="val">${s.mistakes}</td>`;
    } else {
      tr.className = 'no-score';
      tr.innerHTML = `<td>${d.charAt(0).toUpperCase()+d.slice(1)}</td><td colspan="2">— no record yet</td>`;
    }
    tb.appendChild(tr);
  });
  document.getElementById('hs-overlay').classList.add('show');
}

function hideHS() { document.getElementById('hs-overlay').classList.remove('show'); }
document.getElementById('hs-overlay').addEventListener('click', function(e) { if(e.target===this) hideHS(); });

// ── Splash tiles ──────────────────────────────────────────────────────────────
(function makeTiles(){
  const bg=document.getElementById('tile-bg'); if(!bg) return;
  [[8,12,44],[72,6,32],[18,78,50],[78,72,38],[4,42,28],[88,40,34],[42,4,36],[40,88,42],[22,28,52],[68,32,28],[28,62,44],[65,65,32],[55,18,38],[20,52,30],[82,18,46],[10,88,36]].forEach(([lp,tp,sz])=>{
    const d=document.createElement('div'); d.className='sq';
    d.style.cssText=`width:${sz}px;height:${sz}px;left:${lp}%;top:${tp}%;transform:rotate(${(Math.random()*40-20).toFixed(1)}deg);opacity:${(.15+Math.random()*.22).toFixed(2)}`;
    bg.appendChild(d);
  });
})();

// ── Init: check for saved game on load ───────────────────────────────────────
updateSplashContinue();
