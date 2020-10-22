const getClient = require("./db");
class AuthorDataLoader {
  async loader(mid, collectionName, one) {
    let url = process.env.BILIOB_MONGO_URL;
    if (collectionName == 'author_data') {
      url = 'mongodb://localhost:27017'
    }
    let client = await getClient(url);
    let coll = client.db("biliob").collection(collectionName);
    let data;
    if (one) {
      data = await coll.findOne({ mid: mid });
    } else {
      try {
        data = await coll.find({ mid: mid }).hint("idx_mid_datetime").toArray();
      } catch (e) {
        console.log(e);
        console.log(mid);
      }
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
