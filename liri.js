// REQUIRES
var fs = require("fs");
var moment = require("moment");
var dotenv = require("dotenv").config();
var Spotify = require("node-spotify-api");
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var inquirer = require("inquirer");
var request = require("request");

// APPLICATION VARIABLES
var index = 0;
var searchFunction;
var searchTerm;
var additionalResultsArray = [">> go back"];


// DEFINE THE DIFFERENT API SEARCHES IN FUNCTIONS TO USE WITHIN A SWITCH STATMENT LATER


function songDetails(items, index) { // COMPILES DATA FROM THE SEARCH RESULTS TO DISPLAY INDIVIDUAL RESULTS
  var songTitle = items[index].name; // Get the song title:
  var artist = items[index].artists[0].name; // Get the name of the Artist:
  var fromAlbum = items[index].album.name; // Get the name of the Album:
  var songPreview = items[index].external_urls.spotify; // Get the link to the song preview:
  var songLog = "----------\nSong: " + songTitle + "\nArtist: " + artist +
    "\nFrom the Album: " + fromAlbum + "\nPreview Track: " + songPreview +
    "\n----------";  // Concatenate the data for log and display:
  console.log(songLog);
  updateLogFile(songLog);
  chooseAnotherResult(items, "spotify");
}

function spotifySearch(searchTerm) { //EXECUTES A NEW API SEARCH  
  spotify.search({ type: "track", query: searchTerm }, function (err, data) {
    var items = data.tracks.items;
    if (err || items.length === 0) { console.log("Search returned no results!") }
    else { songDetails(items, index); }
  });
}

function concertDetails(items, index) { // COMPILES DATA FROM THE SEARCH RESULTS TO DISPLAY INDIVIDUAL RESULTS
  var venue = items[index].venue.name; // Get the Venue Name:
  var location = items[index].venue.city; // Get the City Location:
  var date = items[index].datetime; // Get the Date of the concert:
  var concertLog = "----------\nVenue: " + venue + "\nCity: " + location +
    "\nDate: " + moment(date).format("MM/DD/YY") + "\n----------"; // Concatenate the string for display and log.txt:
  console.log(concertLog);
  updateLogFile(concertLog);
  chooseAnotherResult(items, "concerts");
}

function concertSearch(searchTerm) { //EXECUTES A NEW API SEARCH 
  request("https://rest.bandsintown.com/artists/" + searchTerm + "/events?app_id=codingbootcamp", function (error, response, body) {
    var items = JSON.parse(body);
    if (error || items[index] === undefined) { console.log("Search returned no results!");}
    else {concertDetails(items, index);}
  });
}

function movieSearch(searchTerm) {
  var queryUrl = "http://www.omdbapi.com/?t=" + searchTerm + "&y=&plot=short&apikey=trilogy";
  if (searchTerm === "") { queryUrl = "http://www.omdbapi.com/?t=Mr.+Nobody&y=&plot=short&apikey=trilogy" };
  request(queryUrl, function (error, response, body) {
    // If the request is successful
    var movieLog = "";
    if (!error && response.statusCode === 200) {
      movieLog += JSON.parse(body).Title; // Title of the movie.
      movieLog += "\n" + JSON.parse(body).Year;      // Year the movie came out.
      movieLog += "\nRated: " + JSON.parse(body).Rated;      // IMDB Rating of the movie.
      var ratings = JSON.parse(body).Ratings[1].Value;      // Rotten Tomatoes Rating of the movie.
      movieLog += "\nRotten Tomatoes: " + ratings;
      movieLog += "\nMade in: " + JSON.parse(body).Country;      // Country where the movie was produced.
      movieLog += "\nLanguage: " + JSON.parse(body).Language;      // Language of the movie.
      movieLog += "\nPlot: " + JSON.parse(body).Plot;      // Plot of the movie.
      movieLog += "\nStarring: " + JSON.parse(body).Actors;      // Actors in the movie.
      console.log(movieLog);
      updateLogFile(movieLog);
    }
  });
}

function txtSearch() {
  fs.readFile("random.txt", "utf8", function (error, data) {
    var arguments = data.split(",");
    searchMethodSwitch(arguments[0], arguments[1])
  })
}

function updateLogFile(logText) {
  var timeStamp = moment().format("MM/DD/YYYY - HH:mm:ss:SSS");
  var logBody = "\n\n\n" + timeStamp + " >>>>>>>>>>\n" + logText;
  fs.appendFile("log.txt", logBody, function (err) { });
}

