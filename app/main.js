// Party Member model.
var PartyMember = Backbone.Model.extend({
    initialize: function () {
        /*this.on('all', function(e) {
            console.log('PartyMember model: ' + this.get('name') + ' ' + e);
        });*/

        this.calcHits();
        this.calcLevel('exp');
        this.initialStats = _.clone(this.attributes);
        this.on('change:strength', this.calcHits, this);
        this.on('change:dexterity', this.calcCombat, this);
        //this.on('change:intelligence', this.calcMagic, this); //The link between Intelligence and Magic is indicated in the manual, but not in the game.
        this.on('change:magic', this.calcMana, this);
        this.on('change:level', this.calcTraining, this);
        this.on('change:level', this.calcLevel('exp'), this);
    },
    defaults: function () {
    /* 
     * Enlightening discussion about defaults with arrays and objects.
     * http://stackoverflow.com/questions/6433795/backbone-js-handling-of-attributes-that-are-arrays
     */
        return {
            magic: 0,
            mana: 0,
            trainedWithList: new Object()
        };
    },
    calcLevel: function(base) {
        if(base == 'exp') {
            var exp = this.get('exp');
            switch(true) {
                case (exp < 100):
                    this.set('level', 1);
                    break;
                case (exp >= 100 && exp < 200):
                    this.set('level', 2);
                    break;
                case (exp >= 200 && exp < 400):
                    this.set('level', 3);
                    break;
                case (exp >= 400 && exp < 800):
                    this.set('level', 4);
                    break;
                case (exp >= 800 && exp < 1600):
                    this.set('level', 5);
                    break;
                case (exp >= 1600 && exp < 3200):
                    this.set('level', 6);
                    break;
                case (exp >= 3200 && exp < 6400):
                    this.set('level', 7);
                    break;
                case (exp >= 6400 && exp < 12800):
                    this.set('level', 8);
                    break;
                case (exp >= 12800 && exp < 25600):
                    this.set('level', 9);
                    break;
                case (exp >= 25600 && exp < 51200):
                    this.set('level', 10);
                    break;
                case (exp >= 51200 && exp < 102400):
                    this.set('level', 11);
                    break;
                case (exp >= 102400 && exp < 204800):
                    this.set('level', 12);
                    break;
                case (exp >= 204800 && exp < 409600):
                    this.set('level', 13);
                    break;
                case (exp >= 409600 && exp < 819200):
                    this.set('level', 14);
                    break;
                case (exp >= 819200 && exp < 1638400):
                    this.set('level', 15);
                    break;
                case (exp >= 1638400):
                    this.set('level', 16);
                    break;
                default:
                    break;
            }
        } else {
            var level = this.get('level');
            switch(true) {
                case (level == 2):
                    this.set('exp', 100);
                    break;
                case (level == 3):
                    this.set('exp', 200);
                    break;
                case (level == 4):
                    this.set('exp', 400);
                    break;
                case (level == 5):
                    this.set('exp', 800);
                    break;
                case (level == 6):
                    this.set('exp', 1600);
                    break;
                case (level == 7):
                    this.set('exp', 3200);
                    break;
                case (level == 8):
                    this.set('exp', 6400);
                    break;
                case (level == 9):
                    this.set('exp', 12800);
                    break;
                case (level == 10):
                    this.set('exp', 25600);
                    break;
                case (level == 11):
                    this.set('exp', 51200);
                    break;
                case (level == 12):
                    this.set('exp', 102400);
                    break;
                case (level == 13):
                    this.set('exp', 204800);
                    break;
                case (level == 14):
                    this.set('exp', 409600);
                    break;
                case (level == 15):
                    this.set('exp', 819200);
                    break;
                case (level == 16):
                    this.set('exp', 1638400);
                    break;
                default:
                    this.set('exp', 0);
                    break;
            }
        }
    },
    calcTraining: function() {
        var oldLevel = this.previous('level');
        var newLevel = this.get('level');
        var difference = newLevel - oldLevel;
        this.set('training', this.get('training') + (difference * 3));
    },
    calcHits: function() {
        this.set('hits', this.get('strength'));
    },
    calcCombat: function() {
        var oldDexterity = this.previous('dexterity');
        var newDexterity = this.get('dexterity');
        var difference = newDexterity - oldDexterity;
        this.set('combat', this.get('combat') + difference);
    },
    calcMagic: function() {
        var oldIntelligence = this.previous('intelligence');
        var newIntelligence = this.get('intelligence');
        var difference = newIntelligence - oldIntelligence;
        this.set('magic', this.get('magic') + difference);
    },
    calcMana: function() {
        var oldMagic = this.previous('magic');
        var newMagic = this.get('magic');
        var difference = newMagic - oldMagic;
        this.set('mana', this.get('mana') + difference);
    },
    rangeCheck: function(attribute) {
        if(arguments.length === 0) {
            var original = this.initialStats;
            var keys = _.keys(original);
            var keyslen = keys.length;
            var current = this.attributes;
            for(i = 0; i < keyslen; i++) {
                key = keys[i];
                if(current[key] < original[key] && key !== 'training') {
                    this.set(key, original[key]);
                } else {
                    if ((key != 'exp' && key != 'level' && key != 'training') && current[key] > 30) {
                        this.set(key, 30);
                    } else if (key == 'level' && current[key] >= 16) {
                        this.set(key, 16);
                    } else if (key === 'training' && current[key] <= 0) {
                        this.set(key, 0);
                    }
                }
            }
        } else {
            if(this.get(attribute) == this.initialStats[attribute] && attribute !== 'training') {
                return 'lb';
            } else {
                if(attribute != 'exp' && attribute != 'level' && this.get(attribute) == 30) {
                    return 'ub';
                } else if(attribute == 'level' && this.get(attribute) == 16) { 
                    return 'ub';
                }
            }
        }
    },
    reset: function() {
        var original = this.initialStats;
        keys = _.keys(original);
        var keyslen = keys.length;
        var current = this.attributes;
        for(i = 0; i < keyslen; i++) {
            key = keys[i];
            if(!_.isEqual(current[key], original[key])) {
                this.set(key, original[key]);
            }
        }
        this.set('training', original['training']);
    },
    trainWith: function(data) {
        var self = this;
        var trainer = data[0];
        
        //kludge way to get trainer data
        for(i = 0; i < 18; i++) {
            if(trainerData[i]['name'] === trainer) {
                who = trainerData[i];
            }
        }
        
        if(data[1] === 0) { //left mouse click
            if(self.get('training') >= who.train) {
                self.set('training', self.get('training') - who['train']);
                var attributes = _.keys(who);
                _.each(attributes, function(attribute) {
                    if(!isNaN(self.get(attribute))) {
                        if(attribute != 'combat') { //only dealing with combat rubber band effect for now.
                            self.set(attribute, self.get(attribute) + who[attribute]);
                        } else if(who[attribute] != 0) {
                            var high = Math.max(self.get('dexterity'), self.get('combat'));
                            var low = Math.min(self.get('dexterity'), self.get('combat'));
                            var rubberband = Math.ceil((high -  low) / 2);
                            if(rubberband === 0) { rubberband = 1; }
                            self.set('combat', self.get('combat') + rubberband);
                        }
                    }
                });
            } else {
                console.log('not enought points');
            }
            
            // Add trainer to list.
            if(self.get('trainedWithList')[trainer]) {
                var currentCount = self.get('trainedWithList')[trainer];
                self.get('trainedWithList')[trainer] = currentCount + 1;
            } else {
                self.get('trainedWithList')[trainer] = 1
            }
            
        } else if(data[1] === 2) { // Right mouse click.
            
            // untrain stat magic goes here
            console.log('untrain');
            
            // Remove trainer from list.
            if(self.get('trainedWithList')[trainer]) {
                var currentCount = self.get('trainedWithList')[trainer];
                if(currentCount === 1) {
                    delete self.get('trainedWithList')[trainer];
                } else {
                    self.get('trainedWithList')[trainer] = currentCount - 1;
                }
            }
        }
    }
});

