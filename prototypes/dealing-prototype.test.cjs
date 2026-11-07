const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(__dirname + '/dealing-prototype.html','utf8');
const ctx = vm.createContext({});
vm.runInContext(html.match(/<script id="poker-engine">([\s\S]*?)<\/script>/)[1],ctx);
const P = ctx.Poker;
const sessionScript=html.match(/<script id="poker-session">([\s\S]*?)<\/script>/);
if(sessionScript)vm.runInContext(sessionScript[1],ctx);
const M=ctx.Match;
const plain = value => JSON.parse(JSON.stringify(value));
const deck = () => '23456789TJQKA'.split('').flatMap(r => 'cdhs'.split('').map(s => r+s));
const fixedDeck = prefix => [...prefix.split(' '),...deck().filter(c=>!prefix.split(' ').includes(c))];
test('hand guidance explains trips and full houses with the actual defining cards and kickers',()=>{
 const g=P.guide(['7s','7h'],['7d','Kc','2s']);
 assert.equal(g.category,'Three of a kind');assert.match(g.description,/three sevens/i);
 assert.deepEqual(plain(g.cards.filter(c=>c.defining).map(c=>c.card)).sort(),['7d','7h','7s']);
 assert.deepEqual(plain(g.cards.filter(c=>!c.defining).map(c=>c.role)),['Kicker','Kicker']);
 assert.equal(g.cards.find(c=>c.card==='7s').source,'Hand');
 assert.equal(g.cards.find(c=>c.card==='7d').source,'Board');
 const f=P.guide(['Qs','Qh'],['Qd','8c','8s']);
 assert.equal(f.description,'Queens full of eights.');
 assert.equal(f.cards.filter(c=>c.defining).length,5);
 assert.deepEqual(plain(f.draws),[]);
});
function advance(s,n) { for(let i=0;i<n;i++) s=P.next(s); return s; }
test('whole-chip raise bounds include short all-ins and forbid uncontestable raises',()=>{
 let s=advance(P.create(2,deck(),true),4);
 assert.equal(P.legal(s).min,4);assert.equal(P.legal(s).max,20);
 s=P.act(s,'call');s=P.act(s,'check');s=advance(s,4);
 assert.equal(P.legal(s).min,2);assert.equal(P.legal(s).max,18);
 for(let amount=2;amount<=18;amount++)assert.doesNotThrow(()=>P.act(s,'raise',amount));
 for(const amount of [1,2.5,19])assert.throws(()=>P.act(s,'raise',amount));
 let short=advance(P.create(3,deck(),{stacks:[3,20,20]}),6);
 assert.equal(P.legal(short).min,3);assert.equal(P.legal(short).max,3);
 assert.doesNotThrow(()=>P.act(short,'raise',3));
 let locked=advance(P.create(2,deck(),{stacks:[2,20]}),4);
 assert.equal(P.legal(locked).canRaise,false);
});
test('every completed betting round waits for shared readiness before the next street',()=>{
 let s=M.start(['Alex','Blair'],deck(),0);
 for(let i=0;i<4;i++)s=M.command(s,{type:'deal'});
 for(const [street,count,before] of [['flop',4,0],['turn',2,3],['river',2,4]]){
  s=M.command(s,{type:'continue'});s=M.command(s,{type:'ready'});
  s=M.command(s,{type:'bet',action:street==='flop'?'call':'check'});
  assert.equal(M.view(s).phase,'handoff');
  s=M.command(s,{type:'ready'});s=M.command(s,{type:'peek',show:true});
  s=M.command(s,{type:'bet',action:'check'});
  assert.equal(M.view(s).phase,'public');assert.equal(M.view(s).nextStreet,street);
  assert.equal(M.view(s).boards[0].length,before);
  assert.ok(M.view(s).seats.every(p=>p.cards.every(c=>c===null)&&!p.guidance));
  assert.throws(()=>M.command(s,{type:'deal'}));
  s=M.restore(M.save(s));assert.equal(M.view(s).nextStreet,street);
  s=M.command(s,{type:'continue'});
  for(let i=0;i<count;i++)s=M.command(s,{type:'deal'});
 }
 s=M.command(s,{type:'continue'});s=M.command(s,{type:'ready'});
 s=M.command(s,{type:'bet',action:'check'});s=M.command(s,{type:'ready'});
 s=M.command(s,{type:'bet',action:'check'});assert.equal(M.view(s).phase,'showdown');
 const pending=M.view(s);
 assert.equal(pending.pot,4);assert.deepEqual(plain(pending.seats.map(p=>p.stack)),[18,18]);
 assert.ok(pending.seats.every(p=>p.cards.every(c=>c===null)&&!p.guidance&&!p.rankings&&p.award===0));
 assert.deepEqual(plain(pending.pots),[]);assert.equal(pending.winner,null);
 for(const type of ['deal','continue','nextHand'])assert.throws(()=>M.command(s,{type}));
 s=M.restore(M.save(s));assert.equal(M.view(s).phase,'showdown');
 s=M.command(s,{type:'showdown'});assert.equal(M.view(s).phase,'result');
 assert.equal(M.view(s).pot,0);assert.equal(M.view(s).seats.reduce((n,p)=>n+p.stack,0),40);
 assert.throws(()=>M.command(s,{type:'showdown'}));
 assert.deepEqual(plain(M.view(M.restore(M.save(s)))),plain(M.view(s)));
 const legacy=JSON.parse(M.save(s));legacy.version=1;legacy.moves=legacy.moves.filter(m=>m.type!=='showdown');
 assert.deepEqual(plain(M.view(M.restore(JSON.stringify(legacy)))),plain(M.view(s)));
 assert.deepEqual(plain(M.view(M.restore(M.save(M.restore(JSON.stringify(legacy)))))),plain(M.view(s)));
});
test('guidance separates simultaneous draws and names both gaps of a double gutshot',()=>{
 const g=P.guide(['6h','7h'],['8h','9c','Kh']);
 assert.equal(g.category,'High card');
 const straight=g.draws.find(d=>d.title==='Open-ended straight draw');
 assert.deepEqual(plain(straight.patterns.map(p=>p.missing)),['5','T']);
 assert.deepEqual(plain(straight.patterns[0].cards.map(c=>c.card)),['6h','7h','8h','9c']);
 const flush=g.draws.find(d=>d.title==='Flush draw');
 assert.match(flush.description,/one more heart/i);
 assert.deepEqual(plain(flush.patterns[0].cards.map(c=>c.card)).sort(),['6h','7h','8h','Kh']);
 const double=P.guide(['5s','Jd'],['7c','8h','9s']).draws[0];
 assert.equal(double.title,'Double-gutshot straight draw');
 assert.deepEqual(plain(double.patterns.map(p=>p.missing)),['6','T']);
 assert.deepEqual(plain(double.patterns[1].cards.map(c=>c.card)),['7c','8h','9s','Jd']);
});
test('guidance covers all made hands, preflop descriptions, and board-only ties',()=>{
 const cases=[
  ['As Jd','9c 6h 3s','High card',1],['As Ad','9c 6h 3s','One pair',2],
  ['As Ad','9c 9h 3s','Two pair',4],['As Ad','Ac 6h 3s','Three of a kind',3],
  ['As 2d','3c 4h 5s','Straight',5],['As Js','9s 6s 3s','Flush',5],
  ['As Ad','Ac 6h 6s','Full house',5],['As Ad','Ac Ah 3s','Four of a kind',4],
  ['5s 6s','7s 8s 9s','Straight flush',5],['As Ks','Qs Js Ts','Royal flush',5]
 ];
 for(const [hole,board,category,count] of cases){
  const h=hole.split(' '),b=board.split(' '),g=P.guide(h,b);
  assert.equal(g.category,category);assert.equal(g.cards.filter(c=>c.defining).length,count);
  assert.equal(P.rank(g.cards.map(c=>c.card)).score,P.rank([...h,...b]).score);
 }
 assert.match(P.guide(['As','2d'],['3c','4h','5s']).description,/Five-high/);
 assert.equal(P.guide(['Qs','Qh'],[]).description,'Pocket queens.');
 assert.equal(P.guide(['Jh','Ah'],[]).description,'Ace–jack, suited.');
 assert.equal(P.guide(['Ad','Jh'],[]).description,'Ace–jack, offsuit.');
 const board=['As','Kh','Qd','Jc','Ts'];
 const g=P.guide(['Ac','3d'],board);
 assert.equal(g.boardOnly,true);assert.ok(g.cards.every(c=>c.source==='Board'));
 assert.deepEqual(plain(g.cards.map(c=>c.card)),board);assert.deepEqual(plain(g.draws),[]);
 for(const [h,b] of [[['As','As'],[]],[['As','Kd'],['2c']],[['As','Kd'],['As','3d','4h']],[['Xs','Kd'],[]]])assert.throws(()=>P.guide(h,b));
});
test('draw guidance handles gaps, duplicate ranks and ace boundaries without suggesting weaker hands or river draws',()=>{
 for(const [hole,board,title,missing] of [
  ['6s 7d','9h Tc Kc','Gutshot straight draw',['8']],
  ['As 2d','3c 4h Ks','Straight draw',['5']],
  ['Js Qd','Kh Ac 2s','Straight draw',['T']],
  ['6s 7d','8c 9h 9s','Open-ended straight draw',['5','T']]
 ]){
  const g=P.guide(hole.split(' '),board.split(' '));
  assert.equal(g.draws[0].title,title);assert.deepEqual(plain(g.draws[0].patterns.map(p=>p.missing)),missing);
 }
 for(const [hole,board] of [
  ['Qs Kd','Ac 2h 3s'], // No wraparound straight.
  ['Ah Qh','2h 7c Kd'], // Backdoor flush only.
  ['6h 7h','8h 9h Kh'], // A straight would be weaker than this flush.
  ['Qs Qh','Qd 8c 8s'], // Full house.
  ['6h 7h','8h 9c Ks 2d 3c'] // River: no cards to come.
 ])assert.deepEqual(plain(P.guide(hole.split(' '),board.split(' ')).draws),[]);
 const made=P.guide(['6h','7h'],['8h','9h','Ts']);
 assert.equal(made.category,'Straight');assert.deepEqual(plain(made.draws.map(d=>d.title)),['Flush draw']);
});
test('an open-ended pattern remains open-ended when the turn also offers a higher gutshot completion',()=>{
 const g=P.guide(['3s','Td'],['5h','6c','7s','8d']);
 assert.equal(g.draws[0].title,'Open-ended straight draw');
 assert.deepEqual(plain(g.draws[0].patterns.map(p=>p.missing)),['4','9']);
 for(const pattern of g.draws[0].patterns)assert.deepEqual(plain(pattern.cards.map(c=>c.card)),['5h','6c','7s','8d']);
});
function flopMatch(guidance=true,customDeck=fixedDeck('6h 2c 7h 3d 4s 8h 9c Kh')){
 let s=M.start(['Alex','Blair'],customDeck,0,'hold',guidance);
 for(let i=0;i<4;i++)s=M.command(s,{type:'deal'});
 s=M.command(M.command(s,{type:'continue'}),{type:'ready'});
 s=M.command(s,{type:'bet',action:'call'});s=M.command(s,{type:'ready'});
 s=M.command(s,{type:'bet',action:'check'});s=M.command(s,{type:'continue'});
 for(let i=0;i<4;i++)s=M.command(s,{type:'deal'});
 return M.command(M.command(s,{type:'continue'}),{type:'ready'});
}
test('private guidance is exposed only with Peek and depends only on that player and the board',()=>{
 const turn=flopMatch();assert.ok(M.view(turn).seats.every(p=>!p.guidance));
 const s=M.command(turn,{type:'peek',show:true}),v=M.view(s);
 assert.equal(v.actor,1);assert.equal(v.seats[1].guidance[0].category,'High card');
 assert.equal(v.seats[1].guidance[0].draws.length,2);assert.equal(v.seats[0].guidance,undefined);
 const other=M.command(flopMatch(true,fixedDeck('6h As 7h Ad 5s 8h 9c Kh')),{type:'peek',show:true});
 assert.deepEqual(plain(M.view(other).seats[1].guidance),plain(v.seats[1].guidance));
 for(const hidden of [M.command(s,{type:'peek',show:false}),M.command(s,{type:'hide'}),M.command(s,{type:'bet',action:'check'}),M.restore(M.save(s))])assert.ok(M.view(hidden).seats.every(p=>!p.guidance));
 const off=M.command(flopMatch(false),{type:'peek',show:true});
 assert.ok(M.view(off).seats[1].cards.every(Boolean));assert.ok(M.view(off).seats.every(p=>!p.guidance));
});
test('guidance settings survive recovery, reject invalid settings, and default older saves to on',()=>{
 for(const enabled of [true,false]){
  const saved=M.save(flopMatch(enabled)),restored=M.restore(saved);
  assert.equal(M.view(restored).guidance,enabled);
  assert.ok(M.view(restored).seats.every(p=>!p.guidance));
  const peeked=M.command(M.command(restored,{type:'ready'}),{type:'peek',show:true});
  assert.equal(!!M.view(peeked).seats[1].guidance,enabled);
 }
 const old=JSON.parse(M.save(flopMatch(false)));delete old.guidance;
 assert.equal(M.view(M.restore(JSON.stringify(old))).guidance,true);
 for(const invalid of ['false',null,1,{}]){
  old.guidance=invalid;assert.throws(()=>M.restore(JSON.stringify(old)));
  assert.throws(()=>M.start(['A','B'],deck(),0,'hold',invalid));
 }
});
test('guidance is private during runout voting and public only for eligible hands on each completed board',()=>{
 for(const enabled of [true,false]){
  let s=M.start(['Alex','Blair','Casey'],deck(),0,'tap',enabled);
  for(let i=0;i<6;i++)s=M.command(s,{type:'deal'});
  s=M.command(M.command(s,{type:'continue'}),{type:'ready'});
  s=M.command(s,{type:'bet',action:'fold'});s=M.command(s,{type:'ready'});
  s=M.command(s,{type:'bet',action:'raise',amount:20});s=M.command(s,{type:'ready'});
  s=M.command(s,{type:'bet',action:'call'});
  while(M.view(s).voting){
   s=M.command(s,{type:'ready'});s=M.command(s,{type:'peek',show:true});
   const v=M.view(s);assert.equal(!!v.seats[v.actor].guidance,enabled);
   assert.ok(v.seats.every((p,i)=>i===v.actor||!p.guidance));
   s=M.command(s,{type:'vote',twice:true});assert.ok(M.view(s).seats.every(p=>!p.guidance));
  }
  for(let guard=0;M.view(s).phase!=='result'&&guard<60;guard++){
   assert.ok(M.view(s).seats.every(p=>!p.guidance));
   s=M.command(s,{type:M.view(s).phase==='public'?'continue':'deal'});
  }
  assert.equal(M.view(s).phase,'result');
  const v=M.view(s);assert.equal(v.phase,'result');assert.equal(v.seats[0].guidance,undefined);
  assert.ok(v.seats[0].cards.every(c=>c===null));
  for(const p of v.seats.slice(1)){
   assert.equal(!!p.guidance,enabled);assert.equal(p.rankings.length,2);
   if(enabled)for(let j=0;j<2;j++){
    assert.equal(p.guidance[j].category,p.rankings[j].category);
    assert.deepEqual(plain(p.guidance[j].draws),[]);
    assert.ok(p.guidance[j].cards.every(c=>[...p.cards,...v.boards[j]].includes(c.card)));
   }
  }
 }
 let fold=flopMatch();fold=M.command(fold,{type:'peek',show:true});fold=M.command(fold,{type:'bet',action:'fold'});
 assert.equal(M.view(fold).showdown,false);assert.ok(M.view(fold).seats.every(p=>!p.guidance));
});
test('two clockwise passes give the player left of the button the first card',()=>{
  const s=advance(P.create(3,deck()),6);
  assert.deepEqual(plain(s.hands),[['2h','3d'],['2c','2s'],['2d','3c']]);
  assert.equal(s.stage,'preflop');
  assert.equal(s.cursor,6);
  assert.equal(s.deck.length,52);
});
test('one full board consumes one burn before each street and never reuses a card',()=>{
  const s=advance(P.create(2,deck()),12);
  assert.deepEqual(plain(s.boards),[['3d','3h','3s','4d','4s']]);
  assert.deepEqual(plain(s.burns.map(x=>x.card)),['3c','4c','4h']);
  assert.equal(s.cursor,12);
  assert.equal(s.stage,'complete');
});
test('run twice after the flop shares exactly three cards and finishes A before B',()=>{
  let s=advance(P.create(2,deck()),8);
  s=P.runTwice(s);
  s=advance(s,8);
  assert.deepEqual(plain(s.boards),[['3d','3h','3s','4d','4s'],['3d','3h','3s','5d','5s']]);
  assert.deepEqual(plain(s.burns.map(x=>x.card)),['3c','4c','4h','5c','5h']);
  assert.equal(s.cursor,16);
  assert.equal(s.shared,3);
  assert.equal(s.stage,'complete');
});
test('ranking picks a full house from two triplets and returns its actual five cards',()=>{
  const r=P.rank(['As','Ah','Ad','Ks','Kh','Kd','2c']);
  assert.equal(r.category,'Full house');
  assert.deepEqual(plain(r.cards).map(c=>c[0]).sort(),['A','A','A','K','K']);
});
test('a royal flush on the board ties every player regardless of hole cards',()=>{
  const r=P.results([['2c','3c'],['Ac','Ah'],['Kd','Kh']],['Ts','Js','Qs','Ks','As']);
  assert.deepEqual(plain(r.winners),[0,1,2]);
  assert.ok(r.hands.every(h=>h.category==='Royal flush'));
});
test('all player counts and branch points preserve the deck and finish within 32 draws',()=>{
  for(let players=2;players<=8;players++) for(const [before,extra,shared] of [[0,16,0],[4,12,3],[6,10,4]]) {
    let s=advance(P.create(players,deck()),players*2+before);
    s=P.runTwice(s);
    for(let i=0;i<20&&s.stage!=='complete';i++) s=P.next(s);
    assert.equal(s.cursor,players*2+extra);
    assert.equal(s.stage,'complete');
    assert.equal(new Set(s.log.map(e=>e.card)).size,s.cursor);
    assert.deepEqual(plain(s.log.map(e=>e.card)),deck().slice(0,s.cursor));
    assert.deepEqual(plain(s.boards[0].slice(0,shared)),plain(s.boards[1].slice(0,shared)));
    assert.equal(s.boards[0].length,5); assert.equal(s.boards[1].length,5);
  }
});
test('a second run is unavailable mid-flop, after starting two runs, and after the river',()=>{
  const base=P.create(2,deck());
  assert.throws(()=>P.runTwice(base));
  assert.throws(()=>P.runTwice(advance(base,6)));
  assert.throws(()=>P.runTwice(P.runTwice(advance(base,4))));
  assert.throws(()=>P.runTwice(advance(base,12)));
});
test('rankings cover every category in order, ace-low straights, and flush kickers',()=>{
  const fixtures=[
    ['As Jd 9c 6h 3s','High card'],['As Ad 9c 6h 3s','One pair'],
    ['As Ad 9c 9h 3s','Two pair'],['As Ad Ac 6h 3s','Three of a kind'],
    ['As 2d 3c 4h 5s','Straight'],['As Js 9s 6s 3s','Flush'],
    ['As Ad Ac 6h 6s','Full house'],['As Ad Ac Ah 3s','Four of a kind'],
    ['9s Ts Js Qs Ks','Straight flush'],['Ts Js Qs Ks As','Royal flush']
  ];
  let last=-1;
  for(const [cards,category] of fixtures) {const r=P.rank(cards.split(' ')); assert.equal(r.category,category);assert.ok(r.score>last);last=r.score;}
  assert.ok(P.rank('2s 3h 4c 5s 6d'.split(' ')).score>P.rank('As 2d 3c 4h 5s'.split(' ')).score);
  assert.ok(P.rank('As Js 9s 6s 3s'.split(' ')).score>P.rank('Ah Th 9h 6h 3h'.split(' ')).score);
});
test('equal categories use kickers and suits do not break genuine ties',()=>{
  assert.deepEqual(plain(P.results([['As','Qd'],['Ah','Jd']],['Ac','7s','6d','3c','2h']).winners),[0]);
  assert.deepEqual(plain(P.results([['As','Qd'],['Ah','Qc']],['Ac','7s','6d','3c','2h']).winners),[0,1]);
});
test('invalid cards and duplicate-card scenarios are rejected at the public boundary',()=>{
  assert.throws(()=>P.create(9,deck()));
  assert.throws(()=>P.create(2,Array(52).fill('As')));
  assert.throws(()=>P.rank(['As','As','Kh','Qh','Jh']));
  assert.throws(()=>P.results([['As','Qd'],['As','Jd']],['Ac','7s','6d']));
});
test('the two-run walkthrough produces different winners on A and B',()=>{
  const first='Ks As Kh Ah 2c Ad Kd 7c 3c 2d 3d 4h 5c Kc 5d 6h'.split(' ');
  const fixed=[...first,...deck().filter(c=>!first.includes(c))];
  let s=P.runTwice(advance(P.create(2,fixed),8));
  s=advance(s,8);
  assert.deepEqual(plain(P.results(s.hands,s.boards[0]).winners),[0]);
  const b= P.results(s.hands,s.boards[1]);
  assert.deepEqual(plain(b.winners),[1]);
  assert.equal(b.hands[1].category,'Four of a kind');
});
test('the guided tie deal uses the board as both players best five',()=>{
  const first='2c Ac 3c Ah 4c Ts Js Qs 4d Ks 4h As'.split(' ');
  const s=advance(P.create(2,[...first,...deck().filter(c=>!first.includes(c))]),12);
  const r=P.results(s.hands,s.boards[0]);
  assert.deepEqual(plain(r.winners),[0,1]);
  assert.ok(r.hands.every(h=>h.category==='Royal flush'));
});
test('demo posts 1/2 blinds and starts six-handed action at UTG',()=>{
 const s=advance(P.create(6,deck(),true),12);
 assert.deepEqual(plain(P.positions(6)),['BTN','SB','BB','UTG','HJ / UTG+1','CO']);
 assert.deepEqual(plain(s.betting.stacks),[20,19,18,20,20,20]);
 assert.equal(s.betting.pot,3);assert.equal(s.betting.actor,3);
 assert.throws(()=>P.next(s),/betting/);
});
test('heads-up button calls, big blind retains its option, then BB acts first on flop',()=>{
 let s=advance(P.create(2,deck(),true),4);
 assert.equal(s.betting.actor,0);
 assert.throws(()=>P.act(s,'check'));
 s=P.act(s,'call');assert.equal(s.betting.actor,1);
 s=P.act(s,'check');assert.equal(s.betting.actor,null);
 s=advance(s,4);assert.equal(s.betting.actor,1);assert.equal(s.betting.pot,4);
 s=P.act(s,'raise',4);s=P.act(s,'call');
 assert.equal(s.betting.actor,null);assert.equal(s.betting.pot,12);
 assert.equal(s.betting.stacks.reduce((a,b)=>a+b,0)+s.betting.pot,40);
});
test('folding ends the hand and awards the pot without more cards',()=>{
 let s=advance(P.create(2,deck(),true),4);s=P.act(s,'fold');
 assert.equal(s.stage,'complete');assert.equal(s.betting.pot,0);
 assert.deepEqual(plain(s.betting.stacks),[19,21]);
 assert.deepEqual(plain(s.betting.awards),[0,2]);
 assert.deepEqual(plain(s.betting.returned),[0,1]);
 assert.equal(P.next(s).cursor,4);
});
test('river betting finishes before showdown; folded seats cannot win',()=>{
 let s=advance(P.create(3,deck(),true),6);
 s=P.act(s,'fold');s=P.act(s,'call');s=P.act(s,'check');
 for(const cards of [4,2,2]) {
  s=advance(s,cards);assert.notEqual(s.betting.actor,null);assert.notEqual(s.stage,'complete');
  s=P.act(s,'check');s=P.act(s,'check');
 }
 assert.equal(s.stage,'complete');assert.equal(s.betting.pot,0);
 assert.equal(s.betting.awards[0],0);
 assert.equal(s.betting.awards.reduce((a,b)=>a+b,0),4);
 assert.equal(s.betting.stacks.reduce((a,b)=>a+b,0),60);
});
test('two betting runouts require completed all-in calls and split the pot by board',()=>{
 const first='Ks As Kh Ah 2c Ad Kd 7c 3c 2d 3d 4h 5c Kc 5d 6h'.split(' ');
 let s=advance(P.create(2,[...first,...deck().filter(c=>!first.includes(c))],true),4);
 assert.equal(P.canRunTwice(s),false);
 s=P.act(s,'call');s=P.act(s,'check');s=advance(s,4);
 s=P.act(s,'raise',18);assert.equal(P.canRunTwice(s),false);
 s=P.act(s,'call');assert.equal(P.canRunTwice(s),true);
 s=advance(P.runTwice(s),8);
 assert.equal(s.stage,'complete');assert.equal(s.betting.pot,0);
 assert.deepEqual(plain(s.betting.stacks),[20,20]);
 assert.deepEqual(plain(s.betting.boardWinners),[[0],[1]]);
});
test('tied winners split an odd pot clockwise from the button; folded blind stays in pot',()=>{
 const first='2c 3c 4c 2d 3d 4d 5c Ts Js Qs 5d Ks 5h As'.split(' ');
 let s=advance(P.create(3,[...first,...deck().filter(c=>!first.includes(c))],true),6);
 s=P.act(s,'call');s=P.act(s,'fold');s=P.act(s,'check');
 for(const n of [4,2,2]){s=advance(s,n);s=P.act(s,'check');s=P.act(s,'check');}
 assert.deepEqual(plain(s.betting.awards),[2,0,3]);
 assert.deepEqual(plain(s.betting.stacks),[20,19,21]);
});
test('all-ins conserve all chips with 2–8 players, one board or two',()=>{
 for(let n=2;n<=8;n++) for(const twice of [false,true]){
  let s=advance(P.create(n,deck(),true),n*2);
  s=P.act(s,'raise',20);
  while(s.betting.actor!==null)s=P.act(s,'call');
  if(twice)s=P.runTwice(s);
  while(s.stage!=='complete')s=P.next(s);
  assert.equal(s.betting.pot,0);assert.equal(s.betting.stacks.reduce((a,b)=>a+b,0),n*20);
  assert.ok(s.betting.stacks.every(v=>Number.isInteger(v)&&v>=0));
 }
});
test('raises reopen action and reject amounts below the minimum or outside the stack',()=>{
 let s=advance(P.create(3,deck(),true),6);
 for(const target of [3,21,4.5,NaN])assert.throws(()=>P.act(s,'raise',target));
 s=P.act(s,'raise',6);s=P.act(s,'call');s=P.act(s,'raise',10);
 assert.equal(s.betting.actor,0);assert.equal(s.betting.lastRaise,4);
 s=P.act(s,'call');s=P.act(s,'call');assert.equal(s.betting.actor,null);
 assert.equal(s.betting.pot,30);assert.deepEqual(plain(s.betting.stacks),[10,10,10]);
});
test('unequal all-ins return excess and award the main and side pots to different players',()=>{
 let s=advance(P.create(3,fixedDeck('Ac Kc Qc Ah Kh Qh 3s 2d 4h 7s 5c 9d 6c Js'),{stacks:[20,5,12],button:0}),6);
 s=P.act(s,'raise',20);s=P.act(s,'call');s=P.act(s,'call');
 assert.equal(s.betting.pot,29);
 assert.deepEqual(plain(s.betting.stacks),[8,0,0]);
 assert.deepEqual(plain(s.betting.returned),[8,0,0]);
 assert.equal(P.canRunTwice(s),true);
 while(s.stage!=='complete')s=P.next(s);
 assert.deepEqual(plain(s.betting.stacks),[8,15,14]);
 assert.deepEqual(plain(s.betting.pots.map(p=>p.amount)),[15,14]);
 assert.deepEqual(plain(s.betting.awards),[0,15,14]);
});
test('a short all-in does not reopen a prior raiser, but cumulative full increases do',()=>{
 let s=advance(P.create(3,deck(),{stacks:[20,8,20]}),6);
 s=P.act(s,'raise',6);s=P.act(s,'raise',8);s=P.act(s,'call');
 assert.throws(()=>P.act(s,'raise',12),/reopen/);
 s=P.act(s,'call');assert.equal(s.betting.actor,null);
 let t=advance(P.create(4,deck(),{stacks:[8,10,20,20]}),8);
 t=P.act(t,'raise',6);t=P.act(t,'raise',8);t=P.act(t,'raise',10);t=P.act(t,'call');
 t=P.act(t,'raise',14);
 assert.equal(t.betting.currentBet,14);assert.equal(t.betting.actor,2);
});
test('a one-chip flop all-in requires a raise to three and does not reopen a prior check',()=>{
 let s=advance(P.create(3,deck(),{stacks:[20,20,3]}),6);
 s=P.act(s,'call');s=P.act(s,'call');s=P.act(s,'check');s=advance(s,4);
 s=P.act(s,'check');s=P.act(s,'raise',1);
 assert.equal(P.legal(s).min,3);assert.throws(()=>P.act(s,'raise',2));
 s=P.act(s,'call');assert.equal(P.legal(s).canRaise,false);
 assert.throws(()=>P.act(s,'raise',3),/reopen/);
});
test('the next hand preserves seats and stacks with a dead button after a small blind busts',()=>{
 let s=advance(P.create(4,fixedDeck('Qc Kc Jc Ac Qh Kh Jh Ah 3s 2d 4h 7s 5c 9d 6c Ts'),{stacks:[5,5,12,20]}),8);
 s=P.act(s,'raise',20);while(s.betting.actor!==null)s=P.act(s,'call');
 while(s.stage!=='complete')s=P.next(s);
 assert.deepEqual(plain(s.betting.stacks),[20,0,14,8]);
 s=P.nextHand(s,deck());
 assert.equal(s.button,1);assert.equal(s.sb,2);assert.equal(s.bb,3);
 assert.deepEqual(plain(s.betting.stacks),[20,0,13,6]);
 s=advance(s,6);assert.equal(s.hands[1].length,0);assert.equal(s.betting.actor,0);
});
test('private turns reveal only the acknowledged player and hide again before handoff',()=>{
 let s=M.start(['Alex','Blair','Casey'],deck(),0,'hold');
 for(let i=0;i<6;i++)s=M.command(s,{type:'deal'});
 s=M.command(s,{type:'continue'});
 assert.equal(M.view(s).phase,'handoff');
 assert.throws(()=>M.command(s,{type:'peek',show:true}));
 s=M.command(s,{type:'ready'});
 assert.deepEqual(plain(M.view(s).seats.map(p=>p.cards)),Array(3).fill([null,null]));
 s=M.command(s,{type:'peek',show:true});
 assert.deepEqual(plain(M.view(s).seats.map(p=>p.cards)),[['2h','3d'],[null,null],[null,null]]);
 assert.equal(M.view(s).deck,undefined);assert.equal(M.view(s).seats[0].rankings,undefined);
 s=M.command(s,{type:'bet',action:'call'});
 assert.equal(M.view(s).phase,'handoff');assert.equal(M.view(s).actor,1);
 assert.deepEqual(plain(M.view(s).seats.map(p=>p.cards)),Array(3).fill([null,null]));
});
test('runout voting keeps public cards visible and finishes automatically after both boards',()=>{
 let s=M.start(['Alex','Blair'],deck(),0);
 for(let i=0;i<4;i++)s=M.command(s,{type:'deal'});
 s=M.command(s,{type:'continue'});s=M.command(s,{type:'ready'});
 s=M.command(s,{type:'bet',action:'raise',amount:20});s=M.command(s,{type:'ready'});
 s=M.command(s,{type:'bet',action:'call'});
 assert.equal(M.view(s).voting,true);assert.equal(M.view(s).actor,1);
 assert.throws(()=>M.command(s,{type:'deal'}));
 s=M.command(s,{type:'ready'});s=M.command(s,{type:'vote',twice:true});
 assert.equal(M.view(s).phase,'handoff');assert.equal(M.view(s).boards.length,1);
 const once=M.command(M.command(s,{type:'ready'}),{type:'vote',twice:false});
 assert.equal(M.view(once).boards.length,1);assert.equal(M.view(once).phase,'public');
 s=M.command(M.command(s,{type:'ready'}),{type:'vote',twice:true});
 assert.equal(M.view(s).boards.length,2);
 for(let guard=0;M.view(s).phase!=='result'&&guard<60;guard++){
   assert.ok(M.view(s).seats.every(p=>p.cards.every(Boolean)&&!p.rankings&&!p.guidance&&p.award===0));
   const recovered=M.restore(M.save(s));
   assert.ok(M.view(recovered).seats.every(p=>p.cards.every(Boolean)));
   if(M.view(s).phase==='public')s=recovered;
   s=M.command(s,{type:M.view(s).phase==='public'?'continue':'deal'});
 }
 assert.equal(M.view(s).phase,'result');assert.equal(M.view(s).pot,0);
 assert.throws(()=>M.command(s,{type:'showdown'}));
 assert.deepEqual(plain(M.view(M.restore(M.save(s)))),plain(M.view(s)));
 const legacy=JSON.parse(M.save(s));legacy.moves.pop();legacy.phase='showdown';
 assert.deepEqual(plain(M.view(M.restore(JSON.stringify(legacy)))),plain(M.view(s)));
 assert.equal(M.view(s).phase,'result');assert.ok(M.view(s).seats.every(p=>p.cards.every(Boolean)));
 assert.equal(M.view(s).seats.reduce((n,p)=>n+p.stack,0),40);
});
test('save and resume preserve the hand but require a fresh private handoff, and reject corrupt moves',()=>{
 let s=M.start(['Alex','Blair'],deck(),0,'tap');
 for(let i=0;i<4;i++)s=M.command(s,{type:'deal'});
 s=M.command(M.command(s,{type:'continue'}),{type:'ready'});
 s=M.command(s,{type:'peek',show:true});
 let restored=M.restore(M.save(s));
 assert.equal(M.view(restored).phase,'handoff');
 assert.deepEqual(plain(M.view(restored).seats.map(p=>p.cards)),[[null,null],[null,null]]);
 restored=M.command(M.command(restored,{type:'ready'}),{type:'peek',show:true});
 assert.deepEqual(plain(M.view(restored).seats[0].cards),['2d','2s']);
 restored=M.command(restored,{type:'bet',action:'fold'});
 const once=M.view(M.restore(M.save(restored))),twice=M.view(M.restore(M.save(M.restore(M.save(restored)))));
 assert.deepEqual(plain(once),plain(twice));assert.deepEqual(plain(once.seats.map(p=>p.stack)),[19,21]);
 assert.ok(once.seats.every(p=>p.cards.every(c=>c===null)));
 const corrupt=JSON.parse(M.save(s));corrupt.moves.push({type:'bet',action:'raise',amount:999});
 assert.throws(()=>M.restore(JSON.stringify(corrupt)));
});
test('a covering stack still owes a call, while a short big blind keeps the normal bring-in',()=>{
 let s=advance(P.create(2,deck(),{stacks:[8,20]}),4);
 s=P.act(s,'raise',8);assert.equal(s.betting.actor,1);assert.equal(P.legal(s).call,6);
 assert.equal(P.canRunTwice(s),false);assert.equal(P.legal(s).canRaise,false);
 s=P.act(s,'call');assert.equal(P.canRunTwice(s),true);assert.equal(s.betting.stacks[1],12);
 const short=advance(P.create(3,deck(),{stacks:[20,20,1]}),6);
 assert.equal(P.legal(short).call,2);assert.equal(P.legal(short).min,4);
});
test('two boards divide each side pot independently, with odd chips going to board A',()=>{
 let s=advance(P.create(3,fixedDeck('Ac Kc Qc Ah Kh Qh 3s 2d 4h 7s 5c 9d 6c Js 2c Qd 8s Td 3c Qs 4c 7d'),{stacks:[20,5,12]}),6);
 s=P.act(s,'raise',20);s=P.act(s,'call');s=P.act(s,'call');s=P.runTwice(s);
 while(s.stage!=='complete')s=P.next(s);
 assert.deepEqual(plain(s.betting.stacks),[22,8,7]);
 assert.deepEqual(plain(s.betting.pots.map(p=>p.shares.map(x=>x.amount))),[[8,7],[7,7]]);
 assert.deepEqual(plain(s.betting.pots.map(p=>p.shares.map(x=>x.winners))),[[[1],[0]],[[2],[0]]]);
});
test('heads-up after a bust assigns the next big blind clockwise and preserves surviving seat identities',()=>{
 let s=advance(P.create(3,fixedDeck('Kc Qc Ac Kh Qh Ah 3s 2d 4h 7s 5c 9d 6c Js'),{stacks:[5,20,12]}),6);
 s=P.act(s,'raise',5);s=P.act(s,'raise',20);s=P.act(s,'call');while(s.stage!=='complete')s=P.next(s);
 assert.deepEqual(plain(s.betting.stacks),[15,22,0]);
 s=P.nextHand(s,deck());assert.equal(s.button,1);assert.equal(s.sb,1);assert.equal(s.bb,0);
 s=advance(s,4);assert.equal(s.betting.actor,1);assert.equal(s.hands[2].length,0);
 s=P.act(s,'call');s=P.act(s,'check');s=advance(s,4);assert.equal(s.betting.actor,0);
});
test('resuming a partial deal continues the original deck without drawing a card twice',()=>{
 let s=M.command(M.start(['Alex','Blair'],deck(),0),{type:'deal'});
 s=M.restore(M.save(s));assert.equal(M.view(s).phase,'public');assert.equal(M.view(s).remaining,51);
 s=M.command(s,{type:'continue'});for(let i=0;i<3;i++)s=M.command(s,{type:'deal'});
 s=M.command(M.command(s,{type:'continue'}),{type:'ready'});s=M.command(s,{type:'peek',show:true});
 assert.deepEqual(plain(M.view(s).seats[0].cards),['2d','2s']);assert.equal(M.view(s).remaining,48);
});
test('mixed legal actions over continuing games conserve chips, cards, and recoverable state',()=>{
 let seed=7631;const random=n=>{seed=(seed*1664525+1013904223)>>>0;return seed%n;};
 for(let n=2;n<=8;n++){
  let s=M.start(Array.from({length:n},(_,i)=>'Seat '+i),deck(),n-1);
  for(let step=0;step<350;step++){
   const v=M.view(s);assert.equal(v.seats.reduce((sum,p)=>sum+p.stack,0)+v.pot,n*20);
   assert.ok(v.seats.every(p=>Number.isInteger(p.stack)&&p.stack>=0));
   if(step%19===0){s=M.restore(M.save(s));continue;}
   if(v.phase==='result'){
    if(v.winner!==null)break;s=M.command(s,{type:'nextHand',deck:deck()});
   }else if(v.phase==='showdown')s=M.command(s,{type:'showdown'});
   else if(v.phase==='dealing')s=M.command(s,{type:'deal'});
   else if(v.phase==='public')s=M.command(s,{type:'continue'});
   else if(v.phase==='handoff')s=M.command(s,{type:'ready'});
   else if(v.voting)s=M.command(s,{type:'vote',twice:random(3)>0});
   else{
    const l=v.legal;
    s=M.command(s,l.canRaise&&random(3)===0?{type:'bet',action:'raise',amount:random(2)?l.min:l.max}:{type:'bet',action:l.owed?(random(5)===0?'fold':'call'):'check'});
   }
  }
 }
});

