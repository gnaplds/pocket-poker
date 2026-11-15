const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('router preserves history indices across reload before a guarded Back',async()=>{
 const events={},browser=require('./history.cjs')('/',events);browser.history.replaceState({pocketIndex:0},'','/');browser.history.pushState({pocketIndex:1},'','/new-game');browser.history.pushState({pocketIndex:2},'','/play');
 let screen,confirm;
 const ctx=vm.createContext({window:{...browser,addEventListener:(type,fn)=>{events[type]=[fn];}}});
 vm.runInContext(fs.readFileSync(__dirname+'/../web/scripts/routes.js','utf8')+';globalThis.routes=Routes;',ctx);
 ctx.routes.start({enter:next=>screen=next,guard:commit=>{confirm=commit;}});
 assert.equal(browser.history.state.pocketIndex,2);
 browser.history.go(-1);await new Promise(setImmediate);assert.equal(browser.location.pathname,'/play');assert.equal(screen,'game');
 confirm();await new Promise(setImmediate);assert.equal(browser.location.pathname,'/new-game');assert.equal(screen,'setup');
});
