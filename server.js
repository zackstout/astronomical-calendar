
//dependencies:
var express = require('express');
// const request = "requi"
const rp = require('request-promise');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

//set up server:
var app = express();
var port = process.env.PORT || 4000;

app.use(express.static('public'));

//Listener
app.listen(port, function() {
  console.log('thx for listening on channel', port);
});

function generateOptions(url) {
  return {
    uri: url,
    transform: function(body) {
      return cheerio.load(body);
    }
  };
}

// async function getPhenomena(ops) {
//   let data = await rp(ops);
//
//   console.log(data);
//   return data;
// }

app.get('/stuff', function(req, res) {
  const ops = generateOptions(`http://www.seasky.org/astronomy/astronomy-calendar-${req.query.year}.html`);

  let events = [];

  rp(ops).then(data => {
    let result = getInfo(data);
    let dates= result[0];
    let titles = result[1];
    let descriptions = result[2];

    // Zip up our three arrays into an array of objects:
    for (let i=0; i < dates.length; i++) {
      events.push({
        date: dates[i],
        title: titles[i],
        description: descriptions[i]
      });
    }

    // writeToCsv(events, req.query.year);

    res.send(events);

  }).catch(err => {
    console.log(err);
  });
});



function getInfo(data) {
  let dates = [];
  let titles = [];
  let descriptions = [];

  data('.date-text').each((i, elem) => {
    if (elem.children) {
      let date = elem.children[0].data;
      dates.push(date);
    }
  });

  data('.title-text').each((i, elem) => {
    if (elem.children) {
      let title = elem.children[0].data;
      titles.push(title);
      let description = elem.next.data;
      descriptions.push(description);
    }
  });

  return [dates, titles, descriptions];
}




function writeToCsv(evs, year) {
  const csvWriter = createCsvWriter({
    path: `csvs/${year}.csv`,
    header: [
      {id: 'date', title: 'date'},
      {id: 'title', title: 'title'},
      {id: 'description', title: 'description'},
    ]
  });

  csvWriter.writeRecords(evs)       // returns a promise
  .then(() => {
    console.log('...Done');
  });
}
