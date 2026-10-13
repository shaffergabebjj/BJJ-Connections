import {COSMETICS,SKIN_TONES} from './data.js';
const item=id=>COSMETICS.find(c=>c.id===id);

// Canvas-native pixel art. Low poses stay inside the existing 25 × 14 clearance.
export function drawAthlete(renderer,p,t,equipped,belt,{menu=false,dead=false,reduced=false,appearance={}}={}){
  const c=renderer.ctx,R=renderer.rect.bind(renderer);
  const gi=item(equipped.gi)||item('gi-white'),hair=item(equipped.hair)||item('hair-original');
  const rash=item(equipped.rash)||item('rash-dark'),patch=item(equipped.patch)||item('patch-red'),wrist=item(equipped.wrist)||item('wrist-blue');
  const tone=SKIN_TONES.find(x=>x.id===appearance.skin)||SKIN_TONES[1];
  const skin=tone.color,shade=tone.shade,ink='#0b1720',style=appearance.hairStyle||'tousled';
  const low=p.roll>0&&p.grounded,shrimp=p.shrimp||p.shrimpTime>0;
  c.save();c.translate(Math.round(p.x),Math.round(p.y));
  if(menu)c.scale(2.05,2.05);
  if(dead)c.globalAlpha=.55;
  if(low){
    if(shrimp){
      // Heel planted, hips back, bent knee: a backward hip escape.
      R(-12,-13,7,7,skin);R(-12,-14,7,3,hair.color);R(-12,-12,2,4,hair.color);R(-6,-11,1,1,ink);
      if(style==='bun')R(-10,-14,3,3,hair.color);
      R(-7,-8,13,6,ink);R(-6,-8,11,5,gi.color);R(-5,-7,8,2,rash.color);
      R(1,-8,3,6,belt.color);for(let i=0;i<belt.stripes;i++)R(2,-8+i,1,1,'#fff2d7');R(-4,-11,9,3,gi.shade);R(3,-10,3,2,skin);
      R(5,-13,7,5,gi.color);R(7,-9,4,7,gi.shade);R(6,-3,6,3,skin);R(-10,-3,7,3,gi.shade);R(-12,-2,4,2,skin);
    }else{
      // Tucked forward roll. Limbs change position without increasing height.
      const tuck=!reduced&&Math.sin(t*18)>0;
      R(-11,-10,17,8,ink);R(-9,-13,13,10,gi.color);R(-10,-9,7,6,gi.shade);
      R(-5,-12,3,9,belt.color);for(let i=0;i<belt.stripes;i++)R(-5,-11+i*2,3,1,'#fff2d7');R(-8,-11,3,3,patch.color);
      R(3,-12,7,7,skin);R(3,-13,7,3,hair.color);R(3,-12,2,4,hair.color);R(8,-9,1,1,ink);
      if(style==='bun')R(2,-14,3,3,hair.color);
      R(tuck?-11:-9,-5,9,4,gi.shade);R(tuck?-12:-10,-2,4,2,skin);
      R(-1,-6,9,3,gi.color);R(6,-4,5,3,skin);R(4,-6,2,3,wrist.color);
    }
    c.restore();return;
  }
  c.scale(.8,.8);
  const moving=!menu&&!dead&&!reduced;
  const run=moving&&p.grounded?Math.sin(t*19):0;
  const leg=p.grounded?run*3:2,arm=p.grounded?-run*2:-3;
  // Bare feet and gi trousers, separate legs in the running and jump poses.
  R(-8+leg,-9,6,8,shade);R(3-leg,-9,6,8,skin);
  R(-8+leg,-19,6,12,gi.shade);R(2-leg,-19,6,12,gi.color);
  R(-11,-38,22,23,ink);R(-9,-37,18,21,gi.color);R(-9,-36,3,18,gi.shade);
  R(-4,-36,8,9,rash.color);R(-5,-35,3,13,gi.shade);R(2,-35,3,13,gi.shade);
  R(-10,-21,20,3,belt.color);R(1,-21,3,9,belt.color);
  R(3,-21,8,3,belt.belt===4?'#a74348':'#202838');
  for(let i=0;i<belt.stripes;i++)R(3+i*2,-21,1,3,'#fff2d7');
  R(-13,-34+arm,5,15,gi.shade);R(-13,-21+arm,4,5,shade);
  R(9,-34-arm,5,10,gi.color);R(11,-31-arm,5,4,skin);R(13,-35-arm,3,6,skin);R(10,-30-arm,4,2,wrist.color);
  R(-8,-33,4,4,patch.color);R(4-leg,-13,4,4,patch.color);
  R(-5,-43,10,9,ink);R(-3,-42,6,7,shade);R(-6,-52,12,12,skin);R(-6,-51,2,8,shade);
  if(style==='cropped'){
    R(-7,-54,14,3,hair.color);R(-7,-52,2,4,hair.color);R(5,-52,2,4,hair.color);
  }else if(style==='bun'){
    R(-7,-54,14,4,hair.color);R(-8,-52,3,7,hair.color);R(5,-52,2,5,hair.color);R(-7,-57,5,5,hair.color);
  }else{
    R(-7,-54,14,5,hair.color);R(-8,-52,3,5,hair.color);R(5,-52,3,5,hair.color);
    R(-5,-56,4,3,hair.color);R(0,-57,4,4,hair.color);R(4,-55,3,3,hair.color);
  }
  R(-3,-46,2,2,'#252733');R(3,-46,2,2,'#252733');R(-2,-42,6,2,'#fff7e9');
  c.restore();
}
