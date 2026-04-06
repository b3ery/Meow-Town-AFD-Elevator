// ═══════════════════════════════════════
// PERSONAGENS — mapeamento src dos sprites
// ═══════════════════════════════════════
const CHARS_RAW={mulher:"IMG/mulher.png", homem:"IMG/Homem.png", gato:"IMG/gato.png"};
const CHARS={};

// ── Estados do AFD do jogador ──
const AFD_ALL=['LOBBY_IDLE','LOBBY_WALK','AT_CANDY','AT_ELEVATOR','ELEV_CLOSING','ELEV_MOVING','ELEV_OPEN','FLOOR_T','FLOOR_1','FLOOR_2','FLOOR_3','AT_RECEPTION','FINALIZE'];

// ── Nomes e ícones dos andares ──
const FLOORS=['Térreo','Restaurante 🍽️','Academia 💪','Apartamento 🛋️'];
const FLOOR_ICONS=['🏢','🍽️','💪','🛋️'];
const FNUMS=['T','1','2','3'];

// ── Estado atual do AFD do jogador e histórico ──
let estadoAtual='LOBBY_IDLE', logAfd=[], caminhoAfd=['LOBBY_IDLE'], visitados=new Set(['LOBBY_IDLE']), t0=new Date();
let personagemEscolhido='mulher';
function horario(){return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});}
function tr(ev,next){logAfd.push({t:horario(),from:estadoAtual,ev,to:next});estadoAtual=next;visitados.add(next);if(!caminhoAfd.includes(next))caminhoAfd.push(next);document.getElementById('hud-state').textContent=next;}

// ═══════════════════════════════════════
// AFD DO ELEVADOR
// ═══════════════════════════════════════
const ELEV_STATES=[
  'PARADO_TERREO','PORTAS_ABERTAS','PORTAS_FECHANDO',
  'SUBINDO','DESCENDO',
  'PASSANDO_1','PASSANDO_2',
  'CHEGOU',
  'FLOOR_1','FLOOR_2','FLOOR_3'
];
const ELEV_STATES_LABELS={
  'PARADO_TERREO'  :'🏢 Parado no Térreo',
  'PORTAS_ABERTAS' :'🚪 Portas Abertas',
  'PORTAS_FECHANDO':'🔒 Portas Fechando',
  'SUBINDO'        :'⬆️ Subindo',
  'DESCENDO'       :'⬇️ Descendo',
  'PASSANDO_1'     :'🔄 Passando pelo 1',
  'PASSANDO_2'     :'🔄 Passando pelo 2',
  'CHEGOU'         :'📍 Chegou ao Andar',
  'FLOOR_1'        :'🍽️ Andar 1',
  'FLOOR_2'        :'💪 Andar 2',
  'FLOOR_3'        :'🛋️ Andar 3'
};

let logAfdElev=[], caminhoAfdElev=['PARADO_TERREO'], visitadosElev=new Set(['PARADO_TERREO']), estadoAtualElev='PARADO_TERREO';
function transElev(ev,next){
  logAfdElev.push({t:horario(),from:estadoAtualElev,ev,to:next});
  const prev=estadoAtualElev;
  estadoAtualElev=next;
  visitadosElev.add(next);
  if(!caminhoAfdElev.includes(next))caminhoAfdElev.push(next);
  // Atualiza HUD live
  const lv=document.getElementById('afd-live');
  const ls=document.getElementById('afd-live-state');
  const lt=document.getElementById('afd-live-transition');
  const lp=document.getElementById('afd-live-path');
  if(lv&&ls&&lt&&lp){
    lv.style.display='block';
    ls.textContent=ELEV_STATES_LABELS[next]||next;
    lt.textContent=(ELEV_STATES_LABELS[prev]||prev)+' ──['+ev+']──▶';
    lp.textContent='Caminho: '+caminhoAfdElev.slice(-4).map(s=>(ELEV_STATES_LABELS[s]||s).replace(/^[^ ]+ /,'')).join(' → ');
    clearTimeout(lv._t);
    lv._t=setTimeout(()=>{if(!elevadorEmMovimento)lv.style.display='none';},4000);
  }
}

// ═══════════════════════════════════════
// VARIÁVEIS GLOBAIS DE JOGO
// ═══════════════════════════════════════
let jogadorX=0, teclas={}, modalAberto=false, olhandoDireita=true, andarAberto=false;
let andarAtualElev=0, elevadorEmMovimento=false, contadorDoces=0;
let itemNaMao=null, itensStand={};
let portasAbertas=true, andarSelecionadoElev=-1;
let animViagem=null, offsetViagem=0;
let recemChegouLobby=false, jogadorJaAndou=false;
let notifTimer=null;
function notificar(msg){const n=document.getElementById('notif');n.textContent=msg;n.classList.add('show');clearTimeout(notifTimer);notifTimer=setTimeout(()=>n.classList.remove('show'),2500);}


// ═══════════════════════════════════════
// DESENHO — janelas com skyline noturna
// ═══════════════════════════════════════
function desenharJanelaCidade(canvasId,seed){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const w=canvas.offsetWidth||300,h=canvas.offsetHeight||200;
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');
  const rng=(n)=>{let x=Math.sin(seed+n)*10000;return x-Math.floor(x);};
  ctx.fillStyle='#050010';ctx.fillRect(0,0,w,h);
  const nb=6+Math.floor(rng(1)*5);
  for(let i=0;i<nb;i++){
    const bw=w/(nb+1),bh=h*(.3+rng(i+10)*.5),bx=i*bw+rng(i)*bw*.2;
    ctx.fillStyle=`hsl(${240+rng(i)*30},${15+rng(i+1)*20}%,${6+rng(i+2)*12}%)`;
    ctx.fillRect(bx,h-bh,bw*.85,bh);
    for(let wy=h-bh+5;wy<h-10;wy+=11)for(let wx=bx+3;wx<bx+bw*.8;wx+=9)if(rng(wx+wy)>.4){ctx.fillStyle=rng(wx+wy+1)>.7?'#ffe066':rng(wx+wy+2)>.5?'#88ccff':'#ffaa44';ctx.fillRect(wx,wy,5,6);}
  }
  for(let s=0;s<25;s++){ctx.fillStyle=`rgba(255,255,255,${.3+rng(s+50)*.7})`;ctx.fillRect(rng(s)*w,rng(s+100)*h*.45,1,1);}
}

function iniciarJanelasCidade(){['ccanvas-l','ccanvas-lc','ccanvas-rc','ccanvas-r'].forEach((id,i)=>desenharJanelaCidade(id,i*7+3));desenharJanelaCidade('candy-city-canvas',42);}


// ═══════════════════════════════════════
// INICIALIZAÇÃO — escolha de personagem
// ═══════════════════════════════════════
function selecionarPersonagem(type){
  personagemEscolhido=type;
  const recepMap={mulher:'homem',homem:'mulher',gato:'mulher'};
  const recepType=recepMap[type];
  CHARS[type]=CHARS_RAW[type];CHARS[recepType]=CHARS_RAW[recepType];
  document.getElementById('player-img').src=CHARS_RAW[type];
  document.getElementById('floor-player-img').src=CHARS_RAW[type];
  const ep=document.getElementById('elev-player-int');if(ep)ep.src=CHARS_RAW[type];
  const ri=document.getElementById('recep-img');if(ri)ri.src="IMG/Recepcionista.png";
  const si=document.getElementById('candy-stand-img');if(si)si.src="IMG/StandCafé.png";
  const ml=document.getElementById('candy-mesa-l');if(ml)ml.src="IMG/MesaLoja.png";
  const mr=document.getElementById('candy-mesa-r');if(mr)mr.src="IMG/MesaLoja.png";
  const me=document.getElementById('candy-mesa-extra');if(me)me.src="IMG/MesaLoja.png";
  const rs=document.getElementById('recep-sofa');if(rs)rs.src="IMG/Sofa.png";
  const rb=document.getElementById('recep-balaco');if(rb)rb.src="IMG/ArmarioGrande.png";
  const rm=document.getElementById('recep-mesinha');if(rm)rm.src="IMG/Mesinha.png";
  const rp=document.getElementById('recep-poltrona');if(rp)rp.src="IMG/Poltrona.png";
  document.getElementById('screen-select').style.display='none';
  document.getElementById('hud').style.display='flex';
  document.getElementById('viewport').classList.add('active');
  document.getElementById('ctrl-hint').style.display='block';
  jogadorX=window.innerWidth*2.0;
  requestAnimationFrame(loopJogo);
  requestAnimationFrame(loopAndar);
  document.getElementById('hud-floor').textContent='TÉRREO – LOBBY 🏢';
  notificar('Use ← → para mover · [E] para interagir');
  iniciarJanelasCidade();
}

window.addEventListener('load',()=>{
  const si=document.getElementById('candy-store-img');if(si){si.src="IMG/Loja.png";si.style.display='block';}
  document.getElementById('sel-img-mulher').src="IMG/mulher.png";CHARS.mulher="IMG/mulher.png";
  document.getElementById('sel-img-homem').src="IMG/Homem.png";CHARS.homem="IMG/Homem.png";
  document.getElementById('sel-img-gato').src="IMG/gato.png";CHARS.gato="IMG/gato.png";
  const sc=document.getElementById('select-city-bg');
  if(sc){sc.width=window.innerWidth;sc.height=window.innerHeight;desenharJanelaCidade('select-city-bg',99);}
});


// ═══════════════════════════════════════
// TECLADO — captura de teclas
// ═══════════════════════════════════════
document.addEventListener('keydown',e=>{
  teclas[e.key]=true;
  if(document.getElementById('elev-interior').classList.contains('show')){if(e.key==='w'||e.key==='W'||e.key==='ArrowUp'){document.getElementById('elev-interior').classList.remove('show');return;}}
  if(!modalAberto&&!andarAberto&&(e.key==='e'||e.key==='E'))interagir();
  if(andarAberto&&!modalAberto&&(e.key==='e'||e.key==='E'))interagirAndar();
  if(e.key==='Escape')fecharTodosModais();
});
document.addEventListener('keyup',e=>{teclas[e.key]=false;});
function fecharTodosModais(){document.querySelectorAll('.modal').forEach(m=>m.classList.remove('show'));if(document.getElementById('elev-interior').classList.contains('show'))document.getElementById('elev-interior').classList.remove('show');modalAberto=false;}


// ── Interação no térreo (E) ──
function interagir(){
  const vw=window.innerWidth;
  const zone=jogadorX<vw*1.5?'candy':jogadorX<vw*2.5?'lobby':'recep';
  if(zone==='candy'){const standX=vw*0.12;if(Math.abs(jogadorX-standX)<vw*0.18){alternarMenuStand();return;}const storeX=vw*0.75;if(Math.abs(jogadorX-storeX)<vw*0.25){abrirLojaDeDolces();return;}notificar('Use [E] perto da loja ou do stand! 🍬');return;}
  if(zone==='lobby'){const elevX=vw*2.0;if(Math.abs(jogadorX-elevX)<vw*0.2){entrarInteriorElevador();return;}if(jogadorX>vw*2.1){tr('INTERACT_RECEPTION','AT_RECEPTION');return;}}
  if(zone==='recep'){tr('INTERACT_RECEPTION','AT_RECEPTION');notificar('Bem-vindo ao Meow Tower! 🐱');return;}
}

// ── Interação nos andares (E) ──
function interagirAndar(){
  const vw=window.innerWidth;
  if(!_dentroApt302){
    const elevWrapEl=document.getElementById('floor-elev-wrap');
    if(elevWrapEl&&elevWrapEl.style.display!=='none'){
      const elvL=parseFloat(elevWrapEl.style.left)||0;
      const elvW=elevWrapEl.offsetWidth||Math.min(170,Math.max(110,vw*0.13));
      const elvCentro=elvL+elvW/2;
      if(Math.abs(jogadorXAndar-elvCentro)<elvW*0.8){entrarInteriorElevador();return;}
    }
  }
  if(andarAtual===1){
    const fvW=document.getElementById('floor-world')?.offsetWidth||vw;
    const bancW=Math.min(380,Math.max(220,fvW*0.28));
    if(jogadorXAndar<bancW+80){abrirMenuRestaurante();return;}
    if(Math.abs(jogadorXAndar-Math.round(vw*2.05))<Math.round(vw*0.12)){abrirMenuBar();return;}
    if(Math.abs(jogadorXAndar-Math.round(vw*2.58))<Math.round(vw*0.12)){usarBanheiro();return;}
    if(_itemGarcom&&Math.abs(jogadorXAndar-Math.round(vw*2.31))<Math.round(vw*0.10)){pegarItemGarcom();return;}
    notificar('Explore o andar!');return;
  }
  if(andarAtual===2){interagirAcademia(vw);return;}
  if(andarAtual===3){interagirAndar3(vw);return;}
  notificar('Explore o andar!');
}


// ═══════════════════════════════════════
// LOOP PRINCIPAL — térreo/lobby
// ═══════════════════════════════════════
function loopJogo(){
  if(andarAberto){requestAnimationFrame(loopJogo);return;}
  const vw=window.innerWidth;
  const L=teclas['ArrowLeft']||teclas['a']||teclas['A'];
  const R=teclas['ArrowRight']||teclas['d']||teclas['D'];
  const speed=Math.max(3,Math.min(8,vw*0.004));
  const pl=document.getElementById('player');
  if(!pl){requestAnimationFrame(loopJogo);return;}
  if((L||R)&&!elevadorEmMovimento&&!modalAberto){
    if(L){jogadorX-=speed;olhandoDireita=false;}
    if(R){jogadorX+=speed;olhandoDireita=true;}
    jogadorX=Math.max(0,Math.min(vw*3.5-80,jogadorX));
    pl.classList.add('walking');jogadorJaAndou=true;
    if(!olhandoDireita)pl.classList.add('flip');else pl.classList.remove('flip');
    if(estadoAtual==='LOBBY_IDLE')tr('WALK','LOBBY_WALK');
  } else {pl.classList.remove('walking');if(estadoAtual==='LOBBY_WALK')tr('STOP','LOBBY_IDLE');}
  const viewport=document.getElementById('viewport');
  const world=document.getElementById('world');
  const vpW=viewport.offsetWidth;
  let camX=jogadorX-vpW/2;
  camX=Math.max(0,Math.min(vw*3.5-vpW,camX));
  world.style.transform=`translateX(${-camX}px)`;
  pl.style.left=jogadorX+'px';
  const zone=jogadorX<vw*1.5?'candy':jogadorX<vw*2.5?'lobby':'recep';
  const elevX=vw*2.0;
  const nearElev=zone==='lobby'&&Math.abs(jogadorX-elevX)<vw*0.15;
  if(nearElev&&estadoAtual==='LOBBY_IDLE')tr('NEAR_ELEVATOR','AT_ELEVATOR');
  if(!nearElev&&estadoAtual==='AT_ELEVATOR')tr('LEAVE_ELEVATOR','LOBBY_IDLE');
  const rb=document.getElementById('recep-bubble');
  const nearDesk=(zone==='lobby'&&jogadorX>vw*1.95)||(zone==='recep'&&jogadorX<vw*2.6);
  const semiNear=(zone==='lobby'&&jogadorX>vw*1.85&&jogadorX<=vw*2.1);
  const elevIntOpen=document.getElementById('elev-interior')?.classList.contains('show')||document.getElementById('elev-travel')?.classList.contains('show')||document.getElementById('floor-scene')?.classList.contains('show')||andarAberto||recemChegouLobby;
  if(rb){if(nearDesk&&!elevIntOpen&&jogadorJaAndou&&!rb.classList.contains('show'))rb.classList.add('show');if((!nearDesk||elevIntOpen)&&rb.classList.contains('show'))rb.classList.remove('show');}
  const rh=document.getElementById('recep-hint');if(rh)rh.style.display=semiNear?'block':'none';
  const standX=vw*0.12;const nearStand=zone==='candy'&&Math.abs(jogadorX-standX)<vw*0.18;
  const hint=document.getElementById('stand-hint');if(hint&&!itemNaMao)hint.style.display=nearStand?'block':'none';
  const storeX=vw*0.75;const nearStore=zone==='candy'&&Math.abs(jogadorX-storeX)<vw*0.25;
  const sh=document.getElementById('candy-store-hint');if(sh)sh.style.display=nearStore?'block':'none';
  const pi=document.getElementById('player-item');
  if(pi&&pi.style.display!=='none'&&itemNaMao){const playerH=pl.offsetHeight||110;const handX=jogadorX+(pl.offsetWidth||80)*0.15;const handY=playerH*0.38;pi.style.left=handX+'px';pi.style.bottom=(18/100*(viewport.offsetHeight)+handY)+'px';pi.style.width=(playerH*0.75)+'px';pi.style.height='auto';}
  requestAnimationFrame(loopJogo);
}
function limitar(v,min,max){return Math.max(min,Math.min(max,v));}

