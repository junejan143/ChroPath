var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});

var showTotalResults = function(count) {
    var totalCountElem = document.querySelector(".jsTotalCount");
    try{
        if((count).includes("blank")){
                totalCountElem.className += " hideCountMsg";
        }else{
            totalCountElem.classList.remove("hideCountMsg");
            var xpathValue = document.querySelector(".jsXpath").value;
            if((count).includes("wrongXpath")){
                totalCountElem.innerHTML = "Wrong XPath pattern. Please enter correct XPath.";
            }else if(count.length === 0){
                totalCountElem.innerHTML = count.length + " matching node found.";
            }else if(xpathValue==="/" || xpathValue==="." || xpathValue==="/."){
                totalCountElem.innerHTML = count.length + " matching node found. It's a default DOM, available left side in Elements tab.";
            }else if(xpathValue==="//."){
                totalCountElem.innerHTML = count.length + " matching node found. These are all nodes in DOM, available left side in Elements tab.";
            }else{
                if(count.length===1){
                    totalCountElem.innerHTML = count.length + " matching node found. Find the matching node below :";
                }else{
                    totalCountElem.innerText = count.length + " matching nodes found. Find the list of matching nodes below :";
                }
            }
        }
    }catch(err){

    }
};

var highlighter = function (ele) {
    var eleIndex = ele.getAttribute('xpath');
    
    backgroundPageConnection.postMessage({
            name: "xpath",
            tabId: chrome.devtools.inspectedWindow.tabId,
            index: eleIndex
    })
}

var removeHighlighter = function (ele) {
    var eleIndex = ele.getAttribute('xpath');
    
    backgroundPageConnection.postMessage({
            name: "xpath-remove",
            tabId: chrome.devtools.inspectedWindow.tabId,
            index: eleIndex
    })
}

var showAllMatchingNode = function(allNode) {
    var nodeDom = document.querySelector("#eleContainer");
    nodeDom.innerHTML = "";
    if(allNode!="blank"){
        for (var i=1; i<=allNode.length; i++) {
            allNode[i-1] = allNode[i-1] ? allNode[i-1] : "";
            if(allNode[i-1]){
                var newEle = document.createElement('li');
                newEle.className = "close";
                newEle.setAttribute('xpath', i);
                var newEleSummary = document.createElement('div');
                var newEleContent = document.createElement('div');
                newEleSummary.className = "summary";
                newEleContent.className = "content";
                var regEx1 = /(<\/)/ig;
                var regEx2 = /(^<.+?>)(.*<\/.+>$)?/ig;    

                var matches1 = allNode[i-1].match(regEx1);
                var length = matches1 ? matches1.length : 1;

                newEle.appendChild(newEleSummary);
                if(length===1){
                    newEleSummary.innerText = allNode[i-1];
                    newEleSummary.className = "simple";
                }else{
                    var matches = regEx2.exec(allNode[i-1]);
                    newEleSummary.innerText = matches[1];
                    if(matches[2]) {
                        newEleContent.innerText = matches[2];
                        newEle.appendChild(newEleContent);
                    }else{
                        newEleSummary.innerText = allNode[i-1];
                        newEleSummary.className = "simple";
                    }
                }
                newEle.onmouseover = function() {
                    highlighter(this);
                }
                newEle.onmouseout = function() {
                    removeHighlighter(this);
                }
                nodeDom.appendChild(newEle);
            }
        }
    }
};

var selectElements = function() {
    var xpath = document.querySelector(".jsXpath").value;
    
        clearElements();
        backgroundPageConnection.postMessage({
            name: "xpath-message",
            tabId: chrome.devtools.inspectedWindow.tabId,
            xpath: xpath
        });
    
};

backgroundPageConnection.onMessage.addListener(function(message) {
    var wrong;
    try{
        wrong = (message.count).includes("wrongXpath");
    }
    catch(err){
    }   
    if(wrong){
        highlightWrongXpath();
        showTotalResults(message.count);
        return; 
    }else{
        removeWrongXpath();
        showTotalResults(message.count);
        showAllMatchingNode(message.count);
        if(message.event) {
            if(message.event === "shown") {
                selectElements();
            }
        }
    }
});

backgroundPageConnection.postMessage({
    name: "init",
    tabId: chrome.devtools.inspectedWindow.tabId,
    contentScript: "../content-script/contentScript.js",
    contentCSS: "../content-script/contentScript.css"
});

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".jsXpath").focus();
    var inputBox = document.querySelector(".jsXpath");
    
    inputBox.addEventListener("keyup", function(event){
            var key = event.which || event.keyCode;
            if (key === 13) { 
                selectElements();
            }else{
                checkWrongXpath();
            }
    });


    var ulElem = document.querySelector("ul");

    ulElem.addEventListener("click", function(event) {
      if(event.target.className === "close") {
        event.target.className = "open";
      } else {
        event.target.className = "close";
      }
    });
});

var highlightWrongXpath = function() {
    var inputBox = document.querySelector(".xpath-input");
    inputBox.className += " wrongXpath";
};

var removeWrongXpath = function() {
    try{
        var inputBox = document.querySelector(".xpath-input.wrongXpath");
        inputBox.classList.remove("wrongXpath");
    }
    catch(err){
    }
};

var checkWrongXpath = function(){
    var inputBox = document.querySelector(".jsXpath");
    var xpathValue = inputBox.value;
    var totalCountElem = document.querySelector(".jsTotalCount");
    if(!xpathValue){
            totalCountElem.className += " hideCountMsg";
            selectElements();
            clearElements();
    }
    if(inputBox.getAttribute("class").includes("wrongXpath")){
        removeWrongXpath();
    }
    if(xpathValue){
        try{
             elements = document.evaluate(xpathValue, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        }catch(err){
            highlightWrongXpath();    
        }
    }   
}

var clearElements = function(){
    var listElements = document.querySelector("#eleContainer");
    var countElement = document.querySelector(".jsTotalCount");
    countElement.innerHTML = "";
    listElements.innerHTML = "";
}




