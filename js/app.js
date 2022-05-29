let pointsArray = [];
let texCoordsArray = [];
let colorsArray = [];
let normalsArray = [];

let primitivesArray = [];
const MAX_PRIMITIVES = 10;

let modelsArray = [];
const MAX_MODELS = 5;

let gl;
let ctm;
let modelViewMatrix;
let ambientUniformLocation;

let diffColorUniformLocation;
let diffDirectionUniformLocation;

let program;

let model_src = "modelos/tiger.obj";
let model_txt = "modelos/tiger_texture.jpg";

window.onload = function () {
    init();
}

async function init() {

    // *** Get canvas ***
    const canvas = document.getElementById('gl-canvas');

    /** @type {WebGLRenderingContext} */ // ONLY FOR VS CODE
    gl = canvas.getContext('webgl') || canvas.getContext("experimental-webgl");
    if (!gl) {
        alert('WebGL not supported');
        return;
    }

    // *** Computes the cube and pyramid ***
    cube();
    // TODO: PYRAMID TRIANGULAR

    // *** Set viewport ***
    gl.viewport(0, 0, canvas.width, canvas.height)

    // *** Set color to the canvas ***
    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // *** Initialize vertex and fragment shader ***
    program = await initShaders(gl);
    gl.useProgram(program);


    ambientUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
    diffColorUniformLocation = gl.getUniformLocation(program, 'diffuse_light.color');
    diffDirectionUniformLocation = gl.getUniformLocation(program, 'diffuse_light.direction');

    // Set the image for the texture
    let image = new Image();
    image.src = model_txt;
    image.onload = function () {
        configureTexture(image);
    }

    // *** Create the event listeners for the buttons
    document.getElementById("btn-add-primitive").onclick = function () {
        addCube();
    };
    document.getElementById("btn-add-model").onclick = async function () {
        await createObject();
    };
    document.getElementById("btn-add-light").onclick = function () {
        applyLighting();
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

    // Get coordinates to insert texture in cube
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

    // Send texture data to the GPU
    let tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordsArray), gl.STATIC_DRAW);

    // Define the form of the data
    let vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.enableVertexAttribArray(vTexCoord);
    gl.vertexAttribPointer(vTexCoord, 3, gl.FLOAT, false, 0, 0);

    // Send texture data to the GPU
    let nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalsArray), gl.STATIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsArray), gl.STATIC_DRAW);

    // Define the form of the data
    let normalCoord = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(normalCoord);
    gl.vertexAttribPointer(normalCoord, 3, gl.FLOAT, false, 0, 0);

    // *** Get a pointer for the model viewer
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
    ctm = mat4.create();


    // *** Apply transformations ***
    mat4.scale(ctm, ctm, [cube.scale.x, cube.scale.y, cube.scale.z]);
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
    if(primitivesArray.length < MAX_PRIMITIVES) {
        // Create the cube object
        let cube = {
            scale: {
                x: parseFloat("100") / 100,
                y: parseFloat("100") / 100,
                z: parseFloat("100") / 100,
            },
            translation: {
                x: parseFloat("0") / 100,
                y: parseFloat("0") / 100,
                z: parseFloat("0") / 100
            },
            rotation: {
                x: parseFloat("0") * (Math.PI / 180),
                y: parseFloat("0") * (Math.PI / 180),
                z: parseFloat("0") * (Math.PI / 180)
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
    else
        alert("Maximum number of primitives reached!");
}

function render() {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //  Add the cubes to the canvas
    for (const primitive of primitivesArray) {
        prepareCube(primitive);
    }

    // Add objects to the canvas
    for (const model of modelsArray)
    {
        prepareModel();
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

function prepareModel()
{
    // *** Send position data to the GPU ***
    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsArray), gl.STATIC_DRAW);

    // *** Define the form of the data ***
    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    // Send texture data to the GPU
    let tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordsArray), gl.STATIC_DRAW);

    // Define the form of the data
    let vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.enableVertexAttribArray(vTexCoord);
    gl.vertexAttribPointer(vTexCoord, 3, gl.FLOAT, false, 0, 0);

    // Send texture data to the GPU
    let nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalsArray), gl.STATIC_DRAW);

    // Define the form of the data
    let normalCoord = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(normalCoord);
    gl.vertexAttribPointer(normalCoord, 3, gl.FLOAT, false, 0, 0);

    // *** Get a pointer for the model viewer
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
    ctm = mat4.create();
}

async function createObject()
{
    if(modelsArray.length < MAX_MODELS) {
        let modelContent = await loadObjResource(model_src);
        let modelData = parseOBJ(modelContent);
        pointsArray = modelData.position;
        texCoordsArray = modelData.texcoord;
        normalsArray = modelData.normal;
        normalize(pointsArray);
        modelsArray.push(modelData);
    }
    else
    {
        alert("Maximum number of models reached!");
    }
}

function applyLighting()
{
    let typeLight = document.getElementById("light-type").value;

    let lightDirectionX = document.getElementById("direction-x").value;
    let lightDirectionY = document.getElementById("direction-y").value;
    let lightDirectionZ = document.getElementById("direction-z").value;

    let lightColorRed = document.getElementById("intensity-r").value;
    let lightColorGreen = document.getElementById("intensity-g").value;
    let lightColorBlue = document.getElementById("intensity-b").value;

    if(typeLight === "ambient")
    {
        gl.uniform3f(ambientUniformLocation,lightColorRed,lightColorGreen,lightColorBlue);
    }
    else if(typeLight === "diffuse")
    {
        gl.uniform3f(diffColorUniformLocation,lightColorRed,lightColorGreen,lightColorBlue);
        gl.uniform3f(diffDirectionUniformLocation,lightDirectionX,lightDirectionY,lightDirectionZ);
    }
    else
    {
        return -1;
    }
}