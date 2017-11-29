var imageProcLoadedImages = {};

// Browser security issues makes using a file:// URL infeasible
if (window.location.href.substring(0, 6) != "https:") {
    document.documentElement.innerHTML = "<h1>Because of browser security issues, you can't view this web page locally (by opening it). You must use an \"https\" URL like https://people.ucls.uchicago.edu/~username/...</h1>";
}

//Makes a new image on the given canvas id
function createNewImage(canvasId, width, height){
    var canvas = document.getElementById(canvasId);
    canvas.height = height;
    canvas.width = width;
    var ctx=canvas.getContext("2d");
    ctx.fillStyle="#FFFFFF";
    ctx.fillRect(0,0,width,height);
    var fileName = getImageFileName("");
    imageProcLoadedImages[fileName] = ctx.getImageData(0,0,width,height);
}

function loadImageHelper(canvasId, image) {
    canvas = document.getElementById(canvasId);
    canvas.width = image.width;
    canvas.height = image.height;
    var ctx=canvas.getContext("2d");
    ctx.drawImage(image,0,0);
    var imageData = ctx.getImageData(0, 0, image.width, image.height);
    imageProcLoadedImages[image.src] = imageData;
}

function loadImage(canvasId, filename){
    var image = new Image();
    image.src = filename;
    image.onload = function(e) {loadImageHelper(canvasId, image);};
}

function getImageFileName(fileName) {
    var link = document.createElement("a");
    link.href = fileName;
    return link.protocol+"//"+link.host+link.pathname+link.search+link.hash;
}

// Note: can't load the same image into two different canvases (which wouldn't be very useful anyways)
function getLoadedImage(fileName) {
    var fullFileName = getImageFileName(fileName);
    return imageProcLoadedImages[fullFileName];
}

//Library functions
function getWidth(image){
    checkBounds("getWidth", image);
    return image.width;
}

function getHeight(image){
    checkBounds("getHeight", image);
    return image.height;
}

function getData(image){
    checkBounds("getData", image);
    return image.data;
}

function repaint(image, canvasId){
    var canvas = document.getElementById(canvasId);
    if(!image && !canvas){
        throw new Error("UNDEFINED IMAGE/CANVAS ERROR:\nIt appears you called the repaint function without parameters (i.e. repaint()).\nRepaint requires an image and canvas id. EXAMPLE: repaint(img, 'someCanvasId')");
    }
    if(!image){
        throw new Error("UNDEFINED IMAGE:\nThe image supplied to "+funcName+" is undefined for some reason.  Did you forget to loadImage or getLoadedImage?");
    }
    if(!canvas){
        if(canvas == undefined){
            throw new Error("UNDEFINED CANVAS: you did not give a canvas id to the function.");
        }
        else{
            throw new Error("UNDEFINED CANVAS:\nThere is no canvas in the document called '"+canvasId+"'");
        }
    }
    canvas.width = image.width; //alters the canvas to match image data width/height
    canvas.height = image.height;
    var ctx=canvas.getContext("2d");
    ctx.putImageData(image,0,0);
}

// Getter and Setter functions for individual pixels.
function getRed(image, x, y){
    x= Math.floor(x);
    y=Math.floor(y);
    checkBounds("getRed", image, x, y)
    return image.data[(y*image.width*4+x*4)];
}

function setRed(image, x, y, value){
    x= Math.floor(x);
    y=Math.floor(y);
    checkBounds("setRed", image, x, y)
    var i = (y*image.width*4+x*4);
    image.data[i]=value;
}

function getGreen(image, x, y){
    x= Math.floor(x);
    y=Math.floor(y);
    checkBounds("getGreen", image, x, y)
    return image.data[(y*image.width*4+x*4)+1];
}

function setGreen(image, x, y, value){
    x= Math.floor(x);
    y=Math.floor(y);
    checkBounds("setGreen", image, x, y)
    var i = (y*image.width*4+x*4+1);
    image.data[i]=value;
}

function getBlue(image, x, y){
    x= Math.floor(x);
    y=Math.floor(y);
    checkBounds("getBlue", image, x, y)
    return image.data[(y*image.width*4+x*4)+2];
}

