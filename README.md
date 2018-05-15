# ChroPath

## You can use the ChroPath tool to edit, inspect and generate XPath and CSS selectors.

1. Right-click on the web page, and then click Inspect.
2. In the right side of Elements tab, click on ChroPath tab.
3. To generate XPath/CSS inspect element or click on any dom node, it will generate the absolute XPath.
4. To eavluate XPath/CSS, type the XPath/CSS query and press enter key.
	As you enter, it will query in DOM for the relevant element/node. You can view the matching node(s) and nodes value as per their sequential occurrence. A blue colour outline appears around to highlight the matching elements in the web page.
5. If you mouse hover on any matching node in the ChroPath tab, blue dashed outline will convert into dotted orangered to highlight the corresponding element in the webpage.
6. If the found element is not in visible area on webpage then mouse hover on found node in ChroPath panel will scroll that element in the visible area with dotted orangered outline.
7. If found element is not highlighted but visible then on mouse hover on matching node on ChroPath tab it will highlight element with dotted oragered outline.

Note: 

1- To use CSS features, first change the dropdown value from XPath to CSS in header.
2- Tool will add xpath/css attribute to all the matching node(s) as per their sequential occurrence. For example, a matching node appearing second in the list will have xpath=2. And if verifying CSS then it will add css=2.