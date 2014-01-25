// Party Member model.
var PartyMember = Backbone.Model.extend({
    initialize: function () {
    
        // Model setup methods
        this.calcHits();
        this.calcLevel('exp');
        this.initialStats = _.clone(this.attributes);
        this.updateStatHistory('initial', _.clone(this.attributes));
        
        // Listeners
        this.on('change:strength', this.calcHits, this);
        this.on('change:dexterity', this.calcCombat, this);
        //The link between Intelligence and Magic is indicated in the manual, but not in the game.
        //this.on('change:intelligence', this.calcMagic, this);
        this.on('change:magic', this.calcMana, this);
        this.on('change:level', this.calcTraining, this);
        this.on('change:level', this.calcLevel('exp'), this);
    },
    defaults: function () {
    /**
     * Enlightening discussion about defaults with arrays and objects.
     * http://stackoverflow.com/questions/6433795/backbone-js-handling-of-attributes-that-are-arrays
     */
        return {
            magic: 0,                   // Only the Avatar has these stats, so all others are zero.
            mana: 0,
            statHistory: new Object(),  // History of training and order.
            trainingCount: 0            // Next number for training order.
        };
    },
    calcLevel: function(base) {
        /**
         * These ridiculous switch statements make calculating level or minimum experience possible.
         * 
         * @param base string   If the base is 'exp' the method calculates what the level would be.
         *                      If the base is anything else the method calculates the minimum 
         *                      experience for current level.
         */
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
        /**
         * Training points change with level ups or downs.
         */
        var oldLevel = this.previous('level');
        var newLevel = this.get('level');
        var difference = newLevel - oldLevel;
        this.set('training', this.get('training') + (difference * 3));
    },
    calcHits: function() {
        /**
         * Hits are always equal to strength. No matter what!
         */
        this.set('hits', this.get('strength'));
    },
    calcCombat: function() {
        /**
         * Combat is linked to dexterity changes.
         */
        var oldDexterity = this.previous('dexterity');
        var newDexterity = this.get('dexterity');
        var difference = newDexterity - oldDexterity;
        this.set('combat', this.get('combat') + difference);
    },
    calcMagic: function() {
        /**
         * Magic is linked to intelligence changes.
         */
        var oldIntelligence = this.previous('intelligence');
        var newIntelligence = this.get('intelligence');
        var difference = newIntelligence - oldIntelligence;
        this.set('magic', this.get('magic') + difference);
    },
    calcMana: function() {
        /**
         * Mana is always equal to magic. Whether you like it or not!
         */
        var oldMagic = this.previous('magic');
        var newMagic = this.get('magic');
        var difference = newMagic - oldMagic;
        this.set('mana', this.get('mana') + difference);
    },
    rangeCheck: function(attribute) {
        /**
         * This method works two ways. If no attribute is provided it will range check all model
         * attributes and change them to min or max if they are out of their possible range (many
         * attributes have a specific range).
         * If an attribute is provided the method returns true or false if that attribute is out of
         * its range. This is used to enable or disable the + and - buttons in the member view.
         *
         * @param attribute [string]    Attribute to range check.
         */
        if(arguments.length === 0) {
            var original = this.initialStats;
            var keys = _.keys(original);
            var keyslen = keys.length;
            var current = this.attributes;
            for(var i = 0; i < keyslen; i++) {
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
    /**
     * Reset party member stats and training data.
     */
        var self = this;
        self.set('training', self.get('statHistory')[0].training);
        self.set('strength', self.get('statHistory')[0].strength);
        self.set('dexterity', self.get('statHistory')[0].dexterity);
        self.set('intelligence', self.get('statHistory')[0].intelligence);
        self.set('combat', self.get('statHistory')[0].combat);
        self.set('magic', self.get('statHistory')[0].magic);
        self.set('exp', self.get('statHistory')[0].exp);
        self.set('level', self.get('statHistory')[0].level);
        self.set('training', self.get('statHistory')[0].training);
        self.set('trainingCount', 1);
        nixTo = _.size(self.get('statHistory')) - 1;
        for(var i = nixTo; i > 0; i--) {
            self.set('statHistory', _.omit(self.get('statHistory'), i.toString()));
        }
    },
    updateStatHistory: function(trainer) {
    /**
     * Updates statHistory object with each trainer so training can be undone. Originally attempted
     * to calculate the rubberband effect in reverse, but it's not possible on subsequent trains.
     *
     * @param trainer string    Most recent trainer.
     */
        var self = this;
        self.get('statHistory')[self.get('trainingCount')] = new Object();
        self.get('statHistory')[self.get('trainingCount')]['trainer'] = trainer;
        self.get('statHistory')[self.get('trainingCount')]['combat'] = self.get('combat');
        self.get('statHistory')[self.get('trainingCount')]['dexterity'] = self.get('dexterity');
        self.get('statHistory')[self.get('trainingCount')]['intelligence'] = self.get('intelligence');
        self.get('statHistory')[self.get('trainingCount')]['magic'] = self.get('magic');
        self.get('statHistory')[self.get('trainingCount')]['strength'] = self.get('strength');
        if(self.get('trainingCount') === 0) {
            self.get('statHistory')[0]['exp'] = self.get('exp');
            self.get('statHistory')[0]['level'] = self.get('level');
            self.get('statHistory')[0]['training'] = self.get('training');
        }
        
        self.set('trainingCount', self.get('trainingCount') + 1);
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
     * 
     * @param trainer string    Most recent trainer.
     */
        var self = this;
        var trains = self.get('trainingCount') - 1;
        for(var i = trains; i > 0; i--) {
        
            // Roll back training for each trainer.
            var eachTrainer = self.get('statHistory')[i].trainer;
            var points = trainers.getByName(eachTrainer)[0].get('train');
            self.set('training', self.get('training') + points, {silent: true});
            
            // Reset stats.
            if(trainer === self.get('statHistory')[i].trainer) {
                self.set('strength', self.get('statHistory')[i - 1].strength, {silent: true});
                self.set('dexterity', self.get('statHistory')[i - 1].dexterity, {silent: true});
                self.set('intelligence', self.get('statHistory')[i - 1].intelligence, {silent: true});
                self.set('combat', self.get('statHistory')[i - 1].combat, {silent: true});
                self.set('magic', self.get('statHistory')[i - 1].magic, {silent: true});
                self.set('trainingCount', i, {silent: true});
                for(var j = i; j <= trains; j++) {
                    self.set('statHistory', _.omit(self.get('statHistory'), j.toString()), {silent: true});
                }
                
                // Stop after first instance of this trainer was found.
                break;
            }
        }
        this.trigger('change', this);
    },
    trainWith: function(id, button, trained) {
    /**
     * Updates party member model with trainer's information. Should be equivalent to training in
     * the game. The rubberband effect is calculated as half the absolute value of the difference
     * between the primary and secondary stat rounded up (or something close to that). Referenced 
     * from http://strategywiki.org/wiki/Ultima_VII:_The_Black_Gate/Trainers.
     *
     * Needs more in game testing with rubberband effect. With 10 potential party members, 18
     * trainers, uncertain number of training points, and training order a factor: there are a lot 
     * of permutations.
     *
     * @param id        integer     Trainer model id
     * @param button    integer     Mouse button clicked. Left click is 0, right click is 2.
     * @param trained   bool        True allows for untraining.
     */
        var self = this;
        var trainer = trainers.get(id);

        // Left mouse click trains.
        if(button === 0) {
            if(self.get('training') >= trainer.get('train')) {
                self.set('training', self.get('training') - trainer.get('train'), {silent: true});
                self.set('strength', self.get('strength') + trainer.get('strength'), {silent: true});
                self.set('dexterity', self.get('dexterity') + trainer.get('dexterity'), {silent: true});
                self.set('intelligence', self.get('intelligence') + trainer.get('intelligence'), {silent: true});
                
                //Rubber band effect needs to be tested, is this site right? if it is I need some tweaks
                //http://geocities.bootstrike.com/Ultima%20Thule!/u7train.html
                // Deal with rubber band effect for combat.
                if(trainer.get('combat') > 0) {
                    var high = Math.max(self.get('dexterity'), self.get('combat'));
                    var low = Math.min(self.get('dexterity'), self.get('combat'));
                    var rubberband = Math.ceil((high -  low) / 2);
                    if(rubberband === 0) { rubberband = 1; }
                    self.set('combat', self.get('combat') + rubberband, {silent: true});
                }
                
                // Deal with rubber band effect for magic.
                if(trainer.get('magic') > 0) {
                    var high = Math.max(self.get('intelligence'), self.get('magic'));
                    var low = Math.min(self.get('intelligence'), self.get('magic'));
                    var rubberband = Math.ceil((high -  low) / 2);
                    if(rubberband === 0) { rubberband = 1; }
                    self.set('magic', self.get('magic') + rubberband, {silent: true});
                }
                
                // Add trainer to statHistory.
                self.updateStatHistory(trainer.get('name'));

            } else {
                //maybe some kind of message one day.
                console.log('not enough training points');
            }
 
        // Right mouse click to roll back training.
        } else if(button === 2 && trained) { 
            
            // Roll back stats from history.
            self.rollBackStatHistory(trainer.get('name'));
        }
    }
});

var Party = Backbone.Collection.extend({
    /**
     * When a member is chosen from the Choose Party Member drop-down, they are considered to be in
     * the party and added to this collection. They are removed by right clicking on them in the 
     * Current Party box.
     * 
     * I debated on whether the training cost calculations should be here or in the trainers 
     * collection. In the end it made sense to go here because the training cost is only effected
     * by the current party members.
     */
    model: PartyMember,
    checklist: new Object(),    // Passed to trainer checklist view showing who gets trained by who.
    trainingCost: new Object(), // Passed to trainer checklist view showing training costs.
    initialize: function() {
    
        // Listeners
        this.on('change remove', this.createChecklist, this);
        this.on('change remove', this.totalTrainingCost, this);
    },
    getByName: function(name){
        /** 
         * Returns party member model by name. Found this somewhere on stackoverflow, if I find it 
         * again I'll put the link here. I don't think this method is used.
         * To use the returned model append [0], for example:
         *     temp = party.getByName('Iolo');
         *     temp[0].get('hits'); //returns 18 on unchanged Iolo model
         * 
         * @param name string  Trainer name is case sensitive.
         */
        return this.filter(function(member) {
            return member.get('name') === name;
        });
    },
    createChecklist: function() {
        /**
         * Creates the checklist based on current party members and who they have been selected to 
         * train with. Seems horribly inefficient, but it works.
         *
         * [TODO] Account for training order. See comment block in PartyMember model under the 
         * rollBackStatsHistory method about why training order is important.
         */
        temp = {};
        _.each(this.models, function (model) {
            _.each(_.omit(model.get('statHistory'), '0'), function (item, i) {
                if(!temp[item.trainer]) {
                    temp[item.trainer] = {};
                    trainersSelected.add({ centerX: 50,centerY: 50 })
                }
                if(!temp[item.trainer][model.get('name')]) {
                    temp[item.trainer][model.get('name')] = 1;
                } else {
                    temp[item.trainer][model.get('name')] += 1;
                }
            });
        });
        this.checklist = temp;
        this.trigger('trainerDots', _.keys(temp));
    },
    trainingCostPerTrainer: function(trainer) {
        /**
         * Totals training cost for a single trainer across all party members. This method is only 
         * called from total training cost calculation.
         *
         * @param trainer string    Case sensitive trainer name.
         */
        var trains = 0;
        _.each(this.checklist[trainer], function(value) {
            trains += value;
        });
        return trains * trainers.getByName(trainer)[0].get('cost');
    },
    totalTrainingCost: function() {
        /**
         * Uses individual training cost calculations to total what it would cost to train every 
         * party member at every trainer chosen. This is updated when any party member model in this
         * collection is updated.
         */
        var self = this;
        var temp = {};
        temp['total'] = 0;
        _.each(this.checklist, function(value, key) {
            var individualCost = self.trainingCostPerTrainer(key);
            temp['total'] += individualCost;
            temp[key] = individualCost;
        });
        self.trainingCost = temp;
    }
});

var Trainer = Backbone.Model.extend({
    /**
     * Model for each trainer. It doesn't do much and I debated not even having a model. May be 
     * useful for future expansion.
     */
    initialize: function() {
        this.calcValue();
    },
    calcValue: function() {
        /**
         * Calculates the value of a trainer based on the stat gains per training point used. This
         * was originally part of an auto-train method I had where you could choose a stat to focus
         * on and the app would select optimal training for you. The idea was abandon, not only 
         * because it was difficult to implement but there are many opinions on how to train a 
         * character. In the end I decided to just let the user decide. These might be used in
         * future calculations that help the user pick trainers.
         */
        var totalTraining = this.get('strength') + (this.get('dexterity') * 2) + this.get('intelligence') + this.get('combat') + this.get('magic');
        var value = totalTraining / this.get('train');
        var costValue = value / this.get('cost');
        this.set('value', value.toFixed(2));
        this.set('costValue', costValue.toFixed(2));
    }
});

var Trainers = Backbone.Collection.extend({
    /**
     * If I wasn't sure I needed a trainer model, I really didn't need a collection. Here is is
     * anyway. All trainer models are added to the collection on creation (at the bottom of the
     * trainers.js file).
     */
    model: Trainer,
    getByName: function(name){
        /** 
         * Returns trainer model by name. Found this somewhere on stackoverflow, if I find it again
         * I'll put the link here.
         * To use the returned model append [0], for example:
         *     temp = trainers.getByName('Chad');
         *     temp[0].get('dexterity'); //returns 2
         * 
         * @param name string  Trainer name is case sensitive.
         */
        return this.filter(function(trainer) {
            return trainer.get('name') === name;
        });
    }
});

var TrainerDot = Backbone.Model.extend({
    /**
     * Model to create a dot on a canvas. Used to show trainer locations on the map.
     */
    defaults: {
        centerX: 0,
        centerY: 0,
        radius: 5,
        startAngle: 0,
        endAngle: 6.283185307179586, //Tau
        color: '#FF0000',
        border: '#0000FF',
        borderWidth: 2
    }
});

var TrainersSelected = Backbone.Collection.extend({
    /**
     * Collection of trainer's selected for training. Used to show trainer locations on the map.
     */
    model: TrainerDot,
    initialize: function() {
    
        // Listen for custom trigger in party collection's createChecklist method.
        this.listenTo(party, 'trainerDots', this.moreDots);
    },
    moreDots: function(who) {
        /**
         * Add a TrainerDot model to this collection for each trainer found in the party collection
         * trainer checklist (say that three times fast).
         */
        var self = this;
        self.reset();
        _.each(who, function(trainer) {
            var temp = trainers.getByName(trainer);
            var x = (temp[0].get('x') / 3071) * $('#locater').width();
            var y = (temp[0].get('y') / 3071) * $('#locater').height();
            self.add({name: trainer, centerX: x, centerY: y});
        });
    },
    recalcLocation: function() {
        var self = this;
        _.each(self.models, function(model) {
            var originalX = trainers.getByName(model.get('name'))[0].get('x');
            var originalY = trainers.getByName(model.get('name'))[0].get('y');
            var x = (originalX / 3071) * $('#locater').width();
            var y = (originalY / 3071) * $('#locater').height();
            model.set('centerX', x);
            model.set('centerY', y);
        });
    }
});



























