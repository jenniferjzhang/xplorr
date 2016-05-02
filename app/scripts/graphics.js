var scene = new THREE.Scene();
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var camera = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({antialias:true});
var loader = new THREE.TextureLoader;
loader.crossOrigin = '';
renderer.setSize( WIDTH, HEIGHT );
var future_z = -100
var BLOCK_LENGTH = 2

var FORWARD = 38; // up arrow key code
var BACKWARD = 40; // down arrow key code
var LEFT = 37;
var RIGHT = 39;

var songs = {}

camera.position.z = 5;

function addCube(x, y, z, side) {
    var geometry = new THREE.BoxGeometry( 2, 5, BLOCK_LENGTH );
    var material = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff} );
    material.minFilter =  THREE.LinearFilter
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;
    console.log("adding cubes at ", x, y, z)

};

function addSongGraphic(song_id, album_art_url, preview_url, i) {
    var geometry = new THREE.BoxGeometry( 2, 2, BLOCK_LENGTH );
    var material = new THREE.MeshBasicMaterial( { map: loader.load(album_art_url)} );
    material.map.minFilter = THREE.LinearFilter;
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    cube.position.x = 0;
    cube.position.y = 0;
    cube.position.z = camera.position.z - 10*(i + 1);
    songs[cube.position.z + 2] = [song_id, preview_url];
    console.log("adding song art at ", cube.position.x, cube.position.y, cube.position.z)
}


function playSong() {

    if (camera.position.z in songs) {
        console.log("playing song");
        var data = songs[camera.position.z]
        var id = data[0]
        var preview_url = data[1]

        $('.suggestion.'+id).append('<iframe src="'+preview_url+'" style="display:none;"></iframe>');

    }

}


var initScene = function () {
    //left side of hallway
    for (i = 0; i > future_z; i -= BLOCK_LENGTH) {
        addCube(5, 0, i, 'right');
    }
    for (i = 0; i > future_z; i-= BLOCK_LENGTH) {
        addCube(-5, 0, i, 'left');
    }
};


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
    playSong();
    render();

    console.log("camera position", camera.position);



};

var moveBackward = function () {
    // move camera backward
    camera.translateZ(BLOCK_LENGTH);
    playSong();
    render();
};


function render() {
    // requestAnimationFrame( render );

    renderer.render(scene, camera);
};
