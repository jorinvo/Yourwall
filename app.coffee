 # require.paths.push('/usr/local/lib/node_modules')
path = require('path')
express = require('express')
http = require('http')
stylus = require 'stylus'
redis = require('redis-url').connect(process.env.REDISTOGO_URL or 'redis://localhost:6379')

redis.on 'error', (err) -> console.log 'Error: ' + err

app = module.exports = express()
server = http.createServer(app)
io = require('socket.io').listen(server)

io.configure ->
  io.set('transports', ['xhr-polling'])
  io.set('heartbeat timeout', 1000)

# ------------------------------------------------------------
#  Configuration
# ------------------------------------------------------------

app.configure ->
  app.set 'views', __dirname + '/views'
  app.set 'view engine', 'jade'

  app.use stylus.middleware src: __dirname , compress: on

  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.static(__dirname + '/public')
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

# ------------------------------------------------------------
#  Start server
# ------------------------------------------------------------

server.listen(process.env.PORT or 3000)

# ------------------------------------------------------------
#  Socket.io
# ------------------------------------------------------------


io.sockets.on 'connection', (socket) ->

  #on new connection: get all post from redis
  #and send them to the client
  redis.lrange 'posts', 0, -1, (err, posts) ->

    p = posts[0..-2]
    p.reverse()
    posts = []

    for post in p
      posts.push JSON.parse post

    socket.emit 'posts', posts
    socket.emit 'ready'


  #when we got a message from the client
  #it gets added to the db, we make sure that
  #there aren't to many in the db and we broadcast
  #the new post to all clients
  socket.on 'new', (post) ->
    socket.broadcast.emit 'posts', [post]
    redis.lpush 'posts', JSON.stringify post
    redis.ltrim 'posts', 0, 100
