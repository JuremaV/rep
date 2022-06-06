const canvas = document.querySelector(`canvas`);
const webgl = canvas.getContext(`webgl`);
if (!webgl) {
  throw new Error("WebGL not supported!");
}
webgl.clearColor(1.0, 1.0, 1.0, 1.0);
//webgl.clearColor( Math.random(), Math.random(), Math.random(), 1.0,);
webgl.clear(webgl.COLOR_BUFFER_BIT);
webgl.enable(webgl.DEPTH_TEST);
var r = 0.25;

var box = new Float32Array([
    

    //1.BACK FACE RED
    -r,r,r, 1,0,0,  -r,-r,r, 1,0,0,  r,-r,r, 1,0,0, //1st Triang
    r,r,r,  1,0,0,  -r,r,r, 1,0,0,   r,-r,r, 1,0,0, //2nd Triang
    
    //2.RIGHT FACE GREEN
    r,r,r,  0,1,0,  r,-r,r, 0,1,0,  r,r,-r,  0,1,0, //1st Triang
    r,-r,r, 0,1,0,  r,r,-r, 0,1,0,  r,-r,-r, 0,1,0, //2nd Triang

    //3.FRONT FACE Magenta
    -r,r,-r, 1,0,1,  -r,-r,-r, 1,0,1,  r,-r,-r, 1,0,1, //1st Triang
    r,r,-r,  1,0,1,  -r,r,-r,  1,0,1,  r,-r,-r, 1,0,1, //2nd Triang

    //4.LEFT FACE YELLOW
    -r,r,r,  1,1,0,  -r,-r,r, 1,1,0,  -r,r,-r,   1,1,0, //1st Triang
    -r,-r,r, 1,1,0,  -r,r,-r, 1,1,0,  -r,-r,-r,  1,1,0, //2nd Triang

   //5.BOTTOM FACE BLUE
   -r,-r,r,  0,0,1,  r,-r,r, 0,0,1,  -r,-r,-r, 0,0,1, //1st Triang
   -r,-r,-r, 0,0,1,  r,-r,-r, 0,0,1,  r,-r,r,   0,0,1, //2nd Triang

    //6.TOP FACE CYAN
    -r,r,r, 0,1,1,   r,r,r, 0,1,1,  -r,r,-r, 0,1,1, //1st Triang
    -r,r,-r, 0,1,1,  r,r,-r, 0,1,1,  r,r,r,  0,1,1  //2nd Triang

]);


const buffer = webgl.createBuffer();
webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
webgl.bufferData(webgl.ARRAY_BUFFER, box, webgl.STATIC_DRAW);

const vertexShader = webgl.createShader(webgl.VERTEX_SHADER);
webgl.shaderSource(
  vertexShader,
  `attribute vec3 pos;
attribute vec3 colour;
varying vec3 fragcolour;
uniform mat4 model1;
uniform float x;
uniform float y;
//uniform float a;

void main() { 
    
    
    fragcolour = colour;
    
    gl_Position = model1*vec4(pos,1) + vec4(x, y, 0.0, 0.0);

}`
);
webgl.compileShader(vertexShader);
if (!webgl.getShaderParameter(vertexShader, webgl.COMPILE_STATUS)) {
  console.error(
    "ERROR compiling vertex shader!",
    webgl.getShaderInfoLog(vertexShader)
  );
}

const fragmentShader = webgl.createShader(webgl.FRAGMENT_SHADER);
webgl.shaderSource(
  fragmentShader,
  `precision mediump float; 
varying vec3 fragcolour;
void main() {

     gl_FragColor = vec4(fragcolour,1.0);

     }`
);
webgl.compileShader(fragmentShader);
if (!webgl.getShaderParameter(fragmentShader, webgl.COMPILE_STATUS)) {
  console.error(
    "ERROR compiling fragment shader!",
    webgl.getShaderInfoLog(fragmentShader)
  );
}

const program = webgl.createProgram();
webgl.attachShader(program, vertexShader);
webgl.attachShader(program, fragmentShader);
webgl.linkProgram(program);
webgl.useProgram(program);

const positionLocation = webgl.getAttribLocation(program, `pos`);
webgl.enableVertexAttribArray(positionLocation);
webgl.vertexAttribPointer(positionLocation, 3, webgl.FLOAT, false, 6 * 4, 0);
//Float32Array.BYTES_PER_ELEMENT =4
const coloursLocation = webgl.getAttribLocation(program, `colour`);
webgl.enableVertexAttribArray(coloursLocation);
webgl.vertexAttribPointer(coloursLocation, 3, webgl.FLOAT, false, 6 * 4, 3 * 4);

let model1 = createmat4();
let model2 = createmat4();
let b = 0; //Math.PI;
let tx = -0.8;
let ty = 0;
let tz = 0;
let isSpinning = false;
let interval = null;
let spinningAngle = Math.PI /8;

// let rotateX = document.getElementById(`rotX`);
// let rotateY = document.getElementById(`rotY`);
// let rotateZ = document.getElementById(`rotZ`);

// rotX.addEventListener("click", function() {out1 += Math.PI/8;});
// rotY.addEventListener("click", function() {out2 += Math.PI/8;});
// rotZ.addEventListener("click", function() {out3 += Math.PI/8;});

