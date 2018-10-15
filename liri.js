// REQUIRES
var fs = require("fs");
var moment = require('moment');
var dotenv = require('dotenv').config();
var Spotify = require('node-spotify-api');
var keys = require('./keys.js');
var spotify = new Spotify(keys.spotify);
var inquirer = require('inquirer');
var request = require('request');
var index = 0;
var searchFunction;
var searchTerm;
var additionalResultsArray = [];

// DEFINE THE DIFFERENT API SEARCHES IN FUNCTIONS TO USE WITHIN A SWITCH STATMENT LATER

function songDetails(items, index) {
  console.log("Song Details invoked");
  var songTitle = items[index]['name']; // Get the song title:
  var artist = items[index]['artists'][0]['name']; // Get the name of the Artist:
  var fromAlbum = items[index]['album']['name']; // Get the name of the Album:
  var songPreview = items[index]['external_urls']['spotify']; // Get the link to the song preview:
  var songLog = '----------\nSong: ' + songTitle + '\nArtist: ' + artist +
    '\nFrom the Album: ' + fromAlbum + '\nPreview Track: ' + songPreview + 
    '\n----------';  // Concatenate the data for log and display:
  console.log(songLog);
  updateLogFile(songLog);
  chooseAnotherResult(items, 'spotify');
}

function spotifySearch(searchTerm) {
  spotify.search({ type: 'track', query: searchTerm }, function (err, data) {
    var items = data.tracks.items;
    if (err) {
      return console.log('Error occurred: ' + err);
    }
    if (items[index] !== undefined) {
      songDetails(items, index);
      // iterateResults('spotify');
    } else { console.log("There are no more results to show you!") };
  });
}

function concertDetails(items, index) {
  console.log("concert Details invoked"); 
  var venue = items[index]['venue']['name']; // Get the Venue Name:
  var location = items[index]['venue']['city']; // Get the City Location:
  var date = items[index]['datetime']; // Get the Date of the concert:
  var concertLog = '----------\nVenue: ' + venue + '\nCity: ' + location +
    '\nDate: ' + moment(date).format("MM/DD/YY") + '\n----------'; // Concatenate the string for display and log.txt:
  console.log(concertLog);
  updateLogFile(concertLog);
  chooseAnotherResult(items, 'concerts');
}

function concertSearch(searchTerm) {
  console.log("concert search runs: " + searchTerm);
  request("https://rest.bandsintown.com/artists/" + searchTerm + "/events?app_id=codingbootcamp", function (error, response, body) {
    var items = JSON.parse(body);
    if (error) { console.log("There are no results to show you!") };
    if (items[index] !== undefined) {
      concertDetails(items, index);
      // iterateResults('concerts');
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
  var logBody = '\n\n\n' + timeStamp + ' >>>>>>>>>>\n' + logText;
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

var moreResults = {
  type: "list",
  name: "moreResults",
  message: "Choose a different search result:",
  choices: additionalResultsArray
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
      index += 1;
      if (searchFunction === 'spotify') {
        spotifySearch(searchTerm);
      } else if (searchFunction === 'concerts') {
        concertSearch(searchTerm);
      }
    }
  });
}

function chooseAnotherResult(items, source) {
  items.slice(1,10).forEach(function (item) {
    // push the title strings to the additionalResultsArray | Not using details functions because formatting is for list display
    if (source === 'spotify') {
      var title = item['name'];
      var artist = item['artists'][0]['name'];
      additionalResultsArray.push("By: " + artist + " - - " + "Song Name: " + title);
    } else if (source === 'concerts') { 
      var venue = item['venue']['name']; // Get the name of the venue
      var location = item['venue']['city']; // Get the City Location:
      var date = item['datetime']; // Get the Date of the concert:
      var concertLog = 'Date: ' + moment(date).format("MM/DD/YY") + ' -- Venue: '
        + venue + ' -- City: ' + location;  // Concatenate the string for display and log.txt:
      additionalResultsArray.push(concertLog);
    }
  });

  inquirer.prompt([
    moreResults
  ]).then(function (data) {
    var choice = data['moreResults']; // grab just the string of the chosen option
    var indexCorrection = 1; // to adjust the index for an accurate search
    index = additionalResultsArray.indexOf(choice) + indexCorrection;
    if (source === 'concerts') {
      concertDetails(items, index);
    } else if (source === 'spotify') {
      songDetails(items, index);
    }
  })
}

  // ISSUES: 
  // DISPLAY CONCERT DATES IN A BETTER FORMAT
  // ALLOW ANOTHER INQUIRER TO SELECT NEW RESULTS - could I use api data to make a sleection list?
  // LOG SEARCHES TO A TXT
