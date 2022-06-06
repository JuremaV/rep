const canvas = document.querySelector(`canvas`);
const webgl = canvas.getContext(`webgl`);
if (!webgl) {
  throw new Error("WebGL not supported!");
}
webgl.clearColor(1.0, 1.0, 1.0, 1.0);
//webgl.clearColor( Math.random(), Math.random(), Math.random(), 1.0,);
webgl.clear(webgl.COLOR_BUFFER_BIT);
webgl.enable(webgl.DEPTH_TEST);
var r = 0.5;

let image = document.getElementById("Me");

var cube = new Float32Array([

  //1.FRONT FACE 
  r,r,r,   r,-r,r,  -r,r,r,  //1st Triang
 -r,r,r,   r,-r,r,  -r,-r,r,  //2nd Triang
  
  //2.BACK FACE 
  r,r,-r,  r,-r,-r,  -r,r,-r,   //1st Triang
 -r,r,-r,  r,-r,-r,   -r,-r,-r, //2nd Triang

  //3.TOP FACE
  r,r,r,   -r,r,r,   -r,r,-r,  //1st Triang
  r,r,r,  -r,r,-r,   r,r,-r, //2nd Triang

  //4.BOTTON FACE 
  r,-r,r,  -r,-r,r,   -r,-r,-r,   //1st Triang
  r,-r,r,  -r,-r,-r,   r,-r,-r,  //2nd Triang

 //5.LEFT FACE 
 -r,-r,r,  -r,r,r,   -r,-r,-r, //1st Triang
 -r,-r,-r, -r,r,r,  -r,r,-r,   //2nd Triang

  //6.RIGHT FACE 
  r,-r,r,   r,r,r,  r,-r,-r,  //1st Triang
  r,-r,-r,  r,r,r,  r,r,-r,  //2nd Triang


    
 ]);

 
var texCoords = new Float32Array([

    //1.FRONT FACE
    1,1, 1,0, 0,1, 0,1, 1,0, 0,0,

    //2.BACK FACE
    1,1, 1,0, 0,1, 0,1, 1,0, 0,0,

    //3.TOP FACE
    1,0, 0,0, 0,1, 1,0, 0,1, 1,1,   
    
    //4.BOTTOM FACE
    1,1, 0,1, 0,0, 1,1, 0,0, 1,0,    
  
    //5.LEFT FACE  
    0,0, 0,1, 1,0, 1,0, 0,1, 1,1,

    //6.RIGHT FACE
    1,0, 1,1, 0,0, 0,0, 1,1, 0,1,
        
]);
      

const positionBuffer = webgl.createBuffer();
webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer);
webgl.bufferData(webgl.ARRAY_BUFFER, cube, webgl.STATIC_DRAW);

const textCoordBuffer = webgl.createBuffer();
webgl.bindBuffer(webgl.ARRAY_BUFFER, textCoordBuffer);
webgl.bufferData(webgl.ARRAY_BUFFER, texCoords, webgl.STATIC_DRAW);

const texturebuffer = webgl.createTexture();
webgl.bindTexture(webgl.TEXTURE_2D, texturebuffer);
webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.LINEAR);
webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);

webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA,webgl.RGBA,webgl.UNSIGNED_BYTE, image);



const vertexShader = webgl.createShader(webgl.VERTEX_SHADER);
webgl.shaderSource(
  vertexShader,
  `attribute vec3 pos;
attribute vec2 vtexture;
varying vec2 fragtexture;
uniform mat4 model1;
uniform float x;
uniform float y;

void main() { 
    
    
    fragtexture = vtexture;
    
    gl_Position = model1*vec4(0.5*pos,1) + vec4(x, y, 0.0, 0.0);

}`
);
webgl.compileShader(vertexShader);
if (!webgl.getShaderParameter(vertexShader, webgl.COMPILE_STATUS)) {
  console.error(
    "ERROR compiling vertex shader!",
    webgl.getShaderInfoLog(vertexShader)
  ); }

const fragmentShader = webgl.createShader(webgl.FRAGMENT_SHADER);
webgl.shaderSource(
  fragmentShader,
  `precision mediump float; 
varying vec2 fragtexture;
uniform sampler2D fragsampler;

void main() 
{

    gl_FragColor = texture2D(fragsampler, fragtexture);

}`);
webgl.compileShader(fragmentShader);
if (!webgl.getShaderParameter(fragmentShader, webgl.COMPILE_STATUS)) {
  console.error(
    "ERROR compiling fragment shader!",
    webgl.getShaderInfoLog(fragmentShader)
  ); }

const program = webgl.createProgram();
webgl.attachShader(program, vertexShader);
webgl.attachShader(program, fragmentShader);
webgl.linkProgram(program);
webgl.useProgram(program);
webgl.enable(webgl.DEPTH_TEST);

const positionLocation = webgl.getAttribLocation(program, `pos`);
webgl.enableVertexAttribArray(positionLocation);
webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer);
webgl.vertexAttribPointer(positionLocation, 3, webgl.FLOAT,false, 0, 0);


const textureLocation = webgl.getAttribLocation(program, `vtexture`);
webgl.enableVertexAttribArray(textureLocation );
webgl.bindBuffer(webgl.ARRAY_BUFFER, textCoordBuffer);
webgl.vertexAttribPointer(textureLocation, 2, webgl.FLOAT, false, 0, 0);


let model1 = createmat4();
let model2 = createmat4();
let b = 0; //Math.PI;
let tx = -0.8;
let ty = 0;
let tz = 0;
// let out42 = 0.5;
// let out52 = 0.0;
// let out62 = 0.0;
stopstart = 1;
let isSpinning = false;
let interval = null;
let spinningAngle = Math.PI /8;

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

spinX.addEventListener("click", function () {
  matmult(createmat4(), rotx(angleInRadians));
});

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
  webgl.drawArrays(webgl.TRIANGLES, 0, 36);
  webgl.uniformMatrix4fv(webgl.getUniformLocation(program, `model1`),false, model2);
  webgl.uniform1f(webgl.getUniformLocation(program, "y"), 0.0);
  webgl.uniform1f(webgl.getUniformLocation(program, "x"), 0.5);
  webgl.activeTexture(webgl.TEXTURE0);
  webgl.drawArrays(webgl.TRIANGLES, 0, 36);
  window.requestAnimationFrame(draw);
}
 
//vertices.length/6

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
function translate(tx,ty,tz) {
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