function matchWithStacks(stacks){
 const raw=JSON.parse(M.save(M.start(stacks.map((_,i)=>'Seat '+i),deck())));
 raw.seed.stacks=stacks;
 let s=M.restore(JSON.stringify(raw));s=M.command(s,{type:'continue'});
 for(let i=0;i<stacks.length*2;i++)s=M.command(s,{type:'deal'});
 return M.command(s,{type:'continue'});
}
function bet(s,action,amount){return M.command(M.command(s,{type:'ready'}),{type:'bet',action,amount});}
test('all-in reveal waits for owed decisions and side-pot betting, including a covering stack',()=>{
 let s=matchWithStacks([8,22,30]);
 s=bet(s,'raise',8);
 assert.ok(M.view(s).seats.every(p=>!p.publicCards&&p.cards.every(c=>c===null)));
 s=bet(s,'call');s=bet(s,'call');
 assert.equal(M.view(s).phase,'public');assert.equal(M.view(s).voting,false);
 assert.ok(M.view(s).seats.every(p=>p.cards.every(c=>c===null)));
 s=M.command(s,{type:'continue'});for(let i=0;i<4;i++)s=M.command(s,{type:'deal'});
 s=M.command(s,{type:'continue'});s=bet(s,'raise',14);
 assert.ok(M.view(s).seats.every(p=>p.cards.every(c=>c===null)));
 s=bet(s,'call');
 assert.equal(M.view(s).seats[2].stack,8);assert.equal(M.view(s).voting,true);
 assert.ok(M.view(s).seats.every(p=>p.publicCards&&p.cards.every(Boolean)&&!p.rankings&&!p.guidance));
 s=M.restore(M.save(s));assert.ok(M.view(s).seats.every(p=>p.cards.every(Boolean)));
 s=M.command(s,{type:'ready'});s=M.command(s,{type:'vote',twice:false});
 while(M.view(s).phase!=='result')s=M.command(s,{type:M.view(s).phase==='public'?'continue':'deal'});
 assert.equal(M.view(s).pot,0);
 assert.equal(M.view(s).pots.length,2);assert.equal(M.view(s).seats.reduce((n,p)=>n+p.stack,0),60);
 let fold=matchWithStacks([8,32]);fold=bet(fold,'raise',8);fold=bet(fold,'fold');
 assert.equal(M.view(fold).phase,'result');assert.ok(M.view(fold).seats.every(p=>!p.publicCards&&p.cards.every(c=>c===null)));
});

