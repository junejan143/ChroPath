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

function generateXpath(element) {
    if (element.id!=='')
        return 'id("'+element.id+'")';
    if (element.tagName == 'html')
        return '/html[1]';
    if (element===document.body)
        return '/html[1]/body[1]';

    var ix= 0;
    var siblings= element.parentNode.childNodes;
    for (var i= 0; i<siblings.length; i++) {
        var sibling= siblings[i];
        if (sibling===element)
            return generateXpath(element.parentNode)+'/'+element.tagName.toLowerCase()+'['+(ix+1)+']';
        if (sibling.nodeType===1 && sibling.tagName.toLowerCase()===element.tagName.toLowerCase())
            ix++;
    }
}

function generateCSS(el) {
        if (!(el instanceof Element)) 
            return;
        var path = [];
        while (el.nodeType === Node.ELEMENT_NODE) {
            var selector = el.nodeName.toLowerCase();
            if (el.id){
                path.unshift('#'+el.id);
                break;
            }else if (el.className){
                path.unshift('.'+el.className.trim().replace(/\s+/g, "."));
                break;
            }else {
                var sib = el, nth = 1;
                while (sib = sib.previousElementSibling) {
                    if (sib.nodeName.toLowerCase() == selector)
                       nth++;
                    }
                    if (nth != 1)
                        selector += ":nth-of-type("+nth+")";
                }
            path.unshift(selector);
            el = el.parentNode;
        }
        return path.join(">");
}
