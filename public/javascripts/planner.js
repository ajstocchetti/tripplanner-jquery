var itinerary = [{}]; // set zero to null so we don't ahve to worry about index/dayNum being off

$(document).ready(function() {
  // add click events
  $("#addDayButton").on('click', addDay);
  $(".add-item").on('click', addEvent);

  // initialize page
  $("#addDayButton").trigger('click');
  $("#dayList > li > a").trigger('click');
})

function addDay() {
  var dayNum = itinerary.length;
  var newDay = {
    Restaurants: [],
    Hotels: [],
    Activities: []
  };
  itinerary.push(newDay);
  var li = $("<li></li>");
  var link = $("<a></a>").addClass('dayLinks').text("Day "+dayNum).attr('data-day', dayNum);
  link.on('click', changeDay);
  li.append(link);
  $('#dayList').append(li);
}


function changeDay() {
  // remove all the old shit
  $('#dayList > li').removeClass('active');
  $('.list-group').empty();
  var oldDay = getDayFromPage();
  forWholeDay(oldDay, removeMarker)

  // update to current day
  var dayNum = $(this).attr('data-day');
  setDayOnPage(dayNum);
  $(this).parent().addClass('active');
  forWholeDay(dayNum, updateDisplay);
}





function addEvent() {
  var type = $(this).attr('data-type');
  var id = $('#'+type).val();
  var dayNum = getDayFromPage();
  var theEvent = new tripEvent(type, id);
  if(type === "Hotels") {
    removeMarker(type, itinerary[dayNum][type][0]);
    itinerary[dayNum][type] = [theEvent];
  } else {
    itinerary[dayNum][type].push(theEvent);
  }
  updateDisplay(type, theEvent)
}

function tripEvent(type, id) {
  this.eventId = new Date().getTime();
  this.eventObj = findEvent(type, id);

  var lat = this.eventObj.place[0].location[0];
  var long = this.eventObj.place[0].location[1];
  var latLng = new google.maps.LatLng(lat, long);
  this.marker = new google.maps.Marker({
    // position: new google.maps.LatLng(lat, long),
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
  if(type === "Hotels") {
    ul.empty();
  }
  ul.append(disp);
  // Add the marker to the map by calling setMap()
  theEvent.marker.setMap(window.map);
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

function forWholeDay(dayNum, callBack) {
  for ( var type in itinerary[dayNum]) {
    for (var x=0; x<itinerary[dayNum][type].length; x++) {
      callBack(type, itinerary[dayNum][type][x]);
    }
  }
}




function removeEventClick() {
  var eventId = $(this).parent().attr('data-eventId');
  var type = $(this).parents('ul').attr('id').slice(0,-9); // use slice to remove 'Itinerary'
  removeEvent(type, eventId);
}
function removeEvent(type, eventId, dayNum) {
  var dayNum = dayNum || getDayFromPage();
  var ndx = -1;
  for (var x=0; x< itinerary[dayNum][type].length; x++ ) {
    if (itinerary[dayNum][type][x].eventId === eventId) {
      ndx = x;
      return;
    }
  }
  if (ndx >= 0) {
    itinerary[dayNum][type].splice(x,1);
    changeDay(dayNum)
  }
}
