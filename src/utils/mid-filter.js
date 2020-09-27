const getClient = require("./db");
const _ = require("lodash");
const async = require("async");
class MidFilter {
  constructor(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
  }
  async listTopRateAuthorByDay() {
    let client = await getClient();
    let delta = 86400 * 1000;
    let data = [];
    console.log(this.startDate.getTime(), this.endDate.getTime());
    let timestampRange = _.range(
      this.startDate.getTime(),
      this.endDate.getTime(),
      delta
    );
    let coll = client.db("biliob").collection("author_daily_trend");
    await async.eachLimit(timestampRange, 8, async (startTime) => {
      let startDate = new Date(startTime);
      let endDate = new Date(startTime + delta);
      // console.log(`${startDate} - ${endDate}`);
      let d = await coll
        .find(
          { datetime: { $gte: startDate, $lt: endDate } },
          { projection: { mid: 1 } }
        )
        .sort({ fans: -1 })
        .limit(30)
        .hint("idx_datetime_fans")
        .toArray();
      data = _(d)
        .map((d) => d.mid)
        .concat(data)
        .uniq()
        .value();
    });
    client.close();
    return data;
  }
}
module.exports = new MidFilter();