var Party = Backbone.Collection.extend({
    model: PartyMember,
    initialize: function() {
        /*this.on('all', function(e) {
            console.log('Party Collection: ' + e);
        });*/
    },
    getByName: function(name){
        return this.filter(function(member) {
            return member.get("name") === name;
        });
    }
});

// Trainer NPC model.
var Trainer = Backbone.Model.extend({
    initialize: function() {
        /*this.on('all', function(e) {
            console.log('Trainer model: ' + e);
        });*/
        this.calcValue();
    },
    calcValue: function() {
        var totalTraining = this.get('strength') + (this.get('dexterity') * 2) + this.get('intelligence') + this.get('combat') + this.get('magic');
        var value = totalTraining / this.get('train');
        var costValue = value / this.get('cost');
        this.set('value', value.toFixed(2));
        this.set('costValue', costValue.toFixed(2));
    }
});

var Trainers = Backbone.Collection.extend({
    initialize: function() {
        /*this.on('all', function(e) {
            console.log('Trainer Collection: ' + e);
        });*/
    },
    model: Trainer
});


/* 
 * Views
 * 
 * ParentView
 * |-MemberChooserView
 * |-MemberView
 * |-MemberListView
 * |-TrainerAutoSelectView
 * |-TrainerManualSelectView
 * |-TrainerListView
 * |-MapView
 *
 * Interesting discussion on where to render views: 
 * http://stackoverflow.com/questions/9271507/how-to-render-and-append-sub-views-in-backbone-js.
 */
 
