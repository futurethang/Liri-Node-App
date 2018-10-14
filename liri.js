// REQUIRES
var fs = require("fs");
var moment = require('moment');
var dotenv = require('dotenv').config();
var Spotify = require('node-spotify-api');
var keys = require('./keys.js');
var spotify = new Spotify(keys.spotify);
var inquirer = require('inquirer');
var request = require('request');
var apiResult = 0;
var searchFunction;
var searchTerm;

// DEFINE THE DIFFERENT API SEARCHES IN FUNCTIONS TO USE WITHIN A SWITCH STATMENT LATER
function spotifySearch(searchTerm) {
  spotify.search({ type: 'track', query: searchTerm }, function (err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }
    if (data.tracks.items[apiResult] !== undefined) {
      // Get the song title:
      var songTitle = data.tracks.items[apiResult]['name'];
      // Get the name of the Artist:
      var artist = data.tracks.items[apiResult]['artists'][0]['name'];
      // Get the name of the Album:
      var fromAlbum = data.tracks.items[apiResult]['album']['name'];
      // Get the link to the song preview:
      var songPreview = data.tracks.items[apiResult]['external_urls']['spotify'];
      // Concatenate the data for log and display:
      var songLog = 'Song: ' + songTitle + '\nArtist: ' + artist + '\nFrom the Album: ' + fromAlbum + '\nPreview Track: ' + songPreview;
      console.log(songLog);
      updateLogFile(songLog);
      iterateResults('spotify');
    } else { console.log("There are no more results to show you!") };
  });
  // console.log("And your answers are:", answers);
}

function concertSearch(searchTerm) {
  console.log("concert search runs: " + searchTerm);
  request("https://rest.bandsintown.com/artists/" + searchTerm + "/events?app_id=codingbootcamp", function (error, response, body) {
    if (error) { console.log("There are no results to show you!") };
    if (JSON.parse(body)[apiResult] !== undefined) {
      // Get the Venue Name:
      var venue = JSON.parse(body)[apiResult]['venue']['name'];
      // Get the City Location:
      var location = JSON.parse(body)[apiResult]['venue']['city'];
      // Get the Date of the concert:
      var date = JSON.parse(body)[apiResult]['datetime'];
      // Concatenate the string for display and log.txt:
      var concertLog = 'Venue: ' + venue + '\nCity: ' + location + '\nDate: ' + moment(date).format("MM/DD/YY")
      console.log(concertLog);
      updateLogFile(concertLog);
      iterateResults('concerts');
    } else { console.log("There are no more results to show you!") };
  });
}

function movieSearch(searchTerm) {
  var queryUrl = "http://www.omdbapi.com/?t=" + searchTerm + "&y=&plot=short&apikey=trilogy";
  if (searchTerm === '') { queryUrl = "http://www.omdbapi.com/?t=Mr.+Nobody&y=&plot=short&apikey=trilogy" };
  request(queryUrl, function (error, response, body) {
    // If the request is successful
    var movieLog = '';
    if (!error && response.statusCode === 200) {
      // Title of the movie.
      movieLog += JSON.parse(body).Title;
      // Year the movie came out.
      movieLog += "\n" + JSON.parse(body).Year
      // IMDB Rating of the movie.
      movieLog += "\nRated: " + JSON.parse(body).Rated
      // Rotten Tomatoes Rating of the movie.
      var ratings = JSON.parse(body).Ratings[1]['Value'];
      movieLog += "\nRotten Tomatoes: " + ratings;
      // Country where the movie was produced.
      movieLog += "\nMade in: " + JSON.parse(body).Country
      // Language of the movie.
      movieLog += "\nLanguage: " + JSON.parse(body).Language
      // Plot of the movie.
      movieLog += "\nPlot: " + JSON.parse(body).Plot
      // Actors in the movie.
      movieLog += "\nStarring: " + JSON.parse(body).Actors
      // console.log(ratings);
      console.log(movieLog);
      updateLogFile(movieLog);
    }
  });
}

function txtSearch(searchTerms) { }

function updateLogFile(logText) {
  var timeStamp = moment().format('MM/DD/YYYY - HH:mm:ss:SSS');
  var logBody = '\n\n' + timeStamp + ' =================\n' + logText;
  fs.appendFile("log.txt", logBody, function (err) { });
}

// TAKE USER INPUTS
// use Inquirer Package to offer list choices, send message, and then collect a string to search with
// https://github.com/sameeri/Code-Inquirer/wiki/Asking-questions-away-with-Inquirer!
var searchFunction = {
  type: "list",
  name: "searchFunction",
  message: "Choose a search function:",
  choices: ['search concerts', 'spotify song search', 'search for movie', 'search from .txt']
}

var searchTerm = {
  type: "input",
  name: "searchTerm",
  message: "What are you looking for?"
}

var loadAnotherResult = {
  type: "confirm",
  name: "loadAnotherResult",
  message: "Load a different reult?"
}

// PRIMARY SEARCH PROMPT
inquirer.prompt([
  searchFunction,
  searchTerm,
]).then(function (data) {
  searchFunction = data.searchFunction;
  searchTerm = data.searchTerm

  switch (searchFunction) {
    case 'spotify song search':
      console.log("song: " + searchTerm)
      spotifySearch(searchTerm);
      break;
    case 'search concerts':
      console.log("artist: " + searchTerm)
      concertSearch(searchTerm);
      break;
    case 'search for movie':
      console.log("movie: " + searchTerm)
      movieSearch(searchTerm);
      break;
    case 'search from .txt':
      txtSearch(searchTerm);
      break;
    default:
      break;
  }
  console.log(searchFunction + searchTerm);
});

// FUNTION TO RETURN THE NEXT SET OF RESULTS FROM LISTED API RETURNS
function iterateResults(searchFunction) {
  inquirer.prompt([
    loadAnotherResult
  ]).then(function (data) {
    if (data.loadAnotherResult) {
      apiResult += 1;
      if (searchFunction === 'spotify') {
        spotifySearch(searchTerm);
      } else if (searchFunction === 'concerts') {
        concertSearch(searchTerm);
      }
    }
  });
}

  // ISSUES: 
  // DISPLAY CONCERT DATES IN A BETTER FORMAT
  // ALLOW ANOTHER INQUIRER TO SELECT NEW RESULTS - could I use api data to make a sleection list?
  // LOG SEARCHES TO A TXT
