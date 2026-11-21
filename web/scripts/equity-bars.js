const EquityBars=(()=>{
  const duration=200;
  function percent(value,estimated=false){return (estimated?'≈ ':'')+(value>0&&value<.001?'&lt;0.1':(value*100).toFixed(1))+'%';}
  function html(value,estimated=false,board=''){
    const valid=Number.isFinite(value),amount=valid?Math.max(0,Math.min(100,value*100)):0;
    const text=valid?percent(value,estimated):'—',label=(board?board+' · ':'')+'Hand equity';
    const color=amount===0?'#929b96':`hsl(${amount<=50?amount*.8:40+(amount-50)*1.6} 65% 36%)`;
    return `<span class="equity-bar"><span class="equity-bar-label">${board?board+' · ':''}${text} equity</span><span class="equity-track" ${valid?`role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${amount}" aria-valuetext="${text}${estimated?' estimated':''}"`:`role="img" aria-label="${label} unavailable"`}><span class="equity-fill" data-equity-valid="${valid}" style="transform:scaleX(${amount/100});background-color:${color}"></span></span></span>`;
  }
  function update(el,markup){
    const old=[...el.querySelectorAll('.equity-fill')].map(fill=>({valid:fill.dataset.equityValid==='true',transform:fill.style.transform,backgroundColor:fill.style.backgroundColor}));
    el.innerHTML=markup;
    if(Preferences.reduced())return;
    el.querySelectorAll('.equity-fill').forEach((fill,i)=>{
      if(old[i]?.valid&&fill.dataset.equityValid==='true')fill.animate([{transform:old[i].transform,backgroundColor:old[i].backgroundColor},{transform:fill.style.transform,backgroundColor:fill.style.backgroundColor}],{duration,easing:'cubic-bezier(.77,0,.175,1)'});
    });
  }
  return {html,percent,update};
})();
