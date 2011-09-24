var app, express, io, path, stylus;
path = require('path');
express = require('express');
stylus = require('stylus');
app = module.exports = express.createServer();
io = require('socket.io').listen(app);
app.configure(function() {
  app.set('views', __dirname);
  app.set('view engine', 'jade');
  app.use(stylus.middleware({
    src: __dirname,
    compress: true
  }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname));
  return app.use(app.router);
});
app.configure('development', function() {
  return app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});
app.configure('production', function() {
  return app.use(express.errorHandler());
});
app.get('/', function(req, res) {
  return res.render('index', {
    layout: false
  });
});
app.get(/\/(.*)\.html/, function(req, res) {
  return res.render(req.params[0], {
    layout: false
  });
});
app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
io.on('connection', function(socket) {
  return socket.on('new', function(post) {
    console.log(post);
    return socket.broadcast.emit('post', post);
  });
});