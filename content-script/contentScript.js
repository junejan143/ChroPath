var addAttribute = function(element, attrName, attributeValue) {
        try{
            element.setAttribute(attrName, attributeValue);
        }
        catch(err){
            return;
        }
    }
var removeAttribute = function(element, attributeName) {
        try{
            element.removeAttribute(attributeName);
            element.style.outline= "";
        }catch(err){
            return;
        }   
    }

var oldNodes = [];
var allNodes = [];
var highlightElements = function(xpath) {
    var elements;
    try{
         elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    }catch(err){
        if(xpath) {
            chrome.runtime.sendMessage({ count: "wrongXpath" });
        }else {
            chrome.runtime.sendMessage({ count: "blank" });
        }
        for (var i = 0; i < oldNodes.length; i++) {
                removeAttribute(oldNodes[i], "xpath");
        }
        oldNodes = [];
        allNodes = [];
        return;
    }   
    var  totalMatchFound = elements.snapshotLength,
        node;
    for (var i = 0; i < oldNodes.length; i++) {
        removeAttribute(oldNodes[i], "xpath");
    }
    oldNodes = [];
    allNodes = [];
    
    chrome.runtime.sendMessage({ count: totalMatchFound });

    for (var i = 0; i < totalMatchFound; i++) {
        node = elements.snapshotItem(i);
        if(i===0 && !(xpath==="/" || xpath==="." || xpath==="/." || xpath==="//." || xpath==="//..")){
            node.scrollIntoViewIfNeeded();
        }
        oldNodes.push(node);
        addAttribute(node, "xpath", i+1 );
        allNodes.push(node.outerHTML);

    }
    chrome.runtime.sendMessage({ count: allNodes });
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    
    if (message.xpath || message.xpath === "") {
        highlightElements(message.xpath);
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
});

