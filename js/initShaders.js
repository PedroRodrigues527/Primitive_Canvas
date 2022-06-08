/**
 * Represents initial Shaders
 * @function
 * @param {WebGLRenderingContext} gl - WebGL Render Context
 */
async function initShaders(gl) {
    let msg;
    var vertShdr;
    var fragShdr;
    var frag_source = await loadTextResource("shaders/fragmentShader.glsl");
    var vert_source = await loadTextResource("shaders/vertexShader.glsl");
    if (vert_source === "") {
      alert("Unable to load vertex shader " + vert_source);
      return -1;
    } else {
      vertShdr = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertShdr, vert_source);
      gl.compileShader(vertShdr);
      if (!gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS)) {
          msg = "Vertex shader failed to compile.  The error log is:" +
              "<pre>" + gl.getShaderInfoLog(vertShdr) + "</pre>";
          alert(msg);
        return -1;
      }
    }
    if (frag_source === "") {
      alert("Unable to load vertex shader " + frag_source);
      return -1;
    } else {
      fragShdr = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragShdr, frag_source);
      gl.compileShader(fragShdr);
      if (!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) {
        msg = "Fragment shader failed to compile.  The error log is:" +
          "<pre>" + gl.getShaderInfoLog(fragShdr) + "</pre>";
        alert(msg);
        return -1;
      }
    }
    var program = gl.createProgram();
    gl.attachShader(program, vertShdr);
    gl.attachShader(program, fragShdr);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      msg = "Shader program failed to link.  The error log is:" +
        "<pre>" + gl.getProgramInfoLog(program) + "</pre>";
      alert(msg);
      return -1;
    }
    return program;
  }
