const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');

// A DOM/animation boundary double: checks event wiring, not browser layout or touch input.
function page(saved=null,workerAvailable=true,saveFails=false){
  const html=fs.readFileSync(__dirname+'/dealing-prototype.html','utf8');
  let reloads=0;
  const ids=new Map(),workers=[],flights=[],scrolls=[],windowEvents={},documentEvents={};
  class Element {
    constructor(){this.style={};this.dataset={};this.value='';this.checked=false;this.disabled=false;this.hidden=false;this.classList={add(){}};this.textContent='';}
    set innerHTML(value){
      this.markup=value;
      this.children=[];
      for(const tag of value.matchAll(/<[^>]+(?:\bid="[^"]+"|\bdata-[\w-]+="[^"]*")[^>]*>/g)){
        const el=new Element();el.disabled=/\sdisabled(?:\s|>)/.test(tag[0]);el.value=tag[0].match(/\bvalue="([^"]*)"/)?.[1]||'';
        for(const [,key,val] of tag[0].matchAll(/\bdata-([\w-]+)="([^"]*)"/g)){el.dataset[key]=val;el.dataset[key.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=val;}
        const id=tag[0].match(/\bid="([^"]+)"/)?.[1];if(id)ids.set(id,el);
        this.children.push(el);
      }
    }
    get innerHTML(){return this.markup||'';}
    get firstElementChild(){const el=new Element();el.markup=this.markup;return el;}
    setAttribute(){}
    querySelectorAll(selector){const key=selector.match(/^\[data-([\w-]+)\]$/)?.[1];return key?(this.children||[]).filter(el=>key in el.dataset):[];}
    querySelector(){return null;}
    insertAdjacentHTML(){}
    append(){}
    remove(){this.removed=true;}
    focus(){}
    scrollIntoView(options){scrolls.push({element:this,options,saved});}
    setPointerCapture(){}
    showModal(){this.open=true;}
    close(){this.open=false;}
    getBoundingClientRect(){return {left:10,top:10,width:40,height:56};}
    getAnimations(){return this.animations||[];}
    animate(){
      let resolve,reject;
      const finished=new Promise((yes,no)=>{resolve=yes;reject=no;});
      const animation={finished,finish:resolve,cancel:()=>reject(Object.assign(new Error('Cancelled'),{name:'AbortError'}))};
      this.animations=[animation];flights.push(this);return animation;
    }
  }
  const document={body:new Element(),hidden:false,createElement:()=>new Element(),getElementById:id=>ids.get(id),
    querySelectorAll:selector=>selector.includes('.ghost')?flights.filter(el=>!el.removed):[],addEventListener:(type,fn)=>{(documentEvents[type]??=[]).push(fn);}};
  document.body.innerHTML=html;
  for(const [,id,body] of html.matchAll(/<script id="([^"]+)">([\s\S]*?)<\/script>/g))ids.get(id).textContent=body;
  ids.get('speed').value='1';ids.get('player-count').value='4';ids.get('betting-mode').checked=true;
  const blobs=new Map();
  const workerURL={createObjectURL(blob){const key='blob:'+blobs.size;blobs.set(key,blob);return key;},revokeObjectURL(key){blobs.delete(key);}};
  class TestWorker{constructor(url){this.source=blobs.get(url);if(!workerAvailable)throw Error('Worker unavailable');workers.push(this);}postMessage(data){this.request=data;}terminate(){this.terminated=true;}}
  const ctx=vm.createContext({Worker:TestWorker,Blob,URL:workerURL,document,crypto:webcrypto,matchMedia:()=>({matches:true}),localStorage:{getItem:()=>saved,setItem:(key,value)=>{if(saveFails)throw Error("Storage full");saved=value;}},window:{location:{reload(){reloads++;}},addEventListener:(type,fn)=>{(windowEvents[type]??=[]).push(fn);},scrollTo(options){scrolls.push({options,saved});}},setTimeout});
  for(const [,script] of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(script,ctx);
  return {get reloads(){return reloads;},ids,workers,flights,scrolls,windowEvents,documentEvents,document,get saved(){return saved;}};
}

function savedFlop(reveal='hold',guidance=true,situation='flop',cards='6h 2c 7h 3d 4s 8h 9c Kh'){
  const html=fs.readFileSync(__dirname+'/dealing-prototype.html','utf8'),ctx=vm.createContext({});
  for(const id of ['poker-engine','poker-session'])vm.runInContext(html.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)</script>'))[1],ctx);
  const prefix=cards.split(' '),deck=[...prefix,...ctx.Poker.fullDeck().filter(c=>!prefix.includes(c))],M=ctx.Match;
  let s=M.start(['Alex','Blair'],deck,0,reveal,guidance);
  for(let i=0;i<4;i++)s=M.command(s,{type:'deal'});
  s=M.command(M.command(s,{type:'continue'}),{type:'ready'});s=M.command(s,{type:'bet',action:'call'});
  s=M.command(s,{type:'ready'});s=M.command(s,{type:'bet',action:'check'});s=M.command(s,{type:'continue'});
  for(let i=0;i<4;i++)s=M.command(s,{type:'deal'});
  s=M.command(M.command(s,{type:'continue'}),{type:'ready'});
  if(situation==='allin'){s=M.command(s,{type:'bet',action:'raise',amount:18});s=M.command(s,{type:'ready'});s=M.command(s,{type:'bet',action:'call'});}
  if(situation==='call')s=M.command(s,{type:'bet',action:'raise',amount:6});
  if(situation==='river'){
    while(M.view(s).boards[0].length<5){
      const phase=M.view(s).phase;
      s=M.command(s,phase==='turn'?{type:'bet',action:'check'}:{type:phase==='handoff'?'ready':phase==='public'?'continue':'deal'});
    }
    s=M.command(M.command(s,{type:'continue'}),{type:'ready'});
    s=M.command(s,{type:'bet',action:'check'});
  }
  return M.save(s);
}

