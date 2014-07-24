//function commute(){
  var locations = [];
  var mapObj;
	var addressList;
	var dirService;
  var mapOptions = {
    center: new google.maps.LatLng(37.7831,-122.4039),
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  }; 
  google.maps.event.addDomListener(window, 'load', initialize);
  
	
	function initialize() {
    mapObj = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    var acOptions = {
       types: []
    };

    for(var i = 0; i < 9; i++)
      locations[i] = new google.maps.places.Autocomplete(document.getElementById("autocomplete"+i),acOptions);     
  }     
  
  
  function GenerateAddressList(){
    var list=[];
		for(var i = 0; i < locations.length; i++){
			if(locations[i].getPlace()!= undefined){
				console.log("Adding: " + locations[i].getPlace().formatted_address)
				list.push(locations[i].getPlace().formatted_address);
			}
		}
		return list;
  }


  function processResponse(response, stat){
     var distMat = [];
		 for(var i = 0; i < addressList.length; i++){
       var distRow = [];
		   var row = response.rows[i].elements;
			 for(var j = 0; j < row.length; j++)
         distRow.push(row[j].duration.value);
			 distMat.push(distRow);
		 }
		 console.log(distMat);
     var optOrder = calcOptimalPath(distMat);
		 renderOnMap(optOrder);
  }

  function calcOptimalPath(distMat){
		 var distMatStr = JSON.stringify(distMat);
		 console.log(distMatStr);
		 //TODO
		 var temp = [];
		 for(var i = 0; i < addressList.length; i++)
			 temp.push(i);
		 return temp;
	}

  function renderOnMap(optPath){
		document.getElementById("indiv-steps").style.height="100%";
		document.getElementById("indiv-steps").style.width="30%";
    document.getElementById("indiv-steps").style.border = "6px solid white";
    dirService = new google.maps.DirectionsService();
		var wayPointList = [];
		for(var i = 1; i < optPath.length; i++){
      wayPointList.push({
			  location: addressList[optPath[i]],
				stopover: true
			});
		}
		dirService.route({
			  origin: addressList[optPath[0]],
			  destination: addressList[optPath[0]],
			  durationInTraffic: true,
			  optimizeWaypoints: true,
			  waypoints: wayPointList,
        travelMode: google.maps.TravelMode.DRIVING
		  },
		  function(result, stat){
		    var dirRender = new google.maps.DirectionsRenderer({
				  directions: result,
				  draggable: false,
				  map: mapObj,
				  panel:document.getElementById("indiv-steps")
				});
		  }
		);
	}
  
  function DrawOptimalPath() {
    mapObj = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
		addressList = GenerateAddressList();
    var distMatReq = {
      travelMode: google.maps.TravelMode.DRIVING,
			origins: addressList,
			destinations: addressList
    };

		var distMatServ = new google.maps.DistanceMatrixService();
		console.log(distMatServ);
		distMatServ.getDistanceMatrix(distMatReq,processResponse); 
  }
//}

