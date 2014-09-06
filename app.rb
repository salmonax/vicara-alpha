require 'sinatra'
require 'redcarpet'

if development?
  require 'sinatra/reloader'
  require 'dotenv'
  Dotenv.load
end

enable :sessions
set :session_secret, ENV['SESSION_SECRET']

get "/" do 
  haml :sandbox
end

get "/sandbox" do
  haml :sandbox
end

__END__

@@ layout
!!!5
%html
  %head
    %script{src:"/javascripts/jquery-2.1.0.min.js"}
    %script{src:"/javascripts/d3.v3.min.js"}
    %link{rel:"stylesheet", href:"/stylesheets/vicara.css"}
  %body
    =yield
  %script{src:"/javascripts/vicara.js"}

@@ root
:markdown
  Welcome to Sinatra Minimal, a simple starter kit!
  ==
  Features:
  --
  - redcarpet for inline markdown
  - thin for webserver
  - sessions enabled, dotenv for .env loading
  - rack/guard-livereload for extensionless reloading
  - pushable to Heroku out of the box

@@ sandbox
#sandbox.gradient
  #bottom-half