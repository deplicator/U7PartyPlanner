Ultima VII Party Planner
========================
This is a project designed to take some of the pain out of training party members in [Ultima VII: The
Black Gate](http://en.wikipedia.org/wiki/Ultima_VII:_The_Black_Gate). For what it does, this is an 
over-engineered monstrosity. The intention of this project was a learning exercise (primarily 
backbone.js). What I thought was going to be a simple little program turned out to be complicated. 
Complicated for me anyway.

There is a very small niche community of five to ten people that might find this interesting but not
terribly useful.

There are known bugs/unimplemented features/unintuitive interface glitches but I love feedback! If 
you have an opinion from the perspective of an Ultima fan or fellow coder please let me know (I need
all the help I can get).

How to Use
----------
### Choose Party Member
When you choose a party member from the drop down they are automatically added to the party (see 
Current Party below). New members will have the same stats they start with in the game.

###Party Member Stats
Directly below Choose Party Member is the chosen party member's current stats. They can be manually
manipulated with the + and - buttons on either side of the stat, or they can be typed in. Stats will
be saved for each party member until the reset button is pressed or the page is reloaded. The reset
button only effects the displayed member.

###Current Party
This box shows who you have selected to be in the party. Clicking on a member will change the main
view back to that member. Right clicking will dismiss them.

Accidentally dismissing a party member does not reset their training and stats. They can be added
back by selecting them again in the Choose Party Member drop-down.

###Select Trainers
If the party member has sufficient training points, clicking on a trainer will update the member 
stats to reflect training with that trainer. You can click on the same trainer multiple times. Right
clicking will undo the training. Undoing the training from a trainer will undo subsequent trains 
made (for example if you choose to train with Markus then with Lucky, and then untrain with Markus,
both trainers will be undone).

As you select trainers the Trainer Checklist and Map sections will populate automatically.

###Trainer Checklist
This is a list of trainers to visit and which party members to train when you get there. Cost per
trainer is provided next to the trainer's name. Total cost of all training is at the top. This does
not yet account for nuances in training order, so keep that in mind.

###Map
A dot on the map depicts the location of a trainer on the checklist. Hover over the dot or trainer
name to see which dots correlate to which trainer.


references
----------
[Starting stats for all party members.](http://infinitron.nullneuron.net/u7char.html)  
[Trainer's stats and explination of 'rubberband effect'.](http://strategywiki.org/wiki/Ultima_VII:_The_Black_Gate/Trainers)  
[Trainer specific formulas.](http://geocities.bootstrike.com/Ultima%20Thule!/u7train.html)  
[A nice U7 map.](http://www.ultimainfo.net/Maps/U7Maps.htm)  