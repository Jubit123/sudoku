<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Sudoku</title>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Sudoku">
<meta name="theme-color" content="#0d1b2a">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='5' y='5' width='90' height='90' rx='8' stroke='%234a7aaa' stroke-width='3' fill='%231a2d42'/%3E%3Cline x1='35' y1='5' x2='35' y2='95' stroke='%234a7aaa' stroke-width='2'/%3E%3Cline x1='65' y1='5' x2='65' y2='95' stroke='%234a7aaa' stroke-width='2'/%3E%3Cline x1='5' y1='35' x2='95' y2='35' stroke='%234a7aaa' stroke-width='2'/%3E%3Cline x1='5' y1='65' x2='95' y2='65' stroke='%234a7aaa' stroke-width='2'/%3E%3Ctext x='20' y='28' fill='%23c0392b' font-size='16' font-weight='bold'%3E5%3C/text%3E%3Ctext x='50' y='28' fill='%23f0f6ff' font-size='16' font-weight='bold'%3E3%3C/text%3E%3Ctext x='80' y='28' fill='%23f0f6ff' font-size='16' font-weight='bold'%3E.%3C/text%3E%3Ctext x='20' y='58' fill='%23f0f6ff' font-size='16' font-weight='bold'%3E.%3C/text%3E%3Ctext x='50' y='58' fill='%23c0392b' font-size='16' font-weight='bold'%3E8%3C/text%3E%3Ctext x='80' y='58' fill='%23f0f6ff' font-size='16' font-weight='bold'%3E1%3C/text%3E%3Ctext x='20' y='88' fill='%23f0f6ff' font-size='16' font-weight='bold'%3E9%3C/text%3E%3Ctext x='50' y='88' fill='%23f0f6ff' font-size='16' font-weight='bold'%3E.%3C/text%3E%3Ctext x='80' y='88' fill='%23c0392b' font-size='16' font-weight='bold'%3E4%3C/text%3E%3C/svg%3E">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='5' y='5' width='90' height='90' rx='8' stroke='%234a7aaa' stroke-width='3' fill='%231a2d42'/%3E%3Cline x1='35' y1='5' x2='35' y2='95' stroke='%234a7aaa' stroke-width='2'/%3E%3Cline x1='65' y1='5' x2='65' y2='95' stroke='%234a7aaa' stroke-width='2'/%3E%3Cline x1='5' y1='35' x2='95' y2='35' stroke='%234a7aaa' stroke-width='2'/%3E%3Cline x1='5' y1='65' x2='95' y2='65' stroke='%234a7aaa' stroke-width='2'/%3E%3Ctext x='20' y='28' fill='%23c0392b' font-size='16' font-weight='bold'%3E5%3C/text%3E%3Ctext x='50' y='28' fill='%23f0f6ff' font-size='16' font-weight='bold'%3E3%3C/text%3E%3Ctext x='80' y='28' fill='%23f0f6ff' font-size='16' font-weight='bold'%3E.%3C/text%3E%3Ctext x='20' y='58' fill='%23f0f6ff' font-size='16' font-weight='bold'%3E.%3C/text%3E%3Ctext x='50' y='58' fill='%23c0392b' font-size='16' font-weight='bold'%3E8%3C/text%3E%3Ctext x='80' y='58' fill='%23f0f6ff' font-size='16' font-weight='bold'%3E1%3C/text%3E%3Ctext x='20' y='88' fill='%23f0f6ff' font-size='16' font-weight='bold'%3E9%3C/text%3E%3Ctext x='50' y='88' fill='%23f0f6ff' font-size='16' font-weight='bold'%3E.%3C/text%3E%3Ctext x='80' y='88' fill='%23c0392b' font-size='16' font-weight='bold'%3E4%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="style.css">
</head>
<body>

