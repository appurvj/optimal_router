  var count = 0;
  var resultList = [];
  var startTime;
  var locations = [];
  var mapObj;
	var addressList;
	var hoursList; //stored in seconds
	var sTime;
	var dirService = new google.maps.DirectionsService();
	var travelmode = google.maps.TravelMode.DRIVING;
	var optimizeRoute = false;
	var endNode = -1;
	var minDur =  Number.MAX_VALUE;
	var minPath =  [];
	var selectedMode;
	var scrollWheel = false;
	var weatherLayer;
	var cloudLayer;
	var submittedOnce = false;
	var inputCollapsed = false;

	toastr.options = {
    closeButton: false,
    debug: false,
    positionClass: "toast-top-full-width",
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
  }

	var dirRender = new google.maps.DirectionsRenderer({
				  draggable: false,
				  map: mapObj,
				  panel:document.getElementById("indiv-steps")
				});

  var mapOptions = {
    center: new google.maps.LatLng(37.7831,-122.4039),//San Francisco
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: scrollWheel
  }; 

  
  var transMsg = "<b>Transit calculations take a few seconds because google limits the number of requests it services per second... <br> Note: Path Optimization is not done in Transit Mode yet. I am working on it...</b>";
  
	$('#indiv-steps').hide();
  $('#indiv-steps').height($('#collapsible-area').height());
  $('#map-canvas').height($('#input-area').height());
  google.maps.event.addDomListener(window, 'load', initialize);
  
	
	function initialize() {
		//showHideTimeInfo();
		activateMode("DRIVING");
    mapObj = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    var acOptions = {
       types: []
    };

    for(var i = 0; i < 9; i++)
      locations[i] = new google.maps.places.Autocomplete(document.getElementById("autocomplete"+i),acOptions);
  
    var scrollControlDiv = document.createElement('div');
    var scrollControl = new ScrollControl(scrollControlDiv, mapObj);
    scrollControlDiv.index = 1;
    mapObj.controls[google.maps.ControlPosition.TOP].push(scrollControlDiv);		

    weatherLayer = new google.maps.weather.WeatherLayer({
    temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT
    });
		cloudLayer = new google.maps.weather.CloudLayer();
    weatherLayer.setMap(mapObj);
    cloudLayer.setMap(mapObj);
  }

  function activateMode(str){
    if(selectedMode== str)
			return;
		selectedMode = str;
		travelmode = google.maps.TravelMode[selectedMode];
		if(selectedMode != "TRANSIT"){
			$('[name="trans"]').hide();
			$('[name="trans-opts"]').hide();
		}
		else{
			$('[name="trans"]').show();
			$('[name="trans-opts"]').show();
		}
		if(submittedOnce)
			runCalc();

	}

  /*
  function showHideTimeInfo(){
    selectedMode = document.getElementById('mode').value;
		travelmode = google.maps.TravelMode[selectedMode];
		if(selectedMode != "TRANSIT")
			$('[name ="timeInfo"]').hide();
		else
      $('[name ="timeInfo"]').show();
		
	}
	*/


  
  function GetDate(){
    var start = new Date();
		if($("#stime").val() == ""){
			alert("Time Feild Empty!");
			return null;
	  }
    hrs_mins = $("#stime").val().split(":");
    if(start.getHours() > hrs_mins[0] || (start.getHours()==hrs_mins[0] && start.getMinutes() > hrs_mins[1]))
      start.setDate(start.getDate() + 1);
    start.setHours(hrs_mins[0]);
    start.setMinutes(hrs_mins[1]);
		start.setSeconds(0);
    return start;
	}

  function GetHours(){
    var hoursIp = $('[name="hrs"]');
    var hours = [0];

  	for(var i = 0; i < hoursIp.length; i++)
  		if(hoursIp[i].value != ""){
  		  if(hoursIp[i].value*1 > 0)
  	      hours.push(hoursIp[i].value*3600);//converting to seconds
  	    else if(hoursIp[i].value*1 < 0){
          alert("Negative hours not allowed!");
  			  return null;
  		  }
  		}    
	  console.log(hours);
    return hours;
	}
  
  function GetAddressList(){
    var list=[];
		var addrIp = $('[name="autocomp"]');
		for(var idx = 0; idx < addrIp.length; idx++){
      if(addrIp[idx].value!=""){
				console.log("Adding: " + addrIp[idx].value); 
				list.push(addrIp[idx].value);
			}
		}
		/*
		for(var i = 0; i < locations.length; i++){
			if(locations[i].getPlace()!= undefined){
				console.log("Adding: " + locations[i].getPlace().formatted_address)
				list.push(locations[i].getPlace().formatted_address);
			}
		}
		*/
		return list;
  }
  

  function combineResults(){
    var currRoute;
    var legsList = [];
    var currLeg;
    var overview_path_list = [];
    var currOverviewPath;
    var warningsList = [];
    var currWarnings;
    var bnds = resultList[0].routes[0].bounds;
    
    for( var idx1 = 0; idx1 < resultList.length; idx1++){
      currRoute = resultList[idx1].routes[0];
      bnds.extend(currRoute.bounds.getNorthEast()).extend(currRoute.bounds.getSouthWest());//TODO: check if bnds=... is req
      legsList.push(currRoute.legs[0]);
      currOverviewPath = currRoute.overview_path;
      
      for(var idx2 = 0; idx2 < currOverviewPath.length; idx2++) 
          overview_path_list.push(currOverviewPath[idx2]);
        
      currWarnings = currRoute.warnings;
      for(var idx2 = 0; idx2 < currWarnings.length; idx2++)
        if(jQuery.inArray(currWarnings[idx2], warningsList) < 0)
          warningsList.push(currWarnings[idx2]);
    }
    
    var result = {
                  Nb: {destination: addressList[addressList.length - 1],
                       origin: addressList[0],
                       transitOptions: { departureTime: sTime},
                       travelMode: "TRANSIT"},
                  routes: [{bounds: bnds,
                            copyrights: currRoute.copyrights,
                            legs: legsList,
                            overview_path: overview_path_list,
                            warnings: warningsList,
                            waypoint_order:[]}],
                  status: "OK"
                 };
    console.log("DirectionsResult: ");
    console.log(result);
    return result;
  }

function ScrollControl(controlDiv, map) {

  // Set CSS styles for the DIV containing the control
  // Setting padding to 5 px will offset the control
  // from the edge of the map
  controlDiv.style.padding = '5px';

  // Set CSS for the control border
  var controlUI = document.createElement('div');
  controlUI.className = "btn btn-primary btn-mini"
	controlDiv.appendChild(controlUI);
	

  // Set CSS for the control interior
  var controlText = document.createElement('div');
  controlText.innerHTML = '<b>Enable Scroll Zoom</b>';
  controlUI.appendChild(controlText);

  // Setup the click event listeners
	  google.maps.event.addDomListener(controlUI, 'click', function() {
    scrollWheel = !scrollWheel;
		map.setOptions({scrollwheel: scrollWheel, tilt:45});
    controlText.innerHTML = scrollWheel?"Disable Scroll Zoom":"Enable Scroll Zoom";
    controlUI.className = scrollWheel?"btn btn-danger btn-mini":"btn btn-primary btn-mini"
  });

}
