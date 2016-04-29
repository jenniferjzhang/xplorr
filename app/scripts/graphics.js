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

addCube((1,2,3),'left');

render();

function addCube(pos, side) {
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var color =  0xffffff;
        // '0x' + (function co(lor){   return (lor +=
        //     [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
        // && (lor.length == 6) ?  lor : co(lor); })('');
    var material = new THREE.MeshBasicMaterial( { color: color} );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(pos[0],pos[1],pos[2]);
    if (side === 'left') {
        cube.rotation.x +=1;
        cube.rotation.y +=1;
    } else if (side === 'right') {
        cube.rotation.x +=1;
        cube.rotation.y +=1;
    }
    scene.add( cube );
};


var initScene = function () {
    //left side of hallway
    for (i = 0; i > -20; i--) {
        var pos = (1,2,i);
        addCube(pos, 'left');
    }
    // addCube()
};


initScene();

$(document).keydown(function(e) {
    switch(e.which) {
        case FORWARD: // up arrow
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
};

var moveBackward = function () {
    // move camera backward
};

// cube.position.set(1,2,1);
camera.position.z = 3;

function render() {
    // requestAnimationFrame( render );

    // cube.rotation.x += 1;
    // cube.rotation.y += 1;

    renderer.render(scene, camera);
};