// function upft(){
//     ty +=0.05
//     sup.textContent = ++utext;
// }


document.querySelectorAll("button").forEach((element) => {
  element.onclick = function () {
    switch (element.id) {
      case "rotX":
        model2 = matmult(model2, rotx(Math.PI / 8));
        break;
      case "rotY":
        model2 = matmult(model2, roty(Math.PI / 8));
        break;
      case "rotZ":
        model2 = matmult(model2, rotz(Math.PI / 8));
        break;
      case "spinX":
        spin("x");
        break;
      case "spinY":
        spin("y");
        break;
      case "spinZ":
        spin("z");
        break;
      case "spinUp":
        spinningAngle += Math.PI; //Math.PI / 8;
        break;
      case "spinDown":
        spinningAngle -= Math.PI;
        break;
    }
  };
});

function spin(axis) {
  isSpinning = !isSpinning;
  if (isSpinning) {
    interval = setInterval(() => {
      switch (axis) {
        case "x":
          model2 = matmult(model2, rotx(spinningAngle));
          break;
        case "y":
          model2 = matmult(model2, roty(spinningAngle));
          break;
        case "z":
          model2 = matmult(model2, rotz(spinningAngle));
      }
    }, 150);
  } else clearInterval(interval);
}

document.onkeydown = function (event) {
  switch (event.key) {
    //For model1
    case `ArrowRight`: //translate right along the x-axis
      tx += 0.01;
      break;
    case `ArrowLeft`: //translate left along the x-axis
      tx -= 0.01;
      break;
    case `ArrowUp`: // translate up along the y-axis
     ty += 0.01;
      break;
    case `ArrowDown`: // translate down along the y-axis
      ty -= 0.01;
      break;
  }
};

draw();

function draw() {
  
  webgl.clear(webgl.COLOR_BUFFER_BIT);
  model1 = matmult(createmat4(), translate(tx, ty, tz));
  webgl.uniformMatrix4fv(webgl.getUniformLocation(program, `model1`),false,model1);
  webgl.drawArrays(webgl.TRIANGLES, 0, box.length / 6);
  webgl.uniformMatrix4fv(webgl.getUniformLocation(program, `model1`),false, model2);
  webgl.uniform1f(webgl.getUniformLocation(program, "y"), 0.0);
  webgl.uniform1f(webgl.getUniformLocation(program, "x"), 0.5);
  webgl.drawArrays(webgl.TRIANGLES, 0, box.length / 6);
  window.requestAnimationFrame(draw);
}

// Rotation Matrix along X-Axis
function rotx(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
  return new Float32Array([
    1, 0, 0, 0, 
    0, c, s, 0,
    0,-s, c, 0, 
    0, 0, 0, 1]);
}

// Rotation Matrix along Y-Axis
function roty(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
  return new Float32Array([
    c, 0,-s, 0, 
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1]);
}

// Rotation Matrix along Z-Axis
function rotz(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
  return new Float32Array([
    c,-s, 0, 0, 
    s, c, 0, 0, 
    0, 0, 1, 0, 
    0, 0, 0, 1]);
}

// Translation Matrice along X-Y Axis
function translate(tx, ty, tz) {
  return new Float32Array([
    1, 0, 0, 0, 
    0, 1, 0, 0,
    0, 0, 1, 0, 
    tx,ty,tz,1]);
}
// Identity Matrix
function createmat4() {
  return new Float32Array([
    1, 0, 0, 0, 
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
    //m[1,0,0,0,  0,1,0,0,0, 0,1,0 0,0,0,1]
  ]);
}

function matmult(model, b) {
  return [
    model[0] * b[0] + model[1] * b[4] + model[2] * b[8] + model[3] * b[12],
    model[0] * b[1] + model[1] * b[5] + model[2] * b[9] + model[3] * b[13],
    model[0] * b[2] + model[1] * b[6] + model[2] * b[10] + model[3] * b[14],
    model[0] * b[3] + model[1] * b[7] + model[2] * b[11] + model[3] * b[15],

    model[4] * b[0] + model[5] * b[4] + model[6] * b[8] + model[7] * b[12],
    model[4] * b[1] + model[5] * b[5] + model[6] * b[9] + model[7] * b[13],
    model[4] * b[2] + model[5] * b[6] + model[6] * b[10] + model[7] * b[14],
    model[4] * b[3] + model[5] * b[7] + model[6] * b[11] + model[7] * b[15],

    model[8] * b[0] + model[9] * b[4] + model[10] * b[8] + model[11] * b[12],
    model[8] * b[1] + model[9] * b[5] + model[10] * b[9] + model[11] * b[13],
    model[8] * b[2] + model[9] * b[6] + model[10] * b[10] + model[11] * b[14],
    model[8] * b[3] + model[9] * b[7] + model[10] * b[11] + model[11] * b[15],

    model[12] * b[0] + model[13] * b[4] + model[14] * b[8] + model[15] * b[12],
    model[12] * b[1] + model[13] * b[5] + model[14] * b[9] + model[15] * b[13],
    model[12] * b[2] + model[13] * b[6] + model[14] * b[10] + model[15] * b[14],
    model[12] * b[3] + model[13] * b[7] + model[14] * b[11] + model[15] * b[15],
  ];
}
