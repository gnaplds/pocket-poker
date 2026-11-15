var Equity=(()=>{
  function validate({hands,board,dead=[]}){
    if(!Array.isArray(hands)||hands.length<2||hands.length>8||hands.some(h=>!Array.isArray(h)||h.length!==2)||!Array.isArray(board)||![0,3,4,5].includes(board.length))throw Error('Enter two cards per player and a complete board stage.');
    if(!Array.isArray(dead))throw Error("Invalid unavailable cards.");
    const known=[...hands.flat(),...board,...dead];
    if(new Set(known).size!==known.length||known.some(c=>!Poker.fullDeck().includes(c)))throw Error('Use distinct valid cards.');
  }
  function* calculate(input,randomBelow){
    validate(input);const {hands,board,dead=[]}=input,deck=Poker.fullDeck().filter(c=>!hands.flat().includes(c)&&!board.includes(c)&&!dead.includes(c));
    if(deck.length<5-board.length)throw Error("Not enough cards for a board.");
    const exact=board.length>0,total=!exact?20000:board.length===3?deck.length*(deck.length-1)/2:board.length===4?deck.length:1;
    const sums=hands.map(()=>({equity:0,win:0,tie:0}));let completed=0;
    function add(finalBoard){
      const scores=hands.map(h=>Poker.rank([...h,...finalBoard]).score),best=Math.max(...scores),winners=scores.flatMap((score,i)=>score===best?[i]:[]);
      for(const i of winners){sums[i].equity+=1/winners.length;sums[i][winners.length===1?'win':'tie']++;}completed++;
    }
    const report=()=>({exact,done:completed===total,completed,total,players:(!exact||completed===total)?sums.map(p=>({equity:p.equity/completed,win:p.win/completed,tie:p.tie/completed})):null});
    if(!exact){
      for(let sample=0;sample<total;sample++){
        const available=[...deck],run=[];
        for(let k=0;k<5;k++){const j=randomBelow(available.length);if(!Number.isInteger(j)||j<0||j>=available.length)throw Error('Invalid random card selection.');run.push(available.splice(j,1)[0]);}
        add(run);if(completed%250===0&&completed<total)yield report();
      }
    }else if(board.length===5)add(board);
    else for(let i=0;i<deck.length;i++){
      if(board.length===4)add([...board,deck[i]]);
      else for(let j=i+1;j<deck.length;j++)add([...board,deck[i],deck[j]]);
      if(completed<total)yield report();
    }
    yield report();
  }
  function* simulation({hands,boards,folded,burns},randomBelow){
    if(!Array.isArray(boards)||boards.length<1||boards.length>2||!Array.isArray(folded)||folded.length!==hands.length||folded.some(f=>typeof f!=='boolean')||!Array.isArray(burns))throw Error('Invalid visible deal.');
    const seats=hands.flatMap((h,i)=>folded[i]?[]:[i]);
    if(!seats.length)throw Error('A hand needs an eligible player.');
    for(let j=0;j<boards.length;j++){
      const board=boards[j],dead=[...new Set([...hands.flatMap((h,i)=>folded[i]?h:[]),...burns,...boards.flat()])].filter(c=>!board.includes(c));
      validate({hands,board,dead:[...burns,...new Set(boards.flat().filter(c=>!board.includes(c)))]});
      if(seats.length===1){yield {exact:true,done:true,completed:1,total:1,players:[{equity:1,win:1,tie:0}],board:j,seats};continue;}
      for(const result of calculate({hands:seats.map(i=>hands[i]),board,dead},randomBelow))yield {...result,board:j,seats};
    }
  }
  return {validate,calculate,simulation};
})();
