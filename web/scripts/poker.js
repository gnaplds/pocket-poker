var Poker = (() => {
  const ranks='23456789TJQKA', suits='cdhs';
  const fullDeck=()=>[...ranks].flatMap(r=>[...suits].map(s=>r+s));
  function create(players,deck=fullDeck(),betting=false) {
    if(!Number.isInteger(players)||players<2||players>8) throw Error('Choose 2–8 players.');
    if(deck.length!==52 || new Set(deck).size!==52 || deck.some(c=>!fullDeck().includes(c))) throw Error('A deal needs 52 unique cards.');
    const options=typeof betting==='object'?betting:{},stacks=options.stacks||Array(players).fill(20),button=options.button??0;
    if(stacks.length!==players||stacks.some(v=>!Number.isSafeInteger(v)||v<0)||stacks.filter(v=>v>0).length<2||!Number.isInteger(button)||button<0||button>=players)throw Error('Invalid stacks or button.');
    const order=Array.from({length:players},(_,k)=>(button+1+k)%players).filter(i=>stacks[i]>0);
    const sb=options.sb??(order.length===2?button:order[0]),bb=options.bb??(order.length===2?order[0]:order[1]);
    if(![sb,bb].every(i=>Number.isInteger(i)&&i>=0&&i<players)||sb===bb||stacks[bb]===0)throw Error('Invalid blinds.');
    const state={players,button,sb,bb,manualShowdown:options.manualShowdown===true,seated:stacks.map(v=>v>0),deck:[...deck],cursor:0,hands:Array.from({length:players},()=>[]),boards:[[]],burns:[],log:[],stage:'dealing',board:0,twice:false,shared:0,
      queue:Array.from({length:order.length*2},(_,i)=>({kind:'hole',player:order[i%order.length],end:i===order.length*2-1,stage:'preflop'}))};
    if(betting) {
      state.betting={stacks:[...stacks],paid:Array(players).fill(0),total:Array(players).fill(0),returned:Array(players).fill(0),folded:stacks.map(v=>v===0),pending:[],actor:null,currentBet:2,lastRaise:2,pot:0,history:[],awards:Array(players).fill(0),settled:false,publicCards:false,actions:Array(players).fill(null)};
      for(const [i,blind] of [[sb,1],[bb,2]]) {
        const amount=Math.min(blind,stacks[i]);
        state.betting.stacks[i]-=amount;state.betting.paid[i]=amount;state.betting.total[i]=amount;state.betting.pot+=amount;
        if(amount&&state.betting.stacks[i]===0)state.betting.actions[i]={kind:'all',text:'All-in '+amount};
        if(amount)state.betting.history.push({player:i,stage:'preflop',board:0,text:(blind===1?'Small blind ':'Big blind ')+amount});
      }
    }
    return state;
  }
  function positions(n) {
    return {2:['BTN / SB','BB'],3:['BTN','SB','BB'],4:['BTN','SB','BB','UTG / CO'],5:['BTN','SB','BB','UTG / HJ','CO'],6:['BTN','SB','BB','UTG','HJ / UTG+1','CO'],7:['BTN','SB','BB','UTG','UTG+1','HJ','CO'],8:['BTN','SB','BB','UTG','UTG+1','UTG+2','HJ','CO']}[n];
  }
  function nextHand(s,deck) {
    // shortcut: fixed seats have no joins or rebuys; revisit blind movement before supporting either.
    if(!s.betting?.settled)throw Error('Finish this hand first.');
    const stacks=s.betting.stacks,alive=stacks.flatMap((v,i)=>v>0?[i]:[]);
    if(alive.length<2)throw Error('The game has a winner.');
    const bb=Array.from({length:s.players},(_,k)=>(s.bb+1+k)%s.players).find(i=>stacks[i]>0);
    const button=alive.length===2?alive.find(i=>i!==bb):s.sb,sb=alive.length===2?button:s.bb;
    return create(s.players,deck,{stacks,button,sb,bb,manualShowdown:s.manualShowdown});
  }
  function seatPositions(s) {
    const labels=s.seated.map(v=>v?'':'Out');
    labels[s.button]='BTN';labels[s.sb]=s.seated.filter(Boolean).length===2?'BTN / SB':'SB';labels[s.bb]='BB';
    const rest=Array.from({length:s.players},(_,k)=>(s.bb+1+k)%s.players).filter(i=>s.seated[i]&&!labels[i]);
    const extra={1:['UTG / CO'],2:['UTG / HJ','CO'],3:['UTG','HJ / UTG+1','CO'],4:['UTG','UTG+1','HJ','CO'],5:['UTG','UTG+1','UTG+2','HJ','CO']}[rest.length]||[];
    rest.forEach((i,k)=>labels[i]=extra[k]);return labels;
  }
  function openRound(s) {
    const b=s.betting;
    b.actedAt=Array(s.players).fill(null);
    if(s.stage!=='preflop'){b.paid.fill(0);b.currentBet=0;b.lastRaise=2;}
    b.pending=b.stacks.map((chips,i)=>chips>0&&!b.folded[i]);
    if(b.pending.filter(Boolean).length<2){
      b.currentBet=Math.max(...b.paid.filter((_,i)=>!b.folded[i]));
      b.pending=b.pending.map((v,i)=>v&&b.paid[i]<b.currentBet);
    }
    const active=s.hands.filter(h=>h.length===2).length;
    const first=s.stage==='preflop'?(active===2?s.button:(s.bb+1)%s.players):(s.button+1)%s.players;
    b.actor=Array.from({length:s.players},(_,k)=>(first+k)%s.players).find(i=>b.pending[i])??null;
  }
  function legal(s) {
    const b=s.betting,i=b?.actor;if(i===null||i===undefined)return null;
    const owed=Math.max(0,b.currentBet-b.paid[i]),max=b.paid[i]+b.stacks[i];
    const reopened=b.actedAt[i]===null||b.currentBet-b.actedAt[i]>=b.lastRaise;
    const canRaise=reopened&&max>b.currentBet&&b.stacks.some((v,j)=>j!==i&&!b.folded[j]&&v>0);
    const min=Math.min(max,b.currentBet+b.lastRaise);
    return {owed,call:Math.min(owed,b.stacks[i]),min,max,canRaise,reopened};
  }
  function act(state,action,target) {
    const s=JSON.parse(JSON.stringify(state)), b=s.betting, i=b?.actor;
    if(!b||i===null||b.settled) throw Error('No player is waiting to act.');
    const owed=b.currentBet-b.paid[i];
    let amount=0,text=action==='fold'?'Fold':action==='check'?'Check':action;
    if(action==='fold') b.folded[i]=true;
    else if(action==='check') {if(owed>0) throw Error('Call or fold when facing a bet.');}
    else if(action==='call') {if(owed===0)throw Error('Nothing to call.');amount=Math.min(owed,b.stacks[i]);text='Call '+amount;}
    else if(action==='raise') {
      if(!legal(s).reopened)throw Error('A short all-in did not reopen your raise.');
      if(!legal(s).canRaise)throw Error('No opponent can contest another raise.');
      const max=b.paid[i]+b.stacks[i],min=b.currentBet+b.lastRaise;
      if(!Number.isInteger(target)||target<=b.currentBet||target>max||(target<min&&target!==max)) throw Error('Enter a legal raise-to amount (or your full stack).');
      amount=target-b.paid[i];
      const increment=target-b.currentBet;
      text=(b.currentBet?'Raise to ':'Bet ')+target;
      b.lastRaise=Math.max(b.lastRaise,increment);b.currentBet=target;
      b.pending=b.stacks.map((chips,j)=>chips>0&&!b.folded[j]);
    } else throw Error('Unknown betting action.');
    b.stacks[i]-=amount;b.paid[i]+=amount;b.total[i]+=amount;b.pot+=amount;b.pending[i]=false;
    b.actions[i]={kind:b.stacks[i]===0&&amount>0?'all':action,text:b.stacks[i]===0&&amount>0?'All-in · '+b.paid[i]+' total':text};
    b.actedAt[i]=b.currentBet;
    b.history.push({player:i,stage:s.stage,board:s.board,text:text+(b.stacks[i]===0?' · all-in':'')});
    b.actor=Array.from({length:s.players},(_,k)=>(i+1+k)%s.players).find(j=>b.pending[j]&&!b.folded[j]&&b.stacks[j]>0)??null;
    if(b.actor!==null&&b.stacks.filter((v,j)=>v>0&&!b.folded[j]).length===1&&b.paid[b.actor]>=b.currentBet)b.actor=null;
    const alive=b.folded.flatMap((fold,j)=>fold?[]:[j]);
    if(alive.length===1)b.actor=null;
    finishRound(s);
    return s;
  }
  function finishRound(s) {
    const b=s.betting;if(b.actor!==null)return;
    const sorted=b.total.map((v,i)=>({v,i})).sort((a,c)=>c.v-a.v),excess=sorted[0].v-sorted[1].v;
    if(excess>0){const i=sorted[0].i;b.total[i]-=excess;b.paid[i]-=excess;b.stacks[i]+=excess;b.returned[i]+=excess;b.pot-=excess;}
    const alive=b.folded.flatMap((f,i)=>f?[]:[i]);
    if(alive.length>1&&alive.filter(i=>b.stacks[i]>0).length<=1)b.publicCards=true;
    if(alive.length===1)settle(s);
    else if(s.boards.every(board=>board.length===5)){if(s.manualShowdown)s.stage='showdown';else settle(s);}
  }
  function showdown(state){
    if(state.stage!=='showdown'||state.betting?.settled)throw Error('Finish all betting and boards before Showdown.');
    const s=JSON.parse(JSON.stringify(state));settle(s);return s;
  }
  function potResults(s) {
    const b=s.betting,alive=b.folded.flatMap((f,i)=>f?[]:[i]),pots=[];let previous=0;
    for(const level of [...new Set(b.total)].filter(v=>v>0).sort((a,c)=>a-c)){
      const contributors=b.total.flatMap((v,i)=>v>=level?[i]:[]),eligible=contributors.filter(i=>!b.folded[i]);
      const pot={amount:(level-previous)*contributors.length,eligible,shares:[]};previous=level;
      const boards=alive.length===1?[[]]:s.boards;
      pot.shares=boards.map((board,j)=>{
        if(alive.length>1&&board.length!==5)return null;
        const ranked=eligible.map(i=>({i,score:alive.length===1?0:rank([...s.hands[i],...board]).score}));
        const best=Math.max(...ranked.map(r=>r.score));
        const winners=ranked.filter(r=>r.score===best).map(r=>r.i).sort((a,c)=>(a-s.button-1+s.players)%s.players-(c-s.button-1+s.players)%s.players);
        const share=Math.floor(pot.amount/boards.length)+(j<pot.amount%boards.length?1:0);
        const awards=winners.map((i,k)=>({player:i,amount:Math.floor(share/winners.length)+(k<share%winners.length?1:0)}));
        return {amount:share,winners,awards};
      });
      pots.push(pot);
    }
    return pots;
  }
  function settle(s) {
    const b=s.betting;if(b.settled)return;
    b.pots=potResults(s);b.boardWinners=s.boards.map(()=>[]);
    for(const pot of b.pots)pot.shares.forEach((share,j)=>{
      share.awards.forEach(({player,amount})=>{b.awards[player]+=amount;b.stacks[player]+=amount;});
      b.boardWinners[j]=[...new Set([...b.boardWinners[j],...share.winners])];
    });
    b.pot=0;b.actor=null;b.settled=true;s.stage='complete';
  }
  function next(state) {
    const s=JSON.parse(JSON.stringify(state));
    if(s.betting?.actor!==null && s.betting?.actor!==undefined) throw Error('Finish betting before dealing.');
    if(s.stage==='showdown')throw Error('Tap Showdown to finish this hand.');
    if(s.stage==='complete') return s;
    if(!s.queue.length) {
      if(s.betting)s.betting.actions=s.betting.actions.map(a=>['fold','all'].includes(a?.kind)?a:null);
      const size=s.boards[s.board].length;
      const stage=size===0?'flop':size===3?'turn':'river';
      const count=size===0?3:1;
      s.queue=[{kind:'burn',board:s.board,stage},...Array.from({length:count},(_,i)=>({kind:'board',board:s.board,stage,end:i===count-1}))];
    }
    const event=s.queue.shift();
    const card=s.deck[s.cursor++];
    if(event.kind==='hole') s.hands[event.player].push(card);
    else if(event.kind==='burn') s.burns.push({card,board:event.board,stage:event.stage});
    else s.boards[event.board].push(card);
    s.log.push({...event,card,position:s.cursor});
    if(event.end) {
      s.stage=event.stage;
      if(event.stage==='river') {
        if(s.twice && s.board===0) { s.board=1; s.stage=s.shared===0?'preflop':s.shared===3?'flop':'turn'; }
        else s.stage=s.betting?'river':'complete';
      }
    }
    if(event.end&&s.betting) {openRound(s);finishRound(s);}
    return s;
  }
  function canRunTwice(s) { return !s.twice && !s.queue.length && ['preflop','flop','turn'].includes(s.stage) && (!s.betting || (s.betting.actor===null && s.betting.folded.filter(f=>!f).length>1 && s.betting.stacks.filter((chips,i)=>!s.betting.folded[i]&&chips>0).length<=1)); }
  function runTwice(state) {
    if(!canRunTwice(state)) throw Error('Choose two runs after the hole cards, flop, or turn.');
    const s=JSON.parse(JSON.stringify(state));
    s.twice=true; s.shared=s.boards[0].length; s.boards.push([...s.boards[0]]);
    return s;
  }
  function rank(cards) {
    if(cards.length<5 || cards.length>7 || new Set(cards).size!==cards.length || cards.some(c=>!fullDeck().includes(c))) throw Error('Rank 5–7 unique valid cards.');
    let best=null;
    for(let a=0;a<cards.length-4;a++) for(let b=a+1;b<cards.length-3;b++)
    for(let c=b+1;c<cards.length-2;c++) for(let d=c+1;d<cards.length-1;d++) for(let e=d+1;e<cards.length;e++) {
      const hand=[cards[a],cards[b],cards[c],cards[d],cards[e]];
      const values=hand.map(c=>ranks.indexOf(c[0])+2).sort((a,b)=>b-a);
      const groups=[...new Set(values)].map(v=>[values.filter(x=>x===v).length,v]).sort((a,b)=>b[0]-a[0]||b[1]-a[1]);
      const flush=hand.every(c=>c[1]===hand[0][1]);
      const straight=groups.length===5?(values[0]-values[4]===4?values[0]:values.join(',')==='14,5,4,3,2'?5:0):0;
      let cat, kick;
      if(flush&&straight) {cat=8;kick=[straight];}
      else if(groups[0][0]===4) {cat=7;kick=groups.map(g=>g[1]);}
      else if(groups[0][0]===3&&groups[1][0]===2) {cat=6;kick=groups.map(g=>g[1]);}
      else if(flush) {cat=5;kick=values;}
      else if(straight) {cat=4;kick=[straight];}
      else if(groups[0][0]===3) {cat=3;kick=groups.map(g=>g[1]);}
      else if(groups[0][0]===2&&groups[1][0]===2) {cat=2;kick=groups.map(g=>g[1]);}
      else if(groups[0][0]===2) {cat=1;kick=groups.map(g=>g[1]);}
      else {cat=0;kick=values;}
      const score=[cat,...kick,...Array(5-kick.length).fill(0)].reduce((n,v)=>n*15+v,0);
      if(!best||score>best.score) best={score,category:cat===8&&straight===14?'Royal flush':['High card','One pair','Two pair','Three of a kind','Straight','Flush','Full house','Four of a kind','Straight flush'][cat],cards:hand.sort((a,b)=>ranks.indexOf(b[0])-ranks.indexOf(a[0]))};
    }
    return best;
  }
  function guide(hole,board) {
    const available=[...hole,...board];
    if(hole.length!==2||![0,3,4,5].includes(board.length)||new Set(available).size!==available.length||available.some(c=>!fullDeck().includes(c)))throw Error('Guidance needs two distinct hole cards and a completed street.');
    const singular=['two','three','four','five','six','seven','eight','nine','ten','jack','queen','king','ace'];
    const plural=['twos','threes','fours','fives','sixes','sevens','eights','nines','tens','jacks','queens','kings','aces'];
    const name=(c,many=false)=>(many?plural:singular)[ranks.indexOf(c[0])],cap=s=>s[0].toUpperCase()+s.slice(1);
    const describe=(cards,defining,role)=>cards.map(c=>({card:c,source:hole.includes(c)?'Hand':'Board',defining:defining.includes(c),role:role(c)}));
    if(!board.length){
      const sorted=[...hole].sort((a,b)=>ranks.indexOf(b[0])-ranks.indexOf(a[0]));
      return {category:'Starting hand',description:sorted[0][0]===sorted[1][0]?`Pocket ${name(sorted[0],true)}.`:`${cap(name(sorted[0]))}–${name(sorted[1])}, ${sorted[0][1]===sorted[1][1]?'suited':'offsuit'}.`,cards:[],boardOnly:false,draws:[]};
    }
    let best=rank(available);const boardOnly=board.length===5&&rank(board).score===best.score;
    if(boardOnly)best=rank(board);
    const groups=[...new Set(best.cards.map(c=>c[0]))].map(r=>best.cards.filter(c=>c[0]===r)).sort((a,b)=>b.length-a.length||ranks.indexOf(b[0][0])-ranks.indexOf(a[0][0]));
    const cat=Math.floor(best.score/15**5),high=singular[Math.floor(best.score/15**4)%15-2];
    const descriptions=[`${cap(high)} high.`,`Pair of ${name(groups[0][0],true)}.`,`${cap(name(groups[0][0],true))} and ${name(groups[1][0],true)}.`,`Three ${name(groups[0][0],true)}.`,`${cap(high)}-high straight — five consecutive ranks.`,`${cap(high)}-high flush — five cards of one suit.`,`${cap(name(groups[0][0],true))} full of ${name(groups[1]?.[0]||groups[0][0],true)}.`,`Four ${name(groups[0][0],true)}.`,best.category==='Royal flush'?'Ace-high straight flush — ten through ace of one suit.':`${cap(high)}-high straight flush — five consecutive ranks of one suit.`];
    const defining=cat===0?[best.cards[0]]:[1,2,3,7].includes(cat)?groups.filter(g=>g.length>1).flat():best.cards;
    const cards=describe(best.cards,defining,c=>!defining.includes(c)?'Kicker':cat===0?'High card':groups.find(g=>g.includes(c)).length===3?'Three of a kind':groups.find(g=>g.includes(c)).length===2?'Pair':'Makes hand');
    const draws=[];
    if(board.length<5&&cat<4){
      const patterns=[];
      for(let top=5;top<=14;top++){
        const sequence=Array.from({length:5},(_,i)=>top-4+i).map(v=>v===1?'A':ranks[v-2]);
        const missing=sequence.filter(r=>!available.some(c=>c[0]===r));
        if(missing.length!==1)continue;
        const support=sequence.filter(r=>r!==missing[0]).map(r=>available.find(c=>c[0]===r));
        patterns.push({missing:missing[0],inside:sequence.indexOf(missing[0])>0&&sequence.indexOf(missing[0])<4,cards:describe(support,support,()=> 'Draw card')});
      }
      const open=patterns.find(p=>patterns.some(q=>p.missing!==q.missing&&p.cards.every(c=>q.cards.some(d=>c.card===d.card))));
      const paths=open?patterns.filter(p=>p.cards.every(c=>open.cards.some(d=>c.card===d.card))):[...new Map(patterns.map(p=>[p.missing,p])).values()];
      if(paths.length){
        const sameSupport=paths.length===2&&paths[0].cards.every(c=>paths[1].cards.some(d=>c.card===d.card));
        const title=paths.length===2?(sameSupport?'Open-ended straight draw':'Double-gutshot straight draw'):paths[0].inside?'Gutshot straight draw':'Straight draw';
        draws.push({title,description:`${paths.map(p=>cap(name(p.missing))).join(' or ')} completes a straight.`,patterns:paths.map(({inside,...p})=>p)});
      }
    }
    if(board.length<5&&cat<5){
      for(const [suit,label] of Object.entries({c:'club',d:'diamond',h:'heart',s:'spade'})){
        const support=available.filter(c=>c[1]===suit);
        if(support.length===4)draws.push({title:'Flush draw',description:`One more ${label} completes a flush.`,patterns:[{missing:suit,cards:describe(support,support,()=> 'Draw card')}]});
      }
    }
    return {category:best.category,description:descriptions[cat],cards,boardOnly,draws};
  }
  function results(hands,board) {
    const cards=[...hands.flat(),...board];
    if(hands.length<2||hands.length>8||hands.some(h=>h.length!==2)||![3,4,5].includes(board.length)||new Set(cards).size!==cards.length) throw Error('Results need distinct hole cards and a completed street.');
    const ranked=hands.map(h=>rank([...h,...board]));
    const max=Math.max(...ranked.map(h=>h.score));
    return {hands:ranked,winners:ranked.flatMap((h,i)=>h.score===max?[i]:[])};
  }
  return {create,next,fullDeck,runTwice,canRunTwice,rank,guide,results,positions,act,legal,nextHand,seatPositions,showdown,potResults};
})();
