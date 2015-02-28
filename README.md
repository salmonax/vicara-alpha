Welcome to Vicara
==
Description
--
Vicara is a time-keeping system for autodidacts, inspired by the pomodoro technique. It uses a simple text file (a "pomsheet") and a very basic syntax, to allow monolithic time tracking with minimal effort. 

Features:
--
- Treemap visualization
- Poms-per-day targeting and a "turnip" pacer
- Ability to Grep the text file from the web interface
- Mini-map

To Do:
--
- Ubiquitous timer
- Functional mobile interface
- Pomsheet modification from the web interface

How The System Works
--
Here are an example of tag definitions, used for organizing broad "areas of focus":

    C Coding and Tools-related
    R Rails and Ruby (Reading/Coding/Testing)
    D Desktop Power-user
    F Friendship (Requested/Proactive)
    W Front-end Web Development

    ! Milestone
    ^ De-procrastination (Lapse/Hiatus)
    & Practical (Proactive/Urgent)
    ~ Waffling Obsession (Obstacular/Malingering)

And here is an example of a busy day with the pomsheet:

    5/21/2014

    0.5 &WW^ Workthrough: SEL Html 5 -> 29% X
    1.5 & Renoise: read forums on secondary highlighting, 3.0 release notes X
    3 &E Read: The Launchpad -> 22% X
    3.5 &DD Virtualization: get VMware running Windows 7, troubleshoot lack of 3D support  X
    4 &DD Virtualization: noodle through driver issues, add PPA's and try to install drivers X
    5 &DD! Virtualization: enable SNA, abandon VMware, test Space Shooter in Chrome, better! X

    6 &RR Opal: see how D3 class works again, continue animation chaining     X
    7 &RR Opal: get animation chaining to work ala tutorial! Try imitating #on behavior X
    8 &RR! Opal: fix animation chaining in functionless condition, try mixed chaining   X
    8.5 &RR Opal: ponder when to toggle on_branch_already, relent on mixed, remove debug lines X
    9 ~W Opal: start binding example, question wrapper viability while looking at docs  X

    10.5  &^ Fiction Read: Snowcrash -> 60 X

    20.5  &CCF Scala: Install Eclipse, get "Hello World" to compile and worksheet output    X
    21  &CCF Scala: work through the example tutorial and figure out how to import projects X
    21.5  &CF Scala: get tests running in Eclipse, work through b-tree X 

    22  &DD Scala: fix swap partition, verify sbt and Eclipse will run simultaneously  X
    22.5  &D Ubuntu: read about keyring issue, try a few things, delete the damn thing  X   

Dates get their own line, written in M/D/YYYY format.

The task lines have the following properties:

- The number at the beginning of each line is the time, estimated to the nearest half-hour. For example, 6:30pm would be written as "18.5", 8am would be written as "8". This is the time at which a session of pomodoros is FINISHED.
- The time is optionally followed by a short tag (eg. "&CCF"). By convention, symbol tags delineate momentum and motivation tags (eg. "Waffling Obsession" for "~") while letters delineate subject areas. Also by convention, single letter tags denote input, double letters denote output. For example, "R" would typically mean reading about Ruby, "RR" would mean programming in Ruby. Tags can be whatever you want.
- The single-letter tag is optionally followed by a category definition  (ie. "Scala" or "Opal"), a description of the task, and the number of poms spent on the task.
- A hash rocket can be affixed to names of books to indicate the position the last page read during a pom session.

Disclaimer: Please use this at your discretion. It is currently only intended for personal use!