function searchMethodSwitch(searchFunction, searchTerm) {
  switch (searchFunction) {
    case "spotify song search":
      spotifySearch(searchTerm);
      break;
    case "search concerts":
      concertSearch(searchTerm);
      break;
    case "search for movie":
      movieSearch(searchTerm);
      break;
    case "search from .txt":
      txtSearch();
      break;
    default:
      break;
  }
}

// TAKE USER INPUTS
// use Inquirer Package to offer list choices, send message, and then collect a string to search with
// https://github.com/sameeri/Code-Inquirer/wiki/Asking-questions-away-with-Inquirer!
var searchInquiry = {
  type: "list",
  name: "searchFunction",
  message: "Choose a search function:",
  choices: ["search concerts", "spotify song search", "search for movie", "search from .txt"]
};

var searchInquiryTerm = {
  type: "input",
  name: "searchTerm",
  message: "What are you looking for?"
};

var loadAnotherResult = {
  type: "confirm",
  name: "loadAnotherResult",
  message: "Load a different reult?"
};

var moreResults = {
  type: "list",
  name: "moreResults",
  message: "Choose a different search result:",
  choices: additionalResultsArray
};

// PRIMARY SEARCH PROMPT  !! SET UP AS FUNCTION TO INVOKE LATER AND ADD GLOBAL VARIABLE RESETS

function firstSearch() {
  additionalResultsArray.splice(1);
  inquirer.prompt([
    searchInquiry,
    searchInquiryTerm,
  ]).then(function (data) {
    searchFunction = data.searchFunction;
    searchTerm = data.searchTerm
    searchMethodSwitch(searchFunction, searchTerm);
  });
}

// FUNTION TO RETURN THE NEXT SET OF RESULTS FROM LISTED API RETURNS !!  DEFUNCT BUT PRESERVED
// function iterateResults(searchFunction) {
//   inquirer.prompt([
//     loadAnotherResult
//   ]).then(function (data) {
//     if (data.loadAnotherResult) {
//       index += 1;
//       if (searchFunction === 'spotify') {
//         spotifySearch(searchTerm);
//       } else if (searchFunction === 'concerts') {
//         concertSearch(searchTerm);
//       }
//     }
//   });
// }

function chooseAnotherResult(items, source) {
  var firstInList = 1;
  var lastInList = 10;
  var indexCorrection = 1; // to adjust the index for an accurate search
  items.slice(firstInList, lastInList).forEach(function (item, i) {
    // push the title strings to the additionalResultsArray | Not using details functions because formatting is for list display
    if (source === "spotify") {
      var title = item.name;
      var artist = item.artists[0].name;
      additionalResultsArray.push("#" + (i + indexCorrection) + " By: " + artist + " - - " + "Song Name: " + title);
    } else if (source === "concerts") {
      var venue = item.venue.name; // Get the name of the venue
      var location = item.venue.city; // Get the City Location:
      var date = item.datetime; // Get the Date of the concert:
      var concertLog = "#" + (i + indexCorrection) + " Date: " + moment(date).format("MM/DD/YY") + " -- Venue: "
        + venue + " -- City: " + location;  // Concatenate the string for display and log.txt:
      additionalResultsArray.push(concertLog);
    }
  });

  inquirer.prompt([
    moreResults
  ]).then(function (data) {
    var choice = data["moreResults"]; // grab just the string of the chosen option
    if (choice !== ">> go back") {
      index = additionalResultsArray.indexOf(choice) + indexCorrection - 1; // MAGIC NUMBER FIXES CHOICE/INDEX ALIGNMENT WITH "GO BACK" BEING A PERMANENT OPTION
      if (source === "concerts") {
        concertDetails(items, index);
      } else if (source === "spotify") {
        songDetails(items, index);
      }
    } else { // IF USER SELECTS "GO BACK" THIS WILL RETURN TO THE MAIN SEARCH
      firstSearch();
    }
  })
}

firstSearch(); // CALLED TO BEGIN THE PROGRAM

  // ISSUES: 
  // CREATE SEARCH FROM RANDOM.TXT
  // ADD EXIT OPTION FROM CHOOSING NEW REULTS >> NAVIGATE BACK TO ORIGINAL SEARCH WITHOUT EXITING PROGRAM > REQUIRES SOME VAR RESETS
  // BONUS: "LOAD MORE RESULTS" THAT WILL SET A NEW SET OF 10 OPTIONS
