module.exports=function browserHistory(path='/',events={}){
 const entries=[{url:path,state:null}];let cursor=0;
 const location={pathname:path};
 const history={
  get state(){return entries[cursor].state;},
  replaceState(state,_,url){entries[cursor]={state,url};location.pathname=url;},
  pushState(state,_,url){entries.splice(++cursor);entries.push({state,url});location.pathname=url;},
  go(delta){const target=cursor+delta;if(target<0||target>=entries.length)return;cursor=target;location.pathname=entries[cursor].url;queueMicrotask(()=>{for(const fn of events.popstate||[])fn({state:entries[cursor].state});});}
 };
 return {location,history,entries};
};
