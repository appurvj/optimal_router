function TspDyn(distMat, endNode, transitMode){
  var GRANULARITY = 1800 //the time difference in distMeasurement between layers
  var N = distMat[0].length - 1;
  var optPath;
  var C = new Array(N);
  for(var i = 0; i < N; i++)
    C[i] = new Array(1<<(N-1));
  
  //Populate Cost Matrix
  for(i = 2; i <= N; i++)
    C[i-1][1<<(i-2)] = dist[0][i][i];
  
  var sNew, tempDist;
  
  
    
  
  
  
  
}