function goToLoggedOut(){
    window.location.href="index.html"
}
$(document).ready(function(){
    $(".nav-logged-in").hide();

    $("#login").hide();
    $("#create-account").hide();

    // Dropdown magic
    $(".icon").hover(function(){
        $(this).toggleClass("highlighted");
    });

    $(".icon").hover(function(){
        $(".nav-dropdown").toggle($(this).hasClass("highlighted"));
    });

    $("#show-login").click(function(){
        $("#login").slideDown();
    });
    $("#close").click(function(){
        $("#login").hide();
    });

    $("#close-create").click(function(){
        $("#create-account").hide();
    });

    $("#show-create-account").click(function(){
        $("#create-account").show();
    });

    // Login button click event
    $("#login-button").click(function(){
        $("#login").slideDown();
        $(".nav-dropdown").hide(); // Hides dropdown after click
    });

    // Signup button click event
    $("#signup-button").click(function(){
        $("#create-account").show();
        $(".nav-dropdown").hide(); // Hides dropdown after click
    });
});

function updateDropdownText(username) { // this gave me cancer but this is the change dropdown after login
    $("#login-button").text(username !== '' ? username : 'Login'); // Change login to username if not empty, otherwise revert to Login
    $("#signup-button").text(username !== '' ? 'Edit Profile' : 'Signup'); // Change signup to View Profile if username is not empty, otherwise revert to Signup
}


function showLogInView(){
    console.log("hello");
    $(".nav-logged-out").hide();
    $(".nav-logged-in").show();
}

function checkWhiteSpace(text){
    if(text.indexOf(' ') !== -1){
        return true;
    }

    return false;
}

function checkLoginForm(){
    let username = document.forms["login-form"]["username"].value;
    let password = document.forms["login-form"]["password"].value;

    if(username.length < 1 || password.length < 1){
        alert("Login fields must not be empty.");
        return false;
    }

    if(checkWhiteSpace(username) || checkWhiteSpace(password)){
        alert("Username and password must not contain white space.");
        return false;
    }

    // Prevent default form submission behavior
    event.preventDefault();

    // Set the text of the <div> element to the entered username
    document.getElementById("username-display").innerText = username;


    showLogInView();
    $("#login").hide();
    updateDropdownText(username); // changes the dropdown
    return true;

}

function checkCreateAccountForm(){
    let username = document.forms["create-account-form"]["new-username"].value;
    let password = document.forms["create-account-form"]["new-password"].value;
    let confirmPassword = document.forms["create-account-form"]["new-confirm-password"].value;

    if(username.length < 1 || password.length < 1 || confirmPassword.length < 1){
        alert("Required fields must not be empty.");
        return false;
    }

    if(checkWhiteSpace(username) || checkWhiteSpace(password) || checkWhiteSpace(confirmPassword)){
        alert("Username and password must not contain white space.");
        return false;
    }

    if(password !== confirmPassword){
        alert("Passwords do not match. Please try again.");
        return false;
    }


    return true;
}