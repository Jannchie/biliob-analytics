let URL = process.env.BILIOB_MONGO_URL;
const MongoClient = require("mongodb").MongoClient;

async function getClient(url = URL) {
  const client = MongoClient.connect("mongodb://localhost:2000", {
    useUnifiedTopology: true,
  });
  return await client;
}

module.exports = getClient;
