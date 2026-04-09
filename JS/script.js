// =============================================================================
// MEOW TOWER — script.js
// =============================================================================

// -----------------------------------------------------------------------------
// CONSTANTES E CONFIGURAÇÕES
// -----------------------------------------------------------------------------

const CHARS_RAW = {
  mulher: 'IMG/mulher.png',
  homem:  'IMG/Homem.png',
  gato:   'IMG/gato.png',
};
const CHARS = {};

const FLOORS      = ['Térreo', 'Restaurante 🍽️', 'Academia 💪', 'Apartamento 🛋️'];
const FLOOR_ICONS = ['🏢', '🍽️', '💪', '🛋️'];
const FNUMS       = ['T', '1', '2', '3'];

const FLOOR_CFG = {
  1: { name: '1º ANDAR – Restaurante 🍽️', wallColor: '#6a3a8a', floorColor: '#7a4a9a' },
  2: { name: '2º ANDAR – Academia 💪',     wallColor: '#1a1a2e', floorColor: '#16213e' },
  3: { name: '3º ANDAR – Apartamento 🛋️', wallColor: '#1a0e2e', floorColor: '#120a20' },
};

// AFD do jogador
const AFD_ALL = [
  'LOBBY_IDLE', 'LOBBY_WALK', 'AT_CANDY', 'AT_ELEVATOR',
  'ELEV_CLOSING', 'ELEV_MOVING', 'ELEV_OPEN',
  'FLOOR_T', 'FLOOR_1', 'FLOOR_2', 'FLOOR_3',
  'AT_RECEPTION', 'FINALIZE',
];

// AFD do elevador
const ELEV_STATES = [
  'T_ABERTO', 'T_FECHADO',
  'A1_ABERTO', 'A1_FECHADO',
  'A2_ABERTO', 'A2_FECHADO',
  'A3_ABERTO', 'A3_FECHADO',
  'SUBINDO_T_1',
  'SUBINDO_1_2',
  'SUBINDO_2_3',
  'DESCENDO_3_2',
  'DESCENDO_2_1',
  'DESCENDO_1_T'
];

const ELEV_STATES_LABELS = {
  T_ABERTO:      '🚪 Térreo aberto',
  T_FECHADO:     '🔒 Térreo fechado',
  A1_ABERTO:     '🚪 1º andar aberto',
  A1_FECHADO:    '🔒 1º andar fechado',
  A2_ABERTO:     '🚪 2º andar aberto',
  A2_FECHADO:    '🔒 2º andar fechado',
  A3_ABERTO:     '🚪 3º andar aberto',
  A3_FECHADO:    '🔒 3º andar fechado',
  SUBINDO_T_1:   '⬆️ Subindo T→1',
  SUBINDO_1_2:   '⬆️ Subindo 1→2',
  SUBINDO_2_3:   '⬆️ Subindo 2→3',
  DESCENDO_3_2:  '⬇️ Descendo 3→2',
  DESCENDO_2_1:  '⬇️ Descendo 2→1',
  DESCENDO_1_T:  '⬇️ Descendo 1→T'
};

const GYM_EQUIP = [
  { id: 'esteteira',   src: 'IMG/esteteira-adcm.png',    x: 0.04, w: 0.14, label: 'Esteteira',    anim: '🏃 Correndo na esteira...'        },
  { id: 'bicicleta',   src: 'IMG/bicicleta-acdm.png',    x: 0.22, w: 0.12, label: 'Bicicleta',    anim: '🚴 Pedalando...'                  },
  { id: 'crossover',   src: 'IMG/crossover-acdm.png',    x: 0.38, w: 0.18, label: 'Crossover',    anim: '💪 Fazendo crossover...'          },
  { id: 'puxada',      src: 'IMG/puxada-alta-acdm.png',  x: 0.60, w: 0.14, label: 'Puxada Alta',  anim: '💪 Fazendo puxada...'             },
  { id: 'legcurl',     src: 'IMG/Leg-Curl-acdm.png',     x: 0.78, w: 0.14, label: 'Leg Curl',     anim: '🦵 Fazendo leg curl...'           },
  { id: 'peso',        src: 'IMG/peso-acdm.png',         x: 0.98, w: 0.13, label: 'Pesos',        anim: '🏋️ Levantando peso...'           },
  { id: 'pesinhos',    src: 'IMG/pesinhos-acdm.png',     x: 1.14, w: 0.12, label: 'Halteres',     anim: '💪 Treinando com halteres...'     },
  { id: 'crosstrainer',src: 'IMG/cross-trainer-acdm.png',x: 1.30, w: 0.14, label: 'Cross-trainer',anim: 'Treinando no cross-trainer...'    },
  { id: 'escada',      src: 'IMG/escada-acdm.png',       x: 1.48, w: 0.13, label: 'Escada',       anim: 'Subindo escada...'                },
];

// -----------------------------------------------------------------------------
// ESTADO GLOBAL
// -----------------------------------------------------------------------------

// Jogador / AFD do jogador
let personagemEscolhido = 'mulher';
let estadoAtual         = 'LOBBY_IDLE';
let logAfd              = [];
let caminhoAfd          = ['LOBBY_IDLE'];
let visitados           = new Set(['LOBBY_IDLE']);
let t0                  = new Date();

// Elevador / AFD do elevador
let estadoAtualElev  = 'T_ABERTO';
let logAfdElev       = [];
let caminhoAfdElev   = ['T_ABERTO'];
let visitadosElev    = new Set(['T_ABERTO']);
let andarAtualElev   = 0;
let andarSelecionadoElev = -1;
let elevadorEmMovimento  = false;
let portasAbertas        = true;
let animViagem           = null;
let _timerPorta          = null;

// Movimento
let jogadorX      = 0;
let jogadorXAndar = 0;
let teclas        = {};
let olhandoDireita = true;
let jogadorJaAndou = false;
let recemChegouLobby = false;

// Estado das telas
let modalAberto  = false;
let andarAberto  = false;
let andarAtual   = 0;

// Itens
let itemNaMao    = null;
let itensStand   = {};
let contadorDoces = 0;
let _itemGarcom  = null;

// Academia
let GYM_BEB_X  = 0, GYM_BEB_W  = 0;
let GYM_VEST_X = 0, GYM_VEST_W = 0;
let menuVestiarioAberto = false;
let resMusic = null;
let menuResAberto = false;
let menuBarAberto = false;
let usandoBanheiro = false;
let _timerBanheiro = null;

// Apartamento 302
let _dentroApt302 = false;
let APT_DOOR_X    = { 301: 0, 302: 0, 303: 0 };
let APT_DOOR_W    = 0;

// Notificações
let notifTimer = null;

// Áudio
let actx = null;

// -----------------------------------------------------------------------------
// UTILITÁRIOS
// -----------------------------------------------------------------------------

function horario() {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function notificar(msg) {
  const n = document.getElementById('notif');
  n.textContent = msg;
  n.classList.add('show');
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => n.classList.remove('show'), 2500);
}

function limitar(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function getEstadoAbertoPorAndar(andar) {
  return ['T_ABERTO', 'A1_ABERTO', 'A2_ABERTO', 'A3_ABERTO'][andar];
}

function getEstadoFechadoPorAndar(andar) {
  return ['T_FECHADO', 'A1_FECHADO', 'A2_FECHADO', 'A3_FECHADO'][andar];
}

function getLabelAndar(andar) {
  return ['Térreo', '1º Andar', '2º Andar', '3º Andar'][andar];
}

function getNumAndar(andar) {
  return ['T', '1', '2', '3'][andar];
}

function getEstadoTrecho(origem, destino) {
  if (origem === 0 && destino === 1) return 'SUBINDO_T_1';
  if (origem === 1 && destino === 2) return 'SUBINDO_1_2';
  if (origem === 2 && destino === 3) return 'SUBINDO_2_3';
  if (origem === 3 && destino === 2) return 'DESCENDO_3_2';
  if (origem === 2 && destino === 1) return 'DESCENDO_2_1';
  if (origem === 1 && destino === 0) return 'DESCENDO_1_T';
  return estadoAtualElev;
}

// -----------------------------------------------------------------------------
// AFD — TRANSIÇÕES
// -----------------------------------------------------------------------------

function tr(ev, next) {
  logAfd.push({ t: horario(), from: estadoAtual, ev, to: next });
  estadoAtual = next;
  visitados.add(next);
  if (!caminhoAfd.includes(next)) caminhoAfd.push(next);
  document.getElementById('hud-state').textContent = next;
}

function transElev(ev, next) {
  const prev = estadoAtualElev;
  logAfdElev.push({ t: horario(), from: prev, ev, to: next });
  estadoAtualElev = next;
  visitadosElev.add(next);
  caminhoAfdElev.push(next);
  _atualizarHudLive(prev, next, ev);
}

function _atualizarHudLive(prev, next, ev) {
  const lv = document.getElementById('afd-live');
  const ls = document.getElementById('afd-live-state');
  const lt = document.getElementById('afd-live-transition');
  const lp = document.getElementById('afd-live-path');
  if (!lv || !ls || !lt || !lp) return;

  lv.style.display = 'block';
  ls.textContent = ELEV_STATES_LABELS[next] || next;
  lt.textContent = (ELEV_STATES_LABELS[prev] || prev) + ' ──[' + ev + ']──▶';
  lp.textContent = 'Caminho: ' + caminhoAfdElev
    .slice(-6)
    .map(s => ELEV_STATES_LABELS[s] || s)
    .join(' → ');

  clearTimeout(lv._t);
  lv._t = setTimeout(() => {
    if (!elevadorEmMovimento) lv.style.display = 'none';
  }, 4000);
}

// -----------------------------------------------------------------------------
// ÁUDIO
// -----------------------------------------------------------------------------

function getContextoAudio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  return actx;
}

function tocarTom(freq, duracao, tipo = 'square') {
  try {
    const ctx = getContextoAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tipo;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracao);
    osc.start();
    osc.stop(ctx.currentTime + duracao);
  } catch (e) { /* sem áudio disponível */ }
}

function tocarChegada() {
  tocarTom(440, 0.08);
  setTimeout(() => tocarTom(550, 0.08), 100);
  setTimeout(() => tocarTom(660, 0.10), 200);
}

function playRestaurantMusic() {
  stopRestaurantMusic();
  try {
    const ctx    = getContextoAudio();
    const master = ctx.createGain();
    master.gain.value = 0.12;
    master.connect(ctx.destination);

    const notes  = [261, 293, 329, 349, 392, 440, 493, 523];
    const melody = [4,5,6,5,4,2,0,2,4,4,4,2,2,2,4,7,7,4,5,6,5,4,2,0,2,4,4,4,2,2,4,2,0];
    const beat   = 0.42;
    let stopped  = false;

    resMusic = {
      stop: () => { stopped = true; try { master.disconnect(); } catch (e) {} },
    };

    function playNote(idx) {
      if (stopped) return;
      if (idx >= melody.length) { setTimeout(() => playNote(0), beat * 200); return; }
      const freq = notes[melody[idx] % notes.length];
      const osc  = ctx.createOscillator();
      const g    = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + beat * 0.8);
      osc.connect(g);
      g.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + beat);
      setTimeout(() => playNote(idx + 1), beat * 1000);
    }

    setTimeout(() => playNote(0), 300);
  } catch (e) {}
}

function stopRestaurantMusic() {
  if (resMusic) { resMusic.stop(); resMusic = null; }
}

// -----------------------------------------------------------------------------
// DESENHO — SKYLINE / CIDADES
// -----------------------------------------------------------------------------

function desenharJanelaCidade(canvasId, seed) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const w = canvas.offsetWidth  || 300;
  const h = canvas.offsetHeight || 200;
  canvas.width  = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  const rng = n => { const x = Math.sin(seed + n) * 10000; return x - Math.floor(x); };

  ctx.fillStyle = '#050010';
  ctx.fillRect(0, 0, w, h);

  const nb = 6 + Math.floor(rng(1) * 5);
  for (let i = 0; i < nb; i++) {
    const bw = w / (nb + 1);
    const bh = h * (0.3 + rng(i + 10) * 0.5);
    const bx = i * bw + rng(i) * bw * 0.2;
    ctx.fillStyle = `hsl(${240 + rng(i) * 30},${15 + rng(i+1) * 20}%,${6 + rng(i+2) * 12}%)`;
    ctx.fillRect(bx, h - bh, bw * 0.85, bh);
    for (let wy = h - bh + 5; wy < h - 10; wy += 11) {
      for (let wx = bx + 3; wx < bx + bw * 0.8; wx += 9) {
        if (rng(wx + wy) > 0.4) {
          ctx.fillStyle = rng(wx+wy+1) > 0.7 ? '#ffe066' : rng(wx+wy+2) > 0.5 ? '#88ccff' : '#ffaa44';
          ctx.fillRect(wx, wy, 5, 6);
        }
      }
    }
  }

  for (let s = 0; s < 25; s++) {
    ctx.fillStyle = `rgba(255,255,255,${0.3 + rng(s + 50) * 0.7})`;
    ctx.fillRect(rng(s) * w, rng(s + 100) * h * 0.45, 1, 1);
  }
}

function iniciarJanelasCidade() {
  ['ccanvas-l', 'ccanvas-lc', 'ccanvas-rc', 'ccanvas-r']
    .forEach((id, i) => desenharJanelaCidade(id, i * 7 + 3));
  desenharJanelaCidade('candy-city-canvas', 42);
}

function drawRestaurantCity(canvas) {
  const w   = canvas.width;
  const h   = canvas.height;
  const ctx = canvas.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0,   '#050d1a');
  sky.addColorStop(0.6, '#0a1830');
  sky.addColorStop(1,   '#0d2040');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Lua
  ctx.beginPath(); ctx.arc(w * 0.82, h * 0.18, h * 0.09, 0, Math.PI * 2);
  ctx.fillStyle = '#d4e8ff'; ctx.fill();
  ctx.beginPath(); ctx.arc(w * 0.85, h * 0.16, h * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = '#050d1a'; ctx.fill();

  // Estrelas
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137.5) % w;
    const sy = (i * 97.3)  % (h * 0.55);
    ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
    ctx.fillRect(sx, sy, 1, 1);
  }

  const buildings = [
    {x:0,      w:w*.08,h:h*.65,c:'#0d1e30'}, {x:w*.07, w:w*.06,h:h*.45,c:'#0a1828'},
    {x:w*.12,  w:w*.09,h:h*.75,c:'#0f2236'}, {x:w*.20, w:w*.07,h:h*.55,c:'#0d1e30'},
    {x:w*.26,  w:w*.1, h:h*.8, c:'#122840'}, {x:w*.35, w:w*.06,h:h*.5, c:'#0a1828'},
    {x:w*.40,  w:w*.08,h:h*.7, c:'#0f2236'}, {x:w*.47, w:w*.05,h:h*.42,c:'#0d1e30'},
    {x:w*.51,  w:w*.09,h:h*.78,c:'#122840'}, {x:w*.59, w:w*.07,h:h*.52,c:'#0a1828'},
    {x:w*.65,  w:w*.1, h:h*.68,c:'#0f2236'}, {x:w*.74, w:w*.06,h:h*.48,c:'#0d1e30'},
    {x:w*.79,  w:w*.08,h:h*.72,c:'#122840'}, {x:w*.86, w:w*.07,h:h*.58,c:'#0a1828'},
    {x:w*.92,  w:w*.08,h:h*.65,c:'#0f2236'},
  ];

  buildings.forEach(b => {
    ctx.fillStyle = b.c;
    ctx.fillRect(b.x, h - b.h, b.w, b.h);
    const cols = Math.floor(b.w / 8);
    const rows = Math.floor(b.h / 10);
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.5) {
          ctx.fillStyle = Math.random() < 0.3 ? '#ffdd88' : 'rgba(100,180,255,0.6)';
          ctx.fillRect(b.x + c * 8 + 2, h - b.h + r * 10 + 2, 4, 5);
        }
      }
    }
  });

  const glow = ctx.createLinearGradient(0, h * 0.85, 0, h);
  glow.addColorStop(0, 'transparent');
  glow.addColorStop(1, 'rgba(255,100,50,.15)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, h * 0.85, w, h * 0.15);
}

// -----------------------------------------------------------------------------
// INICIALIZAÇÃO
// -----------------------------------------------------------------------------

window.addEventListener('load', () => {
  const si = document.getElementById('candy-store-img');
  if (si) { si.src = 'IMG/Loja.png'; si.style.display = 'block'; }

  document.getElementById('sel-img-mulher').src = 'IMG/mulher.png';
  document.getElementById('sel-img-homem').src  = 'IMG/Homem.png';
  document.getElementById('sel-img-gato').src   = 'IMG/gato.png';
  CHARS.mulher = 'IMG/mulher.png';
  CHARS.homem  = 'IMG/Homem.png';
  CHARS.gato   = 'IMG/gato.png';

  const sc = document.getElementById('select-city-bg');
  if (sc) {
    sc.width  = window.innerWidth;
    sc.height = window.innerHeight;
    desenharJanelaCidade('select-city-bg', 99);
  }

  iniciarStartScreen();
});

function mostrarSelecao() {
  document.getElementById('screen-start').style.display = 'none';
  document.getElementById('screen-select').style.display = 'flex';
  const sc = document.getElementById('select-city-bg');
  if (sc) {
    sc.width  = window.innerWidth;
    sc.height = window.innerHeight;
    desenharJanelaCidade('select-city-bg', 99);
  }
}

