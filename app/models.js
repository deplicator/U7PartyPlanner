// Party Member model.
var PartyMember = Backbone.Model.extend({
    initialize: function () {
        /*this.on('all', function(e) {
            console.log('PartyMember model: ' + this.get('name') + ' ' + e);
        });*/
        this.calcHits();
        this.calcLevel('exp');
        this.initialStats = _.clone(this.attributes);
        this.updateStatHistory('initial', _.clone(this.attributes));
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
            trainedWithList: new Object(), //change to training history to undo training properly.
            trainingCount: 0,
            statHistory: new Object()
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
    updateStatHistory: function(trainer) {
    /**
     * Updates statHistory object with each trainer so training can be undone. Originally attempted
     * to calculate the rubberband effect in reverse, but it's not possible on subsequent trains.
     * @param trainer string    Most recent trainer.
     */
        this.get('statHistory')[this.get('trainingCount')] = new Object();
        this.get('statHistory')[this.get('trainingCount')]['trainer'] = trainer;
        this.get('statHistory')[this.get('trainingCount')]['combat'] = this.get('combat');
        this.get('statHistory')[this.get('trainingCount')]['dexterity'] = this.get('dexterity');
        this.get('statHistory')[this.get('trainingCount')]['intelligence'] = this.get('intelligence');
        this.get('statHistory')[this.get('trainingCount')]['magic'] = this.get('magic');
        this.get('statHistory')[this.get('trainingCount')]['strength'] = this.get('strength');
        this.get('statHistory')[this.get('trainingCount')]['training'] = this.get('training');
        
        
        this.set('trainingCount', this.get('trainingCount') + 1);

        
    },
    rollBackStatHistory: function(trainer) {
    /**
     * Because of the rubberband effect, training order becomes important. For example, is Spark
     * trains with Markus, it only cost 1 training point but Spark's combat moves up 6 (10 to 16).
     * This happens because Sparks dexterity is much higher than his combat and these stats are 
     * linked. On the other hand, if Spark were to train with Karenna first, then Markus, his combat
     * increase is 8 from Karenna, then 3 from Markus. To solve the untraining problem, the party
     * member model saves stat history. When untraining, stat history is rolled back. If the user
     * untrains with a previous trainer, subsequent training must also be undone. Using the previous
     * example, after training with Karenna and Markus, if the user untrains with Karenna they will
     * also be untrained with Markus.
     * @param trainer string    Most recent trainer.
     */
        var trains = this.get('trainingCount') - 1;
        for(i = trains; i > 0; i--) {
            
        }
     
    },
    trainWith: function(data) {
    /**
     * Updates party member model with trainer's information. Should be equivalent to training in
     * the game. The rubberband effect is calculated as half the absolute value of the difference
     * between the primary and secondary stat rounded up (or something close to that). Referenced 
     * from http://strategywiki.org/wiki/Ultima_VII:_The_Black_Gate/Trainers.
     * @param data array    Index zero is trainer model id, index one is mouse button number from
     *                      click event. Right click is 0 and is used to train party member. Left
     *                      click is 2 and used to roll back training (see rollBackStatHistory 
     *                      function for details).
     *
     * Needs more in game testing with rubberband effect. With 10 potential party members, 18
     * trainers, uncertain number of training points, and training order a factor: there are a lot 
     * of permutations.
     */
        var self = this;
        var trainer = trainers.get(data[0]);
        
        if(data[1] === 0) { // Left mouse click trains.
            if(self.get('training') >= trainer.get('train')) {
                self.set('training', self.get('training') - trainer.get('train'));
                self.set('strength', self.get('strength') + trainer.get('strength'));
                self.set('dexterity', self.get('dexterity') + trainer.get('dexterity'));
                self.set('intelligence', self.get('intelligence') + trainer.get('intelligence'));
                
                //self.set('combat', self.get('combat') + trainer.get('combat'));
                self.set('magic', self.get('magic') + trainer.get('magic'));
                
                if(trainer.get('combat') > 0) {
                    var high = Math.max(self.get('dexterity'), self.get('combat'));
                    var low = Math.min(self.get('dexterity'), self.get('combat'));
                    var rubberband = Math.ceil((high -  low) / 2);
                    if(rubberband === 0) { rubberband = 1; }
                    self.set('combat', self.get('combat') + rubberband);
                }
                
                // Add trainer to statHistory.
                self.updateStatHistory(trainer.get('name'));
                
                // add trainer to old list, to be removed
                if(self.get('trainedWithList')[trainer.get('name')]) {
                    var currentCount = self.get('trainedWithList')[trainer.get('name')];
                    self.get('trainedWithList')[trainer.get('name')] = currentCount + 1;
                } else {
                    self.get('trainedWithList')[trainer.get('name')] = 1
                }
            } else {
                console.log('not enought points');
            }
        } else if(data[1] === 2) { // Right mouse click, untrain.
            if(self.get('trainedWithList')[trainer.get('name')]) {
                //restore current stats from history
                
                self.set('training', self.get('training') + trainer.get('train'));
                self.set('strength', self.get('strength') - trainer.get('strength'));
                self.set('dexterity', self.get('dexterity') - trainer.get('dexterity'));
                self.set('intelligence', self.get('intelligence') - trainer.get('intelligence'));

                self.set('combat', self.get('combat') - trainer.get('combat'));
                self.set('magic', self.get('magic') - trainer.get('magic'));
                
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

// Party Collection - Members in party are added to this collection.
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

// Trainer Model.
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

// Trainer collection - all trainers are in this collection... for some reason.
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
