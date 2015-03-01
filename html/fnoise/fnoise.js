// Generated by CoffeeScript 1.9.1
(function() {
  var IO, Viewer, cb, err, fragmentShader, gui, vertexShader, viewer,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  PhiloGL.unpack();

  Viewer = (function() {
    var aspect, canvas, center, dragCurrent, dragStart, flip, frameIndex, frameLast, frameTimes, lacunarity, mouseDragging, p, persistence, speed;

    canvas = document.getElementById('fnCanvas');

    aspect = canvas.width / canvas.height;

    frameTimes = [0, 0, 0, 0, 0];

    frameLast = 0;

    frameIndex = 0;

    p = Date.now() / 1000000000;

    Viewer.prototype.turbulence = 0.03;

    Viewer.prototype.tfrequency = 0.5;

    persistence = 2.0;

    lacunarity = 2.0;

    speed = 1.0;

    flip = false;

    center = {
      x: 0.0,
      y: 0.0
    };

    mouseDragging = false;

    dragStart = {
      x: 0,
      y: 0
    };

    dragCurrent = {
      x: 0,
      y: 0
    };

    function Viewer(turbulence, tfrequency) {
      if (turbulence == null) {
        turbulence = this.turbulence;
      }
      if (tfrequency == null) {
        tfrequency = this.tfrequency;
      }
      this.load = bind(this.load, this);
      this.turbulence = turbulence;
      this.tfrequency = tfrequency;
    }

    if (PhiloGL.hasWebGL() === !true) {
      alert("Your browser does not support WebGL");
    }

    Viewer.prototype.load = function() {
      var btnPlusLac, btnPlusPers, btnPlusSpd, btnPlusTF, btnPlusTurb, btnSubPers, btnSubTF, btnSubTurb, getMousePos;
      PhiloGL('fnCanvas', {
        program: [
          {
            id: 'fnoise',
            from: 'uris',
            path: './',
            vs: 'vertex.glsl',
            fs: 'fragment.glsl'
          }
        ],
        onError: (function(_this) {
          return function(e) {
            return console.log(e);
          };
        })(this),
        onLoad: (function(_this) {
          return function(app) {
            var draw, time;
            time = Date.now();
            document.getElementById('turbulenceTxt').value = _this.turbulence;
            document.getElementById('tfrequencyTxt').value = _this.tfrequency;
            document.getElementById('persistenceTxt').value = persistence;
            document.getElementById('lacunarityTxt').value = lacunarity;
            document.getElementById('speedTxt').value = speed;
            document.getElementById('flip').value = flip;
            draw = function() {
              var avgFPS, ft, i, len, tmp;
              p += speed * 0.0002;
              tmp = Date.now();
              frameTimes[++frameIndex % 5] = 1000 / (tmp - frameLast);
              frameLast = tmp;
              avgFPS = 0;
              for (i = 0, len = frameTimes.length; i < len; i++) {
                ft = frameTimes[i];
                avgFPS += ft;
              }
              avgFPS /= 5.0;
              if (frameIndex % 5 === 0) {
                document.getElementById('fpsTxt').value = Math.round(avgFPS);
              }
              Media.Image.postProcess({
                width: canvas.width,
                height: canvas.height,
                toScreen: true,
                aspectRatio: 1,
                program: 'fnoise',
                uniforms: {
                  p: p,
                  aspect: aspect,
                  turbulence: _this.turbulence,
                  tfrequency: _this.tfrequency,
                  persistence: persistence,
                  lacunarity: lacunarity,
                  dX: aspect * (center.x + dragStart.x - dragCurrent.x) / canvas.width,
                  dY: (center.y + dragCurrent.y - dragStart.y) / canvas.height,
                  flip: flip
                }
              });
              return Fx.requestAnimationFrame(draw);
            };
            return draw();
          };
        })(this)
      });
      btnPlusTurb = document.getElementById('turbulence+');
      btnPlusTurb.addEventListener("click", (function(_this) {
        return function(e) {
          _this.turbulence *= 1.1;
          document.getElementById('turbulenceTxt').value = _this.turbulence;
          return console.log(_this.turbulence);
        };
      })(this));
      btnSubTurb = document.getElementById('turbulence-');
      btnSubTurb.addEventListener("click", (function(_this) {
        return function(e) {
          _this.turbulence /= 1.1;
          document.getElementById('turbulenceTxt').value = _this.turbulence;
          return console.log(_this.turbulence);
        };
      })(this));
      btnPlusTF = document.getElementById('tfrequency+');
      btnPlusTF.addEventListener("click", (function(_this) {
        return function(e) {
          _this.tfrequency *= 1.1;
          document.getElementById('tfrequencyTxt').value = _this.tfrequency;
          return console.log(_this.tfrequency);
        };
      })(this));
      btnSubTF = document.getElementById('tfrequency-');
      btnSubTF.addEventListener("click", (function(_this) {
        return function(e) {
          _this.tfrequency /= 1.1;
          document.getElementById('tfrequencyTxt').value = _this.tfrequency;
          return console.log(_this.tfrequency);
        };
      })(this));
      btnPlusPers = document.getElementById('persistence+');
      btnPlusPers.addEventListener("click", (function(_this) {
        return function(e) {
          persistence = persistence >= 5.0 ? 5.0 : persistence + 0.1;
          document.getElementById('persistenceTxt').value = persistence;
          return console.log(persistence);
        };
      })(this));
      btnSubPers = document.getElementById('persistence-');
      btnSubPers.addEventListener("click", (function(_this) {
        return function(e) {
          persistence = persistence <= 0.0 ? 0.0 : persistence - 0.1;
          document.getElementById('persistenceTxt').value = persistence;
          return console.log(persistence);
        };
      })(this));
      btnPlusLac = document.getElementById('lacunarity+');
      btnPlusLac.addEventListener("click", (function(_this) {
        return function(e) {
          lacunarity = lacunarity >= 5.0 ? 5.0 : lacunarity + 0.1;
          document.getElementById('lacunarityTxt').value = lacunarity;
          return console.log(lacunarity);
        };
      })(this));
      btnPlusLac = document.getElementById('lacunarity-');
      btnPlusLac.addEventListener("click", (function(_this) {
        return function(e) {
          lacunarity = lacunarity <= 0.0 ? 0.0 : lacunarity - 0.1;
          document.getElementById('lacunarityTxt').value = lacunarity;
          return console.log(lacunarity);
        };
      })(this));
      btnPlusSpd = document.getElementById('speed+');
      btnPlusSpd.addEventListener("click", (function(_this) {
        return function(e) {
          speed *= 1.1;
          document.getElementById('speedTxt').value = speed;
          console.log(speed);
          return console.log(p);
        };
      })(this));
      btnPlusSpd = document.getElementById('speed-');
      btnPlusSpd.addEventListener("click", (function(_this) {
        return function(e) {
          speed /= 1.1;
          document.getElementById('speedTxt').value = speed;
          console.log(speed);
          return console.log(p);
        };
      })(this));
      document.getElementById('flip').addEventListener("click", (function(_this) {
        return function(e) {
          return flip = $("#flip").is(':checked');
        };
      })(this));
      getMousePos = (function(_this) {
        return function(event) {
          var rect;
          rect = canvas.getBoundingClientRect();
          return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          };
        };
      })(this);
      canvas.addEventListener("mousedown", (function(_this) {
        return function(e) {
          dragStart = dragCurrent = getMousePos(e);
          return mouseDragging = true;
        };
      })(this));
      canvas.addEventListener("mousemove", (function(_this) {
        return function(e) {
          if (mouseDragging) {
            return dragCurrent = getMousePos(e);
          }
        };
      })(this));
      return canvas.addEventListener("mouseup", (function(_this) {
        return function(e) {
          mouseDragging = false;
          center.x = center.x + dragStart.x - dragCurrent.x;
          center.y = center.y + dragCurrent.y - dragStart.y;
          return dragStart = dragCurrent = {
            x: 0.0,
            y: 0.0
          };
        };
      })(this));
    };

    return Viewer;

  })();

  viewer = new Viewer();

  viewer.load();

  gui = new dat.GUI();

  gui.add(viewer, 'turbulence').min(0);

  IO = (function() {
    function IO() {}

    return IO;

  })();

  IO.prototype.load = function(url, store, cb, cbErr) {
    var req;
    req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function() {
      if (req.readyState === 4) {
        if (req.status === 200) {
          return cb(store, req.responseText);
        } else {
          return cbErr(url);
        }
      }
    };
    return req.send(null);
  };

  cb = function(sh, txt) {
    sh.text(txt);
    return console.log(sh);
  };

  err = function(url) {
    return alert("failed to load " + url);
  };

  vertexShader = {
    text: null
  };

  fragmentShader = {
    text: null
  };

}).call(this);

//# sourceMappingURL=fnoise.js.map
