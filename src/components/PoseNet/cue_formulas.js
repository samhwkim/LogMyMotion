function distanceFormula(x1, y1, x2, y2) {
  var result = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
  return result;
}

function slopeFormula(x1, y1, x2, y2) {
  var result = Math.abs((y2 - y1) / (x2 - x1));
  return result;
}
