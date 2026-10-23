/* Stochastic adversarial tree search shared by the browser and balance simulations. */
(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./engine.js'):root.Battle);if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BattlePlanner=api;})(typeof window!=='undefined'?window:globalThis,function(B){
'use strict';
const other=who=>who==='player'?'enemy':'player';
function clone(s){return {...s,player:{...s.player,pp:s.player.pp.slice()},enemy:{...s.enemy,pp:s.enemy.pp.slice()}};}
function legal(s,who){const f=s[who],moves=B.dex[f.id].moves;const all=[];for(let i=0;i<moves.length;i++)if(f.pp[i]>0)all.push(i);if(!all.length)return [-1];const useful=all.filter(i=>{const m=moves[i];return !(m.kind==='heal'&&f.hp===f.maxHp)&&!(m.kind==='guard'&&f.guard>=m.guard);});return useful.length?useful:all;}
function expected(s,who,i){const a=s[who],t=s[other(who)],m=i<0?B.struggle:B.dex[a.id].moves[i];const boost=m.kind==='boost';const stage=Math.min(3,a.confidence+(boost?1:0));const damage=(m.power||0)*(1+stage*.18)*(1-t.guard)*(boost?.5:1);return {m,damage};}
function rolloutMove(s,who,rng,epsilon=.12){const moves=legal(s,who);if(moves.length===1)return moves[0];const a=s[who],t=s[other(who)];let best=moves[0],score=-Infinity;const scored=[];
for(const i of moves){const {m,damage}=expected(s,who,i);let value=damage-(m.recoil||0)*.9;if(m.kind==='attack'&&damage*.92>=t.hp&&a.hp>(m.recoil||0))return i;
if(m.kind==='heal'){const restored=Math.min(m.heal,a.maxHp-a.hp);value=restored*(a.hp<=75?1.35:.5);}
if(m.guard)value+=Math.max(0,m.guard-a.guard)*30*.8;
if(m.kind==='boost'&&a.confidence<3)value+=(Math.min(3,a.confidence+1)-a.confidence)*30*.18*2;
if(m.debuff)value+=Math.min(t.confidence,m.debuff)*30*.18*1.5;
if(a.hp<=(m.recoil||0)&&damage<t.hp)value-=500;
scored.push({action:i,value});if(value>score){score=value;best=i;}}
if(epsilon===0)return best;
if(rng()<epsilon)return moves[Math.floor(rng()*moves.length)];
const weights=scored.map(e=>Math.exp((e.value-score)/4));let pick=rng()*weights.reduce((a,b)=>a+b,0);for(let i=0;i<scored.length;i++){pick-=weights[i];if(pick<=0)return scored[i].action;}return best;
}
function key(s,who){return who+'|'+[s.player,s.enemy].map(f=>[f.hp,f.confidence,f.guard,...f.pp].join(',')).join('|');}
function node(s,who){return {visits:0,edges:legal(s,who).map(action=>({action,visits:0,total:0,children:new Map()}))};}
function choose(input,who='enemy',rng=Math.random,iterations=192){if(input.over)throw Error('Battle is over');const actions=legal(input,who);if(actions.length===1)return actions[0];const root=node(input,who);
for(let run=0;run<iterations;run++){const s=clone(input);let turn=who,n=root;const nodes=[n],edges=[];let depth=0;
while(!s.over&&depth++<8){const fresh=n.edges.filter(e=>!e.visits);let edge;if(fresh.length)edge=fresh[Math.floor(rng()*fresh.length)];else{const sign=turn===who?1:-1,log=Math.log(Math.max(2,n.visits));edge=n.edges.reduce((a,b)=>sign*b.total/b.visits+1.2*Math.sqrt(log/b.visits)>sign*a.total/a.visits+1.2*Math.sqrt(log/a.visits)?b:a);}
edges.push(edge);B.act(s,turn,edge.action,rng);turn=other(turn);if(s.over)break;const k=key(s,turn);let child=edge.children.get(k);if(!child){child=node(s,turn);edge.children.set(k,child);nodes.push(child);break;}n=child;nodes.push(n);}
for(let tail=0;!s.over&&tail<100;tail++){B.act(s,turn,rolloutMove(s,turn,rng),rng);turn=other(turn);}
const reward=s.over?(s.winner==='draw'?0:s.winner===who?1:-1):(s[who].hp-s[other(who)].hp)/360;
for(const n of nodes)n.visits++;for(const e of edges){e.visits++;e.total+=reward;}}
return root.edges.reduce((a,b)=>b.visits>a.visits||(b.visits===a.visits&&b.total/Math.max(1,b.visits)>a.total/Math.max(1,a.visits))?b:a).action;
}
return {choose,rolloutMove,clone,legal};
});
