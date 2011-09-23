
# jQuery is required...
$ ->

  $('#container').hide().delay(800).fadeIn(800)
  $("#menu").hide().delay(1000).slideDown(500)
  $('#message').hide()

  _.templateSettings = 
    interpolate: /\{\{(.+?)\}\}/g

  class Wall extends Backbone.View

    el: 'body'

    msgVisible: no

    initialize: ->
      @newPost = new Post
        content: 'whats up'
        font: 'Sniglet'
        size: 20
        color: '#fff'
        position: { x: 10, y: 10 }
      @newPost.bind 'change:content', @renderContent
      @newPost.bind 'change:size', @renderSize
      @newPost.bind 'change:color', @renderColor
      @newPost.bind 'change:font', @renderFont
      @newPost.bind 'change:position', @renderPosition
      @msg = $('#message')
      @slider = $('#size')
      @slider.slider
        animate: on
        value: 20
        max: 60
        min: 10
      $('#colorPicker').selectable()
      $('#fontPicker').selectable()

    renderContent: =>
      @msg.text @newPost.get('content')


    renderSize: =>
      oldWidth = 0.5 * @msg.width()
      @msg
        .css( fontSize: @newPost.get('size') )
        .css( left: @msg.position().left + oldWidth - 0.5 * @msg.width() )

    renderColor: =>
      @msg.animate( color: @newPost.get('color') )

    renderFont: =>
      @msg.css( fontFamily: @newPost.get('font') )

    renderPosition: =>
      pos = @newPost.get('position')
      @msg.animate
          left: pos.x
          top: pos.y
      if not @msgVisible
        @msg.fadeIn().delay(600).focus()
        @msgVisible = yes


    events:
      'slidechange #size'               : 'resize'
      'slide #size'                     : 'resize'
      'selectableselected #colorPicker' : 'changeColor'
      'selectableselected #fontPicker'  : 'changeFont'
      'click #container'                : 'changePosition'
      'click #submit'                   : 'savePost'
      'keydown #message'                : 'keyHandler'
      'click #message'                  : 'stopPropagation'

    resize: ->
      @newPost.set( size: @slider.slider('value') )
      
    changeColor: (e, ui) ->
      @newPost.set
        color: $(ui.selected).css('background-color')

    changeFont: (e, ui) ->
      @newPost.set
        font: $(ui.selected).css('font-family')

    changePosition: (e) ->
      @newPost.set position: 
        x: e.pageX - $( e.currentTarget ).position().left - 2 - 0.5 * @msg.width()
        y: e.pageY - 102 - 0.5 * @msg.height()

    savePost: ->
      posts.add( @newPost.toJSON() )
      @msg.fadeOut() and @msgVisible = no
      @newPost.set( content: '' )

    keyHandler: (e) ->
      if e.which is 13 and not e.shiftKey
        e.preventDefault()
        savePost()
      else if e.which is 27
          @msg.fadeOut()
          @msgVisible = no
          @newPost.set( content: '' )
      else
        m = @msg.text()
        if m.length < 50 or e.which is 8
          @newPost.set( {content: m}, {silent: yes} )
        else 
          e.preventDefault()
          alert 'to long ya dong'
      #
      #   ckeck for img

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

      @cont.append @template _.extend( @model.toJSON(), random: if (Math.random() > 0.5) then Math.random() * 10 else Math.random() * -10)



  class PostCollection extends Backbone.Collection

    initialize: ->
      @bind 'add', @checkLength

    model: Post
    # addNew
    #   check for length -> remove 1
    #   add -> render
    #   emit to server
    # get from server
    #   check for length -> remove 1
    #   add -> render

    checkLength: (post) ->
      new PostView( model: post )

       # @models.shift() if @length > 5
 # 


  wall = new Wall
  posts  = new PostCollection


