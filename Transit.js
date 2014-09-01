var transit= {
	tryPath: function(path){
    //$('#messageArea').html(transMsg);
	  //document.getElementById("load_image").style.visibility="visible";
		$('#myModal').modal('show');
    	$('#indiv-steps').hide();
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
      		if(stat == "OK" ){
				currDur += result.routes[0].legs[0].duration.value;
        		resultList.push(result);
				currProgBar += progBarUnit;
				console.log('Current ProgressBar: ' + currProgBar + "\nProgBarUnit: " + progBarUnit);
				$('#prog-bar').width(currProgBar+'%');
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
        		if(stat != "OVER_QUERY_LIMIT"){
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
      		
      		//Redering the path on the map
      		var rendOpts = {
        		directions: combineResults(),
        		draggable: false,
        		map: mapObj,
        		panel: document.getElementById('indiv-steps')
      		};
      		dirRender.setOptions(rendOpts);      
		  $('#myModal').modal('hide');
      
		}
	}

};
