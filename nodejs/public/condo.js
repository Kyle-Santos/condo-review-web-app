var ratingButtons;
$(document).ready(function(){
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
        });
    });

    function showLogInView(){
        $(".nav-logged-out").hide();
        $(".nav-logged-in").show();
    }

    // 
    ratingButtons = document.querySelectorAll('.star-rating-button');
    console.log(ratingButtons);

    ratingButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            const ratingValue = button.getAttribute('data-rating');
            console.log(ratingValue);
            highlightStars(ratingValue);
        });

        button.addEventListener('click', function() {
            // event.preventDefault(); // Prevent form submission
            const ratingValue = button.getAttribute('data-rating');
            console.log('You rated:', ratingValue);
            highlightStars(ratingValue);
        });

        button.addEventListener('mouseleave', resetStars);
    });

    function highlightStars(rating) {
        ratingButtons.forEach(button => {
            const buttonRating = button.getAttribute('data-rating');
            if (buttonRating <= rating) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    function resetStars() {
        ratingButtons.forEach(button => {
            button.classList.remove('active');
        });
    }
});

function getRating() {
    let maxRating = 0;
    ratingButtons.forEach(button => {
        if (button.classList.contains('active')) {
            const buttonRating = parseInt(button.getAttribute('data-rating'));
            maxRating = Math.max(maxRating, buttonRating);
        }
    });
    return maxRating;
}

function addReview() {
    var title = $("#review-title").val();
    var content = $("#review-content").val();
    var rating = getRating(); // Assuming you have this function to get the rating

    // Include other form data as needed

    $.ajax({
        type: "POST",
        url: "/submit-review",
        data: {
            title: title,
            content: content,
            rating: rating
            // include other necessary data
        },
        success: function(response) {
            console.log(response.message); // Or handle the UI response accordingly
            // Clear the form or close the modal
        },
        error: function(response) {
            alert(response.responseJSON.message); // Show error message
        }
    });

    return false;
        
        // Get uploaded image if available
        var imageFileInput = document.getElementById("image-upload");
        var image = imageFileInput != null ? imageFileInput.files[0] : null;

        console.log(rating);
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
        var container = document.getElementsByClassName("reviews-container")[0];
        container.insertBefore(reviewElement, container.firstChild);
        
        // Clear form inputs
        document.getElementById("review-title").value = "";
        document.getElementById("review-content").value = "";
        // document.getElementById("image-upload").value = ""; // Reset file input
        return false; // Prevent page refresh
    }