test('whole-chip slider updates one combined action without committing chips and resets on handoff',()=>{
 const p=page(savedFlop('tap')),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
 app.querySelectorAll('[data-command]').find(e=>e.dataset.command==='ready').onclick();
 const before=p.saved,slider=ids.get('mp-amount'),button=ids.get('raise-action');
 assert.match(app.innerHTML,/type="range" min="2" max="18" step="1"/);
 assert.equal(app.querySelectorAll('[data-bet]').filter(e=>['raise','all'].includes(e.dataset.bet)).length,1);
 for(const [index,label] of [[2,'Bet 2'],[3,'Bet 3'],[9,'Bet 9'],[17,'Bet 17'],[18,'All-in 18']]){
  slider.value=String(index);slider.oninput();assert.equal(button.textContent,label);assert.equal(p.saved,before);
  assert.equal(button.dataset.bet,index===18?'all':'raise');
 }
 slider.value='2';slider.oninput();button.onclick();
 assert.match(ids.get('action-description').textContent,/bet to 2 chips/);
 ids.get('action-cancel').onclick();assert.equal(slider.value,'2');
 button.onclick();ids.get('action-confirm').onclick();
 app.querySelectorAll('[data-command]').find(e=>e.dataset.command==='ready').onclick();
 assert.equal(ids.get('mp-amount').value,'4');assert.equal(ids.get('raise-action').textContent,'Raise to 4');
});

test('every betting action requires confirmation, conceals guidance, and commits only once',()=>{
 for(const action of ['fold','call','raise','all','check']){
  const p=page(savedFlop('tap',true,action==='call'?'call':'flop')),{ids}=p,app=ids.get('pocket-app');
  app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
  app.querySelectorAll('[data-command]').find(e=>e.dataset.command==='ready').onclick();
  ids.get('peek-button').onclick();ids.get('mp-amount').value=action==='all'?'18':'3';ids.get('mp-amount').oninput();
  const before=JSON.parse(p.saved).moves.length;
  app.querySelectorAll('[data-bet]').find(e=>e.dataset.bet===action).onclick();
  assert.equal(ids.get('confirm-action').open,true);
  assert.equal(ids.get('private-guidance').innerHTML,'');
  assert.equal(JSON.parse(p.saved).moves.length,before);
  assert.match(ids.get('action-description').textContent,action==='all'?/18 chips/:action==='fold'?/fold/i:action==='check'?/without adding chips/:action==='raise'?/3 chips/:/6 chips/);
  ids.get('action-cancel').onclick();assert.equal(ids.get('confirm-action').open,false);
  assert.equal(JSON.parse(p.saved).moves.length,before);
  app.querySelectorAll('[data-bet]').find(e=>e.dataset.bet===action).onclick();
  ids.get('action-confirm').onclick();ids.get('action-confirm').onclick();
  assert.equal(JSON.parse(p.saved).moves.length,before+1);
  assert.doesNotMatch(app.innerHTML,/You have/);
 }
 const p=page(savedFlop('tap')),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
 app.querySelectorAll('[data-command]').find(e=>e.dataset.command==='ready').onclick();
 app.querySelectorAll('[data-bet]').find(e=>e.dataset.bet==='fold').onclick();
 const before=JSON.parse(p.saved).moves.length;
 p.windowEvents.blur.forEach(fn=>fn());ids.get('action-confirm').onclick();
 assert.equal(ids.get('confirm-action').open,false);assert.equal(JSON.parse(p.saved).moves.length,before);
 assert.match(app.innerHTML,/Pass to/);
});

test('showdown groups each player in a collapsible section and celebrates a hand once',()=>{
 const p=page(savedFlop('hold',true,'river')),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
 app.querySelectorAll('[data-command]').find(e=>e.dataset.command==='ready').onclick();
 app.querySelectorAll('[data-bet]').find(e=>e.dataset.bet==='check').onclick();
 ids.get('action-confirm').onclick();
 assert.doesNotMatch(app.innerHTML,/class="hand-confetti"|player-result|receives/);
 assert.match(app.innerHTML,/Pot 4/);
 p.windowEvents.blur.forEach(fn=>fn());
 app.querySelectorAll('[data-command]').find(e=>e.dataset.command==='showdown').onclick();
 assert.equal((app.innerHTML.match(/<details class="player-result"/g)||[]).length,2);
 assert.match(app.innerHTML,/<summary><strong>Alex/);assert.match(app.innerHTML,/<summary><strong>Blair/);
 assert.match(app.innerHTML,/class="hand-confetti" aria-hidden="true"/);
 p.windowEvents.blur.forEach(fn=>fn());assert.doesNotMatch(app.innerHTML,/class="hand-confetti"/);
});

