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
    
    //1.FRONT FACE RED
    -r,r,r, 1,0,0,  -r,-r,r, 1,0,0,  r,-r,r, 1,0,0, //1st Triang
    r,r,r,  1,0,0,  -r,r,r, 1,0,0,   r,-r,r, 1,0,0, //2nd Triang
    
    //2.RIGHT FACE GREEN
    r,r,r,  0,1,0,  r,-r,r, 0,1,0,  r,r,-r,  0,1,0, //1st Triang
    r,-r,r, 0,1,0,  r,r,-r, 0,1,0,  r,-r,-r, 0,1,0, //2nd Triang

    //3.BACK FACE Magenta
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



let pproj  = createmat4();
let vview  = createmat4();

//function perspective(out, fovy, aspect, near, far)  
//out = perspective projection matrix
//fovy = field of view = how wide you can see left to righ
//aspect = aspect ratio
//near and far along z-axis of the canvas world can be seen
//make far to be thousands more than near in ratio.
perspective(pproj, 75 * Math.PI/180,  canvas.width/canvas.height, 0.1,  10000 );  

const vertexShader = webgl.createShader(webgl.VERTEX_SHADER);
webgl.shaderSource(
  vertexShader,
  `attribute vec3 pos;
attribute vec3 colour;
varying vec3 fragcolour;
uniform mat4 model1;
uniform mat4 proj;
uniform mat4 view;
uniform float x;
uniform float y;

void main() { 
    
    
    fragcolour = colour;
    
    //gl_Position = model1*vec4(pos,1.0) + vec4(x, y, 0.0, 0.0);
    gl_Position = proj*view*model1*vec4(0.5*pos,1.0) + vec4(x, y, 0.0, 0.0); 

}`
);
webgl.compileShader(vertexShader);
if (!webgl.getShaderParameter(vertexShader, webgl.COMPILE_STATUS)) {
  console.error(
    "ERROR compiling vertex shader!",
    webgl.getShaderInfoLog(vertexShader)
  );
}

//place the camera at a position in x,y and z
translt(vview, vview, [0, 0, 1]);
//after placing a camera you must invert that movement
//moving a camera to the left feels the same as moving an object
//to the right, so it is an inverse
invert(vview, vview);

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
let b      = 0.0; //Math.PI;
let xt     = -0.8;
let yt     = 0.0;
let zt     = 0.0;
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

document.onkeydown = function (event) {
  switch (event.key) {
    //For model1
    case `ArrowRight`: //translate right along the x-axis
      xt += 0.01;
      break;
    case `ArrowLeft`: //translate left along the x-axis
      xt -= 0.01;
      break;
    case `ArrowUp`: // translate up along the y-axis
     yt += 0.01;
      break;
    case `ArrowDown`: // translate down along the y-axis
      yt -= 0.01;
      break;
  }
};

draw();


function draw() {
  
  webgl.clear(webgl.COLOR_BUFFER_BIT);
  model1 = matmult(createmat4(), translate(xt, yt, zt));
  webgl.uniformMatrix4fv(webgl.getUniformLocation(program, `model1`),false, model1);
  webgl.uniformMatrix4fv(webgl.getUniformLocation(program, `proj`),false, pproj);
  webgl.uniformMatrix4fv(webgl.getUniformLocation(program, `view`),false, vview);
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

//
function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf;
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;

    if (far != null && far !== Infinity) {
      nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -2 * near;
    }

    return out;
  }


  function invert(out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    var a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    var a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32; 

    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }

    det = 1.0 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }
  

  function translt(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2];
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;

    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11];
      out[0] = a00;
      out[1] = a01;
      out[2] = a02;
      out[3] = a03;
      out[4] = a10;
      out[5] = a11;
      out[6] = a12;
      out[7] = a13;
      out[8] = a20;
      out[9] = a21;
      out[10] = a22;
      out[11] = a23;
      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
  }
//

function matmult(model1, b) {
    return [
      model1[0] * b[0] + model1[1] * b[4] + model1[2] * b[8]  + model1[3] * b[12],
      model1[0] * b[1] + model1[1] * b[5] + model1[2] * b[9]  + model1[3] * b[13],
      model1[0] * b[2] + model1[1] * b[6] + model1[2] * b[10] + model1[3] * b[14],
      model1[0] * b[3] + model1[1] * b[7] + model1[2] * b[11] + model1[3] * b[15],
  
      model1[4] * b[0] + model1[5] * b[4] + model1[6] * b[8]  + model1[7] * b[12],
      model1[4] * b[1] + model1[5] * b[5] + model1[6] * b[9]  + model1[7] * b[13],
      model1[4] * b[2] + model1[5] * b[6] + model1[6] * b[10] + model1[7] * b[14],
      model1[4] * b[3] + model1[5] * b[7] + model1[6] * b[11] + model1[7] * b[15],
  
      model1[8] * b[0] + model1[9] * b[4] + model1[10] * b[8]  + model1[11] * b[12],
      model1[8] * b[1] + model1[9] * b[5] + model1[10] * b[9]  + model1[11] * b[13],
      model1[8] * b[2] + model1[9] * b[6] + model1[10] * b[10] + model1[11] * b[14],
      model1[8] * b[3] + model1[9] * b[7] + model1[10] * b[11] + model1[11] * b[15],
  
      model1[12] * b[0] + model1[13] * b[4] + model1[14] * b[8]  + model1[15] * b[12],
      model1[12] * b[1] + model1[13] * b[5] + model1[14] * b[9]  + model1[15] * b[13],
      model1[12] * b[2] + model1[13] * b[6] + model1[14] * b[10] + model1[15] * b[14],
      model1[12] * b[3] + model1[13] * b[7] + model1[14] * b[11] + model1[15] * b[15],
    ];
  }