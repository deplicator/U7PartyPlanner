//references
//http://infinitron.nullneuron.net/u7char.html
//http://strategywiki.org/wiki/Ultima_VII:_The_Black_Gate/Trainers
//http://www.ultimainfo.net/Maps/U7Maps.htm

$(document).ready(function() {
    // Disables normal right click menu because right click is used to untrain a party member.
    document.oncontextmenu = function() { return false; };
    
    // Start the application.
    app = new ParentView();
    app.render();
});