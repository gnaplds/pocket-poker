const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
function bars(reduced=false){const ctx=vm.createContext({matchMedia:()=>({matches:reduced})});vm.runInContext(require('./load-page.cjs')().match(/<script id="equity-bars">([\s\S]*?)<\/script>/)[1]+';globalThis.bars=EquityBars;',ctx);return ctx.bars;}
test('equity distinguishes zero, tiny positives, estimates and unavailable values',()=>{
 const b=bars();assert.match(b.html(0),/aria-valuenow="0"/);assert.match(b.html(0),/background-color:#929b96/);
 assert.match(b.html(.00001),/&lt;0.1%/);assert.doesNotMatch(b.html(.00001),/background-color:#929b96/);
 assert.match(b.html(0,true),/≈ 0.0%/);assert.match(b.html(.5,false,'B'),/B · Hand equity/);
 assert.match(b.html(undefined),/Hand equity unavailable/);assert.doesNotMatch(b.html(undefined),/role="meter"/);
 assert.match(b.html(1),/width:100%/);
});
test('bar updates animate only valid-to-valid values and honor reduced motion',()=>{
 let calls=0;const fill={dataset:{equityValid:'true'},style:{width:'50%',backgroundColor:'green'},animate(frames,options){calls++;assert.equal(options.duration,200);assert.equal(frames[0].width,'50%');}};
 const el={querySelectorAll:()=>[fill],set innerHTML(value){fill.dataset.equityValid=value==='missing'?'false':'true';}};
 bars().update(el,'valid');assert.equal(calls,1);
 bars().update(el,'missing');assert.equal(calls,1);
 bars().update(el,'valid');assert.equal(calls,1);
 bars(true).update(el,'valid');assert.equal(calls,1);
});
