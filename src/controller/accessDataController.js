const redis = require('redis')
const { promisify } = require('util')
const dataReader = require('../dataReader')
const client = redis.createClient()
const redisGet = promisify(client.get).bind(client)
const redisSetex = promisify(client.setex).bind(client)

exports.getDistribution = async (req, res, next) => {
  try {
    const result = await redisGet('data')
    let resp;
    if (result) {
      resp = { source: 'Redis', data: JSON.parse(result) }
    } else {
      const data = await dataReader.readData();
      await redisSetex('data', 3600, JSON.stringify(data))
      resp = { source: 'File', data }
    }
    res.json(resp)
  } catch (err) {
    throw err
  }
}
