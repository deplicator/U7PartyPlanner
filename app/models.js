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
        //The link between Intelligence and Magic is indicated in the manual, but not in the game.
        //this.on('change:intelligence', this.calcMagic, this);
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
        var self = this;
        var keys = _.keys(self.initialStats);
        _.each(keys, function (key) {
            self.set(key, self.initialStats[key]);
        });
        this.set('trainedWithList', new Object());
    },
    trainWith: function(data) {
        var self = this;
        var trainer = trainers.get(data[0]);
        
        if(data[1] === 0) { // Left mouse click.
            if(self.get('training') >= trainer.get('train')) {
                self.set('training', self.get('training') - trainer.get('train'));
                var attributes = _.keys(trainer.attributes);
                _.each(attributes, function(attribute) {
                    if(!isNaN(self.get(attribute))) {
                        if(attribute != 'combat') { //only dealing with combat rubber band effect for now.
                            self.set(attribute, self.get(attribute) + trainer.get(attribute));
                        } else if(trainer.get(attribute) != 0) {
                            var high = Math.max(self.get('dexterity'), self.get('combat'));
                            var low = Math.min(self.get('dexterity'), self.get('combat'));
                            var rubberband = Math.ceil((high -  low) / 2);
                            if(rubberband === 0) { rubberband = 1; }
                            self.set('combat', self.get('combat') + rubberband);
                        }
                    }
                });
                // Add trainer to list.
                if(self.get('trainedWithList')[trainer.get('name')]) {
                    var currentCount = self.get('trainedWithList')[trainer.get('name')];
                    self.get('trainedWithList')[trainer.get('name')] = currentCount + 1;
                } else {
                    self.get('trainedWithList')[trainer.get('name')] = 1
                }
            } else {
                console.log('not enought points');
            }
        } else if(data[1] === 2) { // Right mouse click.
            if(self.get('trainedWithList')[trainer.get('name')]) {
            
                // untrain stat magic goes here
                self.set('training', self.get('training') + trainer.get('train'));
                var attributes = _.keys(trainer.attributes);
                _.each(attributes, function(attribute) {
                    if(!isNaN(self.get(attribute))) {
                    
                    //ignoring combat causing problems when untraining.
                    //when dex is decremented by 2 (untraning with Bradman) combat is ignored, only dex is reset
                    //combat is then reduced by the else statement by more than 2
                    //may need to rejigger this to handle trainers with magic and combat separate from the others
                    //only 4 of 18 trainers do not train either magic or combat
                    
                        if(attribute != 'combat') { //only dealing with combat rubber band effect for now.
                            self.set(attribute, self.get(attribute) - trainer.get(attribute));
                        } else {
                            var high = Math.max(self.get('dexterity'), self.get('combat'));
                            var low = Math.min(self.get('dexterity'), self.get('combat'));
                            var rubberband = Math.floor((high -  low) / 2);
                            if(rubberband === 0) { rubberband = 0; }
                            self.set('combat', self.get('combat') - rubberband);
                        }
                    }
                });
                
                // Remove trainer from list.
                var currentCount = self.get('trainedWithList')[trainer.get('name')];
                if(currentCount === 1) {
                    delete self.get('trainedWithList')[trainer.get('name')];
                } else {
                    self.get('trainedWithList')[trainer.get('name')] = currentCount - 1;
                }
            }
        }
        // Trigger model change because for some reason it doesn't do that.
        this.trigger('change');
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
            return member.get('name') === name;
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
    model: Trainer,
    initialize: function() {
        /*this.on('all', function(e) {
            console.log('Trainer Collection: ' + e);
        });*/
    },
    getByName: function(name){
        //this returns the model, but something is not right with it.
        return this.filter(function(trainer) {
            return trainer.get('name') === name;
        });
    }
});
