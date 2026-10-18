(()=>{
 const API='https://script.google.com/macros/s/AKfycbwn4udz90VuI9p3UzRs4nrZNoPbVLVyszvNddDEuX0TGkcTxHFNkxoBCHBZ1zd4LjNA/exec';
 const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const day=s=>{const m=/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/.exec(String(s||''));return m?`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`:''};
 const today=()=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`};
 const safeUrl=s=>{try{const u=new URL(String(s||''));return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
 const nl=s=>html(s).replace(/\n/g,'<br>');
 const posterUrl=s=>{const raw=safeUrl(s);if(!raw)return '';try{const u=new URL(raw);if(u.hostname==='drive.google.com'){const id=u.pathname.match(/\/file\/d\/([A-Za-z0-9_-]+)/)?.[1]||u.searchParams.get('id');if(id)return 'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1200'}return raw}catch{return ''}};

 const card=e=>{const image=posterUrl(e.image);const original=safeUrl(e.image);const venueUrl=safeUrl(e.venueUrl);const booking=safeUrl(e.url);const venue=e.venue?(venueUrl?`<a href="${html(venueUrl)}" target="_blank" rel="noopener noreferrer">${html(e.venue)} ↗</a>`:html(e.venue)):'';const details=[venue,e.time&&nl(e.time),e.performers&&nl(e.performers),e.description&&nl(e.description),e.price&&`料金：${nl(e.price)}`].filter(Boolean).map(s=>`<p>${s}</p>`).join('');return `<article class="concert-card">${image?`<img class="concert-poster" src="${html(image)}" alt="${html(e.title)} のチラシ" loading="lazy">`:''}<div><span class="concert-date">${html(e.date.replaceAll('-','.'))}</span><h3>${html(e.title)}</h3>${details}${booking?`<a class="button" href="${html(booking)}" target="_blank" rel="noopener noreferrer">公演詳細・ご予約 ↗</a>`:''}</div></article>`};
 const put=(id,items,empty)=>{const el=document.getElementById(id);if(el)el.innerHTML=items.length?items.map(card).join(''):`<p class="concert-empty">${empty}</p>`};
 function render(events){events=events.filter(e=>day(e.date)&&e.title).map(e=>({...e,date:day(e.date)}));const now=today();const future=events.filter(e=>e.date>=now).sort((a,b)=>a.date.localeCompare(b.date));const past=events.filter(e=>e.date<now).sort((a,b)=>b.date.localeCompare(a.date));put('upcoming-concerts',future.slice(0,3),'現在ご案内できる演奏会はありません。');put('all-upcoming',future,'現在ご案内できる演奏会はありません。');put('past-concerts',past,'過去の演奏会はありません。')}
 function notice(msg){const el=document.getElementById('concert-notice');if(el)el.textContent=msg}
 // JSONP avoids cross-origin restrictions of Google Apps Script ContentService.
 const callback='sakuraConcertsCallback';let done=false;const script=document.createElement('script');const timer=setTimeout(()=>{if(!done){done=true;render([]);notice('演奏会情報を取得できませんでした。Apps Script のJSONP設定をご確認ください。')}},12000);
 window[callback]=data=>{if(done)return;done=true;clearTimeout(timer);if(!Array.isArray(data)){render([]);notice('演奏会データの形式を確認してください。');return}render(data)};
 script.onerror=()=>{if(!done){done=true;clearTimeout(timer);render([]);notice('演奏会情報を取得できませんでした。')}};
 script.src=API+'?callback='+callback+'&t='+Date.now();document.head.appendChild(script);
})();
