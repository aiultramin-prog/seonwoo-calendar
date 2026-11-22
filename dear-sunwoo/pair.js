'use strict';
(() => {
  const endpoint='https://moonletter-calendar-gift.aiultramin.chatgpt.site/api/pair/v1';
  const publicUrl='https://aiultramin-prog.github.io/seonwoo-calendar/dear-sunwoo/';
  const labels={dongmin:'동민',sunwoo:'선우',together:'함께'};
  const valid=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
  const hex=b=>Array.from(new Uint8Array(b),n=>n.toString(16).padStart(2,'0')).join('');
  const newSecret=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
  const encoder=new TextEncoder();
  const conflict=()=>Error('같은 일정이나 메모를 상대방이 먼저 바꿨어요. 닫고 최신 내용을 확인한 뒤 다시 수정해 주세요.');
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  function mergeMap(base,draft,latest){
    const out=new Map(latest);
    for(const key of new Set([...base.keys(),...draft.keys()])){
      const before=base.get(key),after=draft.get(key),remote=latest.get(key);
      if(same(before,after)||same(after,remote))continue;
      if(!same(before,remote))throw conflict();
      if(after===undefined)out.delete(key);else out.set(key,after);
    }
    return out;
  }
  function merge(base,draft,latest){
    const events=s=>new Map(s.events.map(e=>[e.id,e])), notes=s=>new Map(Object.entries(s.memos));
    return {version:1,events:[...mergeMap(events(base),events(draft),events(latest)).values()],
      memos:Object.fromEntries(mergeMap(notes(base),notes(draft),notes(latest)))};
  }
  function invitation(value){
    try{
      const link=new URL(value.trim());
      const validPage=(link.origin===new URL(publicUrl).origin && ['/seonwoo-calendar/dear-sunwoo/','/seonwoo-calendar/dear-sunwoo/index.html'].includes(link.pathname))
        || (link.origin===new URL(endpoint).origin && ['/','/index.html'].includes(link.pathname));
      const keys=new URLSearchParams(link.hash.slice(1)).getAll('pair');
      return validPage && keys.length===1 && valid(keys[0]) ? keys[0] : null;
    }catch{return null;}
  }
  const deviceEndpoint=new URL('device/v1',endpoint).href;
  const alphabet='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const sha=text=>crypto.subtle.digest('SHA-256',encoder.encode(text));
  const roomNumber=async secret=>hex(await sha('dalpair-v1/display/'+secret)).slice(0,8).toUpperCase().replace(/^(.{4})/,'$1-');
  function normalizedCode(value){
    const code=String(value||'').toUpperCase().replace(/[-\s]/g,'').replace(/O/g,'0').replace(/[IL]/g,'1');
    if(code.length!==12||[...code].some(character=>!alphabet.includes(character)))throw Error('앱 연결 코드 12자리를 입력해 주세요. 일정이 보이는 달력에서 코드를 받을 수 있어요.');
    return code;
  }
  async function transferKeys(code){
    const lookup=hex(await sha('dalpair-device-v1/lookup/'+code));
    const key=await crypto.subtle.importKey('raw',await sha('dalpair-device-v1/cipher/'+code),'AES-GCM',false,['encrypt','decrypt']);
    return {lookup,key};
  }
  async function deviceRequest(options,method,headers,body){
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
    try{
      const r=await (options.fetch||fetch)(options.deviceEndpoint||deviceEndpoint,{method,headers,body,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:abort.signal});
      if(r.ok)return method==='POST'?new Uint8Array(await r.arrayBuffer()):null;
      if(method==='POST'&&[404,409,410].includes(r.status))throw Error('이미 사용했거나 만료된 코드예요. 일정이 보이는 달력에서 새 코드를 받아 주세요.');
      throw Error('앱 연결을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }catch(err){
      if(err.name==='AbortError'||err instanceof TypeError)throw Error('인터넷 연결을 확인한 뒤 다시 시도해 주세요.');
      throw err;
    }finally{clearTimeout(timer);}
  }
  async function redeemCode(value,options={}){
    const {lookup,key}=await transferKeys(normalizedCode(value));
    const bytes=await deviceRequest(options,'POST',{'X-Dal-Transfer':lookup});
    try{
      const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},key,bytes.slice(12));
      const secret=new TextDecoder().decode(clear);
      if(valid(secret))return secret;
    }catch{}
    throw Error('코드를 읽지 못했어요. 새 코드를 받아 주세요.');
  }
  async function connect(secret, options={}){
    if(!valid(secret))throw Error('초대 링크를 다시 확인해 주세요.');
    const digest=tag=>crypto.subtle.digest('SHA-256',encoder.encode('dalpair-v1/'+tag+'/'+secret));
    const key=await crypto.subtle.importKey('raw',await digest('cipher'),'AES-GCM',false,['encrypt','decrypt']);
    const bearer=hex(await digest('access'));
    const roomCode=await roomNumber(secret);
    const transport=options.fetch||fetch;
    const api=options.endpoint||endpoint;
    async function request(method,rev,body){
      const headers={'X-Dal-Key':bearer};
      if(rev)headers['X-Dal-Version']=rev;
      if(body)headers['Content-Type']='application/octet-stream';
      const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),12000);
      try{
        const response=await transport(api,{method,headers,body,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',signal:abort.signal});
        const bytes=method==='GET' && response.status===200 ? new Uint8Array(await response.arrayBuffer()) : null;
        return {status:response.status,ok:response.ok,headers:response.headers,bytes};
      }
      catch{throw Error('인터넷 연결을 확인해 주세요. 공유 달력에 연결하지 못했어요.');}
      finally{clearTimeout(timer);}
    }
    async function load(rev){
      const r=await request('GET',rev);
      if(r.status===204)return null;
      if(r.status===404)throw Error('이 초대 링크의 달력을 찾을 수 없어요.');
      if(!r.ok)throw Error('공유 달력을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      const bytes=r.bytes;
      const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},key,bytes.slice(12));
      return {version:r.headers.get('X-Dal-Version'),state:window.MoonCalendar.readState(JSON.parse(new TextDecoder().decode(clear)))};
    }
    async function write(state,rev){
      const payload=encoder.encode(JSON.stringify(state));
      if(payload.length>2999972)throw Error('공유 달력 용량을 넘었어요. 백업 후 일정을 정리해 주세요.');
      const iv=crypto.getRandomValues(new Uint8Array(12));
      const crypt=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,payload);
      const body=new Uint8Array(iv.length+crypt.byteLength);
      body.set(iv);body.set(new Uint8Array(crypt),iv.length);
      const r=await request('PUT',rev,body);
      if(r.status===409)return null;
      if(!r.ok)throw Error('공유 달력 저장을 확인하지 못했어요. 연결 후 다시 저장해 주세요.');
      const version=r.headers.get('X-Dal-Version');
      if(!version)throw Error('저장 상태를 확인하지 못했어요. 달력을 다시 열어 주세요.');
      return {version,state};
    }
    async function commit(base,draft){
      for(let attempt=0;attempt<4;attempt++){
        const latest=await load();
        const next=window.MoonCalendar.readState(merge(base,draft,latest.state));
        if(same(next,latest.state))return latest;
        const result=await write(next,latest.version);
        if(result)return result;
      }
      throw Error('두 사람이 동시에 저장하고 있어요. 다시 저장해 주세요.');
    }
    async function issueCode(){
      const code=Array.from(crypto.getRandomValues(new Uint8Array(12)),byte=>alphabet[byte&31]).join('');
      const {lookup,key:wrapKey}=await transferKeys(code);
      const iv=crypto.getRandomValues(new Uint8Array(12));
      const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},wrapKey,encoder.encode(secret));
      const sealed=new Uint8Array(iv.length+encrypted.byteLength);
      sealed.set(iv);sealed.set(new Uint8Array(encrypted),iv.length);
      await deviceRequest(options,'PUT',{'X-Dal-Transfer':lookup,'X-Dal-Key':bearer,'Content-Type':'application/octet-stream'},sealed);
      return code.match(/.{4}/g).join('-');
    }
    return {load,write,commit,roomCode,issueCode};
  }
  const api={connect,merge,valid,invitation,newSecret,publicUrl,labels,roomNumber,redeemCode};
  if(typeof window!=='undefined')window.MoonPair=api;
  if(typeof module!=='undefined')module.exports=api;
})();
