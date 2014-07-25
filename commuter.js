//function commute(){
  var locations = [];
  var mapObj;
	var addressList;
	var dirService;
  var mapOptions = {
    center: new google.maps.LatLng(37.7831,-122.4039),
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    scrollwheel: false
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
     var optOrder = calcOptimalPath(distMat);
		 renderOnMap(optOrder);
  }



  function calcOptimalPath(distMat){
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
		distMatServ.getDistanceMatrix(distMatReq,processResponse);
  }

  function ShowDemo(){
    mapObj = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    addressList = [];
    addressList.push("150 Piccadilly, London, United Kingdom ");
    addressList.push("20 Deans Yd, London, United Kingdom");
    addressList.push("Trafalgar Square, London, United Kingdom");
    addressList.push("King William St, United Kingdom");
    addressList.push("Riverside Bldg, County Hall, Westminster Bridge Rd, London, United Kingdom");
    var distMatReq = {
      travelMode: google.maps.TravelMode.DRIVING,
      origins: addressList,
      destinations: addressList
    };

		var distMatServ = new google.maps.DistanceMatrixService();
		distMatServ.getDistanceMatrix(distMatReq,processResponse);
  }



  function TspDyn(distMat, hours, endNode, GRANULARITY){
	  var N = distMat[0].length - 1;
	  var optPath;
	  var C = new Array(N);
	
	  for(var i = 0; i < N; i++)
	    C[i] = new Array(1<<(N-1));
	  
	  //Populate Cost Matrix
	  for(i = 2; i <= N; i++)
	    C[i-1][1<<(i-2)] = dist[0][i][i];
	  
	  var sNew, tempDist;
	  
	  for(var nV = 2; nV < N; nV++){
	    for(var s = (1<<nV)-1; s < 1<<(N-1); s = nextNumSameBitCnt(s)){
	      for(var k = 2; k <=N; k++){
					if(s&(1<<(k-2))!=0){
						C[k-1][s] = Number.MAX_VALUE;
						sNew = s^(1<<(k-2));
						for(var l = 2; l <= N; l++)
							if(sNew&(1<<(l-2))!=0 && (tempDist = C[l-1][sNew]+hours[l-1] + distMat[timeIdx(C[l-1][sNew]+hours[l-1])][l][k])< C[k-1][s])
								C[k-1][s] = tempDist;
					}
					if(C[k-1][s] > 24*3600){//total seconds in a day
             alert("total commute duration exceeds 24 hrs");
						 return undefined;
					}
				}
			}
		}

		//Calculate optimal Path
		//TODO: need to ensure that the path sent is base 0
		optPath = new Array(N);
		optpath[0] = 1;
		var currS = (1<<(N-1)) - 1;
		var vIdx = N-1, prevV = 0;
		
    if(endNode > 0){
      optPath[vIdx--] = endNode+1;
      currS^=1<<(endNode-1);
    }
		else if(endNode==0)
      prevV = optPath[vIdx+1] = 1;
		
    var currMin, temp;
    while(vIdx > 0){
      currMin = Number.MAX_VALUE;
      for(var k = 2; k <=N; k++){
        if((currS&(1<<(k-2)))!=0 && (temp = C[k-1][currS] + hours[k-1] + distMat[timeIdx(C[k-1][currS] + hours[k-1])][k][prevV])< currMin){
          currMin = temp;
          optPath[vIdx] = k;
        }
      }
      prevV = optPath[vIdx]; //need to do this assignment outside loop since the if stmt depends on prevV
      currS^=1<<(prevV-2);
      vIdx--;
    }
    for(var i = 0; i < optPath.length; i++)
      optPath[i]--;
    alert(optPath);
    return optPath;
		
	  
	  function timeIdx(seconds){
	    return Math.floor(timeIdx/GRANULARITY) + 1;
	  }	
	
		function nextNumSameBitCnt(x){
	    var setHigherBit = x + x&(-x);
			return setHigherBit|((x^setHigherBit)/(x&(-x)))>>2;
		}  
  }

//}

