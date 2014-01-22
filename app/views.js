/* 
 * Views
 * 
 * ParentView
 * |-ChooseMemberView
 * |-MemberView
 * |-CurrentPartyView
 * |-SelectTrainersView
 * |-TrainerChecklistView
 * |-MapView
 *
 * Interesting discussion on where to render views: 
 * http://stackoverflow.com/questions/9271507/how-to-render-and-append-sub-views-in-backbone-js.
 */
 
// Choose party member
var ChooseMemberView = Backbone.View.extend({
    el: '#chooseMember',
    events: {
        'change': 'triggerMemberChange',
    },
    triggerMemberChange: function(evt) {
        this.trigger("memberChange", evt.target.value);
    }
});

var MemberView = Backbone.View.extend({
    el: '#member',
    initialize: function(){
        
        // Add this party member to collection when selected.
        party.add(this.model);
        
        // Update view on model changes.
        this.listenTo(this.model, 'change', this.render);
    },
    render: function(){
        var template = _.template($('#member-view').html(), {character: this.model});
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

var CurrentPartyView = Backbone.View.extend({
    el: '#currentParty',
    initialize: function() {
        this.listenTo(party, 'all', this.render);
    },
    render: function(){
        var template = _.template($('#currentParty-view').html(), {party: party.toJSON()});
        this.$el.html(template);
    },
    events: {
        'mousedown img': 'swapOrRemove'
    },
    swapOrRemove: function(evt) {
    
        // Left click to swap to party member stats.
        if(evt.button === 0) {
            this.trigger('memberChange', evt.target.id);
        
        // Right click to dismiss party member.
        } else if(evt.button === 2) {
            if(evt.target.id != 'Avatar') {
                party.remove(party.getByName(evt.target.id));
                this.trigger('memberRemove')
            }
        }
    }
});
 
// Select Trainer
var TrainerSelectView = Backbone.View.extend({
    el: "#trainerSelect",
    initialize: function(){
        /*this.on('all', function(e) {
            console.log('Trainer Select View: ' + e);
        });*/
        this.listenTo(this.model, 'change', this.render);
    },
    render: function(){
        trainedWith = [];
        _.each(this.model.get('statHistory'), function(object) { 
            trainedWith.push(object.trainer);
        });
        
        var template = _.template($("#trainerSelect-view").html(), { trainers: trainers.toJSON(),
                                                                     character: this.model,
                                                                     who: trainedWith });
        this.$el.html(template);
        
        //Would be nice if table didn't resort after clicking on a trainer. The only way I can think
        //to do that is to save the current sort and then use the plug in options to sort the table
        //the way it was before render was called. Would take some thinking.
        $(".sortable").tablesorter({sortInitialOrder: 'desc'});
    },
    events: {
        'mousedown tbody tr': 'triggerTrainWith'
    },
    triggerTrainWith: function(evt) {
        var id = $(evt.target).parent().attr('id').split('-')[1];
        var button = evt.button;
        var trained = $(evt.target).parent().hasClass('trained');
        this.model.trainWith(id, button, trained);
    }
});

// Trainer Checklist
var TrainerListView = Backbone.View.extend({
    el: "#trainerList",
    initialize: function(){
        /*this.on('all', function(e) {
            console.log('Trainer List View: ' + e);
        });*/
        this.listenTo(party, 'change', this.render);
    },
    render: function(){
        var template = _.template($("#trainerList-view").html(), {checklist: party.theList});
        this.$el.html(template);
    }
});

// Map
var MapView = Backbone.View.extend({
    //this may help 
    //http://stackoverflow.com/questions/10716478/making-a-backbone-js-view-to-draw-objects-on-a-canvas
    el: "#map",
    initialize: function(){
        this.on('all', function(e) {
            console.log('Map View: ' + e);
        });
    },
    render: function() {
        var template = _.template($("#map-view").html());
        this.$el.html(template);
    },
    canvas: function() {
        return document.getElementById('dots');
    },
    context: function() {
        this.canvas().height = $('#locater').height();
        this.canvas().width = $('#locater').width();
        return this.canvas().getContext('2d');
    },
    mapTrainer: function(centerX, centerY) {
        
        radius = 5;

        this.context().beginPath();
        this.context().arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        this.context().fillStyle = 'red';
        this.context().fill();
        this.context().lineWidth = 1;
        this.context().strokeStyle = '#003300';
        this.context().stroke();
    }
});

// Parent View starts everything off.
var ParentView = Backbone.View.extend({
    el: '#notfooter',
    initialize: function() {
        /*this.on('all', function(e) {
            console.log('Parent View: ' + e);
        });*/
        
        // Views
        this.chooseMember = new ChooseMemberView();
        this.member = new MemberView({model: Avatar});
        this.currentParty = new CurrentPartyView();
        this.trainerSelect = new TrainerSelectView({model: Avatar});
        this.trainerList = new TrainerListView();
        this.map = new MapView();

        // Listeners
        this.listenTo(this.chooseMember, "memberChange", this.memberChange);
        this.listenTo(this.currentParty, "memberChange", this.memberChange);
        this.listenTo(this.currentParty, "memberRemove", this.memberRemove);
    },
    render: function() {
        this.member.render();
        this.currentParty.render();
        this.trainerSelect.render();
        this.trainerList.render();
        this.map.render();
        return this;
    },
    memberChange: function(name) {
        this.member.undelegateEvents();
        this.trainerSelect.undelegateEvents();
        this.member = new MemberView({model: window[name]}); //get by id would be more appropriate
        this.trainerSelect = new TrainerSelectView({model: window[name]});
        this.member.render();
        this.trainerSelect.render();
        $('#chooseMember').find('select').val(name);
    },
    memberRemove: function(id) {
        this.member.undelegateEvents();
        this.trainerSelect.undelegateEvents();
        this.member = new MemberView({model: Avatar});
        this.trainerSelect = new TrainerSelectView({model: Avatar});
        this.member.render();
        this.trainerSelect.render();
        $('#chooseMember').find('select').val('Avatar');
    }
});