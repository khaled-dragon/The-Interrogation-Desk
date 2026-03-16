function startGame(){
  initAudio();
  switchScreen('startScreen','gameScreen');
  const suspect=pickRandomCase();
  resetState();
  loadCase(suspect);
  setDialogue(suspect.name.toUpperCase(),suspect.intro);
  startAmbientMusic(0);
  if(!window._clockStarted){ setInterval(updateClock,1000); updateClock(); window._clockStarted=true; }
  if(!window._pulseStarted){
    setInterval(()=>{
      if(!GameState.gameOver) document.querySelectorAll('.pulse-beat').forEach(b=>{
        b.style.height=Math.max(4,Math.min(28,parseInt(b.style.height)||12+(Math.random()-.5)*8))+'px';
      });
    },300);
    window._pulseStarted=true;
  }
  GameState.timerInterval=setInterval(updateTimer,1000);
  GameState.timerActive=true;
  updateMeters();
  setTimeout(()=>{ if(!GameState.gameOver) renderChoices(getNextThreeChoices()); },2600);
}

function resetState(){
  GameState.suspectStress=0; GameState.suspectTrust=50; GameState.suspectDefense=0;
  GameState.evidenceFound=[]; GameState.timer=600; GameState.slamCount=0;
  GameState.actionCount=0; GameState.gameOver=false;
  choicePool=[]; usedChoiceIds=new Set(); evidenceChoicesAdded=new Set();
  document.getElementById('timerDisplay').classList.remove('urgent');
  document.getElementById('timerDisplay').textContent='10:00';
  document.querySelectorAll('.evidence-item').forEach(el=>{el.classList.remove('found');el.onclick=null;});
  document.getElementById('suspectHead').style.background='';
  document.getElementById('sweatDrop').style.opacity='0';
  hideChoices(); updateMeters();
}

function loadCase(suspect){
  ActiveCase=suspect;
  GameState.currentSuspect=suspect.name;
  GameState.currentCase=suspect.caseTitle;
  choicePool=buildChoicePool(suspect);
  document.getElementById('caseBrief').innerHTML=`
    <strong>Active Case</strong>
    <b style="color:var(--text-gold)">${suspect.caseTitle}</b><br><br>
    Suspect: <span style="color:var(--text-primary)">${suspect.name}</span><br>
    Case #${suspect.caseNumber} — ${suspect.charge}<br><br>
    <span style="font-size:10px">${suspect.caseDesc}</span>`;
  const evPanel=document.querySelector('.evidence-panel');
  evPanel.innerHTML='<div class="panel-title">Evidence File</div>';
  suspect.evidence.forEach((ev,i)=>{
    const div=document.createElement('div');
    div.className='evidence-item'; div.id='ev'+i;
    div.innerHTML=`<div class="evidence-dot"></div><span>${ev.label}</span>`;
    evPanel.appendChild(div);
  });
  const head=document.getElementById('suspectHead');
  head.style.background=`linear-gradient(180deg,${suspect.skinTone[0]} 0%,${suspect.skinTone[1]} 60%,${suspect.skinTone[2]} 100%)`;
  document.querySelector('.suspect-hair').style.background=`linear-gradient(180deg,${suspect.hairColor},${suspect.hairColor}dd)`;
  document.getElementById('dialogueSpeaker').textContent=suspect.name.toUpperCase();
}

function endGame(success,reason){
  GameState.gameOver=true;
  clearInterval(GameState.timerInterval);
  stopAmbientMusic(); hideChoices();
  if(success) playSFX('confession');
  const timeUsed=600-GameState.timer;
  const m=Math.floor(timeUsed/60), s=timeUsed%60;
  setTimeout(()=>{
    const titleEl=document.getElementById('endTitle');
    titleEl.textContent=success?'Case Closed':reason==='shutdown'?'Suspect Shut Down':'Time Expired';
    titleEl.className='end-title '+(success?'success':'fail');
    document.getElementById('endSubtitle').textContent=success
      ?ActiveCase.confessionResult
      :reason==='shutdown'
        ?`${ActiveCase.name} lawyered up. Too much pressure, not enough finesse.`
        :`Time ran out. ${ActiveCase.name} was released. The trail goes cold.`;
    document.getElementById('endTime').textContent=`${m}m ${s}s`;
    document.getElementById('endActions').textContent=GameState.actionCount;
    document.getElementById('endEvidence').textContent=GameState.evidenceFound.length+'/'+ActiveCase.evidence.length;
    switchScreen('gameScreen','endScreen');
  },success?8000:1500);
}

function restartGame(){
  switchScreen('endScreen','gameScreen');
  const suspect=pickRandomCase();
  resetState(); loadCase(suspect);
  setDialogue(suspect.name.toUpperCase(),suspect.intro);
  startAmbientMusic(0);
  GameState.timerInterval=setInterval(updateTimer,1000);
  setTimeout(()=>{ if(!GameState.gameOver) renderChoices(getNextThreeChoices()); },2000);
}

function goToMenu(){ stopAmbientMusic(); switchScreen('endScreen','startScreen'); }
function showHowToPlay(){ switchScreen('startScreen','howToPlayScreen'); }
function goToMenuFromHTP(){ switchScreen('howToPlayScreen','startScreen'); }
function exitGame(){ showNotification('Close the browser tab to exit.',''); }

function switchScreen(fromId,toId){
  const from=document.getElementById(fromId), to=document.getElementById(toId);
  from.style.opacity='0';
  setTimeout(()=>{
    from.classList.remove('active'); from.style.opacity='';
    to.classList.add('active'); to.style.display='flex';
    requestAnimationFrame(()=>{ to.style.opacity='1'; });
  },400);
}

document.querySelector('.desk')?.addEventListener('click',()=>{ initAudio(); });
