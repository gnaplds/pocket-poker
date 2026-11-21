const Preferences=(()=>{
 const key='pocket-poker-preferences-v1';
 const choices={positions:[true,false],dark:[true,false],tens:['10','T'],motion:['device','reduced'],speed:[.5,1,2,4],reveal:['hold','tap'],guidance:[true,false]};
 const values={positions:true,dark:false,tens:'10',motion:'device',speed:1,reveal:'hold',guidance:true};
 let error='',listeners=[];
 try{const saved=JSON.parse(localStorage.getItem(key)||'{}');for(const name of Object.keys(values))if(choices[name].includes(saved?.[name]))values[name]=saved[name];}catch{error='Preferences could not be loaded. Defaults are in use.';}
 const applyTheme=()=>{document.documentElement.dataset.theme=values.dark?'dark':'light';document.documentElement.dataset.positions=String(values.positions);};
 applyTheme();
 const reduced=()=>values.motion==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches;
 function set(name,value){
  if(!choices[name]?.includes(value))throw Error('Invalid preference');
  values[name]=value;
  if(name==='dark'||name==='positions')applyTheme();
  try{localStorage.setItem(key,JSON.stringify(values));error='';}catch{error='These preferences work for this visit, but could not be saved on this device.';}
  listeners.forEach(fn=>fn(name));
 }
 return {get:()=>({...values}),get error(){return error;},set,reduced,subscribe:fn=>listeners.push(fn)};
})();
