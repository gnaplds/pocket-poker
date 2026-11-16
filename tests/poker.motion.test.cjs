// Motion boundary checks; browser rendering is verified separately.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
test('motion cancellation, dealing locks and winning-card roles',async()=>{
 const html=require('./load-page.cjs')();
 let reduced=false,opened=0;
 const context={Preferences:{reduced:()=>reduced},URLSearchParams,location:{search:'?variant=effects'},matchMedia:()=>({matches:reduced}),document:{getElementById:()=>null,addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[]},window:{addEventListener(){}},setTimeout,clearTimeout};
 vm.createContext(context);vm.runInContext(html.match(/<script id="poker-motion">([\s\S]*?)<\/script>/)[1]+';globalThis.fx=FX;',context);
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

 for(const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
 const engine=vm.createContext({});vm.runInContext(html.match(/<script id="poker-engine">([\s\S]*?)<\/script>/)[1],engine);
 engine.safe=s=>s;engine.card=(c,classes)=>`<span class="${classes}">${c}</span>`;
 vm.runInContext(html.slice(html.indexOf('function winningCards('),html.indexOf('function resultsHTML()')),engine);
 const cards=engine.winningCards(['7s','7h'],['7d','Kc','2s'],'test');
 assert.equal((cards.match(/small-card defining/g)||[]).length,3);assert.equal((cards.match(/Kicker/g)||[]).length,2);
 engine.activeResult=()=>({winners:[0,1]});assert(engine.winsBoard({stage:'complete',boards:[[]]},0,0));assert(engine.winsBoard({stage:'complete',boards:[[]]},1,0));
 assert(!engine.winsBoard({stage:'flop',boards:[[]]},0,0));
 await context.fx.moveDealer(0,0); // No motion or DOM lookup when the dealer stays put.
});

test('payout groups preserve pot and board order, ties and zero-share filtering',()=>{
 const html=require('./load-page.cjs')(),ctx={document:{addEventListener(){}},window:{addEventListener(){}}};vm.createContext(ctx);
 vm.runInContext(html.match(/<script id="poker-motion">([\s\S]*?)<\/script>/)[1]+';globalThis.fx=FX;',ctx);
 const pots=[{shares:[{awards:[{player:0,amount:5},{player:1,amount:5}]},{awards:[{player:2,amount:10}]}]},{shares:[{awards:[{player:1,amount:3},{player:2,amount:0}]},{awards:[{player:0,amount:3}]}]}];
 assert.deepEqual(JSON.parse(JSON.stringify(ctx.fx.payoutGroups(pots))),[[{player:0,amount:5},{player:1,amount:5}],[{player:2,amount:10}],[{player:1,amount:3}],[{player:0,amount:3}]]);
});
test('public reveal skips folded/already-public cards and restores visible cards on interruption',()=>{
 const html=require('./load-page.cjs')();let animated=0;
 const make=()=>({style:{},classList:{add(){}},setAttribute(){},removeAttribute(){},append(){},remove(){},cloneNode:make,getBoundingClientRect:()=>({left:0,top:0,width:32,height:44}),animate(){animated++;return {finished:new Promise(()=>{}),cancel(){}};}});
 const cards=new Map(['mp-hole-0-0','mp-hole-0-1','mp-hole-1-0','mp-hole-1-1','mp-hole-2-0','mp-hole-2-1'].map(id=>[id,make()]));
 const ctx={Preferences:{reduced:()=>false},matchMedia:()=>({matches:false}),document:{getElementById:id=>cards.get(id),createElement:make,body:{append(){}},addEventListener(){}},window:{addEventListener(){}},setTimeout,clearTimeout};vm.createContext(ctx);vm.runInContext(html.match(/<script id="poker-motion">([\s\S]*?)<\/script>/)[1]+';globalThis.fx=FX;',ctx);
 assert.equal(ctx.fx.reveal({seats:[{}, {publicCards:true},{}]},{seats:[{publicCards:true},{publicCards:true},{publicCards:true,folded:true}]}),350);
 assert.equal(animated,2);assert.equal(cards.get('mp-hole-0-0').style.visibility,'hidden');ctx.fx.clear();assert.notEqual(cards.get('mp-hole-0-0').style.visibility,'hidden');
});
test('collection is capped at 1500 ms and cancellation suppresses the pending result',()=>{
 const html=require('./load-page.cjs')();const timers=[];let opened=0;
 const ctx={Preferences:{reduced:()=>false},matchMedia:()=>({matches:false}),document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout(){}};
 vm.createContext(ctx);vm.runInContext(html.match(/<script id="poker-motion">([\s\S]*?)<\/script>/)[1]+';globalThis.fx=FX;',ctx);
 const pots=Array.from({length:8},()=>({shares:[{awards:[{player:0,amount:1}]},{awards:[{player:1,amount:1}]}]}));
 ctx.fx.winner({showModal(){opened++;}},{pots,revealDelay:350});
 assert.equal(Math.max(...timers.map(t=>t.delay)),350+300+1500);
 ctx.fx.clear();timers.forEach(t=>t.fn());assert.equal(opened,0);
});
