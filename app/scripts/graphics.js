// Set up the scene, camera, and renderer as global variables.
var scene, camera, renderer;
init();
animate();

// Sets up the scene.
function init() {
    // Create the scene and set the scene size.
    scene = new THREE.Scene();
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;

    // Create a renderer and add it to the DOM.
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(renderer.domElement);

    // Create a camera and add it to the scene.
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
    scene.add(camera);

    // Create a light, set its position, and add it to the scene.
    var light = new THREE.PointLight(0xffffff);
    light.position.set(-100, 200, 100);
    scene.add(light);

    var loader = new THREE.TextureLoader;
    loader.crossOrigin = '';
    renderer.setSize(WIDTH, HEIGHT);
    var future_z = -100;
    var BLOCK_LENGTH = 2;


    var addCube = function (x, y, z) {
        var geometry = new THREE.BoxGeometry(2, 5, BLOCK_LENGTH);
        var material = new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff});
        material.minFilter = THREE.LinearFilter;
        var cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
    };

    //right side of hallway
    for (var i = 0; i > future_z; i -= BLOCK_LENGTH) {
        addCube(5, 0, i);
    }
    //left side
    for (i = 0; i > future_z; i -= BLOCK_LENGTH) {
        addCube(-5, 0, i);
    }

    var PlaylistSeedControls = function () {
        this.artist = 'Search for an artist';
        this.genre = 0.8;
    };

    var SongAttributeControls = function (_tempo, _acousticness, _danceability, _energy, _instrumentalness, _happiness) {
        this.tempo = _tempo;
        this.acousticness = _acousticness;
        this.danceability = _danceability;
        this.energy = _energy;
        this.instrumentalness = _instrumentalness;
        this.happiness = _happiness;
        this.addToPlaylist = function () {
            return;
        }
    };

    var initGUI = function () {
        var gui = new dat.GUI();

        var seedControlText = new PlaylistSeedControls();

        var seedMenu = gui.addFolder('Change Playlist Seed Artists/ Genres');
        seedMenu.add(seedControlText, 'artist');
        seedMenu.add(seedControlText, 'genre', ['rock', 'roll']);

        var songAttributeText = new SongAttributeControls(50, 60, 70, 80, 90, 100);

        var songAttributesMenu = gui.addFolder('Song Attributes');
        songAttributesMenu.add(songAttributeText, 'tempo', 0, 200);
        songAttributesMenu.add(songAttributeText, 'acousticness', 0, 100);
        songAttributesMenu.add(songAttributeText, 'danceability', 0, 100);
        songAttributesMenu.add(songAttributeText, 'instrumentalness', 0, 100);
        songAttributesMenu.add(songAttributeText, 'happiness', 0, 100);
        



        songAttributesMenu.open();

    };

    initGUI();



}








var FORWARD = 38; // up arrow key code
var BACKWARD = 40; // down arrow key code
var LEFT = 37;
var RIGHT = 39;

var songs = [];
var songs_info = {};
//
// // glow effect from http://stemkoski.github.io/Three.js/Shader-Glow.html
// var GLOW_MATERIAL = new THREE.ShaderMaterial(
//     {
//         uniforms: {
//             "c": {type: "f", value: 1.0},
//             "p": {type: "f", value: 1.4},
//             glowColor: {type: "c", value: new THREE.Color(0x00ff0f)},
//             viewVector: {type: "v3", value: camera.position}
//         },
//         vertexShader: document.getElementById('vertexShader').textContent,
//         fragmentShader: document.getElementById('fragmentShader').textContent,
//         side: THREE.FrontSide,
//         blending: THREE.AdditiveBlending,
//         transparent: true,
//         opacity: 0.01
//     });
//
// camera.position.z = 2;


function addSongGraphic(song_id, album_art_url, preview_url) {
    var geometry = new THREE.BoxGeometry(2, 2, BLOCK_LENGTH);
    var material = new THREE.MeshBasicMaterial({map: loader.load(album_art_url)});
    material.map.minFilter = THREE.LinearFilter;
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

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


// Called only when camera is at position that is multiple of 10.
function playSong() {
    var near_song_pos = (Math.floor(camera.position.z / 10) * 10) - 10;
    console.log("near song position ", near_song_pos);
    if (near_song_pos in songs_info) {
        console.log("playing song");
        var data = songs_info[near_song_pos];
        var id = data[0];
        var preview_url = data[1];

        while ($('#song-suggestions').find('iframe').length > 0) {
            // If there is another preview, remove them.

            console.log("removing...");
            $('#song-suggestions').find('iframe').remove();
        }

        // Check if the div has the preview of the song currently in front of us.
        if (!$('#song-suggestions').find('iframe').hasClass(id)) {
            $('#song-suggestions').append('<iframe src="' + preview_url + '" style="display:none;" class="' + id + '""></iframe>');
        }

    }

}


$(document).keydown(function (e) {
    switch (e.which) {
        case FORWARD: // up arrow
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

        default:
            return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});


var moveForward = function () {
    // add more cubes in the future
    // move camera forward
    addCube(5, 0, future_z, 'right');
    addCube(-5, 0, future_z, 'left');

    future_z -= BLOCK_LENGTH;

    console.log(camera.position.z);

    camera.translateZ(-BLOCK_LENGTH);

    // Play the song when we get to a z position multiple of 10.
    if (camera.position.z % 10 == 0) {
        console.log("try playing song");
        playSong();

    }

    // Check if we need to generate more songs.
    if (camera.position.z == songs[songs.length - 2]) {
        console.log("generate more songs...");
        generateSongRecommendations();
    }
    render();

};

var moveBackward = function () {
    // move camera backward
    camera.translateZ(BLOCK_LENGTH);
    // playSong();
    render();
};

var swipeLeft = function () {
    var z = Math.floor(camera.position.z / 10) * 10;
    var near_song_pos = z;
    if (camera.position.z % 10 == 0) {
        near_song_pos = z - 10;
    }
    console.log("camera", camera.position.z, "left near song position ", near_song_pos);

    if (songs_info[near_song_pos] && songs_info[near_song_pos][2] && songs_info[near_song_pos][3] != false) {
        var cube = songs_info[near_song_pos][2];
        cube.material.transparent = true;
        new TWEEN.Tween(cube.material).to({opacity: 0}, 500).start();
        songs_info[near_song_pos][3] = false;

        // Get rid of the preview URL
        songs_info[near_song_pos][1] = null;
    }

    while ($('#song-suggestions').find('iframe').length > 0) {
        // If there is another preview, remove them.

        console.log("removing...");
        $('#song-suggestions').find('iframe').remove();
    }
};

var swipeRight = function () {
    var z = Math.floor(camera.position.z / 10) * 10;
    var near_song_pos = z;
    if (camera.position.z % 10 == 0) {
        near_song_pos = z - 10;
    }
    console.log("camera", camera.position.z, "right near song position ", near_song_pos);

    if (songs_info[near_song_pos] && songs_info[near_song_pos][2] && songs_info[near_song_pos][3] != false) {
        console.log("swipe right on song", songs_info[near_song_pos][0]);
        var cube = songs_info[near_song_pos][2];
        console.log("add glow at ", cube.position.z);
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

};

function animate() {
    requestAnimationFrame(animate);
    render();
};

function render() {
    TWEEN.update();
    renderer.render(scene, camera);
}

