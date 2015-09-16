var itinerary = [{}]; // set zero to null so we don't ahve to worry about index/dayNum being off

$(document).ready(function() {
  // add click events
  $("#addDayButton").on('click', addDay);
  $(".add-item").on('click', addEvent);
  $("#removeDayButton").on('click', removeDay);
  // initialize page
  addDayOne();
})

function addDayOne() {
  $("#addDayButton").trigger('click');
  // $("#dayList > li > a").trigger('click');
}

function addDay() {
  var dayNum = itinerary.length;
  var newDay = {
    Restaurants: {},
    Hotels: {},
    Activities: {}
  };
  itinerary.push(newDay);
  addDayButton(dayNum);
  changeDay(dayNum);
}
function addDayButton(dayNum) {
  var li = $("<li></li>");
  var link = $("<a></a>").addClass('dayLinks').text("Day "+dayNum).attr('data-day', dayNum);
  link.on('click', changeDayWrapper);
  li.append(link);
  $('#dayList').append(li);
}
function removeDay() {
  if(itinerary.length < 2) {
    console.log("there are no days to remove");
    return;
  }
  var dayNum = getDayFromPage();
  // clear out existing display
  changeDay(0);
  // remove day from itinerary
  itinerary.splice(dayNum, 1);
  // update day list itmes
  $('#dayList').empty();
  for (var x=1; x < itinerary.length; x++) {
    addDayButton(x);
  }
  // show the next day
  // case 1: no days left
  if (itinerary.length < 2) {
    addDayOne();
    return;
  }
  // case: last day was removed (but there still is 1+ days
  if (Number(dayNum)+1 >= itinerary.length) { // add 1 to account for day 0
    dayNum = itinerary.length-1;
  }
  changeDay(dayNum);
  // $("a[data-day="+dayNum+"]").trigger('click')
}

function changeDayWrapper() {
  var newDay = $(this).attr('data-day');
  changeDay(newDay);
}
function changeDay(dayNum) {
  // remove all the old shit
  $('#dayList > li').removeClass('active');
  $('.list-group').empty();
  var oldDay = getDayFromPage();
  forWholeDay(oldDay, removeMarker)

  // update to current day
  // var dayNum = $(this).attr('data-day');
  setDayOnPage(dayNum);
  $("a[data-day="+dayNum+"]").parent().addClass('active');
  forWholeDay(dayNum, updateDisplay);
  zoomToExtents(dayNum);
}





function addEvent() {
  var type = $(this).attr('data-type');
  var id = $('#'+type).val();
  var dayNum = getDayFromPage();
  var theEvent = new tripEvent(type, id);
  if(type === "Hotels") {
    clearHotels();
  }
  itinerary[dayNum][type][theEvent.eventId] = theEvent;
  updateDisplay(type, theEvent);
  zoomToEvent(theEvent);
}

function tripEvent(type, id) {
  this.eventId = new Date().getTime();
  this.eventObj = findEvent(type, id);

  var lat = this.eventObj.place[0].location[0];
  var long = this.eventObj.place[0].location[1];
  var latLng = new google.maps.LatLng(lat, long);
  var image = "";
  if(type == "Hotels") {
    image = "images/hotel.png";
  } else if (type == "Restaurants") {
    image = "/images/restaurant.png";
  } else {
    image = "/images/activity.png";
  }
  this.marker = new google.maps.Marker({
    icon: image,
    position: latLng,
    title: this.eventObj.name,
    center: latLng
  })
}

function findEvent(type, id) {
  var arr = [];
  if (type === "Hotels") {
    arr = all_hotels;
  } else if(type === "Restaurants") {
    arr = all_restaurants;
  } else {
    arr = all_activities;
  }
  for(var x=0; x<arr.length; x++) {
    if( arr[x]._id === id ) {
      return arr[x]
    }
  }
  return {status: "failed"};
}







function updateDisplay(type, theEvent) {
  var ul = $("#"+type+"Itinerary");
  var disp = $("<li></li>").addClass('eventListItem');
  var remBtn = $('<button class="remove-event">x</button>');
  remBtn.on('click', removeEventClick)
  disp.text(theEvent.eventObj.name).attr('data-eventId', theEvent.eventId);
  disp.append(remBtn)
  ul.append(disp);
  // Add the marker to the map by calling setMap()
  theEvent.marker.setMap(window.map);
}
function zoomToEvent(theEvent) {
  window.map.setZoom(15);
  window.map.setCenter(theEvent.marker.position);
}
function zoomToExtents(dayNum) {
  // loop through all events for day
  var boundsInit = new google.maps.LatLngBounds();
  var x = {
    iteration: 0,
    bounds: new google.maps.LatLngBounds()
  }
  x = forWholeDay(dayNum, function(type, theEvent, b) {
    x.iteration++;
    x.bounds.extend(theEvent.marker.position);
    return x;
  }, x);
  if( x.iteration > 0) {
    window.map.fitBounds(x.bounds);
    var zoomMax = 14;
    if (window.map.zoom > zoomMax) {
      window.map.setZoom(zoomMax);
    }
  }
  else {
    var resetLatLong = new google.maps.LatLng(40.705189,-74.009209);
    window.map.setCenter(resetLatLong);
    window.map.setZoom(13)
  }
}


function removeMarker(type, theEvent) {
  if(theEvent) {
    theEvent.marker.setMap(null);
  }
}




function getDayFromPage() {
  return $('#currentDay').attr('data-dayNum');
}
function setDayOnPage(dayNum) {
  $('#currentDay').text("Day "+dayNum);
  $('#currentDay').attr('data-dayNum', dayNum);
}

function forWholeDay(dayNum, callBack, initial) {
  for ( var type in itinerary[dayNum]) {
    for (var someEvent in itinerary[dayNum][type]) {
      initial = callBack(type, itinerary[dayNum][type][someEvent], initial);
    }
  }
  return initial;
}






function clearHotels() {
  var dayNum = getDayFromPage();
  for (var hotel in itinerary[dayNum].Hotels) {
    removeMarker("Hotels", itinerary[dayNum]["Hotels"][hotel]);
    delete itinerary[dayNum]["Hotels"][hotel];
  }
  $("#HotelsItinerary").empty();
}







function removeEventClick() {
  var eventId = $(this).parent().attr('data-eventId');
  var type = $(this).parents('ul').attr('id').slice(0,-9); // use slice to remove 'Itinerary'
  removeEvent(type, eventId);
}
function removeEvent(type, eventId, dayNum) {
  var dayNum = dayNum || getDayFromPage();
  // remove the li
  var li = $("li[data-eventid="+eventId+"]").remove();
  // remove the marker
  removeMarker(type, itinerary[dayNum][type][eventId])
  // remove from itinerary
  delete itinerary[dayNum][type][eventId];
}