test('seat feedback follows confirmed actions, unmatched calls and new streets',()=>{
 let s=matchWithStacks([20,20,20]);
 assert.ok(M.view(s).seats.every(p=>p.lastAction===''&&p.actionColor==='neutral'));
 s=bet(s,'raise',4);
 assert.equal(M.view(s).seats[0].lastAction,'Raise to 4');assert.equal(M.view(s).seats[0].actionColor,'blue');
 s=bet(s,'call');assert.equal(M.view(s).seats[1].actionColor,'green');assert.equal(M.view(s).seats[0].actionColor,'blue');
 s=bet(s,'raise',8);
 assert.equal(M.view(s).seats[2].lastAction,'Raise to 8');assert.equal(M.view(s).seats[2].actionColor,'blue');
 assert.equal(M.view(s).seats[1].actionColor,'neutral');assert.equal(M.view(s).seats[1].lastAction,'Call 3');
 s=bet(s,'fold');assert.equal(M.view(s).seats[0].actionColor,'red');
 s=bet(s,'call');assert.equal(M.view(s).seats[1].actionColor,'green');
 s=M.restore(M.save(s));assert.equal(M.view(s).seats[1].actionColor,'green');
 s=M.command(s,{type:'continue'});s=M.command(s,{type:'deal'});
 assert.equal(M.view(s).seats[0].lastAction,'Fold');
 assert.ok(M.view(s).seats.slice(1).every(p=>p.actionColor==='neutral'&&p.lastAction===''));
 for(let i=0;i<3;i++)s=M.command(s,{type:'deal'});
 s=M.command(s,{type:'continue'});s=bet(s,'check');
 assert.equal(M.view(s).seats[1].lastAction,'Check');assert.equal(M.view(s).seats[1].actionColor,'neutral');
 s=bet(s,'raise',12);assert.equal(M.view(s).seats[2].actionColor,'gold');
 s=bet(s,'call');assert.equal(M.view(s).seats[1].actionColor,'gold');
 assert.match(M.view(s).seats[1].lastAction,/All-in/);
 while(M.view(s).voting)s=M.command(M.command(s,{type:'ready'}),{type:'vote',twice:false});
 s=M.command(s,{type:'continue'});s=M.command(s,{type:'deal'});
 assert.equal(M.view(s).seats[0].actionColor,'red');assert.ok(M.view(s).seats.slice(1).every(p=>p.actionColor==='gold'));
});

