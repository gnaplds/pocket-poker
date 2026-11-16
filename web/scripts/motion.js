const FX=(()=>{
 const TIME={shuffle:1200,chip:300,cue:200,winner:180,dealer:300,highlight:300,reveal:350,payout:250,collection:1500},MOVE='cubic-bezier(.77,0,.175,1)';
 const enhanced=true;let epoch=0,timers=[],animations=[],nodes=[],cleanups=[],abortShuffle=null;
 const reduced=()=>Preferences.reduced();
 const on=()=>enhanced&&!reduced();
 function later(fn,delay){const id=epoch;timers.push(setTimeout(()=>{if(id===epoch)fn();},delay));}
 function clear(){epoch++;timers.forEach(clearTimeout);timers=[];animations.forEach(a=>a.cancel());animations=[];nodes.forEach(n=>n.remove());nodes=[];cleanups.splice(0).forEach(fn=>fn());abortShuffle?.();abortShuffle=null;}
 function animate(el,frames,options){if(!el||!on())return;const a=el.animate(frames,options);animations.push(a);a.finished.catch(()=>{});return a;}
 function cue(el){animate(el,[{outline:'3px solid #e2b43c'},{outline:'3px solid transparent'}],{duration:TIME.cue});}
 function snapshot(mode,actor){return document.querySelectorAll(mode==='mp'?'.mp-oval .mp-seat':'#players .seat')[actor]?.getBoundingClientRect();}
 function contribution(mode,from,amount){if(!on()||!from||amount<=0)return;const to=document.querySelector(mode==='mp'?'#mp-community strong':'#sim-pot')?.getBoundingClientRect();if(!to)return;
 const chip=document.createElement('span');chip.className='fx-chip';chip.textContent='●';chip.setAttribute('aria-hidden','true');Object.assign(chip.style,{left:from.left+from.width/2+'px',top:from.top+from.height/2+'px'});document.body.append(chip);nodes.push(chip);
 const dx=to.left+to.width/2-from.left-from.width/2,dy=to.top-from.top-from.height/2;
 animate(chip,[{transform:'translate(0,0)'},{transform:`translate(${dx/2}px,${dy/2-24}px)`,offset:.5},{transform:`translate(${dx}px,${dy}px)`}],{duration:TIME.chip,easing:MOVE,fill:'forwards'});
 later(()=>{chip.remove();cue(document.querySelector(mode==='mp'?'.mp-oval .acting':'#players .acting'));},TIME.chip);
 }
 function reveal(previous,next){
  if(!previous||!on())return 0;
  let count=0;
  next.seats.forEach((seat,i)=>{
   if(!seat.publicCards||previous.seats[i]?.publicCards||seat.folded)return;
   for(let j=0;j<2;j++){
    const card=document.getElementById(`mp-hole-${i}-${j}`);if(!card)continue;
    const box=card.getBoundingClientRect(),scene=document.createElement('span');scene.className='public-flip';scene.setAttribute('aria-hidden','true');
    Object.assign(scene.style,{left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px'});
    const rotor=document.createElement('span');rotor.className='public-flip-rotor';
    const back=document.createElement('span');back.className='card card-back public-flip-back';back.textContent='◆';
    const face=card.cloneNode(true);face.removeAttribute('id');face.classList.add('public-flip-face');
    rotor.append(back,face);scene.append(rotor);document.body.append(scene);nodes.push(scene);
    const visibility=card.style.visibility;card.style.visibility='hidden';const restore=()=>{card.style.visibility=visibility;scene.remove();};cleanups.push(restore);
    animate(rotor,[{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],{duration:TIME.reveal,easing:MOVE,fill:'forwards'});later(restore,TIME.reveal);count++;
   }
  });return count?TIME.reveal:0;
 }
 function payoutGroups(pots){return (pots||[]).flatMap(p=>p.shares.map(share=>share.awards.filter(a=>a.amount>0))).filter(group=>group.length);}
 function collect(mode,group,duration){
  const source=document.querySelector(mode==='mp'?'#mp-community strong':'#sim-pot');if(!source)return;
  const a=source.getBoundingClientRect(),seats=document.querySelectorAll(mode==='mp'?'.mp-oval .mp-seat':'#players .seat');
  for(const award of group){const target=seats[award.player];if(!target)continue;const b=target.getBoundingClientRect(),chip=document.createElement('span');chip.className='fx-chip';chip.textContent='●●';chip.setAttribute('aria-hidden','true');Object.assign(chip.style,{left:a.left+a.width/2+'px',top:a.top+'px'});document.body.append(chip);nodes.push(chip);
   const dx=b.left+b.width/2-a.left-a.width/2,dy=b.top+b.height/2-a.top;
   animate(chip,[{transform:'translate(0,0)'},{transform:`translate(${dx/2}px,${dy/2-20}px)`,offset:.5},{transform:`translate(${dx}px,${dy}px)`}],{duration,easing:MOVE,fill:'forwards'});later(()=>chip.remove(),duration);
  }
 }
 // Reveal → best five → main/side pots (A then B) → result; accounting is already settled.
 function winner(dialog,{mode='mp',pots=[],revealDelay=0,showdown=true}={}){
  if(!on()){highlightResults();dialog.showModal();return;}
  const groups=payoutGroups(pots),duration=groups.length?Math.min(TIME.payout,TIME.collection/groups.length):0;
  later(()=>{if(showdown)highlightResults();cue(document.querySelector(mode==='mp'?'.mp-oval .seat-winner':'#players .seat-winner'));},revealDelay);
  const start=revealDelay+(showdown?TIME.highlight:0);
  groups.forEach((group,i)=>later(()=>collect(mode,group,duration),start+i*duration));
  later(()=>{if(!document.hidden&&!dialog.open)dialog.showModal();},start+groups.length*duration);
 }
 async function shuffle(){if(!on())return true;
 const dialog=document.createElement('dialog');dialog.className='fx-shuffle';dialog.setAttribute('aria-label','Preparing hand');dialog.innerHTML='<div class="fx-stacks" aria-hidden="true"><i>♠</i><i>♠</i><i>♠</i><i>♠</i></div><h2>Preparing hand…</h2><p>Mixing the deck for a fresh hand.</p><button>Pause preparation</button>';document.body.append(dialog);dialog.showModal();
 // Storyboard: separate packets (0–300), interleave (300–900), square deck (900–1200).
 const cards=[...dialog.querySelectorAll('i')];cards.forEach((el,i)=>animate(el,[{transform:'translate(0,0) rotate(0)'},{transform:`translate(${i%2?42:-42}px,${i*3}px) rotate(${i%2?9:-9}deg)`,offset:.25},{transform:`translate(${i%2?10:-10}px,${i*3}px) rotate(0)`,offset:.75},{transform:`translate(0,${i*2}px) rotate(0)`}],{duration:TIME.shuffle,easing:MOVE,fill:'forwards'}));
 return new Promise(resolve=>{let finished=false;const finish=ok=>{if(finished)return;finished=true;clearTimeout(timer);dialog.close();dialog.remove();abortShuffle=null;resolve(ok);};const timer=setTimeout(()=>finish(true),TIME.shuffle);abortShuffle=()=>finish(false);dialog.querySelector('button').onclick=()=>{clear();};dialog.oncancel=e=>{e.preventDefault();clear();};});
 }
 const dealingLocks=new Set();let dealingShield=null,lockedSurfaces=[];
 function unlockDealing(){
  dealingLocks.clear();dealingShield?.remove();dealingShield=null;
  document.documentElement.classList.remove('cards-dealing');
  lockedSurfaces.forEach(([el,inert])=>{el.inert=inert;});lockedSurfaces=[];
 }
 function lockDealing(){
  const token={};dealingLocks.add(token);
  if(!dealingShield){
   document.documentElement.classList.add('cards-dealing');
   lockedSurfaces=[...document.querySelectorAll('#pocket-app,#simulation')].map(el=>[el,el.inert]);
   lockedSurfaces.forEach(([el])=>{el.inert=true;});
   dealingShield=document.createElement('div');dealingShield.className='dealing-shield';dealingShield.setAttribute('role','status');dealingShield.setAttribute('aria-label','Dealing cards');document.body.append(dealingShield);
  }
  return ()=>{dealingLocks.delete(token);if(!dealingLocks.size)unlockDealing();};
 }
 // Keep programmatic table positioning available; block only user input during a deal.
 for(const type of ['wheel','touchmove','pointerdown','click','keydown'])document.addEventListener(type,e=>{
  if(!dealingLocks.size||e.target.closest?.('dialog[open]'))return;
  if(type==='keydown'&&(e.metaKey||e.ctrlKey||e.altKey))return;
  e.preventDefault();e.stopImmediatePropagation();
 },{capture:true,passive:false});
 window.addEventListener('blur',unlockDealing);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)unlockDealing();});
 async function moveDealer(previous,next){
  if(previous===next||!on())return true;
  const seats=document.querySelectorAll('.mp-oval .mp-seat'),marker=seats[next]?.querySelector('.dealer');
  if(!marker||!seats[previous])return true;
  const from=seats[previous].getBoundingClientRect(),to=marker.getBoundingClientRect();
  const motion=animate(marker,[{transform:`translate(${from.right-to.right}px,${from.top-to.top}px)`},{transform:'translate(0,0)'}],{duration:TIME.dealer,easing:MOVE});
  try{await motion.finished;return true;}catch{return false;}
 }
 const highlighted=new Set();
 function highlightResults(){
  for(const el of document.querySelectorAll('[data-winning-hand]')){
   const key=el.dataset.winningHand;if(highlighted.has(key))continue;
   highlighted.add(key);
   if(el.closest('details')?.open&&on())animate(el,[{opacity:.55},{opacity:1}],{duration:TIME.highlight});
  }
 }
 function install(){
 document.body.dataset.effects='true';
 const seen=new Map();new MutationObserver(()=>{if(!on())return;for(const [key,selector] of [['mp-actor','.mp-oval .acting'],['sim-actor','#players .acting'],['mp-street','#mp-community .board-stage'],['sim-street','#stage .board-stage']]){const el=document.querySelector(selector),value=key.includes('actor')?el?.querySelector('strong,.seat-name')?.textContent:el?.textContent;if(seen.get(key)!==value){const old=seen.get(key);seen.set(key,value);if(old&&value)later(()=>cue(document.querySelector(selector)),key.includes('actor')?TIME.chip:0);}}}).observe(document.body,{childList:true,subtree:true});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{clear();});
 }
 // Any new user action cancels obsolete decoration, never game state or card travel.
 document.addEventListener('click',()=>{if(!abortShuffle)clear();},true);
 window.addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
 document.addEventListener('DOMContentLoaded',install);
 return {get enhanced(){return enhanced;},clear,shuffle,winner,reveal,payoutGroups,snapshot,contribution,moveDealer,resetHighlights:()=>highlighted.clear(),lockDealing,unlockDealing};
})();
