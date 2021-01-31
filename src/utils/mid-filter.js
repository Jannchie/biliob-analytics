const getClient = require("./db");
const _ = require("lodash");
const async = require("async");
const { ObjectId } = require("mongodb");
class MidFilter {
  constructor(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
  }
  async listPowerUp2020() {
    const client = await getClient();
    const coll = client.db("biliob").collection("author_group_item");
    const docs = await coll
      .find({
        gid: new ObjectId("5ff7c9cf4c0c3f31ff88c90e"),
      })
      .toArray();

    const mids = docs.map((doc) => doc.mid);
    mids.push(258150656);
    return mids;
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
    await async.eachOfLimit(timestampRange, 16, async (startTime) => {
      let startDate = new Date(startTime);
      // let endDate = new Date(startTime + delta);
      // console.log(`${startDate} - ${endDate}`);
      let fansFilter = sort == "asc" ? { $lt: -500 } : { $gt: 500 };
      let d = await coll
        .find(
          { datetime: startDate, fans: fansFilter },
          { projection: { mid: 1 } }
        )
        .sort({ fans: sort == "asc" ? 1 : -1 })
        .limit(50)
        // .hint("idx_datetime_fans")
        .toArray();
      data = _(d)
        .map((d) => d.mid)
        .concat(data)
        .uniq()
        .value();
      count += 1;
      if (count % 10 == 0) {
        console.log(`${ .length}个 (${count} / ${days}Days)`);
      }
    });

    coll = client.db("biliob").collection("author");
    let d = await coll
      .find({ cRate: { $exists: 1 } }, { projection: { mid: 1 } })
      .sort({ cRate: sort == "asc" ? 1 : -1 })
      .limit(30)
      .toArray();
    data = _(d)
      .map((d) => d.mid)
      .concat(data)
      .uniq()
      .value();

    console.log(`${data.length}个`);
    client.close();
    return data;
  }
}
module.exports = new MidFilter();
