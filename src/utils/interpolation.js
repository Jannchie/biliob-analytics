const d3 = Object.assign({}, require("d3-scale"), require("d3-interpolate"));
const _ = require("lodash");
class Interpolation {
  getInter(data, getDate, getValue) {
    data.sort((a, b) => {
      return getDate(a).getTime() - getDate(b).getTime();
    });
    let dateList = data.map((d) => getDate(d));
    let valueList = data.map((d) => getValue(d));
    let inter = d3
      .scaleLinear()
      .domain(dateList)
      .range(valueList)
      .clamp(true)
      .interpolate(d3.interpolateRound);
    let zero = dateList[0].getTime();
    // 如果是新入
    if (inter(zero + 86400000) - inter(zero) > valueList[0]) {
      console.log(`New Author: ${data[0].mid}`);
      inter = d3
        .scaleLinear()
        .domain(_.concat([new Date(zero - 86400000)], dateList))
        .range(_.concat([0], valueList))
        .clamp(true)
        .interpolate(d3.interpolateRound);
    }
    return inter;
  }
}
module.exports = new Interpolation();
