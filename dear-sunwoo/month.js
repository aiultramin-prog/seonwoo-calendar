'use strict';
(() => {
  const C = window.MoonCalendar;
  const $ = id => document.getElementById(id);
  const native = window.webkit?.messageHandlers?.moon;
  const storageKey = 'moonletter.calendar.1';
  const week = ['일','월','화','수','목','금','토'];
  let state=C.fresh(), raw=null, ready=false, damaged=false, selected=C.today(), view='calendar', filter='open', edit=null, toastTimer;
  let mutations=Promise.resolve(), notificationUpdates=Promise.resolve();
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const md=d=>Number(d.slice(5,7))+'월 '+Number(d.slice(8))+'일';
  const fullDay=d=>md(d)+' '+week[C.dow(d)]+'요일';
  const fmtTime=e=>e.time || '종일';
  const id=()=>crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
  function announce(msg){$('toast').textContent=msg;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
  function msg(node,text){node.textContent=text;node.hidden=!text;}
  function readRaw(){return native?native.postMessage({action:'read'}):Promise.resolve(localStorage.getItem(storageKey));}
  async function read(){const next=await readRaw();raw=next;state=next===null?C.fresh():C.readState(JSON.parse(next));damaged=false;ready=true;}
  async function refresh(){
    try{await read();render();}
    catch {ready=false;damaged=true;render();announce('저장한 기록을 열 수 없어요. 설정에서 원본을 내보내거나 백업을 가져오세요.');}
  }
  async function persist(next,base){
    const val=JSON.stringify(C.readState(next));
    if(val.length>3000000)throw Error('기기 저장 한도를 넘었어요. 백업 후 일정을 정리해 주세요.');
    if(native)await native.postMessage({action:'write',expected:base,value:val});
    else {
      if(localStorage.getItem(storageKey)!==base)throw Error('다른 창에서 일정이 바뀌었어요. 다시 열고 수정해 주세요.');
      localStorage.setItem(storageKey,val);
    }
    raw=val;state=next;ready=true;damaged=false;
  }
  function change(transform,{repair=false,expectedRaw}={}) {
    const commit=async()=>{
      if(!ready&&!repair)throw Error('현재 기기 저장소를 열 수 없어요.');
      const apply=async()=>{
        const latest=await readRaw();
        if(expectedRaw!==undefined && latest!==expectedRaw){await refresh();throw Error('편집 중 기록이 바뀌었어요. 닫고 다시 열어 주세요.');}
        const source=repair?C.fresh():latest===null?C.fresh():C.readState(JSON.parse(latest));
        const next=transform(source);
        await persist(next,latest);
      };
      if(!native && navigator.locks)await navigator.locks.request('moonletter-write',apply);
      else await apply();
      render();syncAlarms();
    };
    const pending=mutations.then(commit);mutations=pending.catch(()=>{});return pending;
  }
  function syncAlarms(){
    if(!native || !ready)return;
    notificationUpdates=notificationUpdates.catch(()=>{}).then(async()=>{
      const result=await native.postMessage({action:'sync',reminders:C.plannedReminders(state.events)});
      if(result==='denied' && state.events.some(e=>e.reminder>=0))announce('일정은 저장됐어요. 잠금 화면 알림은 아이폰 설정에서 허용해 주세요.');
    }).catch(()=>announce('알림을 갱신하지 못했어요. 앱을 다시 열어 주세요.'));
  }
  async function allowAlarms(){
    if(!native)return false;
    try{return (await native.postMessage({action:'permission'}))===true;}catch{return false;}
  }
  function empty(parent,head,detail){
    const box=el('div','empty');const icon=el('span','little-letter');icon.setAttribute('aria-hidden','true');
    box.append(icon,el('strong','',head));if(detail)box.append(el('small','',detail));parent.append(box);
  }
  function forDay(d){return state.events.filter(e=>C.occurs(e,d)).sort((a,b)=>a.time.localeCompare(b.time)||a.title.localeCompare(b.title,'ko'));}
  function selectDay(d){if(!C.validDate(d))return;selected=d;render();}
  function row(parent,e,d,showDate=false){
    const done=e.done.includes(d), shell=el('div','item'+(done?' checked':''));
    const button=el('button','check');button.type='button';button.setAttribute('aria-label',(done?'완료 취소: ':'완료: ')+e.title);button.setAttribute('aria-pressed',String(done));button.append(el('span','',done?'✓':''));
    button.addEventListener('click',async()=>{try{button.disabled=true;await change(s=>{const obj=s.events.find(x=>x.id===e.id);if(!obj || !C.occurs(obj,d))throw Error('일정이 바뀌었어요. 다시 확인해 주세요.');if(done)obj.done=obj.done.filter(x=>x!==d);else if(!obj.done.includes(d))obj.done.push(d);return s;});}catch(err){button.disabled=false;announce(err.message);}});
    const open=el('button','item-main');open.type='button';open.append(el('b','',e.title),el('small','',[(showDate?md(d):''),fmtTime(e),C.categories[e.category],e.repeat==='none'?'':C.repeats[e.repeat]].filter(Boolean).join(' · ')));
    open.addEventListener('click',()=>openEditor(e.id,d));shell.append(button,open,el('span','color-dot '+e.category));parent.append(shell);
  }
  function renderHeader(){
    $('yearLabel').textContent=Number(selected.slice(0,4))+'년';
    $('monthNumber').textContent=Number(selected.slice(5,7));
    const inWeek=view==='week'||view==='tasks';
    for(const [name,delta] of [['prev',-1],['next',1]]){
      const dest=inWeek?C.add(selected,delta*7):C.shiftMonth(selected,delta);
      $(name).disabled=!C.validDate(dest);
      $(name).setAttribute('aria-label',(delta<0?'이전 ':'다음 ')+(inWeek?'주':'달'));
    }
  }
  function renderCalendar(){
    const first=selected.slice(0,7)+'-01', last=C.add(C.shiftMonth(first,1),-1);
    const start=C.add(first,-C.dow(first)), cells=Math.ceil((C.dow(first)+Number(last.slice(8)))/7)*7;
    const today=C.today(), grid=$('grid');
    grid.replaceChildren();grid.className='month-grid weeks-'+cells/7;
    for(let i=0;i<cells;i++){
      const d=C.add(start,i);
      if(d.slice(0,7)!==first.slice(0,7)){grid.append(el('span','blank-day'));continue;}
      const list=forDay(d),holiday=C.holidays[d];
      const button=el('button','day'+(d===today?' is-today':'')+(d===selected?' selected':'')+(holiday?' holiday':C.dow(d)===0?' sun':C.dow(d)===6?' sat':''));
      button.type='button';button.dataset.date=d;
      button.setAttribute('aria-label',[d,holiday,list.length?'일정 '+list.length+'개':''].filter(Boolean).join(' '));
      if(d===today)button.setAttribute('aria-current','date');
      button.append(el('b','',String(Number(d.slice(8)))));
      const lines=[];
      if(holiday)lines.push([holiday,'holiday-name']);
      for(const e of list)lines.push([(e.time?e.time+' ':'')+e.title,e.done.includes(d)?'done':'']);
      const limit=lines.length>3?2:3;
      for(const [label,cls] of lines.slice(0,limit)){const line=el('span','day-line '+cls+(lines.length<=2?' wrap':''),label);line.setAttribute('aria-hidden','true');button.append(line);}
      if(lines.length>3)button.append(el('span','day-line more','+'+(lines.length-limit)));
      button.onclick=()=>openDay(d);grid.append(button);
    }
    $('monthMemoText').textContent=state.memos[today]||'오늘 메모 쓰기';
  }
  function renderDay(){
    $('dayTitle').textContent=fullDay(selected);
    $('dayMeta').textContent=[C.lunar(selected),C.holidays[selected]].filter(Boolean).join(' · ');
    const list=forDay(selected), box=$('dayList');box.replaceChildren();
    if(list.length)list.forEach(e=>row(box,e,selected));else empty(box,'등록된 일정이 없어요','');
    $('dayMemo').textContent=state.memos[selected]?'이날 메모 보기':'이날 메모 쓰기';
  }
  function openDay(d){
    if(!C.validDate(d))return;selected=d;render();
    if(!$('daySheet').open)$('daySheet').showModal();
  }
  function renderWeek(){
    const start=C.add(selected,-C.dow(selected)), end=C.add(start,6);
    $('weekPeriod').textContent=md(start)+' – '+md(end);
    const box=$('weekList');box.replaceChildren();
    for(let i=0;i<7;i++){
      const day=C.add(start,i);if(!C.validDate(day))continue;
      const section=el('section','week-row'),list=forDay(day);
      const heading=el('button','date-open',fullDay(day)+(C.holidays[day]?' · '+C.holidays[day]:''));
      heading.onclick=()=>openDay(day);section.append(heading);
      if(list.length)list.forEach(e=>row(section,e,day));else section.append(el('p','meta','일정 없음'));
      box.append(section);
    }
  }
  function memoRow(parent,d){
    const item=el('div','memo-row'),button=el('button','');
    button.append(el('small','meta',d+' · '+week[C.dow(d)]+'요일'),el('span','memo-excerpt',state.memos[d]));
    button.onclick=()=>openMemo(d);item.append(button);parent.append(item);
  }
  function renderMemos(){
    const box=$('memoList');box.replaceChildren();
    const dates=Object.keys(state.memos).sort().reverse();
    if(!dates.length)empty(box,'저장한 메모가 없어요','');
    for(const d of dates)memoRow(box,d);
  }
  function renderTasks(){
    const parent=$('taskList');parent.replaceChildren();const now=C.today(), end=C.add(now,13);
    $('taskPeriod').textContent=filter==='open'?'지난 단발 일정과 오늘부터 14일간의 미완료 일정':'최근 완료한 회차 최대 100개';
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
    let pairs=[];
    for(const e of state.events){
      if(filter==='done'){for(const d of e.done)if(C.occurs(e,d))pairs.push({e,d});}
      else{
        if(e.repeat==='none' && e.date<now && C.occurs(e,e.date) && !e.done.includes(e.date))pairs.push({e,d:e.date});
        let d=C.nextDate(e,now,true);
        while(d && d<=end){pairs.push({e,d});d=C.nextDate(e,C.add(d,1),true);}
      }
    }
    pairs.sort((a,b)=>(filter==='done'?b.d.localeCompare(a.d):a.d.localeCompare(b.d))||a.e.time.localeCompare(b.e.time));
    if(filter==='done')pairs=pairs.slice(0,100);
    let group='';for(const {e,d} of pairs){if(group!==d){parent.append(el('h3','group-date',fullDay(d)));group=d;}row(parent,e,d);}
    if(!pairs.length)empty(parent,filter==='done'?'완료한 일정이 없어요':'남은 일정이 없어요',filter==='open'?'새 약속을 추가하면 여기에 모여요.':'일정 옆 동그라미를 누르면 완료돼요.');
  }
  function renderSearch(){
    const q=$('query').value.trim().toLocaleLowerCase('ko'),box=$('searchList');box.replaceChildren();
    const events=q?state.events.filter(e=>(e.title+' '+e.note).toLocaleLowerCase('ko').includes(q)):[];
    const memos=q?Object.keys(state.memos).filter(d=>state.memos[d].toLocaleLowerCase('ko').includes(q)).sort().reverse():[];
    $('resultCount').textContent=q?'검색 결과 '+(events.length+memos.length)+'개':'';
    if(q&&!events.length&&!memos.length){empty(box,'검색 결과가 없어요','');return;}
    for(const e of events){const d=C.nextDate(e,C.today())||C.nextDate(e,e.date);if(d)row(box,e,d,true);}
    for(const d of memos)memoRow(box,d);
  }
  function render(){
    for(const name of ['calendar','week','tasks','memos','search'])$(name+'Page').hidden=view!==name;
    document.querySelectorAll('[data-tab]').forEach(b=>{
      if(b.dataset.tab===view||(view==='tasks'&&b.dataset.tab==='week'))b.setAttribute('aria-current','page');
      else b.removeAttribute('aria-current');
    });
    renderHeader();renderDay();
    if(view==='calendar')renderCalendar();
    if(view==='week')renderWeek();
    if(view==='tasks')renderTasks();
    if(view==='memos')renderMemos();
    if(view==='search')renderSearch();
    $('add').disabled=!ready;
  }
  function adjustForm(){
    const hasTime=!!$('timeInput').value;$('reminderInput').disabled=!hasTime;
    $('alarmHint').textContent=!hasTime?'시간을 정하면 알림을 선택할 수 있어요.':native?'저장할 때 아이폰에 알림을 예약해요.':'저장 후 일정을 다시 열고 ‘캘린더 파일’을 내보내세요. 알림은 파일을 가져온 캘린더 앱에서 설정할 수 있어요.';
    $('repeatInput').disabled=!!(edit?.series && $('scopeInput').value==='one');
  }
  function openEditor(eventId=null,date=selected){
    if(!ready){announce('설정에서 저장 상태를 먼저 확인해 주세요.');return;}
    const existing=state.events.find(e=>e.id===eventId)||null;
    const e=existing||{title:'',date,time:'',category:'personal',repeat:'none',note:'',reminder:-1};
    edit={id:existing?.id||null,occurrence:date,series:!!existing && e.repeat!=='none',base:raw};
    $('editorTitle').textContent=existing?'일정 수정':'일정 추가';
    $('titleInput').value=e.title;$('dateInput').value=existing?date:e.date;$('timeInput').value=e.time;
    $('categoryInput').value=e.category;$('repeatInput').value=e.repeat;$('noteInput').value=e.note;$('reminderInput').value=e.reminder;
    $('scopeInput').value='one';$('scopeRow').hidden=!edit.series;$('deleteEvent').hidden=!existing;$('exportEvent').hidden=!existing;
    msg($('parseHint'),'');msg($('formError'),'');adjustForm();$('editor').showModal();
    if(!existing)$('titleInput').focus();
  }
  $('scopeInput').addEventListener('change',()=>{const e=state.events.find(x=>x.id===edit?.id);if(!e)return;$('dateInput').value=$('scopeInput').value==='series'?e.date:edit.occurrence;adjustForm();});
  $('timeInput').addEventListener('input',adjustForm);
  $('quickParse').addEventListener('click',()=>{try{const o=C.parsePhrase($('titleInput').value);$('titleInput').value=o.title;$('dateInput').value=o.date;$('timeInput').value=o.time;if(!$('repeatInput').disabled)$('repeatInput').value=o.repeat;if(o.reminder!==undefined)$('reminderInput').value=String(o.reminder);adjustForm();msg($('parseHint'),'날짜, 시간과 알림을 확인하고 저장하세요.');}catch(err){msg($('parseHint'),err.message);}});
  $('editForm').addEventListener('submit',async ev=>{
    ev.preventDefault();if(!edit)return;
    const current=edit, one=current.series && $('scopeInput').value==='one', f={id:current.id||id(),title:$('titleInput').value,date:$('dateInput').value,time:$('timeInput').value,category:$('categoryInput').value,repeat:one?'none':$('repeatInput').value,note:$('noteInput').value,reminder:$('timeInput').value?Number($('reminderInput').value):-1,done:[],skip:[]};
    try{
      C.cleanEvent(f);$('save').disabled=true;
      if(native && f.reminder>=0)await allowAlarms();
      await change(s=>{
        const i=s.events.findIndex(e=>e.id===current.id);
        if(current.id && i<0)throw Error('삭제된 일정이에요. 다시 열어 주세요.');
        if(i<0)s.events.push(f);
        else if(one){const old=s.events[i];old.skip=[...new Set([...old.skip,current.occurrence])];if(old.done.includes(current.occurrence))f.done=[f.date];f.id=id();s.events.push(f);}
        else {const old=s.events[i];if(old.date===f.date && old.repeat===f.repeat){f.done=old.done;f.skip=old.skip;}else if(old.repeat==='none' && f.repeat==='none' && old.done.includes(old.date)){f.done=[f.date];}s.events[i]=f;}
        return s;},{expectedRaw:current.base});
      $('editor').close();edit=null;selectDay(f.date);announce(!native && f.reminder>=0?'저장했어요. 알림은 일정의 캘린더 파일로 추가하세요.':'일정을 저장했어요.');
    }catch(err){msg($('formError'),err.message||'저장하지 못했어요.');}finally{$('save').disabled=false;}
  });
  function confirmChoice(title,detail,label){
    return new Promise(resolve=>{const d=$('confirmDialog');$('confirmTitle').textContent=title;$('confirmText').textContent=detail;$('acceptConfirm').textContent=label;d.returnValue='';d.addEventListener('close',()=>resolve(d.returnValue==='yes'),{once:true});d.showModal();$('cancelConfirm').focus();});
  }
  $('cancelConfirm').onclick=()=>$('confirmDialog').close('no');$('acceptConfirm').onclick=()=>$('confirmDialog').close('yes');
  $('deleteEvent').onclick=async()=>{
    const current=edit;if(!current?.id)return;const one=current.series && $('scopeInput').value==='one';
    const yes=await confirmChoice(one?'이번 일정만 삭제할까요?':current.series?'전체 반복 일정을 삭제할까요?':'이 일정을 삭제할까요?',one?'다른 날짜의 반복 일정은 계속 표시됩니다.':'백업 파일에 보관한 기록은 유지됩니다.','삭제');if(!yes)return;
    try{await change(s=>{const e=s.events.find(x=>x.id===current.id);if(!e)throw Error('일정을 찾지 못했어요.');if(one)e.skip=[...new Set([...e.skip,current.occurrence])];else s.events=s.events.filter(x=>x.id!==current.id);return s;},{expectedRaw:current.base});$('editor').close();edit=null;announce('삭제했어요.');}catch(err){msg($('formError'),err.message);}
  };
  async function sendFile(name,type,contents){
    if(native){await native.postMessage({action:'share',name,contents});return;}
    const blob=new Blob([contents],{type});
    const file=new File([blob],name,{type});
    if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file]});return;}
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  $('exportEvent').onclick=async()=>{const e=state.events.find(x=>x.id===edit?.id);if(!e)return;try{await sendFile('moonletter-event.ics','text/calendar',C.ical(e));}catch(err){if(err.name!=='AbortError')msg($('formError'),'파일을 내보내지 못했어요.');}};
  $('backup').onclick=async()=>{try{const v=await readRaw();await sendFile('moonletter-'+C.today()+'.json','application/json',v??JSON.stringify(C.fresh()));}catch(err){if(err.name!=='AbortError')msg($('settingsMsg'),'백업을 내보내지 못했어요.');}};
  $('restore').onclick=()=>$('importInput').click();
  $('importInput').onchange=async()=>{
    const file=$('importInput').files[0];$('importInput').value='';if(!file)return;
    try{if(file.size>8000000)throw Error('8MB 이하의 달편지 백업을 선택해 주세요.');const restored=C.readState(JSON.parse(await file.text()));
      const repair=damaged, base=await readRaw();
      const yes=await confirmChoice('백업을 가져올까요?',repair?'읽을 수 없는 현재 기록을 백업의 일정 '+restored.events.length+'개로 교체합니다.':'일정 '+restored.events.length+'개와 메모 '+Object.keys(restored.memos).length+'개를 확인했어요. 이 기기에 없는 기록만 추가합니다.','가져오기');if(!yes)return;
      let count=0;await change(s=>{const seen=new Set(s.events.map(e=>e.id));const add=restored.events.filter(e=>!seen.has(e.id));count=add.length;s.events.push(...add);for(const [d,t] of Object.entries(restored.memos))if(!Object.hasOwn(s.memos,d)){s.memos[d]=t;count++;}return s;},{repair,expectedRaw:base});msg($('settingsMsg'),'기록 '+count+'개를 가져왔어요.');
    }catch(err){msg($('settingsMsg'),err instanceof SyntaxError?'달편지 JSON 파일을 선택해 주세요.':err.message);}
  };
  $('settingsOpen').onclick=()=>{msg($('settingsMsg'),damaged?'저장된 기록을 읽지 못했습니다. 백업으로 복구할 수 있어요.':'');$('settings').showModal();};
  $('settingsAlarm').textContent=native?'현재 시각 이후 가까운 알림 최대 60개를 예약해요. 앱을 다시 열거나 일정을 바꾸면 새로 예약합니다.':'일정을 열어 ‘캘린더 파일’로 내보낸 후 개인 캘린더 앱에서 가져오고 알림을 확인하세요. 가져온 사본은 따로 관리되며, 웹앱 자체는 닫혀 있을 때 알림을 보내지 않아요.';
  $('installTip').hidden=!!native;$('alarmAccess').hidden=!native;
  $('alarmAccess').onclick=async()=>{const ok=await allowAlarms();if(ok)syncAlarms();msg($('settingsMsg'),ok?'아이폰 알림을 사용할 수 있어요.':'아이폰 설정에서 달편지 알림을 허용해 주세요.');};
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
  $('editor').addEventListener('close',()=>{edit=null;});
  function showView(name){view=name;render();window.scrollTo(0,0);if(view==='search')$('query').focus();}
  function move(delta){
    const weekly=view==='week'||view==='tasks';
    const d=weekly?C.add(selected,7*delta):C.shiftMonth(selected,delta);
    if(!weekly && view!=='calendar')view='calendar';
    selectDay(d);
  }
  $('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);
  for(let m=1;m<=12;m++){const option=el('option','',m+'월');option.value=m;$('jumpMonth').append(option);}
  function jump(){$('jumpYear').value=selected.slice(0,4);$('jumpMonth').value=Number(selected.slice(5,7));$('jump').showModal();}
  $('pickYear').onclick=jump;$('pickMonth').onclick=jump;
  $('jumpForm').onsubmit=event=>{
    event.preventDefault();const year=Number($('jumpYear').value),month=Number($('jumpMonth').value);
    const distance=(year-Number(selected.slice(0,4)))*12+month-Number(selected.slice(5,7));
    const d=C.shiftMonth(selected,distance);if(!C.validDate(d))return;
    $('jump').close();view='calendar';selectDay(d);
  };
  $('today').onclick=()=>{$('jump').close();view='calendar';selectDay(C.today());};
  $('add').onclick=()=>openEditor(null,selected);
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>showView(b.dataset.tab));
  $('openTasks').onclick=()=>showView('tasks');$('backWeek').onclick=()=>showView('week');
  let touch=null;
  $('grid').addEventListener('touchstart',ev=>{touch=ev.touches.length===1?[ev.touches[0].clientX,ev.touches[0].clientY]:null;},{passive:true});
  $('grid').addEventListener('touchcancel',()=>{touch=null;});
  $('grid').addEventListener('touchend',ev=>{
    if(!touch)return;
    const dx=ev.changedTouches[0].clientX-touch[0],dy=ev.changedTouches[0].clientY-touch[1];touch=null;
    if(Math.abs(dx)>62&&Math.abs(dx)>Math.abs(dy)*2)move(dx<0?1:-1);
  },{passive:true});
  let memoBase=null,memoDay=null;
  function setMemoDate(d){
    memoDay=d;$('memoDate').value=d;$('memoBody').value=state.memos[d]||'';
    $('removeMemo').hidden=!state.memos[d];msg($('memoError'),'');
  }
  function openMemo(d){
    if(!ready){announce('저장소를 열 수 없어요. 설정에서 백업을 확인하세요.');return;}
    memoBase=raw;setMemoDate(d);$('memoEditor').showModal();
  }
  $('memoDate').onchange=()=>{
    const d=$('memoDate').value;if(!C.validDate(d))return;
    const draft=$('memoBody').value,changed=draft!==(state.memos[memoDay]||'');
    if(changed && state.memos[d]){$('memoDate').value=memoDay;msg($('memoError'),'그날은 이미 메모가 있어요. 작성 중인 메모를 먼저 저장하세요.');return;}
    setMemoDate(d);if(changed)$('memoBody').value=draft;
  };
  $('monthMemo').onclick=()=>openMemo(C.today());$('dayMemo').onclick=()=>openMemo(selected);$('newMemo').onclick=()=>openMemo(C.today());
  async function saveMemo(deleting){
    const d=$('memoDate').value,t=$('memoBody').value.trim();
    if(!C.validDate(d)||(!deleting&&!t)){msg($('memoError'),'날짜와 메모를 입력하세요.');return;}
    try{
      await change(s=>{if(deleting)delete s.memos[d];else s.memos[d]=t;return s;},{expectedRaw:memoBase});
      $('memoEditor').close();announce(deleting?'메모를 삭제했어요.':'메모를 저장했어요.');
    }catch(err){msg($('memoError'),err.message);}
  }
  $('memoForm').onsubmit=ev=>{ev.preventDefault();saveMemo(false);};
  $('removeMemo').onclick=async()=>{if(await confirmChoice('메모를 삭제할까요?',$('memoDate').value,'삭제'))await saveMemo(true);};
  $('shareApp').onclick=async()=>{
    const url=location.protocol==='https:'?new URL('./',location.href).href:'https://aiultramin-prog.github.io/seonwoo-calendar/dear-sunwoo/';
    try{
      if(native){await native.postMessage({action:'shareLink'});return;}
      if(navigator.share){await navigator.share({title:'달편지 · 선우의 달력',url});return;}
      await navigator.clipboard.writeText(url);announce('달력 링크를 복사했어요.');
    }catch(err){if(err.name==='AbortError')return;$('shareAddress').value=url;$('shareDialog').showModal();$('shareAddress').select();}
  };
  document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;renderTasks();});
  $('query').addEventListener('input',renderSearch);
  window.addEventListener('storage',e=>{if(e.key===storageKey || e.key===null)refresh();});
  document.addEventListener('visibilitychange',async()=>{if(!document.hidden){await refresh();syncAlarms();}});
  if(!native && 'serviceWorker' in navigator && location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
  window.moonOpenDate=d=>{if(C.validDate(d)){view='calendar';openDay(d);}};
  (async()=>{await refresh();syncAlarms();if(native){try{const d=await native.postMessage({action:'ready'});if(d)window.moonOpenDate(d);}catch{}}})();
})();
