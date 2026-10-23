const assert=require('node:assert/strict');const B=require('../engine.js');const previous=B.rules.openingShield;B.rules.openingShield=.5;
try{
let s=B.create('claudopus','player');assert.equal(s.player.guard,0);assert.equal(s.enemy.guard,.5);let r=B.act(s,'player',1,()=>.5);assert.equal(r.damage,17);assert.equal(s.enemy.guard,0);assert.equal(s.enemy.openingGuard,false);r=B.act(s,'player',1,()=>.5);assert.equal(r.damage,34,'Only the first hit is softened');
s=B.create('claudopus','enemy');assert.equal(s.player.guard,.5);assert.equal(s.enemy.guard,0,'Protection follows initiative, not character');
s=B.create('astralisk');r=B.act(s,'player',1,()=>.9);assert.equal(r.damage,0);assert.equal(s.enemy.guard,.5,'A missed boost must not consume the shield');B.act(s,'enemy',2,()=>.5);assert.equal(s.enemy.guard,.65,'A stronger normal guard replaces rather than stacks');B.act(s,'player',0,()=>.5);assert.equal(s.enemy.guard,0);
assert.throws(()=>B.create('claudopus','unknown'),/first mover/);
console.log('Opening shield passed: role symmetry, exact first-hit reduction, one-use expiry, miss preservation, nonstacking guards, valid initiative.');
}finally{B.rules.openingShield=previous;}
