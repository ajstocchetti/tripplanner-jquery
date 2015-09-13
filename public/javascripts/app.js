function initialize_gmaps() {
    // initialize new google maps LatLng object
    // set the map options hash
    var mapOptions = {
        // center: myLatlng,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    // get the maps div's HTML obj
    var map_canvas_obj = document.getElementById("map");
    // initialize a new Google Map with the options
    window.map = new google.maps.Map(map_canvas_obj, mapOptions);
}

$(document).ready(function() {
    initialize_gmaps();
});
