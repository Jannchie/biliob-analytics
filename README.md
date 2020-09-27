# biliob-analytics

Use NodeJS to analyze and sort out [Biliob](https://www.biliob.com/) data.

This is just a repository for analyzing data. At present, it is mainly used to generate the CSV file required by data visualization project ([anichart.js](https://github.com/Jannchie/anichart.js)). The project simplifies programming by using parts of [lodash](https://lodash.com/) and [D3](https://d3js.org/), and user the [async.js](https://caolan.github.io/async/v3/) library to perform time-consuming IO operations concurrently. Anyway, it's a bit of an exercise in these libraries. For this simple requirement, I've found that using Node.js is actually much more efficient than Python.
