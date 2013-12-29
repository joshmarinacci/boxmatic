console.log("inside the canvas amino");
console.log("exported amino = ", this['mymodule']);

var amino = this['amino'];
var input = this['aminoinput'];
amino.sgtest = {
}
var fontmap = {};
var dprint_text = "";
function dprint(str) {
    dprint_text = str;
}
amino.native = {
    list:[],
    
    createDefaultFont: function(path) {
        //console.log('creating native font ' + path);
        return new CanvasFont(this.domctx);
    },
    init: function() {
        console.log("canvas amino doesn't really do an init");
    },
    setEventCallback: function(cb) {
        console.log("pretending to set an event callback");
    },
    createWindow: function(core,w,h) {
        fontmap['source']  = new CanvasFont(this.domctx,'source');//_dirname+"/fonts/SourceSansPro-Regular.ttf");
        fontmap['awesome'] = new CanvasFont(this.domctx,'awesome');//__dirname+"/fonts/fontawesome-webfont.ttf");
        core.defaultFont = fontmap['source'];
        console.log("pretending to open an window:",w,h);
    },
    createRect: function() {
        var rect = {
            "kind":"CanvasRect",
            tx:0,
            ty:0,
            w:100,
            h:100,
            r:0.5,
            g:0.5,
            b:0.5,
            draw: function(g) {
                if(this.visible != 1) return;
                g.save();
                g.translate(this.tx,this.ty);
                g.scale(this.scalex,this.scaley);
                if(this.opacity != 1.0) {
                    g.globalAlpha = this.opacity;
                }
                g.fillStyle = 'rgb('+this.r*255+','+this.g*255+','+this.b*255+')';
                if(this.texid) {
                    //console.log(" now texid = ",this.texid);
                    g.drawImage(this.texid, 0,0);
                } else {
                    g.fillRect(0,0,this.w,this.h);
                }
                g.restore();
            },
        }
        this.list.push(rect);
        return rect;
    },
    createPoly: function() {
        var rect = {
            "kind":"CanvasPoly",
            tx:0,
            ty:0,
            w:100,
            h:100,
            r:0.5,
            g:0.5,
            b:0.5,
            geometry:[0,0,0,  100,0,0,  100,100,0],
            draw: function(g) {
                if(this.visible != 1) return;
                g.save();
                if(this.opacity != 1.0) {
                    g.globalAlpha = this.opacity;
                }
                g.translate(this.tx,this.ty);
                g.scale(this.scalex,this.scaley);
                g.fillStyle = 'rgb('+this.r*255+','+this.g*255+','+this.b*255+')';
                g.beginPath();
                var gm = this.geometry;
                for(var i=0; i<this.geometry.length; i+=3) {
                    if(i == 0) {
                        g.moveTo(gm[i],gm[i+1]);
                    } else {
                        g.lineTo(gm[i],gm[i+1]);
                    }
                }
                if(this.closed) {
                    g.closePath();
                }
                if(this.filled) {
                    g.fill();
                } else {
                    g.stroke();
                }
                g.restore();
            },
        }
        this.list.push(rect);
        return rect;
    },
    createGroup: function() {
        var group = {
            kind:"CanvasGroup",
            children:[],
            tx:0,
            ty:0,
            scalex:1,
            scaley:1,
            draw: function(g) {
                if(this.visible != 1) return;
                g.save();
                g.translate(this.tx,this.ty);
                g.scale(this.scalex,this.scaley);
                
                if(this.cliprect == 1) {
                    g.beginPath();
                    g.rect(0,0,this.w,this.h);
                    g.clip();
                }
                
                for(var i=0; i<this.children.length; i++) {
                    this.children[i].draw(g);
                }
                g.restore();
            }
        }
        this.list.push(group);
        return group;
    },
    createText: function() {
        var text = {
            kind:"CanvasText",
            text:"foo",
            tx:0,
            ty:0,
            draw: function(g) {
                if(this.visible != 1) return;
                g.fillStyle = "rgb("+this.r*255+","+this.g*255+","+this.b*255+")";
                g.font = this.fontSize +"px sans-serif";
                g.fillText(this.text,this.tx,this.ty);
            }
        };
        return text;
    },
    addNodeToGroup: function(h1,h2) {
        h2.children.push(h1);
    },
    removeNodeFromGroup: function(h1, h2) {
        var n = h2.children.indexOf(h1);
        h2.children.splice(n,1);
    },
    
    loadPngToTexture:  function(path,cb) {
        var img = new Image();
        img.onload = function() {
            img.texid = img;
            img.w = img.width;
            img.h = img.height;
            cb(img);
        }
        img.src = path;
    },
    
    loadJpegToTexture: function(path,cb) {
        var img = new Image();
        img.onload = function() {
            img.texid = img;
            img.w = img.width;
            img.h = img.height;
            cb(img);
        }
        img.src = path;
    },
    
    updateProperty: function(handle, key, value) {
        handle[key] = value;
    },
    setRoot: function(root) {
        this.root = root;
    },
    tick: function(core) {
        this.sendValidate();
        this.processAnims(core);
        var w = this.domcanvas.width;
        var h = this.domcanvas.height;
        var g = this.domctx;
        g.fillStyle = "white";
        g.fillRect(0,0,w,h);
        this.root.draw(g);
        //draw debug overlay
        /*
        g.fillStyle = "white";
        g.fillRect(0,0,200,30);
        g.fillStyle = "black";
        g.fillText(dprint_text,30,10);
        */
    },
    setImmediate: function(loop) {
        requestAnimationFrame(loop);
    },
    setWindowSize: function(w,h) {
        //NO OP
    },
    getWindowSize: function() {
        return {
            w: this.domcanvas.width,
            h: this.domcanvas.height
        };
    },
    createPropAnim: function(node, prop, start, end, dur) {
        return new CanvasPropAnim(node,prop,start,end,dur);
    },
    processAnims: function(core) {
        core.anims.forEach(function(anim) {
            anim.update();
        });
    },
    sendValidate: function() {
        input.processEvent(Core._core,{
            type: "validate"
        });
    }
};

