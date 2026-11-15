const $=id=>document.getElementById(id);
const suitSymbols={c:'♣',d:'♦',h:'♥',s:'♠'};
const suitNames={c:'clubs',d:'diamonds',h:'hearts',s:'spades'};
const rankNames={T:'10',J:'J',Q:'Q',K:'K',A:'A'};
const cardName=c=>(rankNames[c[0]]||c[0])+' of '+suitNames[c[1]];
const cardText=c=>(rankNames[c[0]]||c[0])+suitSymbols[c[1]];
function card(c,extra='',id='') {
  return `<span ${id?`id="${id}"`:''} class="card ${c&&'dh'.includes(c[1])?'red':''} ${c?'':'empty'} ${extra}" ${c?`aria-label="${cardName(c)}"`:'aria-label="Empty card slot"'}>${c?`<span>${rankNames[c[0]]||c[0]}</span><span class="suit">${suitSymbols[c[1]]}</span>`:'·'}</span>`;
}
function communityMeta(boards,shared,stage,hand=null){
  const label={dealing:'Hole cards',preflop:'Preflop',flop:'Flop',turn:'Turn',river:'River',showdown:'Showdown',complete:'Hand complete'}[stage]||stage;
  return `<span class="board-meta">${hand===null?(boards.length===2?'Two runs':'One board'):`Hand ${hand} · Blinds 1/2${boards.length===2?' · Two runs':''}`} ${shared?' · '+shared+' shared':''}<span class="board-stage">${safe(label)}</span></span>`;
}
function shuffled() {
  const d=Poker.fullDeck();
  for(let i=d.length-1;i>0;i--) {const j=randomBelow(i+1);[d[i],d[j]]=[d[j],d[i]];}
  return d;
}
const completeDeck=prefix=>[...prefix.split(' '),...Poker.fullDeck().filter(c=>!prefix.split(' ').includes(c))];
const examples={
 normal:{players:4,deck:completeDeck('Kc 4d 8h As Kh 4c 9h Qs 2c Js Ts 2d 3c Ks 3d 5h')},
 twice:{players:2,deck:completeDeck('Ks As Kh Ah 2c Ad Kd 7c 3c 2d 3d 4h 5c Kc 5d 6h')},
 tie:{players:2,deck:completeDeck('2c Ac 3c Ah 4c Ts Js Qs 4d Ks 4h As')}
};
const names=Array.from({length:8},(_,i)=>'Player '+(i+1));
const name=i=>names[i]||('Player '+(i+1));
const safe=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=Poker.create(4,shuffled(),true),playing=false,busy=false,guideBusy=false,playbackId=0;
let notice='20 chips each; 1/2 blinds posted. Player 1 has the button. Deal the hole cards, then control the highlighted player.';
let guideKey='normal',guideStep=0,simPending=null,simPendingCancel=null,simPaused=false,simCelebrated=false,simPrepared=false;
$('reduce').checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
const speed=()=>Number($('speed').value);
const waiting=()=>state.betting?.actor!==null&&state.betting?.actor!==undefined;
const activeResult=board=>{
  if(![3,4,5].includes(board.length))return null;
  const r=Poker.results(state.hands,board);
  if(state.betting){const eligible=r.hands.flatMap((h,i)=>state.betting.folded[i]?[]:[i]);const max=Math.max(...eligible.map(i=>r.hands[i].score));r.winners=eligible.filter(i=>r.hands[i].score===max);}
  return r;
};
const simEquity={key:'',status:'incomplete',results:[],error:''};
let simWorker=null,simJob=0;
function simulationVisible(){return {hands:state.hands,boards:state.boards,folded:state.betting?.folded||state.hands.map(()=>false),burns:state.burns.map(b=>b.card)};}
function stopSimulationEquity(status){
  simJob++;simWorker?.terminate();simWorker=null;
  if(status||simEquity.status==='running'){simEquity.status=status||'cancelled';simEquity.results=[];}
}
function syncSimulationEquity(){
  if($('simulation').hidden)return;
  if(state.hands.some(h=>h.length!==2)||state.queue.length||busy){renderSimulationEquity();return;}
  const key=JSON.stringify(simulationVisible());
  if(key!==simEquity.key){simEquity.key=key;startSimulationEquity();}else renderSimulationEquity();
}
function startSimulationEquity(){
  stopSimulationEquity('running');simEquity.error='';renderSimulationEquity();
  const id=simJob,visible=simulationVisible();
  if(visible.folded.filter(f=>!f).length===1){simEquity.results=[...Equity.simulation(visible)];simEquity.status='complete';renderSimulationEquity();return;}
  try{
    simWorker=new Worker("/scripts/equity-worker.js");
    simWorker.onmessage=({data})=>{
      if(id!==simJob||data.id!==id||$('simulation').hidden||simEquity.status!=='running')return;
      if(data.error){fail(data.error);return;}
      simEquity.results[data.result.board]=data.result;
      if(simEquity.results.filter(r=>r?.done).length===visible.boards.length){simEquity.status='complete';simWorker.terminate();simWorker=null;}
      renderSimulationEquity();
    };
    simWorker.onerror=()=>fail('Hand equity could not finish. Try calculating again.');
    simWorker.postMessage({id,visible});
  }catch(e){fail('Hand equity is unavailable: '+e.message);}
  function fail(message){if(id!==simJob)return;stopSimulationEquity('error');simEquity.error=message;renderSimulationEquity();}
}
function simulationPercent(i,details=false){
  if(state.betting?.folded[i])return 'Folded';
  return state.boards.map((_,j)=>{
    const r=simEquity.results[j],p=r?.players?.[r.seats.indexOf(i)],estimated=r&&!r.exact;
    return EquityBars.html(p?.equity,estimated,state.twice?(j?'B':'A'):'')+(details&&p?`<span class="equity-details">Win ${EquityBars.percent(p.win,estimated)} · Tie ${EquityBars.percent(p.tie,estimated)}</span>`:'');
  }).join('');
}
function renderSimulationEquity(){
  const status=$('sim-equity-status');
  const text=simEquity.status==='incomplete'?'Hand equity appears after the hole cards are dealt.':simEquity.status==='dealing'?'Hand equity waits for the completed street.':simEquity.status==='cancelled'?'Calculation cancelled.':simEquity.status==='error'?simEquity.error:simEquity.results.map((r,j)=>r?`Board ${j?'B':'A'} · ${r.exact?(r.done?'Exact':'Enumerating'):'Estimated'} · ${r.completed.toLocaleString()} / ${r.total.toLocaleString()} boards`:'').join(' · ')||'Calculating hand equity…';
  const action=simEquity.status==='running'?'cancel':['cancelled','error'].includes(simEquity.status)?'retry':'';
  if(status.dataset.action===action&&$('sim-equity-progress'))$('sim-equity-progress').textContent=text;
  else {status.dataset.action=action;status.innerHTML=`<p id="sim-equity-progress">${safe(text)}</p>${action?`<button id="sim-equity-${action}">${action==='cancel'?'Cancel calculation':'Calculate again'}</button>`:''}<p>Hand equity compares all non-folded hands in one equal pot, not actual chip payouts or side pots. Estimates may vary.</p>`;}
  state.hands.forEach((_,i)=>{if($('sim-equity-seat-'+i))EquityBars.update($('sim-equity-seat-'+i),simulationPercent(i));if($('sim-equity-detail-'+i))EquityBars.update($('sim-equity-detail-'+i),simulationPercent(i,true));});
  if(action==='cancel')$('sim-equity-cancel').onclick=()=>{stopSimulationEquity();renderSimulationEquity();};
  if(action==='retry')$('sim-equity-retry').onclick=startSimulationEquity;
}
function destination(e) {
  return e.kind==='hole'?name(e.player):e.kind==='burn'?`burn before ${e.stage} · Board ${e.board?'B':'A'}`:`${e.stage} · Board ${e.board?'B':'A'}`;
}
function replaceSimulation(action){
  if(state.stage==='complete'||(!state.cursor&&!(state.betting?.history.length>2)))return action();
  playing=false;playbackId++;
  return new Promise(resolve=>simConfirm(async()=>{await action();resolve(true);},'Replace this unfinished practice deal? Its cards and bets will be reset.',()=>resolve(false)));
}
function simBoardVerdict(j){
  if(state.boards[j].length!==5||waiting())return '';
  const pots=state.betting?Poker.potResults(state):null;
  if(pots)return '<div class="board-verdict" role="status">'+pots.map((p,k)=>{const share=p.shares[j];return share?`<div><strong>${k?'Side pot '+k:'Main pot'}</strong> · ${share.winners.map(i=>safe(name(i))).join(' &amp; ')} ${share.winners.length>1?'tie':'wins'} · ${share.amount} chips</div>`:'';}).join('')+(state.stage!=='complete'?'<small>Paid after both boards finish.</small>':'')+'</div>';
  const r=activeResult(state.boards[j]);return '<div class="board-verdict" role="status">'+r.winners.map(i=>safe(name(i))).join(' &amp; ')+(r.winners.length>1?' tie':' wins')+'</div>';
}
function simulationOutcome(i){
  if(state.stage!=='complete')return null;
  if(state.betting)return {won:state.betting.awards[i]>0,label:state.betting.awards[i]?'Won '+state.betting.awards[i]+' chips':'No pot won'};
  const wins=state.boards.flatMap((board,j)=>{const r=activeResult(board);return r.winners.includes(i)?[state.twice?(r.winners.length>1?'Tied ':'Won ')+(j?'B':'A'):r.winners.length>1?'Tied winner':'Winner']:[];});
  return {won:wins.length>0,label:wins.join(' · ')||'No win'};
}
function winningCards(hole,board,key){
 const guide=Poker.guide(hole,board);
 return `<div data-winning-hand="${key}"><small class="winning-caption">Winning five · thick borders define the hand</small><div class="guide-cards">${guide.cards.map(c=>`<div class="guide-card">${card(c.card,c.defining?'small-card defining':'small-card')}<small>${safe(c.role)}</small></div>`).join('')}</div></div>`;
}
function winsBoard(s,i,j){return s.stage==='complete'&&!s.betting?.folded[i]&&(s.betting?Poker.potResults(s)?.some(p=>p.shares[j]?.winners.includes(i)):activeResult(s.boards[j])?.winners.includes(i));}
function resultsHTML(){
  return state.hands.map((h,i)=>`<details class="player-result" open><summary><strong>${safe(name(i))}</strong>${state.betting?.folded[i]?' · Folded':''}${simulationOutcome(i)?`<span class="result-outcome ${simulationOutcome(i).won?'outcome-winner':''}">${simulationOutcome(i).label}</span>`:''}</summary><div class="sim-player-overview"><div class="hole-cards">${[0,1].map(j=>card(h[j])).join('')}</div><div id="sim-equity-detail-${i}" class="sim-equity-detail"></div></div>${state.boards.map((board,j)=>{const r=activeResult(board);return r?`<h3>${state.twice?'Board '+(j?'B':'A')+' · ':''}${r.hands[i].category}</h3>${winsBoard(state,i,j)?winningCards(h,board,`sim-${i}-${j}`):`<small>Best five cards</small><div class="best-cards">${r.hands[i].cards.map(c=>card(c,'small-card')).join('')}</div>`}`:'<p class="minor">Complete the flop to see the best five cards.</p>';}).join('')}</details>`).join('');
}
function celebrateSimulation(){
  if(state.stage!=='complete'||simCelebrated||$('simulation').hidden)return;
  simCelebrated=true;
  const winners=state.betting?state.betting.awards.flatMap((v,i)=>v?[i]:[]):[...new Set(state.boards.flatMap(b=>activeResult(b).winners))];
  $('sim-winner-summary').innerHTML='<p>'+winners.map(i=>safe(name(i))).join(' &amp; ')+(winners.length===1?' wins':' share the wins')+'</p>'+state.boards.map((_,j)=>simBoardVerdict(j)?'<h3>Board '+(j?'B':'A')+'</h3>'+simBoardVerdict(j):'').join('');
  FX.winner($('sim-winner'),{mode:'sim',pots:state.betting?Poker.potResults(state):[],showdown:!state.betting||state.betting.folded.filter(f=>!f).length>1});
  if(!$('reduce').checked)$('sim-celebration').innerHTML=`<div class="hand-confetti" aria-hidden="true">${Array.from({length:36},(_,i)=>`<i style="--x:${i*37%100}%;--drift:${(i%7-3)*30}px;--delay:${i%8*.06}s;--spin:${180+i*29}deg;--color:${['#d4a52b','#4169e1','#c42f3d','#288362'][i%4]}"></i>`).join('')}</div>`;
}
$('sim-winner-close').onclick=()=>{$('sim-winner').close();$('sim-celebration').innerHTML='';$('shuffle').focus();};

