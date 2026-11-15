// Throwaway comparison. All practice saves stay in memory.
const motionMemory={getItem:()=>null,setItem:()=>{}};
const FX=(()=>{
 const TIME={shuffle:1200,chip:300,cue:200,winner:180},MOVE='cubic-bezier(.77,0,.175,1)';
 let enhanced=new URLSearchParams(location.search).get('variant')!=='current',epoch=0,timers=[],animations=[],nodes=[],abortShuffle=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||(!document.getElementById('simulation')?.hidden&&document.getElementById('reduce')?.checked);
 const on=()=>enhanced&&!reduced();
 function later(fn,delay){const id=epoch;timers.push(setTimeout(()=>{if(id===epoch)fn();},delay));}
 function clear(){epoch++;timers.forEach(clearTimeout);timers=[];animations.forEach(a=>a.cancel());animations=[];nodes.forEach(n=>n.remove());nodes=[];abortShuffle?.();abortShuffle=null;}
 function animate(el,frames,options){if(!el||!on())return;const a=el.animate(frames,options);animations.push(a);a.finished.catch(()=>{});return a;}
 function cue(el){animate(el,[{outline:'3px solid #e2b43c'},{outline:'3px solid transparent'}],{duration:TIME.cue});}
 function snapshot(mode,actor){return document.querySelectorAll(mode==='mp'?'.mp-oval .mp-seat':'#players .seat')[actor]?.getBoundingClientRect();}
 function contribution(mode,from,amount){if(!on()||!from||amount<=0)return;const to=document.querySelector(mode==='mp'?'#mp-community strong':'#sim-pot')?.getBoundingClientRect();if(!to)return;
 const chip=document.createElement('span');chip.className='fx-chip';chip.textContent='●';chip.setAttribute('aria-hidden','true');Object.assign(chip.style,{left:from.left+from.width/2+'px',top:from.top+from.height/2+'px'});document.body.append(chip);nodes.push(chip);
 const dx=to.left+to.width/2-from.left-from.width/2,dy=to.top-from.top-from.height/2;
 animate(chip,[{transform:'translate(0,0)'},{transform:`translate(${dx/2}px,${dy/2-24}px)`,offset:.5},{transform:`translate(${dx}px,${dy}px)`}],{duration:TIME.chip,easing:MOVE,fill:'forwards'});
 later(()=>{chip.remove();cue(document.querySelector(mode==='mp'?'.mp-oval .acting':'#players .acting'));},TIME.chip);
 }
 function winner(dialog){if(!enhanced||reduced()){dialog.showModal();return;}cue(document.querySelector('.mp-seat.seat-winner'));later(()=>{if(!document.hidden&&!dialog.open)dialog.showModal();},TIME.winner);}
 async function shuffle(){if(!on())return true;
 const dialog=document.createElement('dialog');dialog.className='fx-shuffle';dialog.setAttribute('aria-label','Preparing hand');dialog.innerHTML='<div class="fx-stacks" aria-hidden="true"><i>♠</i><i>♠</i><i>♠</i><i>♠</i></div><h2>Preparing hand…</h2><p>Mixing the deck for a fresh hand.</p><button>Pause preparation</button>';document.body.append(dialog);dialog.showModal();
 // Storyboard: separate packets (0–300), interleave (300–900), square deck (900–1200).
 const cards=[...dialog.querySelectorAll('i')];cards.forEach((el,i)=>animate(el,[{transform:'translate(0,0) rotate(0)'},{transform:`translate(${i%2?42:-42}px,${i*3}px) rotate(${i%2?9:-9}deg)`,offset:.25},{transform:`translate(${i%2?10:-10}px,${i*3}px) rotate(0)`,offset:.75},{transform:`translate(0,${i*2}px) rotate(0)`}],{duration:TIME.shuffle,easing:MOVE,fill:'forwards'}));
 return new Promise(resolve=>{let finished=false;const finish=ok=>{if(finished)return;finished=true;clearTimeout(timer);dialog.close();dialog.remove();abortShuffle=null;resolve(ok);};const timer=setTimeout(()=>finish(true),TIME.shuffle);abortShuffle=()=>finish(false);dialog.querySelector('button').onclick=()=>{clear();};dialog.oncancel=e=>{e.preventDefault();clear();};});
 }
 function install(){
 const bar=document.createElement('details');bar.id='motion-lab';bar.open=true;bar.innerHTML='<summary>Animation comparison</summary><div><button id="fx-switch"></button><button id="fx-preview">Preview shuffle</button></div><p id="fx-state"></p><p>Practice games reset on reload. Collapse this bar to play.</p>';document.body.append(bar);
 const refresh=()=>{document.body.dataset.effects=String(enhanced);bar.querySelector('#fx-switch').textContent=enhanced?'Added effects → Current':'Current → Added effects';bar.querySelector('#fx-state').textContent=(enhanced?'Added effects':'Current')+' · original card travel · '+(reduced()?'reduced motion':'motion on')+' · no persistent saves';};
 bar.querySelector('#fx-switch').onclick=()=>{clear();enhanced=!enhanced;const u=new URL(location);u.searchParams.set('variant',enhanced?'effects':'current');history.replaceState(null,'',u);refresh();};bar.querySelector('#fx-preview').onclick=()=>shuffle();refresh();
 const seen=new Map();new MutationObserver(()=>{if(!on())return;for(const [key,selector] of [['mp-actor','.mp-oval .acting'],['sim-actor','#players .acting'],['mp-street','#mp-community .board-stage'],['sim-street','#stage .board-stage']]){const el=document.querySelector(selector),value=key.includes('actor')?el?.querySelector('strong,.seat-name')?.textContent:el?.textContent;if(seen.get(key)!==value){const old=seen.get(key);seen.set(key,value);if(old&&value)later(()=>cue(document.querySelector(selector)),key.includes('actor')?TIME.chip:0);}}}).observe(document.body,{childList:true,subtree:true});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{clear();refresh();});
 }
 // Any new user action cancels obsolete decoration, never game state or card travel.
 document.addEventListener('click',()=>{if(!abortShuffle)clear();},true);
 window.addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
 document.addEventListener('DOMContentLoaded',install);
 return {get enhanced(){return enhanced;},clear,shuffle,winner,snapshot,contribution};
})();
