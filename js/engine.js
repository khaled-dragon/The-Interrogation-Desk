let choicePool = [];
let usedChoiceIds = new Set();
let evidenceChoicesAdded = new Set();

function buildChoicePool(suspect) {
  const pool = [];
  const qTexts = [
    "Walk me through where you were — every hour.",
    "We will check those logs. Right now I'm more interested in why you were there.",
    "You're not telling me everything. I can see it.",
    "Here's what I know already. You decide what to add.",
    "One last chance to get ahead of this. Talk to me."
  ];
  const whTexts = [
    "[You lean forward] We both know what you did. Say it.",
    "[Quietly] I've seen the evidence. This ends badly unless you talk now.",
    "[Low voice] The people you're protecting? They already talked."
  ];
  const slTexts = ["*SLAM* Don't play games with me!", "*SLAM* I've heard enough lies!", "*SLAM* ENOUGH."];

  suspect.questions.forEach((q, i) => {
    pool.push({ id:'q'+i, type:'question', icon:'❓', label:'Question',
      text: qTexts[i % qTexts.length], response: q.text,
      stressDelta: q.stressDelta, trustDelta: q.trustDelta||0,
      microExpr: q.microExpr||null, qIndex: i });
  });
  suspect.stares.forEach((s, i) => {
    pool.push({ id:'st'+i, type:'stare', icon:'👁️', label:'Stare in silence',
      text: null, response: s.text,
      stressDelta: s.stressDelta, trustDelta: 0, microExpr: s.microExpr||null });
  });
  suspect.whispers.forEach((w, i) => {
    pool.push({ id:'wh'+i, type:'whisper', icon:'🤫', label:'Threatening whisper',
      text: whTexts[i % whTexts.length], response: w.text,
      stressDelta: w.stressDelta, trustDelta: w.trustDelta||0, microExpr: w.microExpr||null });
  });
  suspect.slams.forEach((sl, i) => {
    pool.push({ id:'sl'+i, type:'slam', icon:'👊', label:'*SLAM*',
      text: slTexts[i % slTexts.length], response: sl.text,
      stressDelta: sl.stressDelta, trustDelta: -8, defenseDelta: sl.defenseDelta||10 });
  });
  return pool;
}

function shuffleArray(arr) {
  for (let i = arr.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

function getNextThreeChoices() {

  if (ActiveCase) {
    GameState.evidenceFound.forEach(evIdx => {
      const eid = 'ev'+evIdx;
      if (!evidenceChoicesAdded.has(eid)) {
        evidenceChoicesAdded.add(eid);
        const ev = ActiveCase.evidence[evIdx];
        choicePool.push({ id:eid, type:'evidence', icon:'📁', label:'Show the evidence',
          text:`Show the ${ev.label}`, evBadge: ev.label, response: ev.text,
          stressDelta: ev.stressDelta, trustDelta: ev.trustDelta||0, microExpr: ev.microExpr||null });
      }
    });
  }
  let available = choicePool.filter(c => !usedChoiceIds.has(c.id));
  if (available.length < 3) {
    // reset used — but keep evidence as permanently consumed
    usedChoiceIds = new Set([...evidenceChoicesAdded]);
    available = choicePool.filter(c => !usedChoiceIds.has(c.id));
  }
  const picked = []; const typesPicked = new Set();
  for (const c of shuffleArray([...available])) {
    if (picked.length >= 3) break;
    if (!typesPicked.has(c.type)) { picked.push(c); typesPicked.add(c.type); }
  }
  for (const c of shuffleArray([...available])) {
    if (picked.length >= 3) break;
    if (!picked.find(p => p.id === c.id)) picked.push(c);
  }
  return picked.slice(0,3);
}

function renderChoices(choices) {
  const panel = document.getElementById('choicePanel');
  panel.innerHTML = '';
  panel.classList.remove('visible');
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = `choice-btn type-${choice.type}`;
    let inner = `<div class="choice-icon">${choice.icon}</div><div class="choice-body">
      <div class="choice-type-label">${choice.label}</div>`;
    if (choice.text) inner += `<div class="choice-text">${choice.text}</div>`;
    if (choice.evBadge) inner += `<span class="choice-ev-badge">📎 ${choice.evBadge}</span>`;
    inner += `</div>`;
    btn.innerHTML = inner;
    btn.addEventListener('click', () => executeChoice(choice));
    panel.appendChild(btn);
  });
  setTimeout(() => panel.classList.add('visible'), 80);
}

function hideChoices() {
  const panel = document.getElementById('choicePanel');
  if (panel) panel.classList.remove('visible');
}