test('Peek events show and remove all private guidance without replacing the held control',()=>{
 for(const hide of ['onpointerup','onpointercancel','onlostpointercapture','onblur','onkeyup','action','blur','visibilitychange','pagehide','navigation']){
  const p=page(savedFlop()),{ids}=p,app=ids.get('pocket-app');
  const nav=()=>app.querySelectorAll('[data-nav]').find(el=>el.dataset.nav==='modes').onclick();
  const command=type=>app.querySelectorAll('[data-command]').find(el=>el.dataset.command===type).onclick();
  nav();ids.get('resume-game').onclick();command('ready');
  const button=ids.get('peek-button');
  if(hide==='onkeyup')button.onkeydown({key:' ',preventDefault(){}});
  else button.onpointerdown({button:0,pointerId:1,preventDefault(){}});
  assert.equal(ids.get('peek-button'),button);
  assert.match(ids.get('private-guidance').innerHTML,/Open-ended straight draw/);
  assert.match(ids.get('private-guidance').innerHTML,/One more heart completes a flush/);
  assert.match(ids.get('private-guidance').innerHTML,/defining/);
  if(hide==='action')command('hide');
  else if(hide==='navigation')ids.get('save-leave').onclick();
  else if(hide==='visibilitychange'){p.document.hidden=true;p.documentEvents.visibilitychange.forEach(fn=>fn());}
  else if(['blur','pagehide'].includes(hide))p.windowEvents[hide].forEach(fn=>fn());
  else button[hide]({key:' ',preventDefault(){}});
  if(hide.startsWith('on'))assert.equal(ids.get('private-guidance').innerHTML,'');
  else assert.doesNotMatch(app.innerHTML,/You have|One more heart|Draw card/);
 }
 for(const enabled of [true,false]){
  const {ids}=page(savedFlop('tap',enabled)),app=ids.get('pocket-app');
  app.querySelectorAll('[data-nav]').find(el=>el.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
  app.querySelectorAll('[data-command]').find(el=>el.dataset.command==='ready').onclick();
  ids.get('peek-button').onclick();
  assert.equal(ids.get('private-guidance').innerHTML.includes('Flush draw'),enabled);
  ids.get('peek-button').onclick();assert.equal(ids.get('private-guidance').innerHTML,'');
 }
});

test('Simulation walkthroughs remain wired and leaving during card flight completes without a stuck control',async()=>{
  const {ids,flights}=page();
  const app=ids.get('pocket-app');
  app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();
  app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='simulation').onclick();
  await ids.get('guide-next').onclick();
  await ids.get('guide-next').onclick();
  assert.equal(ids.get('remaining').textContent,44);
  assert.match(ids.get('notice').textContent,/Stage complete/);
  ids.get('reduce').checked=false;
  const playback=ids.get('play').onclick();
  assert.equal(flights.length,1);
  ids.get('simulation-menu').onclick();
  await playback;
  assert.equal(ids.get('simulation').hidden,true);
  assert.equal(ids.get('remaining').textContent,43);
  assert.equal(ids.get('shuffle').disabled,false);
  assert.ok(flights.every(el=>el.removed));
  app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='simulation').onclick();
  const shuffle=ids.get('shuffle').onclick();
  const confirmed=ids.get('sim-confirm-yes').onclick();
  ids.get('simulation-menu').onclick();
  await confirmed;await shuffle;
  assert.equal(ids.get('remaining').textContent,52);
  assert.equal(ids.get('shuffle').disabled,false);
});

