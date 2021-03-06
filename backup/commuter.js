
  function calcOptimalPath(){
		 //TODO
		 var temp = [];
		 for(var i = 0; i < addressList.length; i++)
			 temp.push(i);
     temp.push(0);
		 return temp;
	}

  function onSubmit(){
    prepGlobalVars();
		if(addressList.length < 2){
      alert("Atleast two addresses needed...Click 'Sample Input' for sample input..")
			return;
		}

    if(travelmode == "TRANSIT")
      transit.tryPath(calcOptimalPath());
    else
      renderOnMap(calcOptimalPath());
      
  }

  
  
  function renderOnMap(optPath){
		document.getElementById("indiv-steps").style.height="100%";
		document.getElementById("indiv-steps").style.width="30%";
    document.getElementById("indiv-steps").style.border = "6px solid darkgrey";
    document.getElementById("load_image").style.visibility="visible";
    window.location = document.getElementById("go-to-result").href;
    dirService = new google.maps.DirectionsService();
		var wayPointList = [];
		for(var i = 1; i < optPath.length-1; i++){
      wayPointList.push({
			  location: addressList[optPath[i]],
				stopover: true
			});
		}
    var directionsRequest = {
			  origin: addressList[optPath[0]],
			  destination: addressList[optPath[optPath.length-1]],
			  durationInTraffic: true,
			  optimizeWaypoints: true,
			  waypoints: wayPointList,
        travelMode: travelmode
		  };

		dirService.route(directionsRequest,
		  function(result, stat){
				dirRender.setMap(null);
				dirRender.setPanel(null);
				dirRender.setOptions({
				  directions: result,
					draggable: false,
          map: mapObj,
					panel: document.getElementById("indiv-steps")
				});
		  });
      document.getElementById("load_image").style.visibility="hidden";
	}
  





  function DrawOptimalPath() {
		prepGlobalVars();
		if(addressList.length <= 0){
      alert("No Usable Addresses Entered!!");
			return;
		}
    var distMatReq = {
      travelMode: travelmode,
			origins: addressList,
			destinations: addressList
    };
    renderOnMap(calcOptimalPath);
		window.location = document.getElementById("go-to-result").href;
  }

  function prepGlobalVars(){
    if(selectedMode == "TRANSIT"){
      sTime = GetDate();
      hoursList = GetHours();
		}
    addressList = GetAddressList();	
	}




  //TODO: Break the demo part into a seperate file
  function prepForDemo(){
    var addrs = [];
		var hrs = [1.2, 0.8, 1.5, 2];
    addrs.push("150 Piccadilly, London, United Kingdom ");
    addrs.push("Big Ben, London, United Kingdom");
    addrs.push("Westminster Abbey, London, United Kingdom");
    addrs.push("London Bridge, King William Street, City of London, United Kingdom");
    addrs.push("London Eye, Westminster Bridge Road, London, United Kingdom`");
    var addrIp = $('[name="autocomp"]');
    var hoursIp = $('[name="hrs"]');
    
    for(var idx = 0; idx < addrs.length; idx++){
      addrIp[idx].value = addrs[idx]
      if(idx < hrs.length) hoursIp[idx].value = hrs[idx];
    }
    $("#stime").val("09:00");
    /*
		return {
			addr: addressList,
			//latLang: latLangList,
			hrs: hoursList,
			start: "09:00",
			travelMode: google.maps.TravelMode.TRANSIT,
			endNode: 0 //-1 means no end node specified
		};
    */
	}


  function ShowDemo(){
     prepForDemo();
     $("#autocomplete0").focus();
     //var dn = $.Event("keypress", {keycode: 40, which: 40});
     //var ent = $.Event("keypress", {keycode: 13, which: 13});
     //$('#autocomplete0').trigger(dn).trigger(ent);
     jQuery.event.trigger({ type : 'keypress', which : 40});
     jQuery.event.trigger({ type : 'keypress', which : 13});
  }