function setBlue(image, x, y, value){
    x= Math.floor(x);
    y=Math.floor(y);
    checkBounds("setBlue", image, x, y)
    var i = (y*image.width*4+x*4)+2;
    image.data[i]=value;
}

// get a list for the RGB values for a given pixel
// Useful for green screen functions
function getRGB(image, x,y){
    x= Math.floor(x);
    y=Math.floor(y);
    checkBounds("getRGB", image, x, y)
    var i = (y*image.width*4+x*4);
    return [ image.data[i], image.data[i+1], image.data[i+2]]
}

//Set the R,G,and B values for a pixel at x,y
function setRGB(image,x,y,r,g,b){
    x= Math.floor(x);
    y=Math.floor(y);
    checkBounds("setRGB", image, x, y)
    var i = (y*image.width*4+x*4);
    image.data[i]=r;
    image.data[i+1]=g;
    image.data[i+2]=b;
}

function checkBounds(funcName, image, x, y){
    if(!image){
        throw new Error("UNDEFINED IMAGE:\nThe image supplied to "+funcName+" is undefined for some reason.  Did you forget to loadImage or getLoadedImage?");
    }
    if(x>=image.width || x<0){
        throw new Error("X-VALUE OUT OF BOUNDS :\nThe X-VALUE: "+x+" was given in a call to "+funcName+". This is out of bounds.\nThe range should be between 0 and "+(image.width-1)+", inclusive");
    }
    if(y>=image.height || y<0){
        throw new Error("Y-VALUE OUT OF BOUNDS:\nThe Y-VALUE: "+y+" was given in a call to "+funcName+". This is out of bounds.\nThe range should be between 0 and "+(image.height-1)+", inclusive");
    }
}

//setRGBA works by using the given alpha value a to blend the given
// rgb values with the rgb currently existing at pixel x,y.
// in the underlying data array the alpha value will always be 255.
// this function does the averaging "by hand".
function setRGBA(image,x,y,r,g,b,a){
    x= Math.floor(x);
    y=Math.floor(y);
    checkBounds("setRGBA", image, x, y)
    var rgb = getRGB(image,x,y); //current rgb vals for x,y

    //formula = (newVal-currVal)*(pct) + currVal
    // i.o.w - the alpha is a percentage of the difference between
    //    the new and current values for a given pixel, added to the
    //       current value.  i.o.o.w. a weighted average of the difference

    pct = a/255; //given alpha value as %
    var newRed = ((r-rgb[0])*pct) + rgb[0];
    var newGrn = ((g-rgb[1])*pct) + rgb[1];
    var newBlu = ((b-rgb[2])*pct) + rgb[2];
    setRGB(image,x,y,newRed, newGrn, newBlu);
}

//this setRGBA function works by directly setting the red, green, blue, alpha of a pixel
function setRGBA2(image,x,y,r,g,b,a){
    x= Math.floor(x);
    y=Math.floor(y);
    checkBounds("setRGB", image, x, y)
    var i = (y*image.width*4+x*4);
    image.data[i]=r;
    image.data[i+1]=g;
    image.data[i+2]=b;
    image.data[i+3]=a;
}



// Math functions:
// Extract individual color values from a hex color
// Useful in using the color input tag
function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

// Distance between colors: given two 3-tuples, find the distance between them
// Example: distance(getRGB(img, x, y), [0,255,0])
// Useful for green screen functions
function distance(color1, color2){
    return (Math.sqrt(  Math.pow(color1[0]-color2[0], 2) + Math.pow(color1[1]-color2[1], 2) + Math.pow(color1[2]-color2[2], 2)  ))
}


//Creates a PNG the given canvas and opens it in a new window.
// Image can be copy/pasted, saved, etc. from there
//@param canvasId the id of the canvas you want to make a PNG of
function showPNG(canvasId){
    var canvas = document.getElementById(canvasId);
    var ctx=canvas.getContext("2d");
    window.open(canvas.toDataURL(),canvasId,"width="+canvas.width+", height="+canvas.height+", left=100, menubar=0, titlebar=0, scrollbars=0");
}

//synonymous with showPNG
function makePNG(canvasId){
    showPNG(canvasId);
}
