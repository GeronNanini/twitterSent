const express = require('express');
const router = express.Router();

// Twitter Setup (don't forget to 'npm install twit')
const Twit = require('twit');
const config = require('./config');
const T = new Twit(config);

// Sentiment Analysis Setup (don't forget to 'npm install natural')
const Analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;
const analyzer = new Analyzer("English", stemmer, "afinn");

// Temporary global variables for results (need to turn into JSON object for later storage)
var results = {}

var allTweets = [];

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Twitter Sentiment Analysis',
    description: 'Find the overall sentiment of Twitter users regarding a particular topic',
    trends: allTweets
  });
});

/* GET analysis page. */
router.get('/analysis', function (req, res, next) {
  // Get searched query and turn it into a hashtag
  let query = req.query.q;
  let searchQuery = '#' + (req.query.q).replace(/\s+/g, '');

  // Initialize results object for containing key data
  results = {
    positiveSentiment: { val: 0, text: "positive" },
    negativeSentiment: { val: 0, text: "negative" },
    neutralSentiment: { val: 0, text: "neutral" },

    positiveTweets: [],
    negativeTweets: [],
    neutralTweets: [],

    overallSentiment: ""

  }

  // Search twitter for 100 tweets containing the specified query in the English language
  T.get('search/tweets', { q: searchQuery, count: 100, lang: 'en' }, function (err, data, response) {
    let tweets = data.statuses;
    for (var i = 0; i < tweets.length; i++) {

      // Retrieve tweet text
      let tweet = tweets[i].text;

      // Clean tweet text and split into array of substrings (required for sentiment analysis)
      let tweetArrayified = tweet.replace(/RT\s*@\S+/g, '').split(" ");

      // Perform sentiment analysis.
      // Organize tweets into 'results' object according to sentiment, and increment respective counters
      if (analyzer.getSentiment(tweetArrayified) > 0) {
        results.positiveTweets.push(tweet);
        results.positiveSentiment.val++;

      } else if (analyzer.getSentiment(tweetArrayified) < 0) {
        results.negativeTweets.push(tweet);
        results.negativeSentiment.val++;

      } else {
        results.neutralTweets.push(tweet);
        results.neutralSentiment.val++;
      }

      // [TODO] Get tweets and store (as JSON object)
      // --- this is where you could implement persistence by a method identical to the prac
      // --- i.e. for a certain hashtag (key), first check redis, then check s3, then retrieve tweets
      // --- however first we'll just try one hashtag and not even store it

    }
    
    getOverallSentiment();

    res.render('analysis', {
      title: "Twitter Sentiment Analysis App",
      subtitle: JSON.stringify(query),
      positiveSentiment: results.positiveSentiment.val,
      negativeSentiment: results.negativeSentiment.val,
      neutralSentiment: results.neutralSentiment.val,
      overallSentiment: results.overallSentiment,
      positiveTweets: results.positiveTweets,
      negativeTweets: results.negativeTweets,
      neutralTweets: results.neutralTweets
    });

    function getOverallSentiment() {
      if ((results.positiveSentiment.val > results.neutralSentiment.val) && (results.positiveSentiment.val > results.negativeSentiment.val)) {
        results.overallSentiment = results.positiveSentiment.text;
      } else if ((results.neutralSentiment.val > results.positiveSentiment.val) && (results.neutralSentiment.val > results.negativeSentiment.val)) {
        results.overallSentiment = results.neutralSentiment.text;
      } else if ((results.negativeSentiment.val > results.positiveSentiment.val) && (results.negativeSentiment.val > results.neutralSentiment.val)) {
        results.overallSentiment = results.negativeSentiment.text;
      } else {
        results.overallSentiment = "neutral";
      }
    }

  })
});

module.exports = router;
