const fs = require('fs')
const path = require('path')
const util = require('util')
const readFile = util.promisify(fs.readFile)

const readData = async () => {
  try {
    const text = await readFile(path.resolve(__dirname, 'test.txt'), 'utf8')
    const lines = text.split(/\r?\n/g);
    const data = lines
      .filter((line) => line.split(' ').length === 7)
      .map((line) => {
        const parts = line.split(' ')
        const host = parts[0]
        const dateParts = parts[1].substring(1, parts[1].length - 2).split(':')
        const [ day, hour, minute, second ] = dateParts
        const method = parts[2].substring(1, parts[2].length)
        const url = parts[3]
        const protocol = parts[4].split('/')[0]
        const protocol_version = parts[4].split('/')[1].substring(0, parts[4].split('/')[1].length - 1)
        const response_code = parts[5]
        const document_size = parts[6]
        return {
          host,
          datetime: {
            day,
            hour,
            minute,
            second
          },
          request: {
            method,
            url,
            protocol,
            protocol_version
          },
          response_code,
          document_size
        }
    })
    return data;
  } catch (err) {
    throw(err)
  }
}

module.exports = { readData }