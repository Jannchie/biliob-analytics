const async = require("async");
const d3 = Object.assign({}, require("d3-time-format"), require("d3-array"));
const _ = require("lodash");
var fs = require("fs");
const mf = require("./utils/mid-filter");
const adl = require("./utils/author-data-loader");
const int = require("./utils/interpolation");

async function getFansRate() {
  let startDate = new Date("2020-01-01");
  let endDate = new Date();
  let deltaDay = 1;
  mf.startDate = startDate;
  mf.endDate = endDate;
  let midList = await mf.listTopRateAuthorByDay();
  let len = midList.length;
  let count = 0;
  let result = [];
  let startTime = new Date().getTime();
  // await async.eachLimit(_.take(midList, 20), 4, async (mid) => {
  await async.eachLimit(midList, 4, async (mid) => {
    let data = await adl.loadDataByMid(mid);
    let inter = int.getInter(
      data,
      (d) => d.datetime,
      (d) => d.fans
    );
    let info = await adl.loadInfoByMid(mid);
    info.data = inter;
    result.push(info);
    count = progress(count, startTime, len);
  });
  let ctx = "mid,name,date,value\n";
  let cDate = startDate.getTime();
  let midSet = new Set();
  while (cDate < endDate.getTime()) {
    let data = _(result)
      .map((d) => {
        d.value = d.data(cDate) - d.data(cDate - 86400 * 1000 * 30);
        return d;
      })
      .orderBy(function (a) {
        return a.value;
      }, "desc")
      .take(25)
      .value();
    for (let eachData of data) {
      let id = eachData.mid;
      let dt = d3.timeFormat("%Y-%m-%d")(cDate);
      let d = eachData.value;
      let name = eachData.name;
      midSet.add(eachData.mid);
      ctx += `"${id}","${name}","${dt}","${d}"\n`;
    }
    cDate += 86400 * 1000 * deltaDay;
  }
  let metaCtx = `id,name,image,channel\n`;
  for (let data of result) {
    if (midSet.has(data.mid)) {
      let img = data.face;
      let id = data.mid;
      let name = data.name;
      let official = data.official;
      let channel = _(data.channels)
        .values()
        .maxBy((d) => d.count);
      if (channel == undefined) {
        channel = "其它";
      } else {
        channel = channel.name;
      }
      metaCtx += `"${id}","${name}","${img}","${channel}","${official}"\n`;
    }
  }
  fs.writeFileSync("test-meta.csv", metaCtx, "utf-8");
  fs.writeFileSync("test.csv", ctx, "utf-8");
}

(async () => {
  await getFansRate();
})();

function progress(count, startTime, len) {
  count += 1;
  let runTime = new Date().getTime() - startTime;
  let speed = count / (runTime / 1000);
  let remain = len - count;
  let remainTime = remain / speed;
  if (count % 100 == 0) {
    console.log(
      `Current: ${count}/${len}, Remain: ${remainTime.toFixed(2)}seconds`
    );
  }
  return count;
}