let jogadorXAndar=0, teclasAndar={};
let _dentroApt302=false;

// ═══════════════════════════════════════
// LOOP DOS ANDARES
// ═══════════════════════════════════════
function loopAndar(){
  if(!andarAberto){requestAnimationFrame(loopAndar);return;}
  try{
    const fw=document.getElementById('floor-world');
    if(!fw){requestAnimationFrame(loopAndar);return;}
    const fvW=fw.offsetWidth||window.innerWidth;
    const fi=document.getElementById('floor-inner');
    const worldW=fi?(parseFloat(fi.style.width)||fi.offsetWidth||fvW*2.8):fvW*2.8;
    const fp=document.getElementById('floor-player');
    if(!fp){requestAnimationFrame(loopAndar);return;}
    const L=teclas['ArrowLeft']||teclas['a']||teclas['A'];
    const R=teclas['ArrowRight']||teclas['d']||teclas['D'];
    const speed=Math.max(2, fvW*(_dentroApt302?0.002:0.003));
    if(L||R){
      if(L){jogadorXAndar-=speed;fp.classList.add('flip');}
      if(R){jogadorXAndar+=speed;fp.classList.remove('flip');}
      jogadorXAndar=Math.max(0,Math.min(worldW-80,jogadorXAndar));
      fp.classList.add('walking');
    } else {
      fp.classList.remove('walking');
    }
    fp.style.left=jogadorXAndar+'px';
    const camX=Math.max(0,Math.min(worldW-fvW, jogadorXAndar-fvW/2));
    if(fi) fi.style.transform=`translateX(${-camX}px)`;
    try{
      if(andarAtual===1) atualizarHintsAndar1(window.innerWidth);
      if(andarAtual===2) atualizarHintsAcademia(window.innerWidth);
      if(andarAtual===3) atualizarHintsAndar3(window.innerWidth);
    }catch(e2){}
  }catch(e){console.warn('loopAndar err:',e);}
  requestAnimationFrame(loopAndar);
}

function atualizarHintsAndar1(vw){
  const fvW=document.getElementById('floor-world')?.offsetWidth||vw;
  const bancW=Math.min(380,Math.max(220,fvW*0.28));
  const hint=document.getElementById('res-menu-hint');
  if(hint)hint.style.display=jogadorXAndar<bancW+80&&!menuResAberto&&!_itemGarcom?'block':'none';
  const barHint=document.getElementById('bar-hint');
  if(barHint)barHint.style.display=Math.abs(jogadorXAndar-Math.round(vw*2.05))<Math.round(vw*0.12)&&!menuBarAberto&&!_itemGarcom?'block':'none';
  const garcomHint=document.getElementById('garcom-collect-hint');
  if(garcomHint)garcomHint.style.display=_itemGarcom&&Math.abs(jogadorXAndar-Math.round(vw*2.31))<Math.round(vw*0.11)?'block':'none';
  const arrow=document.getElementById('garcom-arrow');
  if(arrow){
    if(_itemGarcom&&Math.abs(jogadorXAndar-Math.round(vw*2.31))>=Math.round(vw*0.11)){arrow.style.display='block';arrow.style.left=(jogadorXAndar+60)+'px';}
    else arrow.style.display='none';
  }
  const bathHint=document.getElementById('bath-hint');
  if(bathHint)bathHint.style.display=Math.abs(jogadorXAndar-Math.round(vw*2.58))<Math.round(vw*0.12)&&!usandoBanheiro?'block':'none';
}

function abrirLojaDeDolces(){
  tr('ENTER_CANDY','AT_CANDY');
  notificar('Abrindo Meow Candy... 🍬');
  window.open('https://b3ery.github.io/MachineCandy/','_blank');
}
function comprarDoce(item){contadorDoces++;notificar('🍬 Delicioso! Total: '+contadorDoces);}

function pegarItemStand(type){
  const srcs={cafe:"IMG/Cafe.png",suco:"IMG/suco.png",sanduiche:"IMG/Sanduiche.png"};
  document.getElementById('stand-btns').style.display='none';
  if(!srcs[type]){notificar('Item não disponível!');return;}
  itensStand[type]=srcs[type];itemNaMao=type;
  const pi=document.getElementById('player-item');if(pi){pi.src=srcs[type];pi.style.display='block';}
  const names={cafe:'Café ☕',suco:'Suco 🍊',sanduiche:'Sanduíche 🥪'};
  notificar('Você pegou: '+names[type]+'! Clique no personagem pra consumir 😋');
  tr('PICK_ITEM_'+type.toUpperCase(),'AT_CANDY');
}
function consumirItem(){
  if(!itemNaMao)return;
  const piId=andarAberto?'floor-item':'player-item';
  const pi=document.getElementById(piId);
  if(!pi||pi.style.display==='none')return;
  pi.style.animation='consumeItem 0.5s ease-out forwards';
  const player=document.getElementById(andarAberto?'floor-player':'player');
  if(player){
    const score=document.createElement('div');
    score.textContent='😋 +15';
    score.className='score-flutuante';
    player.appendChild(score);
    setTimeout(()=>score.remove(),800);
  }
  setTimeout(()=>{
    if(pi){pi.style.display='none';pi.style.animation='';pi.src='';}
    itemNaMao=null;
    notificar('Mmm, delicioso! 😋');
    tocarTom(523,.08);
    setTimeout(()=>tocarTom(659,.08),80);
    setTimeout(()=>tocarTom(784,.1),160);
    tr('CONSUME_ITEM','LOBBY_IDLE');
  },500);
}
function alternarMenuStand(){const btns=document.getElementById('stand-btns');if(!btns)return;btns.style.display=btns.style.display==='flex'?'none':'flex';}

function abrirPortas(){document.getElementById('door-l').classList.add('open');document.getElementById('door-r').classList.add('open');tr('OPEN_DOORS','ELEV_OPEN');transElev('ABRIR_PORTAS','PORTAS_ABERTAS');tocarTom(440,.1);setTimeout(()=>tocarTom(880,.08),120);}
function fecharPortas(cb){document.getElementById('door-l').classList.remove('open');document.getElementById('door-r').classList.remove('open');tr('CLOSE_DOORS','ELEV_CLOSING');transElev('FECHAR_PORTAS','PORTAS_FECHANDO');tocarTom(220,.1);setTimeout(cb,700);}


// ═══════════════════════════════════════
// ELEVADOR — interior e viagem
// ═══════════════════════════════════════
function entrarInteriorElevador(){
  if(elevadorEmMovimento){notificar('🔄 Elevador em movimento...');return;}
  const rb=document.getElementById('recep-bubble');if(rb)rb.classList.remove('show');
  const ep=document.getElementById('elev-player-int');if(ep)ep.src=CHARS_RAW[personagemEscolhido]||'';
  atualizarInteriorElev();portasAbertas=true;
  document.getElementById('int-door-l').classList.add('int-open');document.getElementById('int-door-r').classList.add('int-open');
  document.getElementById('door-l')?.classList.add('open');document.getElementById('door-r')?.classList.add('open');
  document.getElementById('floor-door-l')?.classList.add('open');document.getElementById('floor-door-r')?.classList.add('open');
  document.getElementById('elev-interior').classList.add('show');document.getElementById('elev-interior-box').style.display='flex';
  transElev('ENTRAR_ELEVADOR','PORTAS_ABERTAS');notificar('Escolha o andar! 🛗');
}
function atualizarInteriorElev(){
  const strip=document.getElementById('elev-strip-num');const lbl=document.getElementById('elev-strip-label');const ind=document.getElementById('elev-ind-num');
  if(strip)strip.textContent=FNUMS[andarAtualElev];if(lbl)lbl.textContent=FLOORS[andarAtualElev];
  if(ind){ind.textContent=FNUMS[andarAtualElev];ind.style.color='#00ff55';ind.style.textShadow='0 0 10px #00ff55,0 0 20px #00cc44';}
  [0,1,2,3].forEach(i=>{const b=document.getElementById('ibtn-'+i);if(!b)return;b.classList.remove('active','current');if(i===andarAtualElev)b.classList.add('current');});
  andarSelecionadoElev=-1;
}
function selecionarAndar(floor){
  if(floor===andarAtualElev){notificar('Já estás aqui!');return;}if(elevadorEmMovimento){notificar('🔄 Em movimento...');return;}
  andarSelecionadoElev=floor;
  [0,1,2,3].forEach(i=>{const b=document.getElementById('ibtn-'+i);if(!b)return;b.classList.remove('active','current');if(i===floor)b.classList.add('active');else if(i===andarAtualElev)b.classList.add('current');});
  const ind=document.getElementById('elev-ind-num');if(ind){ind.textContent=FNUMS[floor];ind.style.color='#ffaa00';ind.style.textShadow='0 0 12px #ffaa00';}
  tocarTom(440,.06);transElev('SELECIONAR_ANDAR_'+FNUMS[floor],'PORTAS_ABERTAS');notificar('🚪 Fechando portas em 1.5s...');elevadorEmMovimento=true;
  const tempoEspera=portasAbertas?1500:100;
  _timerPorta=setTimeout(()=>{_timerPorta=null;viajar(floor);},tempoEspera);
}
function viajar(target){
  const dir=target>andarAtualElev?1:-1;const steps=Math.abs(target-andarAtualElev);
  transElev(dir>0?'PRESSIONAR_SUBIR':'PRESSIONAR_DESCER',dir>0?'SUBINDO':'DESCENDO');
  portasAbertas=false;document.getElementById('int-door-l').classList.remove('int-open');document.getElementById('int-door-r').classList.remove('int-open');
  fecharPortas(()=>{});document.getElementById('floor-door-l')?.classList.remove('open');document.getElementById('floor-door-r')?.classList.remove('open');
  tocarTom(220,.12);transElev('FECHAR_PORTAS','PORTAS_FECHANDO');
  setTimeout(()=>{
    document.getElementById('elev-interior').classList.remove('show');document.getElementById('viewport').classList.remove('active');
    mostrarTelaViagem(dir,steps,1800,()=>{
      elevadorEmMovimento=false;andarAtualElev=target;
      document.getElementById('elev-num').textContent=FNUMS[target];document.getElementById('elev-num').style.color=target===0?'#ff2222':'#22ff22';
      const ind=document.getElementById('elev-ind-num');if(ind){ind.textContent=FNUMS[target];ind.style.color='#00ff55';ind.style.textShadow='0 0 10px #00ff55';}
      [0,1,2,3].forEach(i=>{const b=document.getElementById('ibtn-'+i);if(!b)return;b.classList.remove('active','current');if(i===target)b.classList.add('current');});
      const fen=document.getElementById('floor-elev-num');if(fen)fen.textContent=FNUMS[target];
      tr('ARRIVE','ELEV_OPEN');const es=['PARADO_TERREO','FLOOR_1','FLOOR_2','FLOOR_3'];transElev('CHEGAR_ANDAR_'+FNUMS[target],es[target]);
      notificar('📍 '+FLOOR_ICONS[target]+' '+FLOORS[target]);abrirPortas();
      document.getElementById('floor-door-l')?.classList.add('open');document.getElementById('floor-door-r')?.classList.add('open');
      document.getElementById('floor-scene').classList.remove('show');andarAberto=false;
      if(target===0){
        document.getElementById('hud-floor').textContent='TÉRREO – LOBBY 🏢';jogadorJaAndou=false;jogadorX=window.innerWidth*2.0;
        const pl=document.getElementById('player');if(pl)pl.style.left=jogadorX+'px';
        document.getElementById('viewport').classList.add('active');
        setTimeout(()=>{
          document.getElementById('door-l').classList.remove('open');
          document.getElementById('door-r').classList.remove('open');
          document.getElementById('floor-door-l')?.classList.remove('open');
          document.getElementById('floor-door-r')?.classList.remove('open');
        },600);
      } else {
        const ep=document.getElementById('elev-player-int');if(ep)ep.src=CHARS_RAW[personagemEscolhido]||'';
        atualizarInteriorElev();document.getElementById('int-door-l').classList.remove('int-open');document.getElementById('int-door-r').classList.remove('int-open');
        document.getElementById('elev-interior').classList.add('show');
        setTimeout(()=>{
          document.getElementById('int-door-l').classList.add('int-open');document.getElementById('int-door-r').classList.add('int-open');
          if(ep){ep.style.transition='transform 0.6s ease-in';ep.style.transform='translateX(160%)';}
          setTimeout(()=>{if(ep){ep.style.transition='';ep.style.transform='';}document.getElementById('elev-interior').classList.remove('show');entrarAndar(target);},700);
        },500);
      }
    });
  },700);
}

// ═══════════════════════════════════════
// TELA DE VIAGEM — COM REGISTRO DE PASSAGEM POR ANDARES INTERMEDIÁRIOS
// ═══════════════════════════════════════
function mostrarTelaViagem(dir,steps,stepTime,onArrive){
  const destFloor=Math.max(0,Math.min(3,andarAtualElev+dir*steps));
  const screen=document.getElementById('elev-travel'),bg=document.getElementById('travel-bg'),elBox=document.getElementById('travel-elevator');
  const tvNum=document.getElementById('tv-num'),tvUp=document.getElementById('tv-arr-up'),tvDn=document.getElementById('tv-arr-dn');
  const dleft=document.getElementById('tv-door-l'),dright=document.getElementById('tv-door-r'),labelCt=document.getElementById('travel-floor-labels');
  const elvEl=document.getElementById('tv-elev');
  const elvH=elvEl?(elvEl.offsetHeight||220):220;
  const floorH=elvH,totalMs=steps*stepTime;
  labelCt.innerHTML='';
  [['3','🛋️ 3º ANDAR'],['2','💪 2º ANDAR'],['1','🍽️ 1º ANDAR'],['T','🏢 TÉRREO']].forEach(([f,label],i)=>{
    const el=document.createElement('div');
    el.className='travel-floor-label';
    el.textContent=label;
    el.style.cssText=`font-size:clamp(8px,1.1vw,14px);letter-spacing:2px;left:50%;transform:translateX(-50%);text-align:center;width:max-content;opacity:0.75;`;
    el.style.top=(window.innerHeight*.5+(i-(3-andarAtualElev))*floorH)+'px';
    labelCt.appendChild(el);
  });
  dleft.classList.remove('open');dright.classList.remove('open');tvUp.classList.toggle('on',dir>0);tvDn.classList.toggle('on',dir<0);
  tvNum.textContent=FNUMS[andarAtualElev];tvNum.style.color='#ffaa00';tvNum.style.textShadow='0 0 12px #ffaa00';
  screen.classList.add('show');elBox.classList.add('shaking');bg.style.transform='translateY(0px)';
  let startTime=null,lastFloor=andarAtualElev;if(animViagem)cancelAnimationFrame(animViagem);

  function animate(horario){
    if(!startTime)startTime=horario;
    const progress=Math.min((horario-startTime)/totalMs,1);
    const eased=progress<.5?2*progress*progress:-1+(4-2*progress)*progress;
    const offset=eased*steps*floorH*(dir>0?1:-1);
    bg.style.transform=`translateY(${offset}px)`;
    Array.from(labelCt.children).forEach((lbl,i)=>{
      lbl.style.top=(window.innerHeight*.5+(i-(3-andarAtualElev))*floorH+offset)+'px';
    });
    const passed=Math.floor(Math.abs(offset)/floorH+.3);
    const cur=Math.max(0,Math.min(3,andarAtualElev+dir*passed));

    if(cur!==lastFloor){
      lastFloor=cur;
      tvNum.textContent=FNUMS[cur];
      tocarTom(200+cur*90,.06);

      // ── NOVO: Registra passagem por andares intermediários no AFD ──
      if(cur!==destFloor && cur!==andarAtualElev){
        const passState='PASSANDO_'+cur;
        if(ELEV_STATES.includes(passState)){
          transElev('PASSAR_ANDAR_'+FNUMS[cur], passState);
        }
      }
    }

    if(progress<1){
      animViagem=requestAnimationFrame(animate);
    } else {
      elBox.classList.remove('shaking');
      tvUp.classList.remove('on');tvDn.classList.remove('on');
      tvNum.textContent=FNUMS[destFloor];tvNum.style.color='#22ff22';tvNum.style.textShadow='0 0 12px #22ff22';
      tocarChegada();
      setTimeout(()=>{
        dleft.classList.add('open');dright.classList.add('open');
        setTimeout(()=>{
          recemChegouLobby=true;jogadorJaAndou=false;
          const rb=document.getElementById('recep-bubble');if(rb)rb.classList.remove('show');
          screen.classList.remove('show');
          if(onArrive)onArrive();
          setTimeout(()=>{recemChegouLobby=false;},500);
        },800);
      },400);
    }
  }
  animViagem=requestAnimationFrame(animate);
}

