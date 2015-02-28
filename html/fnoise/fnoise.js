// Generated by CoffeeScript 1.9.1
(function() {
  var IO, cb, err, fragmentShader, load, vertexShader;

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

  IO.prototype.load('vertex.glsl', $("#shader-vs"), cb, err);

  IO.prototype.load('fragment.glsl', $("#shader-fs"), cb, err);

  PhiloGL.unpack();

  load = function() {
    var aspect, btnPlusTurb, canvas, frameIndex, frameLast, frameTimes;
    canvas = document.getElementById('fnCanvas');
    aspect = canvas.width / canvas.height;
    frameTimes = [0, 0, 0, 0, 0];
    frameLast = 0;
    frameIndex = 0;
    if (PhiloGL.hasWebGL() === !true) {
      alert("Your browser does not support WebGL");
    }
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
      onLoad: function(app) {
        var draw, time;
        time = Date.now();
        console.log(time);
        draw = function() {
          var avgFPS, ft, i, len, p, tmp;
          p = (Date.now() - 1425166257376) / 20000;
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
              turbulence: turbulence,
              persistence: persistence,
              lacunarity: lacunarity
            }
          });
          return Fx.requestAnimationFrame(draw);
        };
        return draw();
      }
    });
    btnPlusTurb = document.getElementById('turbulence+');
    return btnPlusTurb.addEventListener("click", (function(_this) {
      return function(e) {
        var order;
        order = order >= 30 ? 30 : order + 1;
        document.getElementById('orderTxt').value = order;
        return console.log(order);
      };
    })(this));
  };

  load();

}).call(this);

//# sourceMappingURL=fnoise.js.map
