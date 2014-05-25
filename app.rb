require 'sinatra'
require 'dropbox_sdk'
require 'haml'

if development?
  require 'sinatra/reloader'
  require 'dotenv'
  Dotenv.load
end

enable :sessions
set :session_secret, ENV['SESSION_SECRET']

get "/" do 
  haml :root
end

get "/ajax" do
  haml :ajax
end

get "/start" do
  "It begins."
  # haml :start, :layout => (request.xhr? ? false : :layout)
end

get "/stop" do
  "It has ended."
end

__END__

@@ layout
%html
  %head
    %title Naomi Diaspora
    %script{type: "text/javascript", 
            src: "http://code.jquery.com/jquery-2.1.0.min.js"}
    %script{type: "text/javascript",
            src: "https://raw.githubusercontent.com/odyniec/jQuery-tinyTimer/master/jquery.tinytimer.min.js"}
    %link{ rel:"stylesheet", href:"/stylesheets/naomi.css"}
  %body
    =yield

@@ root
#timer hello.
:css

  #timer {
    background: lightsteelblue;
    text-align: center;
    height: 200px;
    line-height: 200px;
    width: 400px;
  }

:javascript

  var d = new Date();

  $('#timer').on('click', function(event) { d.setMinutes(d.getMinutes() + 25); $('#timer').tinyTimer({ to: d }); });

@@ ajax
#message
:javascript
  $(document).ready(function(){
    $("#start").click(function(){
      $.ajax( {url:"/start", success:function(result) {
          $("#message").html(result);
        }});
      });
    $("#stop").click(function() { 
      $.ajax( {url:"/stop", success:function(result) {
          $("#message").html(result);
        }});
      });
  });
%button#start Start
%button#stop Stop