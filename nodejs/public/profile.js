$(document).ready(function() {
    $('#editProfileForm').on('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission

        // Get uploaded image if available
        var image = $("#profile-photo").prop('files')[0];

        const name = $("#editProfileForm #name").val();
        const email = $("#editProfileForm #email").val();
        const bio = $("#editProfileForm #bio").val();
        const job = $("#editProfileForm #job").val();
        const education = $("#editProfileForm #education").val();
        const city = $("#editProfileForm #city").val();

        var formData = {};

        if (name !== "" ) {
            if (!name.includes(' ')) 
                formData.name = name;
            else {
                alert("Username can't have any space");
                return;
            }
        }
        if (email !== "") formData.email = email;
        if (bio !== "") formData.bio = bio;
        if (job !== "") formData.job = job;
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
        },
        error: function(xhr, status, error) {
            alert('An error occurred: ' + error);
        }
    });
    window.location.href = "/profile/" + $("#username-display").text();
}