function fecharPortaElev(){if(elevadorEmMovimento){notificar('Em movimento!');return;}tocarTom(220,.12);transElev('BTN_FECHAR_PORTA','PORTAS_FECHANDO');portasAbertas=false;document.getElementById('int-door-l').classList.remove('int-open');document.getElementById('int-door-r').classList.remove('int-open');document.getElementById('door-l')?.classList.remove('open');document.getElementById('door-r')?.classList.remove('open');document.getElementById('floor-door-l')?.classList.remove('open');document.getElementById('floor-door-r')?.classList.remove('open');}
let _timerPorta=null;
function abrirPortaElev(){if(elevadorEmMovimento){notificar('Em movimento!');return;}
  if(_timerPorta){clearTimeout(_timerPorta);_timerPorta=null;}tocarTom(440,.1);setTimeout(()=>tocarTom(880,.08),120);transElev('BTN_ABRIR_PORTA','PORTAS_ABERTAS');portasAbertas=true;document.getElementById('elev-interior-box').style.display='flex';document.getElementById('int-door-l').classList.add('int-open');document.getElementById('int-door-r').classList.add('int-open');document.getElementById('door-l')?.classList.add('open');document.getElementById('door-r')?.classList.add('open');document.getElementById('floor-door-l')?.classList.add('open');document.getElementById('floor-door-r')?.classList.add('open');notificar('🚪 Portas abertas');}

function playFloorEntryAnim(floorNum,onDone){
  const anim=document.getElementById('floor-entry-anim'),feaNum=document.getElementById('fea-num'),feaPlayer=document.getElementById('fea-player');
  const doorL=document.getElementById('fea-door-l'),doorR=document.getElementById('fea-door-r');
  feaNum.textContent=FNUMS[floorNum];feaNum.style.color='#22ff22';feaNum.style.textShadow='0 0 10px #22ff22';feaPlayer.src=CHARS_RAW[personagemEscolhido]||'';
  doorL.style.transform='scaleX(1)';doorR.style.transform='scaleX(1)';feaPlayer.style.left='50%';feaPlayer.style.transform='translateX(-50%)';feaPlayer.style.opacity='1';anim.style.display='flex';
  setTimeout(()=>{doorL.style.transform='scaleX(0.04)';doorR.style.transform='scaleX(0.04)';setTimeout(()=>{feaPlayer.style.transition='left 0.7s linear, transform 0.7s linear';feaPlayer.style.left='-30%';feaPlayer.style.transform='translateX(0)';setTimeout(()=>{anim.style.display='none';feaPlayer.style.transition='none';if(onDone)onDone();},750);},700);},400);
}


// ═══════════════════════════════════════
// ANDAR 1 — RESTAURANTE
// ═══════════════════════════════════════
function construirAndar1(furni){
  furni.innerHTML='';
  const vw=window.innerWidth, vh=window.innerHeight;
  const fi=document.getElementById('floor-inner');
  if(fi) fi.style.width=(vw*2.8)+'px';
  furni.style.cssText='position:absolute;inset:0;width:'+(vw*2.8)+'px;';
  const wall=document.getElementById('floor-wall');
  if(wall){
    wall.style.background='linear-gradient(180deg,#130826 0%,#1e0d3f 40%,#2a1255 70%,#1e0d3f 100%)';
    wall.style.boxShadow='inset 0 -3px 0 rgba(199,125,255,.25)';
    wall.style.borderTop='3px solid rgba(155,93,229,.35)';
    wall.style.outline='none';
    const friso=document.createElement('div');
    friso.style.cssText=`position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:0;background:linear-gradient(180deg,transparent 0%,transparent 28%,rgba(155,93,229,.06) 28%,rgba(155,93,229,.06) 29%,transparent 29%,transparent 55%,rgba(155,93,229,.06) 55%,rgba(155,93,229,.06) 56%,transparent 56%,transparent 78%,rgba(155,93,229,.06) 78%,rgba(155,93,229,.06) 79%,transparent 79%);`;
    wall.appendChild(friso);
    const rodape=document.createElement('div');
    rodape.style.cssText='position:absolute;bottom:0;left:0;right:0;height:6px;background:linear-gradient(90deg,rgba(155,93,229,.0),rgba(199,125,255,.5) 30%,rgba(199,125,255,.5) 70%,rgba(155,93,229,.0));pointer-events:none;z-index:1;';
    wall.appendChild(rodape);
  }
  const fg=document.getElementById('floor-fgrid');
  if(fg){fg.style.background='repeating-linear-gradient(90deg,#0a0018 0px,#0a0018 39px,#140030 39px,#140030 40px)';fg.style.borderTop='3px solid rgba(199,125,255,.35)';}
  const fgridH=Math.round((vh-44)*0.18);
  function gi(src,leftPx,widthPx,z=4){const e=document.createElement('img');e.src=src;e.style.cssText=`position:absolute;bottom:${fgridH}px;left:${leftPx}px;width:${widthPx}px;height:auto;image-rendering:pixelated;z-index:${z};`;return e;}
  const luzSize=Math.round(vw*0.18);
  const luzLimit=Math.round(vw*1.12);
  for(let x=0;x<luzLimit;x+=luzSize){const lz=document.createElement('img');lz.src="IMG/LuzesRes.png";lz.style.cssText=`position:absolute;top:0;left:${x}px;width:${luzSize}px;height:auto;image-rendering:pixelated;z-index:1;pointer-events:none;`;furni.appendChild(lz);}
  const pilarH=Math.round((vh-44)*0.82);
  const pilarW=Math.round(vw*0.018);
  [Math.round(vw*0.30),Math.round(vw*0.70),Math.round(vw*1.05),Math.round(vw*2.00),Math.round(vw*2.50)].forEach(lx=>{
    const p=document.createElement('div');
    p.style.cssText=`position:absolute;bottom:${fgridH}px;left:${lx}px;width:${pilarW}px;height:${pilarH}px;background:linear-gradient(90deg,#1a0638,#4a1888 30%,#6a28b8 50%,#4a1888 70%,#1a0638);box-shadow:0 0 14px rgba(155,93,229,.4),inset 0 0 8px rgba(255,255,255,.05);z-index:3;pointer-events:none;`;
    const cap=document.createElement('div');cap.style.cssText=`position:absolute;top:0;left:${-Math.round(pilarW*0.4)}px;width:${Math.round(pilarW*1.8)}px;height:${Math.round(pilarW*1.2)}px;background:linear-gradient(180deg,#7a30d0,#4a1888);border-radius:2px 2px 0 0;box-shadow:0 0 8px rgba(155,93,229,.5);`;
    const base=document.createElement('div');base.style.cssText=`position:absolute;bottom:0;left:${-Math.round(pilarW*0.4)}px;width:${Math.round(pilarW*1.8)}px;height:${Math.round(pilarW*1.2)}px;background:linear-gradient(180deg,#4a1888,#2a0858);border-radius:0 0 2px 2px;`;
    p.appendChild(cap);p.appendChild(base);furni.appendChild(p);
  });
  const winHeight=Math.round((vh-44)*0.30);
  const winWid=Math.round(vw*0.09);
  const winTop=Math.round((vh-44)*0.18);
  [Math.round(vw*0.34),Math.round(vw*0.56),Math.round(vw*0.78)].forEach(lx=>{
    const wframe=document.createElement('div');
    wframe.style.cssText=`position:absolute;top:${winTop}px;left:${lx}px;width:${winWid}px;height:${winHeight}px;background:linear-gradient(160deg,#0a1828,#0d2040 60%,#081420);border:3px solid #3a1870;border-radius:${Math.round(winWid*0.45)}px ${Math.round(winWid*0.45)}px 2px 2px;z-index:2;box-shadow:0 0 16px rgba(80,40,200,.4),inset 0 0 20px rgba(0,0,40,.8);overflow:hidden;pointer-events:none;`;
    const refl=document.createElement('div');refl.style.cssText=`position:absolute;top:0;left:10%;width:25%;height:100%;background:linear-gradient(180deg,rgba(255,255,255,.08),transparent 60%);border-radius:inherit;`;
    const crossH=document.createElement('div');crossH.style.cssText=`position:absolute;top:${Math.round(winHeight*0.45)}px;left:0;right:0;height:2px;background:rgba(80,40,180,.5);`;
    const crossV=document.createElement('div');crossV.style.cssText=`position:absolute;top:0;bottom:0;left:50%;width:2px;background:rgba(80,40,180,.5);transform:translateX(-50%);`;
    for(let i=0;i<5;i++){const star=document.createElement('div');const sx=10+Math.floor(Math.sin(i*137)*60);const sy=10+Math.floor(Math.cos(i*97)*35);star.style.cssText=`position:absolute;left:${Math.max(5,Math.min(85,sx))}%;top:${Math.max(5,Math.min(80,sy))}%;width:2px;height:2px;background:rgba(200,220,255,.6);border-radius:50%;`;wframe.appendChild(star);}
    wframe.appendChild(refl);wframe.appendChild(crossH);wframe.appendChild(crossV);furni.appendChild(wframe);
  });
  const bancW=Math.round(vw*0.28);
  furni.appendChild(gi("IMG/BnacadaRes.png",0,bancW,4));
  furni.appendChild(gi("IMG/FlorRes.png",bancW+10,Math.round(vw*0.04),4));
  const cadW=Math.round(vw*0.17);
  furni.appendChild(gi("IMG/CadeirasRes.png",Math.round(vw*0.36),cadW,4));
  furni.appendChild(gi("IMG/CadeirasRes.png",Math.round(vw*0.60),cadW,4));
  furni.appendChild(gi("IMG/DecoRes.png",Math.round(vw*0.85),Math.round(vw*0.13),4));
  const hint=document.createElement('div');hint.id='res-menu-hint';hint.className='hint-jogo';hint.style.bottom='40%';hint.style.left='80px';hint.textContent='[E] Ver Cardápio';furni.appendChild(hint);
  const midCenter=vw*1.42;
  const elevWrap=document.getElementById('floor-elev-wrap');
  if(elevWrap)elevWrap.style.left=(vw*1.83)+'px';
  const winW=Math.round(vw*0.60);
  const win=document.createElement('div');
  win.style.cssText=`position:absolute;top:0;bottom:18%;left:${midCenter-winW/2}px;width:${winW}px;border-left:10px solid #1a0840;border-right:10px solid #1a0840;border-top:10px solid #1a0840;overflow:hidden;z-index:2;box-shadow:inset 0 0 40px rgba(0,0,40,.6),0 0 30px rgba(0,0,80,.4);`;
  const wc=document.createElement('canvas');wc.style.cssText='width:100%;height:100%;';win.appendChild(wc);
  const divider=document.createElement('div');divider.style.cssText='position:absolute;left:50%;top:0;bottom:0;width:8px;background:#1a0840;transform:translateX(-50%);pointer-events:none;z-index:3;';win.appendChild(divider);
  furni.appendChild(win);
  requestAnimationFrame(()=>{wc.width=wc.offsetWidth||600;wc.height=wc.offsetHeight||500;drawRestaurantCity(wc);});
  const lustre=document.createElement('img');lustre.src="IMG/LustreRes.png";lustre.style.cssText=`position:absolute;top:0;left:${midCenter}px;transform:translateX(-50%);width:${Math.round(vw*0.22)}px;height:auto;image-rendering:pixelated;z-index:6;filter:drop-shadow(0 0 18px rgba(255,180,80,.8));`;furni.appendChild(lustre);
  const loungeW=Math.round(vw*0.14);
  furni.appendChild(gi("IMG/CadeiraLoungerRes.png",midCenter-loungeW-Math.round(vw*0.05),loungeW,4));
  furni.appendChild(gi("IMG/CadeiraLoungerRes.png",midCenter+Math.round(vw*0.05),loungeW,4));
  furni.appendChild(gi('IMG/BarRes.png',Math.round(vw*2.05),Math.round(vw*0.13),4));
  furni.appendChild(gi('IMG/PortaRes.png',Math.round(vw*2.26),Math.round(vw*0.18),4));
  furni.appendChild(gi('IMG/BanheiroRes.png',Math.round(vw*2.58),Math.round(vw*0.18),4));
  const garcom=document.createElement('div');
  garcom.id='res-garcom';
  garcom.style.cssText=`position:absolute;bottom:${fgridH}px;left:${Math.round(vw*2.29)}px;display:none;flex-direction:column;align-items:center;z-index:8;transition:opacity .3s;`;
  garcom.innerHTML=`<div id="res-garcom-bandeja" style="margin-bottom:6px;position:relative;"><div id="garcom-item-glow" style="position:absolute;inset:-6px;background:rgba(255,200,80,.25);border-radius:50%;animation:neonPulse 1s ease-in-out infinite;pointer-events:none;display:none;"></div></div><img src="IMG/Garcom.png" style="height:clamp(120px,16vw,220px);image-rendering:pixelated;object-fit:contain;">`;
  furni.appendChild(garcom);
  const garcomHint=document.createElement('div');garcomHint.id='garcom-collect-hint';garcomHint.className='hint-jogo amarelo';garcomHint.style.bottom=(fgridH+Math.round((vh-44)*0.30))+'px';garcomHint.style.left=Math.round(vw*2.26)+'px';garcomHint.textContent='[E] Pegar pedido! 🍽️';furni.appendChild(garcomHint);
  const arrow=document.createElement('div');arrow.id='garcom-arrow';arrow.style.cssText=`position:absolute;bottom:${fgridH+Math.round((vh-44)*0.40)}px;left:0;display:none;font-family:'Press Start 2P',monospace;font-size:clamp(10px,1.5vw,18px);color:#ffe066;text-shadow:0 0 10px #ffaa00;z-index:30;pointer-events:none;animation:neonPulse 0.6s ease-in-out infinite;`;arrow.textContent='→ garçom';furni.appendChild(arrow);
  const barHint=document.createElement('div');barHint.id='bar-hint';barHint.className='hint-jogo';barHint.style.bottom=(fgridH+Math.round((vh-44)*0.14))+'px';barHint.style.left=Math.round(vw*2.06)+'px';barHint.textContent='[E] Cardápio do bar';furni.appendChild(barHint);
  const bathHint=document.createElement('div');bathHint.id='bath-hint';bathHint.className='hint-jogo';bathHint.style.bottom=(fgridH+Math.round((vh-44)*0.14))+'px';bathHint.style.left=Math.round(vw*2.58)+'px';bathHint.textContent='[E] Usar banheiro';furni.appendChild(bathHint);
  jogadorXAndar=Math.round(window.innerWidth*1.895);
}

