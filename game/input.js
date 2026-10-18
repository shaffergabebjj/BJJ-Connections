// Pointer gestures and keyboard/button holds share one input path. CSS pixels,
// not canvas pixels, keep the gesture threshold consistent on a phone.
export class RunInput {
  constructor({canvas, buttons, action, lowState, active, feedback=()=>{}}) {
    Object.assign(this,{canvas,action,lowState,active,feedback});
    this.sources=new Map();this.gestures=new Map();
    for(const [name,button] of Object.entries(buttons)) {
      button.addEventListener('pointerdown',e=>{
        if(e.button!=null&&e.button!==0)return;
        e.preventDefault();try{button.setPointerCapture(e.pointerId);}catch{}
        this.press(`button:${name}:${e.pointerId}`,name);
      });
      const release=e=>{e.preventDefault();this.release(`button:${name}:${e.pointerId}`);};
      for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,release);
      // Native keyboard / assistive-technology activation has no pointer detail.
      button.addEventListener('click',e=>{if(e.detail===0)this.pulse(name);});
    }
    // Prevent browser panning from intercepting gameplay gestures on touchscreens.
    canvas.style.touchAction='none';
    canvas.addEventListener('pointerdown',e=>{
      if(!this.active()||(e.button!=null&&e.button!==0))return;
      e.preventDefault();try{canvas.setPointerCapture(e.pointerId);}catch{}
      const r=canvas.getBoundingClientRect();
      this.gestures.set(e.pointerId,{x:e.clientX,y:e.clientY,time:e.timeStamp,threshold:Math.max(16,Math.min(30,Math.min(r.width,r.height)*.045)),fired:false,moved:0});
    });
    canvas.addEventListener('pointermove',e=>{
      const g=this.gestures.get(e.pointerId);if(!g)return;e.preventDefault();
      const dx=e.clientX-g.x,dy=e.clientY-g.y;g.moved=Math.max(g.moved,Math.hypot(dx,dy));
      if(g.fired||!this.active()||Math.max(Math.abs(dx),Math.abs(dy))<g.threshold)return;
      g.fired=true;
      this.pulse(Math.abs(dy)>=Math.abs(dx)*.85?(dy<0?'jump':'roll'):(dx<0?'shrimp':'roll'));
    });
    canvas.addEventListener('pointerup',e=>{
      const g=this.gestures.get(e.pointerId);if(!g)return;e.preventDefault();
      if(!g.fired){const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.max(Math.abs(dx),Math.abs(dy))>=g.threshold){g.fired=true;this.pulse(Math.abs(dy)>=Math.abs(dx)*.85?(dy<0?'jump':'roll'):(dx<0?'shrimp':'roll'));}}
      this.gestures.delete(e.pointerId);
      // A swipe fires as soon as it crosses the threshold, never a second time
      // on release. A small tap still jumps, including two separate quick taps.
      if(!g.fired&&g.moved<g.threshold&&e.timeStamp-g.time<400)this.pulse('jump');
    });
    for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>this.gestures.delete(e.pointerId));
    // A tab switch or focus loss must never leave Roll/Shrimp held down.
    if(typeof window!=='undefined')window.addEventListener('blur',()=>this.clear());
    if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();});
  }
  press(source,name){
    if(!this.active()||this.sources.has(source))return;
    this.sources.set(source,name);this.action(name,true);this.sync();this.feedback(name);
  }
  release(source){this.sources.delete(source);this.sync();}
  pulse(name){if(!this.active())return;this.action(name,false);this.feedback(name);}
  sync(){this.lowState([...this.sources.values()].includes('roll'),[...this.sources.values()].includes('shrimp'));}
  clear(){this.sources.clear();this.gestures.clear();this.sync();}
}
