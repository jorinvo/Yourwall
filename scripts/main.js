var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
$(function() {
  var Post, PostCollection, PostView, Wall, posts, wall;
  $('#container').hide().delay(800).fadeIn(800);
  $("#menu").hide().delay(1000).slideDown(500);
  $('#message').hide();
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };
  Wall = (function() {
    __extends(Wall, Backbone.View);
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
        content: 'whats up',
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
      this.msg = $('#message');
      this.slider = $('#size');
      this.slider.slider({
        animate: true,
        value: 20,
        max: 60,
        min: 10
      });
      $('#colorPicker').selectable();
      return $('#fontPicker').selectable();
    };
    Wall.prototype.renderContent = function() {
      return this.msg.text(this.newPost.get('content'));
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
      var pos;
      pos = this.newPost.get('position');
      this.msg.animate({
        left: pos.x,
        top: pos.y
      });
      if (!this.msgVisible) {
        this.msg.fadeIn().delay(600).focus();
        return this.msgVisible = true;
      }
    };
    Wall.prototype.events = {
      'slidechange #size': 'resize',
      'slide #size': 'resize',
      'selectableselected #colorPicker': 'changeColor',
      'selectableselected #fontPicker': 'changeFont',
      'click #container': 'changePosition',
      'click #submit': 'savePost',
      'keydown #message': 'keyHandler',
      'click #message': 'stopPropagation'
    };
    Wall.prototype.resize = function() {
      return this.newPost.set({
        size: this.slider.slider('value')
      });
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
      return this.newPost.set({
        position: {
          x: e.pageX - $(e.currentTarget).position().left - 2 - 0.5 * this.msg.width(),
          y: e.pageY - 102 - 0.5 * this.msg.height()
        }
      });
    };
    Wall.prototype.savePost = function() {
      posts.add(this.newPost.toJSON());
      this.msg.fadeOut() && (this.msgVisible = false);
      return this.newPost.set({
        content: ''
      });
    };
    Wall.prototype.keyHandler = function(e) {
      var m;
      if (e.which === 13 && !e.shiftKey) {
        e.preventDefault();
        return savePost();
      } else if (e.which === 27) {
        this.msg.fadeOut();
        this.msgVisible = false;
        return this.newPost.set({
          content: ''
        });
      } else {
        m = this.msg.text();
        if (m.length < 50 || e.which === 8) {
          return this.newPost.set({
            content: m
          }, {
            silent: true
          });
        } else {
          e.preventDefault();
          return alert('to long ya dong');
        }
      }
    };
    Wall.prototype.stopPropagation = function(e) {
      return e.stopPropagation();
    };
    return Wall;
  })();
  Post = (function() {
    __extends(Post, Backbone.Model);
    function Post() {
      Post.__super__.constructor.apply(this, arguments);
    }
    Post.prototype.clear = function() {
      return this.view.remove();
    };
    return Post;
  })();
  PostView = (function() {
    __extends(PostView, Backbone.View);
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
      return this.cont.append(this.template(_.extend(this.model.toJSON(), {
        random: Math.random() > 0.5 ? Math.random() * 10 : Math.random() * -10
      })));
    };
    return PostView;
  })();
  PostCollection = (function() {
    __extends(PostCollection, Backbone.Collection);
    function PostCollection() {
      PostCollection.__super__.constructor.apply(this, arguments);
    }
    PostCollection.prototype.initialize = function() {
      return this.bind('add', this.checkLength);
    };
    PostCollection.prototype.model = Post;
    PostCollection.prototype.checkLength = function(post) {
      return new PostView({
        model: post
      });
    };
    return PostCollection;
  })();
  wall = new Wall;
  return posts = new PostCollection;
});