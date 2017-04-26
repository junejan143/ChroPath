var addAttribute = function(element, attrName, attributeValue) {
        try{
            element.setAttribute(attrName, attributeValue);
        }
        catch(err){
            return;
        }
    }
var removeAttribute = function(element, attributeName, onChange) {
        if(onChange){
                    attributeName = attributeName.includes("XPath")?"CSS":"XPath";
        }
        try{
            element.removeAttribute(attributeName);
            element.style.outline= "";
        }catch(err){
            return;
        }   
    }

var oldNodes = [];
var allNodes = [];
var highlightElements = function(xpathOrCss, xpath, onChange) {
    var elements;
    try{
        if(xpathOrCss==="XPath"){
            elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);  //xpath
        }else{
            elements = document.querySelectorAll(xpath); //css
        }
    }catch(err){
        if(xpath) {
            chrome.runtime.sendMessage({ count: "wrongXpath" });
        }else {
            chrome.runtime.sendMessage({ count: "blank" });
        }
        for (var i = 0; i < oldNodes.length; i++) {
                removeAttribute(oldNodes[i], xpathOrCss, onChange);
        }
        oldNodes = [];
        allNodes = [];
        return;
    }

    var  totalMatchFound, node;
    if(xpathOrCss==="XPath"){   
        totalMatchFound = elements.snapshotLength;  //xpath
    }else{
        totalMatchFound = elements.length;  //css
    }
        
    for (var i = 0; i < oldNodes.length; i++) {
        removeAttribute(oldNodes[i], xpathOrCss, onChange);
    }
    oldNodes = [];
    allNodes = [];
    
    chrome.runtime.sendMessage({ count: totalMatchFound });

    for (var i = 0; i < totalMatchFound; i++) {
        if(xpathOrCss==="XPath"){
             node = elements.snapshotItem(i); //xpath
        }else{
            node = elements[i]; //css
        }
        if(i===0 && !(xpath==="/" || xpath==="." || xpath==="/." || xpath==="//." || xpath==="//..")){
            node.scrollIntoViewIfNeeded();
        }
        oldNodes.push(node);
        addAttribute(node, xpathOrCss, i+1 );
        allNodes.push(node.outerHTML);

    }
    chrome.runtime.sendMessage({ count: allNodes });
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    
    if (message.xpath || message.xpath === "") {
        highlightElements(message.xpath[0], message.xpath[1], message.xpath[2]);
    }
    if (message.name === "xpath") {
        var ele = document.querySelector('[xpath="' + message.index +'"]');
        if(ele){
            ele.style.outline= "2px dotted orangered";
            ele.scrollIntoViewIfNeeded();    
        }    
    }
    if (message.name === "xpath-remove") {
        var ele = document.querySelector('[xpath="' + message.index +'"]');
        if(ele){
            ele.style.outline= "";
        }
    }
    if (message.name === "css") {
        var ele = document.querySelector('[css="' + message.index +'"]');
        if(ele){
            ele.style.outline= "2px dotted orangered";
            ele.scrollIntoViewIfNeeded();    
        }    
    }
    if (message.name === "css-remove") {
        var ele = document.querySelector('[css="' + message.index +'"]');
        if(ele){
            ele.style.outline= "";
        }
    }
});