function CanvasPropAnim(target,prop,start,end,duration) {
    this.target = target;
    this.prop = prop;
    this.start = start;
    this.end = end;
    this.duration = duration;
    var FORWARD = 1;
    var BACKWARDS = 2;
    var FOREVER = -1;
    var direction = FORWARD;
    this.count = 1;
    var loopcount = 1;
    this.autoreverse = false;
    this.afterCallbacks = [];
    this.beforeCallbacks = [];
    
    this.active = true;
    this.applyValue = function(val) {
        var setter = this.target["set"+camelize(this.prop)];
        if(setter) setter.call(this.target,val);
    }
    
    this.init = function(core) {
        this.startTime = Date.now();
    }
    this.setInterpolator = function(lerptype) {
        this.lerptype = lerptype;
        return this;
    }
    this.setCount = function(count) {
        this.count = count;
        loopcount = this.count;
        return this;
    }
    this.setAutoreverse = function(av) {
        this.autoreverse = av;
        return this;
    }
    this.finish = function() {
        var setterName = "set"+camelize(this.prop);
        var setter = this.node[setterName];
        if(setter) {
            setter.call(this.node,this.end);
        }
        for(var i in this.afterCallbacks) {
            this.afterCallbacks[i]();
        }
    }
    /** @func after(cb)  Sets a callback to be called when the animation finishes. Note: an infinite animation will never finish. */
    this.after = function(cb) {
        this.afterCallbacks.push(cb);
        return this;
    }
    
    this.before = function(cb) {
        this.beforeCallbacks.push(cb);
        return this;
    }
    this.toggle = function() {
        if(this.autoreverse == true) {
            if(direction == FORWARD) {
                direction = BACKWARDS;
            } else {
                direction = FORWARD;
            }
        }
    }
    this.endAnimation = function() {
        this.applyValue(this.end);
        this.active = false;
    }
    this.update = function() {
        if(!this.active) return;
        this.currentTime = Date.now();
        var t = (this.currentTime - this.startTime)/this.duration;
        if(t > 1) {
            if(loopcount == FOREVER) {
                this.startTime = this.currentTime;
                t = 0;
                this.toggle();
            }
            if(loopcount > 0) {
                loopcount--;
                if(loopcount > 0) {
                    t = 0;
                    this.startTime = this.currentTime;
                    this.toggle();
                } else {
                    this.endAnimation();
                    return;
                }
            }
        }
        if(direction == BACKWARDS) {
            t = 1-t;
        }
        var val = (end-start)*t + start;
        this.applyValue(val);
    }
}


input.KEY_MAP.LEFT_ARROW   = 37; //browser right key
input.KEY_MAP.UP_ARROW     = 38; //backspace key
input.KEY_MAP.RIGHT_ARROW  = 39; //browser right key
input.KEY_MAP.DOWN_ARROW   = 40; //backspace key
input.KEY_MAP.BACKSPACE    = 8; //backspace key
input.KEY_MAP.ENTER        = 13; //backspace key
input.KEY_MAP.LEFT_SHIFT   = 16; //backspace key

