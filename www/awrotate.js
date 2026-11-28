/* AwareBC map rotation (by Josh Singer). Our own code, written for AwareBC, so the app has no GPL parts.
   Turns a Leaflet 1.9 map: map.setBearing(deg), map.getBearing(), two-finger twist (touchRotate), 'rotate' events.
   How it works: the map's moving layer sits in a wrapper that is turned around the screen centre. Taps, drags and pinches
   are turned back the other way so they land in the right spot, pins and pop-ups stay upright, and when the map is turned
   the tiles and drawings cover a square big enough to fill the corners. */
(function(){
  if(!window.L||!L.Map) return;
  var D2R=Math.PI/180;
  function rot(p,deg){ var a=deg*D2R, c=Math.cos(a), s=Math.sin(a); return L.point(p.x*c-p.y*s,p.x*s+p.y*c) }
  function B(map){ return (map&&map._awOn&&map._awB)||0 }
  function diag(map){ var s=map.getSize(); return Math.ceil(Math.sqrt(s.x*s.x+s.y*s.y)) }
  /* run fn while the map pretends to be a square big enough for any turn */
  function asSquare(map,fn,ctx,args){ if(!B(map)) return fn.apply(ctx,args); var d=diag(map), had=map.hasOwnProperty('getSize'), old=map.getSize;
    map.getSize=function(){ return L.point(d,d) }; try{ return fn.apply(ctx,args) }finally{ if(had) map.getSize=old; else delete map.getSize } }

  L.Map.mergeOptions({rotate:false,bearing:0,touchRotate:false,shiftKeyRotate:false,rotateControl:false});

  L.Map.include({
    getBearing:function(){ return this._awOn?this._awB:0 },
    setBearing:function(deg){ if(!this._awOn) return this; deg=+deg; if(deg!==deg) return this; deg=((deg%360)+360)%360; if(deg>359.95) deg=0;
      var was=this._awB; this._awB=deg; this._awWrap.style.transform=deg?'rotate('+deg+'deg)':'';
      var c=this._container; c.style.setProperty('--awb',deg+'deg'); L.DomUtil[deg?'addClass':'removeClass'](c,'awrot');
      if(!was!==!deg) this._awCover(); /* turned on or off: tiles and drawings switch between the screen and the big square */
      this._awUpright(); this.fire('rotate',{bearing:deg}); return this },
    _awUpright:function(){ var m=this; if(m._awQ) return; m._awQ=1; L.Util.requestAnimFrame(function(){ m._awQ=0; if(!m._loaded) return;
      m.eachLayer(function(l){ if(l._icon&&l.update) l.update(); else if(l instanceof L.Popup&&l._container&&l._updatePosition) l._updatePosition() }) }) },
    _awCover:function(){ var m=this; if(!m._loaded) return; m.eachLayer(function(l){ if(l instanceof L.GridLayer&&l._map) l._update(); else if(l instanceof L.Renderer&&l._map){ l._update(); if(l._redraw) l._redraw() } }) }
  });

  L.Map.addInitHook(function(){ if(!this.options.rotate) return;
    var map=this, c=map._container, pane=map._mapPane, w=L.DomUtil.create('div','awrotwrap');
    w.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:50% 50%';
    c.insertBefore(w,pane); w.appendChild(pane); map._awWrap=w; map._awOn=true; map._awB=0;
    /* screen (container) point <-> layer point, through the turn */
    map.containerPointToLayerPoint=function(p){ p=L.point(p); var b=B(this); if(b){ var h=this.getSize().divideBy(2); p=rot(p.subtract(h),-b).add(h) } return p.subtract(this._getMapPanePos()) };
    map.layerPointToContainerPoint=function(p){ p=L.point(p).add(this._getMapPanePos()); var b=B(this); if(b){ var h=this.getSize().divideBy(2); p=rot(p.subtract(h),b).add(h) } return p };
    var mec=map.mouseEventToContainerPoint; map.mouseEventToContainerPoint=function(e){ var p=mec.call(this,e); if(this._awUnturn&&B(this)){ var h=this.getSize().divideBy(2); p=rot(p.subtract(h),-B(this)).add(h) } return p };
    var gpb=map.getPixelBounds; map.getPixelBounds=function(center,zoom){ if(!B(this)) return gpb.call(this,center,zoom); var z=zoom===undefined?this.getZoom():zoom, pc=this.project(center||this.getCenter(),z), h=diag(this)/2; return new L.Bounds(pc.subtract([h,h]),pc.add([h,h])) };
    if(map.options.bearing) map.setBearing(map.options.bearing);
  });

  /* tiles cover the big square while turned */
  var gtb=L.GridLayer.prototype._getTiledPixelBounds; L.GridLayer.prototype._getTiledPixelBounds=function(center){ return asSquare(this._map,gtb,this,[center]) };
  /* drawings (canvas / svg) too */
  var rup=L.Renderer.prototype._update; L.Renderer.prototype._update=function(){ var map=this._map; if(!B(map)) return rup.call(this);
    var p=this.options.padding, half=diag(map)*(0.5+p), cl=map.containerPointToLayerPoint(map.getSize().divideBy(2)), min=cl.subtract([half,half]).round();
    this._bounds=new L.Bounds(min,min.add([half*2,half*2]).round()); this._center=map.getCenter(); this._zoom=map.getZoom() };
  var rut=L.Renderer.prototype._updateTransform; L.Renderer.prototype._updateTransform=function(center,zoom){ var map=this._map; if(!B(map)) return rut.call(this,center,zoom);
    var scale=map.getZoomScale(zoom,this._zoom), half=diag(map)*(0.5+this.options.padding), tl=L.point(half,half).multiplyBy(-scale).add(map.project(this._center,zoom)).subtract(map._getNewPixelOrigin(center,zoom));
    if(L.Browser.any3d) L.DomUtil.setTransform(this._container,tl,scale); else L.DomUtil.setPosition(this._container,tl) };

  /* dragging the map follows your finger on a turned map */
  var dup=L.Draggable.prototype._updatePosition; L.Draggable.prototype._updatePosition=function(){ var b=this._awMap&&B(this._awMap);
    if(b&&this._newPos&&this._startPos) this._newPos=this._startPos.add(rot(this._newPos.subtract(this._startPos),-b)); return dup.call(this) };
  /* the turned wrapper looks bigger to Leaflet's scale check, so the map drag uses true scale 1 */
  var dod=L.Draggable.prototype._onDown; L.Draggable.prototype._onDown=function(e){ var r=dod.call(this,e); if(this._awMap&&this._parentScale) this._parentScale={x:1,y:1,boundingClientRect:this._parentScale.boundingClientRect}; return r };
  var dah=L.Map.Drag.prototype.addHooks; L.Map.Drag.prototype.addHooks=function(){ dah.call(this); if(this._draggable) this._draggable._awMap=this._map };
  /* pinch-zoom keeps the spot between your fingers still */
  if(L.Map.TouchZoom){ var tzm=L.Map.TouchZoom.prototype._onTouchMove; L.Map.TouchZoom.prototype._onTouchMove=function(e){ var m=this._map; m._awUnturn=true;
    var cp=this._centerPoint; try{ return tzm.call(this,e) }finally{ m._awUnturn=false; this._centerPoint=cp } } }

  /* pins and pop-ups stay upright, turning around their own anchor */
  var msp=L.Marker.prototype._setPos; L.Marker.prototype._setPos=function(pos){ msp.call(this,pos); var b=B(this._map);
    [this._icon,this._shadow].forEach(function(el){ if(!el) return; if(b){ el.style.transformOrigin=(-(parseFloat(el.style.marginLeft)||0))+'px '+(-(parseFloat(el.style.marginTop)||0))+'px'; el.style.transform+=' rotate('+(-b)+'deg)' } else if(el.style.transformOrigin) el.style.transformOrigin='' }) };
  var pup=L.Popup.prototype._updatePosition; L.Popup.prototype._updatePosition=function(){ pup.call(this); var b=B(this._map), el=this._container; if(!el) return;
    if(b){ el.style.transformOrigin='50% calc(100% + 20px)'; el.style.transform=(el.style.transform||'')+' rotate('+(-b)+'deg)' } else el.style.transformOrigin='' };
  if(L.Tooltip){ var tsp=L.Tooltip.prototype._setPosition; L.Tooltip.prototype._setPosition=function(pos){ tsp.call(this,pos); var b=B(this._map), el=this._container; if(el&&b) el.style.transform+=' rotate('+(-b)+'deg)' } }

  /* two-finger twist turns the map (after a small deadband, so pinching alone doesn't turn it) */
  L.Map.TouchRotate=L.Handler.extend({
    addHooks:function(){ L.DomEvent.on(this._map._container,'touchstart',this._start,this) },
    removeHooks:function(){ L.DomEvent.off(this._map._container,'touchstart',this._start,this) },
    _ang:function(e){ var a=e.touches[0], b=e.touches[1]; return Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX)/D2R },
    _start:function(e){ var m=this._map; if(!m._awOn||!e.touches||e.touches.length!==2) return; this._a0=this._ang(e); this._b0=m.getBearing(); this._on=false;
      L.DomEvent.on(document,'touchmove',this._move,this); L.DomEvent.on(document,'touchend touchcancel',this._end,this) },
    _move:function(e){ if(!e.touches||e.touches.length!==2) return; var d=this._ang(e)-this._a0; d=((d+540)%360)-180;
      if(!this._on){ if(Math.abs(d)<12) return; this._on=true; this._a0+=d>0?12:-12; d+=d>0?-12:12; this._map.fire('rotatestart') }
      this._map.setBearing(this._b0+d) },
    _end:function(e){ if(e.touches&&e.touches.length>=2) return; L.DomEvent.off(document,'touchmove',this._move,this); L.DomEvent.off(document,'touchend touchcancel',this._end,this); if(this._on) this._map.fire('rotateend'); this._on=false }
  });
  L.Map.addInitHook('addHandler','touchRotate',L.Map.TouchRotate);
  L.Map.addInitHook(function(){ if(!this.options.rotate&&this.touchRotate) this.touchRotate.disable() });
})();
