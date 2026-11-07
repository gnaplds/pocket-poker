const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/dealing-prototype.html','utf8'),ctx=vm.createContext({});
for(const id of ['poker-engine','equity-engine']){const script=html.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)</script>'));if(script)vm.runInContext(script[1],ctx);}
const E=ctx.Equity,plain=x=>JSON.parse(JSON.stringify(x));
const finish=input=>[...E.calculate(input)].at(-1);
test('river equity accounts for sole winners and three-way split shares',()=>{
 const r=finish({hands:[['As','Ad'],['Ks','Kd']],board:['2c','3h','7d','9s','Jc']});
 assert.equal(r.exact,true);assert.equal(r.done,true);assert.equal(r.completed,1);
 assert.deepEqual(plain(r.players),[{equity:1,win:1,tie:0},{equity:0,win:0,tie:0}]);
 const tie=finish({hands:[['2c','3c'],['4c','5c'],['6c','7c']],board:['As','Ks','Qs','Js','Ts']});
 for(const p of tie.players){assert.equal(p.equity,1/3);assert.equal(p.win,0);assert.equal(p.tie,1);}
});
test('exact remaining boards exclude known cards and count a two-out river correctly',()=>{
 const input={hands:[['As','Ad'],['Ks','Kd']],board:['2c','3h','7d','9s']};
 const r=finish(input);assert.equal(r.completed,44);assert.equal(r.players[0].win,42/44);assert.equal(r.players[1].win,2/44);
 const flop=finish({...input,board:input.board.slice(0,3)});assert.equal(flop.completed,990);
 for(const bad of [{hands:[['As','Ad'],['As','Kd']],board:input.board},{...input,board:['2c']},{...input,hands:[['As','?'],['Ks','Kd']]},{...input,hands:[['As','Ad']]}])assert.throws(()=>finish(bad));
});
test('preflop reports estimates through 20,000 samples and conserves multiway pot shares',()=>{
 let seed=9234;const randomBelow=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);};
 const updates=[...E.calculate({hands:[['As','Ah'],['Kd','Kc']],board:[]},randomBelow)],r=updates.at(-1);
 assert.equal(r.exact,false);assert.equal(r.completed,20000);assert.equal(r.done,true);assert.ok(updates.some(x=>!x.done&&x.players));
 assert.ok(r.players[0].equity>.80&&r.players[0].equity<.84);
 assert.ok(Math.abs(r.players.reduce((n,p)=>n+p.equity,0)-1)<1e-10);
 assert.throws(()=>[...E.calculate({hands:[['As','Ah'],['Kd','Kc']],board:[]},()=>-1)]);
});
test('eight-player exact equity splits a board-only royal flush and excludes all known cards',()=>{
 const hands=Array.from({length:8},(_,i)=>ctx.Poker.fullDeck().slice(i*2,i*2+2));
 const r=finish({hands,board:['As','Ks','Qs','Js','Ts']});
 for(const p of r.players){assert.equal(p.equity,.125);assert.equal(p.win,0);assert.equal(p.tie,1);}
 const flop=finish({hands,board:['As','Ks','Qs']});assert.equal(flop.completed,528);
 const turn=finish({hands,board:['As','Ks','Qs','Js']});assert.equal(turn.completed,32);
 assert.ok(Math.abs(flop.players.reduce((s,p)=>s+p.equity,0)-1)<1e-10);
});
test('exact results are invariant under reordered players and consistent suit changes',()=>{
 const hands=[['As','Ad'],['Ks','Kd'],['Qh','Jh']],board=['2c','3h','7d'];
 const original=finish({hands,board}),permuted=finish({hands:[hands[2],hands[0],hands[1]],board});
 for(const [i,j] of [[0,1],[1,2],[2,0]])for(const key of ['equity','win','tie'])assert.equal(original.players[i][key],permuted.players[j][key]);
 const suits={s:'h',h:'d',d:'c',c:'s'},swap=c=>c[0]+suits[c[1]];
 const renamed=finish({hands:hands.map(h=>h.map(swap)),board:board.map(swap)});
 for(let i=0;i<3;i++)for(const key of ['equity','win','tie'])assert.ok(Math.abs(original.players[i][key]-renamed.players[i][key])<1e-10);
});
