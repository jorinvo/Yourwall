
# jQuery is required...
$ ->

  #Extending jQuery with spin.js
  $.fn.spin = (opts) ->
    @each ->
      $this = $(this)
      data = $this.data()
      if data.spinner
        data.spinner.stop()
        delete data.spinner
      if opts isnt false
        data.spinner = new Spinner($.extend(
          color: "#FFF"
        , opts)).spin(this)

    this


  #Smooth loading

  $('#container')
    .fadeIn(600)
    .delay(600)
    .spin
      lines: 10
      length: 11
      width: 4
      radius: 10
      color: '#FFF'
      speed: '0.9'
      trail: 58
      shadow: false

  
  #fadeDown menu
  $("#menu").animate(top: 0)

  #Settings for underscore-templates
  #using {{data}} instead of <%= data %>
  _.templateSettings =
    interpolate: /\{\{(.+?)\}\}/g


  class Wall extends Backbone.View

    el: 'body'

    msgVisible: no

    initialize: ->

      #set the defaults for the new post
      @newPost = new Post
        content: ''
        font: 'Sniglet'
        size: 20
        color: '#fff'
        position: { x: 10, y: 10 }

      #binding methods changing the view to
      #model changes
      @newPost.bind 'change:content', @renderContent
      @newPost.bind 'change:size', @renderSize
      @newPost.bind 'change:color', @renderColor
      @newPost.bind 'change:font', @renderFont
      @newPost.bind 'change:position', @renderPosition

      #caching some jQuery-elements
      @msg = $('#message input')
      @frame = $('#message')
      @slider = $('#size')
      
      #enable jQuery-UI functionality
    
      @frame.draggable
        containment: 'parent'
        delay: 150
        distance: 8
        cursor: 'move'

      @slider.slider
        animate: on
        value: 17
        max: 35
        min: 10

      $('#colorPicker').selectable()

      $('#fontPicker').selectable()



    renderContent: =>
      @msg.val @newPost.get('content')


    renderSize: =>
      oldWidth = 0.5 * @msg.width()
      @msg
        .css( fontSize: @newPost.get('size') )
        .css( left: @msg.position().left + oldWidth - 0.5 * @msg.width() )

    renderColor: =>
      #using jQueryUI color-animation
      @msg.animate( color: @newPost.get('color') )

    renderFont: =>
      @msg.css( fontFamily: @newPost.get('font') )

    renderPosition: =>
      pos = @newPost.get('position')
      @frame.animate
          left: pos.x - 32
          top: pos.y
      if not @msgVisible
        @frame.fadeIn 400, => @msg.focus()
        @msgVisible = yes


    events:
      'slidechange #size'               : 'resizeNFocus'
      'slide #size'                     : 'resize'
      'selectableselected #colorPicker' : 'changeColor'
      'selectableselected #fontPicker'  : 'changeFont'
      'click #clickable'                : 'changePosition'
      'dragstop #message'               : 'dragHandler'
      'click #submit'                   : 'savePost'
      'keydown #message'                : 'keyHandler'
      'click #message'                  : 'stopPropagation'


    resize: ->
      @newPost.set( size: @slider.slider('value') )

    resizeNFocus: ->
      @resize()
      @msg.focus()

    changeColor: (e, ui) ->
      @newPost.set
        color: $(ui.selected).css('background-color')

    changeFont: (e, ui) ->
      @newPost.set
        font: $(ui.selected).css('font-family')

    changePosition: (e) ->
      @newPost.set position:
        x: e.pageX - @msg.width() / 2 - $('#container').position().left
        y: e.pageY - 100 - 0.5 * @frame.height()
      @msg.focus()

    dragHandler: (e) ->
      @newPost.set position:
        x: @frame.position().left + 32
        y: @frame.position().top
      @msg.focus()


    savePost: ->
      if @msg.val().length > 2
        @newPost.set
          content: @msg.val()
          width: @msg.width()
          height: @msg.height()
          random: if (Math.random() > 0.5) then Math.random() * 10 else Math.random() * -10
        post = @newPost.toJSON()
        posts.add( post )
        socket.emit 'new', post
        @frame.fadeOut 500, =>
          @msgVisible = no
          @newPost.set( content: '' )


    keyHandler: (e) ->

      switch e.which
        when 27
          @frame.fadeOut()
          @msgVisible = no
          @newPost.set( content: '' )

        when 13
          @savePost()


    stopPropagation: (e) -> e.stopPropagation()



  class Post extends Backbone.Model

    clear: ->
        @view.remove()


  class PostView extends Backbone.View

    initialize: ->
      @render()

    template: _.template( $('#post-template').html() )

    cont: $('#container')



    render: =>

      @cont
      .append( @template @model.toJSON() )
      .children().last().fadeIn()



  class PostCollection extends Backbone.Collection

    initialize: ->
      @bind 'add', @addPost
      @title = 'Yourwall - This Wall is for You All!'

    model: Post

    addPost: (post) =>
      new PostView( model: post )
      document.title = 'New Things on Your Wall!'
      setTimeout (=> document.title = @title), 4000

  
  wall = new Wall
  posts  = new PostCollection



  #Socket.io

  socket = io.connect()


  socket.on 'posts', (p) ->
    for post in p
      posts.add post


  socket.on 'ready', ->
    $('#container').spin( false )