function selecionarPersonagem(type) {
  personagemEscolhido = type;
  const recepMap = { mulher: 'homem', homem: 'mulher', gato: 'mulher' };
  CHARS[type] = CHARS_RAW[type];
  CHARS[recepMap[type]] = CHARS_RAW[recepMap[type]];

  document.getElementById('player-img').src      = CHARS_RAW[type];
  document.getElementById('floor-player-img').src = CHARS_RAW[type];

  const setImg = (id, src) => { const el = document.getElementById(id); if (el) el.src = src; };
  setImg('elev-player-int',  CHARS_RAW[type]);
  setImg('recep-img',        'IMG/Recepcionista.png');
  setImg('candy-stand-img',  'IMG/StandCafé.png');
  setImg('candy-mesa-l',     'IMG/MesaLoja.png');
  setImg('candy-mesa-r',     'IMG/MesaLoja.png');
  setImg('candy-mesa-extra', 'IMG/MesaLoja.png');
  setImg('recep-sofa',       'IMG/Sofa.png');
  setImg('recep-balaco',     'IMG/ArmarioGrande.png');
  setImg('recep-mesinha',    'IMG/Mesinha.png');
  setImg('recep-poltrona',   'IMG/Poltrona.png');

  document.getElementById('screen-select').style.display = 'none';
  document.getElementById('hud').style.display           = 'flex';
  document.getElementById('viewport').classList.add('active');
  document.getElementById('ctrl-hint').style.display     = 'block';
  document.getElementById('hud-floor').textContent       = 'TÉRREO – LOBBY 🏢';

  jogadorX = window.innerWidth * 2.0;
  requestAnimationFrame(loopJogo);
  requestAnimationFrame(loopAndar);
  notificar('Use ← → para mover · [E] para interagir');
  iniciarJanelasCidade();
}

