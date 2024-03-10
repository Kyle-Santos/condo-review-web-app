$(document).ready(function() {
    $('#editProfileForm').on('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission

        var formData = new FormData(this);

        $.ajax({
            url: '/viewprofile',
            type: 'PATCH',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                alert('Profile updated successfully!');

            },
            error: function(xhr, status, error) {
                alert('An error occurred: ' + error);
            }
        });
    });
});
