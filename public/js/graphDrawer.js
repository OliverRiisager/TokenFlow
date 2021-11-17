function drawGraph(data) {
    console.log('drawer');
	var g = new dagreD3.graphlib.Graph({ multigraph: true }).setGraph({
		rankdir: "LR"
	});

    data.nodes.forEach(node => {
        let link = "https://etherscan.io/address/" + node.address;
        let name = node.name;
        g.setNode(node.address, {
            labelType: "html",
            label: "<a href=" + link + ">" + name + "</a>"
        });
    });

    data.transfers.forEach((element, index) => {

        let edgeLink = "https://etherscan.io/address/" + element.token;
        let edgeName = element.tokenName;
        g.setEdge(
            element.from,
            element.to,
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
                // curve: d3.curveBasis
            },
            index
        );
    });

	g.nodes().forEach(function (v) {
		let node = g.node(v);
		node.rx = node.ry = 10;
	});

	var svg = d3.select("svg");
	svg.selectAll("*").remove();
	svg.append("g");
	var inner = svg.select("g");
	

	// Create the renderer
	var render = new dagreD3.render();

	// Run the renderer. This is what draws the final graph.
	render(inner, g);

    
	var zoom = d3.zoom().on("zoom", function () {
		inner.attr("transform", d3.event.transform);
	});
	svg.call(zoom);

	var graphWidth = g.graph().width + 80;
    var graphHeight = g.graph().height + 40;
    var width = parseInt(svg.style("width").replace(/px/, ""));
    var height = parseInt(svg.style("height").replace(/px/, ""));
    var zoomScale = Math.min(width / graphWidth, height / graphHeight);
    var translateX = (width / 2) - ((graphWidth * zoomScale) / 2)
    var translateY = (height / 2) - ((graphHeight * zoomScale) / 2);
	var svgZoom = svg.transition().duration(500);
	svgZoom.call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(zoomScale));	
}

async function getTransfersEpic() {
	let hostname = window.location.hostname;
	let pathname = window.location.pathname;
	let _txhash = pathname.substring(4);

	console.log("Reading transaction: ", _txhash);
	console.log(hostname);

	if (_txhash.length != 66) {
		console.log("i am smol");
		return { err: "Transaction hash length not matching" };
	}

	let _url = "http://" + hostname + ":3000/transfers/" + _txhash;
	console.log(_url);

	let response = await fetch(_url);

    var text = await response.text();
    console.log(text);
    var data = text ? JSON.parse(text) : {};
    console.log(data);
	return data;
}

getTransfersEpic().then(txObj => {{
    console.log(JSON.stringify(txObj));
    drawGraph(txObj);
  }});