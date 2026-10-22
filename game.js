(function(){
'use strict';
const $=id=>document.getElementById(id);let state=null,busy=false,epoch=0,selected='claudopus',soundOn=true,audio=null,advancePending=null;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function tone(freq=440,duration=.1,type='square',volume=.035){if(!soundOn)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch(_){} }
const music=$('battle-music');music.volume=.4;
function soundLabel(){ $('sound').textContent=soundOn?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(soundOn)); }
function stopMusic(){music.pause();music.currentTime=0;}
function syncMusic(restart=false){
if(!state||state.over||!soundOn||document.hidden){music.pause();return;}
const source=new URL(`assets/${state.player.id}-battle.mp3`,document.baseURI).href;
if(music.src!==source){music.pause();music.src=source;music.load();}
if(restart)music.currentTime=0;
const playing=music.play();
if(playing)playing.catch(error=>{if(error.name==='NotAllowedError'){soundOn=false;soundLabel();}});
}
$('sound').onclick=()=>{soundOn=!soundOn;soundLabel();syncMusic();tone(620);};
music.addEventListener('error',()=>{$('sound').textContent='Audio unavailable';});
document.addEventListener('visibilitychange',()=>syncMusic());
function sprite(who,f,back){const e=$(who+'-sprite');e.className=`fighter ${who} sprite ${f.id}-${back?'back':'front'}`;e.setAttribute('aria-label',Battle.dex[f.id].name);}
function render(){if(!state)return;for(const who of ['player','enemy']){const f=state[who],d=Battle.dex[f.id];$(who+'-name').textContent=d.name;$(who+'-hp').textContent=`${f.hp} / ${f.maxHp}`;const ratio=f.hp/f.maxHp;$(who+'-bar').style.width=`${ratio*100}%`;$(who+'-bar').style.background=ratio>.5?'#54b895':ratio>.25?'#d8a944':'#cf6a59';$(who+'-status').textContent=[f.guard?'SHIELD':'',f.confidence?`CONF +${f.confidence}`:''].filter(Boolean).join(' · ');if(!f.hp)$(who+'-sprite').classList.add('fainted');}
$('round').textContent=`ROUND ${String(state.round).padStart(2,'0')}`;
$('moves').replaceChildren();const available=Battle.available(state.player);if(available.every(m=>m.left===0))available.push({...Battle.struggle,index:-1,left:'∞'});
for(const m of available){const b=document.createElement('button');b.className='move'+(m.left===0?' empty':'');b.disabled=busy||state.over||m.left===0;b.dataset.move=m.id;const strong=document.createElement('strong');strong.textContent=m.name;const meta=document.createElement('span');meta.className='move-meta';const type=document.createElement('span');type.textContent=m.type;const pp=document.createElement('span');pp.textContent=`${m.left}/${m.pp??'∞'} PP`;meta.append(type,pp);const desc=document.createElement('small');desc.textContent=m.desc;b.append(strong,meta,desc);b.onclick=()=>turn(m.index);$('moves').append(b);}}
function cancelAdvance(){const done=advancePending;advancePending=null;$('next-event').hidden=true;if(done)done();}
function readReport(token){
if(token!==epoch)return Promise.resolve();
$('continue-hint').textContent='Read at your own pace.';$('next-event').hidden=false;$('next-event').focus({preventScroll:true});
return new Promise(resolve=>{advancePending=resolve;});
}
$('next-event').onclick=()=>cancelAdvance();
function say(text,speaker='BATTLE REPORT',record=true){$('speaker').textContent=speaker;$('message').textContent=text;if(record){const item=document.createElement('li');item.textContent=text;$('log').append(item);$('log-count').textContent=`${$('log').children.length} events`;}}
async function animate(result,token){const attacker=$(result.who+'-sprite'),victim=$((result.who==='player'?'enemy':'player')+'-sprite');const kind=result.move.kind;attacker.classList.add(kind==='heal'?'healing':'lunge');tone(kind==='heal'?600:kind==='boost'?800:230,.16);if(result.damage){victim.classList.add('hit');$('effect').textContent=result.move.type==='FIRE'?'✹':'✦';$('effect').className='flash';}else if(kind==='boost'){$('effect').textContent='↑';$('effect').className='flash boost';}render();say(result.events.join('\n'),Battle.dex[state[result.who].id].name.toUpperCase());await wait(reduced?0:450);if(token!==epoch)return;attacker.classList.remove('healing','lunge');victim.classList.remove('hit');$('effect').className='';if(state.over)stopMusic();await readReport(token);}
async function turn(index){if(busy||!state||state.over)return;busy=true;const token=epoch;render();$('continue-hint').textContent='Running the checks…';await animate(Battle.act(state,'player',index),token);if(token!==epoch)return;if(state.over){finish();return;}
$('continue-hint').textContent='Your rival is reviewing the diff…';await wait(reduced?150:450);if(token!==epoch)return;await animate(Battle.act(state,'enemy',Battle.cpu(state)),token);if(token!==epoch)return;if(state.over){finish();return;}state.round++;busy=false;render();$('continue-hint').textContent='Your move. Choose an attack below.';$('moves').querySelector('button:not(:disabled)').focus({preventScroll:true});}
function finish(){busy=false;stopMusic();render();$('moves').hidden=true;$('ending').hidden=false;$('continue-hint').textContent='';const won=state.winner==='player',draw=state.winner==='draw';const winner=draw?null:state[state.winner].id;$('result').textContent=draw?'Build failed successfully.':winner==='claudopus'?'Changes requested.':'Approved. Ship it.';$('result-copy').textContent=draw?'Both engineers fainted. CI is still running.':winner==='claudopus'?'Claudopus wins. That edge case was, in fact, a production incident.':'Astralisk wins. The PR is merged. Monitoring has entered the chat.';tone(won?880:170,.3,'triangle');$('rematch').focus({preventScroll:true});}
function start(side){epoch++;cancelAdvance();selected=side;state=Battle.create(side);busy=false;$('selection').hidden=true;$('battle').hidden=false;$('ending').hidden=true;$('moves').hidden=false;$('log').replaceChildren();$('log-count').textContent='0 events';sprite('player',state.player,true);sprite('enemy',state.enemy,false);$('effect').className='';render();say(`${Battle.dex[state.enemy.id].name} opens a pull request.\nWhat will ${Battle.dex[state.player.id].name} do?`,'CODE REVIEW BEGINS');$('continue-hint').textContent='Choose one of your four moves.';syncMusic(true);tone(520);window.scrollTo({top:0,behavior:'instant'});$('moves').querySelector('button').focus({preventScroll:true});}
function selection(){epoch++;cancelAdvance();busy=false;stopMusic();state=null;$('battle').hidden=true;$('selection').hidden=false;document.querySelector(`[data-side="${selected}"]`).focus({preventScroll:true});}
for(const b of document.querySelectorAll('[data-side]'))b.onclick=()=>start(b.dataset.side);$('change-side').onclick=selection;$('pick-again').onclick=selection;$('rematch').onclick=()=>start(selected);
})();
