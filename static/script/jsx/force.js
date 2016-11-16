var width = window.innerWidth,
    height = window.innerHeight;

// mouse event vars
// if chosen is true, which means the note has been chosen
var selected_node = null,
    selectState = 1,
    mousedown_node = null,
    mouseup_node = null,
    chosen = false;
//Triggers rescaling - Must be at top since called by SVG Container
var zoom = d3.behavior.zoom()
    .scaleExtent([0.1, 10])
    .on("zoom", rescale);

//Create Containers
var svg = d3.select("body").append("svg")
    .call(zoom)
    .attr("width", width)
    .attr("height", height)
    .on("dblclick.zoom", null);

svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "white");


var vis = svg.append("g")
    .attr("id", "innergroup");

// needed for safari for some reason
var rect = vis.append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'white');



// Initialise Force Layout Variables
var force = d3.layout.force()
    .size([width, height])
    .nodes([{}])
    .charge(-1500)
    .linkDistance(120)
    .on("tick", tick);

// (these are declared here to set global scope)
var nodes = force.nodes(),
    links = force.links(),
    link = vis.selectAll(".link"),
    node = vis.selectAll(".node");



// add keyboard callback
d3.select(window)
    .on("keydown", keydown);


// Runs the thing!
$(document).ready(function () {
    GetData();
    resize();
    d3.select(window).on("resize", resize);

    $("#savebutton").click(function () {
        Save()
    });

    $("#updatebutton").click(function () {
        $("#selectnodes").addClass("fa-crosshairs");
        $("#selectnodes").removeClass("fa-check");
        selectState = 1;
        addDetails()
    });

    $('#nodelist').on('change',changeSelectedNode)

});

// These functions create the force layout
function start() {
    d3.json("/forceData", function (error, graph) {
        //d3.json("../static/js/graph.json", function(error, graph) {

        if (error) throw error;

        nodes = force.nodes(graph.nodes).nodes();
        links = force.links(graph.links).links();
        force.start();

        // if click the blank position, the status will be reset
        rect.on("mouseup",function(){
            chosen = false;
            resetDrawer();
        });

        link = link.data(graph.links)
            .enter().append("line")
            .attr("class", "link");

        node = node.data(graph.nodes)
            .enter().append("g").attr("class", "node")
            .on("mouseover",nodeMouseoverFn).on("mouseout",nodeMouseoutFn)
            .on("mousedown", nodeClickFn)
            .call(force.drag);

        node.append("circle")
            .attr("r", 8);
        //.call(force.drag);

        vis.selectAll(".node").append("text")
            .attr("dx", 10)
            .attr("dy", "0.35em")
            .text(function (d) {
//                return d.title
                var words = d.description.split(' ');
                return words[1]+" "+words[2];
            });
    });
}

function restart() {

    link = link.data(links);
    link.enter().insert("line", ".node")
        .attr("class", "link");
    link.exit().remove();


    node = node.data(nodes);
    nodeParent = node.enter().append("g").attr("class", "node")
        .on("mousedown", nodeClickFn).call(force.drag);

    nodeParent.insert("circle", ".cursor")
        .attr("r", 8);

    nodeParent.insert("text", ".cursor")
        .attr("dx", 10)
        .attr("dy", "0.35em")
        .text(function (d) {
            return d.title
        });


    node.exit().remove();

    node
        .classed("node_selected", function (d) {
            return d === selected_node;
        });

    force.start();
}

function tick() {
    link.attr("x1", function (d) {
            return d.source.x;
        })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        });

    node
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

}

// Interactions

function nodeClickFn(d) {
    mousedown_node = d;


    if($('#titleinput').val()==d.title){
        chosen = !chosen;
    }
    // if chosen is true, then lock the mouseover function, otherwise reset
    if(chosen == true){
        switch (selectState) {
            case 1: //nothing active
                populateDrawer(d);
                break;
            case 2: //changing linked nodes
                //changeLink(d);
                break;

        }
    }else {
        resetDrawer();
    }
}
function nodeMouseoverFn(d){
    if(chosen == false){
        populateDrawer(d);
    }
}
function nodeMouseoutFn(){
    if(chosen == false){
        resetDrawer();
    }
}

function changeSelectedNode() {
    var nodeID = $('#nodelist').val(),
        d = nodes[nodeID];

    populateDrawer(d)
}

