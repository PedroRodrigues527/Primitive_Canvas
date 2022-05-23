let pointsArray = [];
let texCoordsArray = [];
let colorsArray = [];

let primitivesArray = [];
const NUMBER_PRIMITIVES = 10;

let gl;
let ctm;
let modelViewMatrix;

let program;

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
    /*
    // Set the image for the texture
    let image = new Image();
    image.src = 'texture.png'
    image.onload = function () {
        configureTexture(image);
    }

    // *** Create the event listeners for the buttons
    /*
    document.getElementById("rotateX").onclick = function () {
        axis = xAxis;
    };
    document.getElementById("rotateY").onclick = function () {
        axis = yAxis;
    };
    document.getElementById("rotateZ").onclick = function () {
        axis = zAxis;
    };
    */

    document.getElementById("btn-add-primitive").onclick = function () {
        addCube();
    }


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

    // Specify the colors of the faces
    let vertexColors = [
        [1.0, 1.0, 0.0], // yellow
        [0.0, 1.0, 0.0], // green
        [0.0, 0.0, 1.0], // blue
        [1.0, 0.0, 1.0], // magenta
        [0.0, 1.0, 1.0], // cyan
        [1.0, 0.0, 0.0], // red
    ];

    // Set the color of the faces
    for (let face = 0; face < 6; face++) {
        let faceColor = vertexColors[face];
        for (let vertex = 0; vertex < 6; vertex++) {
            colorsArray.push(...faceColor);
        }
    }

}

function prepareCube(cube)
{
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

    /*
    // *** Define the form of the data ***
    let vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.enableVertexAttribArray(vTexCoord);
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
     */

    // *** Define the color of the data ***
    let vColor = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor);
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);

    // *** Get a pointer for the model viewer
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
    ctm = mat4.create();


    // *** Apply transformations ***
    mat4.scale(ctm, ctm, [cube.scale, cube.scale, cube.scale]);
    mat4.translate(ctm, ctm, [cube.translation.x, cube.translation.y, cube.translation.z]);

    // *** Rotate cube (if necessary) ***
    cube.currentRotation.x += cube.rotation.x;
    cube.currentRotation.y += cube.rotation.y;
    cube.currentRotation.z += cube.rotation.z;
    mat4.rotateX(ctm, ctm, cube.currentRotation.x);
    mat4.rotateY(ctm, ctm, cube.currentRotation.y);
    mat4.rotateZ(ctm, ctm, cube.currentRotation.z);



    // *** Transfer the information to the model viewer ***
    gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

    // *** Draw the triangles ***
    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length / 3);
}

function addCube() {
    /*
    // Extract the information of the fields
    let scaleFactor = document.getElementById("scale_factor").value;
    let xTranslation = document.getElementById("X_translation").value;
    let yTranslation = document.getElementById("Y_translation").value;
    let zTranslation = document.getElementById("Z_translation").value;
    let xRotation = document.getElementById("X_rotation").value;
    let yRotation = document.getElementById("Y_rotation").value;
    let zRotation = document.getElementById("Z_rotation").value;

    // If the form has all the fields field
    let valid = scaleFactor && xTranslation && yTranslation && zTranslation && xRotation && yRotation && zRotation;

    if (true) {
        // Create the cube object
        let cube = {
            scale: parseFloat(scaleFactor) / 100,
            translation: {
                x: parseFloat(xTranslation) / 100,
                y: parseFloat(yTranslation) / 100,
                z: parseFloat(zTranslation) / 100
            },
            rotation: {
                x: parseFloat(xRotation) * (Math.PI / 180),
                y: parseFloat(yRotation) * (Math.PI / 180),
                z: parseFloat(zRotation) * (Math.PI / 180)
            },
            currentRotation: {
                x: 0,
                y: 0,
                z: 0,
            }
        }
        // Append the cube object to the array
        primitivesArray.push(cube);
    }
    else {
        return -1;
    }
     */

    let cube = {
        scale: 1,
        translation: {
            x: 0,
            y: 0,
            z: 0
        },
        rotation: {
            x: 0,
            y: 0,
            z: 0
        },
        currentRotation: {
            x: 0,
            y: 0,
            z: 0,
        }
    }
    // Append the cube object to the array
    primitivesArray.push(cube);
}

function render() {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //  Add the cubes to the canvas
    for (const primitive of primitivesArray) {
        prepareCube(primitive);
    }

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