
$(document).ready(function() {
    const editReviewModal = $('#editReviewModal');
    const closeEditReviewBtn = $('.close-button');
    editReviewModal.css('display', 'none');

    // Opens modal
    $('.edit-icon-btn').on('click', function() {
        const reviewId = $(this).closest('.grid-item').attr('id');
        $.get('/edit-review/' + reviewId, function(data) {
            $(".modal-content h2").attr("id", reviewId);
            $("#editReviewTitle").val(data.review.title);
            $("#editReviewContent").val(data.review.content);

            var i = 0;
            $('.star-rating-button').each(function() {
                if (i != data.review.rating) 
                    $(this).addClass('active');
                else    
                    return;
                i++;
            });
            

        }); 
        editReviewModal.css('display', 'block');

    });

    // Closes modal
    closeEditReviewBtn.on('click', function() {
        editReviewModal.css('display', 'none');
        $('.star-rating-button').each(function() { 
            $(this).removeClass('active');
        });
    });

    // Close modal on outside click
    $(window).on('click', function(e) {
        if (e.target === editReviewModal[0]) {
            editReviewModal.css('display', 'none');
        }
    });

    $('#editReviewForm').submit(function(event) {
        event.preventDefault();

        // Get edited review data
        var editedTitle = $("#editReviewTitle").val().trim();
        var editedContent = $("#editReviewContent").val().trim();
        var rating = getRating();
        var reviewId = $(".modal-content h2").attr('id');

        // Validate the form inputs
        if (!editedContent || !editedTitle || rating === 0) {
            alert("Please fill in the title, content, and select a star rating.");
            return;
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
                    editReview(editedTitle, editedContent, rating, imagePath, date, reviewId);
                },
                error: function(xhr, status, error) {
                    // Handle failure response
                    console.error('Error uploading image:', error);
                    alert(xhr.responseJSON.message); // Display error message
                }
            });
        } else {
            // Continue with review submission without image
            editReview(editedTitle, editedContent, rating, imagePath, date, reviewId);
        }
    });

    $('#editProfileForm').on('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission

        // Get uploaded image if available
        var image = $("#profile-photo").prop('files')[0];

        const name = $("#editProfileForm #name").val();
        const email = $("#editProfileForm #email").val();
        const bio = $("#editProfileForm #bio").val();
        const education = $("#editProfileForm #education").val();
        const city = $("#editProfileForm #city").val();

        var formData = {};

        if (name !== "") {
            if (!name.includes(' ')) 
                formData.name = name;
            else {
                alert("Username can't have any space");
                return;
            }
        }
        if (email !== "") formData.email = email;
        if (bio !== "") formData.bio = bio;
        if (education !== "") formData.education = education;
        if (city !== "") formData.city = city;

        if (Object.keys(formData).length === 0 && !image) {
            alert("Nothing was changed.");
            window.location.href = "/profile/" + $("#username-display").text();
            return;
        }

        // send image to the server
        if (image) {
            var imageData = new FormData();
            imageData.append('image', image);

            $.ajax({
                url: '/upload-image',
                type: 'POST',
                data: imageData,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log(response);
                    formData.imagePath = `images/client-uploaded-files/${image.name}`;
                    editprofile(formData);
                },
                error: function(xhr, status, error) {
                    // Handle failure response
                    console.error('Error uploading image:', error);
                    alert(xhr.responseJSON.message); // Display error message
                }
            });
        } else {
            editprofile(formData);
        }
    });

    const imageInput = $('#profile-photo');

    $('.image-upload-container').on("click", () => imageInput[0].click());
    imageInput.on('change', function(event) {
        const [file] = event.target.files;
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#profile-photo-preview').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
});

function editprofile(formData) {
    $.ajax({
        url: '/edit-profile-submit',
        type: 'PATCH',
        data: formData,
        success: function(response) {
            alert(response.message);
            window.location.href = "/profile/" + response.user;
        },
        error: function(xhr, status, error) {
            alert('An error occurred: ' + error);
            window.location.href = "/profile/" + $("#username-display").text();
        }
    });
}

function editReview(editedTitle, editedContent, rating, imagePath, date, reviewId) {
    const formData = {
        title: editedTitle,
        content: editedContent,
        rating: rating,
        image: imagePath,
        date: date,
        isEdited: true,
    };
    $.ajax({
        url: '/update-review/' + reviewId,
        method: 'PATCH',
        data: formData,
        success: function(response) {
            alert("Review updated successfully.");
            window.location.reload();
        },
        error: function(xhr, status, error) {
            console.error('Error updating review:', error);
            alert('An error occurred while updating the review.');
        }
    });

    // For demonstration purposes lang to
    console.log("Edited Review Content:", editedContent);

    // Closes the modal
    $('#editReviewModal').css('display', 'none');
    $('.star-rating-button').each(function() { 
        $(this).removeClass('active');
    });
}

/* document.querySelectorAll('.delete-review-btn').forEach(button => {
    button.addEventListener('click', function() {
        const reviewId = this.getAttribute('data-review-id');

        fetch(`/delete-review/${reviewId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log(data.message);
                } else {
                    console.error('Failed to delete review');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
}); */