function iniciarStartScreen() {
  const cv = document.getElementById('start-bg');
  if (!cv) return;

  cv.width  = window.innerWidth;
  cv.height = window.innerHeight;
  const ctx = cv.getContext('2d');
  const w   = cv.width;
  const h   = cv.height;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0,   '#04000f');
  grad.addColorStop(0.6, '#0d0025');
  grad.addColorStop(1,   '#1a0040');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 200; i++) {
    const x = (i * 137 + 11) % w;
    const y = (i * 97  + 17) % (h * 0.7);
    const r = i % 8 === 0 ? 0.8 : i % 4 === 0 ? 0.5 : 0.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.2 + ((i * 79) % 60) / 100})`;
    ctx.fill();
  }

  const predH = Math.round(h * 0.28);
  const predDefs = [
    {x:.02,w:.06,h:.6}, {x:.07,w:.04,h:.4}, {x:.10,w:.08,h:.75}, {x:.17,w:.05,h:.5},
    {x:.21,w:.09,h:.85},{x:.29,w:.04,h:.35},{x:.32,w:.06,h:.65},  {x:.37,w:.03,h:.30},
    {x:.62,w:.03,h:.35},{x:.64,w:.07,h:.70},{x:.70,w:.04,h:.45},  {x:.73,w:.08,h:.80},
    {x:.80,w:.05,h:.55},{x:.84,w:.06,h:.40},{x:.89,w:.09,h:.72},  {x:.97,w:.04,h:.38},
  ];

  predDefs.forEach(p => {
    const px = Math.round(w * p.x);
    const pw = Math.round(w * p.w);
    const ph = Math.round(predH * p.h);
    const py = h - Math.round(h * 0.08) - ph;
    ctx.fillStyle = '#0a0020';
    ctx.fillRect(px, py, pw, ph);
    const cols = Math.max(2, Math.floor(pw / 8));
    const rows = Math.max(3, Math.floor(ph / 12));
    for (let r = 1; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const seed = r * 13 + col * 7 + p.x * 100;
        if (seed % 3 === 0) continue;
        ctx.fillStyle = seed % 5 === 0 ? '#ffe066' : seed % 4 === 0 ? '#88ccff' : '#ffaa44';
        ctx.globalAlpha = 0.5 + ((seed % 4) * 0.1);
        ctx.fillRect(
          px + Math.round(col * (pw / cols) + 1),
          py + Math.round(r   * (ph / rows) + 1),
          Math.max(2, Math.round(pw / cols) - 2),
          Math.max(3, Math.round(ph / rows) - 3),
        );
      }
    }
    ctx.globalAlpha = 1;
  });

  const soloH = Math.round(h * 0.08);
  ctx.fillStyle = '#120030';
  ctx.fillRect(0, h - soloH, w, soloH);
  ctx.strokeStyle = 'rgba(199,125,255,.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h - soloH);
  ctx.lineTo(w, h - soloH);
  ctx.stroke();
}

// -----------------------------------------------------------------------------
// TECLADO
// -----------------------------------------------------------------------------

document.addEventListener('keydown', e => {
  teclas[e.key] = true;

  const elevInt = document.getElementById('elev-interior');
  if (elevInt.classList.contains('show')) {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
      elevInt.classList.remove('show');
      return;
    }
  }

  if (!modalAberto && !andarAberto && (e.key === 'e' || e.key === 'E')) interagir();
  if (andarAberto && !modalAberto  && (e.key === 'e' || e.key === 'E')) interagirAndar();
  if (e.key === 'Escape') fecharTodosModais();
});

document.addEventListener('keyup', e => { teclas[e.key] = false; });

function fecharTodosModais() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
  document.getElementById('elev-interior').classList.remove('show');
  modalAberto = false;
}

// -----------------------------------------------------------------------------
// INTERAÇÃO — TÉRREO
// -----------------------------------------------------------------------------

function interagir() {
  const vw   = window.innerWidth;
  const zone = jogadorX < vw * 1.5 ? 'candy' : jogadorX < vw * 2.5 ? 'lobby' : 'recep';

  if (zone === 'candy') {
    const standX = vw * 0.12;
    const storeX = vw * 0.75;
    if (Math.abs(jogadorX - standX) < vw * 0.18)  { alternarMenuStand();  return; }
    if (Math.abs(jogadorX - storeX) < vw * 0.25)  { abrirLojaDeDolces(); return; }
    notificar('Use [E] perto da loja ou do stand! 🍬');
    return;
  }

  if (zone === 'lobby') {
    const elevX = vw * 2.0;
    if (Math.abs(jogadorX - elevX) < vw * 0.2) { entrarInteriorElevador(); return; }
    if (jogadorX > vw * 2.1)                   { tr('INTERACT_RECEPTION', 'AT_RECEPTION'); return; }
  }

  if (zone === 'recep') {
    tr('INTERACT_RECEPTION', 'AT_RECEPTION');
    notificar('Bem-vindo ao Meow Tower! 🐱');
  }
}

// -----------------------------------------------------------------------------
// INTERAÇÃO — ANDARES
// -----------------------------------------------------------------------------

function interagirAndar() {
  const vw = window.innerWidth;

  if (!_dentroApt302) {
    const elevWrapEl = document.getElementById('floor-elev-wrap');
    if (elevWrapEl && elevWrapEl.style.display !== 'none') {
      const elvL      = parseFloat(elevWrapEl.style.left) || 0;
      const elvW      = elevWrapEl.offsetWidth || Math.min(170, Math.max(110, vw * 0.13));
      const elvCentro = elvL + elvW / 2;
      if (Math.abs(jogadorXAndar - elvCentro) < elvW * 0.8) {
        entrarInteriorElevador();
        return;
      }
    }
  }

  if (andarAtual === 1) { _interagirRestaurante(vw); return; }
  if (andarAtual === 2) { interagirAcademia(vw);     return; }
  if (andarAtual === 3) { interagirAndar3(vw);       return; }

  notificar('Explore o andar!');
}

function _interagirRestaurante(vw) {
  const fvW  = document.getElementById('floor-world')?.offsetWidth || vw;
  const bancW = Math.min(380, Math.max(220, fvW * 0.28));

  if (jogadorXAndar < bancW + 80)                                               { abrirMenuRestaurante(); return; }
  if (Math.abs(jogadorXAndar - Math.round(vw * 2.05)) < Math.round(vw * 0.12)) { abrirMenuBar();         return; }
  if (Math.abs(jogadorXAndar - Math.round(vw * 2.58)) < Math.round(vw * 0.12)) { usarBanheiro();         return; }
  if (_itemGarcom && Math.abs(jogadorXAndar - Math.round(vw * 2.31)) < Math.round(vw * 0.10)) {
    pegarItemGarcom();
    return;
  }
  notificar('Explore o andar!');
}

// -----------------------------------------------------------------------------
// LOOP PRINCIPAL — TÉRREO / LOBBY
// -----------------------------------------------------------------------------

function loopJogo() {
  if (andarAberto) { requestAnimationFrame(loopJogo); return; }

  const vw    = window.innerWidth;
  const speed = Math.max(3, Math.min(8, vw * 0.004));
  const pl    = document.getElementById('player');
  if (!pl) { requestAnimationFrame(loopJogo); return; }

  const L = teclas['ArrowLeft']  || teclas['a'] || teclas['A'];
  const R = teclas['ArrowRight'] || teclas['d'] || teclas['D'];

  if ((L || R) && !elevadorEmMovimento && !modalAberto) {
    if (L) { jogadorX -= speed; olhandoDireita = false; }
    if (R) { jogadorX += speed; olhandoDireita = true;  }
    jogadorX = Math.max(0, Math.min(vw * 3.5 - 80, jogadorX));
    pl.classList.add('walking');
    jogadorJaAndou = true;
    pl.classList.toggle('flip', !olhandoDireita);
    if (estadoAtual === 'LOBBY_IDLE') tr('WALK', 'LOBBY_WALK');
  } else {
    pl.classList.remove('walking');
    if (estadoAtual === 'LOBBY_WALK') tr('STOP', 'LOBBY_IDLE');
  }

  const viewport = document.getElementById('viewport');
  const world    = document.getElementById('world');
  const vpW      = viewport.offsetWidth;
  const camX     = Math.max(0, Math.min(vw * 3.5 - vpW, jogadorX - vpW / 2));
  world.style.transform = `translateX(${-camX}px)`;
  pl.style.left = jogadorX + 'px';

  const zone    = jogadorX < vw * 1.5 ? 'candy' : jogadorX < vw * 2.5 ? 'lobby' : 'recep';
  const elevX   = vw * 2.0;
  const nearElev = zone === 'lobby' && Math.abs(jogadorX - elevX) < vw * 0.15;

  if (nearElev  && estadoAtual === 'LOBBY_IDLE')     tr('NEAR_ELEVATOR',  'AT_ELEVATOR');
  if (!nearElev && estadoAtual === 'AT_ELEVATOR')    tr('LEAVE_ELEVATOR', 'LOBBY_IDLE');

  _atualizarBubbleRecep(zone, viewport);
  _atualizarHintsTerreo(zone, vw, viewport, pl);

  requestAnimationFrame(loopJogo);
}

function _atualizarBubbleRecep(zone, viewport) {
  const vw        = window.innerWidth;
  const rb        = document.getElementById('recep-bubble');
  const rh        = document.getElementById('recep-hint');
  const nearDesk  = (zone === 'lobby' && jogadorX > vw * 1.95) || (zone === 'recep' && jogadorX < vw * 2.6);
  const semiNear  = zone === 'lobby' && jogadorX > vw * 1.85 && jogadorX <= vw * 2.1;
  const telaAberta = (
    document.getElementById('elev-interior')?.classList.contains('show') ||
    document.getElementById('elev-travel')?.classList.contains('show')   ||
    document.getElementById('floor-scene')?.classList.contains('show')   ||
    andarAberto || recemChegouLobby
  );

  if (rb) {
    if (nearDesk && !telaAberta && jogadorJaAndou && !rb.classList.contains('show')) rb.classList.add('show');
    if ((!nearDesk || telaAberta) && rb.classList.contains('show'))                  rb.classList.remove('show');
  }
  if (rh) rh.style.display = semiNear ? 'block' : 'none';
}

function _atualizarHintsTerreo(zone, vw, viewport, pl) {
  const standX   = vw * 0.12;
  const storeX   = vw * 0.75;
  const nearStand = zone === 'candy' && Math.abs(jogadorX - standX) < vw * 0.18;
  const nearStore = zone === 'candy' && Math.abs(jogadorX - storeX) < vw * 0.25;

  const hint = document.getElementById('stand-hint');
  if (hint && !itemNaMao) hint.style.display = nearStand ? 'block' : 'none';

  const sh = document.getElementById('candy-store-hint');
  if (sh) sh.style.display = nearStore ? 'block' : 'none';

  const pi = document.getElementById('player-item');
  if (pi && pi.style.display !== 'none' && itemNaMao) {
    const playerH = pl.offsetHeight || 110;
    pi.style.left   = (jogadorX + (pl.offsetWidth || 80) * 0.15) + 'px';
    pi.style.bottom = (18 / 100 * viewport.offsetHeight + playerH * 0.38) + 'px';
    pi.style.width  = (playerH * 0.75) + 'px';
    pi.style.height = 'auto';
  }
}

// -----------------------------------------------------------------------------
// LOOP DOS ANDARES
// -----------------------------------------------------------------------------

function loopAndar() {
  if (!andarAberto) { requestAnimationFrame(loopAndar); return; }

  try {
    const fw     = document.getElementById('floor-world');
    const fi     = document.getElementById('floor-inner');
    const fp     = document.getElementById('floor-player');
    if (!fw || !fp) { requestAnimationFrame(loopAndar); return; }

    const fvW   = fw.offsetWidth || window.innerWidth;
    const worldW = fi ? (parseFloat(fi.style.width) || fi.offsetWidth || fvW * 2.8) : fvW * 2.8;
    const speed  = Math.max(2, fvW * (_dentroApt302 ? 0.002 : 0.003));

    const L = teclas['ArrowLeft']  || teclas['a'] || teclas['A'];
    const R = teclas['ArrowRight'] || teclas['d'] || teclas['D'];

    if (L || R) {
      if (L) { jogadorXAndar -= speed; fp.classList.add('flip');    }
      if (R) { jogadorXAndar += speed; fp.classList.remove('flip'); }
      jogadorXAndar = Math.max(0, Math.min(worldW - 80, jogadorXAndar));
      fp.classList.add('walking');
    } else {
      fp.classList.remove('walking');
    }

    fp.style.left = jogadorXAndar + 'px';
    const camX = Math.max(0, Math.min(worldW - fvW, jogadorXAndar - fvW / 2));
    if (fi) fi.style.transform = `translateX(${-camX}px)`;

    try {
      if (andarAtual === 1) atualizarHintsAndar1(window.innerWidth);
      if (andarAtual === 2) atualizarHintsAcademia(window.innerWidth);
      if (andarAtual === 3) atualizarHintsAndar3(window.innerWidth);
    } catch (e2) { /* hints opcionais */ }

  } catch (e) { console.warn('loopAndar err:', e); }

  requestAnimationFrame(loopAndar);
}

// -----------------------------------------------------------------------------
// CANDY / ITENS DO STAND
// -----------------------------------------------------------------------------

function abrirLojaDeDolces() {
  tr('ENTER_CANDY', 'AT_CANDY');
  notificar('Abrindo Meow Candy... 🍬');
  window.open('https://b3ery.github.io/MachineCandy/', '_blank');
}

function alternarMenuStand() {
  const btns = document.getElementById('stand-btns');
  if (!btns) return;
  btns.style.display = btns.style.display === 'flex' ? 'none' : 'flex';
}

function pegarItemStand(type) {
  const srcs  = { cafe: 'IMG/Cafe.png', suco: 'IMG/suco.png', sanduiche: 'IMG/Sanduiche.png' };
  const names = { cafe: 'Café ☕',      suco: 'Suco 🍊',      sanduiche: 'Sanduíche 🥪'      };

  document.getElementById('stand-btns').style.display = 'none';
  if (!srcs[type]) { notificar('Item não disponível!'); return; }

  itensStand[type] = srcs[type];
  itemNaMao = type;
  const pi = document.getElementById('player-item');
  if (pi) { pi.src = srcs[type]; pi.style.display = 'block'; }
  notificar(`Você pegou: ${names[type]}! Clique no personagem pra consumir 😋`);
  tr('PICK_ITEM_' + type.toUpperCase(), 'AT_CANDY');
}

function consumirItem() {
  if (!itemNaMao) return;
  const piId = andarAberto ? 'floor-item' : 'player-item';
  const pi   = document.getElementById(piId);
  if (!pi || pi.style.display === 'none') return;

  pi.style.animation = 'consumeItem 0.5s ease-out forwards';

  const player = document.getElementById(andarAberto ? 'floor-player' : 'player');
  if (player) {
    const score = document.createElement('div');
    score.textContent = '😋 +15';
    score.className   = 'score-flutuante';
    player.appendChild(score);
    setTimeout(() => score.remove(), 800);
  }

  setTimeout(() => {
    if (pi) { pi.style.display = 'none'; pi.style.animation = ''; pi.src = ''; }
    itemNaMao = null;
    notificar('Mmm, delicioso! 😋');
    tocarTom(523, 0.08);
    setTimeout(() => tocarTom(659, 0.08), 80);
    setTimeout(() => tocarTom(784, 0.10), 160);
    tr('CONSUME_ITEM', 'LOBBY_IDLE');
  }, 500);
}

// -----------------------------------------------------------------------------
// ELEVADOR — PORTAS
// -----------------------------------------------------------------------------

function abrirPortas() {
  document.getElementById('door-l').classList.add('open');
  document.getElementById('door-r').classList.add('open');
  tr('OPEN_DOORS', 'ELEV_OPEN');
  transElev('ABRIR_PORTAS', 'PORTAS_ABERTAS');
  tocarTom(440, 0.1);
  setTimeout(() => tocarTom(880, 0.08), 120);
}

function fecharPortas(cb) {
  document.getElementById('door-l').classList.remove('open');
  document.getElementById('door-r').classList.remove('open');
  tr('CLOSE_DOORS', 'ELEV_CLOSING');
  transElev('FECHAR_PORTAS', 'PORTAS_FECHANDO');
  tocarTom(220, 0.1);
  setTimeout(cb, 700);
}

function abrirPortaElev() {
  if (elevadorEmMovimento) { notificar('Em movimento!'); return; }
  if (_timerPorta) { clearTimeout(_timerPorta); _timerPorta = null; }

  tocarTom(440, 0.1);
  setTimeout(() => tocarTom(880, 0.08), 120);

  transElev('BTN_ABRIR_PORTA', getEstadoAbertoPorAndar(andarAtualElev));
  portasAbertas = true;

  document.getElementById('elev-interior-box').style.display = 'flex';
  ['int-door-l','int-door-r'].forEach(id => document.getElementById(id).classList.add('int-open'));
  ['door-l','door-r','floor-door-l','floor-door-r'].forEach(id => document.getElementById(id)?.classList.add('open'));

  notificar('🚪 Portas abertas');
}

function fecharPortaElev() {
  if (elevadorEmMovimento) { notificar('Em movimento!'); return; }

  tocarTom(220, 0.12);
  transElev('BTN_FECHAR_PORTA', getEstadoFechadoPorAndar(andarAtualElev));
  portasAbertas = false;

  ['int-door-l','int-door-r'].forEach(id => document.getElementById(id).classList.remove('int-open'));
  ['door-l','door-r','floor-door-l','floor-door-r'].forEach(id => document.getElementById(id)?.classList.remove('open'));
}

// -----------------------------------------------------------------------------
// ELEVADOR — INTERIOR E VIAGEM
// -----------------------------------------------------------------------------

function entrarInteriorElevador() {
  if (elevadorEmMovimento) { notificar('🔄 Elevador em movimento...'); return; }

  document.getElementById('recep-bubble')?.classList.remove('show');

  const ep = document.getElementById('elev-player-int');
  if (ep) ep.src = CHARS_RAW[personagemEscolhido] || '';

  atualizarInteriorElev();
  portasAbertas = true;

  ['int-door-l','int-door-r'].forEach(id => document.getElementById(id).classList.add('int-open'));
  ['door-l','door-r','floor-door-l','floor-door-r'].forEach(id => document.getElementById(id)?.classList.add('open'));

  document.getElementById('elev-interior').classList.add('show');
  document.getElementById('elev-interior-box').style.display = 'flex';

  transElev('ENTRAR_ELEVADOR', getEstadoAbertoPorAndar(andarAtualElev));
  notificar('Escolha o andar! 🛗');
}

function atualizarInteriorElev() {
  const strip = document.getElementById('elev-strip-num');
  const lbl   = document.getElementById('elev-strip-label');
  const ind   = document.getElementById('elev-ind-num');

  if (strip) strip.textContent = getNumAndar(andarAtualElev);
  if (lbl)   lbl.textContent   = FLOORS[andarAtualElev];
  if (ind) {
    ind.textContent = getNumAndar(andarAtualElev);
    ind.style.color = '#00ff55';
    ind.style.textShadow = '0 0 10px #00ff55,0 0 20px #00cc44';
  }

  [0, 1, 2, 3].forEach(i => {
    const b = document.getElementById('ibtn-' + i);
    if (!b) return;
    b.classList.remove('active', 'current');
    if (i === andarAtualElev) b.classList.add('current');
  });

  andarSelecionadoElev = -1;
}

function selecionarAndar(floor) {
  if (floor === andarAtualElev) { notificar('Já estás aqui!'); return; }
  if (elevadorEmMovimento)      { notificar('🔄 Em movimento...'); return; }

  andarSelecionadoElev = floor;

  [0, 1, 2, 3].forEach(i => {
    const b = document.getElementById('ibtn-' + i);
    if (!b) return;
    b.classList.remove('active', 'current');
    if (i === floor) b.classList.add('active');
    else if (i === andarAtualElev) b.classList.add('current');
  });

  const ind = document.getElementById('elev-ind-num');
  if (ind) {
    ind.textContent = getNumAndar(floor);
    ind.style.color = '#ffaa00';
    ind.style.textShadow = '0 0 12px #ffaa00';
  }

  tocarTom(440, 0.06);
  transElev('SELECIONAR_ANDAR_' + getNumAndar(floor), getEstadoAbertoPorAndar(andarAtualElev));
  notificar('🚪 Fechando portas em 1.5s...');
  elevadorEmMovimento = true;

  const tempoEspera = portasAbertas ? 1500 : 100;
  _timerPorta = setTimeout(() => { _timerPorta = null; viajar(floor); }, tempoEspera);
}

  tocarTom(440, 0.06);
  transElev('SELECIONAR_ANDAR_' + FNUMS[floor], 'PORTAS_ABERTAS');
  notificar('🚪 Fechando portas em 1.5s...');
  elevadorEmMovimento = true;

  const tempoEspera = portasAbertas ? 1500 : 100;
  _timerPorta = setTimeout(() => { _timerPorta = null; viajar(floor); }, tempoEspera);
}

function registrarPercursoFormal(origem, destino) {
  const dir = destino > origem ? 1 : -1;
  let atual = origem;

  while (atual !== destino) {
    const prox = atual + dir;
    const estadoTrecho = getEstadoTrecho(atual, prox);
    transElev('MOVER_' + getNumAndar(atual) + '_' + getNumAndar(prox), estadoTrecho);
    atual = prox;
  }
}

function viajar(target) {
  const dir   = target > andarAtualElev ? 1 : -1;
  const steps = Math.abs(target - andarAtualElev);

  portasAbertas = false;

  ['int-door-l','int-door-r'].forEach(id => document.getElementById(id).classList.remove('int-open'));
  ['floor-door-l','floor-door-r'].forEach(id => document.getElementById(id)?.classList.remove('open'));

  fecharPortas(() => {});
  tocarTom(220, 0.12);

  transElev('FECHAR_PORTAS', getEstadoFechadoPorAndar(andarAtualElev));
  registrarPercursoFormal(andarAtualElev, target);

  setTimeout(() => {
    document.getElementById('elev-interior').classList.remove('show');
    document.getElementById('viewport').classList.remove('active');

    mostrarTelaViagem(dir, steps, 1800, () => {
      _aoChegarAndar(target);
    });
  }, 700);
}

function _aoChegarAndar(target) {
  elevadorEmMovimento = false;
  andarAtualElev      = target;

  const numEl = document.getElementById('elev-num');
  if (numEl) {
    numEl.textContent = getNumAndar(target);
    numEl.style.color = target === 0 ? '#ff2222' : '#22ff22';
  }

  const ind = document.getElementById('elev-ind-num');
  if (ind) {
    ind.textContent = getNumAndar(target);
    ind.style.color = '#00ff55';
    ind.style.textShadow = '0 0 10px #00ff55';
  }

  [0, 1, 2, 3].forEach(i => {
    const b = document.getElementById('ibtn-' + i);
    if (!b) return;
    b.classList.remove('active', 'current');
    if (i === target) b.classList.add('current');
  });

  const fen = document.getElementById('floor-elev-num');
  if (fen) fen.textContent = getNumAndar(target);

  tr('ARRIVE', 'ELEV_OPEN');
  transElev('CHEGAR_ANDAR_' + getNumAndar(target), getEstadoAbertoPorAndar(target));
  notificar('📍 ' + FLOOR_ICONS[target] + ' ' + FLOORS[target]);
  abrirPortas();

  ['floor-door-l','floor-door-r'].forEach(id => document.getElementById(id)?.classList.add('open'));
  document.getElementById('floor-scene').classList.remove('show');
  andarAberto = false;

  if (target === 0) _voltarTerreo();
  else _entrarAndarViaElevador(target);
}

function _voltarTerreo() {
  document.getElementById('hud-floor').textContent = 'TÉRREO – LOBBY 🏢';
  jogadorJaAndou = false;
  jogadorX = window.innerWidth * 2.0;
  const pl = document.getElementById('player');
  if (pl) pl.style.left = jogadorX + 'px';
  document.getElementById('viewport').classList.add('active');
  setTimeout(() => {
    ['door-l','door-r','floor-door-l','floor-door-r']
      .forEach(id => document.getElementById(id)?.classList.remove('open'));
  }, 600);
}

function _entrarAndarViaElevador(target) {
  const ep = document.getElementById('elev-player-int');
  if (ep) ep.src = CHARS_RAW[personagemEscolhido] || '';

  atualizarInteriorElev();
  ['int-door-l','int-door-r'].forEach(id => document.getElementById(id).classList.remove('int-open'));
  document.getElementById('elev-interior').classList.add('show');

  setTimeout(() => {
    ['int-door-l','int-door-r'].forEach(id => document.getElementById(id).classList.add('int-open'));
    if (ep) { ep.style.transition = 'transform 0.6s ease-in'; ep.style.transform = 'translateX(160%)'; }
    setTimeout(() => {
      if (ep) { ep.style.transition = ''; ep.style.transform = ''; }
      document.getElementById('elev-interior').classList.remove('show');
      entrarAndar(target);
    }, 700);
  }, 500);
}

// -----------------------------------------------------------------------------
// TELA DE VIAGEM
// -----------------------------------------------------------------------------

function mostrarTelaViagem(dir, steps, stepTime, onArrive) {
  const destFloor = Math.max(0, Math.min(3, andarAtualElev + dir * steps));
  const totalMs   = steps * stepTime;

  const screen   = document.getElementById('elev-travel');
  const bg       = document.getElementById('travel-bg');
  const elBox    = document.getElementById('travel-elevator');
  const tvNum    = document.getElementById('tv-num');
  const tvUp     = document.getElementById('tv-arr-up');
  const tvDn     = document.getElementById('tv-arr-dn');
  const dleft    = document.getElementById('tv-door-l');
  const dright   = document.getElementById('tv-door-r');
  const labelCt  = document.getElementById('travel-floor-labels');

  const elvEl  = document.getElementById('tv-elev');
  const floorH = elvEl ? (elvEl.offsetHeight || 220) : 220;

  labelCt.innerHTML = '';
  [['3','🛋️ 3º ANDAR'],['2','💪 2º ANDAR'],['1','🍽️ 1º ANDAR'],['T','🏢 TÉRREO']]
    .forEach(([f, label], i) => {
      const el = document.createElement('div');
      el.className  = 'travel-floor-label';
      el.textContent = label;
      el.style.cssText = `
        font-size:clamp(8px,1.1vw,14px);letter-spacing:2px;
        left:50%;transform:translateX(-50%);text-align:center;
        width:max-content;opacity:0.75;
      `;
      el.style.top = (window.innerHeight * 0.5 + (i - (3 - andarAtualElev)) * floorH) + 'px';
      labelCt.appendChild(el);
    });

  dleft.classList.remove('open');
  dright.classList.remove('open');
  tvUp.classList.toggle('on', dir > 0);
  tvDn.classList.toggle('on', dir < 0);
  tvNum.textContent    = FNUMS[andarAtualElev];
  tvNum.style.color    = '#ffaa00';
  tvNum.style.textShadow = '0 0 12px #ffaa00';

  screen.classList.add('show');
  elBox.classList.add('shaking');
  bg.style.transform = 'translateY(0px)';

  let startTime = null;
  let lastFloor = andarAtualElev;
  if (animViagem) cancelAnimationFrame(animViagem);

  function animate(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / totalMs, 1);
    const eased    = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;
    const offset = eased * steps * floorH * (dir > 0 ? 1 : -1);

    bg.style.transform = `translateY(${offset}px)`;
    Array.from(labelCt.children).forEach((lbl, i) => {
      lbl.style.top = (window.innerHeight * 0.5 + (i - (3 - andarAtualElev)) * floorH + offset) + 'px';
    });

    const passed = Math.floor(Math.abs(offset) / floorH + 0.3);
    const cur    = Math.max(0, Math.min(3, andarAtualElev + dir * passed));

    if (cur !== lastFloor) {
      lastFloor = cur;
      tvNum.textContent = FNUMS[cur];
      tocarTom(200 + cur * 90, 0.06);

      // Registra passagem por andar intermediário no AFD
      if (cur !== destFloor && cur !== andarAtualElev) {
        const passState = 'PASSANDO_' + cur;
        if (ELEV_STATES.includes(passState)) {
          transElev('PASSAR_ANDAR_' + FNUMS[cur], passState);
        }
      }
    }

    if (progress < 1) {
      animViagem = requestAnimationFrame(animate);
    } else {
      elBox.classList.remove('shaking');
      tvUp.classList.remove('on');
      tvDn.classList.remove('on');
      tvNum.textContent    = FNUMS[destFloor];
      tvNum.style.color    = '#22ff22';
      tvNum.style.textShadow = '0 0 12px #22ff22';
      tocarChegada();
      setTimeout(() => {
        dleft.classList.add('open');
        dright.classList.add('open');
        setTimeout(() => {
          recemChegouLobby = true;
          jogadorJaAndou   = false;
          document.getElementById('recep-bubble')?.classList.remove('show');
          screen.classList.remove('show');
          if (onArrive) onArrive();
          setTimeout(() => { recemChegouLobby = false; }, 500);
        }, 800);
      }, 400);
    }
  }

  animViagem = requestAnimationFrame(animate);
}

// -----------------------------------------------------------------------------
// ANDARES — ENTRADA / SAÍDA
// -----------------------------------------------------------------------------

function entrarAndar(floorNum) {
  if (andarAberto) return;
  andarAtual  = floorNum;
  andarAberto = true;

  const cfg = FLOOR_CFG[floorNum];
  document.getElementById('floor-hud-name').textContent     = cfg.name;
  document.getElementById('hud-floor').textContent          = cfg.name;
  document.getElementById('floor-hud').style.borderBottomColor =
    floorNum === 1 ? '#ffaa44' : floorNum === 2 ? '#00ff88' : '#c77dff';

  const wall = document.getElementById('floor-wall');
  if (wall) wall.style.background = `linear-gradient(180deg,${cfg.wallColor},${cfg.floorColor})`;

  const fen = document.getElementById('floor-elev-num');
  if (fen) fen.textContent = FNUMS[floorNum];

  _montarBotoesElevadorAndar(floorNum);

  const fpi = document.getElementById('floor-player-img');
  if (fpi && CHARS[personagemEscolhido]) fpi.src = CHARS[personagemEscolhido];

  const furni = document.getElementById('floor-furni');
  if (furni) {
    if      (floorNum === 1) construirAndar1(furni);
    else if (floorNum === 2) construirAndar2(furni);
    else if (floorNum === 3) construirAndar3(furni);
    else                     furni.innerHTML = '';
  }

  tr('ENTER_FLOOR_' + FNUMS[floorNum], 'FLOOR_' + FNUMS[floorNum]);

  const msgs = {
    1: 'Bem-vindo ao Restaurante! · Bancada: Cardápio · Bar: Drinks · Banheiro: [E]',
    2: 'Bem-vindo à Academia! · Equipamentos: [E] Treinar · Bebedouro: [E] Beber · Vestiário: [E]',
    3: '3º Andar — Seu apartamento é o 302. Use [E] nas portas.',
  };
  if (msgs[floorNum]) setTimeout(() => notificar(msgs[floorNum]), 400);

  document.getElementById('floor-scene').classList.add('show');

  const fp = document.getElementById('floor-player');
  if (fp) {
    fp.style.left    = jogadorXAndar + 'px';
    fp.style.overflow = 'visible';
    fp.classList.remove('flip');
    fp.onclick = null;

    const oldFi = document.getElementById('floor-item');
    if (oldFi) oldFi.remove();

    const fi2       = document.createElement('img');
    fi2.id          = 'floor-item';
    fi2.src         = '';
    fi2.className   = 'floor-item-base';
    fi2.onclick     = e => { e.stopPropagation(); consumirItem(); };
    fp.appendChild(fi2);
  }

  ['floor-door-l','floor-door-r'].forEach(id => document.getElementById(id).classList.remove('open'));
  requestAnimationFrame(loopAndar);
}

function _montarBotoesElevadorAndar(floorNum) {
  const fbtns = document.getElementById('floor-elev-btns');
  if (!fbtns) return;
  fbtns.innerHTML = '';

  const mkBtn = (dir, icon, title) => {
    const b = document.createElement('button');
    b.className = 'elev-call-btn ' + dir;
    b.innerHTML = icon;
    b.title     = title;
    b.onclick   = e => { e.stopPropagation(); entrarInteriorElevador(); };
    fbtns.appendChild(b);
  };

  if (floorNum < 3) mkBtn('up', '▲', 'Subir');
  if (floorNum > 0) mkBtn('dn', '▼', 'Descer');
}

function sairAndar() {
  tr('LEAVE_FLOOR', 'ELEV_OPEN');
  transElev('ENTRAR_ELEVADOR', 'PORTAS_ABERTAS');

  ['floor-door-l','floor-door-r'].forEach(id => document.getElementById(id).classList.add('open'));

  setTimeout(() => {
    document.getElementById('floor-scene').classList.remove('show');
    andarAberto = false;

    const ep = document.getElementById('elev-player-int');
    if (ep) ep.src = CHARS_RAW[personagemEscolhido] || '';

    atualizarInteriorElev();
    document.getElementById('hud-floor').textContent = FLOORS[andarAtualElev];
    portasAbertas = true;

    ['int-door-l','int-door-r'].forEach(id => document.getElementById(id).classList.add('int-open'));
    document.getElementById('recep-bubble')?.classList.remove('show');
    document.getElementById('elev-interior').classList.add('show');
    notificar('Escolha o andar! 🛗');
  }, 400);
}

// -----------------------------------------------------------------------------
// RELATÓRIO AFD
// -----------------------------------------------------------------------------

function abrirRelatorio(final = false) {
  modalAberto = true;

  const cn = { mulher: 'Helo 👩', homem: 'Pedro 👨', gato: 'Apollo 🐱' };
  const dur = Math.round((new Date() - t0) / 1000);

  // Estados visitados
  const sw = document.getElementById('afd-states');
  sw.innerHTML = '';
  ELEV_STATES.forEach(s => {
    const div = document.createElement('div');
    div.className = 'sc';
    const visitado = visitadosElev.has(s);
    const atual = s === estadoAtualElev;
    div.innerHTML = `
      <span style="color:${atual ? 'var(--yellow)' : visitado ? 'var(--mint)' : 'rgba(255,255,255,.35)'}">
        ${ELEV_STATES_LABELS[s] || s}
      </span>
    `;
    sw.appendChild(div);
  });

  // Log de transições
  const lEl = document.getElementById('afd-log');
  lEl.innerHTML = logAfdElev.length === 0
    ? '<span style="opacity:.4">Nenhuma transição ainda.</span>'
    : logAfdElev.map(e => `
        <div class="lr">
          <span class="lt">${e.t}</span>
          <span class="lf">${ELEV_STATES_LABELS[e.from] || e.from}</span>
          <span class="le">──[${e.ev}]──▶</span>
          <span style="color:#c77dff">${ELEV_STATES_LABELS[e.to] || e.to}</span>
        </div>
      `).join('');
  lEl.scrollTop = lEl.scrollHeight;

  // Trajetória
  document.getElementById('afd-path').innerHTML =
    '<span style="color:var(--pink2)">' +
    caminhoAfdElev.map(s => ELEV_STATES_LABELS[s] || s).join('<br>──▶ ') +
    '</span>';

  // Resumo
  const andares = [...new Set(
    [...visitadosElev]
      .filter(s => ['T_ABERTO','T_FECHADO','A1_ABERTO','A1_FECHADO','A2_ABERTO','A2_FECHADO','A3_ABERTO','A3_FECHADO'].includes(s))
      .map(s => {
        if (s.startsWith('T_')) return 'Térreo';
        if (s.startsWith('A1_')) return '1º Andar';
        if (s.startsWith('A2_')) return '2º Andar';
        if (s.startsWith('A3_')) return '3º Andar';
        return s;
      })
  )].join(', ') || 'Nenhum';

  const nViagens = logAfdElev.filter(e =>
    e.ev.startsWith('MOVER_') || e.ev.startsWith('SELECIONAR_')
  ).length;

  document.getElementById('afd-summary').innerHTML = `
    <b style="color:var(--mint)">Personagem:</b> ${cn[personagemEscolhido]}<br>
    <b style="color:var(--mint)">Estado atual:</b> ${ELEV_STATES_LABELS[estadoAtualElev] || estadoAtualElev}<br>
    <b style="color:var(--mint)">Andares visitados:</b> ${andares}<br>
    <b style="color:var(--mint)">Total de viagens:</b> ${nViagens}<br>
    <b style="color:var(--mint)">Transições:</b> ${logAfdElev.length}<br>
    <b style="color:var(--mint)">Duração da sessão:</b> ${dur}s
  `;

  desenharDiagramaAFD();
  document.getElementById('report-modal').classList.add('show');
  if (final) transElev('FINALIZAR', getEstadoAbertoPorAndar(andarAtualElev));
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('show');
  modalAberto = false;
  if (id === 'report-modal' && estadoAtual === 'FINALIZE') tr('CLOSE_REPORT', 'LOBBY_IDLE');
}

function voltarSelecao() {
  document.getElementById('report-modal').classList.remove('show');
  modalAberto = false;

  const ov = document.getElementById('trans-ov');
  document.getElementById('t-ico').textContent = '👋';
  document.getElementById('t-txt').textContent = 'Até logo!';
  ov.classList.add('show');

  setTimeout(() => {
    document.getElementById('hud').style.display       = 'none';
    document.getElementById('viewport').classList.remove('active');
    document.getElementById('ctrl-hint').style.display = 'none';
    document.getElementById('floor-scene').classList.remove('show');
    document.getElementById('elev-interior').classList.remove('show');
    document.getElementById('elev-travel').classList.remove('show');
    document.getElementById('door-l').classList.remove('open');
    document.getElementById('door-r').classList.remove('open');
    document.getElementById('elev-num').textContent = 'T';
    document.getElementById('elev-num').style.color = '#ff2222';

    andarAberto         = false;
    estadoAtual         = 'LOBBY_IDLE';
    logAfd              = [];
    caminhoAfd          = ['LOBBY_IDLE'];
    visitados           = new Set(['LOBBY_IDLE']);
    t0                  = new Date();

    logAfdElev          = [];
    caminhoAfdElev      = ['T_ABERTO'];
    visitadosElev       = new Set(['T_ABERTO']);
    estadoAtualElev     = 'T_ABERTO';
    andarAtualElev      = 0;
    elevadorEmMovimento = false;

    contadorDoces       = 0;
    itemNaMao           = null;
    jogadorX            = 0;
    teclas              = {};
    modalAberto         = false;
    olhandoDireita      = true;
    portasAbertas       = true;
    andarSelecionadoElev = -1;

    document.getElementById('screen-start').style.display = 'flex';
    iniciarStartScreen();
    ov.classList.remove('show');
  }, 900);
}

// -----------------------------------------------------------------------------
// DIAGRAMA AFD
// -----------------------------------------------------------------------------

function desenharDiagramaAFD() {
  const cv = document.getElementById('afd-canvas');
  if (!cv) return;

  const ctx = cv.getContext('2d');
  const W   = cv.width;
  const H   = cv.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#06001a';
  ctx.fillRect(0, 0, W, H);

  const nos = {
    PARADO_TERREO:   { x: 210, y: 295, label: 'PARADO\nTÉRREO',   cor: '#ff4488' },
    PORTAS_ABERTAS:  { x: 90,  y: 210, label: 'PORTAS\nABERTAS',  cor: '#44ddff' },
    PORTAS_FECHANDO: { x: 330, y: 210, label: 'PORTAS\nFECHANDO', cor: '#ffaa00' },
    SUBINDO:         { x: 330, y: 130, label: 'SUBINDO',           cor: '#88ff66' },
    DESCENDO:        { x: 90,  y: 130, label: 'DESCENDO',          cor: '#88ff66' },
    PASSANDO_1:      { x: 210, y: 165, label: 'PASSANDO\nAND. 1', cor: '#ff9fd6' },
    PASSANDO_2:      { x: 210, y: 100, label: 'PASSANDO\nAND. 2', cor: '#ff9fd6' },
    CHEGOU:          { x: 380, y: 40,  label: 'CHEGOU',            cor: '#ffee44' },
    FLOOR_1:         { x: 50,  y: 295, label: 'ANDAR 1',           cor: '#c77dff' },
    FLOOR_2:         { x: 370, y: 295, label: 'ANDAR 2',           cor: '#c77dff' },
    FLOOR_3:         { x: 210, y: 40,  label: 'ANDAR 3',           cor: '#c77dff' },
  };

  const arestas = [
    { de: 'PARADO_TERREO',  para: 'PORTAS_ABERTAS',  ev: 'ABRIR'     },
    { de: 'PORTAS_ABERTAS', para: 'PORTAS_FECHANDO', ev: 'FECHAR'    },
    { de: 'PORTAS_FECHANDO',para: 'SUBINDO',          ev: 'MOVER↑'   },
    { de: 'PORTAS_FECHANDO',para: 'DESCENDO',         ev: 'MOVER↓'   },
    { de: 'SUBINDO',        para: 'PASSANDO_1',       ev: 'PASSAR F1' },
    { de: 'SUBINDO',        para: 'PASSANDO_2',       ev: 'PASSAR F2' },
    { de: 'DESCENDO',       para: 'PASSANDO_2',       ev: 'PASSAR F2' },
    { de: 'DESCENDO',       para: 'PASSANDO_1',       ev: 'PASSAR F1' },
    { de: 'PASSANDO_1',     para: 'PASSANDO_2',       ev: 'CONTINUA↑' },
    { de: 'PASSANDO_2',     para: 'PASSANDO_1',       ev: 'CONTINUA↓' },
    { de: 'SUBINDO',        para: 'CHEGOU',            ev: 'CHEGOU'   },
    { de: 'DESCENDO',       para: 'CHEGOU',            ev: 'CHEGOU'   },
    { de: 'PASSANDO_1',     para: 'CHEGOU',            ev: 'CHEGOU'   },
    { de: 'PASSANDO_2',     para: 'CHEGOU',            ev: 'CHEGOU'   },
    { de: 'CHEGOU',         para: 'PORTAS_ABERTAS',   ev: 'ABRIR'    },
    { de: 'CHEGOU',         para: 'FLOOR_1',           ev: '→ F1'    },
    { de: 'CHEGOU',         para: 'FLOOR_2',           ev: '→ F2'    },
    { de: 'CHEGOU',         para: 'FLOOR_3',           ev: '→ F3'    },
    { de: 'FLOOR_1',        para: 'PARADO_TERREO',    ev: '→ T'      },
    { de: 'FLOOR_2',        para: 'PARADO_TERREO',    ev: '→ T'      },
    { de: 'FLOOR_3',        para: 'PARADO_TERREO',    ev: '→ T'      },
  ];

  const r = 20;

  // Arestas
  arestas.forEach(a => {
    const A = nos[a.de];
    const B = nos[a.para];
    if (!A || !B) return;

    const visitada = logAfdElev.some(e => e.from === a.de && e.to === a.para);
    const dx   = B.x - A.x;
    const dy   = B.y - A.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    const sx = A.x + (dx / dist) * r;
    const sy = A.y + (dy / dist) * r;
    const ex = B.x - (dx / dist) * r;
    const ey = B.y - (dy / dist) * r;

    ctx.strokeStyle = visitada ? 'rgba(199,125,255,.7)' : 'rgba(255,255,255,.12)';
    ctx.lineWidth   = visitada ? 2 : 1;
    ctx.setLineDash(visitada ? [] : [4, 4]);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();

    // Seta
    const ang = Math.atan2(ey - sy, ex - sx);
    ctx.fillStyle = visitada ? 'rgba(199,125,255,.7)' : 'rgba(255,255,255,.12)';
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 10 * Math.cos(ang - 0.4), ey - 10 * Math.sin(ang - 0.4));
    ctx.lineTo(ex - 10 * Math.cos(ang + 0.4), ey - 10 * Math.sin(ang + 0.4));
    ctx.closePath(); ctx.fill();

    // Label
    if (visitada) {
      ctx.fillStyle  = 'rgba(255,220,100,.7)';
      ctx.font       = 'bold 7px monospace';
      ctx.textAlign  = 'center';
      ctx.fillText(a.ev, (sx + ex) / 2, (sy + ey) / 2 - 5);
    }
    ctx.setLineDash([]);
  });

  // Nós
  Object.entries(nos).forEach(([id, n]) => {
    const visitado = visitadosElev.has(id);
    const atual    = estadoAtualElev === id;

    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle   = atual ? n.cor : visitado ? n.cor + '44' : '#0e0030';
    ctx.fill();
    ctx.strokeStyle = atual ? n.cor : visitado ? n.cor : 'rgba(255,255,255,.15)';
    ctx.lineWidth   = atual ? 3 : visitado ? 2 : 1;
    ctx.stroke();

    if (atual) {
      ctx.beginPath(); ctx.arc(n.x, n.y, r + 5, 0, Math.PI * 2);
      ctx.strokeStyle = n.cor + '66'; ctx.lineWidth = 3; ctx.stroke();
    }

    ctx.fillStyle = atual ? '#fff' : visitado ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.3)';
    ctx.font      = `bold ${atual ? 8 : 7}px monospace`;
    ctx.textAlign = 'center';
    const linhas  = n.label.split('\n');
    linhas.forEach((l, i) => ctx.fillText(l, n.x, n.y + 3 + (i - (linhas.length - 1) / 2) * 10));
  });

  ctx.fillStyle = 'rgba(199,125,255,.5)';
  ctx.font      = '6px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('● Visitado  ○ Não visitado  ✦ Estado atual', 8, H - 8);
}

// -----------------------------------------------------------------------------
// RESTAURANTE — ANDAR 1
// -----------------------------------------------------------------------------

function construirAndar1(furni) {
  furni.innerHTML = '';
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const fi = document.getElementById('floor-inner');
  if (fi) fi.style.width = (vw * 2.8) + 'px';
  furni.style.cssText = `position:absolute;inset:0;width:${vw * 2.8}px;`;

  _estilizarParedeRestaurante();

  const fg = document.getElementById('floor-fgrid');
  if (fg) {
    fg.style.background = 'repeating-linear-gradient(90deg,#0a0018 0px,#0a0018 39px,#140030 39px,#140030 40px)';
    fg.style.borderTop  = '3px solid rgba(199,125,255,.35)';
  }

  const fgridH = Math.round((vh - 44) * 0.18);

  const gi = (src, leftPx, widthPx, z = 4) => {
    const e = document.createElement('img');
    e.src = src;
    e.style.cssText = `position:absolute;bottom:${fgridH}px;left:${leftPx}px;width:${widthPx}px;height:auto;image-rendering:pixelated;z-index:${z};`;
    return e;
  };

  // Luzes no teto
  const luzSize  = Math.round(vw * 0.18);
  const luzLimit = Math.round(vw * 1.12);
  for (let x = 0; x < luzLimit; x += luzSize) {
    const lz = document.createElement('img');
    lz.src = 'IMG/LuzesRes.png';
    lz.style.cssText = `position:absolute;top:0;left:${x}px;width:${luzSize}px;height:auto;image-rendering:pixelated;z-index:1;pointer-events:none;`;
    furni.appendChild(lz);
  }

  // Pilares
  const pilarH = Math.round((vh - 44) * 0.82);
  const pilarW = Math.round(vw * 0.018);
  [0.30, 0.70, 1.05, 2.00, 2.50].forEach(pct => {
    const lx = Math.round(vw * pct);
    const p  = document.createElement('div');
    p.style.cssText = `
      position:absolute;bottom:${fgridH}px;left:${lx}px;
      width:${pilarW}px;height:${pilarH}px;
      background:linear-gradient(90deg,#1a0638,#4a1888 30%,#6a28b8 50%,#4a1888 70%,#1a0638);
      box-shadow:0 0 14px rgba(155,93,229,.4),inset 0 0 8px rgba(255,255,255,.05);
      z-index:3;pointer-events:none;
    `;
    const cap = document.createElement('div');
    cap.style.cssText = `position:absolute;top:0;left:${-Math.round(pilarW * 0.4)}px;width:${Math.round(pilarW * 1.8)}px;height:${Math.round(pilarW * 1.2)}px;background:linear-gradient(180deg,#7a30d0,#4a1888);border-radius:2px 2px 0 0;box-shadow:0 0 8px rgba(155,93,229,.5);`;
    const base = document.createElement('div');
    base.style.cssText = `position:absolute;bottom:0;left:${-Math.round(pilarW * 0.4)}px;width:${Math.round(pilarW * 1.8)}px;height:${Math.round(pilarW * 1.2)}px;background:linear-gradient(180deg,#4a1888,#2a0858);border-radius:0 0 2px 2px;`;
    p.appendChild(cap); p.appendChild(base);
    furni.appendChild(p);
  });

  // Janelas
  const winHeight = Math.round((vh - 44) * 0.30);
  const winWid    = Math.round(vw * 0.09);
  const winTop    = Math.round((vh - 44) * 0.18);
  [0.34, 0.56, 0.78].forEach(pct => {
    const lx     = Math.round(vw * pct);
    const wframe = document.createElement('div');
    wframe.style.cssText = `
      position:absolute;top:${winTop}px;left:${lx}px;
      width:${winWid}px;height:${winHeight}px;
      background:linear-gradient(160deg,#0a1828,#0d2040 60%,#081420);
      border:3px solid #3a1870;
      border-radius:${Math.round(winWid * 0.45)}px ${Math.round(winWid * 0.45)}px 2px 2px;
      z-index:2;box-shadow:0 0 16px rgba(80,40,200,.4),inset 0 0 20px rgba(0,0,40,.8);
      overflow:hidden;pointer-events:none;
    `;
    const refl  = document.createElement('div');
    refl.style.cssText  = `position:absolute;top:0;left:10%;width:25%;height:100%;background:linear-gradient(180deg,rgba(255,255,255,.08),transparent 60%);border-radius:inherit;`;
    const crossH = document.createElement('div');
    crossH.style.cssText = `position:absolute;top:${Math.round(winHeight * 0.45)}px;left:0;right:0;height:2px;background:rgba(80,40,180,.5);`;
    const crossV = document.createElement('div');
    crossV.style.cssText = `position:absolute;top:0;bottom:0;left:50%;width:2px;background:rgba(80,40,180,.5);transform:translateX(-50%);`;
    for (let i = 0; i < 5; i++) {
      const star = document.createElement('div');
      const sx   = 10 + Math.floor(Math.sin(i * 137) * 60);
      const sy   = 10 + Math.floor(Math.cos(i * 97)  * 35);
      star.style.cssText = `position:absolute;left:${Math.max(5,Math.min(85,sx))}%;top:${Math.max(5,Math.min(80,sy))}%;width:2px;height:2px;background:rgba(200,220,255,.6);border-radius:50%;`;
      wframe.appendChild(star);
    }
    wframe.appendChild(refl); wframe.appendChild(crossH); wframe.appendChild(crossV);
    furni.appendChild(wframe);
  });

  // Mobiliário esquerdo
  const bancW = Math.round(vw * 0.28);
  furni.appendChild(gi('IMG/BnacadaRes.png', 0, bancW, 4));
  furni.appendChild(gi('IMG/FlorRes.png', bancW + 10, Math.round(vw * 0.04), 4));
  const cadW = Math.round(vw * 0.17);
  furni.appendChild(gi('IMG/CadeirasRes.png', Math.round(vw * 0.36), cadW, 4));
  furni.appendChild(gi('IMG/CadeirasRes.png', Math.round(vw * 0.60), cadW, 4));
  furni.appendChild(gi('IMG/DecoRes.png', Math.round(vw * 0.85), Math.round(vw * 0.13), 4));

  // Hint cardápio
  const hint = document.createElement('div');
  hint.id = 'res-menu-hint'; hint.className = 'hint-jogo';
  hint.style.bottom = '40%'; hint.style.left = '80px';
  hint.textContent  = '[E] Ver Cardápio';
  furni.appendChild(hint);

  // Janelão central
  const midCenter = vw * 1.42;
  const elevWrap  = document.getElementById('floor-elev-wrap');
  if (elevWrap) elevWrap.style.left = (vw * 1.83) + 'px';

  const winW = Math.round(vw * 0.60);
  const win  = document.createElement('div');
  win.style.cssText = `
    position:absolute;top:0;bottom:18%;left:${midCenter - winW / 2}px;width:${winW}px;
    border-left:10px solid #1a0840;border-right:10px solid #1a0840;border-top:10px solid #1a0840;
    overflow:hidden;z-index:2;
    box-shadow:inset 0 0 40px rgba(0,0,40,.6),0 0 30px rgba(0,0,80,.4);
  `;
  const wc = document.createElement('canvas');
  wc.style.cssText = 'width:100%;height:100%;';
  win.appendChild(wc);
  const divider = document.createElement('div');
  divider.style.cssText = 'position:absolute;left:50%;top:0;bottom:0;width:8px;background:#1a0840;transform:translateX(-50%);pointer-events:none;z-index:3;';
  win.appendChild(divider);
  furni.appendChild(win);
  requestAnimationFrame(() => {
    wc.width  = wc.offsetWidth  || 600;
    wc.height = wc.offsetHeight || 500;
    drawRestaurantCity(wc);
  });

  // Lustre
  const lustre = document.createElement('img');
  lustre.src = 'IMG/LustreRes.png';
  lustre.style.cssText = `position:absolute;top:0;left:${midCenter}px;transform:translateX(-50%);width:${Math.round(vw * 0.22)}px;height:auto;image-rendering:pixelated;z-index:6;filter:drop-shadow(0 0 18px rgba(255,180,80,.8));`;
  furni.appendChild(lustre);

  // Cadeiras lounge
  const loungeW = Math.round(vw * 0.14);
  furni.appendChild(gi('IMG/CadeiraLoungerRes.png', midCenter - loungeW - Math.round(vw * 0.05), loungeW, 4));
  furni.appendChild(gi('IMG/CadeiraLoungerRes.png', midCenter + Math.round(vw * 0.05), loungeW, 4));

  // Seção direita
  furni.appendChild(gi('IMG/BarRes.png',      Math.round(vw * 2.05), Math.round(vw * 0.13), 4));
  furni.appendChild(gi('IMG/PortaRes.png',    Math.round(vw * 2.26), Math.round(vw * 0.18), 4));
  furni.appendChild(gi('IMG/BanheiroRes.png', Math.round(vw * 2.58), Math.round(vw * 0.18), 4));

  // Garçom
  const garcom = document.createElement('div');
  garcom.id = 'res-garcom';
  garcom.style.cssText = `position:absolute;bottom:${fgridH}px;left:${Math.round(vw * 2.29)}px;display:none;flex-direction:column;align-items:center;z-index:8;transition:opacity .3s;`;
  garcom.innerHTML = `
    <div id="res-garcom-bandeja" style="margin-bottom:6px;position:relative;">
      <div id="garcom-item-glow" style="position:absolute;inset:-6px;background:rgba(255,200,80,.25);border-radius:50%;animation:neonPulse 1s ease-in-out infinite;pointer-events:none;display:none;"></div>
    </div>
    <img src="IMG/Garcom.png" style="height:clamp(120px,16vw,220px);image-rendering:pixelated;object-fit:contain;">
  `;
  furni.appendChild(garcom);

  // Hints
  const mkHint = (id, txt, left, bottom, className = 'hint-jogo') => {
    const h = document.createElement('div');
    h.id = id; h.className = className;
    h.style.bottom = bottom + 'px'; h.style.left = left + 'px';
    h.textContent = txt;
    return h;
  };

  furni.appendChild(mkHint('garcom-collect-hint', '[E] Pegar pedido! 🍽️',
    Math.round(vw * 2.26), fgridH + Math.round((vh - 44) * 0.30), 'hint-jogo amarelo'));

  const arrow = document.createElement('div');
  arrow.id = 'garcom-arrow';
  arrow.style.cssText = `position:absolute;bottom:${fgridH + Math.round((vh-44)*0.40)}px;left:0;display:none;font-family:'Press Start 2P',monospace;font-size:clamp(10px,1.5vw,18px);color:#ffe066;text-shadow:0 0 10px #ffaa00;z-index:30;pointer-events:none;animation:neonPulse 0.6s ease-in-out infinite;`;
  arrow.textContent = '→ garçom';
  furni.appendChild(arrow);

  furni.appendChild(mkHint('bar-hint',  '[E] Cardápio do bar', Math.round(vw * 2.06), fgridH + Math.round((vh-44) * 0.14)));
  furni.appendChild(mkHint('bath-hint', '[E] Usar banheiro',   Math.round(vw * 2.58), fgridH + Math.round((vh-44) * 0.14)));

  jogadorXAndar = Math.round(window.innerWidth * 1.895);
}

