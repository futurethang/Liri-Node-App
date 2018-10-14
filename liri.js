// FILE REQUIRES
var dotenv = require('dotenv').config();
var Spotify = require('node-spotify-api');
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var inquirer = require("inquirer");
var request = require("request");

// DEFINE THE DIFFERENT API SEARCHES IN FUNCTIONS TO USE WITHIN A SWITCH STATMENT LATER
function spotifySearch(searchTerm) {
  spotify.search({ type: 'track', query: searchTerm }, function (err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }
    var songTitle = data.tracks.items[0]['name'];
    var artist = data.tracks.items[0]['artists'][0]['name'];
    var fromAlbum = data.tracks.items[0]['album']['name'];
    var songPreview = data.tracks.items[0]['external_urls']['spotify'];
    console.log(songTitle + '\n' + artist + '\nFrom the Album: ' + fromAlbum + '\nPreview Track: ' + songPreview);
  });
  // console.log("And your answers are:", answers);
}

function concertSearch(searchTerm) {
  console.log("concert search runs: " + searchTerm);
  request("https://rest.bandsintown.com/artists/" + searchTerm + "/events?app_id=codingbootcamp", function (error, response, body) {
    var venue = JSON.parse(body)[0]['venue']['name'];
    var location = JSON.parse(body)[0]['venue']['city'];
    var date = JSON.parse(body)[0]['datetime'];
    console.log('Venue: ' + venue + '\nCity: ' + location + '\nDate: ' + date);
  });
}

function movieSearch(searchTerm) {
  var queryUrl = "http://www.omdbapi.com/?t=" + searchTerm + "&y=&plot=short&apikey=trilogy";
  console.log(queryUrl);
  request(queryUrl, function (error, response, body) {
    // If the request is successful
    var movieInfo = '';
    if (!error && response.statusCode === 200) {
      // Title of the movie.
      movieInfo += JSON.parse(body).Title;
      // Year the movie came out.
      movieInfo += "\n" + JSON.parse(body).Year
      // IMDB Rating of the movie.
      movieInfo += "\nRated: " + JSON.parse(body).Rated
      // Rotten Tomatoes Rating of the movie.
      var ratings = JSON.parse(body).Ratings[1]['Value'];
      movieInfo += "\nRotten Tomatoes: " + ratings;
      // Country where the movie was produced.
      movieInfo += "\nMade in: " + JSON.parse(body).Country
      // Language of the movie.
      movieInfo += "\nLanguage: " + JSON.parse(body).Language
      // Plot of the movie.
      movieInfo += "\nPlot: " + JSON.parse(body).Plot
      // Actors in the movie.
      movieInfo += "\nStarring: " + JSON.parse(body).Actors
      // console.log(ratings);
      console.log(movieInfo);
    }
  });
}

function txtSearch(searchTerms) {

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

var functionTitle = "placeholder";

var searchTerm = {
  type: "input",
  name: "searchTerm",
  message: "What are you looking for?"
}

inquirer.prompt([
  searchFunction,
  searchTerm,
]).then(function (data) {
  var searchFunction = data.searchFunction;
  var searchTerm = data.searchTerm

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

  // ISSUES: 
  // OMDB ROTTEN TOMATO RETURN. HOW TO ACCESS THAT KEY AND GIVE BACK STRING?