test('all-in seats show public cards through voting and interruptions without public guidance',()=>{
 const p=page(savedFlop('tap',true,'allin')),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
 const table=()=>app.innerHTML.match(/<section class="mp-oval[\s\S]*?<\/section>/)[0];
 assert.match(table(),/mp-hole-1-0[^>]+aria-label="6 of hearts"/);
 assert.match(table(),/mp-hole-0-0[^>]+aria-label="2 of clubs"/);
 assert.match(app.innerHTML,/Hole cards are public/);
 assert.doesNotMatch(app.innerHTML,/All hole cards are hidden|You have|receives/);
 app.querySelectorAll('[data-command]').find(e=>e.dataset.command==='ready').onclick();
 ids.get('peek-button').onclick();assert.match(ids.get('private-guidance').innerHTML,/You have/);
 ids.get('peek-button').onclick();assert.equal(ids.get('private-guidance').innerHTML,'');
 assert.equal(ids.get('peek-button').textContent,'Show guidance');
 p.windowEvents.blur.forEach(fn=>fn());
 assert.match(table(),/mp-hole-1-0[^>]+aria-label="6 of hearts"/);
 assert.doesNotMatch(app.innerHTML,/You have|receives|All hole cards are hidden/);
});

test('table action labels and colors change only after confirmation',()=>{
 const p=page(savedFlop('tap',true,'call')),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
 assert.match(app.innerHTML,/mp-seat action-blue/);assert.match(app.innerHTML,/Raise to 6|Bet 6/);
 app.querySelectorAll('[data-command]').find(e=>e.dataset.command==='ready').onclick();
 app.querySelectorAll('[data-bet]').find(e=>e.dataset.bet==='call').onclick();
 assert.doesNotMatch(app.innerHTML,/mp-seat action-green/);
 ids.get('action-cancel').onclick();assert.doesNotMatch(app.innerHTML,/mp-seat action-green/);
 app.querySelectorAll('[data-bet]').find(e=>e.dataset.bet==='call').onclick();ids.get('action-confirm').onclick();
 assert.match(app.innerHTML,/mp-seat action-green/);assert.match(app.innerHTML,/mp-seat action-blue/);
 assert.match(app.innerHTML,/class="seat-note">Call 6/);
});

test('short stacks show a single all-in raise or only a legal call',()=>{
 for(const facingBet of [false,true]){
  const raw=JSON.parse(savedFlop('tap',true,facingBet?'call':'flop'));
  raw.seed.stacks=[3,37];
  if(!facingBet)raw.moves.push({type:'bet',action:'check'});
  const p=page(JSON.stringify(raw)),{ids}=p,app=ids.get('pocket-app');
  app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
  app.querySelectorAll('[data-command]').find(e=>e.dataset.command==='ready').onclick();
  assert.match(app.innerHTML,/type="range" min="1" max="1" step="1" value="1" disabled/);
  if(facingBet){
   assert.equal(ids.get('raise-action').textContent,'Raise unavailable');
   assert.match(app.innerHTML,/id="raise-action" data-bet="raise" disabled/);
   app.querySelectorAll('[data-bet]').find(e=>e.dataset.bet==='call').onclick();
   assert.match(ids.get('action-description').textContent,/call 1 chip/);
  }else{
   assert.equal(ids.get('raise-action').textContent,'All-in 1');
   assert.match(ids.get('raise-selection').textContent,/Only legal raise: All-in/);
   ids.get('raise-action').onclick();assert.match(ids.get('action-description').textContent,/all-in with your remaining 1 chip/);
  }
 }
});

test('all-in UI updates categories, board results and street history, then shows one dismissible winner popup',async()=>{
 const p=page(savedFlop('tap',false,'allin')),{ids}=p,app=ids.get('pocket-app');
 const cmd=type=>app.querySelectorAll('[data-command]').find(e=>e.dataset.command===type).onclick();
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
 assert.match(app.innerHTML,/class="seat-rank">High card/);
 for(let i=0;i<2;i++){cmd('ready');app.querySelectorAll('[data-vote]').find(e=>e.dataset.vote==='yes').onclick();}
 assert.match(app.innerHTML,/A: High card/);assert.match(app.innerHTML,/B: High card/);
 assert.equal(ids.get('winner-popup').open,undefined);
 for(let i=0;i<2;i++){
  const before=p.saved,scrollCount=p.scrolls.length;
  cmd('continue');
  assert.equal(p.scrolls.length,scrollCount+1);
  assert.equal(JSON.parse(p.scrolls.at(-1).saved).moves.length,JSON.parse(before).moves.length);
  assert.equal(p.scrolls.at(-1).options.behavior,'instant');
  assert.equal(p.scrolls.at(-1).options.top,0);
  await new Promise(setImmediate);
 }
 assert.match(app.innerHTML,/id="board-verdict-0"/);assert.doesNotMatch(app.innerHTML,/id="board-verdict-1"/);
 assert.match(app.innerHTML,/Pot 40/);assert.equal(ids.get('winner-popup').open,undefined);
 for(let i=0;i<2;i++){
  const before=p.saved,scrollCount=p.scrolls.length;
  cmd('continue');
  assert.equal(p.scrolls.length,scrollCount+1);
  assert.equal(JSON.parse(p.scrolls.at(-1).saved).moves.length,JSON.parse(before).moves.length);
  assert.equal(p.scrolls.at(-1).options.behavior,'instant');
  assert.equal(p.scrolls.at(-1).options.top,0);
  await new Promise(setImmediate);
 }
 assert.match(app.innerHTML,/id="board-verdict-1"/);assert.doesNotMatch(app.innerHTML,/data-command="showdown"/);
 assert.match(app.innerHTML,/<h3>Preflop<\/h3>/);assert.match(app.innerHTML,/<h3>River · B<\/h3>/);
 assert.match(app.innerHTML,/No betting/);assert.equal(ids.get('winner-popup').open,true);
 assert.doesNotMatch(app.innerHTML,/<details class="(?:public-history|history-round)"/);
 assert.match(app.innerHTML,/class="mp-seat seat-winner /);
 assert.match(ids.get('winner-summary').innerHTML,/receives \d+ chips/);
 const completed=p.saved;ids.get('winner-continue').onclick();assert.equal(ids.get('winner-popup').open,false);assert.equal(p.saved,completed);
 p.windowEvents.blur.forEach(fn=>fn());assert.equal(ids.get('winner-popup').open,false);
});

test('fold-win popup preserves private cards and completed-hand resume does not replay it',()=>{
 const p=page(savedFlop()),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
 app.querySelectorAll('[data-command]').find(e=>e.dataset.command==='ready').onclick();
 app.querySelectorAll('[data-bet]').find(e=>e.dataset.bet==='fold').onclick();ids.get('action-confirm').onclick();
 assert.equal(ids.get('winner-popup').open,true);assert.match(ids.get('winner-summary').innerHTML,/Everyone else folded/);
 assert.doesNotMatch(app.innerHTML,/class="seat-rank"|id="board-verdict|class="player-result"/);
 ids.get('winner-continue').onclick();
 const resumed=page(p.saved),home=resumed.ids.get('pocket-app');
 home.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();resumed.ids.get('resume-game').onclick();
 assert.notEqual(resumed.ids.get('winner-popup').open,true);assert.match(home.innerHTML,/Hand complete/);
});

test('a tied normal hand keeps results private until Showdown and announces both recipients',()=>{
 const p=page(savedFlop('hold',false,'river','2d 3d 4h 5h 6d Ac Kc Qc 7d Jc 8d Tc')),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
 app.querySelectorAll('[data-command]').find(e=>e.dataset.command==='ready').onclick();
 app.querySelectorAll('[data-bet]').find(e=>e.dataset.bet==='check').onclick();ids.get('action-confirm').onclick();
 assert.doesNotMatch(app.innerHTML,/id="board-verdict|class="seat-rank"/);assert.notEqual(ids.get('winner-popup').open,true);
 app.querySelectorAll('[data-command]').find(e=>e.dataset.command==='showdown').onclick();
 assert.match(app.innerHTML,/Blair &amp; Alex tie · 4 chips/);
 assert.equal(ids.get('winner-title').textContent,'Pot winners');
 assert.match(ids.get('winner-summary').innerHTML,/<strong>Alex<\/strong> receives 2 chips/);
 assert.match(ids.get('winner-summary').innerHTML,/<strong>Blair<\/strong> receives 2 chips/);
});

test('setup offers eight named seats and preserves names when changing table size',()=>{
 const p=page(),app=p.ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='setup').onclick();
 assert.match(app.innerHTML,/>8<\/option>/);
 p.ids.get('mp-name-0').value='Robin';
 p.ids.get('mp-count').value='8';p.ids.get('mp-count').onchange();
 assert.equal(p.ids.get('mp-name-0').value,'Robin');
 for(let i=1;i<8;i++)assert.equal(p.ids.get('mp-name-'+i).value,'Player '+(i+1));
 assert.match(app.innerHTML,/Seat 8/);
});
test('Equity card entry disables duplicates, preserves inputs across modes, and leaves saved games untouched',()=>{
 const p=page(savedFlop()),app=p.ids.get('pocket-app'),before=p.saved;
 const nav=mode=>app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav===mode).onclick();
 nav('modes');nav('equity');
 assert.match(app.innerHTML,/Equity calculator/);
 app.querySelectorAll('[data-eq-slot]').find(e=>e.dataset['eq-slot']==='p:0:0').onclick();
 p.ids.get('equity-picker').querySelectorAll('[data-eq-card]').find(e=>e.dataset['eq-card']==='As').onclick();
 p.ids.get('equity-picker').querySelectorAll('[data-eq-card]').find(e=>e.dataset['eq-card']==='Kh').onclick();
 app.querySelectorAll('[data-eq-slot]').find(e=>e.dataset['eq-slot']==='p:1:0').onclick();
 assert.match(p.ids.get('equity-picker').innerHTML,/data-eq-card="As" disabled/);
 p.ids.get('eq-picker-close').onclick();nav('modes');nav('equity');
 assert.match(app.innerHTML,/A of spades/);assert.match(app.innerHTML,/K of hearts/);assert.equal(p.saved,before);
});

function equityPage(workerAvailable=true){
 const p=page(savedFlop(),workerAvailable),app=p.ids.get('pocket-app');
 p.nav=mode=>app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav===mode).onclick();p.nav('modes');p.nav('equity');
 p.pick=(slot,cards)=>{app.querySelectorAll('[data-eq-slot]').find(e=>e.dataset.eqSlot===slot).onclick();for(const c of cards)p.ids.get('equity-picker').querySelectorAll('[data-eq-card]').find(e=>e.dataset.eqCard===c).onclick();};
 p.stage=n=>app.querySelectorAll('[data-eq-stage]').find(e=>e.dataset.eqStage===String(n)).onclick();return p;
}
test('Equity cancels obsolete jobs, ignores late results, retries, and retains completed results',()=>{
 const p=equityPage(),{ids,workers}=p,before=p.saved;
 p.pick('p:0:0',['As','Ad']);p.pick('p:1:0',['Ks','Kd']);assert.equal(workers.length,1);
 const first=workers[0],partial={exact:false,done:false,total:20000,completed:250,players:[{equity:.8,win:.8,tie:0},{equity:.2,win:.2,tie:0}]};
 first.onmessage({data:{id:first.request.id,result:partial}});assert.match(ids.get('eq-result-0').innerHTML,/80.0%/);
 ids.get('eq-cancel').onclick();assert.equal(first.terminated,true);assert.doesNotMatch(ids.get('eq-result-0').innerHTML,/80.0%/);
 first.onmessage({data:{id:first.request.id,result:partial}});assert.doesNotMatch(ids.get('eq-result-0').innerHTML,/80.0%/);
 ids.get('eq-retry').onclick();assert.equal(workers.length,2);
 p.stage(5);assert.equal(workers[1].terminated,true);p.pick('b:0',['2c','3h','7d','9s','Jc']);
 const last=workers.at(-1);assert.equal(last.request.input.board.length,5);
 last.onmessage({data:{id:last.request.id,result:{exact:true,done:true,total:1,completed:1,players:[{equity:1,win:1,tie:0},{equity:0,win:0,tie:0}]}}});
 assert.match(ids.get('eq-result-0').innerHTML,/100.0%/);assert.match(ids.get('eq-result-0').innerHTML,/Winner/);assert.equal(last.terminated,true);
 p.nav('modes');p.nav('equity');assert.match(ids.get('eq-result-0').innerHTML,/100.0%/);assert.equal(p.saved,before);
});
test('Equity removal confirmation and worker failures keep the scenario editable',()=>{
 const p=equityPage(false),{ids}=p,app=ids.get('pocket-app');
 p.stage(5);p.pick('p:0:0',['As','Ad']);p.pick('p:1:0',['Ks','Kd']);p.pick('b:0',['2c','3h','7d','9s','Jc']);
 assert.match(ids.get('eq-status').innerHTML,/could not start/);assert.match(app.innerHTML,/J of clubs/);
 p.stage(3);assert.equal(ids.get('equity-confirm').open,true);ids.get('eq-remove-cancel').onclick();assert.match(app.innerHTML,/J of clubs/);
 p.stage(3);ids.get('eq-remove-confirm').onclick();assert.doesNotMatch(app.innerHTML,/J of clubs/);assert.match(app.innerHTML,/7 of diamonds/);
 ids.get('eq-reset').onclick();ids.get('eq-remove-confirm').onclick();assert.match(app.innerHTML,/data-eq-stage="3" aria-pressed="true"/);assert.doesNotMatch(app.innerHTML,/A of spades/);
});

test('the generated worker source runs the real evaluator and reports exact results',async()=>{
 const p=equityPage();p.stage(5);p.pick('p:0:0',['As','Ad']);p.pick('p:1:0',['Ks','Kd']);p.pick('b:0',['2c','3h','7d','9s','Jc']);
 const worker=p.workers.at(-1),messages=[],ctx=vm.createContext({crypto:webcrypto,postMessage:data=>messages.push(data)});
 vm.runInContext(await worker.source.text(),ctx);ctx.onmessage({data:worker.request});
 const result=messages.at(-1);assert.equal(result.id,worker.request.id);assert.equal(result.result.players[0].equity,1);assert.equal(result.result.exact,true);
});
test('Equity resets after reload and cancels running work on mode exit without touching multiplayer saves',()=>{
 const p=equityPage(),{ids}=p,before=p.saved;
 p.pick('p:0:0',['As','Ad']);p.pick('p:1:0',['Ks','Kd']);const worker=p.workers.at(-1);
 p.nav('modes');assert.equal(worker.terminated,true);p.nav('equity');assert.match(ids.get('eq-status').innerHTML,/cancelled/);
 assert.match(ids.get('pocket-app').innerHTML,/A of spades/);assert.equal(p.saved,before);
 const reloaded=page(p.saved),app=reloaded.ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='equity').onclick();
 assert.doesNotMatch(app.innerHTML,/A of spades/);assert.match(reloaded.ids.get('eq-status').innerHTML,/Choose two cards/);
});
test('Equity confirms player removal and clearing a card invalidates completed percentages',()=>{
 const p=equityPage(),{ids}=p,app=ids.get('pocket-app');ids.get('eq-count').value='3';ids.get('eq-count').onchange();
 p.pick('p:2:0',['As','Ad']);ids.get('eq-count').value='2';ids.get('eq-count').onchange();
 assert.equal(ids.get('equity-confirm').open,true);ids.get('eq-remove-cancel').onclick();assert.match(app.innerHTML,/A of spades/);
 ids.get('eq-count').value='2';ids.get('eq-count').onchange();ids.get('eq-remove-confirm').onclick();assert.doesNotMatch(app.innerHTML,/A of spades/);
 p.pick('p:0:0',['As','Ad']);p.pick('p:1:0',['Ks','Kd']);const w=p.workers.at(-1);
 w.onmessage({data:{id:w.request.id,result:{exact:false,done:true,completed:20000,total:20000,players:[{equity:.8,win:.8,tie:0},{equity:.2,win:.2,tie:0}]}}});
 assert.match(ids.get('eq-result-0').innerHTML,/80.0%/);
 app.querySelectorAll('[data-eq-slot]').find(e=>e.dataset.eqSlot==='p:0:0').onclick();ids.get('eq-picker-clear').onclick();
 assert.doesNotMatch(ids.get('eq-result-0').innerHTML,/80.0%/);assert.match(ids.get('eq-status').innerHTML,/Choose two cards/);
});