function _estilizarParedeRestaurante() {
  const wall = document.getElementById('floor-wall');
  if (!wall) return;
  wall.style.background  = 'linear-gradient(180deg,#130826 0%,#1e0d3f 40%,#2a1255 70%,#1e0d3f 100%)';
  wall.style.boxShadow   = 'inset 0 -3px 0 rgba(199,125,255,.25)';
  wall.style.borderTop   = '3px solid rgba(155,93,229,.35)';

  const friso = document.createElement('div');
  friso.style.cssText = `
    position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:0;
    background:linear-gradient(180deg,
      transparent 0%,transparent 28%,rgba(155,93,229,.06) 28%,rgba(155,93,229,.06) 29%,
      transparent 29%,transparent 55%,rgba(155,93,229,.06) 55%,rgba(155,93,229,.06) 56%,
      transparent 56%,transparent 78%,rgba(155,93,229,.06) 78%,rgba(155,93,229,.06) 79%,
      transparent 79%);
  `;
  wall.appendChild(friso);

  const rodape = document.createElement('div');
  rodape.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:6px;background:linear-gradient(90deg,rgba(155,93,229,.0),rgba(199,125,255,.5) 30%,rgba(199,125,255,.5) 70%,rgba(155,93,229,.0));pointer-events:none;z-index:1;';
  wall.appendChild(rodape);
}

