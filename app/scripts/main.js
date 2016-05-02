var accessToken, sessionUser, sessionPlaylist;
var spotifyApi = new SpotifyWebApi();
var currentSong = {};
var songList = [];
var spotify;
var ctx; var radarData; var myRadarChart; 
var datasetIndex = 0;
var traits = ["tempo", "acousticness", "danceability", "energy", "happiness"];

var quizProgress = -1;
var quizQuestions = [];
var quizResults = {limit: 5};
var QUESTION_CONTAINER = 'question-container';

// The quiz doesn't do anything right now
// TODO[tricia]: actually implement the quiz.
var startQuiz = function() {
  $('#login-container').hide();
  nextQuizQuestion();

};

// questionText is a string
// questionList is an array of dicts {text: , val: }
// questionClass is a string to use as a jQuery identifier for the questions
var makeQuizHtml = function(questionText, questionList, questionClass, id, extra) {
  id = id || '';
  extra = extra || '';
  var text = '<div class="'+QUESTION_CONTAINER+'" id="'+id+'">';
  text +='<h2 class="question-text">'+questionText+'</h2>';
  for (var i=0; i<questionList.length; i++) {
    text += '<div class="'+questionClass+' quiz-answer" data-value='+questionList[i].val+'>'+questionList[i].text+'</div>'
  }
  text += extra;
  text += '</div>'; //end question-container
  return text;
}

var makeQuizInput = function(questionText, inputLabel, numLabels, questionClass, id, extra) {
  id = id || '';
  extra = extra || '';  
  var text = '<div class="'+QUESTION_CONTAINER+'" id="'+id+'">';
  text +='<h2 class="question-text">'+questionText+'</h2>';
  for (var i=0; i<numLabels; i++) {
    text += '<input type="text" class="'+questionClass+' quiz-answer" placeholder="'+inputLabel+'"></input>';
  }
  text += '<button class="btn '+questionClass+'">Next</button>';
  text += extra;
  text += '</div>'; //end question-container
  return text;
}

var nextQuizQuestion = function() {
  quizProgress += 1;
  if (quizProgress > 0) {
    $('.'+QUESTION_CONTAINER).hide();
  }

  if (quizProgress < quizQuestions.length) {
    quizQuestions[quizProgress]();
  } 
  else {
    finishQuiz(); 
  }
}

var finishQuiz = function() {
/*  $('body').append('<button id="finish-quiz">Quiz goes here. Skip for now</button>');

  $('#finish-quiz').on('click', function(e){
      e.preventDefault();
      // hardcoded to be ke$ha, 3OH!3, avril lavigne, etc.
      songList = [{id: 'spotify:track:4AboqNl74jNDpJhPfqYDmj'}, 
            {id: 'spotify:track:00Mb3DuaIH1kjrwOku9CGU'}, 
            {id: 'spotify:track:6ol4ZSifr7r3Lb2a9L5ZAB'}, 
            {id: 'spotify:track:1hBM2D1ULT3aeKuddSwPsK'},
            {id: 'spotify:track:717TY4sfgKQm4kFbYQIzgo'}
            ];
      setUpExploration();
  });  */
  console.log(quizResults);
  spotifyApi.getRecommendations(quizResults, processQuiz);
}

var processQuiz = function(err, data) {
  songList = data.tracks;
  $.each(songList, function(){
    this.id = 'spotify:track:'+this.id;
  });
  setUpExploration();
}

var quizValence = function() {
  var questionText = "How are you feeling?";
  var questionList = [
    {text: 'morose', val: 0},
    {text: 'sad', val: 0.25},
    {text: 'content', val: 0.50},
    {text: 'happy', val: 0.75},
    {text: 'ecstatic', val: 1.0}
  ];
  var questionClass = 'valence-quiz-answer';
  $('body').append(makeQuizHtml(questionText, questionList, questionClass));
  $('.'+questionClass).on('click', function(e) {
    e.preventDefault();
    quizResults.target_valence = $(e.target).attr('data-value');
    nextQuizQuestion();
  });
}

var quizDanceability = function() {
  var questionText = "Do you want to dance?";
  var questionList = [
    {text: 'NO.', val: 0},
    {text: 'nah.', val: 0.25},
    {text: 'maybe...', val: 0.50},
    {text: 'yes!', val: 0.75},
    {text: 'all night long!', val: 1.0}
  ];
  var questionClass = 'danceability-quiz-answer';
  $('body').append(makeQuizHtml(questionText, questionList, questionClass));
  $('.'+questionClass).on('click', function(e) {
    e.preventDefault();
    quizResults.target_danceability = $(e.target).attr('data-value');
    nextQuizQuestion();
  });
}

