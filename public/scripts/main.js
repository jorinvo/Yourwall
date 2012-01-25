var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

$(function() {
  var Post, PostCollection, PostView, Wall, posts, socket, wall;
  $.fn.spin = function(opts) {
    this.each(function() {
      var $this, data;
      $this = $(this);
      data = $this.data();
      if (data.spinner) {
        data.spinner.stop();
        delete data.spinner;
      }
      if (opts !== false) {
        return data.spinner = new Spinner($.extend({
          color: "#FFF"
        }, opts)).spin(this);
      }
    });
    return this;
  };
  $('#container').fadeIn(600).delay(600).spin({
    lines: 10,
    length: 11,
    width: 4,
    radius: 10,
    color: '#FFF',
    speed: '0.9',
    trail: 58,
    shadow: false
  });
  $("#menu").animate({
    top: 0
  });
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };
  Wall = (function(_super) {

    __extends(Wall, _super);

    function Wall() {
      this.renderPosition = __bind(this.renderPosition, this);
      this.renderFont = __bind(this.renderFont, this);
      this.renderColor = __bind(this.renderColor, this);
      this.renderSize = __bind(this.renderSize, this);
      this.renderContent = __bind(this.renderContent, this);
      Wall.__super__.constructor.apply(this, arguments);
    }

    Wall.prototype.el = 'body';

    Wall.prototype.msgVisible = false;

    Wall.prototype.initialize = function() {
      this.newPost = new Post({
        content: '',
        font: 'Sniglet',
        size: 20,
        color: '#fff',
        position: {
          x: 10,
          y: 10
        }
      });
      this.newPost.bind('change:content', this.renderContent);
      this.newPost.bind('change:size', this.renderSize);
      this.newPost.bind('change:color', this.renderColor);
      this.newPost.bind('change:font', this.renderFont);
      this.newPost.bind('change:position', this.renderPosition);
      this.msg = $('#message input');
      this.frame = $('#message');
      this.slider = $('#size');
      this.frame.draggable({
        containment: 'parent',
        delay: 150,
        distance: 8,
        cursor: 'move'
      });
      this.slider.slider({
        animate: true,
        value: 17,
        max: 35,
        min: 10
      });
      $('#colorPicker').selectable();
      return $('#fontPicker').selectable();
    };

    Wall.prototype.renderContent = function() {
      return this.msg.val(this.newPost.get('content'));
    };

    Wall.prototype.renderSize = function() {
      var oldWidth;
      oldWidth = 0.5 * this.msg.width();
      return this.msg.css({
        fontSize: this.newPost.get('size')
      }).css({
        left: this.msg.position().left + oldWidth - 0.5 * this.msg.width()
      });
    };

    Wall.prototype.renderColor = function() {
      return this.msg.animate({
        color: this.newPost.get('color')
      });
    };

    Wall.prototype.renderFont = function() {
      return this.msg.css({
        fontFamily: this.newPost.get('font')
      });
    };

    Wall.prototype.renderPosition = function() {
      var pos,
        _this = this;
      pos = this.newPost.get('position');
      this.frame.animate({
        left: pos.x - 32,
        top: pos.y
      });
      if (!this.msgVisible) {
        this.frame.fadeIn(400, function() {
          return _this.msg.focus();
        });
        return this.msgVisible = true;
      }
    };

    Wall.prototype.events = {
      'slidechange #size': 'resizeNFocus',
      'slide #size': 'resize',
      'selectableselected #colorPicker': 'changeColor',
      'selectableselected #fontPicker': 'changeFont',
      'click #clickable': 'changePosition',
      'dragstop #message': 'dragHandler',
      'click #submit': 'savePost',
      'keydown #message': 'keyHandler',
      'click #message': 'stopPropagation'
    };

    Wall.prototype.resize = function() {
      return this.newPost.set({
        size: this.slider.slider('value')
      });
    };

    Wall.prototype.resizeNFocus = function() {
      this.resize();
      return this.msg.focus();
    };

    Wall.prototype.changeColor = function(e, ui) {
      return this.newPost.set({
        color: $(ui.selected).css('background-color')
      });
    };

    Wall.prototype.changeFont = function(e, ui) {
      return this.newPost.set({
        font: $(ui.selected).css('font-family')
      });
    };

    Wall.prototype.changePosition = function(e) {
      this.newPost.set({
        position: {
          x: e.pageX - this.msg.width() / 2 - $('#container').position().left,
          y: e.pageY - 100 - 0.5 * this.frame.height()
        }
      });
      return this.msg.focus();
    };

    Wall.prototype.dragHandler = function(e) {
      this.newPost.set({
        position: {
          x: this.frame.position().left + 32,
          y: this.frame.position().top
        }
      });
      return this.msg.focus();
    };

    Wall.prototype.savePost = function() {
      var post,
        _this = this;
      if (this.msg.val().length > 2) {
        this.newPost.set({
          content: this.msg.val(),
          width: this.msg.width(),
          height: this.msg.height(),
          random: Math.random() > 0.5 ? Math.random() * 10 : Math.random() * -10
        });
        post = this.newPost.toJSON();
        posts.add(post);
        socket.emit('new', post);
        return this.frame.fadeOut(500, function() {
          _this.msgVisible = false;
          return _this.newPost.set({
            content: ''
          });
        });
      }
    };

    Wall.prototype.keyHandler = function(e) {
      switch (e.which) {
        case 27:
          this.frame.fadeOut();
          this.msgVisible = false;
          return this.newPost.set({
            content: ''
          });
        case 13:
          return this.savePost();
      }
    };

    Wall.prototype.stopPropagation = function(e) {
      return e.stopPropagation();
    };

    return Wall;

  })(Backbone.View);
  Post = (function(_super) {

    __extends(Post, _super);

    function Post() {
      Post.__super__.constructor.apply(this, arguments);
    }

    Post.prototype.clear = function() {
      return this.view.remove();
    };

    return Post;

  })(Backbone.Model);
  PostView = (function(_super) {

    __extends(PostView, _super);

    function PostView() {
      this.render = __bind(this.render, this);
      PostView.__super__.constructor.apply(this, arguments);
    }

    PostView.prototype.initialize = function() {
      return this.render();
    };

    PostView.prototype.template = _.template($('#post-template').html());

    PostView.prototype.cont = $('#container');

    PostView.prototype.render = function() {
      return this.cont.append(this.template(this.model.toJSON())).children().last().fadeIn();
    };

    return PostView;

  })(Backbone.View);
  PostCollection = (function(_super) {

    __extends(PostCollection, _super);

    function PostCollection() {
      this.addPost = __bind(this.addPost, this);
      PostCollection.__super__.constructor.apply(this, arguments);
    }

    PostCollection.prototype.initialize = function() {
      this.bind('add', this.addPost);
      return this.title = 'Yourwall - This Wall is for You All!';
    };

    PostCollection.prototype.model = Post;

    PostCollection.prototype.addPost = function(post) {
      var _this = this;
      new PostView({
        model: post
      });
      document.title = 'New Things on Your Wall!';
      return setTimeout((function() {
        return document.title = _this.title;
      }), 4000);
    };

    return PostCollection;

  })(Backbone.Collection);
  wall = new Wall;
  posts = new PostCollection;
  socket = io.connect();
  socket.on('posts', function(p) {
    var post, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = p.length; _i < _len; _i++) {
      post = p[_i];
      _results.push(posts.add(post));
    }
    return _results;
  });
  return socket.on('ready', function() {
    return $('#container').spin(false);
  });
});
