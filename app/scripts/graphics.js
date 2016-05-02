var scene = new THREE.Scene();
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var camera = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize( WIDTH, HEIGHT );
document.body.appendChild( renderer.domElement );
var future_z = -100
var BLOCK_LENGTH = 2

var FORWARD = 38; // up arrow key code
var BACKWARD = 40; // down arrow key code
var LEFT = 37;
var RIGHT = 39;

camera.position.z = 5;

function addCube(x, y, z, side) {
    var geometry = new THREE.BoxGeometry( 2, 5, BLOCK_LENGTH );
    var material = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff} );
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;
    console.log("adding cubes at ", x, y, z)

};


var initScene = function () {
    //left side of hallway
    for (i = 0; i > future_z; i -= BLOCK_LENGTH) {
        addCube(5, 0, i, 'right');
    }
    for (i = 0; i > future_z; i-= BLOCK_LENGTH) {
        addCube(-5, 0, i, 'left');
    }
};


initScene();
render();

$(document).keydown(function(e) {
    switch(e.which) {
        case FORWARD: // up arrow
            console.log ("MOVE FORWARD");
            moveForward();
            break;

        case BACKWARD: // down
            moveBackward();
            break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});



var moveForward = function() {
    // add more cubes in the future
    // move camera forward
    addCube(5, 0, future_z, 'right')
    addCube(-5, 0, future_z, 'left')

    future_z -= BLOCK_LENGTH

    camera.translateZ(-BLOCK_LENGTH);
    render();

    console.log("camera position", camera.position);



};

var moveBackward = function () {
    // move camera backward
    camera.translateZ(BLOCK_LENGTH);
    render();
};

// cube.position.set(1,2,1);

function render() {
    // requestAnimationFrame( render );

    // cube.rotation.x += 1;
    // cube.rotation.y += 1;

    renderer.render(scene, camera);
};
