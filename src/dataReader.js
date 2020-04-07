const fs = require('fs')
const path = require('path')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const createJSON = async (inPath, outPath) => {
  try {
    const text = await readFile(inPath, 'ascii')
    const lines = text.split(/\r?\n/g);
    console.log('text data lines: ', lines.length)
    const data = lines
      .filter((line) => {
        if (line) {
          return true
        } else {
          return false
        }
      })
      .map((line) => {
        const request = line.substring(line.indexOf('\"') + 1, line.lastIndexOf('\"'))
        const other = line.replace(request, "")
        const parts = other.split(' ')
        
        const host = parts[0]
        const dateParts = parts[1].substring(1, parts[1].length - 2).split(':')
        const [ day, hour, minute, second ] = dateParts
        
        const requestParts = request.split(' ')
        const hasMethodData = ['GET', 'POST', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE'].includes(requestParts[0])
        const method = hasMethodData ? requestParts[0] : 'UNKNOWN METHOD'

        const hasProtocolData = requestParts[requestParts.length - 1].includes('HTTP')
        const protocol = hasProtocolData ? requestParts[requestParts.length - 1].split('/')[0] : "-"
        const protocol_version = hasProtocolData ? requestParts[requestParts.length - 1].split('/')[1].substring(0, requestParts[requestParts.length - 1].split('/')[1].length) : "-"
        
        if (hasMethodData) {
          requestParts.shift()
        }
        if (hasProtocolData) {
          requestParts.pop()
        }

        const url = requestParts[0]
        const response_code = parts[3]
        const document_size = parts[4]
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
    console.log('parsed data entities: ', data.length)
    await writeFile(outPath, JSON.stringify(data), 'utf8')
  } catch (err) {
    throw(err)
  }
}

const readData = async (filePath) => {
  const text = await readFile(filePath, 'utf8')
  return JSON.parse(text)
}

module.exports = { readData, createJSON }