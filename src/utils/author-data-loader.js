const getClient = require("./db");
class AuthorDataLoader {
  async loader(mid, collectionName, one) {
    let url = process.env.BILIOB_MONGO_URL;
    if (collectionName == "author_data") {
      url = "mongodb://localhost:27777";
    }
    let client = null;
    while (client == null) {
      try {
        client = await getClient(url);
      } catch {}
    }
    let coll = client.db("biliob").collection(collectionName);
    let data;
    if (one) {
      data = await coll.findOne({ mid: mid });
    } else {
      try {
        if (collectionName == "author_data") {
          data = await coll
            .aggregate([
              {
                $match: {
                  mid: mid,
                },
              },
              {
                $addFields: {
                  date: {
                    $dateToString: {
                      format: "%Y-%m-%d %H",
                      date: "$datetime",
                    },
                  },
                },
              },
              {
                $group: {
                  _id: "$date",
                  fans: {
                    $last: "$fans",
                  },
                  mid: {
                    $last: "$mid",
                  },
                  datetime: {
                    $last: "$datetime",
                  },
                },
              },
            ])
            .toArray();
        } else {
          data = await coll
            .find({ mid: mid })
            // .hint("idx_mid_datetime")
            .toArray();
        }
      } catch (e) {
        console.log(e);
        console.log(mid);
      }
    }
    client.close();
    return data;
  }

  async loadDataByMid(mid) {
    try {
      return await this.loader(mid, "author_data");
    } catch {
      return await this.loadDataByMid(mid);
    }
  }
  async loadInfoByMid(mid) {
    try {
      return await this.loader(mid, "author", true);
    } catch {
      return await loadInfoByMid(mid);
    }
  }
}
let authorDataLoader = new AuthorDataLoader();
module.exports = authorDataLoader;
