'use strict';
(async()=>{
  const destination=new URL('./?sync=1',location.href);
  destination.hash=location.hash;
  const link=document.getElementById('open');
  link.href=destination.href;
  document.getElementById('retry').onclick=()=>location.reload();
  try{
    const worker=navigator.serviceWorker;
    if(worker?.controller){
      const ready=new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(Error('timeout')),18000);
        worker.addEventListener('controllerchange',()=>{clearTimeout(timer);resolve();},{once:true});
        fetch('./index.html',{cache:'no-store'}).then(r=>r.text()).then(body=>{
          if(body.includes('id="pairRefresh"')){clearTimeout(timer);resolve();}
        }).catch(()=>{});
      });
      const update=worker.getRegistration().then(reg=>reg?.update());
      await Promise.all([ready,update]);
    }
    location.replace(destination.href);
  }catch{
    document.getElementById('progress').textContent='업데이트를 확인하지 못했어요. 인터넷 연결 후 다시 시도하거나 현재 달력을 여세요.';
    document.getElementById('retry').hidden=false;
  }
})();
