var canvas = document.getElementById("canvas");
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext("2d");
var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

function updateCanvas (data) {
  ctx.putImageData(data, 0, 0);
}

function Point (x, y) {
  this.x = x;
  this.y = y;
}

function Color (r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
}

function colorInterpolate (c1, c2, p, c) {
  var p2 = p < 0.0 ? 0.0 : p > 1.0 ? 1.0 : p;
  var p1 = 1.0 - p2;
  c.r = Math.floor(p1*c1.r + p2*c2.r);
  c.g = Math.floor(p1*c1.g + p2*c2.g);
  c.b = Math.floor(p1*c1.b + p2*c2.b);
  c.a = Math.floor(p1*c1.a + p2*c2.a);
  return c;
}

function drawPixel (pt, col) {
  var index = (pt.x + pt.y * canvasWidth) * 4;
  canvasData.data[index + 0] = col.r;
  canvasData.data[index + 1] = col.g;
  canvasData.data[index + 2] = col.b;
  canvasData.data[index + 3] = col.a;
}

function qcPix (pt, order, phase, scale, mag, dX, dY) {
		var xIndex = pt.x;
		var yIndex = pt.y;

		var x = xIndex + dX - canvasWidth / 2.0;
		var y = yIndex + dY - canvasHeight / 2.0;
		var d = order;
		var sum = 0.0;

		for (k = 0; k < d; k++) {
				sum += Math.cos(scale * x * Math.cos(k * 3.14159 / d) - 
												scale * y * Math.sin(k * 3.14159 / d) + phase);
		}
		sum *= mag;

		var s = Math.floor(sum);
		if (s % 2 == 1) {
				sum = 1.0 - sum % 1.0;
		} else {
				sum = sum % 1.0;
		}

		var color = new Color(sum*255, sum*255, sum*255, 255);
		return color;
}


var order = 5;
var scale = 0.6;
var mag = 0.75;
var p = 0.0;
var xIndex = 0;
var yIndex = 0;
var k = 0;
var min =  100;
var max = -100;

function draw () {
		// ctx.clearRect(0, 0, canvas.width, canvas.height);
		// canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
		var dX = 4*p;
		var dY = 2*p;
		
		for (yIndex = 0; yIndex < canvasHeight; yIndex++) {
				for (xIndex = 0; xIndex < canvasWidth; xIndex++) {
						var x = xIndex + dX - canvasWidth / 2.0;
						var y = yIndex + dY - canvasHeight / 2.0;

						var d = order;
						var sum = 0.0;

						for (k = 0; k < d; k++) {
								sum += Math.cos(scale * x * Math.cos(k * 3.14159 / d) - 
																scale * y * Math.sin(k * 3.14159 / d) + p);
						}
						sum *= mag;

						sum = Math.atan(5*sum - 1) / (2.0 * Math.PI) + 0.5;
						// var s = Math.floor(sum);
						// if (s % 2 == 1) {
						// 		sum = 1.0 - (sum - s);
						// } else {
						// 		sum = (sum - s);
						// }

						var index = (xIndex + yIndex * canvasWidth) * 4;
						var c = 255.0 * sum;
						min = sum < min ? sum : min;
						max = sum > max ? sum : max;
						
						canvasData.data[index + 0] = c;
						canvasData.data[index + 1] = c;
						canvasData.data[index + 2] = c;
						canvasData.data[index + 3] = 255;
				}
		}
		updateCanvas(canvasData);
		p += 0.025;
}

setInterval(draw, 200);
