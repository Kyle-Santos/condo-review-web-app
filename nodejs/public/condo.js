var ratingButtons;
$(document).ready(function(){
    // create review form
    
    $("#create-review-form").submit(function(event) {
        // Prevent default form submission behavior
        event.preventDefault();

        // Get form data
        var title = $("#review-title").val().trim();
        var content = $("#review-content").val().trim();
        var rating = getRating();

        // Validate the form inputs
        if (!title || !content || rating === 0) {
            alert("Please fill in the title, content, and select a star rating.");
            return; // Exit the function if validation fails
        }

        // Get uploaded image if available
        var image = $("#add-image").prop('files')[0];
        var imagePath;

        // Get the current URL path
        const condoId = window.location.pathname.split('/condo/')[1];

        var date = new Date().toLocaleDateString();

        // send image to the server
        if (image) {
            console.log(image);
            // $.post('/upload-image', { image: image })
            //     .fail(function(xhr, status, error) {
            //         // Handle failure response
            //         console.error('Error creating account:', error);
            //         alert(xhr.responseJSON.message); // Display error message
            //     });
            imagePath = `images/client-uploaded-files/${image.originalname}`;
        }

        // Get form data
        const formData = {
            condoId: condoId,
            title: title,
            content: content,
            rating: rating,
            image: imagePath,
            date: date,
        };

        // Send PATCH request to server
        // $.ajax({
        //     url: '/create-review',
        //     type: 'PATCH',
        //     data: formData,
        //     success: function(response) {
        //         // Handle success response
        //         alert(response.message); // Display success message
        //     },
        //     error: function(xhr, status, error) {
        //         // Handle failure response
        //         console.error('Error publishing review:', error);
        //         alert(xhr.responseJSON.message); // Display error message
        //     }
        // });

        let starIcons = '';
        for (let i = 1; i <= rating; i++) {
            starIcons += '<svg xmlns="http://www.w3.org/2000/svg" class="star-on" viewBox="0 0 24 24" role="presentation">' +
                '<path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"></path>' +
                '</svg>';
        }
        for (let i = rating + 1; i <= 5; i++) {
            starIcons += '<svg xmlns="http://www.w3.org/2000/svg" class="star-off" viewBox="0 0 24 24" fill="currentColor" role="presentation">' +
                '<path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"></path>' +
                '</svg>';
        }

        // Create a new review element
        var reviewElement = document.createElement("div");
        reviewElement.classList.add("grid-item");
        
        // Construct HTML content for the new review
        reviewElement.innerHTML = `
            <div class="review-header">
                <div>
                    <h3>${title}</h3>
                    ${date} <!-- Use current date for review date -->
                </div>
                <div class="star-rating" id="rating">
                    ${starIcons} <!-- Render star icons based on the rating -->
                </div>
            </div>
            <div class="review-body">
                <p>${content}</p>
                
            </div>
            <div class="review-picture">
            ${image ? `<img src="${URL.createObjectURL(image)}" alt="Review Image"/>` : ''} <!-- Include uploaded image if available -->
            </div>
            <div class="review-footer">
                <div class="review-profile">
                    <img src="../images/man.png"/>
                    <div>
                        <b>Unknown</b>
                        <br/>N/A
                    </div>
                </div>
            </div>
        `;
        
        // Append the new review to the reviews container
        var container = $(".reviews-container");
        container.prepend(reviewElement);

        var img = container.children(":first").find(".review-body img");
        if (image) {
            var reader = new FileReader();
            
            reader.onload = function(event) {
                img.attr("src", event.target.result);
            };
            
            reader.readAsDataURL(image);
        }
        
        // Clear form inputs
        $("#review-title").value = "";
        $("#review-content").value = "";
        resetStars();
        // Reattach the mouseenter and mouseleave event listener 
        $('.star-rating-button').on('mouseenter', selectStars);
        $('.star-rating-button').on('mouseleave', resetStars);

        $("#create-review").hide();
    });

    $("#create-review").hide();

    $("#close-create-review").click(function(){
        $("#create-review").hide();
    })

    $("#show-create-review").click(function() {
        $.get('/loggedInStatus', function(data) {
             if(data.status > 0) { // Assuming status > 0 means logged in
                 $("#create-review").show();
             } else {
                 alert("You must be logged in to create a review.");
             }
        //    $("#create-review").show();
        });
    });

    function showLogInView(){
        $(".nav-logged-out").hide();
        $(".nav-logged-in").show();
    }

    // 
    $('.star-rating-button').on('mouseenter', selectStars);

    $('.star-rating-button').on('mouseleave', resetStars);

    $('.star-rating-button').on('click', function() {
        const ratingValue = $(this).data('rating');
        highlightStars(ratingValue);

        // Remove the mouseenter and mouseleave event listeners from all buttons
        $('.star-rating-button').off('mouseenter mouseleave');
    });

    function selectStars() {
        const ratingValue = $(this).data('rating');
        highlightStars(ratingValue);
    }

    function highlightStars(rating) {
        $('.star-rating-button').each(function() {
            const buttonRating = $(this).data('rating');
            if (buttonRating <= rating) {
                $(this).addClass('active');
            } else {
                $(this).removeClass('active');
            }
        });
    }

    function resetStars() {
        $('.star-rating-button').removeClass('active');
    }
});

function getRating() {
    let maxRating = 0;
    $('.star-rating-button').each(function() {
        if ($(this).hasClass('active')) {
            const buttonRating = parseInt($(this).data('rating'));
            maxRating = Math.max(maxRating, buttonRating);
        }
    });
    return maxRating;
}

function addReview() {
    // Get values from form inputs
    var title = $("#review-title").val();
    var content = $("#review-content").val();
    var rating = getRating(); 
    
    // Get uploaded image if available
    var imageFileInput = document.getElementById("image-upload");
    var image = imageFileInput != null ? imageFileInput.files[0] : null;

    let starIcons = '';
    for (let i = 1; i <= rating; i++) {
        starIcons += '<svg xmlns="http://www.w3.org/2000/svg" class="star-on" viewBox="0 0 24 24" role="presentation">' +
            '<path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"></path>' +
            '</svg>';
    }
    for (let i = rating + 1; i <= 5; i++) {
        starIcons += '<svg xmlns="http://www.w3.org/2000/svg" class="star-off" viewBox="0 0 24 24" fill="currentColor" role="presentation">' +
            '<path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"></path>' +
            '</svg>';
    }

    // Create a new review element
    var reviewElement = document.createElement("div");
    reviewElement.classList.add("grid-item");
    
    // Construct HTML content for the new review
    reviewElement.innerHTML = `
        <div class="review-header">
            <div>
                <h3>${title}</h3>
                ${new Date().toLocaleDateString()} <!-- Use current date for review date -->
            </div>
            <div class="star-rating" id="rating">
                ${starIcons} <!-- Render star icons based on the rating -->
            </div>
        </div>
        <div class="review-body">
            <p>${content}</p>
            ${image ? `<img src="${URL.createObjectURL(image)}" alt="Review Image"/>` : ''} <!-- Include uploaded image if available -->
        </div>
        <div class="review-footer">
            <img src="../images/man.png"/>
            <div>
                <b>Unknown</b>
                <br/>N/A
            </div>
        </div>
    `;
    
    // Append the new review to the reviews container
    var container = $(".reviews-container").eq(0);
    container.insertBefore(reviewElement, container.firstChild);
    
    // Clear form inputs
    $("$review-title").value = "";
    $("#review-content").value = "";
    // document.getElementById("image-upload").value = ""; // Reset file input
    return false; // Prevent page refresh

    
}