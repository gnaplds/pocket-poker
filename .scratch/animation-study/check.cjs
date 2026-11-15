// Small self-check for throwaway motion cancellation and privacy boundaries.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 let reduced=false,opened=0;
 const context={URLSearchParams,location:{search:'?variant=effects'},matchMedia:()=>({matches:reduced}),document:{getElementById:()=>null,addEventListener(){},querySelector:()=>null},window:{addEventListener(){}},setTimeout,clearTimeout};
 vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/effects.js','utf8')+';globalThis.fx=FX;',context);
 context.fx.winner({showModal(){opened++;}});context.fx.clear();
 await new Promise(r=>setTimeout(r,220));assert.equal(opened,0);
 reduced=true;context.fx.winner({showModal(){opened++;}});assert.equal(opened,1);assert.equal(await context.fx.shuffle(),true);
 const html=fs.readFileSync(__dirname+'/motion-prototype.html','utf8');assert(!/localStorage\.|sessionStorage\./.test(html));
 for(const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
 console.log('Passed: cancelled winner, reduced-motion feedback, no storage access, script syntax.');
})();
