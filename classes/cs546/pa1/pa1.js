// Generated by CoffeeScript 1.9.1
(function() {
  var Circle, Color, DrawingCanvas, Ellipse, Geometry, Line, Polygon, Polyline, Rectangle, drawingCanvas, ui,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Geometry = (function() {
    function Geometry() {}

    return Geometry;

  })();

  Geometry.prototype.distance = function(arg, arg1) {
    var dx, dy, x1, x2, y1, y2;
    x1 = arg.x, y1 = arg.y;
    x2 = arg1.x, y2 = arg1.y;
    dx = x2 - x1;
    dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  };

  Geometry.prototype.tags = {
    LINE: 'line',
    CIRCLE: 'circle',
    ELLIPSE: 'ellipse',
    RECTANGLE: 'rectangle',
    POLYGON: 'polygon',
    POLYLINE: 'polyline'
  };

  Geometry.prototype.createPrimitive = function(drawMode, mouse) {
    var defaultColor;
    defaultColor = new Color(0, 0, 0);
    switch (drawMode) {
      case this.tags.LINE:
        return new Line(mouse, mouse, defaultColor);
      case this.tags.CIRCLE:
        return new Circle(mouse, 0, defaultColor);
      case this.tags.ELLIPSE:
        return new Ellipse(mouse, 0, 0, defaultColor);
      case this.tags.RECTANGLE:
        return new Rectangle(mouse, mouse, defaultColor);
      case this.tags.POLYGON:
        return new Polygon([mouse, mouse], defaultColor);
      case this.tags.POLYLINE:
        return new Polyline([mouse, mouse], defaultColor);
      default:
        return new Line(mouse, mouse, defaultColor);
    }
  };

  Color = (function() {
    Color.prototype.r = 255;

    Color.prototype.g = 255;

    Color.prototype.b = 255;

    Color.prototype.a = 255;

    function Color(r, g, b, a) {
      if (r == null) {
        r = this.r;
      }
      if (g == null) {
        g = this.g;
      }
      if (b == null) {
        b = this.b;
      }
      if (a == null) {
        a = this.a;
      }
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
    }

    Color.prototype.write = function(x, y, canvas, p) {
      var a, b, c, colorA, colorB, g, index, r;
      if (p == null) {
        p = 0;
      }
      index = (x + y * canvas.width) * 4;
      if (canvas.antialiasing) {
        colorB = this;
        r = canvas.data.data[index + 0];
        g = canvas.data.data[index + 1];
        b = canvas.data.data[index + 2];
        a = canvas.data.data[index + 3];
        colorA = new Color(r, g, b, a);
        c = Color.prototype.alphaBlend(colorA, colorB, p);
        canvas.data.data[index + 0] = c.r;
        canvas.data.data[index + 1] = c.g;
        canvas.data.data[index + 2] = c.b;
        return canvas.data.data[index + 3] = c.a;
      } else {
        canvas.data.data[index + 0] = this.r;
        canvas.data.data[index + 1] = this.g;
        canvas.data.data[index + 2] = this.b;
        return canvas.data.data[index + 3] = this.a;
      }
    };

    return Color;

  })();

  Color.prototype.interpolate = function(c1, c2, p) {
    var a, b, g, p1, p2, r;
    p2 = p < 0.0 ? 0.0 : p > 1.0 ? 1.0 : p;
    p1 = 1.0 - p2;
    r = Math.floor(p1 * c1.r + p2 * c2.r);
    g = Math.floor(p1 * c1.g + p2 * c2.g);
    b = Math.floor(p1 * c1.b + p2 * c2.b);
    a = Math.floor(p1 * c1.a + p2 * c2.a);
    return new Color(r, g, b, a);
  };

  Color.prototype.alphaBlend = function(c1, c2, p) {
    var a, b, d, g, r;
    d = Math.floor(p * c2.a);
    r = Math.floor((c1.a * c1.r) / 255.0 - (c1.a - 255.0) * d * c2.r / 65025.0);
    g = Math.floor((c1.a * c1.g) / 255.0 - (c1.a - 255.0) * d * c2.g / 65025.0);
    b = Math.floor((c1.a * c1.b) / 255.0 - (c1.a - 255.0) * d * c2.b / 65025.0);
    a = Math.floor(c1.a + d - c1.a * d / 255.0);
    return new Color(r, g, b, a);
  };

  Line = (function() {
    Line.prototype.pt1 = {
      x: 0,
      y: 0
    };

    Line.prototype.pt2 = {
      x: 0,
      y: 0
    };

    Line.prototype.col1 = new Color();

    Line.prototype.col2 = new Color();

    function Line(pt1, pt2, col1, col2) {
      if (pt1 == null) {
        pt1 = this.pt1;
      }
      if (pt2 == null) {
        pt2 = this.pt2;
      }
      if (col1 == null) {
        col1 = this.col1;
      }
      if (col2 == null) {
        col2 = col1;
      }
      this.pt1 = pt1;
      this.pt2 = pt2;
      this.col1 = col1;
      this.col2 = col2;
    }

    Line.prototype.distance = function() {
      return Geometry.prototype.distance(this.pt1, this.pt2);
    };

    Line.prototype.drag = function(mouse) {
      return this.pt2 = mouse;
    };

    Line.prototype.draw = function(canvas) {
      var a0, a1, b0, b1, color, dist, dx, dy, err, fpart, g0, g1, gradient, i, intery, ipart, j, p, p1, p2, pix, point, r0, r1, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, results, results1, rfpart, round, steep, step, sx, sy, x, x0, x1, xend, xgap, xpxl1, xpxl2, y0, y1, yend, ypxl1, ypxl2;
      if (canvas.antialiasing) {
        ipart = function(x) {
          return Math.floor(x);
        };
        round = function(x) {
          return Math.round(x);
        };
        fpart = function(x) {
          if (x < 0) {
            return 1 - (x - ipart(x));
          } else {
            return x - ipart(x);
          }
        };
        rfpart = function(x) {
          return 1 - fpart(x);
        };
        ref = [this.pt1.x, this.pt1.y], x0 = ref[0], y0 = ref[1];
        ref1 = [this.pt2.x, this.pt2.y], x1 = ref1[0], y1 = ref1[1];
        ref2 = [this.col1.r, this.col1.g, this.col1.b, this.col1.a], r0 = ref2[0], g0 = ref2[1], b0 = ref2[2], a0 = ref2[3];
        ref3 = [this.col2.r, this.col2.g, this.col2.b, this.col2.a], r1 = ref3[0], g1 = ref3[1], b1 = ref3[2], a1 = ref3[3];
        steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
        if (steep) {
          ref4 = [y0, x0, y1, x1], x0 = ref4[0], y0 = ref4[1], x1 = ref4[2], y1 = ref4[3];
        }
        if (x0 > x1) {
          ref5 = [x1, x0, y1, y0], x0 = ref5[0], x1 = ref5[1], y0 = ref5[2], y1 = ref5[3];
        }
        ref6 = [x1 - x0, y1 - y0], dx = ref6[0], dy = ref6[1];
        gradient = dy / dx;
        xend = round(x0);
        yend = y0 + gradient * (xend - x0);
        xgap = rfpart(x0 + 0.5);
        xpxl1 = xend;
        ypxl1 = ipart(yend);
        if (steep) {
          this.col1.write(ypxl1, xpxl1, canvas, rfpart(yend) * xgap);
          this.col1.write(ypxl1 + 1, xpxl1, canvas, fpart(yend) * xgap);
        } else {
          this.col1.write(xpxl1, ypxl1, canvas, rfpart(yend) * xgap);
          this.col1.write(xpxl1, ypxl1 + 1, canvas, fpart(yend) * xgap);
        }
        intery = yend + gradient;
        xend = round(x1);
        yend = y1 + gradient * (xend - x1);
        xgap = fpart(x1 + 0.5);
        xpxl2 = xend;
        ypxl2 = ipart(yend);
        if (steep) {
          this.col2.write(ypxl2, xpxl2, canvas, rfpart(yend) * xgap);
          this.col2.write(ypxl2 + 1, xpxl2, canvas, fpart(yend) * xgap);
        } else {
          this.col2.write(xpxl2, ypxl2, canvas, rfpart(yend) * xgap);
          this.col2.write(xpxl2, ypxl2 + 1, canvas, fpart(yend) * xgap);
        }
        results = [];
        for (i = j = ref7 = xpxl1 + 1, ref8 = xpxl2; ref7 <= ref8 ? j <= ref8 : j >= ref8; i = ref7 <= ref8 ? ++j : --j) {
          x = i;
          if (steep) {
            p1 = {
              x: ipart(intery),
              y: x
            };
            p2 = {
              x: ipart(intery + 1),
              y: x
            };
            point = {
              x: (p1.x + p2.x) / 2.0,
              y: (p1.y + p2.y) / 2.0
            };
            p = Geometry.prototype.distance(this.pt1, point) / this.distance();
            color = Color.prototype.interpolate(this.col1, this.col2, p);
            color.write(p1.x, p1.y, canvas, rfpart(intery));
            color.write(p2.x, p2.y, canvas, fpart(intery));
          } else {
            p1 = {
              x: x,
              y: ipart(intery)
            };
            p2 = {
              x: x,
              y: ipart(intery) + 1
            };
            point = {
              x: (p1.x + p2.x) / 2.0,
              y: (p1.y + p2.y) / 2.0
            };
            p = Geometry.prototype.distance(this.pt1, point) / this.distance();
            color = Color.prototype.interpolate(this.col1, this.col2, p);
            color.write(p1.x, p1.y, canvas, rfpart(intery));
            color.write(p2.x, p2.y, canvas, fpart(intery));
          }
          results.push(intery += gradient);
        }
        return results;
      } else {
        dx = Math.abs(this.pt2.x - this.pt1.x);
        dy = Math.abs(this.pt2.y - this.pt1.y);
        sx = this.pt1.x < this.pt2.x ? 1 : -1;
        sy = this.pt1.y < this.pt2.y ? 1 : -1;
        err = dx - dy;
        dist = this.distance();
        pix = {
          point: {
            x: this.pt1.x,
            y: this.pt1.y
          },
          color: new Color(this.col1.r, this.col1.g, this.col1.b, this.col1.a)
        };
        step = (function(_this) {
          return function() {
            var e2;
            p = Geometry.prototype.distance(_this.pt1, pix.point) / dist;
            pix.color = Color.prototype.interpolate(_this.col1, _this.col2, p);
            pix.color.write(pix.point.x, pix.point.y, canvas);
            e2 = 2 * err;
            if (e2 > -dy) {
              err -= dy;
              pix.point.x += sx;
            }
            if (e2 < dx) {
              err += dx;
              pix.point.y += sy;
            }
          };
        })(this);
        results1 = [];
        while (!(pix.point.x === this.pt2.x && pix.point.y === this.pt2.y)) {
          results1.push(step());
        }
        return results1;
      }
    };

    return Line;

  })();

  Circle = (function() {
    Circle.prototype.center = {
      x: 0,
      y: 0
    };

    Circle.prototype.radius = 0;

    Circle.prototype.color = new Color();

    function Circle(center, radius, color) {
      if (center == null) {
        center = this.center;
      }
      if (radius == null) {
        radius = this.radius;
      }
      if (color == null) {
        color = this.color;
      }
      this.center = center;
      this.radius = radius;
      this.color = color;
    }

    Circle.prototype.drag = function(mouse) {
      return this.radius = Geometry.prototype.distance(mouse, this.center);
    };

    Circle.prototype.draw = function(canvas) {
      var color, cx, cy, radiusError, results, step, write, x, y;
      x = Math.round(this.radius);
      y = 0;
      radiusError = 1 - x;
      color = this.color;
      cx = Math.round(this.center.x);
      cy = Math.round(this.center.y);
      write = (function(_this) {
        return function(x, y) {
          return color.write(x + cx, y + cy, canvas);
        };
      })(this);
      step = function() {
        write(+x, +y);
        write(+y, +x);
        write(-x, +y);
        write(-y, +x);
        write(-x, -y);
        write(-y, -x);
        write(+x, -y);
        write(+y, -x);
        y++;
        if (radiusError < 0) {
          return radiusError += 2 * y + 1;
        } else {
          x--;
          return radiusError += 2 * (y - x) + 1;
        }
      };
      results = [];
      while (x >= y) {
        results.push(step());
      }
      return results;
    };

    return Circle;

  })();

  Ellipse = (function() {
    Ellipse.prototype.center = {
      x: 0,
      y: 0
    };

    Ellipse.prototype.a = 0;

    Ellipse.prototype.b = 0;

    Ellipse.prototype.color = new Color();

    function Ellipse(center, a, b, color) {
      if (center == null) {
        center = this.center;
      }
      if (a == null) {
        a = this.a;
      }
      if (b == null) {
        b = this.b;
      }
      if (color == null) {
        color = this.color;
      }
      this.center = center;
      this.a = a;
      this.b = b;
      this.color = color;
    }

    Ellipse.prototype.drag = function(mouse) {
      this.a = Math.abs(mouse.x - this.center.x);
      return this.b = Math.abs(mouse.y - this.center.y);
    };

    Ellipse.prototype.draw = function(canvas) {
      var a2, b2, color, cx, cy, p, px, py, results, step1, step2, twoa2, twob2, write, writeQuadrants, x, y;
      a2 = this.a * this.a;
      b2 = this.b * this.b;
      twoa2 = 2 * a2;
      twob2 = 2 * b2;
      x = 0;
      y = this.b;
      px = 0;
      py = twoa2 * y;
      color = this.color;
      cx = Math.round(this.center.x);
      cy = Math.round(this.center.y);
      write = function(x, y) {
        return color.write(x + cx, y + cy, canvas);
      };
      writeQuadrants = function(x, y) {
        write(+x, +y);
        write(-x, +y);
        write(+x, -y);
        return write(-x, -y);
      };
      p = Math.round(b2 - (a2 * this.b) + (0.25 * a2));
      step1 = function() {
        x++;
        px += twob2;
        if (p < 0) {
          p += b2 + px;
        } else {
          y--;
          py -= twoa2;
          p += b2 + px - py;
        }
        return writeQuadrants(x, y);
      };
      while (px < py) {
        step1();
      }
      p = Math.round(-a2 * b2 + a2 * y * y - 2 * a2 * y + a2 + b2 * x * x + b2 * x + 0.25 * b2);
      step2 = function() {
        y--;
        py -= twoa2;
        if (p > 0) {
          p += a2 - py;
        } else {
          x++;
          px += twob2;
          p += a2 - py + px;
        }
        return writeQuadrants(x, y);
      };
      results = [];
      while (y > 0) {
        results.push(step2());
      }
      return results;
    };

    return Ellipse;

  })();

  Rectangle = (function() {
    Rectangle.prototype.pt1 = {
      x: 0,
      y: 0
    };

    Rectangle.prototype.pt2 = {
      x: 0,
      y: 0
    };

    Rectangle.prototype.color = new Color();

    function Rectangle(pt1, pt2, color) {
      if (pt1 == null) {
        pt1 = this.pt1;
      }
      if (pt2 == null) {
        pt2 = this.pt2;
      }
      if (color == null) {
        color = this.color;
      }
      this.pt1 = pt1;
      this.pt2 = pt2;
      this.color = color;
    }

    Rectangle.prototype.drag = function(mouse) {
      return this.pt2 = mouse;
    };

    Rectangle.prototype.draw = function(canvas) {
      var j, len1, line, lines, pt3, pt4, results;
      pt3 = {
        x: this.pt2.x,
        y: this.pt1.y
      };
      pt4 = {
        x: this.pt1.x,
        y: this.pt2.y
      };
      lines = [new Line(this.pt1, pt3, this.color), new Line(pt3, this.pt2, this.color), new Line(pt4, this.pt2, this.color), new Line(this.pt1, pt4, this.color)];
      results = [];
      for (j = 0, len1 = lines.length; j < len1; j++) {
        line = lines[j];
        results.push(line.draw(canvas));
      }
      return results;
    };

    return Rectangle;

  })();

  Polygon = (function() {
    Polygon.prototype.vertices = [];

    Polygon.prototype.color = new Color();

    function Polygon(vertices, color) {
      if (vertices == null) {
        vertices = this.vertices;
      }
      if (color == null) {
        color = this.color;
      }
      this.vertices = vertices;
      this.color = color;
    }

    Polygon.prototype.insert = function(vertex) {
      return this.vertices.push(vertex);
    };

    Polygon.prototype.undo = function() {
      return this.vertices.pop();
    };

    Polygon.prototype.drag = function(mouse) {
      var len;
      len = this.vertices.length;
      return this.vertices[len - 1] = mouse;
    };

    Polygon.prototype.getLines = function() {
      var i, j, ref, results;
      results = [];
      for (i = j = 0, ref = this.vertices.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push(new Line(this.vertices[i], this.vertices[i + 1 % this.vertices.length], this.color));
      }
      return results;
    };

    Polygon.prototype.draw = function(canvas) {
      var i, j, len, line, ref;
      line = new Line();
      line.col1 = line.col2 = this.color;
      len = this.vertices.length;
      for (i = j = 0, ref = len - 1; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        line.pt1 = this.vertices[i];
        line.pt2 = this.vertices[i + 1];
        line.draw(canvas);
      }
      line.pt1 = this.vertices[len - 1];
      line.pt2 = this.vertices[0];
      return line.draw(canvas);
    };

    return Polygon;

  })();

  Polyline = (function() {
    Polyline.prototype.vertices = [];

    Polyline.prototype.color = new Color();

    function Polyline(vertices, color) {
      if (vertices == null) {
        vertices = this.vertices;
      }
      if (color == null) {
        color = this.color;
      }
      this.vertices = vertices;
      this.color = color;
    }

    Polyline.prototype.insert = function(vertex) {
      return this.vertices.push(vertex);
    };

    Polyline.prototype.undo = function() {
      return this.vertices.pop();
    };

    Polyline.prototype.drag = function(mouse) {
      var len;
      len = this.vertices.length;
      return this.vertices[len - 1] = mouse;
    };

    Polyline.prototype.getLines = function() {
      var i, j, ref, results;
      results = [];
      for (i = j = 0, ref = this.vertices.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push(new Line(this.vertices[i], this.vertices[i + 1 % this.vertices.length], this.color));
      }
      return results;
    };

    Polyline.prototype.draw = function(canvas) {
      var i, j, len, line, ref, results;
      line = new Line();
      line.col1 = line.col2 = this.color;
      len = this.vertices.length;
      results = [];
      for (i = j = 0, ref = len - 1; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        line.pt1 = this.vertices[i];
        line.pt2 = this.vertices[i + 1];
        results.push(line.draw(canvas));
      }
      return results;
    };

    return Polyline;

  })();

  ui = {
    buttons: {
      clear: document.getElementById('clear'),
      undo: document.getElementById('undo'),
      line: document.getElementById('line'),
      circle: document.getElementById('circle'),
      ellipse: document.getElementById('ellipse'),
      rectangle: document.getElementById('rectangle'),
      polygon: document.getElementById('polygon'),
      polyline: document.getElementById('polyline')
    }
  };

  DrawingCanvas = (function() {
    DrawingCanvas.prototype.width = 256;

    DrawingCanvas.prototype.height = 256;

    DrawingCanvas.prototype.refreshRate = 1000 / 20;

    DrawingCanvas.prototype.antialiasing = false;

    DrawingCanvas.prototype.drawMode = Geometry.prototype.tags.CIRCLE;

    DrawingCanvas.prototype.graphicsPrimitives = [];

    DrawingCanvas.prototype.modified = false;

    DrawingCanvas.prototype.drawingInProgress = false;

    DrawingCanvas.prototype.polyInProgress = false;

    DrawingCanvas.prototype.data = null;

    function DrawingCanvas() {
      this.reset = bind(this.reset, this);
      this.refresh = bind(this.refresh, this);
      this.setupEventHandlers = bind(this.setupEventHandlers, this);
      this.createCanvas();
      this.resizeCanvas();
      this.createDrawingContext();
      this.setupEventHandlers();
      this.clearCanvas();
      this.initialize();
    }

    DrawingCanvas.prototype.switchMode = function(mode) {
      $("#" + this.drawMode).css("background-color", "#cccccc");
      $("#" + mode).css("background-color", "#888888");
      this.drawMode = mode;
      return console.log(this.drawMode);
    };

    DrawingCanvas.prototype.createCanvas = function() {
      this.canvas = document.createElement('canvas');
      return document.body.appendChild(this.canvas);
    };

    DrawingCanvas.prototype.resizeCanvas = function() {
      this.canvas.width = this.width;
      return this.canvas.height = this.height;
    };

    DrawingCanvas.prototype.createDrawingContext = function() {
      return this.drawingContext = this.canvas.getContext('2d');
    };

    DrawingCanvas.prototype.setupEventHandlers = function() {
      this.getMousePos = function() {
        var rect;
        rect = this.canvas.getBoundingClientRect();
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      };
      this.canvas.addEventListener("mousedown", (function(_this) {
        return function(e) {
          var current, ref, ref1, shape;
          console.log('mousedown');
          _this.modified = _this.drawingInProgress = true;
          if (_this.polyInProgress) {
            ref = _this.graphicsPrimitives, current = ref[ref.length - 1];
            return current.insert(_this.getMousePos(e));
          } else {
            shape = Geometry.prototype.createPrimitive(_this.drawMode, _this.getMousePos(e));
            _this.graphicsPrimitives.push(shape);
            if ((ref1 = _this.drawMode) === Geometry.prototype.tags.POLYGON || ref1 === Geometry.prototype.tags.POLYLINE) {
              return _this.polyInProgress = true;
            }
          }
        };
      })(this));
      this.canvas.addEventListener("mousemove", (function(_this) {
        return function(e) {
          var current, ref;
          console.log("mousemove: " + _this.drawingInProgress + ", " + _this.polyInProgress);
          if (_this.drawingInProgress) {
            _this.modified = true;
            ref = _this.graphicsPrimitives, current = ref[ref.length - 1];
            return current.drag(_this.getMousePos(e));
          }
        };
      })(this));
      this.canvas.addEventListener("mouseup", (function(_this) {
        return function(e) {
          console.log("mouseup");
          if (!_this.polyInProgress) {
            return _this.drawingInProgress = false;
          }
        };
      })(this));
      this.canvas.addEventListener("dblclick", (function(_this) {
        return function(e) {
          console.log("dblclick");
          return _this.polyInProgress = _this.drawingInProgress = false;
        };
      })(this));
      this.canvas.addEventListener("click", (function(_this) {
        return function(e) {
          console.log("click");
          return _this.getMousePos(e);
        };
      })(this));
      ui.buttons.clear.addEventListener("click", (function(_this) {
        return function(e) {
          return _this.reset();
        };
      })(this));
      ui.buttons.undo.addEventListener("click", (function(_this) {
        return function(e) {
          return _this.undo();
        };
      })(this));
      ui.buttons.line.addEventListener("click", (function(_this) {
        return function(e) {
          return _this.switchMode(Geometry.prototype.tags.LINE);
        };
      })(this));
      ui.buttons.circle.addEventListener("click", (function(_this) {
        return function(e) {
          return _this.switchMode(Geometry.prototype.tags.CIRCLE);
        };
      })(this));
      ui.buttons.ellipse.addEventListener("click", (function(_this) {
        return function(e) {
          return _this.switchMode(Geometry.prototype.tags.ELLIPSE);
        };
      })(this));
      ui.buttons.rectangle.addEventListener("click", (function(_this) {
        return function(e) {
          return _this.switchMode(Geometry.prototype.tags.RECTANGLE);
        };
      })(this));
      ui.buttons.polygon.addEventListener("click", (function(_this) {
        return function(e) {
          return _this.switchMode(Geometry.prototype.tags.POLYGON);
        };
      })(this));
      return ui.buttons.polyline.addEventListener("click", (function(_this) {
        return function(e) {
          return _this.switchMode(Geometry.prototype.tags.POLYLINE);
        };
      })(this));
    };

    DrawingCanvas.prototype.clearCanvas = function() {
      this.drawingContext.clearRect(0, 0, this.width, this.height);
      this.data = this.drawingContext.getImageData(0, 0, this.width, this.height);
      this.drawingContext.putImageData(this.data, 0, 0);
      return this.modified = true;
    };

    DrawingCanvas.prototype.refresh = function() {
      var j, len1, ref, shape;
      if (this.modified) {
        this.clearCanvas();
        ref = this.graphicsPrimitives;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          shape = ref[j];
          shape.draw(this);
        }
        this.drawingContext.putImageData(this.data, 0, 0);
        return this.modified = false;
      }
    };

    DrawingCanvas.prototype.initialize = function() {
      setInterval(this.refresh, this.refreshRate);
      return this.switchMode(Geometry.prototype.tags.LINE);
    };

    DrawingCanvas.prototype.reset = function() {
      this.clearCanvas();
      return this.graphicsPrimitives = [];
    };

    DrawingCanvas.prototype.undo = function() {
      this.graphicsPrimitives.pop();
      return this.modified = true;
    };

    return DrawingCanvas;

  })();

  window.DrawingCanvas = DrawingCanvas;

  drawingCanvas = new DrawingCanvas();

  console.log(Geometry.prototype.tags.LINE);

}).call(this);
