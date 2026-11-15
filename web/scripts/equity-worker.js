importScripts('/scripts/poker.js','/scripts/equity.js','/scripts/random.js');
onmessage=({data})=>{
  try{
    const results=data.visible?Equity.simulation(data.visible,randomBelow):Equity.calculate(data.input,randomBelow);
    for(const result of results)postMessage({id:data.id,result});
  }catch(e){postMessage({id:data.id,error:e.message});}
};
