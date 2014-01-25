$(document).ready(function() {

    // Disables normal right click menu. Right click is used to untrain and dismiss party members.
    document.oncontextmenu = function() { return false; };
    
    // Start the application.
    app = new ParentView();
    app.render();
    
    // Because games!
    var easter_egg = new Konami();
    easter_egg.code = function() {
        $('body').css('font-family', 'Britannian Runes');
        $('h1').css('font-family', 'Ophidean Runes');
        $('h2').css('font-family', 'Ophidean Runes');
    }
    easter_egg.load();
});
