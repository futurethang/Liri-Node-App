// FILE REQUIRES
var dotenv = require('dotenv').config();
var Spotify = require('node-spotify-api');
var keys = require("./keys.js");

// KEY REQUIRES
var spotify = new Spotify(keys.spotify);

// PACKAGE REQUIRES
var inquirer = require("inquirer");


 
// var spotify = new Spotify({
//   id: "746cefba8c824d8799cddba4d7a5b9a9",
//   secret: "fb550a0149384ee8b9ab7c37f4b6901d"
// });
 
spotify.search({ type: 'track', query: 'All the Small Things' }, function(err, data) {
  if (err) {
    return console.log('Error occurred: ' + err);
  }
  var results = data.tracks.items;
console.log(results); 
});

// var nodeQueryMode = process.argv[2];
// var nodeQueryText = process.argv.split(3).join(" ");

// TAKE USER INPUTS
// use Inquirer Package to offer list choices, send message, and then collect a string to search with
// https://github.com/sameeri/Code-Inquirer/wiki/Asking-questions-away-with-Inquirer!
function processAnswers(answers) {  
  console.log("And your answers are:", answers);
}

var searchFunction = [
  {
    message: "Choose a search function:",
    type: "list", 
    name: "searchFunction",
    choices: ['search concerts','spotify song search','search for movie','search from .txt']
  },
]

inquirer.prompt(searchFunction, processAnswers)



// DEFINE API CALL FUNCTIONS


// EXECUTE BASED UPON NODE ENTRIES
// switch (nodeQueryMode) {
//   case 'concert-this':
//     bandsInTownQuery(nodeQueryText)
//     break;
//   case 'spotify-this-song':
//     spotifyQuery(nodeQueryText)
//     break;
//   case 'movie-this':
//     movieQuery(nodeQueryText)
//     break;
//   case 'do-what-it-says':
//     textFileQuery()
//     break;
//   default:
//     break;
// }