// Our Twitter library
var Twit = require('twit');

// We need to include our configuration file
var T = new Twit(require('./config.js'));

// We want to follow the hashtag for elon musk
var elonMuskSearch = {q: "elonmusk", count: 10, result_type: "recent"};

// Our main method
function moneyForElon() {
    var fs = require('fs');
    var b64content = fs.readFileSync('./money.gif', {encoding: 'base64'})
    var outerTweet;

	// We grab tweet data from a post under the hashtag
    T.get('search/tweets', elonMuskSearch, gotData);
    function gotData(err, data, response) {
        console.log(data.statuses[0].text);
        outerTweet = data.statuses[0].text;
    }
	
	// We calculate how much money it would be if it were $8/word in the tweet
	function tweetCost(tweet) {
		var words = tweet.split(/\s*\b\s*/);
		var numWords = 0;
		var totalCost = 0;
		for (var i = 0; i < words.length; i++) {
			numWords++;
		}
		totalCost = numWords * 8;
		return totalCost;
	}

	// We post the gif
    T.post('media/upload', {media_data: b64content}, function(err, data, response) {
        var mediaIdStr = data.media_id_string
        var altText = "money"
        var meta_params = {media_id: mediaIdStr, alt_text: {text: altText }}
		
		// We post the text including the original tweet and our calculated cost
        T.post('media/metadata/create', meta_params, function(err, data, response) {
            if (!err) {
                if (outerTweet != undefined) {
                    var params = {status: "You: " + outerTweet + "\n\nElon if he received $8 for every word you tweeted: \nI'm $" + tweetCost(outerTweet) + " richer!", media_ids: [mediaIdStr]}
                }
                
                T.post('statuses/update', params, function(err, data, response) {
                    console.log(data)
                })
            }
        })
    })
}

//Calls the moneyForElon() function.
moneyForElon();

//Sets the interval for moneyForElon to 5 minutes.
setInterval(moneyForElon, 1000 * 60 * 5);