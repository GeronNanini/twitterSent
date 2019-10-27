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

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Twitter Sentiment Analysis',
    description: 'Find the overall sentiment of Twitter users regarding a particular topic'
  });
});

/* GET analysis page. */
router.get('/analysis', function (req, res, next) {
  let query = req.query.q;
  let searchQuery = '#' + (req.query.q).replace(/\s+/g, '');

  results = {
    positiveSentiment:{val: 0, text:"positive", emojiCode:"U+1F601"},
    negativeSentiment:{val: 0, text:"negative", emojiCode:"U+1F612"},
    neutralSentiment:{val: 0, text:"neutral", emojiCode:"U+1F610"},

    positiveTweets: [],
    negativeTweets: [],
    neutralTweets: [],

    // overallSentiment: ""
    
  }

  // Search twitter for 100 tweets containing the specified query in the english language
  T.get('search/tweets', { q: searchQuery, count: 100, lang: 'en' }, function (err, data, response) {
    let tweets = data.statuses;
    for (var i = 0; i < tweets.length; i++) {

      // Retrieve tweet text
      let tweet = tweets[i].text;
      
      // Clean tweet text and split into array of substrings (required for sentiment analysis)
      let tweetArrayified = tweet.replace(/RT\s*@\S+/g, '').split(" ");

      // Perform sentiment analysis.
      // And organize tweets according to sentiment and increment respective counters
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
      
      // Get tweets and store (as JSON object)
      // --- this is where you could implement persistence by a method identical to the prac
      // --- i.e. for a certain hashtag (key), first check redis, then check s3, then retrieve tweets
      // however first we'll just try one hashtag and not even store it

      // Pack data as JSON object

    }

    res.render('analysis', {
      title: "Twitter Sentiment Analysis App",
      subtitle: JSON.stringify(query),
      positiveSentiment: results.positiveSentiment.val,
      negativeSentiment: results.negativeSentiment.val,
      neutralSentiment: results.neutralSentiment.val,
      // overallSentiment: overallSentiment,
      positiveTweets: results.positiveTweets,
      negativeTweets: results.negativeTweets,
      neutralTweets: results.neutralTweets
    });
  })
});

module.exports = router;
