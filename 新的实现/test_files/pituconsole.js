(function() {
  var debugFlag = pageGetParam('debug');
  if (debugFlag == "1") {
    pageLoadScript("//res.tu.qq.com/assets/tu/vconsole.min.js", function() {
      console.log("debug mode");
    });
  }
})();


function pageLoadScript(filepath, onloadCallback) {
  var scriptDom = document.createElement("script");
  scriptDom.onload = scriptDom.onreadystatechange = onloadCallback;
  scriptDom.type = "text/javascript";
  scriptDom.src = filepath;
  document.body.appendChild(scriptDom);
}

function pageGetParam(pKey) {
  var queryStr = window.location.search;
  if (queryStr.length > 0) {
    var qMark = queryStr.indexOf("?");
    if (qMark >= 0) {
      queryStr = queryStr.substr(qMark + 1);
      var queryList = queryStr.split("&");
      for (var queryIndex in queryList) {
        var queryRow = queryList[queryIndex];
        var queryPair = queryRow.split("=");
        if (queryPair.length >= 2) {
          var queryKey = queryPair[0];
          if (queryKey == pKey) {
            var queryVal = decodeURIComponent(queryPair[1]);
            return queryVal;
          }
        }
      }
    }
  }
  return "";
}