function drawRestaurantCity(canvas){
  const w=canvas.width,h=canvas.height,ctx=canvas.getContext('2d');
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#050d1a');sky.addColorStop(0.6,'#0a1830');sky.addColorStop(1,'#0d2040');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  ctx.beginPath();ctx.arc(w*0.82,h*0.18,h*0.09,0,Math.PI*2);ctx.fillStyle='#d4e8ff';ctx.fill();ctx.beginPath();ctx.arc(w*0.85,h*0.16,h*0.08,0,Math.PI*2);ctx.fillStyle='#050d1a';ctx.fill();
  for(let i=0;i<40;i++){const sx=(i*137.5)%w,sy=(i*97.3)%(h*0.55);ctx.fillStyle=`rgba(255,255,255,${0.3+Math.random()*0.7})`;ctx.fillRect(sx,sy,1,1);}
  const buildings=[{x:0,w:w*.08,h:h*.65,c:'#0d1e30'},{x:w*.07,w:w*.06,h:h*.45,c:'#0a1828'},{x:w*.12,w:w*.09,h:h*.75,c:'#0f2236'},{x:w*.20,w:w*.07,h:h*.55,c:'#0d1e30'},{x:w*.26,w:w*.1,h:h*.8,c:'#122840'},{x:w*.35,w:w*.06,h:h*.5,c:'#0a1828'},{x:w*.40,w:w*.08,h:h*.7,c:'#0f2236'},{x:w*.47,w:w*.05,h:h*.42,c:'#0d1e30'},{x:w*.51,w:w*.09,h:h*.78,c:'#122840'},{x:w*.59,w:w*.07,h:h*.52,c:'#0a1828'},{x:w*.65,w:w*.1,h:h*.68,c:'#0f2236'},{x:w*.74,w:w*.06,h:h*.48,c:'#0d1e30'},{x:w*.79,w:w*.08,h:h*.72,c:'#122840'},{x:w*.86,w:w*.07,h:h*.58,c:'#0a1828'},{x:w*.92,w:w*.08,h:h*.65,c:'#0f2236'}];
  buildings.forEach(b=>{ctx.fillStyle=b.c;ctx.fillRect(b.x,h-b.h,b.w,b.h);const cols=Math.floor(b.w/8),rows=Math.floor(b.h/10);for(let r=1;r<rows-1;r++)for(let c=0;c<cols;c++)if(Math.random()<0.5){ctx.fillStyle=Math.random()<0.3?'#ffdd88':'rgba(100,180,255,0.6)';ctx.fillRect(b.x+c*8+2,h-b.h+r*10+2,4,5);}});
  const glow=ctx.createLinearGradient(0,h*.85,0,h);glow.addColorStop(0,'transparent');glow.addColorStop(1,'rgba(255,100,50,.15)');ctx.fillStyle=glow;ctx.fillRect(0,h*.85,w,h*.15);
}

let andarAtual=0;
const FLOOR_CFG={1:{name:'1º ANDAR – Restaurante 🍽️',wallColor:'#6a3a8a',floorColor:'#7a4a9a'},2:{name:'2º ANDAR – Academia 💪',wallColor:'#1a1a2e',floorColor:'#16213e'},3:{name:'3º ANDAR – Apartamento 🛋️',wallColor:'#1a0e2e',floorColor:'#120a20'}};


// ═══════════════════════════════════════
// ANDARES — entrada e saída
// ═══════════════════════════════════════
function entrarAndar(floorNum){
  if(andarAberto)return;andarAtual=floorNum;andarAberto=true;const cfg=FLOOR_CFG[floorNum];
  document.getElementById('floor-hud-name').textContent=cfg.name;
  document.getElementById('floor-hud').style.borderBottomColor=floorNum===1?'#ffaa44':floorNum===2?'#00ff88':'#c77dff';
  const wall=document.getElementById('floor-wall');if(wall)wall.style.background=`linear-gradient(180deg,${cfg.wallColor},${cfg.floorColor})`;
  const fen=document.getElementById('floor-elev-num');if(fen)fen.textContent=FNUMS[floorNum];
  const fbtns=document.getElementById('floor-elev-btns');
  if(fbtns){fbtns.innerHTML='';if(floorNum<3){const b=document.createElement('button');b.className='elev-call-btn up';b.innerHTML='▲';b.title='Subir';b.onclick=(e)=>{e.stopPropagation();entrarInteriorElevador();};fbtns.appendChild(b);}if(floorNum>0){const b=document.createElement('button');b.className='elev-call-btn dn';b.innerHTML='▼';b.title='Descer';b.onclick=(e)=>{e.stopPropagation();entrarInteriorElevador();};fbtns.appendChild(b);}}
  const fpi=document.getElementById('floor-player-img');if(fpi&&CHARS[personagemEscolhido])fpi.src=CHARS[personagemEscolhido];
  const furni=document.getElementById('floor-furni');if(furni){if(floorNum===1)construirAndar1(furni);else if(floorNum===2)construirAndar2(furni);else if(floorNum===3)construirAndar3(furni);else furni.innerHTML='';}
  tr('ENTER_FLOOR_'+FNUMS[floorNum],'FLOOR_'+FNUMS[floorNum]);document.getElementById('hud-floor').textContent=cfg.name;
  if(floorNum===1) setTimeout(()=>notificar('Bem-vindo ao Restaurante! · Bancada: Cardápio · Bar: Drinks · Banheiro: [E]'),400);
  if(floorNum===2) setTimeout(()=>notificar('Bem-vindo à Academia! · Equipamentos: [E] Treinar · Bebedouro: [E] Beber · Vestiário: [E]'),400);
  if(floorNum===3) setTimeout(()=>notificar('3º Andar — Seu apartamento é o 302. Use [E] nas portas.'),400);
  document.getElementById('floor-scene').classList.add('show');
  const fp=document.getElementById('floor-player');
  if(fp){
    fp.style.left=jogadorXAndar+'px';
    fp.style.overflow='visible';
    fp.classList.remove('flip');
    fp.onclick=null;
    const oldFi=document.getElementById('floor-item');
    if(oldFi) oldFi.remove();
    const fi2=document.createElement('img');
    fi2.id='floor-item';fi2.src='';fi2.className='floor-item-base';
    fi2.onclick=(e)=>{e.stopPropagation();consumirItem();};
    fp.appendChild(fi2);
  }
  document.getElementById('floor-door-l').classList.remove('open');document.getElementById('floor-door-r').classList.remove('open');
  requestAnimationFrame(loopAndar);
}

function sairAndar(){
  tr('LEAVE_FLOOR','ELEV_OPEN');transElev('ENTRAR_ELEVADOR','PORTAS_ABERTAS');
  document.getElementById('floor-door-l').classList.add('open');document.getElementById('floor-door-r').classList.add('open');
  setTimeout(()=>{document.getElementById('floor-scene').classList.remove('show');andarAberto=false;const ep=document.getElementById('elev-player-int');if(ep)ep.src=CHARS_RAW[personagemEscolhido]||'';atualizarInteriorElev();document.getElementById('hud-floor').textContent=FLOORS[andarAtualElev];portasAbertas=true;document.getElementById('int-door-l').classList.add('int-open');document.getElementById('int-door-r').classList.add('int-open');const rb2=document.getElementById('recep-bubble');if(rb2)rb2.classList.remove('show');document.getElementById('elev-interior').classList.add('show');notificar('Escolha o andar! 🛗');},400);
}


let actx=null;
function getContextoAudio(){if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)();return actx;}
function tocarTom(f,d,type='square'){try{const c=getContextoAudio(),o=c.createOscillator(),g=c.createGain();o.type=type;o.connect(g);g.connect(c.destination);o.frequency.value=f;g.gain.setValueAtTime(.06,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.start();o.stop(c.currentTime+d);}catch(e){}}
function tocarChegada(){tocarTom(440,.08);setTimeout(()=>tocarTom(550,.08),100);setTimeout(()=>tocarTom(660,.1),200);}

function fecharModal(id){document.getElementById(id).classList.remove('show');modalAberto=false;if(id==='report-modal'&&estadoAtual==='FINALIZE')tr('CLOSE_REPORT','LOBBY_IDLE');}

// ═══════════════════════════════════════
// RELATÓRIO AFD
// ═══════════════════════════════════════
function abrirRelatorio(final=false){
  modalAberto=true;
  const cn={mulher:'Helo 👩',homem:'Pedro 👨',gato:'Apollo 🐱'};
  const dur=Math.round((new Date()-t0)/1000);
  const sw=document.getElementById('afd-states');
  sw.innerHTML='';
  ELEV_STATES.forEach(s=>{
    const div=document.createElement('div');
    div.className='sc';
    if(s===estadoAtualElev) div.classList.add('cur');
    else if(visitadosElev.has(s)) div.classList.add('vis');
    div.innerHTML=`<span style="font-size:5px;opacity:.7">${s}</span><br><span style="font-size:4px;color:var(--lilac)">${(ELEV_STATES_LABELS[s]||'').replace(/^[^ ]+ /,'')}</span>`;
    sw.appendChild(div);
  });
  const lEl=document.getElementById('afd-log');
  lEl.innerHTML=logAfdElev.length===0
    ?'<span style="opacity:.4">Nenhuma transição ainda.</span>'
    :logAfdElev.map(e=>`<div class="lr"><span class="lt">${e.t}</span> <span class="lf">${ELEV_STATES_LABELS[e.from]||e.from}</span> <span class="le">──[${e.ev}]──▶</span> <span style="color:#c77dff">${ELEV_STATES_LABELS[e.to]||e.to}</span></div>`).join('');
  lEl.scrollTop=lEl.scrollHeight;
  document.getElementById('afd-path').innerHTML='<span style="color:var(--pink2)">'+
    caminhoAfdElev.map(s=>ELEV_STATES_LABELS[s]||s).join('<br>──▶ ')+'</span>';
  const andares=[...visitadosElev].filter(s=>['FLOOR_1','FLOOR_2','FLOOR_3','PARADO_TERREO'].includes(s)).map(s=>ELEV_STATES_LABELS[s]).join(', ')||'Nenhum';
  const nViagens=logAfdElev.filter(e=>e.ev.startsWith('PRESSIONAR')||e.ev.startsWith('SELECIONAR')).length;
  document.getElementById('afd-summary').innerHTML=
    `<b style="color:var(--mint)">Personagem:</b> ${cn[personagemEscolhido]}<br>`+
    `<b style="color:var(--mint)">Estado atual:</b> ${ELEV_STATES_LABELS[estadoAtualElev]||estadoAtualElev}<br>`+
    `<b style="color:var(--mint)">Andares visitados:</b> ${andares}<br>`+
    `<b style="color:var(--mint)">Total de viagens:</b> ${nViagens}<br>`+
    `<b style="color:var(--mint)">Transições:</b> ${logAfdElev.length}<br>`+
    `<b style="color:var(--mint)">Duração da sessão:</b> ${dur}s`;
  desenharDiagramaAFD();
  document.getElementById('report-modal').classList.add('show');
  if(final) transElev('FINALIZAR','PARADO_TERREO');
}

// ═══════════════════════════════════════
// DIAGRAMA AFD — COM ESTADOS INTERMEDIÁRIOS
// ═══════════════════════════════════════
function desenharDiagramaAFD(){
  const cv=document.getElementById('afd-canvas');
  if(!cv) return;
  const ctx=cv.getContext('2d');
  const W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#06001a';
  ctx.fillRect(0,0,W,H);

  const nos={
    'PARADO_TERREO'  :{x:210, y:295, label:'PARADO\nTÉRREO',   cor:'#ff4488'},
    'PORTAS_ABERTAS' :{x:90,  y:210, label:'PORTAS\nABERTAS',  cor:'#44ddff'},
    'PORTAS_FECHANDO':{x:330, y:210, label:'PORTAS\nFECHANDO', cor:'#ffaa00'},
    'SUBINDO'        :{x:330, y:130, label:'SUBINDO',           cor:'#88ff66'},
    'DESCENDO'       :{x:90,  y:130, label:'DESCENDO',          cor:'#88ff66'},
    'PASSANDO_1'     :{x:210, y:175, label:'PASSANDO\nAND. 1', cor:'#ff9fd6'},
    'PASSANDO_2'     :{x:210, y:105, label:'PASSANDO\nAND. 2', cor:'#ff9fd6'},
    'CHEGOU'         :{x:210, y:40,  label:'CHEGOU',            cor:'#ffee44'},
    'FLOOR_1'        :{x:50,  y:295, label:'ANDAR 1',           cor:'#c77dff'},
    'FLOOR_2'        :{x:370, y:295, label:'ANDAR 2',           cor:'#c77dff'},
    'FLOOR_3'        :{x:210, y:295, label:'ANDAR 3',           cor:'#c77dff'},
  };

  // Ajuste: FLOOR_3 não pode ficar em cima de PARADO_TERREO
  nos['FLOOR_3'].x=210; nos['FLOOR_3'].y=40;
  nos['CHEGOU'].x=380;  nos['CHEGOU'].y=40;
  nos['PASSANDO_2'].x=210; nos['PASSANDO_2'].y=100;
  nos['PASSANDO_1'].x=210; nos['PASSANDO_1'].y=165;
  nos['SUBINDO'].x=330;    nos['SUBINDO'].y=130;
  nos['DESCENDO'].x=90;    nos['DESCENDO'].y=130;

  const arestas=[
    {de:'PARADO_TERREO',  para:'PORTAS_ABERTAS',  ev:'ABRIR'},
    {de:'PORTAS_ABERTAS', para:'PORTAS_FECHANDO', ev:'FECHAR'},
    {de:'PORTAS_FECHANDO',para:'SUBINDO',         ev:'MOVER↑'},
    {de:'PORTAS_FECHANDO',para:'DESCENDO',        ev:'MOVER↓'},
    {de:'SUBINDO',        para:'PASSANDO_1',      ev:'PASSAR F1'},
    {de:'SUBINDO',        para:'PASSANDO_2',      ev:'PASSAR F2'},
    {de:'DESCENDO',       para:'PASSANDO_2',      ev:'PASSAR F2'},
    {de:'DESCENDO',       para:'PASSANDO_1',      ev:'PASSAR F1'},
    {de:'PASSANDO_1',     para:'PASSANDO_2',      ev:'CONTINUA↑'},
    {de:'PASSANDO_2',     para:'PASSANDO_1',      ev:'CONTINUA↓'},
    {de:'SUBINDO',        para:'CHEGOU',          ev:'CHEGOU'},
    {de:'DESCENDO',       para:'CHEGOU',          ev:'CHEGOU'},
    {de:'PASSANDO_1',     para:'CHEGOU',          ev:'CHEGOU'},
    {de:'PASSANDO_2',     para:'CHEGOU',          ev:'CHEGOU'},
    {de:'CHEGOU',         para:'PORTAS_ABERTAS',  ev:'ABRIR'},
    {de:'CHEGOU',         para:'FLOOR_1',         ev:'→ F1'},
    {de:'CHEGOU',         para:'FLOOR_2',         ev:'→ F2'},
    {de:'CHEGOU',         para:'FLOOR_3',         ev:'→ F3'},
    {de:'FLOOR_1',        para:'PARADO_TERREO',   ev:'→ T'},
    {de:'FLOOR_2',        para:'PARADO_TERREO',   ev:'→ T'},
    {de:'FLOOR_3',        para:'PARADO_TERREO',   ev:'→ T'},
  ];

  const r=20;
  arestas.forEach(a=>{
    const A=nos[a.de], B=nos[a.para];
    if(!A||!B) return;
    const visitada=logAfdElev.some(e=>e.from===a.de&&e.to===a.para);
    ctx.strokeStyle=visitada?'rgba(199,125,255,.7)':'rgba(255,255,255,.12)';
    ctx.lineWidth=visitada?2:1;
    ctx.setLineDash(visitada?[]:[4,4]);
    const dx=B.x-A.x, dy=B.y-A.y, dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<1) return;
    const sx=A.x+(dx/dist)*r, sy=A.y+(dy/dist)*r;
    const ex=B.x-(dx/dist)*r, ey=B.y-(dy/dist)*r;
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();
    const ang=Math.atan2(ey-sy,ex-sx);
    ctx.fillStyle=visitada?'rgba(199,125,255,.7)':'rgba(255,255,255,.12)';
    ctx.beginPath();
    ctx.moveTo(ex,ey);
    ctx.lineTo(ex-10*Math.cos(ang-0.4),ey-10*Math.sin(ang-0.4));
    ctx.lineTo(ex-10*Math.cos(ang+0.4),ey-10*Math.sin(ang+0.4));
    ctx.closePath();ctx.fill();
    if(visitada){
      ctx.fillStyle='rgba(255,220,100,.7)';
      ctx.font='bold 7px monospace';
      ctx.textAlign='center';
      ctx.fillText(a.ev,(sx+ex)/2,(sy+ey)/2-5);
    }
    ctx.setLineDash([]);
  });

  Object.entries(nos).forEach(([id,n])=>{
    const visitado=visitadosElev.has(id);
    const atual=estadoAtualElev===id;
    ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);
    ctx.fillStyle=atual?n.cor:visitado?n.cor+'44':'#0e0030';
    ctx.fill();
    ctx.strokeStyle=atual?n.cor:visitado?n.cor:'rgba(255,255,255,.15)';
    ctx.lineWidth=atual?3:visitado?2:1;
    ctx.stroke();
    if(atual){ctx.beginPath();ctx.arc(n.x,n.y,r+5,0,Math.PI*2);ctx.strokeStyle=n.cor+'66';ctx.lineWidth=3;ctx.stroke();}
    ctx.fillStyle=atual?'#fff':visitado?'rgba(255,255,255,.9)':'rgba(255,255,255,.3)';
    ctx.font=`bold ${atual?8:7}px monospace`;
    ctx.textAlign='center';
    const linhas=n.label.split('\n');
    linhas.forEach((l,i)=>ctx.fillText(l,n.x,n.y+3+(i-(linhas.length-1)/2)*10));
  });

  ctx.fillStyle='rgba(199,125,255,.5)';
  ctx.font='6px monospace';ctx.textAlign='left';
  ctx.fillText('● Visitado  ○ Não visitado  ✦ Estado atual',8,H-8);
}

