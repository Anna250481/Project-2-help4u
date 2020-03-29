L.mapquest.key = 'mwZodU08iNjRDmcuD2V3hw3zqVZ1cdTw';
let loggingIn = false;
let userCookieName = "4us-currentUser";

// Seattle's coordinates are default: 47.60357° N, -122.32945° E

// Client-side object to hold the user information
var currentUser = {
  name: "",
  email: "",
  latitude: "",
  longitude: "",
  address: "",
  locationSupport: false,
  loggedIn: false
};



// Facebook integration
function checkLoginState() { // Called when a person is finished with the Login Button.
  console.log("checkLoginState");
  loggingIn = true;
  FB.getLoginStatus(function (response) { // See the onlogin handler
    statusChangeCallback(response);
  });
  loggingIn = false;
}

function statusChangeCallback(response) { // Called with the results from FB.getLoginStatus().
  console.log('statusChangeCallback');
  console.log(response); // The current login status of the person.
  currentUser.loggedIn = false;
  localStorage.removeItem(userCookieName);
  if (response.status === 'connected') { // Logged into your webpage and Facebook.

    // Enabled to do anything
    testFBAPI();

  } else {

    // Can't get tasks or create tasks
    currentUser.loggedIn = false;
    currentUser.name = false;
    currentUser.email = false;
    localStorage.removeItem(userCookieName);
  }
}

// Cookies
function createCookie(cookieName, cookieValue, daysToExpire) {
  var date = new Date();
  date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
  document.cookie = cookieName + "=" + cookieValue + "; expires=" + date.toGMTString();
}
function accessCookie(cookieName) {
  var name = cookieName + "=";
  var allCookieArray = document.cookie.split(';');
  for (var i = 0; i < allCookieArray.length; i++) {
    var temp = allCookieArray[i].trim();
    if (temp.indexOf(name) == 0)
      return temp.substring(name.length, temp.length);
  }
  return "";
}

function testFBAPI() { // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me?locale=en_US&fields=name,email', function (response) {
    currentUser.name = response.name;
    currentUser.email = response.email;

    console.log('Successful login for: ' + response.name);
    console.log(response);
    currentUser.loggedIn = true;
    var val = JSON.stringify(currentUser)
    console.log("currentUser Value to store:" + val);
    localStorage.setItem(userCookieName, val);
  });

}
// END - Facebook integration



$(window).load(function () {

})


// The following function is called by JQuery only after all the DOM is ready
$(function () {
  // Get user location info:
  // This is how to allow the user to pick the location from the map, to assist entering the place they need help
  // https://developer.mapquest.com/documentation/mapquest-js/v1.3/examples/reverse-geocoding/
  //https://stackoverflow.com/questions/14074075/html5-geolocation-script-works-in-chrome-but-not-safari-or-any-ios6-browser
  // Should use this approach in the future: https://developers.google.com/web/fundamentals/native-hardware/user-location
  if (navigator.geolocation == undefined) {
    // location not supported. we can't show maps and relative location
    currentUser.locationSupport = true;
  }
  else if (navigator.geolocation != undefined) {
    navigator.geolocation.getCurrentPosition(function (position) {
      currentUser.latitude = position.coords.latitude;
      currentUser.longitude = position.coords.longitude;
      currentUser.locationSupport = true;

      var popup = L.popup();

      var map = L.mapquest.map('map', {
        center: [currentUser.latitude, currentUser.longitude],
        layers: L.mapquest.tileLayer('map'),
        zoom: 14
      });

      L.marker([currentUser.latitude, currentUser.longitude], {
        icon: L.mapquest.icons.marker(),
        draggable: false
      }).bindPopup('You are here').addTo(map);

    }, function (error) {
      console.log("Error=" + error);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          break;
        case error.POSITION_UNAVAILABLE:
          break;
        case error.TIMEOUT:
          break;
        default:
          break;
      }
    });
  };

  //Try reading the currentUser from localstorage
  var userStored = localStorage.getItem(userCookieName);
  console.log("currentValue retrieved:" + userStored);
  if (userStored) {
    currentUser = JSON.parse(userStored);
  }


  $(".devoured-btn").on("click", function (event) {
    console.log("devoured-btn");
    var id = $(this).data("id");
    var newDevoured = $(this).data("newdevoured");

    var newDevouredState = {
      devoured: newDevoured
    };
    // Send the PUT request.
    $.ajax("/api/burgers/" + id, {
      type: "PUT",
      data: newDevouredState
    }).then(
      function () {
        console.log("changed sleep to" + newDevoured);
        // Reload the page to get the updated list
        location.reload();
      }
    );
  });

  $(".create-form").on("submit", function (event) {
    // Make sure to preventDefault on a submit event.
    console.log("submit");
    event.preventDefault();

    var newBurger = {
      name: $("#bb").val().trim(),
      devoured: 0
    };
    console.log(newBurger)

    // Send the POST request.
    $.ajax("/api/burgers", {
      type: "POST",
      data: newBurger
    }).then(
      function () {
        console.log("created new burger");
        // Reload the page to get the updated list
        location.reload();
      }
    );
  });

  $(".delete-btn").on("click", function (event) {
    console.log("delete-btn");
    var id = $(this).data("id");
    // Send the DELETE request.
    $.ajax("/api/burgers/" + id, {
      type: "DELETE"
    }).then(
      function () {
        console.log("deleted burger", id);
        // Reload the page to get the updated list
        location.reload();
      }
    );
  });
});