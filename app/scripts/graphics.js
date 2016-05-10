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

var songs = []
var songs_info = {}

// glow effect from http://stemkoski.github.io/Three.js/Shader-Glow.html
var GLOW_MATERIAL = new THREE.ShaderMaterial( 
{
    uniforms: 
    { 
        "c":   { type: "f", value: 1.0 },
        "p":   { type: "f", value: 1.4 },
        glowColor: { type: "c", value: new THREE.Color(0x00ff0f) },
        viewVector: { type: "v3", value: camera.position }
    },
    vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.01
}   );

camera.position.z = 0;

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

function addSongGraphic(song_id, album_art_url, preview_url) {
    var geometry = new THREE.BoxGeometry( 2, 2, BLOCK_LENGTH );
    var material = new THREE.MeshBasicMaterial( { map: loader.load(album_art_url)} );
    material.map.minFilter = THREE.LinearFilter;
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    // Get last song graphic's position
    if (songs.length > 0) {
        var last_song_pos = songs[songs.length - 1];
    } else {
        var last_song_pos = 0;
    }

    // Set song graphic position
    cube.position.x = 0;
    cube.position.y = 0;
    cube.position.z = last_song_pos - 10;

    // Update lists
    songs.push(cube.position.z);
    // id, preview url, cube object, whether it is in final playlist
    songs_info[cube.position.z] = [song_id, preview_url, cube, null];

    console.log("adding song art at ", cube.position.z)
}


function playSong() {

    var near_song_pos = Math.floor(camera.position.z / 10) * 10;
    console.log("near song position ", near_song_pos);
    if (near_song_pos in songs_info) {
        console.log("playing song");
        var data = songs_info[near_song_pos]
        var id = data[0]
        var preview_url = data[1]

        if ($('.suggestion.'+id).find('iframe').length == 0) {
            $('.suggestion.'+id).append('<iframe src="'+preview_url+'" style="display:none;"></iframe>');
        }
        console.log("has iframe? ", $('.suggestion.'+id).find('iframe').length, $('.suggestion.'+id).find('iframe'));

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

        case LEFT:
            swipeLeft();
            break;

        case RIGHT:
            swipeRight();
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
    // playSong();
    render();
};

var swipeLeft = function() {

    var near_song_pos = Math.floor(camera.position.z / 10) * 10;
    console.log("left near song position ", near_song_pos);

    if (songs_info[near_song_pos] && songs_info[near_song_pos][2] && songs_info[near_song_pos][3] != false) {
        var cube = songs_info[near_song_pos][2];
        cube.material.transparent = true;
        new TWEEN.Tween(cube.material).to({opacity: 0}, 500).start();
        songs_info[near_song_pos][3] = false;
    }
}

var swipeRight = function() {
    var near_song_pos = Math.floor(camera.position.z / 10) * 10;
    console.log("right near song position ", near_song_pos);

    if (songs_info[near_song_pos] && songs_info[near_song_pos][2] && songs_info[near_song_pos][3] != false) {
        var cube = songs_info[near_song_pos][2];
        var geom = cube.geometry.clone();
        var mat = GLOW_MATERIAL.clone();
        var glowingCube = new THREE.Mesh(geom, mat);
        glowingCube.position.x = cube.position.x;
        glowingCube.position.y = cube.position.y;
        glowingCube.position.z = cube.position.z;
        glowingCube.scale.multiplyScalar(1.05);
        scene.add(glowingCube);
        render();
        songs_info[near_song_pos][3] = true;
    }
}

var animate = function() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    TWEEN.update();
    renderer.render(scene, camera);
};

animate();