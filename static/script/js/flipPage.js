/**
 * Created by William on 19/12/16.
 */

pics = ["../../images/Panda%20Angry.JPG","../../images/Panda%20Lonely.JPG","../../images/Panda%20On%20the%20Tree.jpg"];

var createcards= function(d){
    var card=$('<section></section>');
    card.attr("class","col-md-4")
        .attr("class",'collection-block-card');

    var cardfront=$('<div></div>');
    cardfront.attr("class","front")
        .attr("style","background-image: url("+d["image"]+")");
    var cardTitle=$('<h3></h3>')
            .attr("class","collection-block-title")
            .html(d["collection"]);
        cardfront.append(cardTitle);

        var cardback=$('<div></div>')
            .attr("class","back")
            .append($('<h2></h2>').attr("class","flip-collections"));
        var cardDescription = $('<p></p>')
            .attr("class","collcetion-block-description")
            .append($('<a></a>'));
        cardback.append($('<h4></h4>'))
                .append(cardDescription);
        card.append(cardfront)
            .append(cardback);
        $("#cards-containter").append(card);
    };


var containter =$('<div></div>')
        .attr("id","cards-containter")
        .attr("class","collections-content")
        .attr("class","row");
$("#flipPages").append(containter);