test('public runouts show complete-street categories and per-board side-pot winners before final payment',()=>{
 const raw=JSON.parse(M.save(M.start(['Alex','Blair','Casey'],fixedDeck('Ac Kc Qc Ah Kh Qh 3s 2d 4h 7s 5c 9d 6c Js 2c Qd 8s Td 3c Qs 4c 7d'),0,'hold',false)));
 raw.seed.stacks=[43,5,12];
 let s=M.restore(JSON.stringify(raw));s=M.command(s,{type:'continue'});
 for(let i=0;i<6;i++)s=M.command(s,{type:'deal'});
 s=M.command(s,{type:'continue'});s=bet(s,'raise',43);s=bet(s,'call');s=bet(s,'call');
 assert.ok(M.view(s).seats.every(p=>p.categories.every(c=>c===null)));
 while(M.view(s).voting)s=M.command(M.command(s,{type:'ready'}),{type:'vote',twice:true});
 s=M.command(s,{type:'continue'});
 for(let i=0;i<3;i++)s=M.command(s,{type:'deal'});
 assert.ok(M.view(s).seats.every(p=>p.categories[0]===null));
 s=M.command(s,{type:'deal'});
 assert.deepEqual(plain(M.view(s).seats.map(p=>p.categories)),[['One pair',null],['One pair',null],['One pair',null]]);
 assert.deepEqual(plain(M.view(s).boardResults),[null,null]);
 while(M.view(s).boards[0].length<5)s=M.command(s,{type:M.view(s).phase==='public'?'continue':'deal'});
 let v=M.view(s);assert.equal(v.phase,'public');assert.equal(v.pot,29);
 assert.deepEqual(plain(v.seats.map(p=>p.stack)),[31,0,0]);
 assert.deepEqual(plain(v.boardResults[0].map(p=>p.winners)),[[1],[2]]);assert.equal(v.boardResults[1],null);
 assert.deepEqual(plain(v.boardResults[0].map(p=>p.amount)),[8,7]);
 assert.ok(v.seats.every(p=>!p.guidance&&p.award===0));
 s=M.restore(M.save(s));assert.deepEqual(plain(M.view(s).boardResults),plain(v.boardResults));
 while(M.view(s).phase!=='result')s=M.command(s,{type:M.view(s).phase==='public'?'continue':'deal'});
 v=M.view(s);assert.deepEqual(plain(v.boardResults[1].map(p=>p.winners)),[[0],[0]]);
 assert.deepEqual(plain(v.seats.map(p=>p.stack)),[45,8,7]);
 assert.equal(v.seats[0].categories[1],'Four of a kind');
 assert.deepEqual(plain(M.view(M.restore(M.save(s))).seats.map(p=>p.stack)),[45,8,7]);
 const privateHand=M.view(flopMatch());
 assert.ok(privateHand.seats.every(p=>p.categories.every(c=>c===null)));assert.deepEqual(plain(privateHand.boardResults),[null]);
});

