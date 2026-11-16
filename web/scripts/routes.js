// The history index lets a cancelled Back restore the same entry without adding duplicates.
const Routes=(()=>{
  const paths={home:'/',setup:'/new-game',game:'/play',modes:'/study',simulation:'/simulation',equity:'/equity',rankings:'/hand-rankings'};
  function start({enter,guard}){
    const history=window.history,location=window.location;
    let index=Number.isInteger(history.state?.pocketIndex)?history.state.pocketIndex:0,current=location.pathname.replace(/\/+$/,'')||'/',restoring=false,pending=null,approved=false;
    if(current==='/dealing-prototype.html'||current==='/index.html')current='/';
    history.replaceState({pocketIndex:index},'',current);
    const screen=path=>Object.keys(paths).find(key=>paths[key]===path)||'notfound';
    function go(next,replace=false){
      const path=paths[next]||'/';
      if(!replace&&path===current)return;
      const commit=()=>{if(!replace)index++;current=path;history[replace?'replaceState':'pushState']({pocketIndex:index},'',path);enter(next);current=location.pathname;};
      guard(commit);
    }
    window.addEventListener('popstate',event=>{
      if(restoring){restoring=false;const request=pending;pending=null;if(request)guard(()=>{approved=true;history.go(request.delta);});return;}
      const nextIndex=event.state?.pocketIndex;
      if(!Number.isInteger(nextIndex))return;
      const path=location.pathname.replace(/\/+$/,'')||'/',delta=nextIndex-index;
      if(approved){approved=false;index=nextIndex;current=path;enter(screen(path));current=location.pathname;return;}
      if(!delta)return;
      restoring=true;pending={delta};history.go(-delta);
    });
    enter(screen(current));current=location.pathname;
    return {go};
  }
  return {start};
})();
