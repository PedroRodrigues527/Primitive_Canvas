let pointsArray = [];
let texCoordsArray = [];

let gl;
let ctm;
let modelViewMatrix;

let program;

const angle = 0.02; // rotation in radians

// constants for rotating
let xAxis = 0;
let yAxis = 1;
let zAxis = 2;
let axis = xAxis;


window.onload = function () {
    init();
}

function init() {

    // *** Get canvas ***
    const canvas = document.getElementById('gl-canvas');

    /** @type {WebGLRenderingContext} */ // ONLY FOR VS CODE
    gl = canvas.getContext('webgl') || canvas.getContext("experimental-webgl");
    if (!gl) {
        alert('WebGL not supported');
        return;
    }

    // *** Computes the cube ***
    cube();

    // *** Set viewport ***
    gl.viewport(0, 0, canvas.width, canvas.height)

    // *** Set color to the canvas ***
    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // *** Initialize vertex and fragment shader ***
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // *** Send position data to the GPU ***
    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsArray), gl.STATIC_DRAW);

    // *** Define the form of the data ***
    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    // *** Send texture data to the GPU ***
    let tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordsArray), gl.STATIC_DRAW);

    // *** Define the form of the data ***
    let vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.enableVertexAttribArray(vTexCoord);
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);

    // *** Get a pointer for the model viewer
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
    ctm = mat4.create();

    // Set the image for the texture
    let image = new Image();
    image.src = 'texture.png'
    image.onload = function () {
        configureTexture(image);
    }

    // *** Create the event listeners for the buttons
    document.getElementById("rotateX").onclick = function () {
        axis = xAxis;
    };
    document.getElementById("rotateY").onclick = function () {
        axis = yAxis;
    };
    document.getElementById("rotateZ").onclick = function () {
        axis = zAxis;
    };

    // *** Render ***
    render();

}

function cube() {

    // Specify the coordinates to draw
    pointsArray = [
        -.5, 0.5, 0.5,
        -.5, -.5, 0.5,
        0.5, -.5, 0.5,
        -.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        0.5, -.5, -.5,
        0.5, 0.5, 0.5,
        0.5, -.5, -.5,
        0.5, 0.5, -.5,
        0.5, -.5, 0.5,
        -.5, -.5, 0.5,
        -.5, -.5, -.5,
        0.5, -.5, 0.5,
        -.5, -.5, -.5,
        0.5, -.5, -.5,
        0.5, 0.5, -.5,
        -.5, 0.5, -.5,
        -.5, 0.5, 0.5,
        0.5, 0.5, -.5,
        -.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        -.5, -.5, -.5,
        -.5, 0.5, -.5,
        0.5, 0.5, -.5,
        -.5, -.5, -.5,
        0.5, 0.5, -.5,
        0.5, -.5, -.5,
        -.5, 0.5, -.5,
        -.5, -.5, -.5,
        -.5, -.5, 0.5,
        -.5, 0.5, -.5,
        -.5, -.5, 0.5,
        -.5, 0.5, 0.5,
    ];

    //
    texCoordsArray = [
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
    ];


}

function render() {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Apply rotation
    switch (axis) {
        case xAxis:
            mat4.rotateX(ctm, ctm, angle);
            break;
        case yAxis:
            mat4.rotateY(ctm, ctm, angle);
            break;
        case zAxis:
            mat4.rotateZ(ctm, ctm, angle);
            break;
        default:
            return -1
    }

    // Transfer the information to the model viewer
    gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

    // Draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length / 3);

    // Make the new frame
    requestAnimationFrame(render);
}

function configureTexture(image) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}