function atualizarHintsAndar1(vw) {
  const fvW   = document.getElementById('floor-world')?.offsetWidth || vw;
  const bancW = Math.min(380, Math.max(220, fvW * 0.28));

  const toggle = (id, show) => {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'block' : 'none';
  };

  toggle('res-menu-hint',      jogadorXAndar < bancW + 80 && !menuResAberto && !_itemGarcom);
  toggle('bar-hint',           Math.abs(jogadorXAndar - Math.round(vw * 2.05)) < Math.round(vw * 0.12) && !menuBarAberto && !_itemGarcom);
  toggle('garcom-collect-hint',_itemGarcom && Math.abs(jogadorXAndar - Math.round(vw * 2.31)) < Math.round(vw * 0.11));
  toggle('bath-hint',          Math.abs(jogadorXAndar - Math.round(vw * 2.58)) < Math.round(vw * 0.12) && !usandoBanheiro);

  const arrow = document.getElementById('garcom-arrow');
  if (arrow) {
    if (_itemGarcom && Math.abs(jogadorXAndar - Math.round(vw * 2.31)) >= Math.round(vw * 0.11)) {
      arrow.style.display = 'block';
      arrow.style.left    = (jogadorXAndar + 60) + 'px';
    } else {
      arrow.style.display = 'none';
    }
  }
}

// Cardápio — restaurante
function abrirMenuRestaurante() {
  if (menuResAberto) return;
  menuResAberto = true;
  modalAberto   = true;

  const items = [
    { name: '🍕 Pizza',    img: () => 'IMG/Pizza.png'        },
    { name: '🍝 Macarrão', img: () => 'IMG/Macarrao.png'     },
    { name: '🍱 Sushi',    img: () => 'IMG/Sushi.png'        },
    { name: '🥗 Legumes',  img: () => 'IMG/Legumes.png'      },
    { name: '🍔 Combo',    img: () => 'IMG/Combo.png'        },
    { name: '🎂 Bolo',     img: () => 'IMG/Bolo.png'         },
    { name: '🍨 Sorvete',  img: () => 'IMG/Sorvete.png'      },
    { name: '🍮 Pudim',    img: () => 'IMG/Pudim.png'        },
    { name: '🥤 Limonada', img: () => 'IMG/Limonada.png'     },
    { name: '🍊 Suco',     img: () => 'IMG/SucoLaranjaRes.png'},
    { name: '🥤 Soda',     img: () => 'IMG/Refri.png'        },
  ];

  const modal = document.getElementById('res-menu-modal');
  const grid  = document.getElementById('res-menu-grid');
  grid.innerHTML = '';

  items.forEach(item => {
    const el  = document.createElement('div');
    el.className = 'item-menu';
    el.onclick   = () => { fecharMenuRestaurante(); chamarGarcom(item.name, item.img()); };
    const img  = document.createElement('img'); img.src = item.img();
    const lbl  = document.createElement('div'); lbl.className = 'item-menu-label'; lbl.textContent = item.name;
    el.appendChild(img); el.appendChild(lbl);
    grid.appendChild(el);
  });

  modal.classList.add('show');
}

function fecharMenuRestaurante() {
  document.getElementById('res-menu-modal').classList.remove('show');
  menuResAberto = false;
  modalAberto   = false;
}

// Cardápio — bar
function abrirMenuBar() {
  if (menuBarAberto) return;
  menuBarAberto = true;
  modalAberto   = true;

  const items = [
    { name: '🍹 Caipirinha', img: 'IMG/Caipirinha.png' },
    { name: '🌊 Ceu Azul',   img: 'IMG/Ceuazul.png'    },
    { name: '🥃 Morrito',    img: 'IMG/Morrito.png'     },
  ];

  const modal = document.getElementById('res-menu-modal');
  modal.querySelector('.modal-title').textContent = '🍹 Cardápio do Bar';

  const grid = document.getElementById('res-menu-grid');
  grid.innerHTML = '';

  items.forEach(item => {
    const el  = document.createElement('div');
    el.className = 'item-menu';
    el.onclick   = () => { fecharMenuBar(); chamarGarcom(item.name, item.img); };
    const img  = document.createElement('img'); img.src = item.img;
    const lbl  = document.createElement('div'); lbl.className = 'item-menu-label'; lbl.textContent = item.name;
    el.appendChild(img); el.appendChild(lbl);
    grid.appendChild(el);
  });

  modal.classList.add('show');
}

function fecharMenuBar() {
  document.getElementById('res-menu-modal').classList.remove('show');
  document.getElementById('res-menu-modal').querySelector('.modal-title').textContent = '🍽️ Cardápio do Restaurante';
  menuBarAberto = false;
  modalAberto   = false;
}

function chamarGarcom(itemName, itemImg) {
  const garcom  = document.getElementById('res-garcom');
  const bandeja = document.getElementById('res-garcom-bandeja');
  if (!garcom || !bandeja) return;

  const glow = document.getElementById('garcom-item-glow');
  bandeja.innerHTML = '';
  if (glow) bandeja.appendChild(glow);

  if (itemImg) {
    const bi = document.createElement('img');
    bi.src = itemImg;
    bi.style.cssText = 'width:clamp(34px,4.5vw,56px);height:auto;image-rendering:pixelated;position:relative;z-index:1;';
    bandeja.appendChild(bi);
  } else {
    const sp = document.createElement('span');
    sp.textContent = itemName.split(' ')[0];
    sp.style.cssText = 'font-size:clamp(22px,3vw,38px);position:relative;z-index:1;';
    bandeja.appendChild(sp);
  }

  if (glow) glow.style.display = 'block';
  garcom.style.display = 'flex';

  notificar('🧑‍🍳 Garçom chegou na porta! Vá buscar com [E]');
  tocarTom(523, 0.08);
  setTimeout(() => tocarTom(659, 0.08), 80);
  setTimeout(() => tocarTom(784, 0.10), 160);

  _itemGarcom = { name: itemName, img: itemImg || null };
}

function pegarItemGarcom() {
  if (!_itemGarcom) return;

  const garcom = document.getElementById('res-garcom');
  if (garcom) garcom.style.display = 'none';

  const { name, img: src } = _itemGarcom;
  itensStand['waiter'] = src;
  itemNaMao = 'waiter';

  let pi = document.getElementById('floor-item');
  const fp = document.getElementById('floor-player');
  if (!pi && fp) {
    pi = document.createElement('img');
    pi.id         = 'floor-item';
    pi.style.cssText = 'position:absolute;bottom:52%;right:-42%;width:36%;height:auto;image-rendering:pixelated;display:none;z-index:16;pointer-events:all;cursor:pointer;';
    pi.onclick    = e => { e.stopPropagation(); consumirItem(); };
    fp.appendChild(pi);
  }

  if (pi && src) { pi.src = src; pi.style.display = 'block'; }

  document.getElementById('garcom-item-glow')?.style && (document.getElementById('garcom-item-glow').style.display = 'none');
  document.getElementById('garcom-arrow')     ?.style && (document.getElementById('garcom-arrow').style.display = 'none');

  notificar(`Você pegou: ${name}! Clique no personagem pra consumir 😋`);
  tocarTom(440, 0.06);
  _itemGarcom = null;
}

