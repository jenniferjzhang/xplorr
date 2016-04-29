var scene = new THREE.Scene();
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var camera = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize( WIDTH, HEIGHT );
document.body.appendChild( renderer.domElement );

var FORWARD = 38; // up arrow key code
var BACKWARD = 40; // down arrow key code
var LEFT = 37;
var RIGHT = 39;
camera.position.z = 5;

function addCube(x, y, z, side) {
    var geometry = new THREE.BoxGeometry( 2, 5, 2 );
    var material = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff} );
    var cube = new THREE.Mesh( geometry, material );
    // if (side === 'left') {
    //     cube.rotation.x +=1;
    //     cube.rotation.y +=1;
    // } else if (side === 'right') {
    //     cube.rotation.x +=1;
    //     cube.rotation.y +=1;
    // }
    scene.add( cube );
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;

};


var initScene = function () {
    //left side of hallway
    for (i = 0; i > -100; i -= 2) {
        addCube(5, 0, i, 'right');
    }
    for (i = 0; i > -100; i-= 2) {
        addCube(-5, 0, i, 'left');
    }
};


initScene();
// addCube(1, 2, 0,'left');
// var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );
// cube.position.x = 1;
// cube.position.y = 2;
// cube.position.z = 3;
// console.log(cube);

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
    addCube(5, 0, -102, 'right')
    addCube(-5, 0, -102, 'left')

    var curr_camera_z = camera.position.z;

    camera.position.z = curr_camera_z - 2;


};

var moveBackward = function () {
    // move camera backward
};

// cube.position.set(1,2,1);

function render() {
    // requestAnimationFrame( render );

    // cube.rotation.x += 1;
    // cube.rotation.y += 1;

    renderer.render(scene, camera);
};
