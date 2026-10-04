const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
let current = 0;
const screens = $$('.screen');

function bindConfig(){
  $$('[data-bind="name"]').forEach(e=>e.textContent=SITE.name);
  $$('[data-bind="shortName"]').forEach(e=>e.textContent=SITE.shortName);
}
function makeStars(){
  const box=$('#stars'); for(let i=0;i<90;i++){ const s=document.createElement('i'); s.style.left=Math.random()*100+'%'; s.style.top=Math.random()*100+'%'; s.style.animationDelay=(Math.random()*4)+'s'; s.style.opacity=.25+Math.random()*.75; box.appendChild(s); }
}
function show(n){
  current=clamp(n,0,screens.length-1);
  screens.forEach((s,i)=>s.classList.toggle('active',i===current));
  $('#progress').style.width=((current)/(screens.length-1)*100)+'%';
  if(current===9) startCountdown();
  window.scrollTo({top:0,behavior:'smooth'});
}
function next(){show(current+1)}
$$('[data-next]').forEach(b=>b.addEventListener('click',next));

$('#passwordBtn').onclick=unlock;
$('#passwordInput').addEventListener('keydown',e=>{if(e.key==='Enter')unlock()});
function unlock(){
  const val=$('#passwordInput').value.trim();
  if(val===SITE.password){
    $('#passwordError').textContent='Unlocked 💜';
    $('#topbar').classList.remove('hidden'); $('#app').classList.remove('hidden');
    show(1);
    try{ $('#bgAudio').play().catch(()=>{}); }catch(e){}
  } else {
    $('#passwordError').textContent='Wrong password — the surprise stays locked 😈';
    $('#passwordInput').animate([{transform:'translateX(-7px)'},{transform:'translateX(7px)'},{transform:'translateX(0)'}],{duration:240});
  }
}

$('#sunglassBtn').onclick=()=>{ const fx=$('#cameraFx'); fx.classList.add('snap'); setTimeout(next,900); };

const noMessages=["Nice try 😭", "That button has trust issues.", "Nope. Try the pink one 💜", "The 'No' button is on vacation.", "I respectfully disagree 😌", "Wrong timeline 😂"];
$('#noBtn').onclick=()=>{ const b=$('#noBtn'); b.style.transform=`translate(${Math.random()*180-90}px,${Math.random()*100-50}px) rotate(${Math.random()*16-8}deg)`; $('#noMessage').textContent=noMessages[Math.floor(Math.random()*noMessages.length)]; };
$('#yesBtn').onclick=next;

// Cake: create 18 candles, extinguish sequentially.
for(let i=0;i<18;i++){ const c=document.createElement('span'); c.className='candle'; c.innerHTML='<b>🔥</b>'; $('#candles').appendChild(c); }
$('#blowBtn').onclick=()=>{
  const cs=$$('.candle'); $('#blowBtn').disabled=true; $('#cakeStatus').textContent='Blowing the candles… 💨';
  cs.forEach((c,i)=>setTimeout(()=>{c.classList.add('out'); if(i===cs.length-1){$('#cakeStatus').textContent='18 wishes sent to the universe ✨';$('#cutCakeBtn').classList.remove('hidden');}},i*170));
};
$('#cutCakeBtn').onclick=()=>{ $('.cake').classList.add('cut'); burst(); $('#cakeStatus').textContent='Cake officially cut. 18 looks delicious. 🎂'; setTimeout(next,1200); };

// Quiz
$$('.answers button').forEach(btn=>btn.onclick=()=>{
  const q=btn.closest('.question'); const ok=btn.dataset.correct==='true';
  $('#quizFeedback').textContent=ok?'Correct! Your self-knowledge is elite. 💜':'Wrong 😂 but you still get to continue.';
  q.querySelectorAll('button').forEach(x=>x.disabled=true); btn.classList.add(ok?'good':'bad');
  const idx=Number(q.dataset.q);
  setTimeout(()=>{ if(idx<2){q.classList.remove('active'); q.nextElementSibling.classList.add('active')} else next(); },700);
});

let cdTimer;
function startCountdown(){
  if(cdTimer) return; let n=5; $('#countdown').textContent=n;
  cdTimer=setInterval(()=>{n--;$('#countdown').textContent=n;if(n<=0){clearInterval(cdTimer);cdTimer=null;$('#countdownText').textContent='Ready. Let the memories in.';$('#countdownNext').classList.remove('hidden');}},1000);
}
$('#countdownNext').onclick=next;

