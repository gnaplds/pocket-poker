// Small self-check for throwaway motion cancellation and privacy boundaries.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 let reduced=false,opened=0;
 const context={URLSearchParams,location:{search:'?variant=effects'},matchMedia:()=>({matches:reduced}),document:{getElementById:()=>null,addEventListener(){},querySelector:()=>null},window:{addEventListener(){}},setTimeout,clearTimeout};
 vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/effects.js','utf8')+';globalThis.fx=FX;',context);
 context.fx.winner({showModal(){opened++;}});context.fx.clear();
 await new Promise(r=>setTimeout(r,220));assert.equal(opened,0);
 reduced=true;context.fx.winner({showModal(){opened++;}});assert.equal(opened,1);assert.equal(await context.fx.shuffle(),true);
 const surfaces=[{inert:false},{inert:true}],classes=new Set();let removed=0;
 context.document.documentElement={classList:{add:v=>classes.add(v),remove:v=>classes.delete(v)}};
 context.document.querySelectorAll=()=>surfaces;
 context.document.createElement=()=>({setAttribute(){},remove(){removed++;}});
 context.document.body={append(){}};
 const releaseA=context.fx.lockDealing(),releaseB=context.fx.lockDealing();
 assert(classes.has('cards-dealing'));assert(surfaces.every(s=>s.inert));
 releaseA();assert(classes.has('cards-dealing'),'nested card completion must not unlock a street');
 releaseB();assert(!classes.has('cards-dealing'));assert.equal(surfaces[0].inert,false);assert.equal(surfaces[1].inert,true);
 const stale=context.fx.lockDealing();context.fx.unlockDealing();const current=context.fx.lockDealing();stale();assert(classes.has('cards-dealing'),'stale completion cannot unlock a new deal');current();assert.equal(removed,3);
 const html=fs.readFileSync(__dirname+'/motion-prototype.html','utf8');assert(!/localStorage\.|sessionStorage\./.test(html));
 for(const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
 const engine=vm.createContext({});vm.runInContext(html.match(/<script id="poker-engine">([\s\S]*?)<\/script>/)[1],engine);
 engine.safe=s=>s;engine.card=(c,classes)=>`<span class="${classes}">${c}</span>`;
 vm.runInContext(html.slice(html.indexOf('function winningCards('),html.indexOf('function resultsHTML()')),engine);
 const cards=engine.winningCards(['7s','7h'],['7d','Kc','2s'],'test');
 assert.equal((cards.match(/small-card defining/g)||[]).length,3);assert.equal((cards.match(/Kicker/g)||[]).length,2);
 engine.activeResult=()=>({winners:[0,1]});assert(engine.winsBoard({stage:'complete',boards:[[]]},0,0));assert(engine.winsBoard({stage:'complete',boards:[[]]},1,0));
 assert(!engine.winsBoard({stage:'flop',boards:[[]]},0,0));
 await context.fx.moveDealer(0,0); // No motion or DOM lookup when the dealer stays put.
 console.log('Passed: cancelled winner, reduced-motion feedback, no storage access, script syntax, nested dealing locks and cleanup.');
})();
