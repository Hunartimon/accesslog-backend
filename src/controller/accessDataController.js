const redis = require('redis')
const { promisify } = require('util')
const path = require('path');
const dataReader = require('../dataReader')
const client = redis.createClient()
const redisGet = promisify(client.get).bind(client)
const redisSetex = promisify(client.setex).bind(client)

const formatData  = (data) => {
  const requestPerMinute = data.reduce((prev, curr) => {
    const index = prev.findIndex((it) => (it.datetime === `${curr.datetime.day}:${curr.datetime.hour}:${curr.datetime.minute}`))
    const existing = prev[index]
    if (index !== -1) {
      existing.count += 1
      prev[index] = existing
    } else {
      prev.push({ datetime: `${curr.datetime.day}:${curr.datetime.hour}:${curr.datetime.minute}`, count: 1})
    }
    return prev
  },[])

  const methods = data.reduce((prev, curr) => { 
    if (!prev.includes(curr.request.method)) {
      prev.push(curr.request.method)
    }
    return prev
  },[]) 
  const methodDist = methods.map((m) => { return { m, count: data.filter(it => it.request.method === m).length } })
  
  const responseCodes = data.reduce((prev, curr) => { 
    if (!prev.includes(curr.response_code)) {
      prev.push(curr.response_code)
    }
    return prev
  },[]).sort()
  const responseCodeDist = responseCodes.map((rc) => { return { rc, count: data.filter(it => it.response_code === rc).length } } )

  const sizes = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
  const smallOkResponseDist = sizes.map((it, i) => {
    const range = (i === 0) ? [0, sizes[i]] : [sizes[i-1], sizes[i]]
    return {
      range,
      count: data.filter(it => (it.response_code === "200" && parseInt(it.document_size) >= range[0] && parseInt(it.document_size) < range[1])).length
    }
  }) 

  return {
    dataCount: data.length,
    requestPerMinute,
    methodDist,
    responseCodeDist,
    smallOkResponseDist
  }
}

exports.getDistribution = async (req, res, next) => {
  try {
    const fileName = 'epa-http.json'
    let result
    try {
      result = await redisGet(fileName);
    } catch (err) {
      console.log('Redis server not reachable')
    }
    let resp;
    if (result) {
      resp = JSON.parse(result)
    } else {
      const data = await dataReader.readData(path.resolve(__dirname, '..', 'res', fileName));
      await redisSetex(fileName, 3600, JSON.stringify(data))
      resp = data
    }
    res.json(formatData(resp))
  } catch (err) {
    throw err
  }
}
