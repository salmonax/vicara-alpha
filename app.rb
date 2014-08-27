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
  Sinatra Minimal
  --
  - redcarpet for inline markdown
  - thin server
  - sessions enabled, dotenv for .env loading
  - rack/guard-livereload for extensionless reloading
  - Procfile for Heroku
