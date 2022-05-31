let pointsArray = [];
let texCoordsArray = [];
let colorsArray = [];
let normalsArray = [];

// Specify the colors of faces
let vertexColors = [
    [1.0 ,1.0, 1.0], // white
    [1.0, 1.0, 0.0], // yellow
    [0.0, 1.0, 0.0], // green
    [0.0, 0.0, 1.0], // blue
    [1.0, 0.0, 1.0], // magenta
    [0.0, 1.0, 1.0], // cyan
    [1.0, 0.0, 0.0], // red
    [0.0 ,0.0, 0.0], // black
];

//let color = new Uint8Array(4);

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

//TODO: CHOOSE .OBJ AND .IMG MODEL IN HTML
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
    triangularPyramid();

    // *** Set viewport ***
    gl.viewport(0, 0, canvas.width, canvas.height)

    // *** Set color to the canvas ***
    gl.clearColor(0.95, .95, .95, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // *** Initialize vertex and fragment shader ***
    program = await initShaders(gl);
    gl.useProgram(program);

    ambientUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
    diffColorUniformLocation = gl.getUniformLocation(program, 'diffuse_light.color');
    diffDirectionUniformLocation = gl.getUniformLocation(program, 'diffuse_light.direction');

    updateOptionsSelect("REMOVE");

    // *** Create the event listeners for the buttons ***
    document.getElementById("btn-add-primitive").onclick = function () {
        if(document.getElementById("add-primitive").value === "cube")
        {
            cube();
            let textureChosen = document.getElementById("add-primitive-get-texture-file").value;
            addCube(textureChosen);
            updateOptionsSelect("Cubo ");
        }
        else if(document.getElementById("add-primitive").value === "triangular-pyramid")
        {
            triangularPyramid();
            let textureChosen = document.getElementById("add-primitive-get-texture-file").value;
            addTriangularPyramid(textureChosen);
            updateOptionsSelect("Pir\u00E2mide triangular ");
        }
        else
        {
            return -1;
        }
    };
    document.getElementById("btn-load-texture").onclick = function () {
        document.getElementById("add-primitive-get-texture-file").click();
    };
    document.getElementById("add-primitive-get-texture-file").onchange = function () {
        if(document.getElementById("add-primitive-get-texture-file").value !== "")
        {
            document.getElementById("btn-load-texture").innerText='Textura Carregada \u2714';
        }
        else
        {
            document.getElementById("btn-load-texture").innerText='Carregar Textura';
        }
    }
    //TODO:
    // Add Pyramid

    document.getElementById("btn-add-model").onclick = async function () {
        await createObject();
        updateOptionsSelect("Modelo ");
    };

    document.getElementById("btn-add-light").onclick = function () {
        applyLighting();
    };

    document.getElementById("btn-start-animate").onclick = function () {
        startAnimation();
    }
    //TODO: OTHER ONCLICK BUTTONS


    // *** Render ***
    render();

    /*
    // *** Add listener for mouse down event
    canvas.addEventListener("mousedown", function (event) {

        // Render to texture with base colors
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length / 3);

        // Get mouse position
        let x = event.clientX;
        let y = canvas.height - event.clientY;

        // Read the pixels and print the result
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);

        //document.getElementById('color-result').textContent = colorResult

        // Normal render
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length / 3);

    });

     */
}