test('betting history groups blinds and actions by street, including reached no-bet runouts',()=>{
 let s=flopMatch();
 let rounds=M.view(s).historyRounds;
 assert.deepEqual(plain(rounds.map(r=>r.label)),['Preflop','Flop']);
 assert.deepEqual(plain(rounds[0].actions.map(a=>a.text)),['Small blind 1','Big blind 2','Call 1','Check']);
 assert.deepEqual(plain(rounds[1].actions),[]);
 s=M.command(s,{type:'bet',action:'raise',amount:18});s=bet(s,'call');
 while(M.view(s).voting)s=M.command(M.command(s,{type:'ready'}),{type:'vote',twice:true});
 while(M.view(s).phase!=='result')s=M.command(s,{type:M.view(s).phase==='public'?'continue':'deal'});
 rounds=M.view(s).historyRounds;
 assert.deepEqual(plain(rounds.map(r=>r.label)),['Preflop','Flop','Turn · A','River · A','Turn · B','River · B']);
 assert.equal(rounds[1].actions.length,2);assert.ok(rounds.slice(2).every(r=>r.actions.length===0));
 assert.deepEqual(plain(M.view(M.restore(M.save(s))).historyRounds),plain(rounds));
});

 test('seven and eight seats have positions, unique hole cards, and resumable games',()=>{
 for(const n of [7,8]){
  let s=M.start(Array.from({length:n},(_,i)=>'Player '+(i+1)),deck());
  for(let i=0;i<n*2;i++)s=M.command(s,{type:'deal'});
  const v=M.view(s);
  assert.equal(v.remaining,52-n*2);
  assert.equal(new Set(s.game.hands.flat()).size,n*2);
  assert.deepEqual(plain(v.seats.map(p=>p.position)),plain(P.positions(n)));
  assert.ok(v.seats.every(p=>p.position));
  assert.deepEqual(plain(M.view(M.restore(M.save(s)))),plain(v));
 }
 assert.throws(()=>P.create(9),/2–8/);
 });