function executeChoice(choice) {
  if (GameState.gameOver) return;
  initAudio();
  hideChoices();
  usedChoiceIds.add(choice.id);
  GameState.actionCount++;

  if (choice.type === 'slam') {
    if (GameState.suspectDefense >= 75) {
      setDialogue(ActiveCase.name.toUpperCase(), ActiveCase.shutdown);
      endGame(false, 'shutdown'); return;
    }
    GameState.suspectDefense += (choice.defenseDelta || 10);
    playSFX('slam'); shakeScreen(); flash('red');
    GameState.slamCount++;
    if (GameState.suspectDefense >= 60) showNotification('⚠ SUSPECT SHUTTING DOWN — Ease off!','warning');
  } else if (choice.type === 'evidence') {
    flash('amber'); playSFX('whoosh');
    showNotification('Evidence presented: '+(choice.evBadge||''));
  } else if (choice.type === 'whisper') {
    playSFX('whoosh');
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(0.07, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime+2);
    }
  } else if (choice.type === 'question') {
    playSFX('whoosh');
    // unlock evidence on question milestones
    if (choice.qIndex !== undefined) {
      const qi = choice.qIndex;
      if (qi >= 1) unlockEvidence(Math.min(qi-1, ActiveCase.evidence.length-1));
    }
  } else {
    playSFX('whoosh');
  }

  if (choice.text && choice.type !== 'stare') {
    setDialogue('DETECTIVE', choice.text);
    setTimeout(() => showSuspectResponse(choice), 1400);
  } else {
    showSuspectResponse(choice);
  }
}

function showSuspectResponse(choice) {
  GameState.suspectStress += choice.stressDelta || 0;
  GameState.suspectTrust  += choice.trustDelta  || 0;
  if (choice.microExpr) showMicroExpression(choice.microExpr);
  setDialogue(ActiveCase.name.toUpperCase(), choice.response);
  updateMeters();
  const breaking = checkBreakingPoint();
  if (!breaking) {
    const delay = Math.max(choice.response.length * 26 + 700, 2000);
    setTimeout(() => {
      if (!GameState.gameOver) renderChoices(getNextThreeChoices());
    }, delay);
  }
}

function updateClock() {
  const now = new Date();
  const h = now.getHours()%12, m = now.getMinutes(), s = now.getSeconds();
  document.getElementById('clockHours').style.transform   = `rotate(${h*30+m*0.5}deg)`;
  document.getElementById('clockMinutes').style.transform = `rotate(${m*6}deg)`;
  document.getElementById('clockSeconds').style.transform = `rotate(${s*6}deg)`;
  playSFX('tick');
}

function updateTimer() {
  if (GameState.gameOver) return;
  GameState.timer--;
  const m = Math.floor(GameState.timer/60), s = GameState.timer%60;
  const el = document.getElementById('timerDisplay');
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  if (GameState.timer<=60) el.classList.add('urgent');
  if (GameState.timer<=0) { clearInterval(GameState.timerInterval); endGame(false,'timeout'); }
}

function updateMeters() {
  const stress  = Math.max(0,Math.min(100,GameState.suspectStress));
  const trust   = Math.max(0,Math.min(100,GameState.suspectTrust));
  const defense = Math.max(0,Math.min(100,GameState.suspectDefense));
  document.getElementById('stressBarFill').style.width  = stress+'%';
  document.getElementById('trustBarFill').style.width   = trust+'%';
  document.getElementById('defenseBarFill').style.width = defense+'%';
  document.getElementById('stressValue').textContent    = Math.round(stress)+'%';
  document.getElementById('stressBarFill').style.background =
    stress<40 ? '#2ecc71' : stress<70 ? '#f39c12' : '#e74c3c';
  document.querySelectorAll('.pulse-beat').forEach((b,i) => {
    const base=[8,14,6,18,10,22,8,16,12,20][i];
    b.style.height=(base+(Math.random()>0.5?stress/100*15:0))+'px';
    b.style.background=stress>70?'#e74c3c':stress>40?'#f39c12':'#3498db';
  });
  const head=document.getElementById('suspectHead');
  const t=ActiveCase?.skinTone||['#d4a070','#c89060','#b87a50'];
  if (stress>80) {
    head.style.background='linear-gradient(180deg,#d45555 0%,#c04040 60%,#a83030 100%)';
    document.getElementById('sweatDrop').style.opacity='1';
  } else if (stress>50) {
    head.style.background='linear-gradient(180deg,#d47a50 0%,#c06040 60%,#a85030 100%)';
    document.getElementById('sweatDrop').style.opacity='0.5';
  } else {
    head.style.background=`linear-gradient(180deg,${t[0]} 0%,${t[1]} 60%,${t[2]} 100%)`;
    document.getElementById('sweatDrop').style.opacity='0';
  }
  document.getElementById('suspectMouth').style.borderBottomColor=
    stress>80?'rgba(180,50,30,0.7)':'rgba(100,40,30,0.6)';
  if (musicPlaying) { stopAmbientMusic(); startAmbientMusic(stress); }
}