function cube() {

    // Specify the coordinates to draw
    pointsArray = [
        //FRONT FACE
        -.5, 0.5, 0.5,
        -.5, -.5, 0.5,
        0.5, -.5, 0.5,
        -.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        0.5, 0.5, 0.5,
        //RIGHT FACE
        0.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        0.5, -.5, -.5,
        0.5, 0.5, 0.5,
        0.5, -.5, -.5,
        0.5, 0.5, -.5,
        //BOTTOM FACE
        0.5, -.5, 0.5,
        -.5, -.5, 0.5,
        -.5, -.5, -.5,
        0.5, -.5, 0.5,
        -.5, -.5, -.5,
        0.5, -.5, -.5,
        //TOP FACE
        0.5, 0.5, -.5,
        -.5, 0.5, -.5,
        -.5, 0.5, 0.5,
        0.5, 0.5, -.5,
        -.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        //BACK FACE
        -.5, -.5, -.5,
        -.5, 0.5, -.5,
        0.5, 0.5, -.5,
        -.5, -.5, -.5,
        0.5, 0.5, -.5,
        0.5, -.5, -.5,
        //LEFT FACE
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

    normalsArray = [
        //FRONT FACE
        0, 0, 0.5,
        0, 0, 0.5,
        0, 0, 0.5,
        0, 0, 0.5,
        0, 0, 0.5,
        0, 0, 0.5,
        //RIGHT FACE
        0.5, 0, 0,
        0.5, 0, 0,
        0.5, 0, 0,
        0.5, 0, 0,
        0.5, 0, 0,
        0.5, 0, 0,
        //BOTTOM FACE
        0, -.5, 0,
        0, -.5, 0,
        0, -.5, 0,
        0, -.5, 0,
        0, -.5, 0,
        0, -.5, 0,
        //TOP FACE
        0, 0.5, 0,
        0, 0.5, 0,
        0, 0.5, 0,
        0, 0.5, 0,
        0, 0.5, 0,
        0, 0.5, 0,
        //BACK FACE
        0, 0, -.5,
        0, 0, -.5,
        0, 0, -.5,
        0, 0, -.5,
        0, 0, -.5,
        0, 0, -.5,
        //LEFT FACE
        -.5, 0, 0,
        -.5, 0, 0,
        -.5, 0, 0,
        -.5, 0, 0,
        -.5, 0, 0,
        -.5, 0, 0,
    ]

}

function triangularPyramid() {

    // Specify the coordinates to draw
    pointsArray = [
        //FRONT FACE
        -.5, -.5, .5,
        0, .5, 0,
        .5, -.5, .5,
        //RIGHT FACE
        0, .5, 0,
        .5, -.5, .5,
        0, -.5, -.5,
        //LEFT FACE
        -.5, -.5, .5,
        0, -.5, -.5,
        0, .5, 0,
        //BOTTOM FACE
        -.5, -.5, .5,
        0, -.5, -.5,
        .5, -.5, .5,
    ];

    // Get coordinates to insert texture in cube
    texCoordsArray = [
        0, 0,
        0, 1,
        1, 1,

        0, 0,
        0, 1,
        1, 1,

        0, 0,
        0, 1,
        1, 1,

        1, 1,
        1, 0,
        0, 0,
    ];

    normalsArray = [
        0, .25, 0.5,
        0, .25, 0.5,
        0, .25, 0.5,

        .5, .25, 0,
        .5, .25, 0,
        .5, .25, 0,

        -.5, .25, 0,
        -.5, .25, 0,
        -.5, .25, 0,

        0, -.5, 0,
        0, -.5, 0,
        0, -.5, 0,
    ]

}

function preparePrimitive(primitive)
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
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);

    // Send texture data to the GPU
    let nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalsArray), gl.STATIC_DRAW);

    // Define the form of the data
    let normalCoord = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(normalCoord);
    gl.vertexAttribPointer(normalCoord, 3, gl.FLOAT, false, 0, 0);

    // *** Send color data to the GPU ***
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsArray), gl.STATIC_DRAW);

    // *** Define the color of the data ***
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor);
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);


    // *** Get a pointer for the model viewer
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
    ctm = mat4.create();

    // *** Apply transformations ***
    mat4.scale(ctm, ctm, [primitive.scale.x, primitive.scale.y, primitive.scale.z]);
    mat4.translate(ctm, ctm, [primitive.translation.x, primitive.translation.y, primitive.translation.z]);

    // *** Rotate cube (if necessary) ***
    primitive.currentRotation.x += primitive.rotation.x;
    primitive.currentRotation.y += primitive.rotation.y;
    primitive.currentRotation.z += primitive.rotation.z;
    mat4.rotateX(ctm, ctm, primitive.currentRotation.x);
    mat4.rotateY(ctm, ctm, primitive.currentRotation.y);
    mat4.rotateZ(ctm, ctm, primitive.currentRotation.z);

    // *** Transfer the information to the model viewer ***
    gl.uniformMatrix4fv(modelViewMatrix, false, ctm);

    // *** Draw the triangles ***
    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length / 3);
}

function addCube(textureChosen) {
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

        if(textureChosen !== "")
        {
            const stringSplit = textureChosen.split('\\').pop().split('/').pop();
            model_txt = "modelos/" + stringSplit;
            let image = new Image();
            image.src = model_txt;
            image.onload = function () {
                configureTexture(image);
            }
        }
        else
        {
            model_txt = "modelos/white.png";
            let image = new Image();
            image.src = model_txt;
            image.onload = function () {
                configureTexture(image);
            }
        }

        let faceColor1 = document.getElementById('color-face-1').value;
        let faceColor2 = document.getElementById('color-face-2').value;
        let faceColor3 = document.getElementById('color-face-3').value;
        let faceColor4 = document.getElementById('color-face-4').value;
        let faceColor5 = document.getElementById('color-face-5').value;
        let faceColor6 = document.getElementById('color-face-6').value;
        let arrayFaceColors = [faceColor1,faceColor2,faceColor3,faceColor4,faceColor5,faceColor6];

        // Set the color of the faces
        for (let face = 0; face < 6; face++) {
            let faceColor = vertexColors[arrayFaceColors[face]];
            for (let vertex = 0; vertex < 6; vertex++) {
                colorsArray.push(...faceColor);
            }
        }

        model_txt = "";

        // Append the cube object to the array
        primitivesArray.push(cube);
    }
    else
        alert("Maximum number of primitives reached!");
}

