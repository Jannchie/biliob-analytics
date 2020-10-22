const getClient = require("./db");
const _ = require("lodash");
const async = require("async");
class MidFilter {
  constructor(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
  }
  async listTopRateAuthorByDay(sort) {
    let client = await getClient();
    let delta = 86400 * 1000;
    let data = [];
    console.log(this.startDate, this.endDate);
    let days = Math.floor((this.endDate - this.startDate) / delta);
    let timestampRange = _.range(this.startDate, this.endDate, delta);
    let coll = client.db("biliob").collection("author_daily_trend");
    let count = 0;
    await async.eachOfLimit(timestampRange, 8, async (startTime) => {
      let startDate = new Date(startTime);
      let endDate = new Date(startTime + delta);
      // console.log(`${startDate} - ${endDate}`);
      let fansFilter = sort == "asc" ? { $lt: -500 } : { $gt: 500 };
      let d = await coll
        .find(
          { datetime: startDate, fans: fansFilter },
          { projection: { mid: 1 } }
        )
        .sort({ fans: sort == "asc" ? 1 : -1 })
        .limit(30)
        .hint("idx_datetime_fans")
        .toArray();
      data = _(d)
        .map((d) => d.mid)
        .concat(data)
        .uniq()
        .value();
      count += 1;
      if (count % 10 == 0) {
        console.log(`${data.length}个 (${count} / ${days}Days)`);
      }
    });
    client.close();
    return data;
  }
}
module.exports = new MidFilter();