<div id="splash" class="screen active">
  <div class="tile-bg" id="tile-bg"></div>
  <div class="splash-inner">
    <div class="logo">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="90" height="90" rx="8" stroke="#4a7aaa" stroke-width="3" fill="#1a2d42"/>
        <line x1="35" y1="5" x2="35" y2="95" stroke="#4a7aaa" stroke-width="2"/>
        <line x1="65" y1="5" x2="65" y2="95" stroke="#4a7aaa" stroke-width="2"/>
        <line x1="5" y1="35" x2="95" y2="35" stroke="#4a7aaa" stroke-width="2"/>
        <line x1="5" y1="65" x2="95" y2="65" stroke="#4a7aaa" stroke-width="2"/>
        <text x="20" y="28" fill="#c0392b" font-size="16" font-weight="bold">5</text>
        <text x="50" y="28" fill="#f0f6ff" font-size="16" font-weight="bold">3</text>
        <text x="80" y="28" fill="#f0f6ff" font-size="16" font-weight="bold">.</text>
        <text x="20" y="58" fill="#f0f6ff" font-size="16" font-weight="bold">.</text>
        <text x="50" y="58" fill="#c0392b" font-size="16" font-weight="bold">8</text>
        <text x="80" y="58" fill="#f0f6ff" font-size="16" font-weight="bold">1</text>
        <text x="20" y="88" fill="#f0f6ff" font-size="16" font-weight="bold">9</text>
        <text x="50" y="88" fill="#f0f6ff" font-size="16" font-weight="bold">.</text>
        <text x="80" y="88" fill="#c0392b" font-size="16" font-weight="bold">4</text>
      </svg>
      <div class="logo-text">Sudoku</div>
    </div>
    <div class="s-btns">
      <button class="s-btn" onclick="go('diff-scr')"><i class="ei">🎮</i>New game</button>
      <button class="s-btn" onclick="go('diff-scr')"><i class="ei">⚙️</i>Difficulty</button>
      <button class="s-btn ghost" onclick="dailyGame()"><i class="ei">📅</i>Daily challenge</button>
      <button class="s-btn ghost" onclick="showHS()"><i class="ei">🏆</i>Best Scores</button>
    </div>
    <div class="s-footer">Best puzzle game · Free forever</div>
  </div>
</div>

<div id="diff-scr" class="screen">
  <div style="flex:1;display:flex;align-items:center;justify-content:center;background:var(--bg)">
    <div class="diff-inner">
      <button class="back-btn" onclick="go('splash')"><i class="ei">⬅️</i> Back</button>
      <div class="scr-title">Choose difficulty</div>
      <div class="d-list">
        <div class="d-item" data-d="easy" onclick="pickD(this)">
          <div><div class="d-name">Easy</div><div class="d-desc">46 clues — great for beginners</div></div>
          <div class="pips"><span class="pip on"></span><span class="pip"></span><span class="pip"></span><span class="pip"></span></div>
        </div>
        <div class="d-item sel" data-d="medium" onclick="pickD(this)">
          <div><div class="d-name">Medium</div><div class="d-desc">36 clues — balanced challenge</div></div>
          <div class="pips"><span class="pip on"></span><span class="pip on"></span><span class="pip"></span><span class="pip"></span></div>
        </div>
        <div class="d-item" data-d="hard" onclick="pickD(this)">
          <div><div class="d-name">Hard</div><div class="d-desc">28 clues — needs strategy</div></div>
          <div class="pips"><span class="pip on"></span><span class="pip on"></span><span class="pip on"></span><span class="pip"></span></div>
        </div>
        <div class="d-item" data-d="expert" onclick="pickD(this)">
          <div><div class="d-name">Expert</div><div class="d-desc">22 clues — brutal logic</div></div>
          <div class="pips"><span class="pip on"></span><span class="pip on"></span><span class="pip on"></span><span class="pip on"></span></div>
        </div>
      </div>
      <button class="play-btn" onclick="startGame()"><i class="ei">▶️</i>Start game</button>
    </div>
  </div>
</div>

