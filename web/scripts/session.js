var Match=(()=>{
  const copy=s=>JSON.parse(JSON.stringify(s));
  function start(names,deck,button=0,reveal='hold',guidance=true){
    if(!Array.isArray(names)||names.some(n=>typeof n!=='string'||!n.trim()||n.length>20)||!['hold','tap'].includes(reveal)||typeof guidance!=='boolean')throw Error('Enter valid names and game settings.');
    const game=Poker.create(names.length,deck,{button,manualShowdown:true});
    return {version:2,names:names.map(n=>n.trim()),reveal,guidance,hand:1,game,seed:seed(game),moves:[],phase:'dealing',peeking:false,voters:null,runChoice:null,voteMin:3};
  }
  const seed=g=>({deck:[...g.deck],stacks:g.betting.stacks.map((v,i)=>v+g.betting.paid[i]),button:g.button,sb:g.sb,bb:g.bb});
  function finishPublicRunout(s){
    if(s.game.stage==='showdown'&&s.game.betting.publicCards){s.game=Poker.showdown(s.game);s.moves.push({type:'showdown'});}
  }
  function route(s,publicPause=false){
    s.peeking=false;finishPublicRunout(s);
    if(s.game.betting.settled)s.phase='result';
    else if(s.game.stage==='showdown')s.phase='showdown';
    else if(s.runChoice===null&&Poker.canRunTwice(s.game)){
      s.voters=Array.from({length:s.names.length},(_,k)=>(s.game.button+1+k)%s.names.length).filter(i=>!s.game.betting.folded[i]);s.phase='handoff';
    }
    else if(publicPause)s.phase='public';
    else s.phase=s.game.betting.actor===null?'dealing':'handoff';
  }
  function command(state,c){
    const s=copy(state);
    if(c.type==='deal'){
      if(s.phase!=='dealing')throw Error('The table is not dealing.');
      s.game=Poker.next(s.game);s.moves.push({type:'deal'});if(s.game.log.at(-1).end)route(s,true);
    }else if(c.type==='continue'){
      if(s.phase!=='public')throw Error('Wait for the public pause.');route(s);
    }else if(c.type==='ready'){
      if(s.phase!=='handoff')throw Error('No handoff is waiting.');s.phase='turn';s.peeking=false;
    }else if(c.type==='peek'){
      if(s.phase!=='turn')throw Error('Acknowledge your turn before viewing cards.');s.peeking=!!c.show;
    }else if(c.type==='hide'){
      s.peeking=false;if(s.phase==='turn')s.phase='handoff';
    }else if(c.type==='bet'){
      if(s.phase!=='turn'||s.voters)throw Error('Acknowledge your betting turn first.');
      s.game=Poker.act(s.game,c.action,c.amount);s.moves.push({type:'bet',action:c.action,...(c.amount===undefined?{}:{amount:c.amount})});route(s,s.game.betting.actor===null);
    }else if(c.type==='vote'){
      const count=c.count??(typeof c.twice==='boolean'?(c.twice?2:1):null);
      if(s.phase!=='turn'||!s.voters||![1,2,3].includes(count))throw Error('Acknowledge your runout choice first.');
      s.peeking=false;s.voteMin=Math.min(s.voteMin??3,count);
      if(s.voteMin>1&&s.voters.length>1){s.voters.shift();s.phase='handoff';}
      else {s.runChoice=s.voteMin;if(s.runChoice>1){s.game=Poker.runBoards(s.game,s.runChoice);s.moves.push({type:'runs',count:s.runChoice});}s.voters=null;s.phase='public';}
    }else if(c.type==='showdown'){
      if(s.phase!=='showdown')throw Error('Wait for Showdown.');
      s.game=Poker.showdown(s.game);s.moves.push({type:'showdown'});route(s);
    }else if(c.type==='nextHand'){
      if(s.phase!=='result')throw Error('Finish this hand first.');
      s.game=Poker.nextHand(s.game,c.deck);s.seed=seed(s.game);s.moves=[];s.hand++;s.phase='dealing';s.peeking=false;s.voters=null;s.runChoice=null;s.voteMin=3;
    }else throw Error('Unknown game action.');
    return s;
  }
  function historyRounds(g){
    const streets=[{stage:'preflop',board:0},...g.log.filter(e=>e.kind==='board'&&e.end)];
    return streets.map(({stage,board})=>{
      const size={preflop:0,flop:3,turn:4,river:5}[stage];
      return {label:stage[0].toUpperCase()+stage.slice(1)+(g.twice&&size>g.shared?' · '+('ABC'[board]):''),actions:copy((g.betting?.history||[]).filter(a=>a.stage===stage&&a.board===board))};
    });
  }
  function view(s){
    const g=s.game,b=g.betting,actor=s.voters?s.voters[0]:b.actor,showdown=b.settled&&b.folded.filter(f=>!f).length>1,labels=Poker.seatPositions(g);
    const publicPots=(showdown||b.publicCards)?(b.settled?b.pots:Poker.potResults(g)):null;
    const e=g.log.at(-1),event=e?{kind:e.kind,player:e.player,board:e.board,stage:e.stage,card:e.kind==='board'?e.card:null,index:e.kind==='hole'?g.hands[e.player].length-1:e.kind==='board'?g.boards[e.board].length-1:0}:null;
    return {phase:s.phase,hand:s.hand,reveal:s.reveal,guidance:s.guidance,peeking:s.peeking,actor,voting:!!s.voters,button:g.button,boards:copy(g.boards),shared:g.shared,stage:g.stage,
      nextStreet:s.phase==='public'&&actor===null&&!g.queue.length?({0:'flop',3:'turn',4:'river'}[g.boards[g.board].length]||null):null,
      boardResults:g.boards.map((board,j)=>publicPots&&board.length===5?publicPots.map((pot,k)=>({pot:k,...copy(pot.shares[j])})):null),
      remaining:52-g.cursor,burns:g.burns.length,event,pot:b.pot,settled:b.settled,showdown,publicCards:b.publicCards,legal:s.phase==='turn'?Poker.legal(g):null,
      seats:s.names.map((name,i)=>({name,position:labels[i],seated:g.seated[i],stack:b.stacks[i],paid:b.paid[i],folded:b.folded[i],award:b.awards[i],returned:b.returned[i],publicCards:(showdown||b.publicCards)&&!b.folded[i],
        lastAction:b.actions[i]?.text||'',actionColor:b.actions[i]?.kind==='all'?'gold':b.actions[i]?.kind==='fold'?'red':b.actions[i]?.kind==='raise'?'blue':b.actions[i]?.kind==='call'&&b.paid[i]===b.currentBet?'green':'neutral',
        cards:g.hands[i].map(c=>((showdown||b.publicCards)&&!b.folded[i])||(s.phase==='turn'&&actor===i&&s.peeking)?c:null),
        categories:g.boards.map(board=>(showdown||b.publicCards)&&!b.folded[i]&&board.length>=3?Poker.rank([...g.hands[i],...board]).category:null),
        ...(showdown&&!b.folded[i]?{rankings:g.boards.map(board=>Poker.rank([...g.hands[i],...board]))}:{}),
        ...(s.guidance&&((showdown&&!b.folded[i])||(s.phase==='turn'&&actor===i&&s.peeking))?{guidance:g.boards.map(board=>Poker.guide(g.hands[i],board))}:{})})),
      pots:b.settled?copy(b.pots):[],history:copy(b.history),historyRounds:historyRounds(g),winner:b.settled&&b.stacks.filter(v=>v>0).length===1?b.stacks.findIndex(v=>v>0):null};
  }
  function save(s){
    return JSON.stringify({version:2,names:s.names,reveal:s.reveal,guidance:s.guidance,hand:s.hand,seed:s.seed,moves:s.moves,phase:s.phase,voters:s.voters,runChoice:s.runChoice,voteMin:s.voteMin});
  }
  function restore(text){
    if(typeof text!=='string'||text.length>1000000)throw Error('Invalid saved game.');
    const raw=JSON.parse(text);
    if(![1,2].includes(raw.version)||!Number.isSafeInteger(raw.hand)||raw.hand<1||!Array.isArray(raw.moves)||raw.moves.length>500||![null,1,2,3].includes(raw.runChoice)||!['dealing','public','turn','handoff','showdown','result'].includes(raw.phase))throw Error('Unsupported saved game.');
    const s=start(raw.names,raw.seed.deck,raw.seed.button,raw.reveal,raw.guidance===undefined?true:raw.guidance);
    s.game=Poker.create(s.names.length,raw.seed.deck,{...raw.seed,manualShowdown:true});
    if(raw.seed.stacks.reduce((a,b)=>a+b,0)!==s.names.length*20)throw Error('Saved chip totals do not match.');
    for(const move of raw.moves){
      if(s.game.betting.settled)throw Error('Saved action after settlement.');
      if(move.type==='deal')s.game=Poker.next(s.game);
      else if(move.type==='bet')s.game=Poker.act(s.game,move.action,move.amount);
      else if(move.type==='showdown')s.game=Poker.showdown(s.game);
      else if(move.type==='runs'&&[2,3].includes(move.count))s.game=Poker.runBoards(s.game,move.count);
      else if(move.type==='twice')s.game=Poker.runTwice(s.game);
      else throw Error('Invalid saved action.');
    }
    s.seed=copy(raw.seed);s.moves=copy(raw.moves);s.hand=raw.hand;s.runChoice=raw.runChoice;s.voters=raw.voters;
    // Old completed saves already awarded their pots; preserve that result in the new replay.
    if(raw.version===1&&raw.phase==='result'&&s.game.stage==='showdown'){s.game=Poker.showdown(s.game);s.moves.push({type:'showdown'});}
    if((s.runChoice>1?s.runChoice:1)!==s.game.boards.length)throw Error('Invalid saved runout.');
    s.voteMin=raw.voteMin??(raw.voters&&raw.voters.length<s.game.betting.folded.filter(f=>!f).length?2:3);
    if(![1,2,3].includes(s.voteMin))throw Error('Invalid saved vote minimum.');
    if(s.voters!==null){
      const eligible=Array.from({length:s.names.length},(_,k)=>(s.game.button+1+k)%s.names.length).filter(i=>!s.game.betting.folded[i]);
      if(s.voteMin===1||!Array.isArray(s.voters)||!s.voters.length||!Poker.canRunTwice(s.game)||s.runChoice!==null||JSON.stringify(s.voters)!==JSON.stringify(eligible.slice(-s.voters.length)))throw Error('Invalid saved vote.');
    }
    finishPublicRunout(s);
    s.phase=s.game.betting.settled?'result':s.game.stage==='showdown'?'showdown':s.voters?'handoff':s.game.betting.actor!==null?(raw.phase==='public'?'public':'handoff'):'public';
    return s;
  }
  return {start,command,view,save,restore,historyRounds};
})();
