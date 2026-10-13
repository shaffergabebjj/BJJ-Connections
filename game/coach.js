// Read-only cues derived from the same world coordinates used by collision.
export function movementCue(game){
  if(!game||game.dead||game.complete)return null;
  const px=game.world+game.p.x;
  const next=[...game.objects.filter(o=>o.kind==='obstacle'),...game.terrain.filter(o=>o.type==='gap')]
    .filter(o=>o.x+o.w>px-12&&o.x<px+game.speed*1.6).sort((a,b)=>a.x-b.x)[0];
  if(!next)return null;
  const urgent=(next.x-px)/game.speed<.65;
  if(next.overhead)return{move:'roll',label:game.p.roll>0?'STAY LOW':'ROLL',detail:'Hold until you clear the barrier',urgent};
  const high=['mats','bench','podium'].includes(next.type);
  if(!game.p.grounded){
    if(high&&game.p.jumps<2)return{move:'jump',label:'JUMP AGAIN',detail:'Second jump ready',urgent};
    return{move:'clear',label:'LAND CLEAR',detail:next.type==='gap'?'Get past the far edge':'Clear the whole obstacle',urgent:false};
  }
  return{move:'jump',label:high?'DOUBLE JUMP':'JUMP',detail:next.type==='gap'?'Cross the mat gap':high?'Use both jumps for extra clearance':'Over the equipment',urgent};
}

export function jumpsAvailable(player){return player.grounded||player.coyote>0?2:Math.max(0,2-Math.max(1,player.jumps));}
