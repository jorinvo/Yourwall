 # require.paths.push('/usr/local/lib/node_modules')
path = require('path')
express = require('express')
stylus = require 'stylus'
redis = require 'redis'
client = redis.createClient()

client.on 'error', (err) -> console.log 'Error: ' + err

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

app.listen(process.env.PORT or 3000)
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env)


io.sockets.on 'connection', (socket) ->
  client.lrange 'posts', 0, -1, (err, posts) ->
    p = posts[0..-2]
    posts = []
    for post in p
      posts.push JSON.parse post
    socket.emit 'posts', posts
  socket.on 'new', (post) ->
    socket.broadcast.emit 'posts', [post]
    client.rpush 'posts', JSON.stringify post
    client.ltrim 'posts', 0, 50
