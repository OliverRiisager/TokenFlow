function drawGraph(data) {
	var g = new dagreD3.graphlib.Graph({ multigraph: true }).setGraph({
		rankdir: "LR"
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
        if(element.error != undefined){
           toNodeIndex = data.nodes.findIndex(x => x.address === element.to);
           fromNodeIndex = data.nodes.findIndex(x => x.address === element.from);
           data.nodes[toNodeIndex].hasError = true;
           data.nodes[fromNodeIndex].hasError = true;
            
        }
        g.setEdge(
            element.from,
            element.to,
            edgeObj,
            index
        );
    });

    data.nodes.forEach((node, index) => {
        let link = "https://etherscan.io/address/" + node.address;
        let name = node.name;
        let nodeLabel = "<a href=" + link + ">" + name + "</a>";
        let nodeStyle = "fill: #fff"
        if(node.hasError){
            nodeLabel = "&#9888; <a href=" + link + ">" + name + "</a>"
            nodeStyle =  "fill: #fa9d9d";
        }
        let nodeObj = {
            labelType: "html",
            label: nodeLabel,
            style: nodeStyle,
            id: node.address
        };
        g.setNode(node.address, nodeObj);
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
    var styleTooltip = function(to, from, type, isLog) {
       return `<div class='transactionPopup'>
            <div class='tofrom'>
                <p>To : ${to}</p>
                <p>From : ${from}</p>
            </div>
            <p class='transactionType'>Transaction type : ${type}</p>
            <p class='transactionIsLog'>Is log : ${isLog}</p>
        </div> `
    };

    // Simple function to style the tooltip for the given node.
    var errorStyleTooltip = function(error, to, from, type) {
            return `<div class='transactionPopup error'>
            <p class="error">Error : ${error}</p>
            <div class='tofrom'>
                <p>To : ${to}</p>
                <p>From : ${from}</p>
            </div>
            <p class='transactionType'>Transaction type : ${type}</p>
            </div> `
    };
    
	// Run the renderer. This is what draws the final graph.
	render(inner, g);

    inner.selectAll("g.edgeLabel")
        .attr("title", function(v, index) 
            { 
                let foundEdge = g.edge(v);
                let transactionInfo = foundEdge.transactionInfo;
                if(transactionInfo.error != undefined){

                    // let elem = $("#"+transactionInfo.to).select("rect");
                    // elem.attr("class", "node error");
                    // if(index === 0){
                    //     let otherElem = $("#"+transactionInfo.from).select("rect");
                    //     otherElem.attr("class", "node error");
                    // }
                    return errorStyleTooltip("Error: " + transactionInfo.error, transactionInfo.to, transactionInfo.from, transactionInfo.type);
                }else{
                    return styleTooltip(transactionInfo.to, transactionInfo.from, transactionInfo.type, transactionInfo.isLog != undefined);
                }
            }
        ).each(
            function(v) 
            { 
                let foundEdge = g.edge(v);
                let transactionInfo = foundEdge.transactionInfo;
                let tipsyObj = { gravity: "s", opacity: 0.9, html: true };
                tipsyObj.hoverlock = true;
                if(transactionInfo.error != undefined)
                {
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

function onStartGetTransfers(){
        
	let pathname = window.location.pathname;
	let _txhash = pathname.substring(4);

	if (_txhash.length != 66) {
        return;
	}
    getTransfers().then(txObj => {{
        drawGraph(txObj);
    }});
}

onStartGetTransfers();