function usarBanheiro() {
  if (usandoBanheiro) return;
  usandoBanheiro = true;

  document.getElementById('bath-hint')?.style && (document.getElementById('bath-hint').style.display = 'none');

  const overlay = document.createElement('div');
  overlay.id    = 'bath-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(3px);';
  overlay.innerHTML = `
    <div style="background:linear-gradient(180deg,#140030,#0a001a);border:3px solid #c77dff;border-radius:12px;padding:32px 48px;text-align:center;font-family:'Press Start 2P',monospace;box-shadow:0 0 40px rgba(199,125,255,.4);">
      <div style="font-size:clamp(24px,4vw,56px);margin-bottom:12px;">🚽</div>
      <div style="color:#f0e6ff;font-size:clamp(7px,1vw,11px);margin-bottom:8px;">Usando o banheiro...</div>
      <div style="width:200px;height:8px;background:rgba(255,255,255,.15);border-radius:4px;margin:10px auto 0;overflow:hidden;">
        <div id="bath-bar" style="height:100%;width:0%;background:#c77dff;border-radius:4px;transition:width 3s linear;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const bar = document.getElementById('bath-bar');
    if (bar) bar.style.width = '100%';
  }));

  tocarTom(330, 0.12);
  _timerBanheiro = setTimeout(() => {
    overlay.remove();
    usandoBanheiro = false;
    notificar('Banheiro usado! Mãos limpas');
    tocarTom(523, 0.08);
    setTimeout(() => tocarTom(659, 0.08), 80);
    setTimeout(() => tocarTom(784, 0.10), 160);
  }, 3000);
}

// -----------------------------------------------------------------------------
// ACADEMIA — ANDAR 2
// -----------------------------------------------------------------------------

function construirAndar2(furni) {
  furni.innerHTML = '';
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const fi = document.getElementById('floor-inner');
  if (fi) fi.style.width = (vw * 2.8) + 'px';
  furni.style.cssText = `position:absolute;inset:0;width:${vw * 2.8}px;`;

  _estilizarParedeAcademia();

  const fg = document.getElementById('floor-fgrid');
  if (fg) {
    fg.style.background = 'repeating-linear-gradient(90deg,#0a0a14 0px,#0a0a14 39px,#141428 39px,#141428 40px)';
    fg.style.borderTop  = '3px solid rgba(255,50,80,.4)';
  }

  const fgridH = Math.round((vh - 44) * 0.18);
  const wallH2 = Math.round((vh - 44) * 0.82);

  const gi = (src, leftPx, widthPx, z = 4) => {
    const e = document.createElement('img');
    e.src = src;
    e.style.cssText = `position:absolute;bottom:${fgridH}px;left:${leftPx}px;width:${widthPx}px;height:auto;image-rendering:pixelated;z-index:${z};`;
    return e;
  };

  const mkHint = (id, txt, leftPx, bottomPx) => {
    const h = document.createElement('div');
    h.id = id; h.className = 'hint-jogo';
    h.style.bottom = bottomPx + 'px'; h.style.left = leftPx + 'px';
    h.textContent = txt;
    return h;
  };

  // Espelho de parede
  const mirrorW    = Math.round(vw * 1.62);
  const mirrorWrap = document.createElement('div');
  mirrorWrap.style.cssText = `position:absolute;top:0;left:${Math.round(vw * 0.02)}px;width:${mirrorW}px;height:${wallH2}px;z-index:1;pointer-events:none;overflow:hidden;`;
  const mirror = document.createElement('div');
  mirror.style.cssText = `position:absolute;inset:0;background:linear-gradient(108deg,rgba(220,235,255,.13) 0%,rgba(180,200,255,.07) 35%,rgba(200,220,255,.11) 60%,rgba(160,190,255,.05) 100%);border-right:3px solid rgba(200,215,255,.4);border-left:3px solid rgba(200,215,255,.2);`;
  [
    `position:absolute;top:0;left:8%;width:10%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent);transform:skewX(-6deg);`,
    `position:absolute;top:0;left:28%;width:4%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent);transform:skewX(-6deg);`,
    `position:absolute;inset:3px;border:1px solid rgba(200,220,255,.15);pointer-events:none;`,
    `position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(200,220,255,.1);transform:translateY(-50%);`,
  ].forEach(css => { const d = document.createElement('div'); d.style.cssText = css; mirror.appendChild(d); });
  mirrorWrap.appendChild(mirror);
  furni.appendChild(mirrorWrap);

  // Equipamentos
  GYM_EQUIP.forEach(eq => {
    const img = gi(eq.src, Math.round(vw * eq.x), Math.round(vw * eq.w), 4);
    img.id = 'gym-eq-' + eq.id;
    furni.appendChild(img);
    furni.appendChild(mkHint('gym-hint-' + eq.id, '[E] Treinar: ' + eq.label, Math.round(vw * eq.x), fgridH + Math.round((vh - 44) * 0.12)));
  });

  const elevWrap = document.getElementById('floor-elev-wrap');
  if (elevWrap) elevWrap.style.left = (vw * 1.88) + 'px';

  // Mundo maior para a seção indoor + terraço
  const fi3 = document.getElementById('floor-inner');
  if (fi3) fi3.style.width = (vw * 3.6) + 'px';
  furni.style.width = (vw * 3.6) + 'px';

  // Seção indoor
  const indoorStart = Math.round(vw * 2.22);
  const indoorW     = Math.round(vw * 0.55);

  const indoorWall = document.createElement('div');
  indoorWall.style.cssText = `position:absolute;top:0;left:${indoorStart}px;width:${indoorW}px;height:${wallH2}px;background:linear-gradient(180deg,#0d0d1a 0%,#1a1a2e 50%,#0d0d1a 100%);z-index:1;pointer-events:none;overflow:hidden;`;
  const iStripe = document.createElement('div');
  iStripe.style.cssText = 'position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0px,transparent 58px,rgba(255,50,80,.03) 58px,rgba(255,50,80,.03) 60px);';
  const iRodape = document.createElement('div');
  iRodape.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:5px;background:linear-gradient(90deg,transparent,rgba(255,50,80,.5) 30%,rgba(255,50,80,.5) 70%,transparent);';
  indoorWall.appendChild(iStripe); indoorWall.appendChild(iRodape);
  furni.appendChild(indoorWall);

  // Bebedouro
  const bebW2 = Math.round(vw * 0.09);
  const _bebX = indoorStart + Math.round(indoorW * 0.12);
  GYM_BEB_X = _bebX; GYM_BEB_W = bebW2;
  const beb2 = gi('IMG/Bebedouro-acdm.png', _bebX, bebW2, 5);
  beb2.id = 'gym-sp-bebedouro';
  furni.appendChild(beb2);
  furni.appendChild(mkHint('gym-hint-bebedouro', '[E] Beber água', _bebX, fgridH + Math.round((vh - 44) * 0.12)));

  // Vestiário
  const vestW2 = Math.round(vw * 0.22);
  const _vestX = indoorStart + Math.round(indoorW * 0.52);
  GYM_VEST_X = _vestX; GYM_VEST_W = vestW2;
  const vest2 = gi('IMG/Vestiario-acmd.png', _vestX, vestW2, 5);
  vest2.id = 'gym-sp-vestiario';
  furni.appendChild(vest2);
  furni.appendChild(mkHint('gym-hint-vestiario', '[E] Usar: Vestiário', _vestX, fgridH + Math.round((vh - 44) * 0.12)));

  // Placa GYM
  const signW = Math.round(indoorW * 0.35);
  const sign  = document.createElement('div');
  sign.style.cssText = `position:absolute;top:${Math.round(wallH2*0.08)}px;left:${indoorStart+Math.round(indoorW*0.28)}px;width:${signW}px;padding:8px 0;background:#111;border:3px solid #ff3250;border-radius:4px;text-align:center;font-family:'Press Start 2P',monospace;font-size:clamp(6px,.85vw,11px);color:#ff3250;letter-spacing:2px;text-shadow:0 0 10px #ff3250,0 0 22px rgba(255,50,80,.5);z-index:3;pointer-events:none;box-shadow:0 0 18px rgba(255,50,80,.35);`;
  sign.textContent = 'GYM';
  furni.appendChild(sign);

  // Janelas indoor
  const winH2   = Math.round(wallH2 * 0.28);
  const winW2   = Math.round(indoorW * 0.18);
  const winTop2 = Math.round(wallH2 * 0.22);
  [0.04, 0.60].forEach(pct => {
    const wf = document.createElement('div');
    wf.style.cssText = `position:absolute;top:${winTop2}px;left:${indoorStart+Math.round(indoorW*pct)}px;width:${winW2}px;height:${winH2}px;background:linear-gradient(160deg,#0a1828,#0d2040);border:3px solid #2a1870;border-radius:${Math.round(winW2*0.4)}px ${Math.round(winW2*0.4)}px 2px 2px;z-index:2;box-shadow:0 0 12px rgba(80,40,200,.3),inset 0 0 16px rgba(0,0,40,.8);overflow:hidden;pointer-events:none;`;
    const wr  = document.createElement('div'); wr.style.cssText  = 'position:absolute;top:0;left:10%;width:20%;height:100%;background:linear-gradient(90deg,rgba(255,255,255,.06),transparent);';
    const wcH = document.createElement('div'); wcH.style.cssText = `position:absolute;top:48%;left:0;right:0;height:2px;background:rgba(60,30,160,.5);`;
    const wcV = document.createElement('div'); wcV.style.cssText = `position:absolute;top:0;bottom:0;left:50%;width:2px;background:rgba(60,30,160,.5);transform:translateX(-50%);`;
    wf.appendChild(wr); wf.appendChild(wcH); wf.appendChild(wcV);
    furni.appendChild(wf);
  });

  // Neons
  [
    { x: indoorStart + Math.round(indoorW * 0.02), color: '#ff3250', text: 'FORCE' },
    { x: indoorStart + Math.round(indoorW * 0.72), color: '#00b4d8', text: 'POWER' },
  ].forEach(n => {
    const nl = document.createElement('div');
    nl.style.cssText = `position:absolute;top:${Math.round(wallH2*0.62)}px;left:${n.x}px;font-family:'Press Start 2P',monospace;font-size:clamp(5px,.75vw,10px);color:${n.color};text-shadow:0 0 8px ${n.color},0 0 18px ${n.color}66;letter-spacing:3px;z-index:3;pointer-events:none;animation:neonPulse 2s ease-in-out infinite;`;
    nl.textContent = n.text;
    furni.appendChild(nl);
  });

  // Divisória
  const dividerX = indoorStart + indoorW;
  const divWall  = document.createElement('div');
  divWall.style.cssText = `position:absolute;top:0;left:${dividerX-6}px;width:12px;height:${wallH2}px;background:linear-gradient(90deg,#1a1a2e,#2a2a4a,#1a1a2e);z-index:6;pointer-events:none;box-shadow:2px 0 8px rgba(0,0,0,.5);`;
  furni.appendChild(divWall);

  // Terraço
  _construirTerraco(furni, dividerX + 6, vw, vh, fgridH, wallH2);

  jogadorXAndar = Math.round(window.innerWidth * 1.945);
}

function _estilizarParedeAcademia() {
  const wall = document.getElementById('floor-wall');
  if (!wall) return;
  wall.style.background = 'linear-gradient(180deg,#0d0d1a 0%,#1a1a2e 50%,#0d0d1a 100%)';
  const stripe = document.createElement('div');
  stripe.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;background:repeating-linear-gradient(180deg,transparent 0px,transparent 58px,rgba(255,50,80,.04) 58px,rgba(255,50,80,.04) 60px);';
  wall.appendChild(stripe);
  const rodape = document.createElement('div');
  rodape.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:5px;background:linear-gradient(90deg,transparent,rgba(255,50,80,.6) 30%,rgba(255,50,80,.6) 70%,transparent);pointer-events:none;';
  wall.appendChild(rodape);
}

function _construirTerraco(furni, terraceStart, vw, vh, fgridH, wallH2) {
  const terraceW = Math.round(vw * 0.90);

  // Céu noturno
  const sky = document.createElement('div');
  sky.style.cssText = `position:absolute;top:0;left:${terraceStart}px;width:${terraceW}px;height:${wallH2}px;background:linear-gradient(180deg,#03000e 0%,#080222 60%,#0c0430 100%);z-index:1;pointer-events:none;overflow:hidden;`;

  // Estrelas em grade
  const cols = 10, rows = 6;
  const cellW = Math.floor(terraceW / cols);
  const cellH = Math.floor(wallH2 * 0.65 / rows);
  let si = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      si++;
      const jx     = ((si * 167 + col * 83 + row * 53) % Math.max(1, cellW - 4));
      const jy     = ((si * 131 + col * 61 + row * 97) % Math.max(1, cellH - 4));
      const bright = 0.4 + ((si * 79) % 55) / 100;
      const sz     = si % 9 === 0 ? 2 : 1;
      const s = document.createElement('div');
      s.className = 'estrela';
      s.style.left       = (col * cellW + jx + 2) + 'px';
      s.style.top        = (row * cellH + jy + 2) + 'px';
      s.style.width      = sz + 'px';
      s.style.height     = sz + 'px';
      s.style.background = `rgba(255,255,255,${bright.toFixed(2)})`;
      sky.appendChild(s);
    }
  }

  // Lua crescente
  const mSz    = Math.round(terraceW * 0.07);
  const moon   = document.createElement('div');
  moon.style.cssText = `position:absolute;right:${Math.round(terraceW*0.08)}px;top:${Math.round(wallH2*0.07)}px;width:${mSz}px;height:${mSz}px;border-radius:50%;background:#d8eaff;box-shadow:0 0 14px rgba(200,225,255,.4);overflow:hidden;`;
  const moonCut = document.createElement('div');
  moonCut.className  = 'lua-crescente-corte';
  moonCut.style.background = '#080222';
  moon.appendChild(moonCut);
  sky.appendChild(moon);
  furni.appendChild(sky);

  // Deck
  const deckH = Math.round((vh - 44) * 0.03);
  const deck  = document.createElement('div');
  deck.style.cssText = `position:absolute;bottom:${fgridH}px;left:${terraceStart}px;width:${terraceW}px;height:${deckH}px;background:repeating-linear-gradient(90deg,#7a4e2d 0px,#7a4e2d 17px,#6a3e1e 17px,#6a3e1e 19px);border-top:2px solid #9a6840;z-index:5;pointer-events:none;`;
  furni.appendChild(deck);

  // Corrimão
  const railH   = Math.round((vh - 44) * 0.16);
  const railBot = fgridH + deckH;
  [terraceStart, terraceStart + terraceW - 4].forEach(lx => {
    const post = document.createElement('div');
    post.style.cssText = `position:absolute;bottom:${railBot}px;left:${lx}px;width:4px;height:${railH}px;background:#999;z-index:6;pointer-events:none;`;
    furni.appendChild(post);
  });
  const railBar = document.createElement('div');
  railBar.style.cssText = `position:absolute;bottom:${railBot + railH - 3}px;left:${terraceStart}px;width:${terraceW}px;height:4px;background:#bbb;z-index:6;pointer-events:none;box-shadow:0 2px 4px rgba(0,0,0,.3);`;
  furni.appendChild(railBar);
  const nBal = Math.floor(terraceW / 20);
  for (let i = 1; i < nBal; i++) {
    const bal = document.createElement('div');
    bal.style.cssText = `position:absolute;bottom:${railBot}px;left:${terraceStart + Math.round(i * (terraceW / nBal))}px;width:2px;height:${railH}px;background:rgba(200,200,200,.5);z-index:6;pointer-events:none;`;
    furni.appendChild(bal);
  }

  // Piscina
  const poolW   = Math.round(terraceW * 0.68);
  const poolH   = Math.round((vh - 44) * 0.30);
  const poolL   = terraceStart + Math.round((terraceW - poolW) / 2);
  const poolBot = fgridH + deckH + Math.round((vh - 44) * 0.02);

  const poolEdge = document.createElement('div');
  poolEdge.style.cssText = `position:absolute;bottom:${poolBot-8}px;left:${poolL-8}px;width:${poolW+16}px;height:${poolH+16}px;background:#b8c8d8;border-radius:6px;z-index:4;pointer-events:none;box-shadow:0 0 24px rgba(0,100,200,.25),0 4px 12px rgba(0,0,0,.4);`;
  furni.appendChild(poolEdge);

  const poolCv = document.createElement('canvas');
  poolCv.id = 'gym-pool-canvas';
  poolCv.style.cssText = `position:absolute;bottom:${poolBot}px;left:${poolL}px;width:${poolW}px;height:${poolH}px;border-radius:4px;z-index:5;pointer-events:none;`;
  furni.appendChild(poolCv);

  function animatePool() {
    if (!andarAberto || andarAtual !== 2) return;
    const cv = document.getElementById('gym-pool-canvas');
    if (!cv) return;
    if (cv.width !== cv.offsetWidth) { cv.width = cv.offsetWidth || poolW; cv.height = cv.offsetHeight || poolH; }
    const ctx = cv.getContext('2d');
    const t   = Date.now() / 1400;
    const g   = ctx.createLinearGradient(0, 0, 0, cv.height);
    g.addColorStop(0,   '#0d4f8a');
    g.addColorStop(0.5, '#0a3a6e');
    g.addColorStop(1,   '#061e40');
    ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1.5;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, cv.height * i / 4); ctx.lineTo(cv.width, cv.height * i / 4); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(100,200,255,.3)'; ctx.lineWidth = 1.5;
    for (let w = 0; w < 3; w++) {
      ctx.beginPath();
      for (let x = 0; x <= cv.width; x += 2) {
        const y = 4 + w * 8 + Math.sin(x / cv.width * Math.PI * 6 + t + w * 1.2) * 3;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    const rf = ctx.createLinearGradient(cv.width * 0.55, 0, cv.width * 0.85, 0);
    rf.addColorStop(0, 'transparent'); rf.addColorStop(0.5, 'rgba(200,225,255,.1)'); rf.addColorStop(1, 'transparent');
    ctx.fillStyle = rf; ctx.fillRect(0, 0, cv.width, cv.height * 0.3);
    requestAnimationFrame(animatePool);
  }
  requestAnimationFrame(() => requestAnimationFrame(animatePool));

  const poolHintEl = document.createElement('div');
  poolHintEl.id = 'gym-hint-pool';
  poolHintEl.style.cssText = `position:absolute;bottom:${poolBot+poolH+10}px;left:${poolL}px;background:#fff;border:2px solid #333;color:#111;font-family:'Press Start 2P',monospace;font-size:clamp(4px,.52vw,6px);padding:4px 10px;border-radius:4px;white-space:nowrap;box-shadow:2px 2px 0 #333;display:none;z-index:30;pointer-events:none;`;
  poolHintEl.textContent = '[E] Nadar';
  furni.appendChild(poolHintEl);
}

