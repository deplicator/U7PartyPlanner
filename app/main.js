//references
//http://infinitron.nullneuron.net/u7char.html
//http://strategywiki.org/wiki/Ultima_VII:_The_Black_Gate/Trainers
//http://www.ultimainfo.net/Maps/U7Maps.htm
//http://geocities.bootstrike.com/Ultima%20Thule!/u7train.html

$(document).ready(function() {

    // Disables normal right click menu because right click is used to untrain a party member.
    document.oncontextmenu = function() { return false; };
    
    // Start the application.
    app = new ParentView();
    app.render();
    
    // Because games!
    var easter_egg = new Konami();
    easter_egg.code = function() {
        $('body').css('font-family', 'Ophidean Runes');
        $('h1').css('font-family', 'Ophidean Runes');
        $('h2').css('font-family', 'Ophidean Runes');
    }
    easter_egg.load();
});