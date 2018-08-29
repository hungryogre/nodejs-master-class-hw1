'use strict'

const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder

//Load appropriate operating configuration based on NODE_ENV
const config = require('./config')

//Handlers should provide an HTTP status code
//and optionally data to return to the client
let handlers = {}
handlers.ping = (data, callback) => callback(200)
handlers.notFound = (data, callback) => callback(404)
handlers.hello = (data, callback) => {
    //properly formed requests contain a JSON object with a 'name' field
    let { name } = data.input ? JSON.parse(data.input) : {}
    name = name ? name : 'He Who Shall Not Be Named'
    const greeting = 'Hello and Welcome, ' + name + '!'
    callback(200, { greeting })
}

//URI routes should correspond to the appropriate handlers
let routes = {
    'ping': handlers.ping,
    'hello': handlers.hello
}

//Define API Server
const apiServer = (req, res) => {
    let parsedUrl = url.parse(req.url, true)
    let method = req.method.toUpperCase()
    let { headers } = req
    let { pathname, query } = parsedUrl
    let route = pathname.replace(/^\/+|\/+$/g, '')
    let decoder = new StringDecoder('utf-8')
    let input = ''
    req.on('data', data => input += decoder.write(data))
    req.on('end', () => {
        input += decoder.end()
        //since we're calling the handler, should this check for typeof === function?
        let handler = typeof routes[route] !== 'undefined' ? routes[route] : handlers.notFound
        handler({ method, route, query, headers, input }, (status, payload) => {
            let resStatus = typeof status === 'number' ? status : 200
            //@TODO should the below be an assertion?
            let resPayload = typeof payload === 'object' ? payload : {}
            res.setHeader('Content-Type', 'text/html')
            res.writeHead(resStatus)
            res.end(resPayload.greeting)
            if (config.verbose) {
                console.group(method)
                console.log('status: ', resStatus)
                console.log('path: ', route)
                console.log('params: ', JSON.stringify(query, null, 4))
                console.log('headers:', JSON.stringify(headers, null, 4))
                console.log('data-in: ', JSON.stringify(input, null, 4))
                console.log('data-out', JSON.stringify(resPayload, null, 4))
                console.groupEnd()
            } else {
                console.log(method, route, resStatus, JSON.stringify(resPayload))
            }
        })
    })
}

const httpServer = http.createServer(apiServer)
httpServer.listen(config.httpPort, () => {
    console.log('Server UP listening on port', config.httpPort, 'in', config.envName, 'mode')
})