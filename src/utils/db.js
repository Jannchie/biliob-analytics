const url = "mongodb://localhost:27017";
const MongoClient = require("mongodb").MongoClient;

async function getClient() {
  const client = MongoClient.connect(url, { useUnifiedTopology: true });
  return await client;
}

module.exports = getClient;
