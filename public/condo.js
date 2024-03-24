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
            var formData = new FormData();
            formData.append('image', image);

            $.ajax({
                url: '/upload-image',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log(response);
                    imagePath = `images/client-uploaded-files/${image.name}`;

                    // Continue with review submission
                    submitReview(title, content, rating, imagePath, date, condoId);
                },
                error: function(xhr, status, error) {
                    // Handle failure response
                    console.error('Error uploading image:', error);
                    alert(xhr.responseJSON.message); // Display error message
                }
            });
        } else {
            // Continue with review submission without image
            submitReview(title, content, rating, imagePath, date, condoId);
        }
    });


    // create comment form
    $(".create-comment-form").submit(function(event) { 
        // Prevent default form submission behavior
        event.preventDefault();

        $.get('/loggedInStatus', function(data) {
            if(!data.isAuthenticated) {
                alert("You must be logged in to create a comment.");
                return;
            } 

            // Get form data
            var reviewId = $(this).closest('.grid-item').attr('id');
            var content = $("#" + reviewId + " .comment-textarea").val();
            var date = new Date().toLocaleDateString();
            
            // Validate the form inputs
            if (!content) {
                alert("Please put a comment first.");
                return; // Exit the function if validation fails
            }

            // Get form data
            const formData = {
                content: content,
                date: date,
                reviewId: reviewId,
            };

            // Send POST request to server
            $.post('/create-comment', formData)
                .done(function(response) {
                    // Handle success response
                    alert(response.message); // Display success message
                    $(".comment-textarea").val("");
                    
                    // Create a new review element
                    var reviewElement = document.createElement("div");
                    reviewElement.classList.add("comment");

                    // Construct HTML content for the new review
                    reviewElement.innerHTML = `
                    <div>
                        <a href="/profile/${response.user.username}"><img src="${response.user.picture}"/></a>
                    </div>
                    <div class="comment-right">
                        <div>
                            <a href="/profile/${response.user.username}"><b>${response.user.username}</b></a> 
                            <span class="verified-checkmark">${response.user.job === 'Owner' ? '✔️' : ''}</span>
                            ${date}
                        </div>
                        <div>
                            <p>${content}</p>
                        </div>
                    </div>
                    `;

                    // Prepend the new review to the reviews container
                    $("#" + reviewId + " .comments").prepend(reviewElement);
                })
                .fail(function(xhr, status, error) {
                    // Handle failure response
                    console.error('Error creating account:', error);
                    alert(xhr.responseJSON.message); // Display error message
                });
        });
    });

$("#create-review").hide();

$("#close-create-review").click(function(){
    $("#create-review").hide();
})

$("#show-create-review").click(function() {
    $.get('/loggedInStatus', function(data) {
            if(data.isAuthenticated) { 
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

function submitReview(title, content, rating, imagePath, date, condoId) {
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
    $.ajax({
        url: '/create-review',
        type: 'PATCH',
        data: formData,
        success: function(response) {
            $("#create-review").hide();
            // Handle success response
            alert(response.message); // Display success message

            // Append the new review to the reviews container
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
                        Posted on ${date} <!-- Use current date for review date -->
                    </div>
                    <div class="star-rating" id="rating">
                        ${starIcons} <!-- Render star icons based on the rating -->
                    </div>
                </div>
                <div class="review-body">
                    <p>${content}</p>
                </div>
                <div class="review-picture">
                    ${imagePath ? `<img src="${imagePath}" alt="Review Image"/>` : ''} <!-- Include uploaded image if available -->
                </div>
                <div class="review-footer">
                    <div class="review-profile">
                        <a href="/profile/${response.user}">
                            <img src="${response.icon}"/>
                        </a>
                        <div>
                            <a href="/profile/${response.user}">
                                <b>${response.user}</b>
                            </a>
                            <br/>${response.job}
                        </div>
                    </div>
                    <div class="react-post">
                        <div class="icon-like">
                            <button type="button" class="fa fa-thumbs-up"></button>
                            <button type="button" class="fa fa-thumbs-down"></button>
                        </div>
                        0 people liked
                    </div>
                </div>
                <div><hr/><h4>Comments:</h4></div>
                
                <form id="create-comment-form" method="post">
                    <div class="comment-container">
                        <textarea class="comment-textarea" placeholder="Write your comment here..."></textarea>
                        <button class="submit-button">Comment</button>
                    </div>
                </form>
            `;

            // Prepend the new review to the reviews container
            var container = $(".reviews-container");
            container.prepend(reviewElement);

            var img = container.children(":first").find(".review-body img");
            if (imagePath) {
                img.attr("src", imagePath);
            }
        },
        error: function(xhr, status, error) {
            // Handle failure response
            console.error('Error publishing review:', error);
            alert(xhr.responseJSON.message); // Display error message
        }
    });
}