(()=>{
  const app=$('pocket-app'),storageKey='pocket-table-prototype-v1';
  // shortcut: one active tab owns the local save; add conflict handling before supporting concurrent tabs.
  let screen='home',match=null,saved=null,saveError='',message='',pumpId=0,flight=null,setupCount=4,setupReveal=Preferences.get().reveal,setupGuidance=Preferences.get().guidance,celebratedHand=0,pendingBet=null,detailsOpen=false,rematchPending=false;
  const setupNames=[...names];
  const collapsedBoards=new Set();
  const back=(id='')=>`<span ${id?`id="${id}"`:''} class="card card-back" aria-label="Face-down card">◆</span>`;
  const brand=()=>'<span class="pocket-logo header-logo" aria-hidden="true"><span>♥</span><span>♠</span></span><span>Pocket Poker</span>';
  const gear=()=>'<button id="settings-open" aria-label="Settings" class="settings-gear">⚙</button>';
  const header=()=>`<div class="game-top screen-head"><div id="screen-home" class="brand-small brand-home">${brand()}</div><div class="header-actions"><button data-nav="${['equity','rankings'].includes(screen)?'modes':'home'}">Back</button>${gear()}</div></div>`;
  try{saved=localStorage.getItem(storageKey);if(saved)Match.restore(saved);}catch(e){saveError='The saved game could not be loaded. It will not be replaced unless you start a new game.';}
  function rankingsHTML(){
    const hands=[["Royal flush", "As Ks Qs Js Ts", "Ace, king, queen, jack, and ten of one suit. This is the highest straight flush.", "All royal flushes are equal."], ["Straight flush", "9h 8h 7h 6h 5h", "Five consecutive cards of one suit.", "Compare the highest card. A five-high straight flush is the lowest."], ["Four of a kind", "Qc Qd Qh Qs Ac", "Four cards of the same rank, plus one kicker.", "Compare the four matching cards first, then the kicker."], ["Full house", "Kh Kd Kc 8s 8h", "Three cards of one rank and two of another.", "Compare the three matching cards first, then the pair."], ["Flush", "Ad Jd 9d 6d 2d", "Five cards of one suit, not all consecutive.", "Compare the highest card, then each lower card in order until one differs."], ["Straight", "8c 7d 6h 5s 4c", "Five consecutive cards, not all of one suit.", "Compare the highest card. A–2–3–4–5 is five-high; 10–J–Q–K–A is ace-high."], ["Three of a kind", "7c 7d 7s Ah Qc", "Three cards of the same rank and two kickers.", "Compare the three matching cards, then the higher kicker, then the lower kicker."], ["Two pair", "Jh Jc 4d 4s Ah", "Two cards of one rank, two of another, and one kicker.", "Compare the higher pair, then the lower pair, then the kicker."], ["One pair", "Tc Td As 8h 3c", "Two cards of the same rank and three kickers.", "Compare the pair, then the kickers from highest to lowest."], ["High card", "As Jd 9c 6h 3s", "No pair, straight, or flush. The highest card names the hand.", "Compare cards from highest to lowest until one differs."]];
    return `${header()}<h2>Hand rankings</h2><p class="subtle">Strongest to weakest. Tap a hand to read its explanation and tie rules.</p><div class="ranking-list">${hands.map(([name,cards,description,ties],i)=>`<details class="ranking-entry"><summary><span class="ranking-number">${i+1}</span> ${name}<span class="ranking-cards" aria-label="Example hand">${cards.split(" ").map(c=>card(c)).join("")}</span></summary><div class="ranking-body"><p>${description}</p><p><strong>Same category:</strong> ${ties} If all five cards have equal ranks, the hands tie.</p></div></details>`).join("")}</div><section class="study-guide"><h3>Remember</h3><p>Use your best five cards from the seven available. You may use both, one, or neither of your hole cards.</p><p>Suits have equal strength. An ace can be high or low in a straight, but cannot wrap around: Q–K–A–2–3 is not a straight.</p><p>Equal best five-card hands split the pot. A kicker is a card outside the matching group that can break a tie.</p></section>`;
  }
  function persist(){
    if(!match)return;
    saved=Match.save(match);
    try{localStorage.setItem(storageKey,saved);saveError='';}catch(e){saveError='This game could not be saved on the device. Keep this page open to continue; closing it may lose progress.';}
  }
  function stop(){FX.unlockDealing();pumpId++;if(flight){flight.cancel();flight=null;}document.querySelectorAll('.mp-flight').forEach(el=>el.remove());}
  function conceal(){
    FX.clear();
    $('winner-popup').close();cancelRematch();cancelBet();detailsOpen=false;if(!match)return;stop();match=Match.restore(Match.save(match));persist();if(screen==='game')renderApp();
  }
  function closeSettings(focus=true){
    if(!$('settings-panel').open)return;
    $('settings-panel').close();document.documentElement.classList.remove('settings-open');
    if(focus)(screen==='simulation'?$('simulation-settings'):$('settings-open'))?.focus({preventScroll:true});
  }
  function settingsStatus(){
    $('settings-status').textContent=[Preferences.error,screen==='game'?saveError:''].filter(Boolean).join(' ');
    $('sim-preferences-status').textContent=Preferences.error;
  }
  function settingsFields(){
    const prefs=Preferences.get(),inGame=screen==='game'&&match;
    const choices=(id,label,value,options)=>`<fieldset id="${id}" class="setting-choices"><legend>${label}</legend><div class="choice-row">${options.map(([v,text])=>`<label><input type="radio" name="${id}" value="${v}" ${value===v?'checked':''}><span>${text}</span></label>`).join('')}</div></fieldset>`;
    $('settings-content').innerHTML=`<h3>On this device</h3><label class="theme-setting" for="setting-dark"><span>Dark mode</span><input id="setting-dark" type="checkbox" role="switch" ${prefs.dark?'checked':''}></label>`+choices('setting-tens','Show tens as',prefs.tens,[['10','10'],['T','T']])+`<label class="theme-setting" for="setting-positions"><span>Show seat positions</span><input id="setting-positions" type="checkbox" role="switch" ${prefs.positions?'checked':''}></label><label class="theme-setting" for="setting-motion"><span>Reduce motion</span><input id="setting-motion" type="checkbox" role="switch" ${prefs.motion==='reduced'?'checked':''}></label><p>Your device’s reduced-motion preference is always respected.</p><label for="setting-speed">Dealing speed · <output id="setting-speed-value">${prefs.speed}×</output></label><input id="setting-speed" type="range" min="0" max="3" step="1" value="${[.5,1,2,4].indexOf(prefs.speed)}" aria-valuetext="${prefs.speed}×"><div class="range-labels"><span>0.5×</span><span>1×</span><span>2×</span><span>4×</span></div>`+`<h3>${inGame?'This game':'New-game defaults'}</h3><p>${inGame?'These choices apply to everyone in this game.':'Used to prefill setup. Existing saved games stay unchanged.'}</p>`+choices('setting-reveal','View your cards',inGame?match.reveal:prefs.reveal,[['hold','Hold to peek'],['tap','Tap to reveal']])+`<label class="theme-setting" for="setting-guidance"><span>Hand guidance · everyone</span><input id="setting-guidance" type="checkbox" role="switch" ${(inGame?match.guidance:prefs.guidance)?'checked':''}></label>`;
    $('save-leave').hidden=!inGame;
    $('setting-dark').onchange=()=>Preferences.set('dark',$('setting-dark').checked);
    for(const name of ['tens','positions','motion','speed','reveal','guidance'])$('setting-'+name).onchange=event=>{
      const raw=event.target.value,value=name==='speed'?[.5,1,2,4][Number(raw)]:name==='motion'?(event.target.checked?'reduced':'device'):['guidance','positions'].includes(name)?event.target.checked:raw;
      if(name==='speed'){$('setting-speed-value').textContent=value+'×';$('setting-speed').setAttribute('aria-valuetext',value+'×');}
      if(inGame&&['reveal','guidance'].includes(name)){match[name]=value;persist();renderApp();}
      else Preferences.set(name,value);
      settingsStatus();
    };
    $('setting-speed').oninput=$('setting-speed').onchange;
    settingsStatus();
  }
  function openSettings(){
    if(document.querySelector('dialog[open]')||screen==='game'&&Match.view(match).phase==='dealing'||screen==='simulation'&&(busy||playing||guideBusy))return;
    peek(false);FX.clear();
    settingsFields();document.documentElement.classList.add('settings-open');$('settings-panel').showModal();
  }
  function syncPreferences(name){
    const prefs=Preferences.get();
    document.documentElement.dataset.reducedMotion=String(Preferences.reduced());
    $('speed').value=String(prefs.speed);$('reduce').value=prefs.motion;
    if(name==='reveal')setupReveal=prefs.reveal;
    if(name==='guidance')setupGuidance=prefs.guidance;
    if(name&&name!=='dark'){
      FX.clear();
      const openRanks=[...app.querySelectorAll('.ranking-entry')].map(el=>el.open);
      if(screen==='simulation')render();else renderApp();
      app.querySelectorAll('.ranking-entry').forEach((el,i)=>el.open=!!openRanks[i]);
    }
    settingsStatus();
  }
  function showScreen(next){
    if(screen==='equity'){stopEquity();$('equity-picker').close();$('equity-confirm').close();eqSlot=null;eqPending=null;}
    if(screen==='game'){conceal();stopPublicEquity();}
    if(screen==='simulation'){FX.clear();stopSimulationEquity();cancelSimConfirm();$('sim-winner').close();$('sim-celebration').innerHTML='';}
    playing=false;playbackId++;document.querySelectorAll('.ghost,.shuffle-ghost').forEach(el=>{el.getAnimations().forEach(a=>a.cancel());el.remove();});
    message='';
    if(next==='game'&&!match){try{if(!saved)throw Error('No saved game');match=Match.restore(saved);celebratedHand=match.phase==='result'?match.hand:0;}catch(e){next='setup';message='No valid saved game is available. Set up a new game to play.';window.history.replaceState(window.history.state,'','/new-game');}}
    screen=next;$('simulation').hidden=next!=='simulation';$('simulation-dock').hidden=next!=='simulation';app.hidden=next==='simulation';
    if(next!=='simulation')renderApp();else render();window.scrollTo(0,0);
  }
  function setupHTML(){
    return `${header()}<h2>Your table</h2><p class="subtle">20 chips each. Blinds stay at 1 / 2.</p><form id="match-setup" class="setup-form"><label for="mp-count">Players</label><select id="mp-count">${[2,3,4,5,6,7,8,9,10].map(n=>`<option ${n===setupCount?'selected':''}>${n}</option>`).join('')}</select><p class="subtle">Seat 1 is at the bottom. Enter names clockwise around the table.</p><div class="setup-names">${setupNames.slice(0,setupCount).map((n,i)=>`<label for="mp-name-${i}">Seat ${i+1}<input id="mp-name-${i}" name="player${i}" maxlength="20" required value="${safe(n)}" autocomplete="off"></label>`).join('')}</div><details class="setup-options"><summary>Card viewing &amp; hand guidance</summary><label for="mp-reveal">View your cards</label><select id="mp-reveal"><option value="hold" ${setupReveal==='hold'?'selected':''}>Hold to peek</option><option value="tap" ${setupReveal==='tap'?'selected':''}>Tap to reveal, then hide</option></select><label for="mp-guidance">Hand guidance · everyone</label><select id="mp-guidance"><option value="on" ${setupGuidance?'selected':''}>On — explain hands and draws</option><option value="off" ${setupGuidance?'':'selected'}>Off — cards only during Peek</option></select></details><p class="privacy-note">Pass the phone only when cards are hidden. The first dealer is chosen randomly. Seats stay fixed throughout the game.</p><button class="primary" type="submit">Start game</button></form>`;
  }
  function guidanceHTML(g,showDraws){
    const cardsHTML=cards=>`<div class="guide-cards">${cards.map(c=>`<div class="guide-card">${card(c.card,c.defining?'defining':'')}<small class="guide-source">${safe(c.source)}</small><small>${safe(c.role)}</small></div>`).join('')}</div>`;
    let html=`<section class="hand-guidance" aria-label="Hand guidance"><h3>You have · ${safe(g.category)}</h3><p>${safe(g.description)}</p>${g.cards.length?'<small>Best five · outlined cards make the hand</small>'+cardsHTML(g.cards):''}${g.boardOnly?'<p>Your best hand is on the board; your hole cards do not improve it.</p>':''}`;
    if(showDraws){
      html+='<h4>You could make</h4>';
      if(!g.draws.length)html+='<p>No one-card straight or flush draw.</p>';
      for(const draw of g.draws){
        const paths=draw.title==='Open-ended straight draw'?draw.patterns.slice(0,1):draw.patterns;
        html+=`<div class="draw-guide"><strong>${safe(draw.title)}</strong><p>${safe(draw.description)}</p>${paths.map(p=>cardsHTML(p.cards)+(draw.title==='Double-gutshot straight draw'?`<span class="guide-missing">This pattern needs a ${safe(rankNames[p.missing]||p.missing)}.</span>`:'')).join('')}</div>`;
      }
      if(g.draws.length)html+='<p class="subtle">These cards complete a pattern; they are not guaranteed to be available or to win.</p>';
    }
    return html+'</section>';
  }
  function resultsView(v){
    let html=`<div class="result-heading"><h2 id="hand-result-title" tabindex="-1">${v.winner===null?'Hand complete':safe(v.seats[v.winner].name)+' wins the game'}</h2>${v.winner===null?'<button class="primary" data-command="nextHand">Next hand</button>':'<button class="primary" data-rematch="true">Rematch</button>'}</div>`;
    if(!v.showdown)html+=`<p>${safe(v.seats.find(p=>!p.folded).name)} wins. Everyone else folded; hole cards stay private.</p>`;
    for(const [j,pot] of v.pots.entries())html+=`<div class="payout"><strong>${j?'Side pot '+j:'Main pot'} · ${pot.amount} chips</strong>${pot.shares.map((share,k)=>`<div>${v.boards.length>1?'Board '+('ABC'[k])+': ':''}${share.awards.map(a=>safe(v.seats[a.player].name)+' receives '+a.amount).join(' · ')}${share.winners.length>1?' (tie)':''}</div>`).join('')}</div>`;
    const returns=v.seats.flatMap(p=>p.returned?[`${safe(p.name)}: ${p.returned} unmatched chips returned`]:[]);if(returns.length)html+=`<p class="subtle">${returns.join(' · ')}</p>`;
    if(v.showdown)html+=v.seats.filter(p=>p.rankings).map(p=>`<details class="player-result" open><summary><strong>${safe(p.name)}</strong> <span class="result-outcome ${p.award?'outcome-winner':''}">${p.award?'Won '+p.award+' chips':'No pot won'}</span></summary><div class="hole-cards">${p.cards.map(c=>card(c,'small-card')).join('')}</div>${v.boards.map((_,j)=>`<div class="hand-summary"><h3>Board ${'ABC'[j]} · ${safe(p.rankings[j].category)}</h3>${v.pots.some(pot=>pot.shares[j]?.winners.includes(v.seats.indexOf(p)))?winningCards(p.cards,v.boards[j],`mp-${v.hand}-${v.seats.indexOf(p)}-${j}`):p.guidance?guidanceHTML(p.guidance[j],false):`<div><small>Best five</small><div class="best-cards">${p.rankings[j].cards.map(c=>card(c,'small-card')).join('')}</div></div>`}</div>`).join('')}</details>`).join('');
    return html+(v.winner!==null?'<button data-nav="setup">New game with different players</button>':'');
  }
  function turnHTML(v){
    if(v.phase==='handoff')return `<div class="handoff"><div class="private-symbol" aria-hidden="true"><span>♣</span><span class="red-suit">♥</span><span class="privacy-mark">◇</span><span>♠</span><span class="red-suit">♦</span></div><h2>Pass to ${safe(v.seats[v.actor].name)}</h2><p class="subtle">${v.voting?'Choose one run or two.':'Only this player should use the phone.'}<br>${v.publicCards?'Hole cards are public. Hand guidance stays private.':'All hole cards are hidden.'}</p><button class="primary" data-command="ready">I'm ready</button></div>`;
    if(v.phase==='result')return resultsView(v);
    if(v.phase==='showdown')return '<div class="handoff"><h2>Ready for showdown</h2><p class="subtle">Betting and all boards are complete. Reveal the results and award the pots when everyone is ready.</p><button class="primary" data-command="showdown">Showdown</button></div>';
    if(v.phase==='dealing')return `<div class="handoff"><h2>${v.remaining===52?(FX.enhanced&&mpPrepared?'Dealing hole cards…':'Shuffling…'):'Dealing '+(v.stage==='dealing'?'hole cards':'the board')+'…'}</h2><p class="subtle">Watch each card land. ${v.publicCards?'Hole cards stay public; burns stay face down.':'Hole cards and burns stay face down.'}</p></div>`;
    if(v.phase==='public')return `<div class="handoff"><h2>${v.nextStreet?'Ready for the '+v.nextStreet+'?':v.stage==='dealing'?'Ready to deal':v.stage==='preflop'?'Hole cards dealt':'Take a look at the board'}</h2><p class="subtle">${v.nextStreet?(v.publicCards?'Betting is complete. Hole cards are public. Wait until everyone is ready.':'Betting is complete. Keep cards hidden and wait until everyone is ready.'):v.actor!==null?'Keep hole cards private, then pass to the next player.':'Continue when everyone is ready.'}</p><button class="primary" data-command="continue">${v.nextStreet?'Deal '+v.nextStreet:v.actor!==null?'Next turn':'Continue deal'}</button></div>`;
    const p=v.seats[v.actor],l=v.legal;
    let html=`<div class="private-heading"><h2>${safe(p.name)}${v.voting?' · Runout choice':''}</h2>${v.guidance?`<button id="details-toggle" class="details-toggle" aria-expanded="${detailsOpen}" aria-controls="private-guidance">${detailsOpen?'Close details':'Hand details'}</button>`:''}</div><div class="private-strip"><div id="private-cards" class="private-cards">${p.cards.map(c=>c?card(c):back()).join('')}</div><button id="peek-button" class="peek-control" aria-pressed="false" ${v.publicCards&&!v.guidance?'disabled':''}>${v.publicCards?(v.guidance?(v.reveal==='tap'?'Show guidance':'Hold for guidance'):'Cards are public'):(v.reveal==='tap'?'Reveal cards':'Hold to peek')}</button></div>`;
    html+=`<div id="private-guidance" ${detailsOpen?'':'hidden'}></div>`;
    if(v.voting)return html+'<p class="subtle">Hole cards are public. Peek guidance is private.</p><p class="subtle">Choose 1, 2, or 3 runs. The lowest choice wins; Run once ends the vote.</p><div class="action-row"><button data-vote="1">Run once</button><button class="primary" data-vote="2">Run twice</button><button data-vote="3">Run 3 times</button></div>';
    return html+`<p class="subtle">${p.stack} chips available. ${l.owed?`${l.call} to call${l.call<p.stack?'':' · all-in'}.`:'Nothing to call.'}</p><div class="action-row betting-actions"><button data-bet="fold">Fold</button><button class="primary" data-bet="${l.owed?'call':'check'}">${l.owed?'Call '+l.call:'Check'}</button></div><div class="raise-slider"><label class="visually-hidden" for="mp-amount">Bet size</label><input id="mp-amount" aria-describedby="raise-selection" type="range" min="${l.min}" max="${l.max}" step="1" value="${l.min}" ${l.canRaise&&l.min<l.max?'':'disabled'}><div class="range-labels" aria-hidden="true"><span>Min · ${l.min}</span><span>Max · ${l.max}</span></div><button id="raise-action" data-bet="raise" ${l.canRaise?'':'disabled'}>Raise</button><p id="raise-selection" class="subtle"></p></div><div class="turn-footer"><button data-command="hide">Pause turn</button></div>`;
  }
  function boardVerdict(v,j){
    const pots=v.boardResults[j];if(!pots)return '';
    return `<div id="board-verdict-${j}" class="board-verdict" role="status">${pots.map(p=>`<div class="board-payout"><div>${pots.length>1?`<span class="payout-label">${p.pot?'Side pot '+p.pot:'Main pot'}</span>`:''}<strong>${p.winners.map(i=>safe(v.seats[i].name)).join(' &amp; ')}</strong> ${p.winners.length>1?'tie':'wins'}</div><span class="payout-amount">${p.amount} chips</span></div>`).join('')}${!v.settled?'<small>Paid after all boards finish.</small>':''}</div>`;
  }
  function gameHTML(v){
    if(v.remaining===52)collapsedBoards.clear();
    const visibleSeats=v.seats.map((p,i)=>p.seated?i:-1).filter(i=>i>=0);
    const history=`<section class="public-history" aria-label="Betting history"><h2>Betting history</h2>${v.historyRounds.map(round=>`<section class="history-round"><h3>${safe(round.label)}</h3>${round.actions.length?`<ol>${round.actions.map(e=>`<li>${safe(v.seats[e.player].name)}: ${safe(e.text)}</li>`).join('')}</ol>`:'<p>No betting</p>'}</section>`).join('')}</section>`;
    return `<div class="game-scroll" id="game-scroll" tabindex="0" aria-label="Table and betting history"><div class="game-top"><div><div id="game-home" class="brand-small brand-home">${brand()}</div></div>${gear()}</div><section id="mp-community" class="mp-board" aria-label="Community cards"><div class="pot-strip"><strong>Pot ${v.pot}</strong>${communityMeta(v.boards,v.shared,v.settled?'complete':v.stage,v.hand)}</div>${v.boards.map((board,j)=>`<div class="board-line"><button class="board-name board-toggle" data-board-toggle="${j}" aria-label="Board ${'ABC'[j]}" aria-expanded="${!collapsedBoards.has(j)}" aria-controls="mp-board-cards-${j} mp-board-result-${j}">${'ABC'[j]}<span aria-hidden="true"></span></button><div id="mp-board-cards-${j}" class="board-cards" ${collapsedBoards.has(j)?'hidden':''}>${Array.from({length:5},(_,i)=>card(board[i],i<v.shared?'shared':'',`mp-board-${j}-${i}`)).join('')}</div></div><div id="mp-board-result-${j}" ${collapsedBoards.has(j)?'hidden':''}>${boardVerdict(v,j)}</div>`).join('')}</section><section class="mp-oval seats-${visibleSeats.length} ${visibleSeats.length>6?'large-table':''}" aria-label="Clockwise seats"><div class="mp-center">${back('mp-deck')}<span id="mp-burn" class="burn-holder" aria-label="Burn pile">${v.burns}</span><p>${v.remaining} in deck</p>${!v.seats[v.button].seated?'<p>Dealer button · empty seat</p>':''}</div>${v.seats.map((p,i)=>`<div ${p.seated?'':'hidden'} data-seat-index="${i}" class="mp-seat${v.settled?(p.award>0?' seat-winner':' seat-loser'):''} action-${p.actionColor} ${i===v.actor?'acting':''} ${p.folded&&p.seated?'folded':''} ${p.seated?'':'out'}" style="${p.seated?seatStyle(visibleSeats.indexOf(i),visibleSeats.length):''}" aria-label="Seat ${i+1}: ${safe(p.name)}">${p.folded&&p.seated?`<div class="fold-marker"><strong>${safe(p.name)}</strong><span>${p.stack} chips</span><span>Folded</span></div>`:''}<span class="seat-turn">${i===v.actor&&!v.settled?'Your turn':''}</span><strong title="${safe(p.name)}">${safe(p.name)}</strong><small class="seat-position">${safe(p.position)}${!p.seated&&p.position!=='Out'?' · empty':''}</small>${i===v.button?'<span class="dealer" aria-label="Dealer button">D</span>':''}<div class="chips">${p.stack} chips</div><div class="mini-holes ${p.publicCards?'public-holes':''}">${[0,1].map(j=>p.publicCards?card(p.cards[j],'',`mp-hole-${i}-${j}`):p.cards.length>j?back(`mp-hole-${i}-${j}`):card(null,'',`mp-hole-${i}-${j}`)).join('')}</div>${p.categories.map((category,j)=>category?`<small class="seat-rank">${v.boards.length>1?('ABC'[j]+': '):''}${safe(category)}</small>`:'').join('')}<small class="seat-note">${v.settled&&p.award>0?'Won '+p.award+' chips':p.folded?'Folded':p.seated&&!v.settled?[safe(p.lastAction),p.paid?p.paid+' in':''].filter(Boolean).join(' · '):''}</small><span id="mp-equity-${i}" class="mp-equity"></span></div>`).join('')}</section><div class="game-status" role="status">${safe(message|| (v.publicCards?(v.settled?'Shared showdown results':'Hole cards are public. The hand finishes after the final river.'):v.phase==='turn'?'Your cards hide as soon as you finish your action.':v.phase==='handoff'?'Pass the phone with all cards hidden.':'Shared table view'))}</div>${v.publicCards?'<p class="subtle">Hand equity uses public cards only and compares one equal pot, not side-pot payouts. ≈ means estimated.</p>':''}${v.phase==='result'?'':history}</div><section class="turn-box" aria-label="${v.phase==='result'?'Hand result':'Turn controls'}">${turnHTML(v)}</section>${v.phase==='result'?history:''}`;
  }
  function renderApp(previous=null){
    const closedResults=[...app.querySelectorAll('.player-result')].map(el=>!el.open);
    const v=screen==='game'?Match.view(match):null;
    app.className='pocket-app'+(v?' game-screen'+(v.phase!=='result'?' game-active':'')+(v.phase==='dealing'?' game-dealing':'')+(v.phase==='turn'?' private-turn':''):'');
    if(screen==='home')app.innerHTML=`<section class="opening"><div class="opening-art"><div class="pocket-logo" aria-hidden="true"><span>♥</span><span>♠</span></div></div><h1>Pocket Poker</h1><p>One phone.<br>A seat for everyone.</p><div class="opening-actions">${saved?'<button class="primary" id="resume-game">Continue game</button><button data-nav="setup">New game</button>':'<button class="primary" data-nav="setup">Play together</button>'}<div class="home-study-actions"><button class="study-link" data-nav="modes">Study</button>${gear()}</div></div><small class="subtle">2–10 friends. Pass, peek, play.</small><small class="home-credit subtle">Made by Gene Apiladas</small></section>`;
    else if(screen==='modes')app.innerHTML=`${header()}<h2>Room to explore</h2><p class="subtle">See how a hand unfolds, or put the odds to the test.</p><div class="mode-list"><button data-nav="simulation"><strong>Simulation</strong><small>Every card on the table. Deal, bet, and replay.</small></button><button data-nav="equity"><strong>Equity calculator</strong><small>Choose the cards. Compare each hand’s chances.</small></button><button data-nav="rankings"><strong>Hand rankings</strong><small>From royal flush to high card. Learn what beats what.</small></button></div><section class="study-guide" aria-labelledby="holdem-guide"><h3 id="holdem-guide">Texas Hold’em, simply</h3><p>Each player gets two private cards. Five community cards are shared by everyone: three on the flop, one on the turn, and one on the river.</p><p>Make your best five-card hand using any combination of your two cards and the board. You can use both, one, or neither of your private cards.</p><p>Players bet before the flop and after each stage. Win by having the best hand at showdown, or by being the last player who has not folded. Equal best hands split the pot.</p></section>`;
    else if(screen==='rankings')app.innerHTML=rankingsHTML();
    else if(screen==='notfound')app.innerHTML=`${header()}<h2>Page not found</h2><p>This address does not match a Pocket Poker screen.</p><button data-nav="home">Home</button>`;
    else if(screen==='setup')app.innerHTML=setupHTML();
    else if(screen==='equity')app.innerHTML=equityHTML();
    else if(screen==='game'){
      const v=Match.view(match),celebrate=v.phase==='result'&&celebratedHand!==v.hand;
      if(v.phase==='result')celebratedHand=v.hand;
      app.innerHTML=gameHTML(v)+(celebrate?`<div class="hand-confetti" aria-hidden="true">${Array.from({length:v.winner===null?20:48},(_,i)=>`<i style="--x:${(i*37)%100}%;--drift:${(i%7-3)*30}px;--delay:${i%8*.06}s;--spin:${180+i*29}deg;--color:${['#d4a52b','#4169e1','#c42f3d','#288362'][i%4]}"></i>`).join('')}</div>`:'');
      const revealDelay=FX.reveal(previous,v);
      if(celebrate){
        const winners=v.seats.filter(p=>p.award>0);
        $('winner-popup').className='winner-dialog'+(v.winner!==null?' game-winner':'');
        $('winner-continue').textContent=v.winner===null?'Next hand':'Rematch';
        $('winner-title').textContent=v.winner!==null?v.seats[v.winner].name+' wins the game!':winners.length===1?winners[0].name+' wins!':'Pot winners';
        $('winner-summary').innerHTML=winners.map(p=>`<p><strong>${safe(p.name)}</strong> receives ${p.award} chips</p>`).join('')+(!v.showdown?'<p>Everyone else folded.</p>':'');
        FX.winner($('winner-popup'),{mode:'mp',pots:v.pots,revealDelay,showdown:v.showdown});
      }
    }
    app.querySelectorAll('.player-result').forEach((el,i)=>{if(closedResults[i])el.open=false;});
    app.querySelectorAll('[data-rematch]').forEach(el=>el.onclick=requestRematch);
    if(saveError)app.insertAdjacentHTML('afterbegin',`<div class="save-warning" role="alert">${safe(saveError)}</div>`);
    if(message&&screen!=='game')app.insertAdjacentHTML('beforeend',`<p role="alert">${safe(message)}</p>`);
    if($('settings-open'))$('settings-open').onclick=openSettings;
    app.querySelectorAll('[data-nav]').forEach(el=>el.onclick=()=>navigate(el.dataset.nav));
    if($('resume-game'))$('resume-game').onclick=()=>{try{match=Match.restore(saved);celebratedHand=match.phase==='result'?match.hand:0;navigate('game');}catch(e){message='This saved game is unreadable. You can start a new one to replace it.';renderApp();}};
    if($('match-setup')){
      const capture=()=>{setupNames.slice(0,setupCount).forEach((_,i)=>setupNames[i]=$('mp-name-'+i).value);setupReveal=$('mp-reveal').value;setupGuidance=$('mp-guidance').value==='on';};
      $('match-setup').oninput=capture;
      $('mp-reveal').onchange=$('mp-guidance').onchange=capture;
      $('mp-count').onchange=()=>{capture();setupCount=Number($('mp-count').value);renderApp();};
      $('match-setup').onsubmit=e=>{e.preventDefault();capture();let replace=!!saved;try{if(saved)replace=Match.view(Match.restore(saved)).winner===null;}catch(e){}if(replace)$('replace-game').showModal();else beginGame();};
    }
    if(screen==='equity')wireEquity();
    if(screen==='game'){
      app.querySelectorAll('[data-board-toggle]').forEach(el=>el.onclick=()=>{
        const j=Number(el.dataset.boardToggle),hide=!collapsedBoards.has(j);
        if(hide)collapsedBoards.add(j);else collapsedBoards.delete(j);
        el.setAttribute('aria-expanded',String(!hide));
        el.innerHTML='ABC'[j]+'<span aria-hidden="true"></span>';
        $('mp-board-cards-'+j).hidden=hide;$('mp-board-result-'+j).hidden=hide;
      });

      syncPublicEquity(Match.view(match));
      app.querySelectorAll('[data-command]').forEach(el=>el.onclick=()=>{if(el.disabled)return;el.disabled=true;send({type:el.dataset.command,...(el.dataset.command==='nextHand'?{deck:shuffled()}:{})});});
      app.querySelectorAll('[data-vote]').forEach(el=>el.onclick=()=>send({type:'vote',count:Number(el.dataset.vote)}));
      app.querySelectorAll('[data-bet]').forEach(el=>el.onclick=()=>{
        if(el.disabled)return;
        const v=Match.view(match),l=v.legal;let action=el.dataset.bet,amount;
        if(action==='raise')amount=Number($('mp-amount').value);
        if(action==='all'){action=l.max>v.seats[v.actor].paid+l.owed?'raise':'call';amount=l.max;}
        confirmBet({type:'bet',action,amount},el.dataset.bet);
      });
      if($('details-toggle'))$('details-toggle').onclick=()=>{detailsOpen=!detailsOpen;$('details-toggle').setAttribute('aria-expanded',String(detailsOpen));$('details-toggle').textContent=detailsOpen?'Close details':'Hand details';updateGuidance(Match.view(match));};
      wirePeek();
      if($('mp-amount')&&Match.view(match).phase==='turn'&&!Match.view(match).voting){$('mp-amount').oninput=updateRaise;updateRaise();}
    }
  }
  let publicWorker=null,publicJob=0,publicKey='',publicResults=[],publicSeats=[],publicError='';
  function stopPublicEquity(){publicJob++;publicWorker?.terminate();publicWorker=null;publicKey='';publicResults=[];publicError='';}
  function renderPublicEquity(v,error=''){
    publicSeats.forEach((seat,k)=>{
      const el=$('mp-equity-'+seat);if(!el)return;
      EquityBars.update(el,v.boards.map((_,j)=>{
        const r=publicResults[j],p=r?.players?.[k];
        return EquityBars.html(error||publicError?undefined:p?.equity,r&&!r.exact,v.boards.length>1?('ABC'[j]):'');
      }).join('')+(error||publicError?'<span>Equity unavailable</span>':''));
    });
  }
  function syncPublicEquity(v){
    if(!v.publicCards||v.phase==='dealing'||v.boards.some(b=>![0,3,4,5].includes(b.length))){stopPublicEquity();return;}
    const seats=v.seats.flatMap((p,i)=>p.publicCards&&!p.folded&&p.cards.length===2?[i]:[]);
    if(seats.length<2){stopPublicEquity();return;}
    // Hidden folded cards and burns are not public information in multiplayer.
    const visible={hands:seats.map(i=>v.seats[i].cards),boards:v.boards,folded:seats.map(()=>false),burns:[]};
    const key=JSON.stringify([seats,visible]);
    if(key===publicKey){renderPublicEquity(v);return;}
    stopPublicEquity();publicKey=key;publicSeats=seats;renderPublicEquity(v);
    const id=publicJob;
    const fail=()=>{if(id!==publicJob)return;publicWorker?.terminate();publicWorker=null;publicError='Equity unavailable';renderPublicEquity(v);};
    try{
    publicWorker=new Worker("/scripts/equity-worker.js");
      publicWorker.onmessage=({data})=>{
        if(id!==publicJob||data.id!==id||screen!=='game')return;
        if(data.error){fail();return;}
        publicResults[data.result.board]=data.result;renderPublicEquity(v);
        if(publicResults.filter(r=>r?.done).length===v.boards.length){publicWorker?.terminate();publicWorker=null;}
      };
      publicWorker.onerror=fail;publicWorker.postMessage({id,visible});
    }catch(e){fail();}
  }
  let leaveAction=null;
  function guardNavigation(commit){
    if($('settings-panel').open){closeSettings();return;}
    if(screen==='game'&&match){conceal();leaveAction=commit;$('home-confirm').showModal();}
    else commit();
  }
  function confirmHome(){navigate('home');}
  function cancelLeave(){leaveAction=null;$('home-confirm').close();}
  $('simulation-home').innerHTML=brand();
  $('home-cancel').onclick=cancelLeave;
  $('home-confirm').oncancel=cancelLeave;
  $('home-save').onclick=()=>{
    if(match){conceal();if(saveError){cancelLeave();return;}}
    const commit=leaveAction;cancelLeave();if(commit)commit();
  };
  const eq={hands:[[null,null],[null,null]],names:['Player 1','Player 2'],board:[],stage:0,status:'incomplete',result:null,progress:null,error:''};
  let eqWorker=null,eqJob=0,eqSlot=null,eqPending=null;
  const eqInput=()=>({hands:eq.hands.map(h=>[...h]),board:[...eq.board]});
  const eqValid=()=>{try{Equity.validate(eqInput());return true;}catch(e){return false;}};
  function stopEquity(){eqJob++;if(eqWorker){eqWorker.terminate();eqWorker=null;}if(eq.status==='running'){eq.status='cancelled';eq.result=null;eq.progress=null;}}
  function equityChanged(){stopEquity();eq.result=null;eq.progress=null;eq.error='';eq.status=eqValid()?'ready':'incomplete';renderApp();if(eq.status==='ready')calculateEquity();}
  function calculateEquity(){
    stopEquity();if(!eqValid())return;eq.status='running';eq.result=null;eq.progress=null;eq.error='';const id=eqJob;
      try{
    eqWorker=new Worker("/scripts/equity-worker.js");
      eqWorker.onmessage=({data})=>{
        if(id!==eqJob||data.id!==id||screen!=='equity'||eq.status!=='running')return;
        if(data.error){stopEquity();eq.status='error';eq.error=data.error;}
        else {eq.progress=data.result;eq.result=data.result.players?data.result:null;if(data.result.done){eq.status='complete';eqWorker.terminate();eqWorker=null;}}
        renderEquityResults();
      };
      eqWorker.onerror=()=>{if(id!==eqJob)return;stopEquity();eq.status='error';eq.error='Calculation could not finish. Please retry.';renderEquityResults();};
      eqWorker.postMessage({id,input:eqInput()});
    }catch(e){stopEquity();eq.status='error';eq.error='This browser could not start the calculator. Please retry or use a current browser.';}
    renderEquityResults();
  }
  function equityHTML(){
    const slot=(c,key)=>`<button class="eq-slot" data-eq-slot="${key}" aria-label="${key[0]==='b'?'Board card '+(Number(key.split(':')[1])+1):safe(eq.names[Number(key.split(':')[1])])+' card '+(Number(key.split(':')[2])+1)}: ${c?cardName(c):'Choose card'}">${card(c)}</button>`;
    return `${header()}<h2>Equity calculator</h2><p class="subtle">Enter known hands and compare their share of one pot. Your multiplayer game stays separate.</p><div class="eq-controls"><label>Players <select id="eq-count">${[2,3,4,5,6,7,8,9,10].map(n=>`<option value="${n}" ${eq.hands.length===n?'selected':''}>${n}</option>`).join('')}</select></label><button id="eq-reset">Reset cards</button></div><section class="eq-board" aria-label="Equity community cards"><div class="eq-stages">${[[0,'Preflop'],[3,'Flop'],[4,'Turn'],[5,'River']].map(([n,t])=>`<button data-eq-stage="${n}" aria-pressed="${eq.stage===n}">${t}</button>`).join('')}</div><div class="eq-board-cards">${eq.board.map((c,i)=>slot(c,'b:'+i)).join('')||'<span>No community cards · preflop</span>'}</div></section><div id="eq-status" class="eq-status"></div><div class="eq-players">${eq.hands.map((h,i)=>`<section class="eq-player"><label for="eq-name-${i}">Player ${i+1} name</label><input id="eq-name-${i}" data-eq-name="${i}" maxlength="20" autocomplete="off" value="${safe(eq.names[i])}"><div class="eq-player-main"><div class="eq-hole-cards">${h.map((c,j)=>slot(c,'p:'+i+':'+j)).join('')}</div><div id="eq-result-${i}" class="eq-percentages"></div></div><p class="eq-category">${h.every(Boolean)&&eq.stage>=3&&eq.board.every(Boolean)?safe(Poker.rank([...h,...eq.board]).category):''}</p></section>`).join('')}</div><p class="subtle">Equity includes your share of ties. Win means winning alone; Tie means sharing a win. Rounded equity totals may differ from 100%. Estimates may vary.</p>`;
  }
  function renderEquityResults(){
    if(screen!=='equity')return;
    const r=eq.progress;
    if(eq.status==='running'&&$('eq-status').querySelector('#eq-cancel')){
      $('eq-progress-label').textContent=(eq.stage===0?'Estimated · sampling':'Exact · calculating')+' '+(r?r.completed:0)+' / '+(r?r.total:eq.stage===0?20000:'…')+' boards';
      if(r){$('eq-progress-track').max=r.total;$('eq-progress-track').value=r.completed;}
    }else $('eq-status').innerHTML=eq.status==='incomplete'?'<p>Choose two cards for every player and fill the selected board stage.</p>':eq.status==='running'?`<p id="eq-progress-label">${eq.stage===0?'Estimated · sampling':'Exact · calculating'} ${r?r.completed:0} / ${r?r.total:eq.stage===0?20000:'…'} boards</p><progress id="eq-progress-track" aria-label="Calculation progress" ${r?`value="${r.completed}" max="${r.total}"`:''}></progress><button id="eq-cancel">Cancel</button>`:eq.status==='complete'?`<p role="status">${eq.result.exact?'Exact':'Estimated'} · ${eq.result.completed.toLocaleString()} boards${eq.result.exact?'':' · estimates may vary'}</p>`:`<p role="status">${eq.status==='error'?safe(eq.error):'Calculation cancelled. Cards are kept.'}</p><button id="eq-retry">Calculate again</button>`;
    eq.hands.forEach((_,i)=>{
      const r=eq.result,p=r?.players[i],pct=n=>EquityBars.percent(n,r&&!r.exact);
      EquityBars.update($('eq-result-'+i),EquityBars.html(p?.equity,r&&!r.exact)+(p?`<span>Win ${pct(p.win)}</span><span>Tie ${pct(p.tie)}</span>${eq.stage===5&&p.equity>0?`<b class="eq-winner">${p.tie?'Tied winner':'Winner'}</b>`:''}`:'<span>Win —</span><span>Tie —</span>'));

    });
    if($('eq-cancel'))$('eq-cancel').onclick=()=>{stopEquity();renderEquityResults();};
    if($('eq-retry'))$('eq-retry').onclick=calculateEquity;
  }
  function openEquityPicker(key){eqSlot=key;drawEquityPicker();if(!$('equity-picker').open)$('equity-picker').showModal();$('equity-picker').querySelector('[data-eq-card]:not([disabled])')?.focus();}
  function closeEquityPicker(){const key=eqSlot;$('equity-picker').close();eqSlot=null;app.querySelector(`[data-eq-slot="${key}"]`)?.focus();}
  $('equity-picker').oncancel=e=>{e.preventDefault();closeEquityPicker();};
  function equityGroup(){const bits=eqSlot.split(':');return {cards:bits[0]==='b'?eq.board:eq.hands[Number(bits[1])],index:Number(bits.at(-1)),prefix:bits.slice(0,-1).join(':')};}
  function drawEquityPicker(){
    const g=equityGroup(),used=[...eq.hands.flat(),...eq.board].filter(Boolean),title=eqSlot[0]==='b'?'Community board':eq.names[Number(eqSlot.split(':')[1])];
    $('equity-picker').innerHTML=`<div class="picker-heading"><h2 id="eq-picker-title">${safe(title)} · card ${g.index+1}</h2><button id="eq-picker-close">Close</button></div><div class="picker-cards"><p>Choose a card. Cards already in use are unavailable.</p>${[... 'chsd'].map(s=>`<section><h3>${suitSymbols[s]} ${suitNames[s]}</h3><div class="eq-picker-suit">${[...'23456789TJQKA'].map(r=>`<button data-eq-card="${r+s}" ${used.includes(r+s)&&g.cards[g.index]!==r+s?'disabled':''} aria-label="${cardName(r+s)}" aria-pressed="${g.cards[g.index]===r+s}" class="${'hd'.includes(s)?'red-suit':''}">${rankNames[r]||r}${suitSymbols[s]}</button>`).join('')}</div></section>`).join('')}<div class="action-row"><button id="eq-picker-clear">Clear card</button></div></div>`;
    $('equity-picker').querySelectorAll('[data-eq-card]').forEach(el=>el.onclick=()=>{
      const c=el.dataset.eqCard;if(used.includes(c)&&g.cards[g.index]!==c)return;
      g.cards[g.index]=c;equityChanged();const next=g.cards.indexOf(null);
      if(next<0){closeEquityPicker();}else openEquityPicker(g.prefix+':'+next);
    });
    $('eq-picker-clear').onclick=()=>{g.cards[g.index]=null;equityChanged();closeEquityPicker();};
    $('eq-picker-close').onclick=closeEquityPicker;
  }
  function requestEquityChange(change,hasCards,text){
    if(!hasCards){change();equityChanged();return;}
    eqPending=change;$('eq-remove-text').textContent=text;$('equity-confirm').showModal();
  }
  function wireEquity(){
    app.querySelectorAll('[data-eq-slot]').forEach(el=>el.onclick=()=>openEquityPicker(el.dataset.eqSlot));
    app.querySelectorAll('[data-eq-name]').forEach(el=>el.onchange=()=>{const i=Number(el.dataset.eqName);eq.names[i]=el.value.trim().slice(0,20)||'Player '+(i+1);el.value=eq.names[i];});
    app.querySelectorAll('[data-eq-stage]').forEach(el=>el.onclick=()=>{
      const stage=Number(el.dataset.eqStage);if(stage===eq.stage)return;
      requestEquityChange(()=>{eq.board=Array.from({length:stage},(_,i)=>eq.board[i]||null);eq.stage=stage;},eq.board.slice(stage).some(Boolean),'Cards after this stage will be cleared. Earlier board cards and player hands stay.');
    });
    $('eq-count').onchange=()=>{const n=Number($('eq-count').value);$('eq-count').value=String(eq.hands.length);
      requestEquityChange(()=>{eq.hands=Array.from({length:n},(_,i)=>eq.hands[i]||[null,null]);eq.names=Array.from({length:n},(_,i)=>eq.names[i]||'Player '+(i+1));},eq.hands.slice(n).flat().some(Boolean),'The last seats and their cards will be removed. The remaining hands and board stay.');
    };
    $('eq-reset').onclick=()=>requestEquityChange(()=>{eq.hands=eq.hands.map(()=>[null,null]);eq.board=eq.board.map(()=>null);},[...eq.hands.flat(),...eq.board].some(Boolean),'All hole and board cards will be cleared. Names, player count, and stage stay.');
    renderEquityResults();
  }
  $('eq-remove-confirm').onclick=()=>{const change=eqPending;eqPending=null;$('equity-confirm').close();if(change){change();equityChanged();}};
  $('eq-remove-cancel').onclick=()=>{eqPending=null;$('equity-confirm').close();};
  $('equity-confirm').oncancel=()=>{eqPending=null;};
  function updateRaise(){
    const v=Match.view(match),l=v.legal,p=v.seats[v.actor],slider=$('mp-amount'),button=$('raise-action');
    if(!l.canRaise){$('raise-selection').textContent='Raising is unavailable. Use Call or Check above.';button.textContent='Raise unavailable';return;}
    const amount=Number(slider.value),all=amount===l.max;
    const text=all?`All-in ${p.stack}`:`${p.paid+l.owed>0?'Raise to':'Bet'} ${amount}`;
    button.dataset.bet=all?'all':'raise';button.textContent=text;
    const detail=`Pay ${amount-p.paid} chips now · ${amount} total this round${l.min===l.max?' · Only legal raise: All-in':''}`;
    $('raise-selection').innerHTML=`<strong>Pay ${amount-p.paid} chips now</strong><span>${amount} total this round${l.min===l.max?' · Only legal raise: All-in':''}</span>`;slider.setAttribute('aria-valuetext',detail);
  }
  function beginGame(){
    mpPrepared=false;FX.clear();
    try{match=Match.start(setupNames.slice(0,setupCount),shuffled(),randomBelow(setupCount),setupReveal,setupGuidance);celebratedHand=0;persist();navigate('game');pump();}
    catch(err){message=err.message;renderApp();}
  }
  $('winner-review').onclick=()=>{$('winner-popup').close();$('hand-result-title')?.focus();};
  $('winner-continue').onclick=()=>{
    if(!match||!$('winner-popup').open||Match.view(match).phase!=='result')return;
    if(Match.view(match).winner!==null){requestRematch();return;}
    $('winner-popup').close();send({type:'nextHand',deck:shuffled()});
  };
  function requestRematch(){
    if(!match||Match.view(match).winner===null)return;
    $('winner-popup').close();rematchPending=true;
    $('rematch-summary').textContent=`All ${match.names.length} players return with 20 chips each, including anyone who was out.`;
    $('rematch-dialog').showModal();
  }
  function cancelRematch(){rematchPending=false;$('rematch-dialog').close();}
  $('rematch-cancel').onclick=cancelRematch;
  $('rematch-dialog').oncancel=()=>{rematchPending=false;};
  $('rematch-confirm').onclick=()=>{
    if(!rematchPending||!match||Match.view(match).winner===null)return;
    const fresh=Match.start(match.names,shuffled(),randomBelow(match.names.length),match.reveal,match.guidance);
    cancelRematch();stop();stopPublicEquity();match=fresh;mpPrepared=false;celebratedHand=0;detailsOpen=false;message='';persist();renderApp();pump();
  };
  $('replace-confirm').onclick=()=>{if(!$('replace-game').open)return;$('replace-game').close();beginGame();};
  $('replace-cancel').onclick=()=>$('replace-game').close();
  function cancelBet(){pendingBet=null;$('confirm-action').close();}
  function confirmBet(command,choice){
    peek(false);
    try{
      Match.command(match,command); // Validate without committing; confirmation applies the action once.
      const v=Match.view(match),p=v.seats[v.actor],l=v.legal;
      const action=choice==='check'?'check without adding chips':choice==='all'?`go all-in with your remaining ${p.stack} ${p.stack===1?'chip':'chips'}`:choice==='fold'?'fold this hand':choice==='call'?`call ${l.call} ${l.call===1?'chip':'chips'}`:`${l.owed||l.min>2?'raise':'bet'} to ${command.amount} chips (add ${command.amount-p.paid})`;
      $('action-confirm').textContent=choice==='check'?'Check':choice==='fold'?'Fold hand':choice==='all'||choice==='call'&&l.call===p.stack?'Go all-in · '+p.stack+' chips':choice==='call'?'Call '+l.call+' chips':(l.owed||l.min>2?'Raise to ':'Bet ')+command.amount+' chips';
      $('action-title').textContent=choice==='check'?'Check turn?':choice==='fold'?'Fold hand?':choice==='all'||choice==='call'&&l.call===p.stack?'Commit all chips?':choice==='call'?'Call bet?':l.owed||l.min>2?'Raise bet?':'Place bet?';
      $('action-description').textContent=`${p.name} will ${action}. ${choice==='fold'?'Committed chips stay in the pot.':'This ends your turn. Your cards stay hidden.'}`;
      $('action-confirm').className=choice==='fold'?'danger':choice==='all'||choice==='call'&&l.call===p.stack?'confirm-all':choice==='call'||choice==='check'?'primary':'confirm-raise';
      pendingBet=command;$('confirm-action').showModal();
    }catch(e){message=e.message;renderApp();}
  }
  $('action-cancel').onclick=cancelBet;
  $('confirm-action').oncancel=()=>{pendingBet=null;};
  $('action-confirm').onclick=()=>{const command=pendingBet;cancelBet();if(command)send(command);};
  function peek(show){
    if(screen!=='game'||Match.view(match).phase!=='turn')return;
    match=Match.command(match,{type:'peek',show});const v=Match.view(match);
    $('private-cards').innerHTML=v.seats[v.actor].cards.map(c=>c?card(c):back()).join('');
    updateGuidance(v);
    $('peek-button').setAttribute('aria-pressed',String(show));
    if(v.reveal==='tap')$('peek-button').textContent=v.publicCards?(show?'Hide guidance':'Show guidance'):(show?'Hide cards':'Reveal cards');
  }
  function updateGuidance(v){
    const el=$('private-guidance');if(!el)return;
    el.hidden=!detailsOpen;
    const g=v.seats[v.actor]?.guidance;
    el.innerHTML=detailsOpen?(g?guidanceHTML(g[0],v.boards[0].length>0&&v.boards[0].length<5):''):'';
  }
  function wirePeek(){
    const el=$('peek-button');if(!el)return;
    if(Match.view(match).reveal==='tap'){el.onclick=()=>peek(!Match.view(match).peeking);return;}
    el.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();el.setPointerCapture(e.pointerId);peek(true);};
    el.onpointerup=el.onpointercancel=el.onlostpointercapture=()=>peek(false);
    el.onkeydown=e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();peek(true);}};
    el.onkeyup=e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();peek(false);}};
    el.onblur=()=>peek(false);el.oncontextmenu=e=>e.preventDefault();
  }
  async function send(c){
    const before=Match.view(match),from=FX.snapshot('mp',before.actor),total=before.actor===null?0:match.game.betting.total[before.actor];
    if(c.type==='nextHand'){mpPrepared=false;FX.clear();}
    try{match=Match.command(match,c);detailsOpen=false;message='';persist();renderApp(before);if(c.type==='bet'&&c.action==='fold')FX.fold('mp',before.actor);if(c.type==='bet'&&!Match.view(match).settled)FX.contribution('mp',from,match.game.betting.total[before.actor]-total);if(c.type==='ready')$('peek-button')?.focus({preventScroll:true});if(c.type==='nextHand'){const current=match;const moved=await FX.moveDealer(before.button,Match.view(match).button);if(match!==current||document.hidden)return;if(!moved){conceal();return;}}pump();}
    catch(e){peek(false);message=e.message;const status=app.querySelector('.game-status');if(status)status.textContent=message;}
  }
  let mpPrepared=false;
  const DEAL_TIMING={card:850,shuffle:600,shuffleCycles:2};
  // Storyboard: bring table into view, shuffle a new deck, then land one card before the next starts.
  async function animateMove(v){
    if(Preferences.reduced())return;
    const e=v.event,target=e.kind==='hole'?$(`mp-hole-${e.player}-${e.index}`):e.kind==='burn'?$('mp-burn'):$(`mp-board-${e.board}-${e.index}`),source=$('mp-deck');
    if(!target||!source)return;
    const a=source.getBoundingClientRect(),b=target.getBoundingClientRect(),box=document.createElement('div');box.innerHTML=e.card?card(e.card):back();
    const el=box.firstElementChild;el.classList.add('ghost','mp-flight');el.setAttribute('aria-hidden','true');
    Object.assign(el.style,{left:a.left+'px',top:a.top+'px',width:b.width+'px',height:b.height+'px'});document.body.append(el);
    flight=el.animate([{transform:'translate(0,0) rotate(-12deg)'},{transform:`translate(${b.left-a.left}px,${b.top-a.top}px) rotate(0deg)`}],{duration:DEAL_TIMING.card/Preferences.get().speed,easing:FX.dealEase,fill:'forwards'});
    try{await flight.finished;}catch(e){}finally{el.remove();flight=null;}
  }
  async function pump(){
    if(screen!=='game'||!match||Match.view(match).phase!=='dealing')return;
    collapsedBoards.delete(match.game.board);renderApp();
    const id=++pumpId;
    window.scrollTo({top:0,left:0,behavior:'instant'});
    if($('game-scroll'))$('game-scroll').scrollTop=0;
    if(Match.view(match).remaining===52&&FX.enhanced&&!mpPrepared){mpPrepared=true;const ok=await FX.shuffle();if(!ok){conceal();return;}if(id!==pumpId||screen!=='game'||document.hidden)return;}
    if(Match.view(match).remaining===52&&!FX.enhanced&&!Preferences.reduced()){
      flight=$('mp-deck').animate([{transform:'rotate(-12deg) translateX(-12px)'},{transform:'rotate(12deg) translateX(12px)'},{transform:'none'}],{duration:DEAL_TIMING.shuffle,iterations:DEAL_TIMING.shuffleCycles});
      try{await flight.finished;}catch(e){}finally{flight=null;}
    }
    const unlock=FX.lockDealing();try{while(id===pumpId&&screen==='game'&&!document.hidden&&Match.view(match).phase==='dealing'){
      match=Match.command(match,{type:'deal'});persist();await animateMove(Match.view(match));
      if(id!==pumpId)return;renderApp();
    }}catch(e){message='Dealing paused: '+e.message;conceal();}finally{unlock();}
  }
  $('simulation-menu').onclick=()=>navigate('modes');
  window.addEventListener('blur',()=>{closeSettings(false);if(screen==='game')conceal();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){closeSettings(false);if(screen==='game')conceal();}});
  window.addEventListener('pagehide',()=>{closeSettings(false);if(screen==='game')conceal();});
  $('settings-close').onclick=()=>closeSettings();
  $('settings-panel').oncancel=e=>{e.preventDefault();closeSettings();};
  $('save-leave').onclick=()=>{closeSettings();confirmHome();};
  $('simulation-settings').onclick=openSettings;
  $('speed').onchange=()=>Preferences.set('speed',Number($('speed').value));
  $('reduce').onchange=()=>Preferences.set('motion',$('reduce').value);
  Preferences.subscribe(syncPreferences);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{syncPreferences();FX.clear();});
  syncPreferences();
  let router;
  function navigate(next){router.go(next);}
  router=Routes.start({enter:showScreen,guard:guardNavigation});
})();
