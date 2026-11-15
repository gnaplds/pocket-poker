function randomBelow(n){
  const value=new Uint32Array(1),limit=4294967296-4294967296%n;
  do{crypto.getRandomValues(value);}while(value[0]>=limit);return value[0]%n;
}
