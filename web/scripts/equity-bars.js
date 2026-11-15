const EquityBars=(()=>{
  const duration=200;
  function percent(value,estimated=false){return (estimated?'≈ ':'')+(value>0&&value<.001?'&lt;0.1':(value*100).toFixed(1))+'%';}
  function html(value,estimated=false,board=''){
    const valid=Number.isFinite(value),amount=valid?Math.max(0,Math.min(100,value*100)):0;
    const text=valid?percent(value,estimated):'—',label=(board?board+' · ':'')+'Hand equity';
    const color=amount===0?'#929b96':`hsl(${amount<=50?amount*.8:40+(amount-50)*1.6} 65% 36%)`;
    return `<span class="equity-bar"><span class="equity-bar-label">${board?board+' · ':''}${text} equity</span><span class="equity-track" ${valid?`role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${amount}" aria-valuetext="${text}${estimated?' estimated':''}"`:`role="img" aria-label="${label} unavailable"`}><span class="equity-fill" data-equity-valid="${valid}" style="width:${amount}%;background-color:${color}"></span></span></span>`;
  }
  function update(el,markup){
    const old=[...el.querySelectorAll('.equity-fill')].map(fill=>({valid:fill.dataset.equityValid==='true',width:fill.style.width,backgroundColor:fill.style.backgroundColor}));
    el.innerHTML=markup;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    el.querySelectorAll('.equity-fill').forEach((fill,i)=>{
      if(old[i]?.valid&&fill.dataset.equityValid==='true')fill.animate([{width:old[i].width,backgroundColor:old[i].backgroundColor},{width:fill.style.width,backgroundColor:fill.style.backgroundColor}],{duration,easing:'ease-in-out'});
    });
  }
  return {html,percent,update};
})();