function voltarSelecao(){
  document.getElementById('report-modal').classList.remove('show');modalAberto=false;
  const ov=document.getElementById('trans-ov');document.getElementById('t-ico').textContent='👋';document.getElementById('t-txt').textContent='Até logo!';ov.classList.add('show');
  setTimeout(()=>{
    document.getElementById('hud').style.display='none';document.getElementById('viewport').classList.remove('active');document.getElementById('ctrl-hint').style.display='none';document.getElementById('floor-scene').classList.remove('show');andarAberto=false;
    estadoAtual='LOBBY_IDLE';logAfd=[];caminhoAfd=['LOBBY_IDLE'];visitados=new Set(['LOBBY_IDLE']);t0=new Date();
    logAfdElev=[];caminhoAfdElev=['PARADO_TERREO'];visitadosElev=new Set(['PARADO_TERREO']);estadoAtualElev='PARADO_TERREO';
    andarAtualElev=0;elevadorEmMovimento=false;contadorDoces=0;itemNaMao=null;jogadorX=0;teclas={};teclasAndar={};modalAberto=false;olhandoDireita=true;
    document.getElementById('door-l').classList.remove('open');document.getElementById('door-r').classList.remove('open');
    document.getElementById('elev-num').textContent='T';document.getElementById('elev-num').style.color='#ff2222';
    document.getElementById('elev-interior').classList.remove('show');document.getElementById('elev-travel').classList.remove('show');
    document.getElementById('screen-start').style.display='flex';iniciarStartScreen();ov.classList.remove('show');
  },900);
}

let resMusic=null;
function playRestaurantMusic(){
  stopRestaurantMusic();
  try{const ctx=getContextoAudio();const master=ctx.createGain();master.gain.value=0.12;master.connect(ctx.destination);const notes=[261,293,329,349,392,440,493,523];const melody=[4,5,6,5,4,2,0,2,4,4,4,2,2,2,4,7,7,4,5,6,5,4,2,0,2,4,4,4,2,2,4,2,0];const beat=0.42;let stopped=false;resMusic={stop:()=>{stopped=true;try{master.disconnect();}catch(e){}}};function playNote(idx){if(stopped)return;if(idx>=melody.length){setTimeout(()=>playNote(0),beat*200);return;}const freq=notes[melody[idx]%notes.length];const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(0.4,ctx.currentTime+0.04);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+beat*0.8);o.connect(g);g.connect(master);o.start();o.stop(ctx.currentTime+beat);setTimeout(()=>playNote(idx+1),beat*1000);}setTimeout(()=>playNote(0),300);}catch(e){}
}
function stopRestaurantMusic(){if(resMusic){resMusic.stop();resMusic=null;}}

let menuResAberto=false;
function abrirMenuRestaurante(){
  if(menuResAberto)return;menuResAberto=true;modalAberto=true;
  const items=[{name:'🍕 Pizza',img:()=>"IMG/Pizza.png"},{name:'🍝 Macarrão',img:()=>"IMG/Macarrao.png"},{name:'🍱 Sushi',img:()=>"IMG/Sushi.png"},{name:'🥗 Legumes',img:()=>"IMG/Legumes.png"},{name:'🍔 Combo',img:()=>"IMG/Combo.png"},{name:'🎂 Bolo',img:()=>"IMG/Bolo.png"},{name:'🍨 Sorvete',img:()=>"IMG/Sorvete.png"},{name:'🍮 Pudim',img:()=>"IMG/Pudim.png"},{name:'🥤 Limonada',img:()=>"IMG/Limonada.png"},{name:'🍊 Suco',img:()=>"IMG/SucoLaranjaRes.png"},{name:'🥤 Soda',img:()=>"IMG/Refri.png"}];
  const modal=document.getElementById('res-menu-modal');const grid=document.getElementById('res-menu-grid');grid.innerHTML='';
  items.forEach(item=>{const el=document.createElement('div');el.className='item-menu';el.onclick=()=>{fecharMenuRestaurante();chamarGarcom(item.name,item.img());};const img=document.createElement('img');img.src=item.img();const lbl=document.createElement('div');lbl.className='item-menu-label';lbl.textContent=item.name;el.appendChild(img);el.appendChild(lbl);grid.appendChild(el);});
  modal.classList.add('show');
}
function fecharMenuRestaurante(){document.getElementById('res-menu-modal').classList.remove('show');menuResAberto=false;modalAberto=false;}

let menuBarAberto=false;
function abrirMenuBar(){
  if(menuBarAberto)return;menuBarAberto=true;modalAberto=true;
  const items=[{name:'🍹 Caipirinha',img:'IMG/Caipirinha.png'},{name:'🌊 Ceu Azul',img:'IMG/Ceuazul.png'},{name:'🥃 Morrito',img:'IMG/Morrito.png'}];
  const modal=document.getElementById('res-menu-modal');
  modal.querySelector('.modal-title').textContent='🍹 Cardápio do Bar';
  const grid=document.getElementById('res-menu-grid');grid.innerHTML='';
  items.forEach(item=>{const el=document.createElement('div');el.className='item-menu';el.onclick=()=>{fecharMenuBar();chamarGarcom(item.name,item.img);};const img=document.createElement('img');img.src=item.img;const lbl=document.createElement('div');lbl.className='item-menu-label';lbl.textContent=item.name;el.appendChild(img);el.appendChild(lbl);grid.appendChild(el);});
  modal.classList.add('show');
}
function fecharMenuBar(){
  document.getElementById('res-menu-modal').classList.remove('show');
  document.getElementById('res-menu-modal').querySelector('.modal-title').textContent='🍽️ Cardápio do Restaurante';
  menuBarAberto=false;modalAberto=false;
}

function chamarGarcom(itemName,itemImg){
  const garcom=document.getElementById('res-garcom');const bandeja=document.getElementById('res-garcom-bandeja');
  if(!garcom||!bandeja) return;
  const glow=document.getElementById('garcom-item-glow');bandeja.innerHTML='';if(glow)bandeja.appendChild(glow);
  if(itemImg){const bi=document.createElement('img');bi.src=itemImg;bi.style.cssText='width:clamp(34px,4.5vw,56px);height:auto;image-rendering:pixelated;position:relative;z-index:1;';bandeja.appendChild(bi);}
  else{const sp=document.createElement('span');sp.textContent=itemName.split(' ')[0];sp.style.cssText='font-size:clamp(22px,3vw,38px);position:relative;z-index:1;';bandeja.appendChild(sp);}
  if(glow)glow.style.display='block';garcom.style.display='flex';
  notificar('🧑‍🍳 Garçom chegou na porta! Vá buscar com [E]');
  tocarTom(523,.08);setTimeout(()=>tocarTom(659,.08),80);setTimeout(()=>tocarTom(784,.1),160);
  _itemGarcom={name:itemName,img:itemImg||null};
}

let _itemGarcom=null;
let usandoBanheiro=false;
let _timerBanheiro=null;

function pegarItemGarcom(){
  if(!_itemGarcom) return;
  const garcom=document.getElementById('res-garcom');if(garcom)garcom.style.display='none';
  const src=_itemGarcom.img||'';const name=_itemGarcom.name;
  itensStand['waiter']=src;itemNaMao='waiter';
  const fp=document.getElementById('floor-player');let pi=document.getElementById('floor-item');
  if(!pi&&fp){pi=document.createElement('img');pi.id='floor-item';pi.style.cssText='position:absolute;bottom:52%;right:-42%;width:36%;height:auto;image-rendering:pixelated;display:none;z-index:16;pointer-events:all;cursor:pointer;';pi.onclick=(e)=>{e.stopPropagation();consumirItem();};fp.appendChild(pi);}
  if(pi&&src){pi.src=src;pi.style.display='block';}
  const glow=document.getElementById('garcom-item-glow');if(glow)glow.style.display='none';
  const arrow=document.getElementById('garcom-arrow');if(arrow)arrow.style.display='none';
  notificar('Você pegou: '+name+'! Clique no personagem pra consumir 😋');
  tocarTom(440,.06);_itemGarcom=null;
}