function render() {
  $('simulation').dataset.reduced=String($('reduce').checked);$('sim-winner').style.animation=$('reduce').checked?'none':'';
  $('notice').textContent=notice;
  $('sim-pot').textContent=state.betting?'Pot '+state.betting.pot:'Deal-only mode';
  $('stage').innerHTML=communityMeta(state.boards,state.shared,state.stage);
  $('boards').innerHTML=state.boards.map((b,j)=>`<div class="board-line"><div class="board-name">${j?'B':'A'}</div><div class="board-cards">${Array.from({length:5},(_,i)=>card(b[i],i<state.shared?'shared':'',`board-${j}-${i}`)).join('')}</div></div>${simBoardVerdict(j)}`).join('');
  const allResults=state.boards.map(activeResult);
  $('players').innerHTML=`<div class="mp-center"><div id="deck-source" class="deck-stack"></div><span id="burn-target" class="burn-slot">${state.burns.length}</span><p><strong id="remaining">${52-state.cursor}</strong> in deck</p></div>`+state.hands.map((h,i)=>{
    const outcome=simulationOutcome(i),winner=outcome?.won;
    const action=state.betting?.actions[i],color=action?.kind==='all'?'gold':action?.kind==='fold'?'red':action?.kind==='raise'?'blue':action?.kind==='call'&&state.betting.paid[i]===state.betting.currentBet?'green':'neutral';
    const angle=(90+i*360/state.players)*Math.PI/180,grid=state.players>6?'':`grid-column:${Math.cos(angle)<-.1?1:Math.cos(angle)>.1?3:2};grid-row:${Math.sin(angle)<-.1?1:Math.sin(angle)>.1?3:2}`;
    const labels=allResults.map((r,b)=>r?`${state.twice?(b?'B: ':'A: '):''}${r.hands[i].category}`:'').filter(Boolean);
    return `<div class="seat mp-seat action-${color} ${winner?'seat-winner':outcome?'seat-loser':''} ${state.betting?.actor===i?'acting':''} ${state.betting?.folded[i]?'folded':''}" style="${seatStyle(i,state.players)};${grid}"><div class="seat-name">${safe(name(i))}${i===0?'<span class="dealer" title="Dealer button">D</span>':''}</div><div class="seat-position">${Poker.positions(state.players)[i]}</div><div class="hole-cards">${[0,1].map(j=>card(h[j],'',`hole-${i}-${j}`)).join('')}</div><div class="seat-stack">${state.betting?state.betting.stacks[i]+' chips'+(action?'<br>'+safe(action.text):state.betting.paid[i]?' · '+state.betting.paid[i]+' in':''):''}</div><div class="seat-cat">${labels.join('<br>')||'Waiting for flop'}</div><div id="sim-equity-seat-${i}" class="sim-equity-seat"></div></div>`;
  }).join('');
  $('table-foot').textContent=state.twice?(state.shared?'Dotted cards are shared, not drawn twice. ':'')+'Finish Board A, then Board B.':'Two clockwise passes • burn before every new street';
  const collapsed=[...$('results').querySelectorAll('details')].map(el=>!el.open);
  $('results').innerHTML=resultsHTML();
  $('results').querySelectorAll('details').forEach((el,i)=>{if(collapsed[i])el.open=false;});
  $('stats').innerHTML=`<span><strong>${state.cursor}</strong> consumed</span><span><strong>${52-state.cursor}</strong> left</span><span><strong>${state.players}</strong> players</span>`;
  $('deck-grid').innerHTML=state.deck.map((c,i)=>`<div class="deck-item ${i<state.cursor?'used':i===state.cursor?'next':''}" title="${i+1}. ${cardName(c)}${i<state.cursor?' → '+safe(destination(state.log[i])):''}"><div>${i+1}${i===state.cursor?' ↓':''}</div>${card(c)}</div>`).join('');
  $('burn-list').innerHTML=state.burns.length?state.burns.map(b=>`<div class="result-row">${card(b.card,'small-card')}<span class="minor">Before ${b.stage} · Board ${b.board?'B':'A'}</span></div>`).join(''):'<p class="minor">No cards burned yet.</p>';
  $('log').innerHTML=state.log.map(e=>`<li><strong>${cardText(e.card)}</strong> → ${safe(destination(e))}</li>`).join('');
  renderBetting();controls();renderGuide();syncSimulationEquity();celebrateSimulation();
  $('remaining').textContent=52-state.cursor;
  $('sim-history').innerHTML='<h2>Betting history</h2>'+Match.historyRounds(state).map(round=>`<section class="history-round"><h3>${safe(round.label)}</h3>${round.actions.length?'<ol>'+round.actions.map(e=>`<li>${safe(name(e.player))}: ${safe(e.text)}</li>`).join('')+'</ol>':'<p>No betting</p>'}</section>`).join('');
}
function controls() {
  const board=state.boards[state.board],street=state.queue[0]?.stage||(board.length===0?'flop':board.length===3?'turn':'river');$('sim-deal').textContent=state.stage==='complete'?'Hand complete':state.stage==='dealing'?'Deal Hole Cards':(state.queue.length?'Finish ':'Deal ')+street[0].toUpperCase()+street.slice(1)+(state.twice?' · Board '+(state.board?'B':'A'):'');
  $('sim-deal').disabled=simPaused||busy||playing||guideBusy||waiting()||state.stage==='complete';
  $('next').disabled=simPaused||busy||playing||guideBusy||waiting()||state.stage==='complete';
  $('twice').disabled=simPaused||busy||playing||guideBusy||!Poker.canRunTwice(state);
  $('play').disabled=simPaused||guideBusy||waiting()||state.stage==='complete'||(busy&&!playing);
  $('play').textContent=playing?'Pause':busy?'Finishing card…':'Play';
  $('shuffle').disabled=busy||guideBusy; $('replay').disabled=busy||guideBusy;
  $('betting-mode').disabled=busy||playing||guideBusy;
  $('player-count').disabled=busy||playing||guideBusy;
  document.querySelectorAll('[data-guide]').forEach(b=>b.disabled=simPaused||busy||playing||guideBusy);
}
function invalidateGuide(){guideStep=0;}
async function animateCard(event,nextState) {
  if($('reduce').checked) return;
  const origin=$('deck-source').getBoundingClientRect();
  const target=event.kind==='hole'?$('hole-'+event.player+'-'+(nextState.hands[event.player].length-1)):event.kind==='burn'?$('burn-target'):$('board-'+event.board+'-'+(nextState.boards[event.board].length-1));
  const dest=target.getBoundingClientRect();
  const temp=document.createElement('div');temp.innerHTML=card(event.card,'ghost');
  const el=temp.firstElementChild;el.setAttribute('aria-hidden','true');document.body.append(el);
  Object.assign(el.style,{left:origin.left+'px',top:origin.top+'px',width:dest.width+'px',height:dest.height+'px'});
  const animation=el.animate([{transform:'translate(0,0) rotate(-10deg)',opacity:1},{transform:`translate(${dest.left-origin.left}px,${dest.top-origin.top}px) rotate(0deg)`,opacity:1}],{duration:850/speed(),easing:'cubic-bezier(.22,.7,.3,1)',fill:'forwards'});
  try{await animation.finished;}catch(e){if(e.name!=='AbortError')throw e;}finally{el.remove();}
}
async function oneCard() {
  if(simPaused||busy||waiting()||state.stage==='complete') return;
  if(!state.log.length||state.log.at(-1).end)$('sim-table-start').scrollIntoView({block:'start',behavior:'instant'});
  busy=true;stopSimulationEquity('dealing');renderSimulationEquity();controls();
  const next=Poker.next(state),event=next.log.at(-1),unlock=FX.lockDealing();
  try {
    await animateCard(event,next);
    state=next;
    notice=`Card ${event.position}: ${cardText(event.card)} → ${destination(event)}.`;
    if(event.end&&state.stage!=='complete') {
      playing=false;
      notice+=waiting()?' Betting: '+name(state.betting.actor)+' to act.':' Stage complete. Inspect the hands, continue, or choose Run it twice.';
    }
    if(state.stage==='complete'){playing=false;notice+=' Deal complete. See the winners for each board below.';}
  } finally {busy=false;render();unlock();}
}
async function prepareSimulation(){
 if(!FX.enhanced||simPrepared)return true;
 simPrepared=true;busy=true;controls();const ok=await FX.shuffle();busy=false;
 if(!ok){simPaused=true;playing=false;playbackId++;notice='Preparation paused. The same deck is ready; resume when everyone is ready.';}
 render();return ok;
}
async function play(){
 if(!simPaused&&!busy&&!simPrepared&&state.cursor===0&&!await prepareSimulation())return;
  invalidateGuide();
  if(playing){playing=false;playbackId++;notice='Pausing after the moving card lands.';$('notice').textContent=notice;controls();return;}
  if(simPaused||busy)return;
  const id=++playbackId;playing=true;controls();
  const unlock=FX.lockDealing();try{while(playing&&id===playbackId&&!waiting()&&state.stage!=='complete') {await oneCard(); if(playing&&id===playbackId&&!$('reduce').checked)await new Promise(r=>setTimeout(r,120/speed()));}
  }finally{unlock();controls();}
}
function reset(players,deck,message){
  FX.clear();FX.resetHighlights();simPrepared=false;stopSimulationEquity('incomplete');simEquity.key='';simCelebrated=false;$('sim-winner').close();$('sim-celebration').innerHTML='';playing=false;simPaused=false;playbackId++;state=Poker.create(players,deck,$('betting-mode').checked);$('player-count').value=String(players);
  notice=message;render();
}
async function shuffleNew(){
  if(FX.enhanced){if(busy||guideBusy)return;reset(Number($('player-count').value),shuffled(),'New deck prepared.');await prepareSimulation();return;}
  if(busy||guideBusy)return;
  playing=false;playbackId++;busy=true;invalidateGuide();controls();
  notice='Shuffling…';$('notice').textContent=notice;
  if(!$('reduce').checked){
    const r=$('deck-source').getBoundingClientRect();
    await Promise.all([-1,1].map(async sign=>{
      const el=document.createElement('div');el.className='shuffle-ghost';el.style.left=r.left+'px';el.style.top=r.top+'px';document.body.append(el);
      try{await el.animate([{transform:'translateX(0) rotate(0deg)'},{transform:`translateX(${sign*32}px) rotate(${sign*18}deg)`},{transform:'translateX(0) rotate(0deg)'}],{duration:700,iterations:2,easing:'ease-in-out'}).finished;}catch(e){if(e.name!=='AbortError')throw e;}finally{el.remove();}
    }));
  }
  busy=false;reset(Number($('player-count').value),shuffled(),'New shuffled deck. Its displayed order is the order we will deal.');
}
function twice(){state=Poker.runTwice(state);notice='Two runs selected. Keep the same hands and shared board cards. Finish A, then B.';render();}
async function stage(){if(simPaused||busy||waiting())return false;const id=playbackId,unlock=FX.lockDealing();try{do{await oneCard();}while(!simPaused&&id===playbackId&&!$('simulation').hidden&&!waiting()&&state.stage!=='complete'&&!state.log.at(-1).end);}finally{unlock();}}
const guides={
 normal:{text:'Follow one fixed four-player deal. Watch the two passes, each burn, and Seat 1 making a royal flush at the turn.',steps:[['Load example',()=>load('normal')],['Deal hole cards',stage],['Burn + flop',stage],['Burn + turn',stage],['Burn + river',stage]]},
 twice:{text:'Both players flop three of a kind. Share that flop, finish A, then B. Seat 1 wins A; Seat 2 makes four kings and wins B.',steps:[['Load example',()=>load('twice')],['Deal hole cards',stage],['Burn + flop',stage],['Run it twice',twice],['Deal A turn',stage],['Deal A river',stage],['Deal B turn',stage],['Deal B river',stage]]},
 tie:{text:'The board becomes a royal flush. Both players use the board and tie, even though their hole cards differ.',steps:[['Load example',()=>load('tie')],['Deal hole cards',stage],['Burn + flop',stage],['Burn + turn',stage],['Burn + river: tie',stage]]},
 boundary:{text:'A partially dealt flop is not a decision point. Try starting two runs during it, then complete the flop and try again.',steps:[['Load example',()=>load('twice')],['Deal hole cards',stage],['Burn + first flop card',async()=>{await oneCard();await oneCard();}],['Try two runs now',()=>{try{Poker.runTwice(state);}catch(e){notice='Correctly blocked: finish the flop before choosing two runs.';render();}}],['Finish the flop',stage],['Now run it twice',twice],['Deal A turn',stage],['Deal A river',stage],['Deal B turn',stage],['Deal B river',stage]]}
};
function load(key){return replaceSimulation(()=>{$('betting-mode').checked=false;const ex=examples[key];reset(ex.players,ex.deck,'Fixed walkthrough deck loaded. This order makes the example repeatable.');});}
function renderBetting() {
  const b=state.betting;
  let body='<h2>'+(b?'Demo betting':'Deal-only mode')+'</h2>';
  if(b?.settled)body+=`<p>${b.awards.flatMap((v,i)=>v?[`${safe(name(i))} receives ${v} chips`]:[]).join(' · ')}.</p><p class="minor">New Deal resets every stack to 20.</p>`;
  else if(b?.actor!==null&&b?.actor!==undefined){
    const i=b.actor,l=Poker.legal(state);
    body+=`<h3>${safe(name(i))} · ${Poker.positions(state.players)[i]}</h3><p>${b.stacks[i]} chips left · ${l.owed?l.call+' to call':'Nothing to call'}</p><div class="action-row betting-actions"><button id="fold">Fold</button><button id="call-check" class="primary">${l.owed?'Call '+l.call:'Check'}</button></div><div class="raise-slider"><label for="raise-to">Bet size</label><input id="raise-to" type="range" min="${l.min}" max="${l.max}" step="1" value="${l.min}" aria-describedby="sim-raise-selection" ${l.canRaise&&l.min<l.max?'':'disabled'}><div class="range-labels"><span>Min · ${l.min}</span><span>Max · ${l.max}</span></div><button id="raise" ${l.canRaise?'':'disabled'}>Raise</button></div><p id="sim-raise-selection" class="minor"></p><p class="minor">Raise-to includes chips already paid this round. Max uses the full stack.</p>`;
  }else body+='<p>Inspect the visible cards, then deal the next street when ready.</p>';
  body+='<div class="action-row"><button id="sim-pause">'+(simPaused?'Resume Simulation':'Pause Simulation')+'</button></div>';
  $('betting-panel').innerHTML=body;
  $('sim-pause').onclick=()=>{simPaused=!simPaused;playing=false;playbackId++;render();};
  if(b?.actor!==null&&b?.actor!==undefined){
    const l=Poker.legal(state),i=b.actor;
    const update=()=>{const value=Number($('raise-to').value),all=value===l.max;$('raise').textContent=all?'All-in '+b.stacks[i]:(b.currentBet?'Raise to ':'Bet ')+value;$('raise').style.background=all?'#e2b43c':'#4169e1';$('raise').style.color=all?'#302509':'#fff';$('sim-raise-selection').textContent=value+' total this round · '+(value-b.paid[i])+' chips now.';};
    $('raise-to').oninput=update;update();
    const ask=(action,amount)=>simConfirm(()=>wager(action,amount),name(i)+': '+(action==='raise'?($('raise').textContent+'?'):action==='call'?'Call '+l.call+' chips?':action==='fold'?'Fold this hand?':'Check without adding chips?'));
    $('fold').onclick=()=>ask('fold');$('call-check').onclick=()=>ask(l.owed?'call':'check');$('raise').onclick=()=>ask('raise',Number($('raise-to').value));
    for(const id of ['fold','call-check','raise','raise-to'])if(simPaused||busy||playing||guideBusy)$(id).disabled=true;
    $('raise').disabled=simPaused||busy||playing||guideBusy||!l.canRaise;
  }
}
function simConfirm(action,text,onCancel){simPending=action;simPendingCancel=onCancel;$('sim-confirm-text').textContent=text;$('sim-confirm').showModal();}
function cancelSimConfirm(){const cancel=simPendingCancel;simPending=null;simPendingCancel=null;$('sim-confirm').close();cancel?.();}
$('sim-confirm-no').onclick=cancelSimConfirm;
$('sim-confirm').oncancel=cancelSimConfirm;
$('sim-confirm-yes').onclick=()=>{const action=simPending;simPendingCancel=null;cancelSimConfirm();return action?.();};

