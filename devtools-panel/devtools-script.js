var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});

var showTotalResults = function(count) {
    var totalCountElem = document.querySelector(".jsTotalCount");
    var xpathOrCss = document.querySelector(".boxTitle").value;
    try{
        if((count).includes("blank")){
                totalCountElem.className += " hideCountMsg";
        }else{
            totalCountElem.classList.remove("hideCountMsg");
            var xpathValue = document.querySelector(".jsXpath").value;
            if((count).includes("wrongXpath")){
                totalCountElem.innerHTML = "Invalid "+xpathOrCss+" pattern. Please enter valid "+xpathOrCss+".";
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
    var xpathOrCss = document.querySelector(".boxTitle").value.toLocaleLowerCase();
    var eleIndex = ele.getAttribute(xpathOrCss);

    backgroundPageConnection.postMessage({
            name: xpathOrCss,
            tabId: chrome.devtools.inspectedWindow.tabId,
            index: eleIndex
    })
}

var removeHighlighter = function (ele) {
    var xpathOrCss = document.querySelector(".boxTitle").value.toLocaleLowerCase();
    var eleIndex = ele.getAttribute(xpathOrCss);
    
    backgroundPageConnection.postMessage({
            name: xpathOrCss+"-remove",
            tabId: chrome.devtools.inspectedWindow.tabId,
            index: eleIndex
    })
}

var showAllMatchingNode = function(allNode) {
    var nodeDom = document.querySelector("#eleContainer");
    var xpathOrCss = document.querySelector(".boxTitle").value.toLocaleLowerCase();
    nodeDom.innerHTML = "";
    if(allNode!="blank"){
        for (var i=1; i<=allNode.length; i++) {
            allNode[i-1] = allNode[i-1] ? allNode[i-1] : "";
            if(allNode[i-1]){
                var newEle = document.createElement('li');
                newEle.className = "close";
                newEle.setAttribute(xpathOrCss, i);
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

var selectElements = function(xpathOrCss, onChange) {
    var xpath = [xpathOrCss, document.querySelector(".jsXpath").value, onChange];
    clearElements();
    backgroundPageConnection.postMessage({
        name: "xpath-message",
        tabId: chrome.devtools.inspectedWindow.tabId,
        xpath: xpath
    });   
};

backgroundPageConnection.onMessage.addListener(function(message) {
    var wrong;
    var xpathOrCss = document.querySelector(".boxTitle").value;
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
                selectElements(xpathOrCss, false);
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
    var inputBox = document.querySelector(".jsXpath");
    inputBox.focus();
    var boxTitle = document.querySelector(".boxTitle");
    
    boxTitle.addEventListener("change", function(){
        var xpathOrCss = boxTitle.value;
        if(xpathOrCss.includes("CSS")){
            inputBox.setAttribute("placeholder"," type CSS selector and press enter");
            boxTitle.style.backgroundColor = "rgba(76, 175, 80, 0.78)";
        }else{
            inputBox.setAttribute("placeholder"," type XPath and press enter");
            boxTitle.style.backgroundColor = "rgba(169, 169, 169, 0.64)";
        }
        inputBox.focus();
        selectElements(xpathOrCss, true);
    });

    inputBox.addEventListener("keyup", function(event){
            var xpathOrCss = boxTitle.value;
            var key = event.which || event.keyCode;
            if (key === 13) { 
                selectElements(xpathOrCss, false);
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
    var xpathOrCss = document.querySelector(".boxTitle").value;
    if(!xpathValue){
            totalCountElem.className += " hideCountMsg";
            selectElements(xpathOrCss, false);
            clearElements();
    }
    if(inputBox.getAttribute("class").includes("wrongXpath")){
        removeWrongXpath();
    }

    if(xpathValue){
        try{
            if(xpathOrCss==="XPath"){
                elements = document.evaluate(xpathValue, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            }else if(xpathOrCss==="CSS"){
                elements = document.querySelectorAll(xpathValue);
            }
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
      
chrome.devtools.panels.elements.onSelectionChanged.addListener(function(){
    var xpathOrCss = document.querySelector(".boxTitle").value;
    if(xpathOrCss.includes("XPath")){
        var absoluteXPath = chrome.devtools.inspectedWindow.eval('generateXpath($0)', { useContentScriptContext: true }, function(result) {
            console.log("absolute XPath -"+result);
            var inputBox = document.querySelector(".jsXpath");
            inputBox.value = result;
            inputBox.focus();
            //inputBox.setAttribute("value",result);
        });
    }else{
        var absoluteXPath = chrome.devtools.inspectedWindow.eval('generateCSS($0)', { useContentScriptContext: true }, function(result) {
            console.log("CSS -"+result);
            var inputBox = document.querySelector(".jsXpath");
            inputBox.value = result;
            inputBox.focus();
        });
    }
    selectElements(xpathOrCss, false);
}); 





