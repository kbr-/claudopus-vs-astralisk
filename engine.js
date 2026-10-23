/* Pure combat rules; no DOM, timers, or network. */
(function(root){
'use strict';
const dex={
claudopus:{name:'Claudopus',maxHp:181,moves:[
{id:'caveat',name:'One Small Caveat',kind:'attack',power:21,pp:12,type:'PSYCHIC',desc:'21 power · softens the next blow',guard:.25,line:'It’s not very effective… but the objection is now on record.'},
{id:'review',name:'Request Changes',kind:'attack',power:34,pp:7,type:'FIRE',desc:'34 power · lowers confidence',debuff:1,line:'The pull request has been returned with 47 unresolved threads.'},
{id:'audit',name:'Regression Suite',kind:'guard',pp:4,type:'PSYCHIC',desc:'Blocks 65% of the next attack',guard:.65,line:'Seven arms run the tests. The eighth finds a race condition.'},
{id:'context',name:'Fresh Context',kind:'heal',heal:44,pp:3,type:'RECOVERY',desc:'Recover 44 HP · limited to 3 uses',line:'Claudopus opens a fresh chat. The context fits in memory again.'}]},
astralisk:{name:'Astralisk',maxHp:180,moves:[
{id:'machine',name:'Works on My Machine',kind:'attack',power:32,pp:12,type:'PSYCHIC',desc:'32 power · production was not consulted',line:'The container was not included in the definition of “my machine”.'},
{id:'fix',name:'This Fixes It!',kind:'boost',power:30,pp:5,type:'DRAGON',desc:'Raise confidence · 50% chance of 30 power',line:'The bug is still there.'},
{id:'patch',name:'One More Patch',kind:'attack',power:40,pp:7,type:'DRAGON',desc:'40 power · costs 7 of your own HP',recoil:7,line:'Fixed one bug. Introduced two.'},
{id:'window',name:'Restart the IDE',kind:'heal',heal:44,pp:3,type:'RECOVERY',desc:'Recover 44 HP · limited to 3 uses',line:'A fresh process. The same magnificent optimism.'}]}}
const rules={openingShield:.52};
const struggle={id:'struggle',name:'Struggle',kind:'attack',power:24,type:'NORMAL',recoil:5,desc:'No PP left · 24 power · 5 recoil'};
function fighter(id){return {id,hp:dex[id].maxHp,maxHp:dex[id].maxHp,confidence:0,guard:0,pp:dex[id].moves.map(m=>m.pp)};}
function create(side,first='player'){if(!dex[side])throw Error('Unknown creature');if(first!=='player'&&first!=='enemy')throw Error('Unknown first mover');const state={player:fighter(side),enemy:fighter(side==='claudopus'?'astralisk':'claudopus'),round:1,over:false,winner:null,first};const second=first==='player'?'enemy':'player';state[second].guard=rules.openingShield;state[second].openingGuard=rules.openingShield>0;return state;}
function available(f){return dex[f.id].moves.map((m,i)=>({...m,index:i,left:f.pp[i]}));}
function act(state,who,index,rng=Math.random){
if(state.over)throw Error('Battle is over');
const attacker=state[who],other=who==='player'?'enemy':'player',target=state[other];
let move;
if(index===-1){if(attacker.pp.some(n=>n>0))throw Error('Struggle requires empty PP');move=struggle;}
else {move=dex[attacker.id].moves[index];if(!move||attacker.pp[index]<=0)throw Error('Unavailable move');attacker.pp[index]--;}
const events=[`${dex[attacker.id].name} used ${move.name.toUpperCase()}!`];let damage=0,healed=0;
if(move.kind==='heal'){healed=Math.min(move.heal,attacker.maxHp-attacker.hp);attacker.hp+=healed;events.push(healed?`Recovered ${healed} HP.`:'HP is already full.');}
if(move.kind==='guard'){attacker.guard=Math.max(attacker.guard,move.guard);events.push('Braced for the next attack.');}
if(move.kind==='boost'){attacker.confidence=Math.min(3,attacker.confidence+1);events.push('Confidence rose sharply!');}
const hits=move.kind==='attack'||(move.kind==='boost'&&rng()<.5);
if(hits){const base=Math.round(move.power*(1+attacker.confidence*.18)*(.92+rng()*.16));damage=Math.min(target.hp,Math.max(1,Math.round(base*(1-target.guard))));target.hp-=damage;if(target.guard)events.push(target.openingGuard?'The opening shield softened the first hit.':'The review shield softened the blow.');target.guard=0;target.openingGuard=false;events.push(`${dex[target.id].name} lost ${damage} HP.`);}
if(move.kind==='boost'&&!hits)events.push(move.line);
else if(move.line)events.push(move.line);
if(move.debuff)target.confidence=Math.max(0,target.confidence-move.debuff);
if(move.guard&&move.kind!=='guard')attacker.guard=Math.max(attacker.guard,move.guard);
if(move.recoil){const cost=Math.min(attacker.hp,move.recoil);attacker.hp-=cost;events.push(`${dex[attacker.id].name} took ${cost} recoil damage.`);}
if(target.hp===0||attacker.hp===0){state.over=true;state.winner=target.hp===0?(attacker.hp===0?'draw':who):other;events.push(state.winner==='draw'?'Both engineers fainted. The build is still red.':`${dex[(state.winner==='player'?state.enemy:state.player).id].name} fainted!`);}
return {move,events,damage,healed,who};}
function cpu(state,rng=Math.random){const f=state.enemy;const moves=available(f).filter(m=>m.left>0);if(!moves.length)return -1;const heal=moves.find(m=>m.kind==='heal');if(f.hp<=75&&heal)return heal.index;const weighted=[];for(const m of moves){let w=m.kind==='heal'?0:m.kind==='guard'?1:m.kind==='boost'?(f.confidence<2?3:1):4;for(let i=0;i<w;i++)weighted.push(m.index);}return weighted.length?weighted[Math.floor(rng()*weighted.length)]:moves[0].index;}
const api={dex,rules,struggle,create,available,act,cpu};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Battle=api;
})(typeof window!=='undefined'?window:globalThis);