function usarBanheiro(){
  if(usandoBanheiro) return;usandoBanheiro=true;
  const bathHint=document.getElementById('bath-hint');if(bathHint)bathHint.style.display='none';
  const overlay=document.createElement('div');overlay.id='bath-overlay';
  overlay.style.cssText='position:fixed;inset:0;z-index:700;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(3px);';
  overlay.innerHTML=`<div style="background:linear-gradient(180deg,#140030,#0a001a);border:3px solid #c77dff;border-radius:12px;padding:32px 48px;text-align:center;font-family:'Press Start 2P',monospace;box-shadow:0 0 40px rgba(199,125,255,.4);"><div style="font-size:clamp(24px,4vw,56px);margin-bottom:12px;">🚽</div><div style="color:#f0e6ff;font-size:clamp(7px,1vw,11px);margin-bottom:8px;">Usando o banheiro...</div><div id="bath-progress" style="width:200px;height:8px;background:rgba(255,255,255,.15);border-radius:4px;margin:10px auto 0;overflow:hidden;"><div id="bath-bar" style="height:100%;width:0%;background:#c77dff;border-radius:4px;transition:width 3s linear;"></div></div></div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(()=>{requestAnimationFrame(()=>{const bar=document.getElementById('bath-bar');if(bar)bar.style.width='100%';});});
  tocarTom(330,.12);
  _timerBanheiro=setTimeout(()=>{overlay.remove();usandoBanheiro=false;notificar('✅ Banheiro usado! Mãos limpas 🙌');tocarTom(523,.08);setTimeout(()=>tocarTom(659,.08),80);setTimeout(()=>tocarTom(784,.1),160);},3000);
}


// ═══════════════════════════════════════
// ACADEMIA — FLOOR 2
// ═══════════════════════════════════════
const GYM_EQUIP=[
  {id:'esteteira',  src:'IMG/esteteira-adcm.png', x:0.04, w:0.14,label:'Esteteira',  anim:'🏃 Correndo na esteira...'},
  {id:'bicicleta',  src:'IMG/bicicleta-acdm.png', x:0.22, w:0.12,label:'Bicicleta',  anim:'🚴 Pedalando...'},
  {id:'crossover',  src:'IMG/crossover-acdm.png', x:0.38, w:0.18,label:'Crossover',  anim:'💪 Fazendo crossover...'},
  {id:'puxada',     src:'IMG/puxada-alta-acdm.png',x:0.60,w:0.14,label:'Puxada Alta',anim:'💪 Fazendo puxada...'},
  {id:'legcurl',    src:'IMG/Leg-Curl-acdm.png',  x:0.78, w:0.14,label:'Leg Curl',   anim:'🦵 Fazendo leg curl...'},
  {id:'peso',       src:'IMG/peso-acdm.png',      x:0.98, w:0.13,label:'Pesos',      anim:'🏋️ Levantando peso...'},
  {id:'pesinhos',   src:'IMG/pesinhos-acdm.png',  x:1.14, w:0.12,label:'Halteres',   anim:'💪 Treinando com halteres...'},
  {id:'crosstrainer',src:'IMG/cross-trainer-acdm.png',x:1.30,w:0.14,label:'Cross-trainer',anim:'Treinando no cross-trainer...'},
  {id:'escada',     src:'IMG/escada-acdm.png',    x:1.48, w:0.13,label:'Escada',     anim:'Subindo escada...'},
];
let GYM_BEB_X=0,GYM_BEB_W=0,GYM_VEST_X=0,GYM_VEST_W=0;

function construirAndar2(furni){
  furni.innerHTML='';
  const vw=window.innerWidth,vh=window.innerHeight;
  const fi=document.getElementById('floor-inner');if(fi)fi.style.width=(vw*2.8)+'px';
  furni.style.cssText='position:absolute;inset:0;width:'+(vw*2.8)+'px;';
  const wall=document.getElementById('floor-wall');
  if(wall){
    wall.style.background='linear-gradient(180deg,#0d0d1a 0%,#1a1a2e 50%,#0d0d1a 100%)';
    const stripe=document.createElement('div');stripe.style.cssText='position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;background:repeating-linear-gradient(180deg,transparent 0px,transparent 58px,rgba(255,50,80,.04) 58px,rgba(255,50,80,.04) 60px);';wall.appendChild(stripe);
    const rodape=document.createElement('div');rodape.style.cssText='position:absolute;bottom:0;left:0;right:0;height:5px;background:linear-gradient(90deg,transparent,rgba(255,50,80,.6) 30%,rgba(255,50,80,.6) 70%,transparent);pointer-events:none;';wall.appendChild(rodape);
  }
  const fg=document.getElementById('floor-fgrid');
  if(fg){fg.style.background='repeating-linear-gradient(90deg,#0a0a14 0px,#0a0a14 39px,#141428 39px,#141428 40px)';fg.style.borderTop='3px solid rgba(255,50,80,.4)';}
  const fgridH=Math.round((vh-44)*0.18);
  function gi(src,leftPx,widthPx,z=4){const e=document.createElement('img');e.src=src;e.style.cssText=`position:absolute;bottom:${fgridH}px;left:${leftPx}px;width:${widthPx}px;height:auto;image-rendering:pixelated;z-index:${z};`;return e;}
  function mkHint(id,txt,leftPx,bottomPx){const h=document.createElement('div');h.id=id;h.className='hint-jogo';h.style.bottom=bottomPx+'px';h.style.left=leftPx+'px';h.textContent=txt;return h;}
  const mirrorW=Math.round(vw*1.62);const wallAreaH=Math.round((vh-44)*0.82);
  const mirrorWrap=document.createElement('div');mirrorWrap.style.cssText=`position:absolute;top:0;left:${Math.round(vw*0.02)}px;width:${mirrorW}px;height:${wallAreaH}px;z-index:1;pointer-events:none;overflow:hidden;`;
  const mirror=document.createElement('div');mirror.style.cssText=`position:absolute;inset:0;background:linear-gradient(108deg,rgba(220,235,255,.13) 0%,rgba(180,200,255,.07) 35%,rgba(200,220,255,.11) 60%,rgba(160,190,255,.05) 100%);border-right:3px solid rgba(200,215,255,.4);border-left:3px solid rgba(200,215,255,.2);`;
  const refl1=document.createElement('div');refl1.style.cssText=`position:absolute;top:0;left:8%;width:10%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent);transform:skewX(-6deg);`;
  const refl2=document.createElement('div');refl2.style.cssText=`position:absolute;top:0;left:28%;width:4%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent);transform:skewX(-6deg);`;
  const moldura=document.createElement('div');moldura.style.cssText=`position:absolute;inset:3px;border:1px solid rgba(200,220,255,.15);pointer-events:none;`;
  const linha=document.createElement('div');linha.style.cssText=`position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(200,220,255,.1);transform:translateY(-50%);`;
  mirror.appendChild(refl1);mirror.appendChild(refl2);mirror.appendChild(moldura);mirror.appendChild(linha);mirrorWrap.appendChild(mirror);furni.appendChild(mirrorWrap);
  GYM_EQUIP.forEach(eq=>{const img=gi(eq.src,Math.round(vw*eq.x),Math.round(vw*eq.w),4);img.id='gym-eq-'+eq.id;furni.appendChild(img);furni.appendChild(mkHint('gym-hint-'+eq.id,'[E] Treinar: '+eq.label,Math.round(vw*eq.x),fgridH+Math.round((vh-44)*0.12)));});
  const elevWrap=document.getElementById('floor-elev-wrap');if(elevWrap)elevWrap.style.left=(vw*1.88)+'px';
  const fi3=document.getElementById('floor-inner');if(fi3)fi3.style.width=(vw*3.6)+'px';furni.style.width=(vw*3.6)+'px';
  const fh=fgridH;const wallH2=Math.round((vh-44)*0.82);
  const indoorStart=Math.round(vw*2.22);const indoorW=Math.round(vw*0.55);
  const indoorWall=document.createElement('div');indoorWall.style.cssText=`position:absolute;top:0;left:${indoorStart}px;width:${indoorW}px;height:${wallH2}px;background:linear-gradient(180deg,#0d0d1a 0%,#1a1a2e 50%,#0d0d1a 100%);z-index:1;pointer-events:none;overflow:hidden;`;
  const iStripe=document.createElement('div');iStripe.style.cssText='position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0px,transparent 58px,rgba(255,50,80,.03) 58px,rgba(255,50,80,.03) 60px);';indoorWall.appendChild(iStripe);
  const iRodape=document.createElement('div');iRodape.style.cssText='position:absolute;bottom:0;left:0;right:0;height:5px;background:linear-gradient(90deg,transparent,rgba(255,50,80,.5) 30%,rgba(255,50,80,.5) 70%,transparent);';indoorWall.appendChild(iRodape);furni.appendChild(indoorWall);
  const bebW2=Math.round(vw*0.09);const _bebX=indoorStart+Math.round(indoorW*0.12);GYM_BEB_X=_bebX;GYM_BEB_W=bebW2;
  const beb2=gi('IMG/Bebedouro-acdm.png',_bebX,bebW2,5);beb2.id='gym-sp-bebedouro';furni.appendChild(beb2);furni.appendChild(mkHint('gym-hint-bebedouro','[E] Beber água',_bebX,fh+Math.round((vh-44)*0.12)));
  const vestW2=Math.round(vw*0.22);const _vestX=indoorStart+Math.round(indoorW*0.52);GYM_VEST_X=_vestX;GYM_VEST_W=vestW2;
  const vest2=gi('IMG/Vestiario-acmd.png',_vestX,vestW2,5);vest2.id='gym-sp-vestiario';furni.appendChild(vest2);furni.appendChild(mkHint('gym-hint-vestiario','[E] Usar: Vestiário',_vestX,fh+Math.round((vh-44)*0.12)));
  const signW=Math.round(indoorW*0.35);const sign=document.createElement('div');sign.style.cssText=`position:absolute;top:${Math.round(wallH2*0.08)}px;left:${indoorStart+Math.round(indoorW*0.28)}px;width:${signW}px;padding:8px 0;background:#111;border:3px solid #ff3250;border-radius:4px;text-align:center;font-family:'Press Start 2P',monospace;font-size:clamp(6px,.85vw,11px);color:#ff3250;letter-spacing:2px;text-shadow:0 0 10px #ff3250,0 0 22px rgba(255,50,80,.5);z-index:3;pointer-events:none;box-shadow:0 0 18px rgba(255,50,80,.35);`;sign.textContent='GYM';furni.appendChild(sign);
  const winH2=Math.round(wallH2*0.28);const winW2=Math.round(indoorW*0.18);const winTop2=Math.round(wallH2*0.22);
  [0.04,0.60].forEach(pct=>{const wf=document.createElement('div');wf.style.cssText=`position:absolute;top:${winTop2}px;left:${indoorStart+Math.round(indoorW*pct)}px;width:${winW2}px;height:${winH2}px;background:linear-gradient(160deg,#0a1828,#0d2040);border:3px solid #2a1870;border-radius:${Math.round(winW2*0.4)}px ${Math.round(winW2*0.4)}px 2px 2px;z-index:2;box-shadow:0 0 12px rgba(80,40,200,.3),inset 0 0 16px rgba(0,0,40,.8);overflow:hidden;pointer-events:none;`;const wr=document.createElement('div');wr.style.cssText='position:absolute;top:0;left:10%;width:20%;height:100%;background:linear-gradient(90deg,rgba(255,255,255,.06),transparent);';const wcH=document.createElement('div');wcH.style.cssText=`position:absolute;top:48%;left:0;right:0;height:2px;background:rgba(60,30,160,.5);`;const wcV=document.createElement('div');wcV.style.cssText=`position:absolute;top:0;bottom:0;left:50%;width:2px;background:rgba(60,30,160,.5);transform:translateX(-50%);`;wf.appendChild(wr);wf.appendChild(wcH);wf.appendChild(wcV);furni.appendChild(wf);});
  [{x:indoorStart+Math.round(indoorW*0.02),color:'#ff3250',text:'FORCE'},{x:indoorStart+Math.round(indoorW*0.72),color:'#00b4d8',text:'POWER'}].forEach(n=>{const nl=document.createElement('div');nl.style.cssText=`position:absolute;top:${Math.round(wallH2*0.62)}px;left:${n.x}px;font-family:'Press Start 2P',monospace;font-size:clamp(5px,.75vw,10px);color:${n.color};text-shadow:0 0 8px ${n.color},0 0 18px ${n.color}66;letter-spacing:3px;z-index:3;pointer-events:none;animation:neonPulse 2s ease-in-out infinite;`;nl.textContent=n.text;furni.appendChild(nl);});
  const dividerX=indoorStart+indoorW;const divWall=document.createElement('div');divWall.style.cssText=`position:absolute;top:0;left:${dividerX-6}px;width:12px;height:${wallH2}px;background:linear-gradient(90deg,#1a1a2e,#2a2a4a,#1a1a2e);z-index:6;pointer-events:none;box-shadow:2px 0 8px rgba(0,0,0,.5);`;furni.appendChild(divWall);
  const terraceStart=dividerX+6;const terraceW=Math.round(vw*0.90);
  const sky=document.createElement('div');sky.style.cssText=`position:absolute;top:0;left:${terraceStart}px;width:${terraceW}px;height:${wallH2}px;background:linear-gradient(180deg,#03000e 0%,#080222 60%,#0c0430 100%);z-index:1;pointer-events:none;overflow:hidden;`;
  const cols=10,rows=6;const cellW=Math.floor(terraceW/cols);const cellH=Math.floor(wallH2*0.65/rows);let si=0;
  for(let row=0;row<rows;row++){for(let col=0;col<cols;col++){si++;const jx=((si*167+col*83+row*53)%Math.max(1,cellW-4));const jy=((si*131+col*61+row*97)%Math.max(1,cellH-4));const sx=col*cellW+jx+2;const sy=row*cellH+jy+2;const bright=(0.4+((si*79)%55)/100);const sz=si%9===0?2:1;const s=document.createElement('div');s.className='estrela';s.style.left=sx+'px';s.style.top=sy+'px';s.style.width=sz+'px';s.style.height=sz+'px';s.style.background='rgba(255,255,255,'+bright.toFixed(2)+')';sky.appendChild(s);}}
  const mSz=Math.round(terraceW*0.07);const moon=document.createElement('div');moon.style.cssText=`position:absolute;right:${Math.round(terraceW*0.08)}px;top:${Math.round(wallH2*0.07)}px;width:${mSz}px;height:${mSz}px;border-radius:50%;background:#d8eaff;box-shadow:0 0 14px rgba(200,225,255,.4);overflow:hidden;`;const moonCut=document.createElement('div');moonCut.className='lua-crescente-corte';moonCut.style.background='#080222';moon.appendChild(moonCut);sky.appendChild(moon);furni.appendChild(sky);
  const deckH=Math.round((vh-44)*0.03);const deck=document.createElement('div');deck.style.cssText=`position:absolute;bottom:${fh}px;left:${terraceStart}px;width:${terraceW}px;height:${deckH}px;background:repeating-linear-gradient(90deg,#7a4e2d 0px,#7a4e2d 17px,#6a3e1e 17px,#6a3e1e 19px);border-top:2px solid #9a6840;z-index:5;pointer-events:none;`;furni.appendChild(deck);
  const railH=Math.round((vh-44)*0.16);const railBot=fh+deckH;
  [terraceStart,terraceStart+terraceW-4].forEach(lx=>{const post=document.createElement('div');post.style.cssText=`position:absolute;bottom:${railBot}px;left:${lx}px;width:4px;height:${railH}px;background:#999;z-index:6;pointer-events:none;`;furni.appendChild(post);});
  const railBar=document.createElement('div');railBar.style.cssText=`position:absolute;bottom:${railBot+railH-3}px;left:${terraceStart}px;width:${terraceW}px;height:4px;background:#bbb;z-index:6;pointer-events:none;box-shadow:0 2px 4px rgba(0,0,0,.3);`;furni.appendChild(railBar);
  const nBal=Math.floor(terraceW/20);for(let i=1;i<nBal;i++){const bal=document.createElement('div');bal.style.cssText=`position:absolute;bottom:${railBot}px;left:${terraceStart+Math.round(i*(terraceW/nBal))}px;width:2px;height:${railH}px;background:rgba(200,200,200,.5);z-index:6;pointer-events:none;`;furni.appendChild(bal);}
  const poolW=Math.round(terraceW*0.68);const poolH=Math.round((vh-44)*0.30);const poolL=terraceStart+Math.round((terraceW-poolW)/2);const poolBot=fh+deckH+Math.round((vh-44)*0.02);
  const poolEdge=document.createElement('div');poolEdge.style.cssText=`position:absolute;bottom:${poolBot-8}px;left:${poolL-8}px;width:${poolW+16}px;height:${poolH+16}px;background:#b8c8d8;border-radius:6px;z-index:4;pointer-events:none;box-shadow:0 0 24px rgba(0,100,200,.25),0 4px 12px rgba(0,0,0,.4);`;furni.appendChild(poolEdge);
  const poolCv=document.createElement('canvas');poolCv.id='gym-pool-canvas';poolCv.style.cssText=`position:absolute;bottom:${poolBot}px;left:${poolL}px;width:${poolW}px;height:${poolH}px;border-radius:4px;z-index:5;pointer-events:none;`;furni.appendChild(poolCv);
  function animatePool(){if(!andarAberto||andarAtual!==2)return;const cv=document.getElementById('gym-pool-canvas');if(!cv)return;if(cv.width!==cv.offsetWidth){cv.width=cv.offsetWidth||poolW;cv.height=cv.offsetHeight||poolH;}const ctx=cv.getContext('2d'),t=Date.now()/1400;const g=ctx.createLinearGradient(0,0,0,cv.height);g.addColorStop(0,'#0d4f8a');g.addColorStop(.5,'#0a3a6e');g.addColorStop(1,'#061e40');ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height);ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1.5;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(0,cv.height*i/4);ctx.lineTo(cv.width,cv.height*i/4);ctx.stroke();}ctx.strokeStyle='rgba(100,200,255,.3)';ctx.lineWidth=1.5;for(let w=0;w<3;w++){ctx.beginPath();for(let x=0;x<=cv.width;x+=2){const y=4+w*8+Math.sin(x/cv.width*Math.PI*6+t+w*1.2)*3;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}const rf=ctx.createLinearGradient(cv.width*.55,0,cv.width*.85,0);rf.addColorStop(0,'transparent');rf.addColorStop(.5,'rgba(200,225,255,.1)');rf.addColorStop(1,'transparent');ctx.fillStyle=rf;ctx.fillRect(0,0,cv.width,cv.height*.3);requestAnimationFrame(animatePool);}
  requestAnimationFrame(()=>requestAnimationFrame(animatePool));
  const poolHintEl=document.createElement('div');poolHintEl.id='gym-hint-pool';poolHintEl.style.cssText=`position:absolute;bottom:${poolBot+poolH+10}px;left:${poolL}px;background:#fff;border:2px solid #333;color:#111;font-family:'Press Start 2P',monospace;font-size:clamp(4px,.52vw,6px);padding:4px 10px;border-radius:4px;white-space:nowrap;box-shadow:2px 2px 0 #333;display:none;z-index:30;pointer-events:none;`;poolHintEl.textContent='[E] Nadar';furni.appendChild(poolHintEl);
  jogadorXAndar=Math.round(window.innerWidth*1.945);
}

function atualizarHintsAcademia(vw){
  GYM_EQUIP.forEach(eq=>{const h=document.getElementById('gym-hint-'+eq.id);if(!h)return;const cx=Math.round(vw*eq.x)+Math.round(vw*eq.w/2);h.style.display=Math.abs(jogadorXAndar-cx)<Math.round(vw*0.10)?'block':'none';});
  const bHint=document.getElementById('gym-hint-bebedouro');if(bHint)bHint.style.display=(GYM_BEB_X>0&&Math.abs(jogadorXAndar-(GYM_BEB_X+GYM_BEB_W/2))<Math.round(vw*0.14))?'block':'none';
  const vHint=document.getElementById('gym-hint-vestiario');if(vHint)vHint.style.display=(GYM_VEST_X>0&&Math.abs(jogadorXAndar-(GYM_VEST_X+GYM_VEST_W/2))<Math.round(vw*0.18))?'block':'none';
  const poolHint=document.getElementById('gym-hint-pool');const poolCv2=document.getElementById('gym-pool-canvas');if(poolHint&&poolCv2){const pL=parseInt(poolCv2.style.left)||0;const pW=poolCv2.offsetWidth||300;poolHint.style.display=(jogadorXAndar>pL-60&&jogadorXAndar<pL+pW+60)?'block':'none';}
}

function interagirAcademia(vw){
  const range=Math.round(vw*0.13);
  if(GYM_BEB_X>0){const bebCx=GYM_BEB_X+GYM_BEB_W/2;if(Math.abs(jogadorXAndar-bebCx)<range){gymDrinkWater();return;}}
  if(GYM_VEST_X>0){const vestCx=GYM_VEST_X+GYM_VEST_W/2;if(Math.abs(jogadorXAndar-vestCx)<range+60){gymOpenLocker();return;}}
  const poolCv=document.getElementById('gym-pool-canvas');if(poolCv){const pL=parseFloat(poolCv.style.left)||0;const pW=parseFloat(poolCv.style.width)||300;if(jogadorXAndar>pL-80&&jogadorXAndar<pL+pW+80){gymSwim();return;}}
  for(const eq of GYM_EQUIP){const cx=Math.round(vw*eq.x)+Math.round(vw*eq.w/2);if(Math.abs(jogadorXAndar-cx)<range){gymTrain(eq);return;}}
  notificar('Use [E] perto de um equipamento, bebedouro, vestiário ou piscina!');
}

