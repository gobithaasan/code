SVG_SIZE = 400
SVG_STROKE = 0.5

###############################################################################

loadObject =  (url, store, cb, cbErr) ->
  req = new XMLHttpRequest()
  req.open('GET', url, true)

  req.onreadystatechange = () ->
    if req.readyState == 4
      if req.status == 200
        cb(store, req.responseText)
      else
        cbErr(url)

  req.send(null)

###############################################################################

parseVertex = (vertexString) ->
  split = vertexString.split(' ')
  [x, y, z] = split[1..3]
  {
    x: parseFloat(x)
    y: parseFloat(y)
    z: parseFloat(z)
  }

###############################################################################

parseFace = (faceString) ->
  split = faceString.split(' ')
  parseInt(i) - 1 for i in split[1..]

###############################################################################

Array::max = () -> 
  Math.max.apply(null, @)

Array::min = () -> 
  Math.min.apply(null, @)

getVertexRanges = (vertices) ->
  xs = for v in vertices
    v.x
  ys = for v in vertices
    v.y
  zs = for v in vertices
    v.z

  {
    x1: xs.min()
    x2: xs.max()

    y1: ys.min()
    y2: ys.max()

    z1: zs.min()
    z2: zs.max()
  }

###############################################################################

rescaleVertices = (vertices, size) ->
  r = getVertexRanges(vertices)

  rx = r.x2 - r.x1
  ry = r.y2 - r.y1
  rz = r.z2 - r.z1

  rm = Math.max(rx, ry, rz)
  s = size / rm

  for v in vertices
    {
      x: .05*size + .95*size * (rm - rx - 2*r.x1 + 2*v.x)/(2*rm)
      y: .05*size + .95*size * (rm - ry - 2*r.y1 + 2*v.y)/(2*rm)
      z: .95*size - .90*size * (rm - rz - 2*r.z1 + 2*v.z)/(2*rm)
    }

###############################################################################

orthoProj = (vertices) ->
  {
    xy: {x: v.x, y: v.y} for v in vertices
    xz: {x: v.x, y: v.z} for v in vertices
    yz: {x: v.y, y: v.z} for v in vertices
  }

###############################################################################

union = (a) ->
  seen = Object.create(null)
  out = []
  len = a.length
  j = 0
  for i in [0...len]
    item = a[i]
    if seen[item] isnt 1 then [seen[item], out[j++]] = [1, item]
  out

###############################################################################

class Line 
  p1: 0
  p2: 0

  constructor: (p1 = @p1, p2 = @p2) ->
    @p1 = p1
    @p2 = p2

  toString: () ->
    "(#{@p1.toString()}, #{@p2.toString()})"

###############################################################################

createMeshLines = (faces) ->
  lines = []

  for face in faces
    len = face.length
    for i in [0...len]
      v1 = Math.min(face[i], face[(i+1)%len])
      v2 = Math.max(face[i], face[(i+1)%len])
      lines.push(new Line(v1, v2))

  union(lines)

###############################################################################

createSVGLine = (p1, p2, stroke) ->
  line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  line.setAttribute('x1', p1.x)
  line.setAttribute('y1', p1.y)
  line.setAttribute('x2', p2.x)
  line.setAttribute('y2', p2.y)
  line.setAttribute('stroke-width', stroke)
  line.setAttribute('stroke', 'black')
  line

###############################################################################

callback = (obj, txt) -> 
  lines = txt.split('\n')
  for line in lines
    if line[0] == 'v'
      obj.vertices.push(parseVertex(line))
    if line[0] == 'f'
      obj.faces.push(parseFace(line))

  obj.vertices = rescaleVertices(obj.vertices, SVG_SIZE)
  op = orthoProj(obj.vertices)

  [svgXY, svgXZ, svgYZ] = 
    for i in [1..3]
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', SVG_SIZE)
      svg.setAttribute('height', SVG_SIZE)
      # svg.setAttribute('style', "border: 1px solid black;")
      svg
  
  container = document.getElementById('container')

  obj.meshLines = createMeshLines(obj.faces)

  for line in obj.meshLines
    lineXY = createSVGLine(op.xy[line.p1], op.xy[line.p2], SVG_STROKE)
    lineXZ = createSVGLine(op.xz[line.p1], op.xz[line.p2], SVG_STROKE)
    lineYZ = createSVGLine(op.yz[line.p1], op.yz[line.p2], SVG_STROKE)
    svgXY.appendChild(lineXY)
    svgXZ.appendChild(lineXZ)
    svgYZ.appendChild(lineYZ)

  createLabel = (text) ->
    label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    label.setAttribute('x', 10)
    label.setAttribute('y', 38)
    label.setAttribute('fill', 'red')
    label.setAttribute('font-size', '28px')
    label.setAttribute('font-family', 'helvetica')
    label.innerHTML = text
    label

  svgXY.appendChild(createLabel('xy'))
  svgXZ.appendChild(createLabel('xz'))
  svgYZ.appendChild(createLabel('yz'))

  clear()
  container.appendChild(svgXY)
  container.appendChild(svgXZ)
  container.appendChild(document.createElement("br"))
  container.appendChild(svgYZ)

###############################################################################

err = (url) ->
  alert "failed to load #{url}"

###############################################################################

rotateXY = (object3D, theta) ->
  

###############################################################################

clear = () ->
  container = document.getElementById('container')
  while container.hasChildNodes()
    container.removeChild(container.firstChild)

###############################################################################

load = (object) ->
  object3D = {vertices: [], faces: [], meshLines: [], svgLines: []}
  loadObject("objects/#{object}.obj", object3D, callback, err)

###############################################################################

main = () ->
  SVG_SIZE = Math.min(window.innerWidth, window.innerHeight)/2 - 50
  document.getElementById('selector').addEventListener "change", (e) => 
      load(selector.value)

  load('UtahTeapot')
  # object3D = {vertices: [], faces: []}
  # loadObject('objects/Beethoven.obj', object3D, callback, err)

main()