test('Simulation deals one street, confirms bets, and pauses before the next street',async()=>{
 const p=page(savedFlop()),{ids}=p,app=ids.get('pocket-app'),saved=p.saved;
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='simulation').onclick();
 assert.match(ids.get('sim-deal').textContent,/Hole Cards/);
 await ids.get('sim-deal').onclick();
 assert.equal(ids.get('remaining').textContent,44);
 assert.equal(ids.get('sim-deal').disabled,true);
 assert.match(ids.get('betting-panel').innerHTML,/type="range"/);
 for(let i=0;i<4;i++){
  ids.get('call-check').onclick();assert.equal(ids.get('sim-confirm').open,true);
  assert.equal(ids.get('remaining').textContent,44);
  ids.get('sim-confirm-yes').onclick();
 }
 assert.equal(ids.get('sim-deal').disabled,false);assert.match(ids.get('sim-deal').textContent,/Flop/);
 assert.equal(ids.get('remaining').textContent,44);
 await ids.get('sim-deal').onclick();assert.equal(ids.get('remaining').textContent,40);
 assert.equal(p.saved,saved);assert.ok(ids.get('sim-table-start'));assert.ok(p.scrolls.some(s=>s.element===ids.get('sim-table-start')));
});

test('Simulation equity follows visible cards and ignores cancelled or obsolete worker results',async()=>{
 const p=page(savedFlop()),{ids}=p,app=ids.get('pocket-app'),saved=p.saved;
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='simulation').onclick();
 await ids.get('sim-deal').onclick();
 const w=p.workers.at(-1);assert.ok(w);assert.equal(w.request.visible.hands.length,4);assert.equal('deck' in w.request.visible,false);
 const result={board:0,seats:[0,1,2,3],exact:false,done:false,completed:250,total:20000,players:Array.from({length:4},()=>({equity:.25,win:.25,tie:0}))};
 w.onmessage({data:{id:w.request.id,result}});assert.match(ids.get('sim-equity-seat-0').innerHTML,/25.0%/);
 ids.get('sim-equity-cancel').onclick();assert.equal(w.terminated,true);
 w.onmessage({data:{id:w.request.id,result:{...result,done:true,completed:20000}}});
 assert.doesNotMatch(ids.get('sim-equity-seat-0').innerHTML,/25.0%/);
 ids.get('sim-equity-retry').onclick();const newer=p.workers.at(-1);assert.notEqual(w,newer);
 ids.get('fold').onclick();ids.get('sim-confirm-yes').onclick();assert.equal(newer.terminated,true);
 assert.equal(p.workers.at(-1).request.visible.folded.filter(Boolean).length,1);
 assert.equal(ids.get('sim-equity-seat-3').innerHTML,'Folded');assert.equal(p.saved,saved);
 ids.get('simulation-menu').onclick();assert.equal(p.workers.at(-1).terminated,true);
});

