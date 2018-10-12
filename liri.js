// FILE REQUIRES
var dotenv = require("dotenv").config();
// var Spotify = require('node-spotify-api');
// // KEY REQUIRES
// var spotify = new Spotify(keys.spotify);

// PACKAGE REQUIRES
var inquirer = require("inquirer");


// var nodeQueryMode = process.argv[2];
// var nodeQueryText = process.argv.split(3).join(" ");

// TAKE USER INPUTS
// use Inquirer Package to offer list choices, send message, and then collect a string to search with
// https://github.com/sameeri/Code-Inquirer/wiki/Asking-questions-away-with-Inquirer!
function processAnswers(answers){
  console.log("And your answers are:", answers);
}

var nodeQuery = [
  {
    message: "Choose a search function:",
    type: "list", 
    name: "nodeQuery",
    choices: ['search concerts','spotify song search','search for movie','search from .txt']
  },
]

inquirer.prompt(nodeQuery, processAnswers)

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