var quizAcousticness = function() {
  var questionText = "Do you want to sing along?";
  var questionList = [
    {text: 'no words is best.', val: 1.0},
    {text: 'I don\'t sing', val: 0.7},
    {text: 'if I know the words', val: 0.50},
    {text: 'For sure!', val: 0.1},
    {text: 'I\'m ready to sing my heart out!', val: 0.0}
  ];
  var questionClass = 'acousticness-quiz-answer';
  $('body').append(makeQuizHtml(questionText, questionList, questionClass));
  $('.'+questionClass).on('click', function(e) {
    e.preventDefault();
    quizResults.target_acousticness = $(e.target).attr('data-value');
    nextQuizQuestion();
  });
}

var quizSeeds = function() {
  // genres
  spotifyApi.getAvailableGenreSeeds(finishSeeds);
}

var finishSeeds = function(err, data) {
  // genres
  var questionText1 = "choose a genre to explore";
  var questionList1 = data.genres.map(function(obj) {
    return {text: obj, val: obj};
  });
  var questionClass1 = 'genre-quiz-answer';
  $('body').append(makeQuizHtml(questionText1, questionList1, questionClass1, 
      'genre-seed',
      '<button class="btn" id="to-artist-seed">explore artists instead</button>'));
  $('.'+questionClass1).on('click', function(e) {
    e.preventDefault();
    quizResults.seed_genres = [$(e.target).attr('data-value')];
    nextQuizQuestion();
  });

  // artists
  var questionText2 = "choose artists to explore";
  var inputLabel2 = "spotify artist uri";
  var numArtists = 5;
  var questionClass2 = "artist-quiz-answer";
  $('body').append(makeQuizInput(questionText2, inputLabel2, numArtists, questionClass2,
      'artist-seed',
      '<button class="btn" id="to-genre-seed">explore genres instead</button>'));
  $('button.'+questionClass2).on('click', function(e) {
    e.preventDefault();
    quizResults.seed_artists = [];
    $.each($('input.'+questionClass2), function(){
      // TODO: better sanitization
      if (this.value && this.value != '') {
        quizResults.seed_artists.push(this.value.split(':')[2]);
      }
    });

    // TODO: better error message
    if (quizResults.seed_artists.length > 0) {
      nextQuizQuestion();
    } else {
      window.alert("you need at least one artist!");
    }
  });

  $('#to-artist-seed').on('click', function(e) {
    $('#artist-seed').show();
    $('#genre-seed').hide();
  });

  $('#to-genre-seed').on('click', function(e) {
    $('#genre-seed').show();
    $('#artist-seed').hide();
  });

  $('#artist-seed').hide();
}

quizQuestions.push(quizValence);
quizQuestions.push(quizDanceability);
quizQuestions.push(quizAcousticness);
quizQuestions.push(quizSeeds);

// After the quiz, we set up the scene
var setUpExploration = function() {
    $('#finish-quiz').hide();
    currentSong.id = songList[songList.length-1].id.split(':')[2];
    spotifyApi.getAudioFeaturesForTrack(currentSong.id, setUpSongFeatures);
    $('body').append('<button id="save-to-playlist-btn">Save to Playlist</button>');
    $('#save-to-playlist-btn').on('click', function(e){
      if (sessionPlaylist) {
        replaceTracks();
      } else {
        spotifyApi.createPlaylist(sessionUser.id, {name: 'Playlist Explorer'}, playlistCall);
      }   
    });
}

// this just updates the fields visually
// [TODO]: make this do cool things
var addNewSongsToList = function(err, data) {
  if (data) {
    if ($('#song-suggestions #group-'+datasetIndex).length == 0) {
      $('#song-suggestions').prepend('<div class="suggestion-group" id="group-'+datasetIndex+'"></div>');
      $('#song-suggestions #group-'+datasetIndex).prepend("<h1>Songs generated by " + currentSong.info.name + "</h1>")
    }
    for (var i = 0; i < data.tracks.length; i++) {
      var newsong = data.tracks[i];
      var artists = [];
      for (var j = 0; j < newsong.artists.length; j++) {
        artists.push(newsong.artists[j].name);
      }

      $('#song-suggestions #group-'+datasetIndex).append('<div class="suggestion '+newsong.id+'">'
        +'<h3>'+newsong.name+'</h3>'
        +'<h4>'+artists.join(', ')+' on '+newsong.album.name+'</h4>'
        +'<button class="preview-btn" onclick="makeiframe(\''+newsong.preview_url+'\',\''+newsong.id+'\')">Preview</button>'
        +'<button class="playlist-btn" onclick="addToPlaylist(\''+newsong.id+'\')">Add to Playlist</button>'
        +'<button class="explore-btn" onclick="exploreSong(\''+newsong.id+'\')">Explore This Song</button>'
        +'</div>');
    }
  }
}