test('Simulation fold wins celebrate once and replay asks before discarding an unfinished deal',async()=>{
 const p=page(),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='simulation').onclick();
 await ids.get('sim-deal').onclick();const first=ids.get('players').innerHTML;
 assert.doesNotMatch(ids.get('results').innerHTML,/result-outcome/);
 ids.get('replay').onclick();assert.equal(ids.get('sim-confirm').open,true);
 ids.get('sim-confirm-no').onclick();assert.equal(ids.get('remaining').textContent,44);
 for(let i=0;i<3;i++){ids.get('fold').onclick();ids.get('sim-confirm-yes').onclick();}
 assert.equal(ids.get('sim-winner').open,true);assert.match(ids.get('sim-winner-summary').innerHTML,/wins/);
 assert.match(ids.get('results').innerHTML,/<summary>.*result-outcome.*Won .*chips.*<\/summary>/);
 assert.equal((ids.get('results').innerHTML.match(/No pot won/g)||[]).length,3);
 assert.equal((ids.get('players').innerHTML.match(/seat-loser/g)||[]).length,3);
 ids.get('sim-winner-close').onclick();ids.get('simulation-menu').onclick();
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='simulation').onclick();assert.equal(ids.get('sim-winner').open,false);
 await ids.get('replay').onclick();assert.equal(ids.get('remaining').textContent,52);
 await ids.get('sim-deal').onclick();assert.equal(ids.get('players').innerHTML,first);
});