function addTriangularPyramid(textureChosen) {
    if(primitivesArray.length < MAX_PRIMITIVES) {
        // Create the pyramid object
        let pyramid = {
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

        if(textureChosen !== "")
        {
            const stringSplit = textureChosen.split('\\').pop().split('/').pop();
            model_txt = "modelos/" + stringSplit;
            let image = new Image();
            image.src = model_txt;
            image.onload = function () {
                configureTexture(image);
            }
        }
        else
        {
            model_txt = "modelos/white.png";
            let image = new Image();
            image.src = model_txt;
            image.onload = function () {
                configureTexture(image);
            }
        }

        let faceColor1 = document.getElementById('color-face-1').value;
        let faceColor2 = document.getElementById('color-face-2').value;
        let faceColor3 = document.getElementById('color-face-3').value;
        let faceColor4 = document.getElementById('color-face-4').value;
        let arrayFaceColors = [faceColor1,faceColor2,faceColor3,faceColor4];

        // Set the color of the faces
        for (let face = 0; face < 4; face++) {
            let faceColor = vertexColors[arrayFaceColors[face]];
            for (let vertex = 0; vertex < 3; vertex++) {
                colorsArray.push(...faceColor);
            }
        }

        model_txt = "";

        // Append the cube object to the array
        primitivesArray.push(pyramid);
    }
    else
        alert("Maximum number of primitives reached!");
}

function render() {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //  Add the cubes to the canvas
    for (const primitive of primitivesArray) {
        preparePrimitive(primitive);
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


    // *** Send color data to the GPU ***
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsArray), gl.STATIC_DRAW);

    // *** Define the color of the data ***
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor);
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);


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
        colorsArray = Array(pointsArray.length).fill(1.0);
        normalize(pointsArray);
        modelsArray.push(modelData);

        let image = new Image();
        image.src = model_txt;
        image.onload = function () {
            configureTexture(image);
        }
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

function startAnimation()
{
    let typeObject = document.getElementById("object-type").options[document.getElementById("object-type").selectedIndex].text;
    let rotationX = document.getElementById("rotation-x").value;
    let rotationY = document.getElementById("rotation-y").value;
    let rotationZ = document.getElementById("rotation-z").value;

    if(typeObject.includes("Cubo "))
    {
        let indexElement = typeObject.substring(5);
        let cubeGotten = primitivesArray[indexElement];
        cubeGotten.rotation.x = parseFloat(rotationX) * (Math.PI / 180);
        cubeGotten.rotation.y = parseFloat(rotationY) * (Math.PI / 180);
        cubeGotten.rotation.z = parseFloat(rotationZ) * (Math.PI / 180);
        //TODO: MISSING WAY TO ANIMATE AND UPDATE FRAME WHEN THIS HAPPENS
    }
}

function updateOptionsSelect(typeObject)
{
    let options = document.getElementById('object-type').options;
    let options2 = document.getElementById('object-type-manipulation').options;

    if(typeObject === "Cubo " || typeObject === "Pir\u00E2mide triangular ")
    {
        let option = document.createElement("option");
        option.text = typeObject + (primitivesArray.length - 1);
        option.id = typeObject + (primitivesArray.length - 1);
        options2.add(option);

        let option2 = document.createElement("option");
        option2.text = typeObject + (primitivesArray.length - 1);
        option2.id = typeObject + (primitivesArray.length - 1);
        options.add(option2);
    }
    else if(typeObject === "Modelo ")
    {
        let option = document.createElement("option");
        option.text = typeObject + (modelsArray.length - 1);
        option.id = typeObject + (modelsArray.length - 1);
        options2.add(option);

        let option2 = document.createElement("option");
        option2.text = typeObject + (modelsArray.length - 1);
        option2.id = typeObject + (modelsArray.length - 1);
        options.add(option2);
    }
    else if(typeObject === "REMOVE") {
        for (let i = options.length - 1; i >= 0; i--) {
            options.remove(i);
            options2.remove(i);
        }
    }
    else
        return -1;
}