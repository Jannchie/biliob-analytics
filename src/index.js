const async = require("async");
const d3 = Object.assign({}, require("d3-time-format"), require("d3-array"));
const _ = require("lodash");
var fs = require("fs");
const mf = require("./utils/mid-filter");
const adl = require("./utils/author-data-loader");
const int = require("./utils/interpolation");

async function getFansRate() {
  let dataPath = "./fans-desc-data.csv";
  let metaPath = "./fans-desc-meta.csv";
  // 变化率统计范围
  let dayDelta = 7;
  // 每组数据的间隔
  let deltaDay = 1;
  let sort = "desc";

  let startDate = Date.UTC(2020, 11, 1);
  // let startDate = new Date(+new Date() - 86400 * 1000 * 7);

  let endDate = Date.UTC(2021, 0, 31);
  mf.startDate = startDate;
  mf.endDate = endDate;
  let midList = await mf.listTopRateAuthorByDay(sort);
  // const midList = await mf.listPowerUp2020();
  let len = midList.length;
  let count = 0;
  let result = [];
  let startTime = new Date().getTime();
  await async.eachOfLimit(midList, 8, async (mid) => {
    let data = await adl.loadDataByMid(mid);
    let inter = int.getInter(
      data,
      (d) => d.datetime,
      (d) => d.fans
    );
    let info = await adl.loadInfoByMid(mid);
    if (info == null) {
      console.log(mid);
    }
    info.data = inter;
    result.push(info);
    count = progress(count, startTime, len);
  });
  let ctx = "mid,name,date,value,total\n";
  let cDate = startDate;
  let midSet = new Set();
  while (cDate < endDate) {
    let data = _(result)
      .map((d) => {
        let dataList = _.range(
          cDate - 86400 * 1000 * dayDelta,
          cDate,
          deltaDay * 86400 * 1000
        ).map((t) => d.data(t));
        if (sort == "asc") {
          d.value = d.data(cDate) - _.max(dataList);
        } else {
          d.value = d.data(cDate) - _.min(dataList);
        }
        return d;
      })
      .orderBy(function (a) {
        return a.value;
      }, sort)
      .take(100)
      .value();
    for (let eachData of data) {
      let id = eachData.mid;
      let dt = d3.timeFormat("%Y-%m-%d %H:%M")(cDate);
      let d = eachData.value;
      let total = eachData.data(cDate);
      let name = eachData.name;
      midSet.add(eachData.mid);
      ctx += `"${id}","${name}","${dt}","${d}","${total}"\n`;
    }
    cDate += 86400 * 1000 * deltaDay;
  }
  let metaCtx = `mid,name,image,channel,official\n`;
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
  fs.writeFileSync(dataPath, ctx, "utf-8");
  fs.writeFileSync(metaPath, metaCtx, "utf-8");
  console.log("Finished!");
}

function progress(count, startTime, len) {
  count += 1;
  let runTime = new Date().getTime() - startTime;
  let speed = count / (runTime / 1000);
  let remain = len - count;
  let remainTime = remain / speed;
  if (count % 10 == 0) {
    console.log(
      `Current: ${count}/${len}, Remain: ${remainTime.toFixed(2)}seconds`
    );
  }
  return count;
}

(async () => {
  await getFansRate();
})();