function mostrarTelaAcademia(title,durationMs,onDone,color='#ff3250'){
  modalAberto=true;
  const ov=document.createElement('div');ov.className='overlay-fade';
  const rgb=color==='#ff3250'?'255,50,80':color==='#00b4d8'?'0,180,216':'199,125,255';
  const box=document.createElement('div');box.style.cssText=`background:linear-gradient(180deg,#0a0a1a,#050510);border:3px solid ${color};border-radius:12px;padding:28px 44px;text-align:center;font-family:'Press Start 2P',monospace;box-shadow:0 0 40px rgba(${rgb},.4);min-width:260px;`;
  box.innerHTML=`<div style="font-size:clamp(6px,.9vw,10px);color:${color};margin-bottom:18px;letter-spacing:2px;text-shadow:0 0 10px ${color};">${title}</div><div style="width:200px;height:8px;background:rgba(255,255,255,.08);border-radius:4px;margin:0 auto;overflow:hidden;"><div id="gym-bar" style="height:100%;width:0%;background:linear-gradient(90deg,${color},${color}88);border-radius:4px;transition:width ${durationMs}ms linear;"></div></div>`;
  ov.appendChild(box);document.body.appendChild(ov);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const bar=document.getElementById('gym-bar');if(bar)bar.style.width='100%';}));
  setTimeout(()=>{ov.remove();modalAberto=false;if(onDone)onDone();},durationMs);
}

function gymSwim(){
  if(!andarAberto||andarAtual!==2)return;
  const fp=document.getElementById('floor-player');const poolCv=document.getElementById('gym-pool-canvas');if(!fp||!poolCv)return;
  const poolL2=parseInt(poolCv.style.left)||0;const poolW2=poolCv.offsetWidth||300;const poolBot2=parseInt(poolCv.style.bottom)||0;
  const swimX=poolL2+Math.round(poolW2*0.35);const origX=jogadorXAndar;jogadorXAndar=swimX;fp.style.left=swimX+'px';
  const origBottom=fp.style.bottom||'';fp.style.bottom=(poolBot2+Math.round(poolCv.offsetHeight*0.45))+'px';fp.style.position='absolute';
  let swimT=0;const swimAnim=setInterval(()=>{swimT+=0.15;fp.style.left=(swimX+Math.sin(swimT)*18)+'px';fp.style.bottom=(poolBot2+Math.round(poolCv.offsetHeight*0.45)+Math.sin(swimT*2)*4)+'px';},30);
  notificar('Nadando na piscina...');
  mostrarTelaAcademia('PISCINA — NADAR',3500,()=>{clearInterval(swimAnim);jogadorXAndar=origX;fp.style.left=origX+'px';fp.style.bottom=origBottom;notificar('Que refrescante!');});
}
function gymTrain(eq){notificar(eq.anim);mostrarTelaAcademia(eq.label.toUpperCase(),3000,()=>notificar('Treino concluído!'));}
function gymDrinkWater(){notificar('Bebendo água...');mostrarTelaAcademia('BEBEDOURO — BEBER ÁGUA',2000,()=>notificar('Hidratado!'),'#00b4d8');}

let menuVestiarioAberto=false;
function gymOpenLocker(){
  if(menuVestiarioAberto)return;menuVestiarioAberto=true;modalAberto=true;
  const ov=document.createElement('div');ov.id='locker-modal';ov.className='overlay-fade';
  const box=document.createElement('div');box.className='modal-vestiario';
  box.innerHTML=`<div style="font-size:clamp(7px,1vw,11px);color:#c77dff;margin-bottom:20px;letter-spacing:2px;">VESTIÁRIO</div><div style="display:flex;flex-direction:column;gap:10px;"><button onclick="gymLockerAction('roupa')" class="btn-vestiario vermelho">Trocar Roupa</button><button onclick="gymLockerAction('banho')" class="btn-vestiario azul">Tomar Banho</button><button onclick="gymLockerAction('banheiro')" class="btn-vestiario lilas">Banheiro</button><button onclick="gymCloseLocker()" class="btn-vestiario fechar">✕ Fechar</button></div>`;
  ov.appendChild(box);document.body.appendChild(ov);
}
function gymCloseLocker(){const el=document.getElementById('locker-modal');if(el)el.remove();menuVestiarioAberto=false;modalAberto=false;}
function gymLockerAction(type){gymCloseLocker();const cfg={roupa:{title:'TROCANDO ROUPA',dur:2500,msg:'Roupa trocada!',color:'#ff3250'},banho:{title:'TOMANDO BANHO',dur:4000,msg:'Refreshed!',color:'#00b4d8'},banheiro:{title:'BANHEIRO',dur:3000,msg:'Mãos limpas!',color:'#c77dff'}}[type];mostrarTelaAcademia(cfg.title,cfg.dur,()=>notificar(cfg.msg),cfg.color);}


// ═══════════════════════════════════════
// ANDAR 3 — CORREDOR DE APARTAMENTOS
// ═══════════════════════════════════════
let APT_DOOR_X={301:0,302:0,303:0},APT_DOOR_W=0;

function construirAndar3(furni){
  furni.innerHTML='';
  const vw=window.innerWidth,vh=window.innerHeight;
  const worldW=Math.round(vw*1.3);
  const fi=document.getElementById('floor-inner');if(fi)fi.style.width=worldW+'px';
  furni.style.cssText='position:absolute;inset:0;width:'+worldW+'px;';
  const fgridH=Math.round((vh-44)*0.18);const wallH=Math.round((vh-44)*0.82);
  function gi(src,lx,w,z=4){const e=document.createElement('img');e.src=src;e.style.cssText=`position:absolute;bottom:${fgridH}px;left:${lx}px;width:${w}px;height:auto;image-rendering:pixelated;z-index:${z};`;return e;}
  function mkHint(id,txt,lx,bot){const h=document.createElement('div');h.id=id;h.style.cssText=`position:absolute;bottom:${bot}px;left:${lx}px;background:#fff;border:2px solid #333;color:#111;font-family:'Press Start 2P',monospace;font-size:clamp(4px,.52vw,6px);padding:4px 10px;border-radius:4px;white-space:nowrap;box-shadow:2px 2px 0 #333;display:none;z-index:30;pointer-events:none;`;h.textContent=txt;return h;}
  const wall=document.getElementById('floor-wall');
  if(wall){wall.style.background='linear-gradient(180deg,#160b28 0%,#1e1035 60%,#160b28 100%)';const wp=document.createElement('div');wp.style.cssText='position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0px,transparent 58px,rgba(199,125,255,.03) 58px,rgba(199,125,255,.03) 60px);pointer-events:none;';wall.appendChild(wp);const frisoTop=document.createElement('div');frisoTop.style.cssText=`position:absolute;top:${Math.round(wallH*0.12)}px;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(199,125,255,.22) 15%,rgba(199,125,255,.22) 85%,transparent);pointer-events:none;`;wall.appendChild(frisoTop);const frisoBot=document.createElement('div');frisoBot.style.cssText=`position:absolute;bottom:${fgridH+2}px;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(199,125,255,.28) 15%,rgba(199,125,255,.28) 85%,transparent);pointer-events:none;`;wall.appendChild(frisoBot);}
  const fg=document.getElementById('floor-fgrid');if(fg){fg.style.background='repeating-linear-gradient(90deg,#0e0620 0px,#0e0620 59px,#160930 59px,#160930 60px)';fg.style.borderTop='3px solid rgba(199,125,255,.35)';}
  [0.28,0.72].forEach(pct=>{const lx=Math.round(worldW*pct);const lamp=document.createElement('div');lamp.style.cssText=`position:absolute;top:0;left:${lx}px;transform:translateX(-50%);z-index:3;pointer-events:none;display:flex;flex-direction:column;align-items:center;`;const rod=document.createElement('div');rod.style.cssText='width:2px;height:clamp(16px,2.8vh,34px);background:rgba(199,125,255,.22);';const bulb=document.createElement('div');bulb.style.cssText='width:clamp(9px,1.4vw,18px);height:clamp(5px,.8vh,9px);background:linear-gradient(180deg,#ffe8a0,#ffd040);border-radius:0 0 50% 50%;box-shadow:0 0 14px rgba(255,210,80,.75),0 0 32px rgba(255,180,50,.3);';lamp.appendChild(rod);lamp.appendChild(bulb);furni.appendChild(lamp);});
  const carpet=document.createElement('div');carpet.style.cssText=`position:absolute;bottom:${fgridH}px;left:0;width:${worldW}px;height:${Math.round((vh-44)*0.030)}px;background:linear-gradient(90deg,#3a0e6a 0%,#52189a 20%,#5a20aa 50%,#52189a 80%,#3a0e6a 100%);border-top:2px solid rgba(199,125,255,.45);z-index:2;pointer-events:none;`;furni.appendChild(carpet);
  const sign=document.createElement('div');sign.style.cssText=`position:absolute;top:${Math.round(wallH*0.04)}px;left:50%;transform:translateX(-50%);font-family:'Press Start 2P',monospace;font-size:clamp(5px,.75vw,9px);color:rgba(199,125,255,.3);letter-spacing:5px;z-index:3;pointer-events:none;`;sign.textContent='3º ANDAR';furni.appendChild(sign);
  const doorW=Math.round(vw*0.14);APT_DOOR_W=doorW;
  const doorPositions=[0.30,0.58,0.84];
  const doorDefs=[{num:303,src:'IMG/porta-303-apt.png'},{num:302,src:'IMG/porta-302-apt.png'},{num:301,src:'IMG/porta-301-apt.png'}];
  doorDefs.forEach((d,i)=>{
    const lx=Math.round(worldW*doorPositions[i]-doorW/2);APT_DOOR_X[d.num]=lx;
    const img=gi(d.src,lx,doorW,5);img.id='apt-door-'+d.num;furni.appendChild(img);
    const mat=document.createElement('div');mat.style.cssText=`position:absolute;bottom:${fgridH}px;left:${lx-10}px;width:${doorW+20}px;height:${Math.round((vh-44)*0.026)}px;background:linear-gradient(90deg,transparent,rgba(100,40,180,.5) 20%,rgba(140,60,220,.65) 50%,rgba(100,40,180,.5) 80%,transparent);border-radius:4px 4px 0 0;z-index:4;pointer-events:none;`;furni.appendChild(mat);
    const numTag=document.createElement('div');numTag.style.cssText=`position:absolute;bottom:${fgridH+Math.round(wallH*0.60)}px;left:${lx+Math.round(doorW*.5)}px;transform:translateX(-50%);font-family:'Press Start 2P',monospace;font-size:clamp(4px,.55vw,7px);color:rgba(199,125,255,.45);z-index:4;pointer-events:none;`;numTag.textContent=d.num;furni.appendChild(numTag);
    if(d.num===302){const badge=document.createElement('div');badge.style.cssText=`position:absolute;bottom:${fgridH+Math.round(wallH*0.67)}px;left:${lx+Math.round(doorW*.5)}px;transform:translateX(-50%);padding:3px 8px;background:#0e0028;border:2px solid #c77dff;border-radius:4px;font-family:'Press Start 2P',monospace;font-size:clamp(3px,.4vw,5px);color:#c77dff;white-space:nowrap;letter-spacing:1px;z-index:6;box-shadow:0 0 12px rgba(199,125,255,.6);pointer-events:none;`;badge.textContent='✦ SEU APT ✦';furni.appendChild(badge);const arrow=document.createElement('div');arrow.style.cssText=`position:absolute;bottom:${fgridH+Math.round(wallH*0.76)}px;left:${lx+Math.round(doorW*.5)}px;transform:translateX(-50%);font-size:clamp(10px,1.5vw,18px);color:#c77dff;z-index:6;pointer-events:none;text-shadow:0 0 10px #c77dff;animation:neonPulse 0.9s ease-in-out infinite;`;arrow.textContent='▼';furni.appendChild(arrow);}
    furni.appendChild(mkHint('apt-hint-'+d.num,d.num===302?'[E] Entrar — Apto 302':'[E] Bater na porta '+d.num,lx,fgridH+Math.round((vh-44)*0.115)));
  });
  const elevWrap=document.getElementById('floor-elev-wrap');if(elevWrap){elevWrap.style.left=(vw*0.04)+'px';elevWrap.style.display='block';}
  jogadorXAndar=Math.round(vw*0.20);
}

function atualizarHintsAndar3(vw){
  if(_dentroApt302){hintsApt302(vw);return;}
  [301,302,303].forEach(num=>{const h=document.getElementById('apt-hint-'+num);if(!h)return;const cx=APT_DOOR_X[num]+APT_DOOR_W/2;h.style.display=Math.abs(jogadorXAndar-cx)<Math.round(vw*0.12)?'block':'none';});
}

function interagirAndar3(vw){
  if(_dentroApt302){interagirApt302(vw);return;}
  let acted=false;
  [303,302,301].forEach(num=>{if(acted)return;const cx=APT_DOOR_X[num]+APT_DOOR_W/2;if(Math.abs(jogadorXAndar-cx)<Math.round(vw*0.12)){acted=true;if(num===302){_dentroApt302=true;entrarApt302();}else{baterPorta(num);}}});
}

function baterPorta(num){
  const door=document.getElementById('apt-door-'+num);
  if(door){let t=0;const shake=setInterval(()=>{t++;door.style.transform=`translateX(${t%2===0?-3:3}px)`;if(t>6){clearInterval(shake);door.style.transform='';}},60);}
  tocarTom(220,.08);setTimeout(()=>tocarTom(220,.06),120);notificar('Apto '+num+' — Sem resposta...');
}

function entrarApt302(){
  _dentroApt302=true;
  const furni=document.getElementById('floor-furni');if(furni)construirApt302(furni);
  document.getElementById('floor-hud-name').textContent='Apartamento 302';
  const fp=document.getElementById('floor-player');if(fp)fp.style.left=jogadorXAndar+'px';
  notificar('Bem-vindo ao apt 302! Use ← → para explorar.');
}