test('Simulation all-in runouts pause at every street and finish only after board B',async()=>{
 const p=page(),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='simulation').onclick();
 await ids.get('sim-deal').onclick();
 ids.get('raise-to').value='20';ids.get('raise-to').oninput();assert.match(ids.get('raise').textContent,/All-in/);
 ids.get('raise').onclick();ids.get('sim-confirm-yes').onclick();
 for(let i=0;i<3;i++){ids.get('call-check').onclick();ids.get('sim-confirm-yes').onclick();}
 assert.equal(ids.get('twice').disabled,false);ids.get('twice').onclick();
 for(const remaining of [40,38,36,32,30,28]){
  await ids.get('sim-deal').onclick();assert.equal(ids.get('remaining').textContent,remaining);
  if(remaining!==28)assert.notEqual(ids.get('sim-winner').open,true);
  if(remaining<=36)assert.match(ids.get('boards').innerHTML,/wins|tie/);
 }
 assert.equal(ids.get('sim-winner').open,true);assert.equal(ids.get('sim-deal').disabled,true);
 assert.match(ids.get('sim-history').innerHTML,/Preflop/);assert.match(ids.get('sim-history').innerHTML,/River · B/);assert.match(ids.get('sim-history').innerHTML,/No betting/);
 assert.equal(p.workers.at(-1).request.visible.boards.length,2);
});

