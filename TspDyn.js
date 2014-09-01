
var distMat;
var distMatLayer;
function prepForTsp(){
  distMat = [[[]]];
  distMatPopulated = false;
  sTime = $("#stime").val();
  addressList = GetAddressList();
  hoursList = GetHours();
  travelmode = google.maps.TravelMode.TRANSIT;
  calcDistMat();
  return sTime != undefined || addressList != undefined || hourList!= undefined;
}
function calcDistMat(){//GRANULARITY is the number of seconds in each step
  var t = new Date();
  resultList = [];
  hrs_mins = sTime.split(":");
  if(t.getHours() > hrs_mins[0] || (t.getHours()==hrs_mins[0] && t.getMinutes() > hrs_mins[1]))
    t.setDate(t.getDate() + 1);
  t.setHours(hrs_mins[0]);
  t.setMinutes(hrs_mins[1]);
  //now we have start time in mSec
  //we will prepare a matrix from this and add layers of matrices
  //by adding adding the GRANULARITY and then doing the matrix calculation again

  /*
  for(var i = t.getTime(); i < t.getTime() + 24*3600*1000; i+=GRANULARITY*1000){
    distMatLayer = [[]];	
    for(var j = 0; j < addressList.length; j++)
      for(var k = 0; k < addressList.length;k++)
        if(j != k)

      distMat.push(distMatLayer);
  }
  */
  distMatPopulated = false;
  handleAdd(t.getTime(),0,0,t.getTime() + 12*3600*1000, addressList.length, addressList.length,GRANULARITY*1000);
  //while(!distMatPopulated){
  var delay;
    for(var tmp = 0; tmp < 1000; tmp++){delay = 10;}
  //}
  alert("Exited Wait State...");
  console.log(resultList);		      
 

}

function handleAdd(timeIdx, rowIdx, colIdx, timeLim, rowLim, colLim, timeIncrement){
  do{
    if(++colIdx >= colLim){
      colIdx = 0;
      rowIdx++;
    }
    if(rowIdx >= rowLim){
      rowIdx = 0;
      timeIdx+=timeIncrement;
      count++;
      console.log("New Slice: " + count);
      distMat.push(distMatLayer);
      distMatLayer = [[]];
    }
    if(timeIdx >= timeLim){
      distMatPopulated = true;
      return;
    }
  } while(rowIdx==colIdx);
  addToMatDone = false;
  dirService.route({
      origin: addressList[rowIdx],
      destination: addressList[colIdx],
      travelMode: travelmode,
      transitOptions: {departureTime: new Date(timeIdx)}
    }, addtoMat);
  console.log("calling handleAdd: " + [count, rowIdx, colIdx]);
  //setTimeout(function(timeIdx, rowIdx, colIdx, timeLim, rowLim, colLim, timeIncrement){handleAdd(timeIdx, rowIdx, colIdx, timeLim, rowLim, colLim, timeIncrement);}, 1);
  //while(!addToMatDone){
     var delay;
    for(var tmp = 0; tmp < 5000000000; tmp++){delay = 10;}
  //}
  handleAdd(timeIdx, rowIdx, colIdx, timeLim, rowLim, colLim, timeIncrement);
  

  function addtoMat(result, stat){
    console.log([rowIdx, colIdx, timeIdx]);
    console.log(stat);
    if(stat == google.maps.DirectionsStatus.OK && result!=undefined){
      console.log(result);
      //console.log(distMatLayer);
      //distMatLayer[colIdx][rowIdx] = result.routes[0].legs[0].duration.value;
      resultList.push([colIdx, rowIdx, result]);
    }
    addToMatDone = true;
  } 
}


function getOptPath(endNode){
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
            if(sNew&(1<<(l-2))!=0 && (tempDist = C[l-1][sNew]+hoursList[l-1] + distMat[timeIdx(C[l-1][sNew]+hoursList[l-1])][l][k])< C[k-1][s])
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
      if((currS&(1<<(k-2)))!=0 && (temp = C[k-1][currS] + hoursList[k-1] + distMat[timeIdx(C[k-1][currS] + hoursList[k-1])][k][prevV])< currMin){
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

