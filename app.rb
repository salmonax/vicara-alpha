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
  haml :root
end

__END__

@@ layout
!!!5
%html
  %head
  %body
    =yield

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