function wager(action,amount) {
  const actor=state.betting.actor,from=FX.snapshot('sim',actor),before=state.betting.total[actor];
  try {
    state=Poker.act(state,action,amount);
    const last=state.betting.history.at(-1);
    notice=name(last.player)+': '+last.text+'. '+(state.betting.settled?'Hand finished.':state.betting.actor===null?'Round complete; continue dealing.':name(state.betting.actor)+' to act.');
  } catch(e){notice=e.message;}
  render();FX.contribution('sim',from,state.betting.total[actor]-before);
}

function renderGuide(){
  const g=guides[guideKey];
  $('guide').innerHTML=`<p class="guide-desc">${g.text}</p><div class="guide-step"><span class="guide-progress">${guideStep<g.steps.length?'Step '+(guideStep+1)+' of '+g.steps.length:'Walkthrough complete'}</span><button id="guide-next" ${simPaused||busy||playing||guideBusy?'disabled':''}>${guideStep<g.steps.length?g.steps[guideStep][0]:'Restart walkthrough'}</button></div>`;
  $('guide-next').onclick=async()=>{
    if(simPaused||busy||playing||guideBusy)return;
    if(guideStep>=g.steps.length)guideStep=0;
    guideBusy=true;controls();renderGuide();
    try{if(await g.steps[guideStep][1]()!==false)guideStep++;}finally{guideBusy=false;render();}
  };
}
$('name-editor').innerHTML=names.map((n,i)=>`<label>Seat ${i+1}<input data-name="${i}" value="${safe(n)}" maxlength="20" aria-label="Seat ${i+1} name"></label>`).join('');
document.querySelectorAll('[data-name]').forEach(el=>el.onchange=()=>{names[Number(el.dataset.name)]=el.value.trim().slice(0,20)||('Player '+(Number(el.dataset.name)+1));el.value=names[Number(el.dataset.name)];render();});
$('betting-mode').onchange=()=>{const enabled=$('betting-mode').checked;$('betting-mode').checked=!!state.betting;return replaceSimulation(()=>{$('betting-mode').checked=enabled;invalidateGuide();reset(state.players,state.deck,'Mode changed. Same deck, fresh 20-chip deal.');});};
$('next').onclick=()=>{invalidateGuide();return oneCard();};
$('play').onclick=play;
$('sim-deal').onclick=play;
$('twice').onclick=()=>{invalidateGuide();twice();};
$('shuffle').onclick=()=>replaceSimulation(shuffleNew);
$('replay').onclick=()=>replaceSimulation(async()=>{invalidateGuide();reset(state.players,state.deck,'Same deck prepared. Choose Deal Hole Cards to replay.');await prepareSimulation();});
$('player-count').onchange=()=>{const count=Number($('player-count').value);$('player-count').value=String(state.players);return replaceSimulation(()=>{$('player-count').value=String(count);return shuffleNew();});};
document.querySelectorAll('[data-guide]').forEach(b=>b.onclick=()=>{guideKey=b.dataset.guide;guideStep=0;document.querySelectorAll('[data-guide]').forEach(t=>t.setAttribute('aria-selected',String(t===b)));renderGuide();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelSimConfirm();if(document.hidden&&playing){playing=false;playbackId++;notice='Playback paused while the page was hidden.';controls();}});
window.addEventListener('blur',()=>{if(busy||playing){simPaused=true;playing=false;playbackId++;controls();}});
function seatStyle(i,n){if(n>6){const points=n===8?[[50,90],[15,75],[15,50],[15,25],[50,10],[85,25],[85,50],[85,75]]:[[50,90],[15,75],[15,50],[15,25],[50,10],[85,30],[85,65]];return `left:${points[i][0]}%;top:${points[i][1]}%;grid-column:${points[i][0]<30?1:points[i][0]>70?3:2};grid-row:${points[i][1]<40?1:points[i][1]>60?3:2};--seat-lift:0px;--rank-lift:0%`;}const angle=(90+i*360/n)*Math.PI/180;return `left:${50+35*Math.cos(angle)}%;top:${50+34*Math.sin(angle)}%;--seat-lift:${Math.max(0,Math.sin(angle))*48}px;--rank-lift:${Math.abs(Math.cos(angle))<0.1?0:Math.sin(angle)<-0.1?30:5}%`;}
render();