function showMicroExpression(type) {
  const map={lie:'mlLie',guilt:'mlGuilt',stress:'mlStress'};
  if (!map[type]) return;
  const el=document.getElementById(map[type]);
  el.classList.add('visible');
  setTimeout(()=>el.classList.remove('visible'),2500);
  const eyes=document.getElementById('suspectEyes');
  if (type==='guilt') { eyes.style.transform='translateX(8px)'; setTimeout(()=>eyes.style.transform='',1500); }
  else if (type==='lie') { eyes.style.transform='translateX(-6px)'; setTimeout(()=>eyes.style.transform='',1000); }
  else if (type==='stress') {
    let t=0; const iv=setInterval(()=>{
      document.getElementById('eyeLeft').style.transform=t%2===0?'scaleY(0.6)':'';
      if(++t>4){clearInterval(iv);document.getElementById('eyeLeft').style.transform='';}
    },80);
  }
}

let typewriterTimeout=null;
function typeWriter(text,elementId,speed=26){
  const el=document.getElementById(elementId);
  el.innerHTML=''; GameState.isTyping=true; let i=0;
  function next(){
    if(i<text.length){
      el.innerHTML=text.substring(0,i+1)+'<span class="typewriter-cursor"></span>';
      i++; typewriterTimeout=setTimeout(next,speed);
    } else { el.innerHTML=text; GameState.isTyping=false; }
  }
  next();
}

function setDialogue(speaker,text){
  if(typewriterTimeout) clearTimeout(typewriterTimeout);
  const el=document.getElementById('dialogueSpeaker');
  el.textContent=speaker;
  el.style.color=speaker==='DETECTIVE'?'#4a8ab5':'var(--amber)';
  typeWriter(text,'dialogueText');
}

let notifTimeout=null;
function showNotification(msg,type=''){
  const el=document.getElementById('notification');
  el.textContent=msg;
  el.className='notification visible'+(type?' '+type:'');
  if(notifTimeout) clearTimeout(notifTimeout);
  notifTimeout=setTimeout(()=>el.classList.remove('visible'),2800);
}

function shakeScreen(){
  const room=document.getElementById('room');
  room.classList.add('shake');
  setTimeout(()=>room.classList.remove('shake'),500);
}
function flash(type){
  const el=document.getElementById('flashOverlay');
  el.className='flash-overlay '+type; el.style.opacity='1';
  setTimeout(()=>{el.style.opacity='0';},200);
}

function unlockEvidence(index){
  if(GameState.evidenceFound.includes(index)) return false;
  if(!ActiveCase||index>=ActiveCase.evidence.length) return false;
  GameState.evidenceFound.push(index);
  const item=document.getElementById('ev'+index);
  if(item){
    item.classList.add('found');
    item.onclick=()=>{
      if(GameState.gameOver) return;
      const ev=ActiveCase.evidence[index];
      const choice={id:'ev'+index,type:'evidence',icon:'📁',label:'Show the evidence',
        text:`Show the ${ev.label}`,evBadge:ev.label,response:ev.text,
        stressDelta:ev.stressDelta,trustDelta:ev.trustDelta||0,microExpr:ev.microExpr||null};
      hideChoices();
      evidenceChoicesAdded.add('ev'+index);
      usedChoiceIds.add('ev'+index);
      GameState.actionCount++;
      flash('amber'); playSFX('whoosh');
      showNotification('Evidence presented: '+ev.label);
      showSuspectResponse(choice);
    };
  }
  showNotification('◆ NEW EVIDENCE FOUND ◆'); playSFX('ding'); return true;
}

function checkBreakingPoint(){
  const stress=GameState.suspectStress;
  if(GameState.gameOver) return false;
  if(stress>=100){
    GameState.gameOver=true;
    setTimeout(()=>{
      playSFX('confession');
      setDialogue(ActiveCase.name.toUpperCase(),ActiveCase.confession);
      setTimeout(()=>endGame(true,'confession'),7000);
    },600);
    return true;
  }
  if(stress>=88) setTimeout(()=>{playSFX('ding');showNotification('◆ The Confession Ring — he is close...');},400);
  return false;
}