function renderMemories(){
  $('#memoryGrid').innerHTML=SITE.images.slice(0,6).map((x,i)=>`<figure class="memory"><img src="${x.src}" alt="${x.title}"><figcaption>${x.title}</figcaption></figure>`).join('');
  $('#photoWall').innerHTML=SITE.images.slice(6,12).map((x,i)=>`<figure class="tilt"><img src="${x.src}" alt="${x.title}"><figcaption>${x.title}</figcaption></figure>`).join('');
  $$('.tilt').forEach(card=>{card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5; card.style.transform=`perspective(700px) rotateX(${y*-8}deg) rotateY(${x*10}deg) scale(1.03)`});card.addEventListener('pointerleave',()=>card.style.transform='')});
  $('#videoGallery').innerHTML=SITE.videos.map(v=>`<article class="video-card"><video controls preload="metadata" src="${v.src}"></video><span>${v.title}</span></article>`).join('');
}
renderMemories();

$('#openMessage').onclick=()=>$('#messageModal').classList.remove('hidden');
$('#closeMessage').onclick=()=>$('#messageModal').classList.add('hidden');
$('#messageNext').onclick=()=>{$('#messageModal').classList.add('hidden');next()};

$('#balloonBtn').onclick=()=>{
  const stage=$('#balloonStage'); stage.innerHTML='';
  for(let i=0;i<18;i++){const b=document.createElement('span'); b.textContent='18'; b.style.left=(4+Math.random()*92)+'%'; b.style.animationDelay=(Math.random()*1.8)+'s'; b.style.setProperty('--x',(Math.random()*100-50)+'px'); stage.appendChild(b);}
  burst(); $('#balloonNext').classList.remove('hidden');
};

// Matching game, 6 pairs.
const matchImgs=SITE.images.slice(0,6).map(x=>x.src); let first=null, lock=false, matched=0;
function initMatch(){
  const cards=[...matchImgs,...matchImgs].sort(()=>Math.random()-.5); $('#matchGrid').innerHTML=cards.map((src,i)=>`<button class="match-card" data-src="${src}"><img src="${src}" alt="memory"></button>`).join('');
  $$('.match-card').forEach(c=>c.onclick=()=>{
    if(lock||c.classList.contains('matched')||c===first)return; c.classList.add('flipped');
    if(!first){first=c;return} lock=true; const second=c;
    if(first.dataset.src===second.dataset.src){first.classList.add('matched');second.classList.add('matched');matched++;$('#matchStatus').textContent=`Matches: ${matched} / 6`; first=null;lock=false;if(matched===6){$('#matchNext').classList.remove('hidden');burst()}}
    else setTimeout(()=>{first.classList.remove('flipped');second.classList.remove('flipped');first=null;lock=false},650);
  });
}
initMatch();

$('#voiceBtn').onclick=()=>{
  $('#voiceOrb').classList.add('playing'); $('#voiceBtn').disabled=true; $('#voiceText').textContent='I didn\'t get your voice 💔';
  setTimeout(()=>{$('#voiceNext').classList.remove('hidden');$('#voiceOrb').classList.remove('playing')},2200);
};

$$('[data-rating]').forEach(b=>b.onclick=()=>{ $$('#ratingRow button').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); $('#ratingLabel').textContent=`${b.dataset.rating} star${b.dataset.rating==='1'?'':'s'} 💜`; });
$$('[data-score]').forEach(b=>b.onclick=()=>{$$('[data-score]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});
$('#replyBtn').onclick=()=>{ const msg=$('#replyBox').value.trim(); $('#reviewDone').textContent=msg?`Review received: “${msg}” 💌`:'Review received. Your smile is enough. 💌'; $('#replayBtn').classList.remove('hidden'); burst(60); };
$('#replayBtn').onclick=()=>location.reload();

function burst(count=35){ const box=$('#confetti'); for(let i=0;i<count;i++){const p=document.createElement('i');p.style.left=(50+Math.random()*20-10)+'%';p.style.top='45%';p.style.setProperty('--dx',(Math.random()*500-250)+'px');p.style.setProperty('--dy',(Math.random()*500+100)+'px');p.style.setProperty('--rot',(Math.random()*720-360)+'deg');box.appendChild(p);setTimeout(()=>p.remove(),1600)} }
$('#musicBtn').onclick=()=>{const a=$('#bgAudio');if(a.paused){a.play().catch(()=>{});$('#musicBtn').textContent='♫'}else{a.pause();$('#musicBtn').textContent='🔇'}};

bindConfig(); makeStars();
setTimeout(()=>{ $('#loader').classList.add('gone'); $('#app').classList.remove('hidden'); }, 1400);