test('pausing Simulation disables study playback and cancellation leaves a deal usable',async()=>{
 const p=page(),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='simulation').onclick();
 ids.get('sim-pause').onclick();assert.equal(ids.get('guide-next').disabled,true);assert.equal(ids.get('next').disabled,true);
 ids.get('sim-pause').onclick();await ids.get('sim-deal').onclick();
 const w=p.workers.at(-1);w.onerror();assert.match(ids.get('sim-equity-status').innerHTML,/could not finish/);
 assert.equal(ids.get('call-check').disabled,false);
 ids.get('replay').onclick();ids.get('sim-confirm-no').onclick();assert.equal(ids.get('remaining').textContent,44);
});

test('per-card study controls finish the current partial flop before offering the turn',async()=>{
 const p=page(),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='simulation').onclick();
 ids.get('betting-mode').checked=false;await ids.get('betting-mode').onchange();await ids.get('sim-deal').onclick();
 await ids.get('next').onclick();await ids.get('next').onclick();
 assert.match(ids.get('sim-deal').textContent,/Finish Flop/);assert.equal(ids.get('twice').disabled,true);
 assert.match(ids.get('sim-equity-status').innerHTML,/completed street/);
 await ids.get('sim-deal').onclick();assert.equal(ids.get('remaining').textContent,40);assert.match(ids.get('sim-deal').textContent,/Deal Turn/);
});

test('Simulation and Pass & Play share community board labels and street presentation',async()=>{
 const p=page(savedFlop()),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
 assert.match(app.innerHTML,/class="board-stage">Flop/);
 assert.match(app.innerHTML,/class="board-meta">One board/);
 ids.get('save-leave').onclick();ids.get('home-save').onclick();app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='simulation').onclick();
 await ids.get('sim-deal').onclick();assert.match(ids.get('stage').innerHTML,/class="board-stage">Preflop/);
 assert.match(ids.get('stage').innerHTML,/class="board-meta">One board/);
 for(let i=0;i<4;i++){ids.get('call-check').onclick();ids.get('sim-confirm-yes').onclick();}
 await ids.get('sim-deal').onclick();assert.match(ids.get('stage').innerHTML,/class="board-stage">Flop/);
});

test('multiplayer equity uses public hands only and ignores stale results after leaving',()=>{
 const p=page(savedFlop('hold',true,'allin')),{ids,workers}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
 const w=workers.at(-1);assert.ok(w);assert.deepEqual(Array.from(w.request.visible.burns),[]);assert.equal(w.request.visible.hands.length,2);
 w.onmessage({data:{id:w.request.id,result:{board:0,seats:[0,1],exact:true,done:true,players:[{equity:.75},{equity:.25}]}}});
 assert.match(ids.get('mp-equity-0').innerHTML,/75.0%/);
 ids.get('save-leave').onclick();ids.get('home-save').onclick();assert.equal(w.terminated,true);
 const normal=page(savedFlop()),a=normal.ids.get('pocket-app');a.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();normal.ids.get('resume-game').onclick();assert.equal(normal.workers.length,0);
});

test('Save & Leave confirms before saving and reloading home',()=>{
 const p=page(savedFlop()),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
 ids.get('save-leave').onclick();assert.equal(ids.get('home-confirm').open,true);assert.equal(p.reloads,0);
 ids.get('home-cancel').onclick();assert.equal(ids.get('home-confirm').open,false);
 ids.get('save-leave').onclick();ids.get('home-save').onclick();assert.equal(p.reloads,1);assert.ok(p.saved);
});

 test('home reload is blocked when saving fails',()=>{
 const p=page(savedFlop(),true,true),{ids}=p,app=ids.get('pocket-app');
 app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();ids.get('resume-game').onclick();
 ids.get('save-leave').onclick();ids.get('home-save').onclick();assert.equal(p.reloads,0);
 });

test('mode, setup and Equity headers have static branding and a Back action',()=>{
 for(const mode of ['modes','setup','equity']){
  const p=page(),{ids}=p,app=ids.get('pocket-app');
  app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav==='modes').onclick();
  if(mode!=='modes')app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav===mode).onclick();
  assert.match(app.innerHTML,/pocket-logo header-logo/);
  assert.match(app.innerHTML,/>Back<\/button>/);
  assert.doesNotMatch(app.innerHTML,/<button[^>]*class="brand-small/);
  app.querySelectorAll('[data-nav]').find(e=>e.dataset.nav===(mode==='modes'?'home':'modes')).onclick();assert.notEqual(ids.get('home-confirm').open,true);assert.equal(p.reloads,0);
 }
});
