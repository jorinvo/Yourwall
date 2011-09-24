 # require.paths.push('/usr/local/lib/node_modules')
path = require('path')
express = require('express')
stylus = require 'stylus'
app = module.exports = express.createServer()
io = require('socket.io').listen(app)

# ------------------------------------------------------------
#  Configuration
# ------------------------------------------------------------

app.configure ->
  app.set 'views', __dirname
  app.set 'view engine', 'jade'

  app.use stylus.middleware src: __dirname , compress: on

  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.static(__dirname)
  app.use app.router

app.configure 'development', ->
  app.use express.errorHandler({ dumpExceptions: true, showStack: true })

app.configure 'production', ->
  app.use(express.errorHandler())

# ------------------------------------------------------------
#  Routes
# ------------------------------------------------------------

app.get '/', (req, res) ->
  res.render 'index', layout: false

app.get /\/(.*)\.html/, (req, res) ->
  res.render req.params[0], layout: false

app.listen(process.env.PORT or 3000)
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env)


io.on 'connection', (socket) ->
  socket.on 'post', (post) ->
    console.log post
    socket.broadcast.emit 'post', post
