$(document).ready(function() {
    $('#editProfileForm').on('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission

        // Get uploaded image if available
        var image = $("#profile-photo").prop('files')[0];

        var formData = {};

        const name = $("#editProfileForm #name").val();
        const email = $("#editProfileForm #email").val();
        const bio = $("#editProfileForm #bio").val();
        const job = $("#editProfileForm #job").val();
        const education = $("#editProfileForm #education").val();
        const city = $("#editProfileForm #city").val();
    
        if (name !== null && name !== undefined) formData.name = name;
        if (email !== null && email !== undefined) formData.email = email;
        if (bio !== null && bio !== undefined) formData.bio = bio;
        if (job !== null && job !== undefined) formData.job = job;
        if (education !== null && education !== undefined) formData.education = education;
        if (city !== null && city !== undefined) formData.city = city;

        if (!formData && !image) {
            alert("Nothing was changed.");
            window.location.href = "/profile/" + $("#username-display").text();
            return;
        }

        // send image to the server
        if (image) {
            $.ajax({
                url: '/upload-image',
                type: 'POST',
                data: { image: image },
                success: function(response) {
                    console.log(response);
                    formData.append('imagePath',`images/client-uploaded-files/${image.name}`);

                    // Continue with edit submission
                    editprofile(formData);
                },
                error: function(xhr, status, error) {
                    // Handle failure response
                    console.error('Error uploading image:', error);
                    alert(xhr.responseJSON.message); // Display error message
                }
            });
        } else {
            // Continue with edit submission without image
            editprofile(formData);
        }
    });
});

function editprofile(formData) {
    $.ajax({
        url: '/edit-profile-submit',
        type: 'PATCH',
        data: formData,
        success: function(response) {
            alert('Profile updated successfully!');
        },
        error: function(xhr, status, error) {
            alert('An error occurred: ' + error);
        }
    });

    window.location.href = "/profile/" + $("#username-display").text();
}