// saves the song features, then grabs song info
// song features are things like danceability, valence (happiness), etc.
var setUpSongFeatures = function(err, data) {
  if (data) {
    currentSong.features = data;
  }

  spotifyApi.getTrack(currentSong.id, setUpSongInfo);
}

// gets the current song's features, then look for song info
var updateSongFeatures = function(err, data) {
  if (data) {
    currentSong.features = data;
  }

  spotifyApi.getTrack(currentSong.id, updateSongInfo);
}

// saves song info then calls to update visuals
// song info is like album, artist, etc.
var setUpSongInfo = function(err, data) {
  if (data) {
    currentSong.info = data;
  }

  setUpGraph();
}

// gets the song info, the look to update text and graph visuals
var updateSongInfo = function(err, data) {
  // save the current song's graph before resetting
  radarData.datasets[datasetIndex].label = currentSong.info.name;
  radarData.datasets[datasetIndex].data = radarData.datasets[0].data;

  currentSong.info = data;

  updateVisualInfo();
}


// initiailizes the web graph using chart.js
var setUpGraph = function() {
  ctx = document.getElementById('myChart').getContext('2d');
  ctx.canvas.width = 400;
  ctx.canvas.height = 400;
  radarData = {
    labels:["tempo", "acousticness", "danceability", "energy", "instrumentalness", "happiness"],
    datasets: [
      //current
      {
          label: currentSong.info.name,
          backgroundColor: "rgba(179,181,198,0.2)",
          borderColor: "rgba(179,181,198,1)",
          pointBackgroundColor: "rgba(179,181,198,1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(179,181,198,1)",
          data: [currentSong.features.tempo, 
          currentSong.features.acousticness*100, 
          currentSong.features.danceability*100, 
          currentSong.features.energy*100, 
          currentSong.features.valence*100]
      },
    ]
  }
  myRadarChart = new Chart(ctx, {
    type: 'radar',
    data: radarData//,
    //options: options
  }); 

  updateVisualInfo();
}

var updateVisualInfo = function() {

  // this does text boxes
  $('#song-features #track').text(currentSong.info.name);
  var artists = [];
  for (var i =0 ; i < currentSong.info.artists.length; i++) {
    artists.push(currentSong.info.artists[i].name);
  };
  $('#song-features #artist').text(artists.join(", "));
  $('#song-features #album').text(currentSong.info.album.name);
  
  $('#song-features #tempo').text(currentSong.features.tempo);
  $('#song-features #acousticness').text(currentSong.features.acousticness*100);
  $('#song-features #danceability').text(currentSong.features.danceability*100);
  $('#song-features #energy').text(currentSong.features.energy*100);
  $('#song-features #happiness').text(currentSong.features.valence*100);
  $('#song-features').show().css('display', 'inline-block');
  $('#chart-container').show().css('display', 'inline-block');

  // set new baseline and editable regions to be the base value of this song
  var newData = [currentSong.features.tempo, 
          currentSong.features.acousticness*100, 
          currentSong.features.danceability*100, 
          currentSong.features.energy*100, 
          currentSong.features.valence*100];

  // // b/c i dont' know how to deepcopy
  var newData2 = [currentSong.features.tempo, 
          currentSong.features.acousticness*100, 
          currentSong.features.danceability*100, 
          currentSong.features.energy*100, 
          currentSong.features.valence*100];

  var color = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
  var opacityString = "rgba("+color.join()+",0.2)";
  var colorString = "rgba("+color.join()+",1)";

  var newDataset = {
    label: "Desired Traits",
    backgroundColor: opacityString,
    borderColor: colorString,
    pointBackgroundColor: colorString,
    pointBorderColor: "#fff",
    pointHoverBackgroundColor: "#fff",
    pointHoverBorderColor: colorString,
    data: newData
  }
  radarData.datasets.push(newDataset);

  radarData.datasets[0].data = newData2;
  radarData.datasets[0].label = currentSong.info.name;
  myRadarChart.update();
  datasetIndex += 1;

  for (var i = 0; i < traits.length; i++) {
    updateTextClass(i);
  }       
}