function CanvasFont(g,name) {
    this.g = g;
    this.name = name;
    this.calcStringWidth = function(str, size, weight, style) {
        g.font = size+"px sans-serif";
        var metrics = this.g.measureText(str);
        return metrics.width;
    };
    this.getHeight = function(size, weight, style) {
        g.font = size+"px sans-serif";
        return this.g.measureText('M').width;
    };
    this.getNative = function(size,weight,style) {
        return this.name;
    };
}

//does platform specific native event handler setup
function attachEvent(node,name,func) {
    if(node.addEventListener) {
        node.addEventListener(name,func,false);
    } else if(node.attachEvent) {
        node.attachEvent(name,func);
    }
};

function toXY(e) {
    var delta = { x: 0, y: 0};
    var t = e.target;
    while(t) {
        delta.x += t.offsetLeft;
        delta.y += t.offsetTop;
        t = t.offsetParent;
    }
    return {
        x:e.pageX - delta.x,
        y:e.pageY - delta.y,
    }
}
amino.setupEventHandlers = function() {
    var self = this;
    var dom = amino.native.domcanvas;
    
    attachEvent(dom,'mousedown',function(e){
        mouseState.pressed = true;
        e.preventDefault();
        var pt = toXY(e);
        input.processEvent(Core._core,{
            type:"mouseposition", 
            x:pt.x,
            y:pt.y,
        });
        input.processEvent(Core._core,{
            type:"mousebutton", 
            button:0, 
            state:1,
        });
    });
    attachEvent(dom,'mousemove',function(e){
        var pt = toXY(e);
        e.preventDefault();
        input.processEvent(Core._core,{
            type:"mouseposition",
            x:pt.x,
            y:pt.y,
        });
    });
    attachEvent(dom,'mouseup',function(e){
        var pt = toXY(e);
        e.preventDefault();
        mouseState.pressed = false;
        input.processEvent(Core._core,{
            type:"mouseposition",
            x:pt.x,
            y:pt.y,
        });
        input.processEvent(Core._core,{
            type:"mousebutton", 
            button:0, 
            state:0
        });
    });
    
    attachEvent(window, 'touchstart', function(e) {
        var pt = toXY(e.touches[0]);
        //dprint("touchstart: " + pt.x + " " + pt.y);
        e.preventDefault();
        input.processEvent(Core._core, {
            type: "mouseposition",
            x:pt.x,
            y:pt.y,
        });
        input.processEvent(Core._core,{
            type:"mousebutton", 
            button:0,
            state:1,
        });
    });
    
    attachEvent(dom,'touchmove',function(e){
        var pt = toXY(e.touches[0]);
        //dprint("touchmove: " + pt.x + " " + pt.y);
        e.preventDefault();
        input.processEvent(Core._core,{
            type:"mouseposition",
            x:pt.x,
            y:pt.y,
        });
    });
    
    attachEvent(dom,'touchend',function(e){
        var pt = toXY(e.changedTouches[0]);
        //dprint("touchend: " + pt.x + " " + pt.y);
        e.preventDefault();
        mouseState.pressed = false;
        input.processEvent(Core._core,{
            type:"mouseposition",
            x:pt.x,
            y:pt.y,
        });
        input.processEvent(Core._core,{
            type:"mousebutton", 
            button:0, 
            state:0
        });
    });
/*    
    attachEvent(window,'keydown',function(e){
        if(e.metaKey) return;
        e.preventDefault();
        console.log(e);
        input.processEvent(Core._core,{
                type:"keypress",
                keycode: e.keyCode,
                shift:   e.shiftKey?1:0,
                control: e.ctrlKey?1:0,
                system:  e.metaKey?1:0,
        });
    });
    attachEvent(window,'keyup',function(e){
        e.preventDefault();
        input.processEvent(Core._core,{
                type:"keyrelease",
                keycode: e.keyCode,
        });
    });
    */
    /*
    if(window.DeviceMotionEvent) {
        console.log("motion IS supported");
        attachEvent(window,'devicemotion',function(e){
            //self.processAccelEvent(Events.AccelerometerChanged, e);
        });
    } else {
        console.log("motion not supported");
    } 
    */
    
}


amino.setCanvas = function(id) {
    if(!id) throw new Error("ID parameter missing to start app");
    var domcanvas = document.getElementById(id);
    if(domcanvas == null) throw new Error("couldn't find canvas with id " + id);
    amino.native.domcanvas = domcanvas;
    amino.native.domctx = domcanvas.getContext('2d');
    if(amino.native.domctx == null) throw new Error("couldn't get a 2d context");
};

amino.startApp = function(cb) {
    if(!cb) throw new Error("CB parameter missing to start app");
    amino.setupEventHandlers();
    Core._core = new Core();
    Core._core.init();
    var stage = Core._core.createStage(600,600);
    cb(Core._core,stage);
    Core._core.start();
}