function atualizarHintsAcademia(vw) {
  const toggle = (id, show) => {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'block' : 'none';
  };

  GYM_EQUIP.forEach(eq => {
    const cx = Math.round(vw * eq.x) + Math.round(vw * eq.w / 2);
    toggle('gym-hint-' + eq.id, Math.abs(jogadorXAndar - cx) < Math.round(vw * 0.10));
  });

  toggle('gym-hint-bebedouro', GYM_BEB_X > 0 && Math.abs(jogadorXAndar - (GYM_BEB_X + GYM_BEB_W / 2)) < Math.round(vw * 0.14));
  toggle('gym-hint-vestiario', GYM_VEST_X > 0 && Math.abs(jogadorXAndar - (GYM_VEST_X + GYM_VEST_W / 2)) < Math.round(vw * 0.18));

  const poolHint = document.getElementById('gym-hint-pool');
  const poolCv   = document.getElementById('gym-pool-canvas');
  if (poolHint && poolCv) {
    const pL = parseInt(poolCv.style.left) || 0;
    const pW = poolCv.offsetWidth || 300;
    toggle('gym-hint-pool', jogadorXAndar > pL - 60 && jogadorXAndar < pL + pW + 60);
  }
}

function interagirAcademia(vw) {
  const range = Math.round(vw * 0.13);

  if (GYM_BEB_X > 0 && Math.abs(jogadorXAndar - (GYM_BEB_X + GYM_BEB_W / 2)) < range)       { gymDrinkWater(); return; }
  if (GYM_VEST_X > 0 && Math.abs(jogadorXAndar - (GYM_VEST_X + GYM_VEST_W / 2)) < range + 60) { gymOpenLocker(); return; }

  const poolCv = document.getElementById('gym-pool-canvas');
  if (poolCv) {
    const pL = parseFloat(poolCv.style.left)  || 0;
    const pW = parseFloat(poolCv.style.width) || 300;
    if (jogadorXAndar > pL - 80 && jogadorXAndar < pL + pW + 80) { gymSwim(); return; }
  }

  for (const eq of GYM_EQUIP) {
    const cx = Math.round(vw * eq.x) + Math.round(vw * eq.w / 2);
    if (Math.abs(jogadorXAndar - cx) < range) { gymTrain(eq); return; }
  }

  notificar('Use [E] perto de um equipamento, bebedouro, vestiário ou piscina!');
}

function mostrarTelaAcademia(title, durationMs, onDone, color = '#ff3250') {
  modalAberto = true;
  const ov  = document.createElement('div');
  ov.className = 'overlay-fade';
  const rgb = color === '#ff3250' ? '255,50,80' : color === '#00b4d8' ? '0,180,216' : '199,125,255';
  const box = document.createElement('div');
  box.style.cssText = `background:linear-gradient(180deg,#0a0a1a,#050510);border:3px solid ${color};border-radius:12px;padding:28px 44px;text-align:center;font-family:'Press Start 2P',monospace;box-shadow:0 0 40px rgba(${rgb},.4);min-width:260px;`;
  box.innerHTML = `
    <div style="font-size:clamp(6px,.9vw,10px);color:${color};margin-bottom:18px;letter-spacing:2px;text-shadow:0 0 10px ${color};">${title}</div>
    <div style="width:200px;height:8px;background:rgba(255,255,255,.08);border-radius:4px;margin:0 auto;overflow:hidden;">
      <div id="gym-bar" style="height:100%;width:0%;background:linear-gradient(90deg,${color},${color}88);border-radius:4px;transition:width ${durationMs}ms linear;"></div>
    </div>
  `;
  ov.appendChild(box);
  document.body.appendChild(ov);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const bar = document.getElementById('gym-bar');
    if (bar) bar.style.width = '100%';
  }));
  setTimeout(() => { ov.remove(); modalAberto = false; if (onDone) onDone(); }, durationMs);
}

function gymSwim() {
  if (!andarAberto || andarAtual !== 2) return;
  const fp     = document.getElementById('floor-player');
  const poolCv = document.getElementById('gym-pool-canvas');
  if (!fp || !poolCv) return;

  const poolL2   = parseInt(poolCv.style.left)    || 0;
  const poolW2   = poolCv.offsetWidth              || 300;
  const poolBot2 = parseInt(poolCv.style.bottom)  || 0;
  const swimX    = poolL2 + Math.round(poolW2 * 0.35);
  const origX    = jogadorXAndar;
  const origBott = fp.style.bottom || '';

  jogadorXAndar        = swimX;
  fp.style.left        = swimX + 'px';
  fp.style.bottom      = (poolBot2 + Math.round(poolCv.offsetHeight * 0.45)) + 'px';
  fp.style.position    = 'absolute';

  let swimT = 0;
  const swimAnim = setInterval(() => {
    swimT += 0.15;
    fp.style.left   = (swimX + Math.sin(swimT) * 18) + 'px';
    fp.style.bottom = (poolBot2 + Math.round(poolCv.offsetHeight * 0.45) + Math.sin(swimT * 2) * 4) + 'px';
  }, 30);

  notificar('Nadando na piscina...');
  mostrarTelaAcademia('PISCINA — NADAR', 3500, () => {
    clearInterval(swimAnim);
    jogadorXAndar   = origX;
    fp.style.left   = origX + 'px';
    fp.style.bottom = origBott;
    notificar('Que refrescante!');
  });
}

function gymTrain(eq) {
  notificar(eq.anim);
  mostrarTelaAcademia(eq.label.toUpperCase(), 3000, () => notificar('Treino concluído!'));
}

function gymDrinkWater() {
  notificar('Bebendo água...');
  mostrarTelaAcademia('BEBEDOURO — BEBER ÁGUA', 2000, () => notificar('Hidratado!'), '#00b4d8');
}

function gymOpenLocker() {
  if (menuVestiarioAberto) return;
  menuVestiarioAberto = true;
  modalAberto         = true;

  const ov  = document.createElement('div');
  ov.id     = 'locker-modal';
  ov.className = 'overlay-fade';
  const box = document.createElement('div');
  box.className = 'modal-vestiario';
  box.innerHTML = `
    <div style="font-size:clamp(7px,1vw,11px);color:#c77dff;margin-bottom:20px;letter-spacing:2px;">VESTIÁRIO</div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <button onclick="gymLockerAction('roupa')"    class="btn-vestiario vermelho">Trocar Roupa</button>
      <button onclick="gymLockerAction('banho')"    class="btn-vestiario azul">Tomar Banho</button>
      <button onclick="gymLockerAction('banheiro')" class="btn-vestiario lilas">Banheiro</button>
      <button onclick="gymCloseLocker()"            class="btn-vestiario fechar">✕ Fechar</button>
    </div>
  `;
  ov.appendChild(box);
  document.body.appendChild(ov);
}

function gymCloseLocker() {
  document.getElementById('locker-modal')?.remove();
  menuVestiarioAberto = false;
  modalAberto         = false;
}

function gymLockerAction(type) {
  gymCloseLocker();
  const cfg = {
    roupa:    { title: 'TROCANDO ROUPA', dur: 2500, msg: 'Roupa trocada!', color: '#ff3250' },
    banho:    { title: 'TOMANDO BANHO',  dur: 4000, msg: 'Limpinho!',     color: '#00b4d8' },
    banheiro: { title: 'BANHEIRO',       dur: 3000, msg: 'Mãos limpas!',   color: '#c77dff' },
  }[type];
  mostrarTelaAcademia(cfg.title, cfg.dur, () => notificar(cfg.msg), cfg.color);
}

// -----------------------------------------------------------------------------
// APARTAMENTOS — ANDAR 3
// -----------------------------------------------------------------------------

function construirAndar3(furni) {
  furni.innerHTML = '';
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const worldW = Math.round(vw * 1.3);
  const fi     = document.getElementById('floor-inner');
  if (fi) fi.style.width = worldW + 'px';
  furni.style.cssText = `position:absolute;inset:0;width:${worldW}px;`;

  const fgridH = Math.round((vh - 44) * 0.18);
  const wallH  = Math.round((vh - 44) * 0.82);

  const gi = (src, lx, w, z = 4) => {
    const e = document.createElement('img');
    e.src = src;
    e.style.cssText = `position:absolute;bottom:${fgridH}px;left:${lx}px;width:${w}px;height:auto;image-rendering:pixelated;z-index:${z};`;
    return e;
  };
  const mkHint = (id, txt, lx, bot) => {
    const h = document.createElement('div');
    h.id = id;
    h.style.cssText = `position:absolute;bottom:${bot}px;left:${lx}px;background:#fff;border:2px solid #333;color:#111;font-family:'Press Start 2P',monospace;font-size:clamp(4px,.52vw,6px);padding:4px 10px;border-radius:4px;white-space:nowrap;box-shadow:2px 2px 0 #333;display:none;z-index:30;pointer-events:none;`;
    h.textContent = txt;
    return h;
  };

  _estilizarParedeApartamento(wallH, fgridH);

  // Luminárias
  [0.28, 0.72].forEach(pct => {
    const lx   = Math.round(worldW * pct);
    const lamp = document.createElement('div');
    lamp.style.cssText = `position:absolute;top:0;left:${lx}px;transform:translateX(-50%);z-index:3;pointer-events:none;display:flex;flex-direction:column;align-items:center;`;
    const rod  = document.createElement('div'); rod.style.cssText  = 'width:2px;height:clamp(16px,2.8vh,34px);background:rgba(199,125,255,.22);';
    const bulb = document.createElement('div'); bulb.style.cssText = 'width:clamp(9px,1.4vw,18px);height:clamp(5px,.8vh,9px);background:linear-gradient(180deg,#ffe8a0,#ffd040);border-radius:0 0 50% 50%;box-shadow:0 0 14px rgba(255,210,80,.75),0 0 32px rgba(255,180,50,.3);';
    lamp.appendChild(rod); lamp.appendChild(bulb);
    furni.appendChild(lamp);
  });

  // Tapete corredor
  const carpet = document.createElement('div');
  carpet.style.cssText = `position:absolute;bottom:${fgridH}px;left:0;width:${worldW}px;height:${Math.round((vh-44)*0.030)}px;background:linear-gradient(90deg,#3a0e6a 0%,#52189a 20%,#5a20aa 50%,#52189a 80%,#3a0e6a 100%);border-top:2px solid rgba(199,125,255,.45);z-index:2;pointer-events:none;`;
  furni.appendChild(carpet);

  // Número do andar
  const signAndar = document.createElement('div');
  signAndar.style.cssText = `position:absolute;top:${Math.round(wallH*0.04)}px;left:50%;transform:translateX(-50%);font-family:'Press Start 2P',monospace;font-size:clamp(5px,.75vw,9px);color:rgba(199,125,255,.3);letter-spacing:5px;z-index:3;pointer-events:none;`;
  signAndar.textContent = '3º ANDAR';
  furni.appendChild(signAndar);

  // Portas
  const doorW = Math.round(vw * 0.14);
  APT_DOOR_W  = doorW;

  const doorPositions = [0.30, 0.58, 0.84];
  const doorDefs      = [
    { num: 303, src: 'IMG/porta-301-apt.png' },
    { num: 302, src: 'IMG/porta-302-apt.png' },
    { num: 301, src: 'IMG/porta-303-apt.png' },
  ];

  doorDefs.forEach((d, i) => {
    const lx = Math.round(worldW * doorPositions[i] - doorW / 2);
    APT_DOOR_X[d.num] = lx;

    const img = gi(d.src, lx, doorW, 5);
    img.id = 'apt-door-' + d.num;
    furni.appendChild(img);

    // Tapete da porta
    const mat = document.createElement('div');
    mat.style.cssText = `position:absolute;bottom:${fgridH}px;left:${lx-10}px;width:${doorW+20}px;height:${Math.round((vh-44)*0.026)}px;background:linear-gradient(90deg,transparent,rgba(100,40,180,.5) 20%,rgba(140,60,220,.65) 50%,rgba(100,40,180,.5) 80%,transparent);border-radius:4px 4px 0 0;z-index:4;pointer-events:none;`;
    furni.appendChild(mat);

    // Número na parede
    const numTag = document.createElement('div');
    numTag.style.cssText = `position:absolute;bottom:${fgridH+Math.round(wallH*0.60)}px;left:${lx+Math.round(doorW*.5)}px;transform:translateX(-50%);font-family:'Press Start 2P',monospace;font-size:clamp(4px,.55vw,7px);color:rgba(199,125,255,.45);z-index:4;pointer-events:none;`;
    numTag.textContent = d.num;
    furni.appendChild(numTag);

    // Destaque 302
    if (d.num === 302) {
      const badge = document.createElement('div');
      badge.style.cssText = `position:absolute;bottom:${fgridH+Math.round(wallH*0.67)}px;left:${lx+Math.round(doorW*.5)}px;transform:translateX(-50%);padding:3px 8px;background:#0e0028;border:2px solid #c77dff;border-radius:4px;font-family:'Press Start 2P',monospace;font-size:clamp(3px,.4vw,5px);color:#c77dff;white-space:nowrap;letter-spacing:1px;z-index:6;box-shadow:0 0 12px rgba(199,125,255,.6);pointer-events:none;`;
      badge.textContent = '✦ SEU APT ✦';
      furni.appendChild(badge);

      const arrowApt = document.createElement('div');
      arrowApt.style.cssText = `position:absolute;bottom:${fgridH+Math.round(wallH*0.76)}px;left:${lx+Math.round(doorW*.5)}px;transform:translateX(-50%);font-size:clamp(10px,1.5vw,18px);color:#c77dff;z-index:6;pointer-events:none;text-shadow:0 0 10px #c77dff;animation:neonPulse 0.9s ease-in-out infinite;`;
      arrowApt.textContent = '▼';
      furni.appendChild(arrowApt);
    }

    furni.appendChild(mkHint(
      'apt-hint-' + d.num,
      d.num === 302 ? '[E] Entrar — Apto 302' : '[E] Bater na porta ' + d.num,
      lx,
      fgridH + Math.round((vh - 44) * 0.115),
    ));
  });

  const elevWrap = document.getElementById('floor-elev-wrap');
  if (elevWrap) { elevWrap.style.left = (vw * 0.04) + 'px'; elevWrap.style.display = 'block'; }

  jogadorXAndar = Math.round(vw * 0.20);
}

function _estilizarParedeApartamento(wallH, fgridH) {
  const wall = document.getElementById('floor-wall');
  if (!wall) return;
  wall.style.background = 'linear-gradient(180deg,#160b28 0%,#1e1035 60%,#160b28 100%)';

  const wp = document.createElement('div');
  wp.style.cssText = 'position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0px,transparent 58px,rgba(199,125,255,.03) 58px,rgba(199,125,255,.03) 60px);pointer-events:none;';
  wall.appendChild(wp);

  const frisoTop = document.createElement('div');
  frisoTop.style.cssText = `position:absolute;top:${Math.round(wallH*0.12)}px;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(199,125,255,.22) 15%,rgba(199,125,255,.22) 85%,transparent);pointer-events:none;`;
  wall.appendChild(frisoTop);

  const frisoBot = document.createElement('div');
  frisoBot.style.cssText = `position:absolute;bottom:${fgridH+2}px;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(199,125,255,.28) 15%,rgba(199,125,255,.28) 85%,transparent);pointer-events:none;`;
  wall.appendChild(frisoBot);
}

function atualizarHintsAndar3(vw) {
  if (_dentroApt302) { hintsApt302(vw); return; }
  [301, 302, 303].forEach(num => {
    const h  = document.getElementById('apt-hint-' + num);
    if (!h) return;
    const cx = APT_DOOR_X[num] + APT_DOOR_W / 2;
    h.style.display = Math.abs(jogadorXAndar - cx) < Math.round(vw * 0.12) ? 'block' : 'none';
  });
}

function interagirAndar3(vw) {
  if (_dentroApt302) { interagirApt302(vw); return; }
  let acted = false;
  [303, 302, 301].forEach(num => {
    if (acted) return;
    const cx = APT_DOOR_X[num] + APT_DOOR_W / 2;
    if (Math.abs(jogadorXAndar - cx) < Math.round(vw * 0.12)) {
      acted = true;
      if (num === 302) { _dentroApt302 = true; entrarApt302(); }
      else             { baterPorta(num); }
    }
  });
}

function baterPorta(num) {
  const door = document.getElementById('apt-door-' + num);
  if (door) {
    let t = 0;
    const shake = setInterval(() => {
      t++;
      door.style.transform = `translateX(${t % 2 === 0 ? -3 : 3}px)`;
      if (t > 6) { clearInterval(shake); door.style.transform = ''; }
    }, 60);
  }
  tocarTom(220, 0.08);
  setTimeout(() => tocarTom(220, 0.06), 120);
  notificar(`Apto ${num} — Sem resposta...`);
}

// -----------------------------------------------------------------------------
// APARTAMENTO 302 — INTERIOR
// -----------------------------------------------------------------------------

function entrarApt302() {
  _dentroApt302 = true;
  const furni = document.getElementById('floor-furni');
  if (furni) construirApt302(furni);
  document.getElementById('floor-hud-name').textContent = 'Apartamento 302';
  const fp = document.getElementById('floor-player');
  if (fp) fp.style.left = jogadorXAndar + 'px';
  notificar('Bem-vindo ao apt 302! Use ← → para explorar.');
}