// these all change the desired traits and update the graph
var increaseTrait = function(traitIndex) {
  radarData.datasets[datasetIndex].data[traitIndex] += 5;  
  myRadarChart.update(true);
  updateTextClass(traitIndex);
}

var decreaseTrait = function(traitIndex) {
  radarData.datasets[datasetIndex].data[traitIndex] = Math.max(0, radarData.datasets[datasetIndex].data[traitIndex]-5) ;
  myRadarChart.update(true);
  updateTextClass(traitIndex);
}

var resetTrait = function(traitIndex) {
  radarData.datasets[datasetIndex].data[traitIndex] = radarData.datasets[0].data[traitIndex];
  myRadarChart.update(true);
  updateTextClass(traitIndex);
}

// makes the text green or red, based on comparison to baseline
var updateTextClass = function(traitIndex) {
  var a = radarData.datasets[datasetIndex].data[traitIndex];
  var b = radarData.datasets[0].data[traitIndex];
  var $element = $("#"+traits[traitIndex]);
  if ( a == b ) {
    $element.removeClass("increased decreased");
  } else if (a < b) {
    $element.removeClass("increased");
    $element.addClass("decreased");
  } else {
    $element.removeClass("decreased");
    $element.addClass("increased");
  }

  $element.text(a);
}

// this makes an ugly iframe that has the song url in it
// [TODO:]: fix bug where this makes all matching songs play the preview
var makeiframe = function(url, id) {
  $('.suggestion.'+id).append('<iframe src="'+url+'"></iframe>');
  $('.suggestion.'+id+' .preview-btn').hide();
}

// this just adds it to our local representation of the playlist
// doesn't actually add it to the spotify playlist
var addToPlaylist = function(id) {
  songList.push({id: 'spotify:track:' + id});
}

// this looks up the new song
// [TODO:] add callback and hook up to graphics,
// this is when we walk down a new path
var exploreSong = function(id) {
  $('.suggestion.'+id).addClass('explored');
  currentSong.id = id;
  spotifyApi.getAudioFeaturesForTrack(currentSong.id, updateSongFeatures);
}

var playlistCall = function(err, data) {
  if (data) {
    sessionPlaylist = data;
    replaceTracks();
  }
}

var replaceTracks = function() {
  var songuris = songList.map(function(obj) {
    return obj.id;
  });
  spotifyApi.replaceTracksInPlaylist(sessionUser.id, sessionPlaylist.id, songuris, finishSave);
}

var finishSave = function(err, data) {
  if (err) {
    console.log(err);
  } else {
    window.alert("successfully saved data!");
  }
}

$(document).on('ready', function(){
  $('#login-container').append('<button id="login-btn" class="btn login-button">LOGIN WITH SPOTIFY</button>');

  $('#login-btn').on('click', function(e) {
    e.preventDefault();
    OAuth.initialize('OfmhIjdpngci5YQdAoIrKMMGB6E');
    OAuth.popup('spotify', {cache: false, authorize: {scope: "playlist-modify-public", response_type: "token", state: Math.random()}}).done(function(result) {
      accessToken = result.access_token;
      result.me().done(function(response) {
        sessionUser = response;
        spotifyApi.setAccessToken(accessToken);
        $('#login-btn').hide();
      });
    });

    spotify = OAuth.create('spotify');
    startQuiz();
  });  

  // this looks for recommendations based on the last songs added to the songlist
  // as well as the desired song features

  var NUM_SONG_REQS = 2; // number of recommandations to look for
  $('#song-generation-btn').on('click', function(e) {
    var seeds = songList.slice(-5).map(function(obj){
      return obj.id.split(':')[2];
    });
    var rec_data = {seed_tracks: seeds, limit: NUM_SONG_REQS};
    // tempo isn't normalized but everything else is
    rec_data["target_tempo"] = radarData.datasets[datasetIndex].data[0];
    for (var i = 1; i < traits.length; i++) {
      rec_data["target_"+traits[i]] = radarData.datasets[datasetIndex].data[i]/100;
    }

    spotifyApi.getRecommendations(rec_data, addNewSongsToList);
  });

  // modal stuff for the current song preview button
  $('#myModal').on('show.bs.modal', function(e) {
    $('#current-song-iframe').attr('src', currentSong.info.preview_url);
  })

  $('#myModal').on('hide.bs.modal', function(e) {
    $('#current-song-iframe').attr('src', '');
  })

  $('#song-features ul button').addClass('btn btn-sm btn-primary'); 
});