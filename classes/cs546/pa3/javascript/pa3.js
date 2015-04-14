// Generated by CoffeeScript 1.9.1
(function() {
  var Line, Main, R_INC, SVG_SIZE, SVG_STROKE, Viewer, callback, clear, createMeshLines, createSVGLine, err, generalizedTransformation, getVertexRanges, isometricProjection, load, loadObject, orthoProj, parseFace, parseVertex, prog, rescaleVertices, svgShift, transformVertices, transformationMatrix, union,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  SVG_SIZE = 400;

  SVG_STROKE = 0.0025;

  R_INC = Math.PI / 8;

  loadObject = function(url, store, cb, cbErr) {
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

  parseVertex = function(vertexString) {
    var ref, split, x, y, z;
    split = vertexString.split(' ');
    ref = split.slice(1, 4), x = ref[0], y = ref[1], z = ref[2];
    return {
      x: parseFloat(x),
      y: -parseFloat(y),
      z: -parseFloat(z)
    };
  };

  parseFace = function(faceString) {
    var i, k, len1, ref, results, split;
    split = faceString.split(' ');
    ref = split.slice(1);
    results = [];
    for (k = 0, len1 = ref.length; k < len1; k++) {
      i = ref[k];
      results.push(parseInt(i) - 1);
    }
    return results;
  };

  Array.prototype.max = function() {
    return Math.max.apply(null, this);
  };

  Array.prototype.min = function() {
    return Math.min.apply(null, this);
  };

  getVertexRanges = function(vertices) {
    var v, xs, ys, zs;
    xs = (function() {
      var k, len1, results;
      results = [];
      for (k = 0, len1 = vertices.length; k < len1; k++) {
        v = vertices[k];
        results.push(v.x);
      }
      return results;
    })();
    ys = (function() {
      var k, len1, results;
      results = [];
      for (k = 0, len1 = vertices.length; k < len1; k++) {
        v = vertices[k];
        results.push(v.y);
      }
      return results;
    })();
    zs = (function() {
      var k, len1, results;
      results = [];
      for (k = 0, len1 = vertices.length; k < len1; k++) {
        v = vertices[k];
        results.push(v.z);
      }
      return results;
    })();
    return {
      x1: xs.min(),
      x2: xs.max(),
      y1: ys.min(),
      y2: ys.max(),
      z1: zs.min(),
      z2: zs.max()
    };
  };

  rescaleVertices = function(vertices, size) {
    var k, l, len1, len2, m, r, results, rm, shifted, v, x, y, z;
    r = getVertexRanges(vertices);
    m = {
      x: (r.x1 + r.x2) / 2,
      y: (r.y1 + r.y2) / 2,
      z: (r.z1 + r.z2) / 2
    };
    shifted = (function() {
      var k, len1, results;
      results = [];
      for (k = 0, len1 = vertices.length; k < len1; k++) {
        v = vertices[k];
        results.push({
          x: v.x - m.x,
          y: v.y - m.y,
          z: v.z - m.z
        });
      }
      return results;
    })();
    rm = 0;
    for (k = 0, len1 = vertices.length; k < len1; k++) {
      v = vertices[k];
      x = Math.abs(v.x);
      y = Math.abs(v.y);
      z = Math.abs(v.z);
      rm = Math.max(rm, x, y, z);
    }
    results = [];
    for (l = 0, len2 = vertices.length; l < len2; l++) {
      v = vertices[l];
      results.push({
        x: size * v.x / rm,
        y: size * v.y / rm,
        z: size * v.z / rm
      });
    }
    return results;
  };

  orthoProj = function(vertices) {
    var v;
    return {
      xy: (function() {
        var k, len1, results;
        results = [];
        for (k = 0, len1 = vertices.length; k < len1; k++) {
          v = vertices[k];
          results.push({
            x: v.x,
            y: v.y
          });
        }
        return results;
      })(),
      xz: (function() {
        var k, len1, results;
        results = [];
        for (k = 0, len1 = vertices.length; k < len1; k++) {
          v = vertices[k];
          results.push({
            x: v.x,
            y: v.z
          });
        }
        return results;
      })(),
      yz: (function() {
        var k, len1, results;
        results = [];
        for (k = 0, len1 = vertices.length; k < len1; k++) {
          v = vertices[k];
          results.push({
            x: v.y,
            y: v.z
          });
        }
        return results;
      })()
    };
  };

  union = function(a) {
    var i, item, j, k, len, out, ref, ref1, seen;
    seen = Object.create(null);
    out = [];
    len = a.length;
    j = 0;
    for (i = k = 0, ref = len; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      item = a[i];
      if (seen[item] !== 1) {
        ref1 = [1, item], seen[item] = ref1[0], out[j++] = ref1[1];
      }
    }
    return out;
  };

  Line = (function() {
    Line.prototype.p1 = 0;

    Line.prototype.p2 = 0;

    function Line(p1, p2) {
      if (p1 == null) {
        p1 = this.p1;
      }
      if (p2 == null) {
        p2 = this.p2;
      }
      this.p1 = p1;
      this.p2 = p2;
    }

    Line.prototype.toString = function() {
      return "(" + (this.p1.toString()) + ", " + (this.p2.toString()) + ")";
    };

    return Line;

  })();

  createMeshLines = function(faces) {
    var face, i, k, l, len, len1, lines, ref, v1, v2;
    lines = [];
    for (k = 0, len1 = faces.length; k < len1; k++) {
      face = faces[k];
      len = face.length;
      for (i = l = 0, ref = len; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        v1 = Math.min(face[i], face[(i + 1) % len]);
        v2 = Math.max(face[i], face[(i + 1) % len]);
        lines.push(new Line(v1, v2));
      }
    }
    return union(lines);
  };

  svgShift = function(p) {
    return 0.3 * p + 0.5;
  };

  createSVGLine = function(p1, p2, stroke) {
    var line;
    line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', svgShift(p1.x));
    line.setAttribute('y1', svgShift(p1.y));
    line.setAttribute('x2', svgShift(p2.x));
    line.setAttribute('y2', svgShift(p2.y));
    line.setAttribute('stroke-width', stroke);
    line.setAttribute('stroke', 'black');
    return line;
  };

  callback = function(obj, txt) {
    var containerIP, containerXY, containerXZ, containerYZ, createLabel, i, ip1, ip2, k, l, len1, len2, line, lineIP, lineXY, lineXZ, lineYZ, lines, op, ref, ref1, svg, svgIP, svgXY, svgXZ, svgYZ;
    lines = txt.split('\n');
    for (k = 0, len1 = lines.length; k < len1; k++) {
      line = lines[k];
      if (line[0] === 'v') {
        obj.vertices.push(parseVertex(line));
      }
      if (line[0] === 'f') {
        obj.faces.push(parseFace(line));
      }
    }
    obj.vertices = rescaleVertices(obj.vertices, 1);
    op = orthoProj(obj.vertices);
    ref = (function() {
      var l, results;
      results = [];
      for (i = l = 1; l <= 4; i = ++l) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', SVG_SIZE);
        svg.setAttribute('height', SVG_SIZE);
        svg.setAttribute('style', "border: 1px solid black;");
        svg.setAttribute('viewBox', "0 0 1 1");
        results.push(svg);
      }
      return results;
    })(), svgXY = ref[0], svgXZ = ref[1], svgYZ = ref[2], svgIP = ref[3];
    obj.meshLines = createMeshLines(obj.faces);
    ref1 = obj.meshLines;
    for (l = 0, len2 = ref1.length; l < len2; l++) {
      line = ref1[l];
      lineXY = createSVGLine(op.xy[line.p1], op.xy[line.p2], SVG_STROKE);
      lineXZ = createSVGLine(op.xz[line.p1], op.xz[line.p2], SVG_STROKE);
      lineYZ = createSVGLine(op.yz[line.p1], op.yz[line.p2], SVG_STROKE);
      ip1 = isometricProjection(obj.vertices[line.p1]);
      ip2 = isometricProjection(obj.vertices[line.p2]);
      lineIP = createSVGLine(ip1, ip2, SVG_STROKE);
      svgXY.appendChild(lineXY);
      svgXZ.appendChild(lineXZ);
      svgYZ.appendChild(lineYZ);
      svgIP.appendChild(lineIP);
      obj.svgLinesXY.push(lineXY);
      obj.svgLinesXZ.push(lineXZ);
      obj.svgLinesYZ.push(lineYZ);
      obj.svgLinesIP.push(lineIP);
    }
    createLabel = function(text) {
      var label;
      label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', 0.05);
      label.setAttribute('y', 0.075);
      label.setAttribute('fill', 'red');
      label.setAttribute('font-size', 0.05);
      label.setAttribute('font-family', 'helvetica');
      label.innerHTML = text;
      return label;
    };
    svgXY.appendChild(createLabel('xy'));
    svgXZ.appendChild(createLabel('xz'));
    svgYZ.appendChild(createLabel('yz'));
    svgIP.appendChild(createLabel('projection'));
    containerXY = document.getElementById('containerXY');
    containerXZ = document.getElementById('containerXZ');
    containerYZ = document.getElementById('containerYZ');
    containerIP = document.getElementById('containerIP');
    clear();
    containerXY.appendChild(svgXY);
    containerXZ.appendChild(svgXZ);
    containerYZ.appendChild(svgYZ);
    return containerIP.appendChild(svgIP);
  };

  isometricProjection = function(v) {
    return {
      x: (v.x - v.y) / Math.sqrt(2.0),
      y: (v.x + v.y + 2.0 * v.z) / Math.sqrt(6.0)
    };
  };

  transformationMatrix = function(scale, translation, shear, rotation, perspective) {
    var m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44, px, py, pz, ref, ref1, ref2, ref3, ref4, rx, ry, rz, sx, sxy, sxz, sy, syz, sz, tx, ty, tz, v1, v10, v11, v12, v13, v14, v15, v16, v17, v18, v19, v2, v20, v21, v22, v23, v24, v25, v26, v27, v28, v29, v3, v30, v31, v32, v33, v34, v35, v36, v4, v5, v6, v7, v8, v9;
    ref = [scale.x, scale.y, scale.z], sx = ref[0], sy = ref[1], sz = ref[2];
    ref1 = [translation.x, translation.y, translation.z], tx = ref1[0], ty = ref1[1], tz = ref1[2];
    ref2 = [shear.x, shear.y, shear.z], syz = ref2[0], sxz = ref2[1], sxy = ref2[2];
    ref3 = [rotation.x, rotation.y, rotation.z], rx = ref3[0], ry = ref3[1], rz = ref3[2];
    ref4 = [perspective.x, perspective.y, perspective.z], px = ref4[0], py = ref4[1], pz = ref4[2];
    v1 = Math.cos(rx);
    v2 = Math.sin(rx);
    v3 = Math.cos(rz);
    v4 = Math.sin(ry);
    v5 = Math.sin(rz);
    v6 = Math.tan(sxy);
    v7 = Math.tan(syz);
    v8 = Math.cos(ry);
    v9 = -v4;
    v10 = px * v6;
    v11 = py + v10;
    v12 = Math.tan(sxz);
    v13 = v1 * v3;
    v14 = v2 * v3;
    v15 = v1 * v5;
    v16 = v2 * v5;
    v17 = -v8;
    v18 = px * v12;
    v19 = v11 * v7;
    v20 = pz + v18 + v19;
    v21 = v6 * v7;
    v22 = v12 + v21;
    v23 = v13 * v4;
    v24 = v1 * v8;
    v25 = v15 * v9;
    v26 = rx - syz;
    v27 = v17 * v2;
    v28 = v16 * v4;
    v29 = v17 * v5;
    v30 = v2 * v7;
    v31 = v1 + v30;
    v32 = v3 * v8;
    v33 = v14 * v9;
    v34 = 1 / Math.cos(syz);
    v35 = Math.sin(v26);
    v36 = v34 * v35;
    m11 = sx * (v16 * v22 + v22 * v23 + v32 + v15 * v6 + v33 * v6);
    m12 = sy * (v14 * v22 + v22 * v25 + v29 + v13 * v6 + v28 * v6);
    m13 = sz * (v22 * v24 + v27 * v6 + v9);
    m14 = tx + tz * v22 + ty * v6;
    m21 = sx * (v31 * v5 + v3 * v36 * v9);
    m22 = sy * (v3 * v31 + v4 * v5 * (v2 - v1 * v7));
    m23 = sz * v17 * v36;
    m24 = ty + tz * v7;
    m31 = sx * (v16 + v23);
    m32 = sy * (v14 + v25);
    m33 = sz * v24;
    m34 = tz;
    m41 = sx * (v16 * v20 + v20 * v23 + px * v32 + v11 * (v15 + v33));
    m42 = sy * (v14 * v20 + v20 * v25 + v11 * (v13 + v28) + px * v29);
    m43 = sz * (v20 * v24 + v11 * v27 + px * v9);
    m44 = 1 + px * tx + ty * v11 + tz * v20;
    return [[m11, m12, m13, m14], [m21, m22, m23, m24], [m31, m32, m33, m34], [m41, m42, m43, m44]];
  };

  transformVertices = function(object3D, scale, translation, shear, rotation, perspective) {
    var end, i, ip1, ip2, k, meshLine, ref, results, start, time, transformedVertices, v;
    start = new Date().getTime();
    transformedVertices = (function() {
      var k, len1, ref, results;
      ref = object3D.vertices;
      results = [];
      for (k = 0, len1 = ref.length; k < len1; k++) {
        v = ref[k];
        results.push(generalizedTransformation(scale, translation, shear, rotation, perspective, v));
      }
      return results;
    })();
    end = new Date().getTime();
    time = end - start;
    results = [];
    for (i = k = 0, ref = object3D.meshLines.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      meshLine = object3D.meshLines[i];
      ip1 = transformedVertices[meshLine.p1];
      ip2 = transformedVertices[meshLine.p2];
      object3D.svgLinesIP[i].setAttribute('x1', svgShift(ip1.x));
      object3D.svgLinesIP[i].setAttribute('y1', svgShift(ip1.y));
      object3D.svgLinesIP[i].setAttribute('x2', svgShift(ip2.x));
      results.push(object3D.svgLinesIP[i].setAttribute('y2', svgShift(ip2.y)));
    }
    return results;
  };

  generalizedTransformation = function(scale, translation, shear, rotation, perspective, point) {
    var px, py, pz, ref, ref1, ref2, ref3, ref4, ref5, rx, ry, rz, sx, sxy, sxz, sy, syz, sz, tx, ty, tz, v1, v10, v11, v12, v13, v14, v15, v16, v17, v18, v19, v2, v20, v21, v22, v23, v24, v25, v26, v27, v28, v29, v3, v30, v31, v32, v33, v34, v35, v36, v37, v38, v39, v4, v40, v41, v42, v43, v44, v45, v46, v47, v48, v49, v5, v50, v51, v52, v53, v54, v55, v6, v7, v8, v9, x, xo, y, yo, z;
    ref = [scale.x, scale.y, scale.z], sx = ref[0], sy = ref[1], sz = ref[2];
    ref1 = [translation.x, translation.y, translation.z], tx = ref1[0], ty = ref1[1], tz = ref1[2];
    ref2 = [shear.x, shear.y, shear.z], syz = ref2[0], sxz = ref2[1], sxy = ref2[2];
    ref3 = [rotation.x, rotation.y, rotation.z], rx = ref3[0], ry = ref3[1], rz = ref3[2];
    ref4 = [perspective.x, perspective.y, perspective.z], px = ref4[0], py = ref4[1], pz = ref4[2];
    ref5 = [point.x, point.y, point.z], x = ref5[0], y = ref5[1], z = ref5[2];
    v1 = Math.tan(sxy);
    v2 = Math.cos(rz);
    v3 = Math.sin(ry);
    v4 = Math.sin(rz);
    v5 = px * v1;
    v6 = py + v5;
    v7 = Math.cos(rx);
    v8 = Math.sin(rx);
    v9 = Math.tan(syz);
    v10 = Math.tan(sxz);
    v11 = -v3;
    v12 = Math.cos(ry);
    v13 = px * v10;
    v14 = v6 * v9;
    v15 = pz + v13 + v14;
    v16 = v15 * v7;
    v17 = v2 * v8;
    v18 = v4 * v8;
    v19 = sx * x;
    v20 = sy * y;
    v21 = px * v12;
    v22 = v2 * v3;
    v23 = v11 * v4;
    v24 = v6 * v7;
    v25 = v1 * v9;
    v26 = sz * z;
    v27 = v11 * v17;
    v28 = v10 + v25;
    v29 = v18 * v3;
    v30 = -v4;
    v31 = -v8;
    v32 = px * tx;
    v33 = px * v11;
    v34 = tz * v15;
    v35 = v15 * v17;
    v36 = v15 * v18;
    v37 = v2 * v21;
    v38 = v16 * v22;
    v39 = v16 * v23;
    v40 = v2 * v24;
    v41 = v21 * v30;
    v42 = v24 * v4;
    v43 = ty * v6;
    v44 = v27 * v6;
    v45 = v36 + v37 + v38 + v42 + v44;
    v46 = v19 * v45;
    v47 = v29 * v6;
    v48 = v35 + v39 + v40 + v41 + v47;
    v49 = v12 * v26;
    v50 = v26 * v33;
    v51 = v20 * v48;
    v52 = v16 * v49;
    v53 = v31 * v49;
    v54 = v53 * v6;
    v55 = 1 / (1 + v32 + v34 + v43 + v46 + v50 + v51 + v52 + v54);
    xo = v55 * (tx + ty * v1 + tz * v28 + v20 * (v17 * v28 + v12 * v30 + v23 * v28 * v7 + v1 * (v29 + v2 * v7)) + v26 * (v11 + v12 * (v1 * v31 + (v10 + v25) * v7)) + v19 * (v12 * v2 + v28 * (v18 + v22 * v7) + v1 * (v27 + v4 * v7)));
    yo = v55 * (ty + tz * v9 + (v2 * v20 + v19 * v4) * (v7 + v8 * v9) - (v19 * v22 + v20 * v23 + v49) * (1 / Math.cos(syz)) * Math.sin(rx - syz));
    return {
      x: xo,
      y: yo
    };
  };

  clear = function() {
    var cc;
    cc = function(cname) {
      var container, results;
      container = document.getElementById(cname);
      results = [];
      while (container.hasChildNodes()) {
        results.push(container.removeChild(container.firstChild));
      }
      return results;
    };
    cc('containerXY');
    cc('containerXZ');
    cc('containerYZ');
    return cc('containerIP');
  };

  err = function(url) {
    return alert("failed to load " + url);
  };

  load = function(object) {
    var object3D;
    object3D = {
      vertices: [],
      faces: [],
      meshLines: [],
      svgLinesXY: [],
      svgLinesXZ: [],
      svgLinesYZ: [],
      svgLinesIP: []
    };
    loadObject("objects/" + object + ".obj", object3D, callback, err);
    return object3D;
  };

  Viewer = (function() {
    var object3D, objectName;

    objectName = 'Cube';

    object3D = null;

    Viewer.prototype.scale = {
      x: 1,
      y: 1,
      z: 1
    };

    Viewer.prototype.translation = {
      x: 0,
      y: 0,
      z: 0
    };

    Viewer.prototype.shear = {
      x: 0,
      y: 0,
      z: 0
    };

    Viewer.prototype.rotation = {
      x: 0,
      y: 0,
      z: 0
    };

    Viewer.prototype.perspective = {
      x: 0,
      y: 0,
      z: 0
    };

    function Viewer() {
      this.reset = bind(this.reset, this);
      this.init = bind(this.init, this);
      this.init();
    }

    Viewer.prototype.init = function() {
      SVG_SIZE = Math.min(window.innerWidth - 30, window.innerHeight - 175) / 2;
      document.getElementById('imgTbl').width = 2 * SVG_SIZE;
      object3D = load(objectName);
      console.log(object3D.vertices);
      return transformVertices(object3D, this.scale, this.translation, this.shear, this.rotation, this.perspective);
    };

    Viewer.prototype.reset = function(preset) {
      this.scale = {
        x: 1,
        y: 1,
        z: 1
      };
      this.translation = {
        x: 0,
        y: 0,
        z: 0
      };
      this.shear = {
        x: 0,
        y: 0,
        z: 0
      };
      this.rotation = {
        x: 0,
        y: 0,
        z: 0
      };
      this.perspective = {
        x: 0,
        y: 0,
        z: 0
      };
      if (preset != null) {
        switch (preset) {
          case 'Isometric':
            this.rotation.x = Math.asin(1 / Math.sqrt(3));
            this.rotation.y = Math.PI / 4;
            break;
          case 'Dimetric':
            this.rotation.x = Math.PI / 16;
            this.rotation.y = Math.PI / 4;
            break;
          case 'Trimetric':
            this.rotation.x = Math.PI / 16;
            this.rotation.y = Math.PI / 5;
            break;
          case 'Oblique':
            this.shear.x = this.shear.y = 0.5;
            break;
          case 'Perspective1':
            this.rotation.x = Math.PI / 16;
            this.rotation.y = Math.PI / 5;
            this.perspective.z = -0.25;
            break;
          case 'Perspective2':
            this.rotation.x = Math.PI / 16;
            this.rotation.y = Math.PI / 5;
            this.perspective.y = -0.125;
            this.perspective.z = -0.25;
            break;
          case 'Perspective3':
            this.rotation.x = Math.PI / 16;
            this.rotation.y = Math.PI / 5;
            this.perspective.z = -0.0625;
            this.perspective.y = -0.125;
            this.perspective.z = -0.25;
        }
      }
      console.log(object3D);
      return transformVertices(object3D, this.scale, this.translation, this.shear, this.rotation, this.perspective);
    };

    return Viewer;

  })();

  Main = (function() {
    Main.prototype.t = {
      sx: 1,
      sy: 1,
      sz: 1,
      tx: 0,
      ty: 0,
      tz: 0,
      sxy: 0,
      sxz: 0,
      syz: 0,
      rx: 0,
      ry: 0,
      rz: 0,
      px: 0,
      py: 0,
      pz: 0
    };

    Main.prototype.gui = null;

    Main.prototype.objectName = 'Cube';

    Main.prototype.object3D = null;

    function Main() {
      this.initSVG();
      this.initGUI();
    }

    Main.prototype.initSVG = function() {
      var attachHandler;
      SVG_SIZE = Math.min(window.innerWidth - 30, window.innerHeight - 175) / 2;
      document.getElementById('imgTbl').width = 2 * SVG_SIZE;
      console.log(this.objectName);
      this.object3D = load(this.objectName);
      this.reset('Isometric');
      attachHandler = (function(_this) {
        return function(name) {
          return document.getElementById(name).addEventListener("click", function(e) {
            _this.reset(name);
            return console.log(_this.t);
          });
        };
      })(this);
      attachHandler('Isometric');
      attachHandler('Dimetric');
      attachHandler('Trimetric');
      attachHandler('Oblique');
      attachHandler('Perspective1');
      attachHandler('Perspective2');
      attachHandler('Perspective3');
      return document.getElementById('selector').addEventListener("change", (function(_this) {
        return function(e) {
          _this.object3D = load(selector.value);
          return _this.reset();
        };
      })(this));
    };

    Main.prototype.initGUI = function() {
      var fp, fr, fs, fsh, ft, slider;
      this.gui = new dat.GUI();
      slider = (function(_this) {
        return function(f, name, low, high) {
          var control;
          control = f.add(_this.t, name, low, high).listen();
          return control.onChange(function(value) {
            return _this.reset();
          });
        };
      })(this);
      fs = this.gui.addFolder('scale');
      slider(fs, 'sx', -2.0, 2.0);
      slider(fs, 'sy', -2.0, 2.0);
      slider(fs, 'sz', -2.0, 2.0);
      fs.open();
      ft = this.gui.addFolder('translation');
      slider(ft, 'tx', -2.0, 2.0);
      slider(ft, 'ty', -2.0, 2.0);
      slider(ft, 'tz', -2.0, 2.0);
      ft.open();
      fsh = this.gui.addFolder('shear');
      slider(fsh, 'sxy', -1.0, 1.0);
      slider(fsh, 'sxz', -1.0, 1.0);
      slider(fsh, 'syz', -1.0, 1.0);
      fsh.open();
      fr = this.gui.addFolder('rotation');
      slider(fr, 'rx', -2 * Math.PI, 2 * Math.PI);
      slider(fr, 'ry', -2 * Math.PI, 2 * Math.PI);
      slider(fr, 'rz', -2 * Math.PI, 2 * Math.PI);
      fr.open();
      fp = this.gui.addFolder('perspective');
      slider(fp, 'px', -0.3, 0.3);
      slider(fp, 'py', -0.3, 0.3);
      slider(fp, 'pz', -0.3, 0.3);
      return fp.open();
    };

    Main.prototype.reset = function(preset) {
      if (preset != null) {
        this.t.sx = this.t.sy = this.t.sz = 1;
        this.t.tx = this.t.ty = this.t.tz = 0;
        this.t.sxy = this.t.sxz = this.t.syz = 0;
        this.t.rx = this.t.ry = this.t.rz = 0;
        this.t.px = this.t.py = this.t.pz = 0;
        switch (preset) {
          case 'Isometric':
            this.t.rx = Math.asin(1 / Math.sqrt(3));
            this.t.ry = Math.PI / 4;
            break;
          case 'Dimetric':
            this.t.rx = Math.PI / 16;
            this.t.ry = Math.PI / 4;
            break;
          case 'Trimetric':
            this.t.rx = Math.PI / 16;
            this.t.ry = Math.PI / 5;
            break;
          case 'Oblique':
            this.t.syz = this.t.sxz = 0.5;
            break;
          case 'Perspective1':
            this.t.rx = Math.PI / 16;
            this.t.ry = Math.PI / 5;
            this.t.pz = 0.25;
            break;
          case 'Perspective2':
            this.t.rx = Math.PI / 16;
            this.t.ry = Math.PI / 5;
            this.t.py = 0.125;
            this.t.pz = 0.25;
            break;
          case 'Perspective3':
            this.t.rx = Math.PI / 16;
            this.t.ry = Math.PI / 5;
            this.t.px = 0.0625;
            this.t.py = 0.125;
            this.t.pz = 0.25;
        }
      }
      return transformVertices(this.object3D, {
        x: this.t.sx,
        y: this.t.sy,
        z: this.t.sz
      }, {
        x: this.t.tx,
        y: this.t.ty,
        z: this.t.tz
      }, {
        x: this.t.syz,
        y: this.t.sxz,
        z: this.t.sxy
      }, {
        x: this.t.rx,
        y: this.t.ry,
        z: this.t.rz
      }, {
        x: this.t.px,
        y: this.t.py,
        z: this.t.pz
      });
    };

    return Main;

  })();

  prog = new Main();

}).call(this);

//# sourceMappingURL=pa3.js.map
