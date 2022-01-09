function drawGraph(data) {
	var g = new dagreD3.graphlib.Graph({ multigraph: true }).setGraph({
		rankdir: "LR"
	});

    data.nodes.forEach((node, index) => {
        let link = "https://etherscan.io/address/" + node.address;
        let name = node.name;
        let nodeObj = {
            labelType: "html",
            label: "<a href=" + link + ">" + name + "</a>",
            id: node.address
        };
        g.setNode(node.address, nodeObj);
    });

    data.transfers.forEach((element, index) => {

        let edgeLink = "https://etherscan.io/address/" + element.token;
        let edgeName = element.tokenName;
        let edgeObj = 
        {
            labelType: "html",
            label:
                " " +
                index +
                ") " +
                element.value +
                " <a href=" +
                edgeLink +
                ">" +
                edgeName +
                "</a>",
            transactionInfo: element
                // + "\n " + element.type + " \n islog " + element.isLog ,
            // curve: d3.curveBasis
        }
        g.setEdge(
            element.from,
            element.to,
            edgeObj,
            index
        );
    });

	g.nodes().forEach(function (v) {
		let node = g.node(v);
		node.rx = node.ry = 10;
	});

	// Create the renderer
	var render = new dagreD3.render();

	var svg = d3.select("svg");
	var inner = svg.append("g");

	var zoom = d3.zoom()
        .on("zoom", function () {
            inner.attr("transform", d3.event.transform);
        });
	svg.call(zoom);

    // Simple function to style the tooltip for the given node.
    var styleTooltip = function(info, description) {
        return "<p class='info'>" + info + "</p><p class='description'>" + description + "</p>";
    };

    // Simple function to style the tooltip for the given node.
    var errorStyleTooltip = function(error) {
        return "<p class='error'>" + error + "</p>";
    };
    
	// Run the renderer. This is what draws the final graph.
	render(inner, g);

    inner.selectAll("g.edgeLabel")
        .attr("title", function(v, index) 
            { 
                let foundEdge = g.edge(v);
                let transactionInfo = foundEdge.transactionInfo;
                if(transactionInfo.error != undefined){

                    let elem = $("#"+transactionInfo.to).select("rect");
                    elem.attr("class", "node error");
                    if(index === 0){
                        let otherElem = $("#"+transactionInfo.from).select("rect");
                        otherElem.attr("class", "node error");
                    }
                    return errorStyleTooltip("Error: " + transactionInfo.error);
                }else{
                    return styleTooltip("Useful header", "Useful description");
                }
            }
        ).each(
            function(v) 
            { 
                let foundEdge = g.edge(v);
                let transactionInfo = foundEdge.transactionInfo;
                let tipsyObj = { gravity: "s", opacity: 0.9, html: true };
                if(transactionInfo.error != undefined)
                {
                    tipsyObj.hoverlock = true;
                    tipsyObj.className = "error";
                }
                $(this).tipsy(tipsyObj); 
            });

	var graphWidth = g.graph().width;
    var graphHeight = g.graph().height;
    var width = parseInt(svg.style("width").replace(/px/, ""));
    var height = parseInt(svg.style("height").replace(/px/, ""));
    var zoomScale = Math.min(width / graphWidth, height / graphHeight);
    var translateX = (width / 2) - ((graphWidth * zoomScale) / 2)
    var translateY = (height / 2) - ((graphHeight * zoomScale) / 2);
	var svgZoom = svg.transition().duration(500);
	svgZoom.call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(zoomScale));	
}

async function getTransfers() {
	let hostname = window.location.hostname;
	let pathname = window.location.pathname;
	let _txhash = pathname.substring(4);

	if (_txhash.length != 66) {
		return { err: "Transaction hash length not matching" };
	}

	let _url = "http://" + hostname + ":3000/transfers/" + _txhash;

	let response = await fetch(_url);

    let text = await response.text();
    let data = text ? JSON.parse(text) : {};
	return data;
}

getTransfers().then(txObj => {{
    drawGraph(txObj);
  }});