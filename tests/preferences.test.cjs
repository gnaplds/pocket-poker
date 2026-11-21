const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('preferences validate stored fields, honor system motion, and survive write failure for this visit',()=>{
 let saved='{"tens":"T","speed":99,"motion":"device","guidance":false,"reveal":"bad"}',system=false,fail=false;
 const ctx=vm.createContext({document:{documentElement:{dataset:{}}},localStorage:{getItem:()=>saved,setItem:(_,value)=>{if(fail)throw Error('full');saved=value;}},matchMedia:()=>({matches:system})});
 vm.runInContext(fs.readFileSync(__dirname+'/../web/scripts/preferences.js','utf8')+';globalThis.p=Preferences;',ctx);
 assert.equal(ctx.p.get().tens,'T');assert.equal(ctx.p.get().speed,1);assert.equal(ctx.p.get().reveal,'hold');assert.equal(ctx.p.get().guidance,false);
 assert.equal(ctx.p.reduced(),false);system=true;assert.equal(ctx.p.reduced(),true);system=false;ctx.p.set('motion','reduced');assert.equal(ctx.p.reduced(),true);
 const persisted=saved;fail=true;ctx.p.set('speed',4);assert.equal(ctx.p.get().speed,4);assert.equal(saved,persisted);assert.match(ctx.p.error,/could not be saved/);
 assert.throws(()=>ctx.p.set('speed',0));
});

test('dark mode defaults safely, applies at startup and persists through failed writes',()=>{
 function load(saved,fail=false){
  const document={documentElement:{dataset:{}}};
  const ctx=vm.createContext({document,localStorage:{getItem:()=>saved,setItem:(_,value)=>{if(fail)throw Error('full');saved=value;}},matchMedia:()=>({matches:false})});
  vm.runInContext(fs.readFileSync(__dirname+'/../web/scripts/preferences.js','utf8')+';globalThis.p=Preferences;',ctx);
  return {p:ctx.p,document,get saved(){return saved;}};
 }
 for(const raw of [null,'{}','{"dark":"true"}','invalid']){
  const s=load(raw);assert.equal(s.p.get().dark,false);assert.equal(s.document.documentElement.dataset.theme,'light');
 }
 const s=load('{"tens":"T"}');s.p.set('dark',true);
 assert.equal(s.document.documentElement.dataset.theme,'dark');
 const restored=load(s.saved);assert.equal(restored.document.documentElement.dataset.theme,'dark');assert.equal(restored.p.get().tens,'T');
 restored.p.set('dark',false);assert.equal(load(restored.saved).document.documentElement.dataset.theme,'light');
 const failed=load(s.saved,true);failed.p.set('dark',false);assert.equal(failed.document.documentElement.dataset.theme,'light');assert.match(failed.p.error,/could not be saved/);
});