//Member Selection
var MemberChooserView = Backbone.View.extend({
    el: '#memberChooser',
    initialize: function() {
        /*this.on('all', function(e) {
            console.log('Chooser View: ' + e);
        });*/
    },
    render: function() {
        var template = _.template($("#memberChooser-view").html());
        this.$el.html(template);
    },
    events: {
        'change': 'triggerMemberChange',
    },
    triggerMemberChange: function(evt) {
        this.trigger("memberChange", evt.target.value);
    }
});

// Member view
var MemberView = Backbone.View.extend({
    el: "#member",
    initialize: function(){
        this.on('all', function(e) {
            console.log('Member View: ' + e);
        });
        party.add(this.model);
        this.listenTo(this.model, 'change', this.render);
    },
    render: function(){
        var template = _.template($("#member-view").html(), {character: this.model});
        this.$el.html(template);
    },
    events: {
        'change input': 'changed',
        'click .increment': 'crement',
        'click .decrement': 'crement',
        'click #add': 'add',
        'click #reset': 'reset'
    },
    
    changed: function(evt) {
        var value = parseInt($(evt.currentTarget).val(), 10);
        this.model.set($(evt.currentTarget).attr('id'), value);
        if($(evt.currentTarget).attr('id') == 'exp') {
            this.model.calcLevel('exp');
        } else if ($(evt.currentTarget).attr('id') == 'level') {
            this.model.calcLevel('level');
        }
        this.model.rangeCheck();
    },
    crement: function(evt) {
        if(!$(evt.currentTarget).hasClass('disabled')) {
        $(evt.currentTarget).addClass('disabled');
            input = $(evt.currentTarget).parent().children('input');
            var value = input.val();
            if($(evt.currentTarget).hasClass('increment')) {
                input.val(++value);
            } else {
                input.val(--value);
            }
            this.model.set(input.attr('id'), value);
            if(input.attr('id') == 'exp') {
                this.model.calcLevel('exp');
            } else if (input.attr('id') == 'level') {
                this.model.calcLevel('level');
            }
            this.model.rangeCheck();
        }
    },
    reset: function() {
        this.model.reset();
    }
});

// Member List
var MemberListView = Backbone.View.extend({
    el: "#memberList",
    initialize: function() {
        this.on('all', function(e) {
            console.log('Member List View: ' + e);
        });
        this.listenTo(party, 'all', this.render);
    },
    render: function(){
        var template = _.template($("#memberList-view").html(), {party: party.toJSON()});
        this.$el.html(template);
    },
    events: {
        'click img': 'removeMember'
    },
    removeMember: function(evt) {
        if(evt.target.id != "Avatar") {
            party.remove(party.getByName(evt.target.id));
        }
    }
});
 


