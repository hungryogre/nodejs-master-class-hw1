'use strict'

let serverModes = {}
let DEVELOPMENT = 'development'
let PRODUCTION = 'production'

serverModes[DEVELOPMENT] = {
    httpPort: 8000,
    envName: 'development',
    verbose: true
}

serverModes[PRODUCTION] = {
    httpPort: 80,
    envName: 'production',
    verbose: false
}

//determine operational mode from NODE_ENV
let envName = typeof process.env.NODE_ENV == 'string' ?
    process.env.NODE_ENV.toLowerCase() :
    ''

let envToExport = typeof serverModes[envName] == 'object' ?
    serverModes[envName] :
    serverModes[DEVELOPMENT]

module.exports = envToExport
