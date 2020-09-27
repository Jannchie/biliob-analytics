const getClient = require("./db");
class AuthorDataLoader {
  async loader(mid, collectionName, one) {
    let client = await getClient();
    let coll = client.db("biliob").collection(collectionName);
    let data;
    if (one) {
      data = await coll.findOne({ mid: mid });
    } else {
      data = await coll.find({ mid: mid }).toArray();
    }
    client.close();
    return data;
  }

  async loadDataByMid(mid) {
    return await this.loader(mid, "author_data");
  }
  async loadInfoByMid(mid) {
    return await this.loader(mid, "author", true);
  }
}
let authorDataLoader = new AuthorDataLoader();
module.exports = authorDataLoader;