function construirApt302(furni){
  furni.innerHTML='';
  const vw=window.innerWidth,vh=window.innerHeight;
  const fgridH=Math.round((vh-44)*0.18);const wallH=Math.round((vh-44)*0.82);const imgMaxH=Math.round(wallH*0.72);
  const elevWrap=document.getElementById('floor-elev-wrap');if(elevWrap)elevWrap.style.display='none';
  const pad=Math.round(vw*0.02);
  function gi(src,lx,w,z=4){const e=document.createElement('img');e.src=src;e.style.cssText=`position:absolute;bottom:${fgridH}px;left:${lx}px;width:${w}px;max-height:${imgMaxH}px;height:auto;image-rendering:pixelated;z-index:${z};object-fit:contain;object-position:bottom left;`;e.onerror=()=>e.style.display='none';return e;}
  function mkHint(id,txt,lx){const h=document.createElement('div');h.id=id;h.className='hint-jogo';h.style.cssText=`position:absolute;bottom:${fgridH+12}px;left:${lx}px;display:none;`;h.textContent=txt;return h;}
  function mkLamp(cx,color='#e8c070'){const lamp=document.createElement('div');lamp.style.cssText=`position:absolute;top:0;left:${cx}px;transform:translateX(-50%);z-index:6;pointer-events:none;display:flex;flex-direction:column;align-items:center;`;const rod=document.createElement('div');rod.style.cssText=`width:2px;height:clamp(18px,3vh,38px);background:rgba(0,0,0,.2);`;const shade=document.createElement('div');shade.style.cssText=`width:clamp(22px,3vw,44px);height:clamp(14px,2vh,26px);background:linear-gradient(180deg,#9a7840,${color});border-radius:0 0 55% 55%;border:2px solid #806030;box-shadow:0 6px 22px rgba(255,200,80,.55),0 10px 40px rgba(255,180,50,.25);`;lamp.appendChild(rod);lamp.appendChild(shade);return lamp;}
  const sacW=Math.round(vw*0.30);const salaImgW=Math.round(vw*0.48);const portaW=Math.round(vw*0.13);const salaW=salaImgW+portaW+pad*3;const cozW=Math.round(vw*0.42);const jantarW=Math.round(vw*0.38);const quartoW=Math.round(vw*0.44);const banhoW=Math.round(vw*0.27);
  const bgs={sacada:'#020008',sala:'#f5c0cc',cozinha:'#ece0ff',jantar:'#e8d8f4',quarto:'#fce8f0',banho:'#cff0e8'};
  const larguras=[sacW,salaW,cozW,jantarW,quartoW,banhoW];const ids=['sacada','sala','cozinha','jantar','quarto','banho'];
  const pos={};let xAcum=0;
  ids.forEach((id,i)=>{pos[id]={x:xAcum,w:larguras[i]};const wall=document.createElement('div');wall.style.cssText=`position:absolute;top:0;left:${xAcum}px;width:${larguras[i]}px;height:${wallH}px;background:${bgs[id]};z-index:0;`;furni.appendChild(wall);if(id!=='sacada'){const friso=document.createElement('div');friso.style.cssText=`position:absolute;top:${Math.round(wallH*0.08)}px;left:${xAcum}px;width:${larguras[i]}px;height:4px;background:rgba(0,0,0,.08);z-index:1;pointer-events:none;`;furni.appendChild(friso);const frisoB=document.createElement('div');frisoB.style.cssText=`position:absolute;bottom:${fgridH}px;left:${xAcum}px;width:${larguras[i]}px;height:8px;background:rgba(0,0,0,.1);z-index:1;pointer-events:none;`;furni.appendChild(frisoB);furni.appendChild(mkLamp(xAcum+Math.round(larguras[i]/2)));}xAcum+=larguras[i];});
  const worldW=xAcum;const fi=document.getElementById('floor-inner');if(fi)fi.style.width=worldW+'px';furni.style.cssText='position:absolute;inset:0;width:'+worldW+'px;';
  const pilarW=Math.round(vw*0.006);ids.slice(1).forEach(id=>{const p=document.createElement('div');p.style.cssText=`position:absolute;top:0;left:${pos[id].x-pilarW}px;width:${pilarW*2}px;height:${wallH}px;background:linear-gradient(90deg,rgba(0,0,0,.18),transparent,rgba(0,0,0,.08));z-index:5;pointer-events:none;`;furni.appendChild(p);});
  const {x:sacX}=pos.sacada;
  const ceu=document.createElement('div');ceu.style.cssText=`position:absolute;top:0;left:${sacX}px;width:${sacW}px;height:${Math.round(wallH*0.82)}px;background:linear-gradient(180deg,#000510 0%,#050c2a 35%,#0a1545 60%,#111d38 100%);z-index:1;pointer-events:none;`;furni.appendChild(ceu);
  const predData=[{x:0.02,w:0.10,h:0.55},{x:0.10,w:0.07,h:0.38},{x:0.16,w:0.12,h:0.65},{x:0.27,w:0.08,h:0.42},{x:0.33,w:0.14,h:0.70},{x:0.46,w:0.07,h:0.35},{x:0.52,w:0.10,h:0.58},{x:0.61,w:0.06,h:0.30},{x:0.66,w:0.13,h:0.62},{x:0.78,w:0.09,h:0.45},{x:0.85,w:0.14,h:0.68},{x:0.90,w:0.08,h:0.40}];
  predData.forEach(p=>{const pred=document.createElement('div');const ph=Math.round(wallH*0.82*p.h);const px=sacX+Math.round(sacW*p.x);const pw=Math.round(sacW*p.w);pred.style.cssText=`position:absolute;bottom:${fgridH}px;left:${px}px;width:${pw}px;height:${ph}px;background:linear-gradient(180deg,#0d1528,#080e1c);z-index:2;pointer-events:none;`;const nCols=Math.max(2,Math.floor(pw/10));const nRows=Math.max(3,Math.floor(ph/16));for(let r=1;r<nRows;r++)for(let col=0;col<nCols;col++){const seed=r*13+col*7+p.x*100;if((seed%3)===0)continue;const jan=document.createElement('div');const cor=(seed%5===0)?'#ffe066':(seed%4===0)?'#88ccff':'#ffaa44';jan.style.cssText=`position:absolute;left:${Math.round(col*(pw/nCols)+2)}px;bottom:${Math.round(r*(ph/nRows)+2)}px;width:${Math.max(3,Math.round(pw/nCols)-3)}px;height:${Math.max(4,Math.round(ph/nRows)-4)}px;background:${cor};opacity:${.6+((seed%4)*.1)};`;pred.appendChild(jan);}furni.appendChild(pred);});
  const luaSz=Math.round(sacW*0.20);const lua=document.createElement('div');lua.style.cssText=`position:absolute;top:${Math.round(wallH*.08)}px;left:${sacX+Math.round(sacW*.68)}px;width:${luaSz}px;height:${luaSz}px;border-radius:50%;background:#fffde0;box-shadow:0 0 ${Math.round(luaSz*.45)}px rgba(255,240,140,.6),0 0 ${Math.round(luaSz*.9)}px rgba(255,220,80,.2);z-index:4;pointer-events:none;`;const luaCorte=document.createElement('div');luaCorte.style.cssText=`position:absolute;top:-10%;left:18%;width:${luaSz}px;height:${luaSz}px;border-radius:50%;background:#000510;`;lua.appendChild(luaCorte);furni.appendChild(lua);
  const fioY=Math.round(wallH*0.18);const fio=document.createElement('div');fio.style.cssText=`position:absolute;top:${fioY}px;left:${sacX}px;width:${sacW}px;height:2px;background:rgba(80,60,40,.5);z-index:5;pointer-events:none;`;furni.appendChild(fio);
  const cores=['#ff4466','#ffcc00','#44ddff','#ff88ee','#88ff66','#ff9900'];const nLuz=Math.floor(sacW/18);
  for(let i=0;i<nLuz;i++){const lz=document.createElement('div');const cor=cores[i%cores.length];const delay=(i*0.15).toFixed(2);const lzX=sacX+Math.round(i*(sacW/nLuz)+6);lz.style.cssText=`position:absolute;top:${fioY}px;left:${lzX}px;width:7px;height:10px;background:${cor};border-radius:2px 2px 50% 50%;box-shadow:0 0 8px ${cor},0 0 16px ${cor}88;z-index:5;pointer-events:none;animation:neonPulse ${(.7+i%3*.3).toFixed(1)}s ease-in-out ${delay}s infinite;`;furni.appendChild(lz);}
  const deck=document.createElement('div');deck.style.cssText=`position:absolute;bottom:0;left:${sacX}px;width:${sacW}px;height:${fgridH}px;background:repeating-linear-gradient(90deg,#5a3510 0px,#5a3510 14px,#4a2a0a 14px,#4a2a0a 16px);border-top:2px solid #8a5520;z-index:5;pointer-events:none;`;furni.appendChild(deck);
  const railH=Math.round(wallH*.18);const vidro=document.createElement('div');vidro.style.cssText=`position:absolute;bottom:${fgridH}px;left:${sacX}px;width:${sacW}px;height:${railH}px;background:linear-gradient(180deg,rgba(180,220,255,.05),rgba(180,220,255,.12));border-top:3px solid rgba(210,235,255,.60);z-index:3;pointer-events:none;`;furni.appendChild(vidro);
  const trilho=document.createElement('div');trilho.style.cssText=`position:absolute;bottom:${fgridH+railH}px;left:${sacX}px;width:${sacW}px;height:5px;background:linear-gradient(180deg,#dde8f2,#98aabb);box-shadow:0 2px 8px rgba(0,0,0,.6);z-index:3;pointer-events:none;`;furni.appendChild(trilho);
  const balacoW=Math.round(sacW*0.55);const balacoX=sacX+Math.round((sacW-balacoW)/2);const balacoImg=gi('IMG/Balaço.png',balacoX,balacoW,6);balacoImg.id='apt-balaco';furni.appendChild(balacoImg);furni.appendChild(mkHint('apt-h-balaco','[E] Balançar 🌙',balacoX));
  const {x:salaX}=pos.sala;furni.appendChild(gi('IMG/sala-apt.png',salaX+pad,salaImgW,3));furni.appendChild(mkHint('apt-h-sofa','[E] Sentar no sofá 🛋️',salaX+pad));
  const portaX=salaX+pad+salaImgW+pad;const portaImg=gi('IMG/porta-302-apt.png',portaX,portaW,6);furni.appendChild(portaImg);
  const portaHit=document.createElement('div');portaHit.style.cssText=`position:absolute;bottom:${fgridH}px;left:${portaX-20}px;width:${portaW+40}px;height:${imgMaxH}px;z-index:7;cursor:pointer;`;portaHit.addEventListener('click',()=>fecharApt302());furni.appendChild(portaHit);furni.appendChild(mkHint('apt-h-exit','[E] Sair do apartamento 🚪',portaX));
  const {x:cozX}=pos.cozinha;furni.appendChild(gi('IMG/cozinha-apt.png',cozX+pad,cozW-pad*2,3));furni.appendChild(mkHint('apt-h-cozinha','[E] Cozinhar 🍳',cozX+pad));
  const {x:jX}=pos.jantar;furni.appendChild(gi('IMG/sala-de-jantar-apt.png',jX+pad,jantarW-pad*2,3));furni.appendChild(mkHint('apt-h-jantar','[E] Jantar 🍽️',jX+pad));
  const {x:qX}=pos.quarto;furni.appendChild(gi('IMG/quarto-apt.png',qX+pad,quartoW-pad*2,3));furni.appendChild(mkHint('apt-h-quarto','[E] Dormir 💤',qX+pad));
  const {x:bX}=pos.banho;furni.appendChild(gi('IMG/banho-apt.png',bX+pad,banhoW-pad*2,3));furni.appendChild(mkHint('apt-h-banho','[E] Tomar banho 🚿',bX+pad));
  window._dadosApt={exit:{x:portaX-20,w:portaW+40},balaco:{x:balacoX,w:balacoW},sofa:{x:salaX,w:salaImgW},cozinha:{x:cozX,w:cozW},jantar:{x:jX,w:jantarW},quarto:{x:qX,w:quartoW},banho:{x:bX,w:banhoW}};
  jogadorXAndar=portaX-Math.round(vw*0.07);
}

function hintsApt302(vw){
  if(!window._dadosApt)return;
  const d=window._dadosApt,range=Math.round(vw*0.10)+40;
  const mapa=[['exit','apt-h-exit'],['balaco','apt-h-balaco'],['sofa','apt-h-sofa'],['cozinha','apt-h-cozinha'],['jantar','apt-h-jantar'],['quarto','apt-h-quarto'],['banho','apt-h-banho']];
  mapa.forEach(([id,hid])=>{const h=document.getElementById(hid);if(!h)return;const item=d[id];h.style.display=Math.abs(jogadorXAndar-(item.x+item.w/2))<range?'block':'none';});
}

function interagirApt302(vw){
  if(!window._dadosApt)return;
  const d=window._dadosApt;
  function perto(item){return Math.abs(jogadorXAndar-(item.x+item.w/2))<item.w/2+30;}
  if(perto(d.balaco)){const sw=document.getElementById('apt-balaco');if(sw){let a=0,dr=1;const anim=setInterval(()=>{a+=dr*3;if(Math.abs(a)>20)dr*=-1;sw.style.transform=`rotate(${a}deg)`;sw.style.transformOrigin='top center';},40);setTimeout(()=>{clearInterval(anim);sw.style.transform='';},3000);}mostrarTelaAcademia('BALANÇAR 🌙',3000,()=>notificar('Que relaxante! 🌙'),'#c77dff');return;}
  if(perto(d.exit)){fecharApt302();return;}
  if(perto(d.sofa)){mostrarTelaAcademia('SENTAR NO SOFÁ',2500,()=>notificar('Que confortável! 🛋️'),'#ff9ab0');return;}
  if(perto(d.cozinha)){mostrarTelaAcademia('COZINHAR',3000,()=>notificar('Cheiroso! 🍳'),'#c77dff');return;}
  if(perto(d.jantar)){mostrarTelaAcademia('JANTAR',2500,()=>notificar('Delicioso! 🍽️'),'#c77dff');return;}
  if(perto(d.quarto)){mostrarTelaAcademia('DORMIR',3500,()=>notificar('Descansado! 💤'),'#ff9ab0');return;}
  if(perto(d.banho)){mostrarTelaAcademia('TOMAR BANHO',3000,()=>notificar('Fresquinho! 🚿'),'#00b4d8');return;}
}

function fecharApt302(){
  const elevWrap=document.getElementById('floor-elev-wrap');if(elevWrap)elevWrap.style.display='block';
  _dentroApt302=false;window._dadosApt=null;
  const furni=document.getElementById('floor-furni');if(furni)construirAndar3(furni);
  document.getElementById('floor-hud-name').textContent=FLOOR_CFG[3].name;
  jogadorXAndar=APT_DOOR_X[302]+APT_DOOR_W/2;
  const fp=document.getElementById('floor-player');if(fp)fp.style.left=jogadorXAndar+'px';
  notificar('Voltando ao corredor...');
}

function mostrarSelecao(){
  document.getElementById('screen-start').style.display='none';
  document.getElementById('screen-select').style.display='flex';
  const sc=document.getElementById('select-city-bg');if(sc){sc.width=window.innerWidth;sc.height=window.innerHeight;desenharJanelaCidade('select-city-bg',99);}
}

function iniciarStartScreen(){
  const cv=document.getElementById('start-bg');if(!cv)return;
  cv.width=window.innerWidth;cv.height=window.innerHeight;
  const ctx=cv.getContext('2d');const w=cv.width,h=cv.height;
  const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#04000f');grad.addColorStop(0.6,'#0d0025');grad.addColorStop(1,'#1a0040');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  for(let i=0;i<200;i++){const x=(i*137+11)%w,y=(i*97+17)%(h*.7);const r=i%8===0?.8:i%4===0?.5:.3;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${.2+((i*79)%60)/100})`;ctx.fill();}
  const predH=Math.round(h*.28);
  const predDefs=[{x:.02,w:.06,h:.6},{x:.07,w:.04,h:.4},{x:.10,w:.08,h:.75},{x:.17,w:.05,h:.5},{x:.21,w:.09,h:.85},{x:.29,w:.04,h:.35},{x:.32,w:.06,h:.65},{x:.37,w:.03,h:.30},{x:.62,w:.03,h:.35},{x:.64,w:.07,h:.70},{x:.70,w:.04,h:.45},{x:.73,w:.08,h:.80},{x:.80,w:.05,h:.55},{x:.84,w:.06,h:.40},{x:.89,w:.09,h:.72},{x:.97,w:.04,h:.38}];
  predDefs.forEach(p=>{const px=Math.round(w*p.x),pw=Math.round(w*p.w),ph=Math.round(predH*p.h);const py=h-Math.round(h*.08)-ph;ctx.fillStyle='#0a0020';ctx.fillRect(px,py,pw,ph);const cols=Math.max(2,Math.floor(pw/8));const rows=Math.max(3,Math.floor(ph/12));for(let r=1;r<rows;r++)for(let col=0;col<cols;col++){const seed=r*13+col*7+p.x*100;if(seed%3===0)continue;const cor=seed%5===0?'#ffe066':seed%4===0?'#88ccff':'#ffaa44';ctx.fillStyle=cor;ctx.globalAlpha=.5+((seed%4)*.1);ctx.fillRect(px+Math.round(col*(pw/cols)+1),py+Math.round(r*(ph/rows)+1),Math.max(2,Math.round(pw/cols)-2),Math.max(3,Math.round(ph/rows)-3));}ctx.globalAlpha=1;});
  ctx.fillStyle='#120030';ctx.fillRect(0,h-Math.round(h*.08),w,Math.round(h*.08));
  ctx.strokeStyle='rgba(199,125,255,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,h-Math.round(h*.08));ctx.lineTo(w,h-Math.round(h*.08));ctx.stroke();
}

window.addEventListener('load',()=>{iniciarStartScreen();});
