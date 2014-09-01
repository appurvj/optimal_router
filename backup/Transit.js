var transit= {
	tryPath: function(path){
    $('#messageArea').html(transMsg);
    document.getElementById("indiv-steps").style.width="0%";
    document.getElementById("indiv-steps").style.border = "";
	  document.getElementById("load_image").style.visibility="visible";
    window.location = document.getElementById("go-to-result").href;
    dirRender.setMap(null);
    dirRender.setPanel(null); 
    var idx = 0;
		var currDur = 0;
    var addrList = addressList;
    var tMode = travelmode;
    resultList = [];
    var sMillis = sTime.getTime();
    var hrs = hoursList;
    console.log("processing started")
		dirService.route({
		  origin: addrList[path[idx]],
      destination: addrList[path[idx+1]],
      travelMode: tMode,
      transitOptions: {departureTime: new Date(sMillis + currDur*1000 + hrs[idx]*1000)}
		},handleResult);
    console.log("Sent first request..");
    
		function handleResult(result, stat){
      console.log("Idx: " + idx);
      console.log("Origin: " + addrList[path[idx]]);
      console.log("Destination: " + addrList[path[idx + 1]]);
      if(stat == "OK" ){
				currDur += result.routes[0].legs[0].duration.value;
        resultList.push(result);

			  idx++;
			  if(idx < path.length - 1){
          setTimeout(function(){
            dirService.route({
              origin: addrList[path[idx]],
              destination: addrList[path[idx+1]],
              travelMode: tMode,
              transitOptions: {departureTime: new Date(sMillis + currDur*1000 + hrs[idx]*1000)}
            },handleResult);},1050);
		    }else{
					processResult();
				}
			}else{
        console.log(stat);
				console.log("Path Node: " + path[idx]);
        if(stat != "OVER_QUERY_LIMIT"){
          $('#messageArea').html("<b>Cound not find address: " + addressList[path[idx]]+". Skipping..</b>");
          ++idx;
        }
        if(idx == path.length-1){
          processResult();
        }else{
          setTimeout(
              function(){dirService.route({
                origin: addrList[path[idx]],
                destination: addrList[path[idx+1]],
                travelMode: tMode,
                transitOptions: {departureTime: new Date(sMillis + currDur*1000 + hrs[idx]*1000)}
              },handleResult);},2200);
        }
			}
		}

		function processResult(){
      console.log("Reached process Result!!");
      console.log(resultList);
      document.getElementById("indiv-steps").style.width="30%";
      document.getElementById("indiv-steps").style.border = "6px solid white";
      dirRender.setMap(null);
      dirRender.setPanel(null);  
      dirRender.setOptions({
        directions: combineResults(),
        draggable: false,
        map: mapObj,
        panel: document.getElementById("indiv-steps")
      });      
	    document.getElementById("load_image").style.visibility="hidden";
      
		}
	}

};