<div id="game-scr" class="screen">
  <div class="g-header">
    <div class="g-logo">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="90" height="90" rx="8" stroke="#4a7aaa" stroke-width="3" fill="#1a2d42"/>
        <line x1="35" y1="5" x2="35" y2="95" stroke="#4a7aaa" stroke-width="2"/>
        <line x1="65" y1="5" x2="65" y2="95" stroke="#4a7aaa" stroke-width="2"/>
        <line x1="5" y1="35" x2="95" y2="35" stroke="#4a7aaa" stroke-width="2"/>
        <line x1="5" y1="65" x2="95" y2="65" stroke="#4a7aaa" stroke-width="2"/>
        <text x="20" y="28" fill="#c0392b" font-size="16" font-weight="bold">5</text>
        <text x="50" y="28" fill="#f0f6ff" font-size="16" font-weight="bold">3</text>
        <text x="80" y="28" fill="#f0f6ff" font-size="16" font-weight="bold">.</text>
        <text x="20" y="58" fill="#f0f6ff" font-size="16" font-weight="bold">.</text>
        <text x="50" y="58" fill="#c0392b" font-size="16" font-weight="bold">8</text>
        <text x="80" y="58" fill="#f0f6ff" font-size="16" font-weight="bold">1</text>
        <text x="20" y="88" fill="#f0f6ff" font-size="16" font-weight="bold">9</text>
        <text x="50" y="88" fill="#f0f6ff" font-size="16" font-weight="bold">.</text>
        <text x="80" y="88" fill="#c0392b" font-size="16" font-weight="bold">4</text>
      </svg>
      Sudoku
    </div>
    <div class="h-icons">
      <button class="h-btn" onclick="togglePause()" id="pause-btn" title="Pause"><i class="ei" id="pause-icon">⏸️</i></button>
      <button class="h-btn" onclick="go('splash')" title="Menu"><i class="ei">🏠</i></button>
      <button class="h-btn" onclick="go('diff-scr')" title="New"><i class="ei">🔄</i></button>
    </div>
  </div>
  <div class="g-meta">
    <div class="m-diff"><i class="ei">🎯</i><span id="diff-lbl">Medium</span></div>
    <div class="m-timer"><i class="ei">⏱️</i><span id="timer">0:00</span></div>
    <div class="m-err" id="err-dots"></div>
  </div>
  <div class="g-body">
    <div class="g-body-inner">
      <div class="newbest-banner" id="newbest-banner">🏆 New Best Time!</div>
      <div class="grid-wrap">
        <div class="sudoku" id="grid"></div>
      </div>
      <div class="win-wrap" id="win-wrap">
        <div class="win-card">
          <div class="win-icon">🎉</div>
          <div class="win-title">Solved!</div>
          <div class="win-msg" id="win-msg">Excellent work</div>
          <div class="win-stats">
            <div class="ws">Time<span class="wv" id="wt">—</span></div>
            <div class="ws">Mistakes<span class="wv" id="wm">0</span></div>
            <div class="ws">Hints<span class="wv" id="wh">0</span></div>
          </div>
          <div class="win-btns">
            <button class="wb sec" onclick="go('splash')"><i class="ei">🏠</i>Menu</button>
            <button class="wb primary" onclick="startGame()"><i class="ei">▶️</i>Play again</button>
          </div>
        </div>
      </div>
      <div class="win-wrap" id="gameover-wrap">
        <div class="win-card go-card">
          <div class="win-icon">💔</div>
          <div class="win-title go-title">Game Over</div>
          <div class="win-msg">3 mistakes — better luck next time</div>
          <div class="win-stats">
            <div class="ws">Time<span class="wv" id="got">—</span></div>
            <div class="ws">Difficulty<span class="wv" id="god">—</span></div>
            <div class="ws">Hints<span class="wv" id="goh">0</span></div>
          </div>
          <div class="win-btns">
            <button class="wb sec" onclick="go('splash')"><i class="ei">🏠</i>Menu</button>
            <button class="wb primary go-btn" onclick="startGame()"><i class="ei">🔄</i>Try again</button>
          </div>
        </div>
      </div>
    </div>
    <div class="ctrl-row">
      <button class="c-btn" onclick="doUndo()"><i class="ei">↩️</i>Undo</button>
      <button class="c-btn" onclick="doErase()"><i class="ei">🧹</i>Erase</button>
      <button class="c-btn" onclick="doHint()"><i class="ei">💡</i>Hint <span id="hl">3</span></button>
      <div class="mode-wrap">
        <button class="m-btn on" onclick="setMode('normal')"><i class="ei">✏️</i>Normal</button>
        <button class="m-btn" onclick="setMode('notes')"><i class="ei">📝</i>Notes</button>
      </div>
    </div>
    <div class="keypad" id="keypad"></div>
    <div class="key-row2">
      <button class="key2" onclick="doUndo()"><i class="ei">↩️</i>Undo</button>
      <button class="key2" onclick="doErase()"><i class="ei">🧹</i>Erase</button>
      <button class="key2" onclick="doHint()"><i class="ei">💡</i>Hint</button>
      <button class="key2" onclick="go('diff-scr')"><i class="ei">🎚️</i>Level</button>
    </div>
  </div>
</div>

<!-- High Score Modal -->
<div class="hs-overlay" id="hs-overlay">
  <div class="hs-card">
    <div class="hs-title">🏆 Best Scores</div>
    <table class="hs-table" id="hs-table">
      <thead><tr><th>Difficulty</th><th>Best Time</th><th>Mistakes</th></tr></thead>
      <tbody id="hs-body"></tbody>
    </table>
    <button class="hs-close" onclick="hideHS()">Close</button>
  </div>
</div>

<script src="app.js"></script>
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    console.log('Service Worker registered', reg);
  }).catch((err) => {
    console.log('Service Worker registration failed', err);
  });
}
</script>
</body>
</html>
