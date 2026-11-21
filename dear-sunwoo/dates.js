/* Civil dates and reminders in this app use Asia/Seoul. No network data is needed. */
'use strict';
(() => {
  const DAY = 86400000;
  const offset = 9 * 3600000;
  const p2 = n => String(n).padStart(2, '0');
  const stamp = date => Date.parse(date + 'T00:00:00Z');
  const key = ms => new Date(ms).toISOString().slice(0, 10);
  const today = (now = Date.now()) => key(now + offset);
  const add = (date, n) => key(stamp(date) + n * DAY);
  const dow = date => new Date(stamp(date)).getUTCDay();
  const validDate = s => typeof s === 'string' && /^(19|20)\d{2}-\d{2}-\d{2}$/.test(s) && Number.isFinite(stamp(s)) && key(stamp(s)) === s;
  const validTime = s => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
  const categories = {personal:'일상', together:'함께', special:'기념일'};
  const repeats = {none:'반복 안 함', daily:'매일', weekly:'매주', monthly:'매월', yearly:'매년'};
  const reminderValues = [-1, 0, 10, 30, 60, 1440];
  const fresh = () => ({version:1,events:[],memos:{}});
  function cleanEvent(e) {
    if (!e || typeof e !== 'object' || typeof e.id !== 'string' || !/^[\da-zA-Z_-]{1,80}$/.test(e.id) ||
      typeof e.title !== 'string' || !e.title.trim() || e.title.length > 120 || !validDate(e.date) ||
      (e.time !== '' && !validTime(e.time)) || !Object.hasOwn(categories,e.category) ||
      !Object.hasOwn(repeats,e.repeat) || !reminderValues.includes(e.reminder) ||
      typeof e.note !== 'string' || e.note.length > 4000 ||
      ![e.done,e.skip].every(a => Array.isArray(a) && a.length <= 10000 && a.every(validDate))) {
      throw Error('일정 형식이 올바르지 않아요.');
    }
    if (e.owner!==undefined && !['dongmin','sunwoo','together'].includes(e.owner))throw Error('일정의 주인을 확인해 주세요.');
    return {id:e.id,...(e.owner ? {owner:e.owner}:{}),title:e.title.trim(),date:e.date,time:e.time,category:e.category,repeat:e.repeat,
      note:e.note,reminder:e.time ? e.reminder : -1,done:[...new Set(e.done)],skip:[...new Set(e.skip)]};
  }
  function readState(raw) {
    if (!raw || raw.version !== 1 || !Array.isArray(raw.events) || raw.events.length > 2000) throw Error('달편지 버전 1 백업 파일을 선택해 주세요.');
    const events = raw.events.map(cleanEvent);
    if (new Set(events.map(e=>e.id)).size !== events.length) throw Error('같은 일정 번호가 두 번 들어 있어요.');
    const notes=raw.memos===undefined?{}:raw.memos;
    if(!notes || Array.isArray(notes) || typeof notes!=='object' || Object.keys(notes).length>2000)throw Error('메모 형식을 확인해 주세요.');
    const memos={};
    for(const [date,text] of Object.entries(notes)){
      if(!validDate(date) || typeof text!=='string' || text.length>2000)throw Error('메모 형식을 확인해 주세요.');
      if(text.trim())memos[date]=text;
    }
    return {version:1,events,memos};
  }
  function occurs(e,date) {
    if (date < e.date || e.skip.includes(date)) return false;
    if (e.repeat === 'none') return date === e.date;
    if (e.repeat === 'daily') return true;
    if (e.repeat === 'weekly') return dow(date) === dow(e.date);
    if (e.repeat === 'monthly') return date.slice(8) === e.date.slice(8);
    return date.slice(5) === e.date.slice(5);
  }
  function shiftMonth(date,n) {
    const [y,m,d] = date.split('-').map(Number);
    const first = new Date(Date.UTC(y,m-1+n,1));
    const last = new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
    return key(Date.UTC(first.getUTCFullYear(),first.getUTCMonth(),Math.min(d,last)));
  }
  function nextDate(e,from,skipDone=false) {
    let candidate = from > e.date ? from : e.date;
    while (candidate <= '2099-12-31') {
      let d=candidate;
      if(e.repeat==='none') { if(candidate>e.date) return null; d=e.date; }
      else if(e.repeat==='weekly') d=add(candidate,(dow(e.date)-dow(candidate)+7)%7);
      else if(e.repeat==='monthly') {
        const same=candidate.slice(0,8)+e.date.slice(8);
        if(!validDate(same) || same<candidate) {candidate=shiftMonth(candidate.slice(0,7)+'-01',1);continue;}
        d=same;
      } else if(e.repeat==='yearly') {
        const same=candidate.slice(0,4)+e.date.slice(4);
        if(!validDate(same) || same<candidate) {candidate=(Number(candidate.slice(0,4))+1)+'-01-01';continue;}
        d=same;
      }
      if(d>'2099-12-31')return null;
      if(!e.skip.includes(d) && (!skipDone || !e.done.includes(d))) return d;
      candidate=add(d,1);
    }
    return null;
  }
  function reminderTime(e,d) {return Date.parse(d+'T'+e.time+':00+09:00')-e.reminder*60000;}
  function plannedReminders(events,now=Date.now(),limit=60) {
    const candidates=[];
    for(const e of events) {
      if(!e.time || e.reminder<0)continue;
      let from=today(now + e.reminder*60000);
      while(true) {
        const d=nextDate(e,from,true); if(!d)break;
        const ms=reminderTime(e,d);
        if(ms>now) {candidates.push({e,d,ms});break;}
        from=add(d,1);
      }
    }
    const result=[];
    while(candidates.length && result.length<limit) {
      candidates.sort((a,b)=>a.ms-b.ms || a.e.id.localeCompare(b.e.id));
      const {e,d,ms}=candidates.shift();
      result.push({id:'moon.'+e.id+'.'+d, title:e.title, date:d, at:ms/1000});
      const next=nextDate(e,add(d,1),true);
      if(next)candidates.push({e,d:next,ms:reminderTime(e,next)});
    }
    return result;
  }
  function quickText(event) {
    return (event.time ? event.time+' ' : '')+event.title;
  }
  function parseQuickLine(value) {
    const raw=value.trim();
    if(!raw)return null;
    const clock=raw.match(/^(\d{1,2}):(\d{1,2})(?!\d)\s*(.*)$/u);
    let title=raw,time='';
    if(clock){
      time=p2(Number(clock[1]))+':'+p2(Number(clock[2]));title=clock[3].trim();
      if(!validTime(time))throw Error('시간은 00:00~23:59 사이로 적어 주세요.');
      if(!title)throw Error('시간 뒤에 일정 이름을 적어 주세요.');
    } else if(/^\d{1,2}:/.test(raw))throw Error('시간은 16:30처럼 적어 주세요.');
    if(title.length>120)throw Error('일정 이름은 120자까지 적을 수 있어요.');
    return {title,time};
  }
  function applyQuickDay(state,date,rows,memo,newId) {
    if(!validDate(date) || typeof memo!=='string' || memo.length>2000)throw Error('날짜와 메모를 확인해 주세요.');
    const next=readState(state), edits=new Map(), additions=[];
    for(const [index,row] of rows.entries()){
      const old=row.id?next.events.find(e=>e.id===row.id):null;
      if(row.id && (!old||!occurs(old,date)))throw Error('일정이 바뀌었어요. 닫고 다시 열어 주세요.');
      if(old && edits.has(old.id))throw Error('같은 일정이 두 번 들어 있어요.');
      const sameText=old && quickText(old)===row.text.trim();
      let parsed;
      try{parsed=sameText?{title:old.title,time:old.time}:parseQuickLine(row.text);}
      catch(err){throw Error((index+1)+'번째 줄 · '+err.message);}
      if(!parsed){
        if(old)edits.set(old.id,old.repeat==='none'?[]:[{...old,skip:[...new Set([...old.skip,date])]}]);
        continue;
      }
      const reminder=parsed.time?Number(row.reminder):-1;
      const repeat=old?.repeat && old.repeat!=='none'?old.repeat:row.repeat;
      const owner=row.owner||old?.owner;
      if(old && sameText && old.reminder===reminder && old.repeat===repeat && old.owner===owner)continue;
      const fields={...parsed,date,repeat,reminder,...(owner?{owner}:{})};
      if(!old){additions.push(cleanEvent({...fields,id:newId(),category:'personal',note:'',done:[],skip:[]}));continue;}
      if(old.repeat==='none'){edits.set(old.id,[cleanEvent({...old,...fields})]);continue;}
      // A quick edit affects this occurrence. Other dates keep their series and metadata.
      const series={...old,skip:[...new Set([...old.skip,date])]};
      const detached=cleanEvent({...old,...fields,id:newId(),repeat:'none',skip:[],done:old.done.includes(date)?[date]:[]});
      edits.set(old.id,[series,detached]);
    }
    next.events=next.events.flatMap(e=>edits.has(e.id)?edits.get(e.id):[e]).concat(additions);
    if(memo.trim())next.memos[date]=memo.trim();else delete next.memos[date];
    return readState(next);
  }
  const holidays = {};
  for (const year of [2026,2027]) {
    for(const [md,name] of Object.entries({'01-01':'신정','03-01':'삼일절','05-01':'노동절','05-05':'어린이날','06-06':'현충일','07-17':'제헌절','08-15':'광복절','10-03':'개천절','10-09':'한글날','12-25':'성탄절'})) holidays[year+'-'+md]=name;
  }
  function holidaysFor(year, entries) {for(const [md,name] of Object.entries(entries)) holidays[year+'-'+md]=name;}
  holidaysFor(2026,{'02-16':'설 연휴','02-17':'설날','02-18':'설 연휴','03-02':'삼일절 대체공휴일','05-24':'부처님오신날','05-25':'부처님오신날 대체공휴일','06-03':'전국동시지방선거','08-17':'광복절 대체공휴일','09-24':'추석 연휴','09-25':'추석','09-26':'추석 연휴','10-05':'개천절 대체공휴일'});
  holidaysFor(2027,{'02-06':'설 연휴','02-07':'설날','02-08':'설 연휴','02-09':'설날 대체공휴일','05-03':'노동절 대체공휴일','05-13':'부처님오신날','07-19':'제헌절 대체공휴일','08-16':'광복절 대체공휴일','09-14':'추석 연휴','09-15':'추석','09-16':'추석 연휴','10-04':'개천절 대체공휴일','10-11':'한글날 대체공휴일','12-27':'성탄절 대체공휴일'});
  let lunarFormatter;
  try {const fmt=new Intl.DateTimeFormat('ko-KR-u-ca-dangi',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric'});if(fmt.resolvedOptions().calendar==='dangi')lunarFormatter=fmt;}catch{}
  function lunar(date) {
    if(!lunarFormatter)return '';
    const p=lunarFormatter.formatToParts(new Date(stamp(date)+3*3600000));
    const m=p.find(x=>x.type==='month')?.value, d=p.find(x=>x.type==='day')?.value;
    return m && d ? '음력 '+m.replace(/월$/,'')+'월 '+d.replace(/일$/,'')+'일' : '';
  }
  function parsePhrase(raw,base=today()) {
    let s=raw.trim(), date=base, time='', repeat='none',matched=false;
    const weekly=s.match(/매주\s*([일월화수목금토])요일/);
    const relative=s.match(/내일|모레|오늘/);
    if(weekly){repeat='weekly';date=add(base,('일월화수목금토'.indexOf(weekly[1])-dow(base)+7)%7);s=s.replace(weekly[0],' ');matched=true;}
    else if(relative){date=add(base,({오늘:0,내일:1,모레:2})[relative[0]]);s=s.replace(relative[0],' ');matched=true;}
    if(s.includes('매일')){s=s.replace('매일',' ');repeat='daily';matched=true;}
    const clock=s.match(/(오전|오후)\s*(1[0-2]|[1-9])\s*시(?:\s*(반|[0-5]?\d\s*분))?/);
    const digital=s.match(/(?:^|\s)((?:[01]?\d|2[0-3]):[0-5]\d)(?=\s|$)/);
    if(clock){const hr=Number(clock[2])%12+(clock[1]==='오후'?12:0), minute=clock[3]==='반'?30:parseInt(clock[3]||'0',10);time=p2(hr)+':'+p2(minute);s=s.replace(clock[0],' ');matched=true;}
    else if(digital){const [h,m]=digital[1].split(':');time=p2(h)+':'+m;s=s.replace(digital[0],' ');matched=true;}
    else if(/\d\s*시/.test(s))throw Error('오전 또는 오후를 적어 주세요.');
    let reminder;
    const alarm=s.match(/(?:^|\s)(?:(\d+\s*(?:분|시간|일)|하루)\s*전\s*)?알림\s*$/);
    if(alarm && time) {
      const lead=alarm[1]?.replace(/\s+/g,'');
      reminder=lead?({'10분':10,'30분':30,'60분':60,'1시간':60,'1일':1440,'하루':1440})[lead]:0;
      if(reminder===undefined)throw Error('알림은 시작 시간, 10분 전, 30분 전, 1시간 전, 하루 전 중에 선택해 주세요.');
      s=s.slice(0,alarm.index);
    }
    const title=s.replace(/\s+/g,' ').trim();
    if(!matched || !title)throw Error('예: 매주 금요일 오후 2시 30분 식사 신청 마감');
    return reminder===undefined?{date,time,repeat,title}:{date,time,repeat,title,reminder};
  }
  const icsEscape=s=>s.replace(/\\/g,'\\\\').replace(/\r\n?|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  function fold(s) {
    const encoder=new TextEncoder();let row='',bytes=0;const out=[];
    for(const c of s){const n=encoder.encode(c).length;if(bytes+n>75){out.push(row);row=' ';bytes=1;}row+=c;bytes+=n;}
    return [...out,row].join('\r\n');
  }
  function ical(e,now=new Date()) {
    const compact=d=>d.replace(/-/g,'');
    const dt=d=>compact(d)+(e.time?'T'+e.time.replace(':','')+'00':'');
    const param=e.time?';TZID=Asia/Seoul':';VALUE=DATE';
    const z=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Moonletter//KO','CALSCALE:GREGORIAN'];
    if(e.time)z.push('BEGIN:VTIMEZONE','TZID:Asia/Seoul','BEGIN:STANDARD','DTSTART:19881009T030000','TZOFFSETFROM:+1000','TZOFFSETTO:+0900','TZNAME:KST','END:STANDARD','END:VTIMEZONE');
    z.push('BEGIN:VEVENT','UID:'+e.id+'@moonletter.local','DTSTAMP:'+now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'DTSTART'+param+':'+dt(e.date),e.time?'DURATION:PT30M':'DTEND;VALUE=DATE:'+compact(add(e.date,1)),'SUMMARY:'+icsEscape(e.title));
    if(e.note)z.push('DESCRIPTION:'+icsEscape(e.note));
    if(e.repeat!=='none')z.push('RRULE:FREQ='+e.repeat.toUpperCase());
    const exclusions=[...new Set([...e.skip,...e.done])];
    if(e.repeat!=='none' && exclusions.length)z.push('EXDATE'+param+':'+exclusions.map(dt).join(','));
    if(e.time && e.reminder>=0)z.push('BEGIN:VALARM','TRIGGER:'+(e.reminder?'-PT'+e.reminder+'M':'PT0M'),'ACTION:DISPLAY','DESCRIPTION:'+icsEscape(e.title),'END:VALARM');
    z.push('END:VEVENT','END:VCALENDAR');return z.map(fold).join('\r\n')+'\r\n';
  }
  const api={quickText,parseQuickLine,applyQuickDay,today,add,dow,validDate,validTime,stamp,shiftMonth,cleanEvent,readState,occurs,nextDate,plannedReminders,holidays,lunar,parsePhrase,ical,categories,repeats,fresh};
  if(typeof module!=='undefined' && module.exports)module.exports=api;
  else globalThis.MoonCalendar=api;
})();