function construirApt302(furni) {
  furni.innerHTML = '';
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const fgridH  = Math.round((vh - 44) * 0.18);
  const wallH   = Math.round((vh - 44) * 0.82);
  const imgMaxH = Math.round(wallH * 0.72);
  const pad     = Math.round(vw * 0.02);

  const elevWrap = document.getElementById('floor-elev-wrap');
  if (elevWrap) elevWrap.style.display = 'none';

  const gi = (src, lx, w, z = 4) => {
    const e = document.createElement('img');
    e.src = src;
    e.style.cssText = `position:absolute;bottom:${fgridH}px;left:${lx}px;width:${w}px;max-height:${imgMaxH}px;height:auto;image-rendering:pixelated;z-index:${z};object-fit:contain;object-position:bottom left;`;
    e.onerror = () => e.style.display = 'none';
    return e;
  };

  const mkHint = (id, txt, lx) => {
    const h = document.createElement('div');
    h.id = id; h.className = 'hint-jogo';
    h.style.cssText = `position:absolute;bottom:${fgridH + 12}px;left:${lx}px;display:none;`;
    h.textContent = txt;
    return h;
  };

  const mkLamp = (cx, color = '#e8c070') => {
    const lamp  = document.createElement('div');
    lamp.style.cssText = `position:absolute;top:0;left:${cx}px;transform:translateX(-50%);z-index:6;pointer-events:none;display:flex;flex-direction:column;align-items:center;`;
    const rod   = document.createElement('div'); rod.style.cssText   = `width:2px;height:clamp(18px,3vh,38px);background:rgba(0,0,0,.2);`;
    const shade = document.createElement('div'); shade.style.cssText = `width:clamp(22px,3vw,44px);height:clamp(14px,2vh,26px);background:linear-gradient(180deg,#9a7840,${color});border-radius:0 0 55% 55%;border:2px solid #806030;box-shadow:0 6px 22px rgba(255,200,80,.55),0 10px 40px rgba(255,180,50,.25);`;
    lamp.appendChild(rod); lamp.appendChild(shade);
    return lamp;
  };

  // Dimensões dos cômodos
  const sacW     = Math.round(vw * 0.30);
  const salaImgW = Math.round(vw * 0.48);
  const portaW   = Math.round(vw * 0.13);
  const salaW    = salaImgW + portaW + pad * 3;
  const cozW     = Math.round(vw * 0.42);
  const jantarW  = Math.round(vw * 0.38);
  const quartoW  = Math.round(vw * 0.44);
  const banhoW   = Math.round(vw * 0.27);

  const comodos = [
    { id: 'sacada',  w: sacW,    bg: '#020008' },
    { id: 'sala',    w: salaW,   bg: '#f5c0cc' },
    { id: 'cozinha', w: cozW,    bg: '#ece0ff' },
    { id: 'jantar',  w: jantarW, bg: '#e8d8f4' },
    { id: 'quarto',  w: quartoW, bg: '#fce8f0' },
    { id: 'banho',   w: banhoW,  bg: '#cff0e8' },
  ];

  const pos  = {};
  let xAcum  = 0;
  const pilarW = Math.round(vw * 0.006);

  comodos.forEach(({ id, w, bg }) => {
    pos[id] = { x: xAcum, w };

    const wallEl = document.createElement('div');
    wallEl.style.cssText = `position:absolute;top:0;left:${xAcum}px;width:${w}px;height:${wallH}px;background:${bg};z-index:0;`;
    furni.appendChild(wallEl);

    if (id !== 'sacada') {
      const friso  = document.createElement('div');
      friso.style.cssText  = `position:absolute;top:${Math.round(wallH*0.08)}px;left:${xAcum}px;width:${w}px;height:4px;background:rgba(0,0,0,.08);z-index:1;pointer-events:none;`;
      const frisoB = document.createElement('div');
      frisoB.style.cssText = `position:absolute;bottom:${fgridH}px;left:${xAcum}px;width:${w}px;height:8px;background:rgba(0,0,0,.1);z-index:1;pointer-events:none;`;
      furni.appendChild(friso);
      furni.appendChild(frisoB);
      furni.appendChild(mkLamp(xAcum + Math.round(w / 2)));
    }

    if (id !== 'sacada') {
      const pilar = document.createElement('div');
      pilar.style.cssText = `position:absolute;top:0;left:${xAcum - pilarW}px;width:${pilarW * 2}px;height:${wallH}px;background:linear-gradient(90deg,rgba(0,0,0,.18),transparent,rgba(0,0,0,.08));z-index:5;pointer-events:none;`;
      furni.appendChild(pilar);
    }

    xAcum += w;
  });

  const worldW = xAcum;
  const fi     = document.getElementById('floor-inner');
  if (fi) fi.style.width = worldW + 'px';
  furni.style.cssText = `position:absolute;inset:0;width:${worldW}px;`;

  // Sacada
  const { x: sacX } = pos.sacada;
  _construirSacadaApt302(furni, sacX, sacW, wallH, fgridH, vh);

  // Sala
  const { x: salaX } = pos.sala;
  furni.appendChild(gi('IMG/sala-apt.png', salaX + pad, salaImgW, 3));
  furni.appendChild(mkHint('apt-h-sofa', '[E] Sentar no sofá 🛋️', salaX + pad));

  // Porta de saída
  const portaX    = salaX + pad + salaImgW + pad;
  const portaImg  = gi('IMG/porta-302-apt.png', portaX, portaW, 6);
  furni.appendChild(portaImg);
  const portaHit  = document.createElement('div');
  portaHit.style.cssText = `position:absolute;bottom:${fgridH}px;left:${portaX - 20}px;width:${portaW + 40}px;height:${imgMaxH}px;z-index:7;cursor:pointer;`;
  portaHit.addEventListener('click', () => fecharApt302());
  furni.appendChild(portaHit);
  furni.appendChild(mkHint('apt-h-exit', '[E] Sair do apartamento 🚪', portaX));

  // Cozinha, jantar, quarto, banheiro
  const comodosMobilia = [
    { id: 'cozinha', src: 'IMG/cozinha-apt.png',          w: cozW,    hint: ['apt-h-cozinha', '[E] Cozinhar 🍳']       },
    { id: 'jantar',  src: 'IMG/sala-de-jantar-apt.png',   w: jantarW, hint: ['apt-h-jantar',  '[E] Jantar 🍽️']       },
    { id: 'quarto',  src: 'IMG/quarto-apt.png',           w: quartoW, hint: ['apt-h-quarto',  '[E] Dormir 💤']         },
    { id: 'banho',   src: 'IMG/banho-apt.png',            w: banhoW,  hint: ['apt-h-banho',   '[E] Tomar banho 🚿']   },
  ];
  comodosMobilia.forEach(({ id, src, w, hint }) => {
    const { x } = pos[id];
    furni.appendChild(gi(src, x + pad, w - pad * 2, 3));
    furni.appendChild(mkHint(hint[0], hint[1], x + pad));
  });

  // Dados para interação
  window._dadosApt = {
    exit:    { x: portaX - 20,    w: portaW + 40 },
    balaco:  { x: sacX + Math.round((sacW - Math.round(sacW * 0.55)) / 2), w: Math.round(sacW * 0.55) },
    sofa:    { x: salaX,          w: salaImgW  },
    cozinha: { x: pos.cozinha.x,  w: cozW      },
    jantar:  { x: pos.jantar.x,   w: jantarW   },
    quarto:  { x: pos.quarto.x,   w: quartoW   },
    banho:   { x: pos.banho.x,    w: banhoW    },
  };

  jogadorXAndar = portaX - Math.round(vw * 0.07);
}

function _construirSacadaApt302(furni, sacX, sacW, wallH, fgridH, vh) {
  // Céu
  const ceu = document.createElement('div');
  ceu.style.cssText = `position:absolute;top:0;left:${sacX}px;width:${sacW}px;height:${Math.round(wallH*0.82)}px;background:linear-gradient(180deg,#000510 0%,#050c2a 35%,#0a1545 60%,#111d38 100%);z-index:1;pointer-events:none;`;
  furni.appendChild(ceu);

  // Prédios
  const predData = [
    {x:0.02,w:0.10,h:0.55},{x:0.10,w:0.07,h:0.38},{x:0.16,w:0.12,h:0.65},
    {x:0.27,w:0.08,h:0.42},{x:0.33,w:0.14,h:0.70},{x:0.46,w:0.07,h:0.35},
    {x:0.52,w:0.10,h:0.58},{x:0.61,w:0.06,h:0.30},{x:0.66,w:0.13,h:0.62},
    {x:0.78,w:0.09,h:0.45},{x:0.85,w:0.14,h:0.68},{x:0.90,w:0.08,h:0.40},
  ];
  predData.forEach(p => {
    const ph = Math.round(wallH * 0.82 * p.h);
    const px = sacX + Math.round(sacW * p.x);
    const pw = Math.round(sacW * p.w);
    const pred = document.createElement('div');
    pred.style.cssText = `position:absolute;bottom:${fgridH}px;left:${px}px;width:${pw}px;height:${ph}px;background:linear-gradient(180deg,#0d1528,#080e1c);z-index:2;pointer-events:none;`;
    const nCols = Math.max(2, Math.floor(pw / 10));
    const nRows = Math.max(3, Math.floor(ph / 16));
    for (let r = 1; r < nRows; r++) {
      for (let col = 0; col < nCols; col++) {
        const seed = r * 13 + col * 7 + p.x * 100;
        if ((seed % 3) === 0) continue;
        const jan = document.createElement('div');
        const cor = (seed % 5 === 0) ? '#ffe066' : (seed % 4 === 0) ? '#88ccff' : '#ffaa44';
        jan.style.cssText = `position:absolute;left:${Math.round(col*(pw/nCols)+2)}px;bottom:${Math.round(r*(ph/nRows)+2)}px;width:${Math.max(3,Math.round(pw/nCols)-3)}px;height:${Math.max(4,Math.round(ph/nRows)-4)}px;background:${cor};opacity:${0.6+((seed%4)*0.1)};`;
        pred.appendChild(jan);
      }
    }
    furni.appendChild(pred);
  });

  // Lua
  const luaSz  = Math.round(sacW * 0.20);
  const lua    = document.createElement('div');
  lua.style.cssText = `position:absolute;top:${Math.round(wallH*.08)}px;left:${sacX+Math.round(sacW*.68)}px;width:${luaSz}px;height:${luaSz}px;border-radius:50%;background:#fffde0;box-shadow:0 0 ${Math.round(luaSz*.45)}px rgba(255,240,140,.6),0 0 ${Math.round(luaSz*.9)}px rgba(255,220,80,.2);z-index:4;pointer-events:none;`;
  const luaCt  = document.createElement('div');
  luaCt.style.cssText = `position:absolute;top:-10%;left:18%;width:${luaSz}px;height:${luaSz}px;border-radius:50%;background:#000510;`;
  lua.appendChild(luaCt);
  furni.appendChild(lua);

  // Pisca-pisca
  const fioY = Math.round(wallH * 0.18);
  const fio  = document.createElement('div');
  fio.style.cssText = `position:absolute;top:${fioY}px;left:${sacX}px;width:${sacW}px;height:2px;background:rgba(80,60,40,.5);z-index:5;pointer-events:none;`;
  furni.appendChild(fio);

  const coresPisca = ['#ff4466','#ffcc00','#44ddff','#ff88ee','#88ff66','#ff9900'];
  const nLuz = Math.floor(sacW / 18);
  for (let i = 0; i < nLuz; i++) {
    const cor   = coresPisca[i % coresPisca.length];
    const delay = (i * 0.15).toFixed(2);
    const lz    = document.createElement('div');
    lz.style.cssText = `position:absolute;top:${fioY}px;left:${sacX+Math.round(i*(sacW/nLuz)+6)}px;width:7px;height:10px;background:${cor};border-radius:2px 2px 50% 50%;box-shadow:0 0 8px ${cor},0 0 16px ${cor}88;z-index:5;pointer-events:none;animation:neonPulse ${(0.7+i%3*0.3).toFixed(1)}s ease-in-out ${delay}s infinite;`;
    furni.appendChild(lz);
  }

  // Deck
  const deck = document.createElement('div');
  deck.style.cssText = `position:absolute;bottom:0;left:${sacX}px;width:${sacW}px;height:${fgridH}px;background:repeating-linear-gradient(90deg,#5a3510 0px,#5a3510 14px,#4a2a0a 14px,#4a2a0a 16px);border-top:2px solid #8a5520;z-index:5;pointer-events:none;`;
  furni.appendChild(deck);

  // Corrimão de vidro
  const railH  = Math.round(wallH * 0.18);
  const vidro  = document.createElement('div');
  vidro.style.cssText  = `position:absolute;bottom:${fgridH}px;left:${sacX}px;width:${sacW}px;height:${railH}px;background:linear-gradient(180deg,rgba(180,220,255,.05),rgba(180,220,255,.12));border-top:3px solid rgba(210,235,255,.60);z-index:3;pointer-events:none;`;
  const trilho = document.createElement('div');
  trilho.style.cssText = `position:absolute;bottom:${fgridH+railH}px;left:${sacX}px;width:${sacW}px;height:5px;background:linear-gradient(180deg,#dde8f2,#98aabb);box-shadow:0 2px 8px rgba(0,0,0,.6);z-index:3;pointer-events:none;`;
  furni.appendChild(vidro);
  furni.appendChild(trilho);

  // Balanço
  const balacoW = Math.round(sacW * 0.55);
  const balacoX = sacX + Math.round((sacW - balacoW) / 2);
  const balacoImg = document.createElement('img');
  balacoImg.src = 'IMG/Balaço.png';
  balacoImg.id  = 'apt-balaco';
  balacoImg.style.cssText = `position:absolute;bottom:${fgridH}px;left:${balacoX}px;width:${balacoW}px;max-height:${Math.round(wallH*0.72)}px;height:auto;image-rendering:pixelated;z-index:6;object-fit:contain;object-position:bottom left;`;
  balacoImg.onerror = () => balacoImg.style.display = 'none';
  furni.appendChild(balacoImg);

  const hintBalaco = document.createElement('div');
  hintBalaco.id = 'apt-h-balaco'; hintBalaco.className = 'hint-jogo';
  hintBalaco.style.cssText = `position:absolute;bottom:${fgridH + 12}px;left:${balacoX}px;display:none;`;
  hintBalaco.textContent = '[E] Balançar 🌙';
  furni.appendChild(hintBalaco);
}

function hintsApt302(vw) {
  if (!window._dadosApt) return;
  const d     = window._dadosApt;
  const range = Math.round(vw * 0.10) + 40;
  const mapa  = [
    ['exit',    'apt-h-exit'],
    ['balaco',  'apt-h-balaco'],
    ['sofa',    'apt-h-sofa'],
    ['cozinha', 'apt-h-cozinha'],
    ['jantar',  'apt-h-jantar'],
    ['quarto',  'apt-h-quarto'],
    ['banho',   'apt-h-banho'],
  ];
  mapa.forEach(([id, hid]) => {
    const h    = document.getElementById(hid);
    if (!h) return;
    const item = d[id];
    h.style.display = Math.abs(jogadorXAndar - (item.x + item.w / 2)) < range ? 'block' : 'none';
  });
}

function interagirApt302(vw) {
  if (!window._dadosApt) return;
  const d = window._dadosApt;
  const perto = item => Math.abs(jogadorXAndar - (item.x + item.w / 2)) < item.w / 2 + 30;

  if (perto(d.balaco)) {
    const sw = document.getElementById('apt-balaco');
    if (sw) {
      let a = 0, dr = 1;
      const anim = setInterval(() => {
        a += dr * 3;
        if (Math.abs(a) > 20) dr *= -1;
        sw.style.transform       = `rotate(${a}deg)`;
        sw.style.transformOrigin = 'top center';
      }, 40);
      setTimeout(() => { clearInterval(anim); sw.style.transform = ''; }, 3000);
    }
    mostrarTelaAcademia('BALANÇAR 🌙', 3000, () => notificar('Que relaxante! 🌙'), '#c77dff');
    return;
  }

  if (perto(d.exit))    { fecharApt302(); return; }
  if (perto(d.sofa))    { mostrarTelaAcademia('SENTAR NO SOFÁ',  2500, () => notificar('Que confortável! 🛋️'),  '#ff9ab0'); return; }
  if (perto(d.cozinha)) { mostrarTelaAcademia('COZINHAR',        3000, () => notificar('Cheiroso! 🍳'),          '#c77dff'); return; }
  if (perto(d.jantar))  { mostrarTelaAcademia('JANTAR',          2500, () => notificar('Delicioso! 🍽️'),        '#c77dff'); return; }
  if (perto(d.quarto))  { mostrarTelaAcademia('DORMIR',          3500, () => notificar('Descansado! 💤'),        '#ff9ab0'); return; }
  if (perto(d.banho))   { mostrarTelaAcademia('TOMAR BANHO',     3000, () => notificar('Fresquinho! 🚿'),        '#00b4d8'); return; }
}

function fecharApt302() {
  const elevWrap = document.getElementById('floor-elev-wrap');
  if (elevWrap) elevWrap.style.display = 'block';

  _dentroApt302     = false;
  window._dadosApt  = null;

  const furni = document.getElementById('floor-furni');
  if (furni) construirAndar3(furni);

  document.getElementById('floor-hud-name').textContent = FLOOR_CFG[3].name;
  jogadorXAndar = APT_DOOR_X[302] + APT_DOOR_W / 2;
  const fp = document.getElementById('floor-player');
  if (fp) fp.style.left = jogadorXAndar + 'px';
  notificar('Voltando ao corredor...');
}
