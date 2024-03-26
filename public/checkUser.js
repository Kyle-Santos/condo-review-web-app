function checkUser(){
    if($("#username-display").text() !== $(".profile-name").text().replace(/✔️/g, '')){
        $('#edit-profile-link').hide();
        $('.edit-delete-icons').hide();
    }
}