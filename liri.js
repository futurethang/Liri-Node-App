// FILE REQUIRES
var dotenv = require('dotenv').config();
var Spotify = require('node-spotify-api');
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var inquirer = require("inquirer");

function spotifySearch(searchTerm) {
  spotify.search({ type: 'track', query: searchTerm }, function (err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }
    var results = data.tracks.items;
    console.log(results);
  });
  console.log("And your answers are:", answers);
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
  message: "What are you looking for?" // change text based on searchFunction selection
}

inquirer.prompt([
  searchFunction,
  searchTerm,
]).then(function (data) {
  var searchFunction = data.searchFunction;
  var searchTerm = data.searchTerm

  switch (searchFunction) {
    case 'spotify song search':
      spotifySearch(searchTerm);
      break;
    case 'search concerts':
      concertSearch(searchTerm);
      break;
    case 'search for movie':
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