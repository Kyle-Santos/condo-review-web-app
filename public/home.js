$(document).ready(function(){
    $("#search-condo").submit(function(event){
        event.preventDefault();

        var text = $("#condo-name").val();
        text = text.toUpperCase();

        $.post(
            'search-condo',
            {text: text},
            function(data, status){
                if(status === 'success'){
                    $("#condo-container").empty();

                    let containerHTML;

                    data.condos.forEach(function(item){
                        console.log(item.name);
                        const anchor = $('<a>').attr('href', `/condo/${item.id}`);
                        const div = $('<div>');
                        const imgContainer = $('<div>').addClass('condo-image-container');
                        const image = $('<img>').addClass('condo-list-img').attr('src', item.img);
                        const nameContainer = $('<div>').addClass('condo-name-container');
                        const name = $('<h2>').html(item.name);
                        const descContainer = $('<div>').addClass('condo-description-container');
                        const desc = $('<p>').text(item.description);
                        const ratingContainer = $('<div>').addClass('condo-rating-container');
                        const ratingText = $('<p>').text(`Average Rating: ${item.rating}/5`);
                        const progress = $('<progress>').attr('value', item.rating).attr('max',5);
                    
                        ratingContainer.append(ratingText, progress);
                        descContainer.append(desc);
                        nameContainer.append(name);
                        imgContainer.append(image);
                        div.append(imgContainer, nameContainer, descContainer, ratingContainer);
                        anchor.append(div);

                        $("#condo-container").append(anchor);
                     });
                }
                else{
                    alert('error');
                }
            }
        );
    });
});