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

// Party Member view
var MemberView = Backbone.View.extend({
    el: "#member",
    initialize: function(){
        /*this.on('all', function(e) {
            console.log('Member View: ' + e);
        });*/
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

// Current Party
//this should be changed to click to view, right click to dismiss
var MemberListView = Backbone.View.extend({
    el: "#memberList",
    initialize: function() {
        /*this.on('all', function(e) {
            console.log('Member List View: ' + e);
        });*/
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
            this.trigger('memberRemove')
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
        //the way it was before render was called. Would take some thinkin'.
        $(".sortable").tablesorter({sortInitialOrder: 'desc'});
    },
    events: {
        'mousedown tbody tr': 'triggerTrainWith'
    },
    triggerTrainWith: function(evt) {
        var id = $(evt.target).parent().attr('id').split('-')[1];
        this.model.trainWith([id, evt.button]);
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
        checklist = {};
        _.each(party.models, function(member) {
            var trainedTimes = _.size(member.get('statHistory'));

                //for(var i = 1; i < trainedTimes; i++) {
                //    console.log(member.get('statHistory')[i].trainer)
                //}

                

        });
        
        var template = _.template($("#trainerList-view").html(), {checklist: checklist});
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
        this.memberChooser = new MemberChooserView();
        this.member = new MemberView({model: Avatar});
        this.memberList = new MemberListView();
        this.trainerSelect = new TrainerSelectView({model: Avatar});
        this.trainerList = new TrainerListView();
        this.map = new MapView();

        // Listeners
        this.listenTo(this.memberChooser, "memberChange", this.memberChange);
        this.listenTo(this.memberList, "memberRemove", this.memberRemove);
    },
    render: function() {
        this.memberChooser.render();
        this.member.render();
        this.memberList.render();
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
    },
    memberRemove: function(id) {
        this.member.undelegateEvents();
        this.trainerSelect.undelegateEvents();
        this.member = new MemberView({model: Avatar});
        this.trainerSelect = new TrainerSelectView({model: Avatar});
        this.member.render();
        this.trainerSelect.render();
        $('#memberChooser').find('select').val('Avatar');
    }
});