// Trainer Select view.
var TrainerSelectView = Backbone.View.extend({
    el: "#trainerSelect",
    initialize: function(){
        this.on('all', function(e) {
            console.log('Trainer Select View: ' + e);
        });
        this.listenTo(this.model, 'change', this.render);
    },
    render: function(){
        var template = _.template($("#trainerSelect-view").html(), {trainers: trainers.toJSON(), character: this.model});
        this.$el.html(template);
    },
    events: {
        'mousedown tr': 'triggerTrainWith'
    },
    triggerTrainWith: function(evt) {
        console.log('trainWith trigger');
        this.model.trainWith([$(evt.target).parent().attr('id'), evt.button])
        //this.trigger("trainWith", [$(evt.target).parent().attr('id'), evt.button]);
    }
});



// Trainer List view.
var TrainerListView = Backbone.View.extend({
    el: "#trainerList",
    initialize: function(){
        this.on('all', function(e) {
            console.log('Trainer List View: ' + e);
        });
    },
    render: function(){
        var template = _.template($("#trainerList-view").html());
        this.$el.html(template);
    },
});

// Map view.
var MapView = Backbone.View.extend({
    el: "#map",
    initialize: function(){
        this.on('all', function(e) {
            console.log('Map View: ' + e);
        });
    },
    render: function(){
        var template = _.template($("#map-view").html());
        this.$el.html(template);
    },
});


var ParentView = Backbone.View.extend({
    el: '#notfooter',
    initialize: function() {
        /*this.on('all', function(e) {
            console.log('Parent View: ' + e);
        });*/
        
        // Views
        this.memberChooser = new MemberChooserView();
        this.member = new MemberView({model: Avatar});
        this.memberList = new MemberListView();
        this.trainerSelect = new TrainerSelectView({model: Avatar});
        this.trainerList = new TrainerListView();
        this.map = new MapView();

        // Listeners
        this.listenTo(this.memberChooser, "memberChange", this.memberChange);
    },
    render: function() {
        this.memberChooser.render();
        this.member.render();
        this.memberList.render();
        this.trainerSelect.render();
        this.trainerList.render();
        this.map.render();
        $(".sortable").tablesorter({sortInitialOrder: 'desc'});
        return this;
    },
    memberChange: function(name) {
        this.member.undelegateEvents();
        this.trainerSelect.undelegateEvents();
        this.member = new MemberView({model: window[name]});
        this.trainerSelect = new TrainerSelectView({model: window[name]});
        this.member.render();
        this.trainerSelect.render();
    }
});






$(document).ready(function() {
    // Disables normal right click menu because right click is used to untrain a party member.
    document.oncontextmenu = function() { return false; };
    
    // Start the application.
    app = new ParentView();
    app.render();
    
    
});



//references
//http://infinitron.nullneuron.net/u7char.html
//http://strategywiki.org/wiki/Ultima_VII:_The_Black_Gate/Trainers

function findTrinerOptions(attribute) {
    tp = character.model.get('training');
    whos = [];
    for(i = 0; i < 18; i++) {
        if(trainerData[i][attribute] > 0 && trainerData[i]['train'] <= tp) {
            whos.push(trainerData[i]);
        }
    }
    whos = _(whos).sortBy(function(who) {
        return who.attribute;
    });
    list = [];
    _(whos).each(function(who) { list.push(who.name); });
    return list;
}


function trainWith(trainer) {
    var partyMember = character.model;
    var who;
    if(partyMember.get('training') > 0) {
        for(i = 0; i < 18; i++) {
            if(trainerData[i]['name'] === trainer) {
                who = trainerData[i];
            }
        }
        partyMember.set('training', partyMember.get('training') - who['train']);
        var attributes = _.keys(who);
        _.each(attributes, function(attribute) {
            if(!isNaN(partyMember.get(attribute))) {
                if(attribute != 'combat') { //only dealing with combat rubber band effect for now.
                    partyMember.set(attribute, partyMember.get(attribute) + who[attribute]);
                } else if(who[attribute] != 0) {
                    var high = Math.max(partyMember.get('dexterity'), partyMember.get('combat'));
                    var low = Math.min(partyMember.get('dexterity'), partyMember.get('combat'));
                    var rubberband = Math.ceil((high -  low) / 2);
                    if(rubberband === 0) {
                        rubberband = 1;
                    }
                    console.log(rubberband);
                    partyMember.set('combat', partyMember.get('combat') + rubberband);
                }
            }
        });
    }
}















