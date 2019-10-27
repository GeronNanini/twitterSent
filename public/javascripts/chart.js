// var negSentimentCount = 0, neuSentimentCount = 0, posSentimentCount = 0;
var data = [negSentimentCount,neuSentimentCount,posSentimentCount];

var ctx = document.getElementById('chart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Negative Sentiment', 'Neutral Sentiment', 'Positive Sentiment'],
        datasets: [{
            data: data,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    },
});