function addDetails() {
    var title = $('#titleinput').val(),
        description = $('#descriptioninput').val();

    var index = selected_node.index

    nodes[index].title = title;
    nodes[index].description = description;

    vis.selectAll(".node").selectAll("text")
        .text(function (d) {
            return d.title
        });

    restart();
}

function changeLink(d) {

    var i = neighbours.indexOf(d.index);


    if (i == -1) {
        neighbours.push(d.index);
        links.push({source: selected_node.index, target: d.index})
        linkObnum.push(links.length - 1);

    } else {
        neighbours.splice(i, 1);
        links.splice(linkObnum[i], 1);

        linkObnum.forEach(function (e, j) {
            if (e > linkObnum[i]) {
                linkObnum[j] -= 1
            }
        });

        linkObnum.splice(i, 1);

    }

    $("#nodelist").empty();
    neighbours.forEach(function (f) {
        $("#nodelist").append($("<option></option>")
            .attr("value", nodes[f].index)
            .text(nodes[f].title));
    });

    restart()

}

// When a node is clicked on, fill in the table on the right hand side with its details
function populateDrawer(d) {
    // disable zoom
    // there was a bug here, and I just commented this, while I don't like disable the zoom after click.
    // this can be triggered by uncommenting the following line
    // svg.call(d3.behavior.zoom(), null);
//    svg.call(d3.behavior.zoom().on("zoom"), null);

    selected_node = d;

    var index = selected_node.index;

    findNeighbours(index)

    var linkindex = index + 1

    $('#titleinput').val(selected_node.title);
    $('#descriptioninput').val(selected_node.description);

    $('#questionlink').attr('href','https://app.almanis.com/#/outcomes/' + linkindex);
    $("#questionlink").html("View Question on almanis");

    $("#nodelist").empty();
    neighbours.forEach(function (f) {
        $("#nodelist").append($("<option></option>")
            .attr("value", nodes[f].index)
            .text(nodes[f].description));
    });

    node
        .classed("node_neighbour", function (d) {
            console.log(d.index);
            console.log($.inArray(d.index, neighbours));
            if ($.inArray(d.index, neighbours) == -1){
                return false;
            } else {
                return true;
            }
        });

    node
        .classed("node_selected", function (d) {
            return d === selected_node;
        });

}

// reset the table on the right hand side and the nodes
function resetDrawer(){
    $('#titleinput').val(" ");
    $('#descriptioninput').val(" ");
    $("#questionlink").empty();

    $("#nodelist").empty();
    node.classed("node_neighbour", false)
        .classed("node_selected", false);
}

function spliceLinksForNode(node) {
    toSplice = links.filter(
        function (l) {
            return (l.source === node) || (l.target === node);
        });
    toSplice.map(
        function (l) {
            links.splice(links.indexOf(l), 1);
        });
}

function keydown() {
    if (!selected_node || $("#titleinput").is(':focus') || $("#descriptioninput").is(':focus')) return;
    switch (d3.event.keyCode) {
        case 8: // backspace
        case 46:
        { // delete
            nodes.splice(nodes.indexOf(selected_node), 1);
            spliceLinksForNode(selected_node);

            //neighbours.forEach(changeLink);

            //spliceLinksForNode(selected_node);
            restart();
            break;
        }
    }

}

// SQL AJAX Functions
function GetData() {
    $.ajax({
        url: '/forceData',
        type: 'GET',
        success: function (res) {
            start()

        },
        error: function (error) {
            console.log(error);
        }
    });
}

function findNeighbours(NodeOfInterest) {
    neighbours = [];
    linkObnum = [];

    links.forEach(function (e, i) {
        if (e.source.index == NodeOfInterest) {
            neighbours.push(e.target.index);
            linkObnum.push(i);
        }
        else if (e.target.index == NodeOfInterest) {
            neighbours.push(e.source.index);
            linkObnum.push(i);
        }
    });
}


// Scale and Size Functions
function resize() {
    width = window.innerWidth, height = window.innerHeight;
    //vis.attr("width", width).attr("height", height);
    svg.attr("width", width).attr("height", height);
    //rect.attr("width", width).attr("height", height);
    force.size([width, height]).resume();
}

function rescale() {
    trans = d3.event.translate;
    scale = d3.event.scale;

    vis.attr("transform",
        "translate(" + trans + ")"
        + " scale(" + scale + ")");
}