// Frozen input/output traces from the accepted web rules, not a second native implementation.
const fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/../../prototypes/dealing-prototype.html','utf8');
const ctx=vm.createContext({});vm.runInContext(html.match(/<script id="poker-engine">([\s\S]*?)<\/script>/)[1],ctx);const P=ctx.Poker;
let seed=17;function random(n){seed=(seed*1664525+1013904223)>>>0;return seed%n;}
const fields={stage:'stage',stacks:'betting.stacks',paid:'betting.paid',total:'betting.total',actor:'betting.actor',pot:'betting.pot',awards:'betting.awards',boards:'boards',cursor:'cursor',button:'button',sb:'sb',bb:'bb'};
function projection(s){return Object.fromEntries(Object.entries(fields).map(([k,p])=>[k,p.split('.').reduce((v,key)=>v[key],s)??-1]));}
const cases=[];
for(let n=2;n<=8;n++)for(let round=0;round<3;round++){
 let deck=[...P.fullDeck()];for(let i=51;i>0;i--){let j=random(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
 const stacks=Array.from({length:n},(_,i)=>round===0?20:5+i*3);let s=P.create(n,deck,{stacks,manualShowdown:true});const steps=[];
 for(let k=0;k<200&&s.stage!=='complete';k++){
  let command;
  if(s.stage==='showdown'){command={type:'showdown'};s=P.showdown(s);}
  else if(s.betting.actor!==null){const l=P.legal(s);let action=l.owed?'call':'check',amount=0;
   if(random(9)===0)action='fold';else if(l.canRaise&&random(3)===0){action='raise';amount=random(2)?l.max:l.min;}
   command={type:'act',action,amount};s=P.act(s,action,amount);
  }else if(P.canRunTwice(s)&&round>0){command={type:'twice'};s=P.runTwice(s);}
  else{command={type:'deal'};s=P.next(s);}
  steps.push({command,expected:projection(s)});
 }
 cases.push({stacks,deck,steps});
}
fs.writeFileSync(__dirname+'/reference.json',JSON.stringify(cases));
