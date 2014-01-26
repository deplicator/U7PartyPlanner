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
 
var ChooseMemberView = Backbone.View.extend({
    /**
     * This view triggers the change in the Choose Party Member drop-down. It doesn't need a
     * template. It probably doesn't even need a view, but this is how it ended up.
     */
    el: '#chooseMember',
    events: {
        'change': 'triggerMemberChange',
    },
    triggerMemberChange: function(evt) {
        /**
         * Triggers the change in member.
         *
         * @param evt object    Click event object value gets passed in trigger, it will be the 
         *                      party member's name.
         */
        this.trigger("memberChange", evt.target.value);
    }
});

var MemberView = Backbone.View.extend({
    /**
     * View that shows and allows changes to each party member. It also gets updated with selected
     * trainers.
     */
    el: '#member',
    initialize: function(){
        
        // Add this member to party collection when selected.
        party.add(this.model);
        
        // Listener updates this view on model changes.
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
        /**
         * Reset button resets the model.
         */
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
 
var SelectTrainerView = Backbone.View.extend({
    el: "#selectTrainer",
    initialize: function() {
    
        // Listeners
        this.listenTo(this.model, 'change', this.render);
    },
    render: function() {
        var trainedWith = [];
        _.each(this.model.get('statHistory'), function(object) { 
            trainedWith.push(object.trainer);
        });
        
        var template = _.template($("#selectTrainer-view").html(), { trainers: trainers.toJSON(),
                                                                     character: this.model,
                                                                     who: trainedWith });
        this.$el.html(template);
        
        //[TODO] Fix table resorting after render(). 
        //The only way I can think to do that is to save the current sort and then use the plug in 
        //options to sort the table the way it was before render was called.
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

var TrainerChecklistView = Backbone.View.extend({
    el: "#trainerChecklist",
    initialize: function(){
        
        // Updates this view when party collection changes.
        this.listenTo(party, 'change remove', this.render);
    },
    render: function(){
        var template = _.template($("#trainerChecklist-view").html(), {checklist: party.checklist,
                                                                       trainingCost: party.trainingCost });
        this.$el.html(template);
    },
    events: {
        'mouseenter dt': 'highlightMap',
        'mouseleave dt': 'unhighlightMap'
    },
    highlightMap: function(e) {
        /**
         * Changes color attribute of selectedTrainer model that matches element hovered over in
         * checklist. Doesn't work well when the mouse is moving over the trainer names fast.
         */
        $('#' + e.target.id).addClass('hovering');
        var sl = e.target.id.split('-on')[0];
        var newDot = trainersSelected.getByName(sl);
        newDot[0].set('color', '#ffffff');
        this.trigger('mapRefresh');
    },
    unhighlightMap: function(e) {
        /**
         * Changes color attribute of selectedTrainer model back to original.
         */
        $('#' + e.target.id).removeClass('hovering');
        var sl = e.target.id.split('-on')[0];
        var newDot = trainersSelected.getByName(sl);
        newDot[0].set('color', '#ff0000');
        this.trigger('mapRefresh');
    }
});

var MapView = Backbone.View.extend({
    /**
     * Resizes canvas to fit map image, also allows the user to swap between the pretty cloth map
     * and the accurate game map.
     */
    el: "#map",
    initialize: function(){
        this.listenTo(trainersSelected, 'all', this.render);
    },
    render: function() {
        var self = this;
        
        // On render resize canvas to match map image.
        var canvas = document.getElementById('dots')
        canvas.height = $('#locater').height();
        canvas.width = $('#locater').width();
        
        // Get canvas.
        var ctx = document.getElementById('dots').getContext("2d");
        
        // Create a dot model for each model in trainerSelected collection.
        trainersSelected.each(function(model) {
            var view = new DotView({ctx: ctx, model: model});
            view.render();
        })
        
        // Redraws trainer's dot after a map resize, otherwise they will show in the wrong location.
        var doit;
        $(window).resize(function(){
            clearTimeout(doit);
            doit = setTimeout(self.callRecalcLocation, 500);
        });
    },
    events: {
        'click #swapMap': 'swapMap'
    },
    swapMap: function() {
        /**
         * Let's swap button changed between pretty map and useful map.
         */
        if($('#mapimg').attr('src') === 'images/map-cloth.png') {
            $('#mapimg').attr('src', 'images/map-real.png');
        } else {
            $('#mapimg').attr('src', 'images/map-cloth.png');
        }
    },
    callRecalcLocation: function() {
        /**
         * Calls method in selected trainer's collection that recalculates their x-y coordinates.
         */
        trainersSelected.recalcLocation();
    }
});

var DotView = Backbone.View.extend({
    /**
     * Trainers x and y coordinates were taken from in game, so they do not line up well with the 
     * cloth map. They may not be perfect on the game map because of how the coordinates have to be 
     * changed from the game version to something that fits on the map. Regardless, it worked out 
     * closer than I expected.
     */
    initialize: function (e) {
        
        // This made it work.
        this.ctx = e.ctx;
    },
    render : function() {
        
        // Draws dots based on attributes in Dot model.
        var model = this.model;
        ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(model.get("centerX"), model.get("centerY"), model.get("radius"), model.get("startAngle"), model.get("endAngle"), false);
        ctx.fillStyle = model.get('color');
        ctx.fill();
        ctx.lineWidth = model.get('borderWidth');
        ctx.strokeStyle = model.get('border');
        ctx.stroke();
    }
});


// Parent View starts app.
var ParentView = Backbone.View.extend({
    el: '#wrapper',
    initialize: function() {

        // Views
        this.chooseMember = new ChooseMemberView();
        this.member = new MemberView({model: Avatar});
        this.currentParty = new CurrentPartyView();
        this.selectTrainer = new SelectTrainerView({model: Avatar});
        this.trainerChecklist = new TrainerChecklistView();
        this.map = new MapView();

        // Listeners
        this.listenTo(this.chooseMember, 'memberChange', this.memberChange);
        this.listenTo(this.currentParty, 'memberChange', this.memberChange);
        this.listenTo(this.currentParty, 'memberRemove', this.memberRemove);
        this.listenTo(this.trainerChecklist, 'mapRefresh', this.map.render);
        $(window).resize(this.map.render);
    },
    render: function() {
        this.member.render();
        this.currentParty.render();
        this.selectTrainer.render();
        this.trainerChecklist.render();
        this.map.render();
        return this;
    },
    memberChange: function(name) {
        this.member.undelegateEvents();
        this.selectTrainer.undelegateEvents();
        this.member = new MemberView({model: window[name]}); //get by id would be more appropriate
        this.selectTrainer = new SelectTrainerView({model: window[name]});
        this.member.render();
        this.selectTrainer.render();
        $('#chooseMember').find('select').val(name);
    },
    memberRemove: function(id) {
        this.member.undelegateEvents();
        this.selectTrainer.undelegateEvents();
        this.member = new MemberView({model: Avatar});
        this.selectTrainer = new SelectTrainerView({model: Avatar});
        this.member.render();
        this.selectTrainer.render();
        $('#chooseMember').find('select').val('Avatar');
    }
});