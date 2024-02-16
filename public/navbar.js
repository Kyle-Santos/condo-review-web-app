function goToLoggedOut(){
    window.location.href="index.html"
}
$(document).ready(function(){
    $(".nav-logged-in").hide();
    $("#logout-button").hide();
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
        $(".nav-dropdown").hide(); // Hides dropdown after click
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
        if ($(this).text() === "View Profile") {
            window.location.href = "public/profile.html";
        } else {
            $("#login").slideDown();
            $(".nav-dropdown").hide(); // Hides dropdown after click
        }
    });

    // Signup button click event
    $("#signup-button").click(function(){
        if ($(this).text() === "Edit Profile") {
            window.location.href = "public/editprofile.html";
        } else {
            $("#create-account").show();
            $(".nav-dropdown").hide(); // Hides dropdown after click
        }
    });

    $("#logout-button").click(function(){
        // window.location.href="index.html";
        location.reload();
        $(".nav-dropdown").hide(); // Hides dropdown after click
    });

    $("#view-condo").click(function(){
        // Check if the current page is index.html
        if (window.location.pathname.includes("index.html")) {
            // Smooth scrolling behavior
            window.scrollBy({
                top: 650,
                left: 0,
                behavior: 'smooth'
            });
        } else {
            // Redirect to index.html
            window.location.href = "../index.html";
        }
    });
});

function updateDropdownText(username) { // this gave me cancer but this is the change dropdown after login
    $("#login-button").text(username !== '' ? "View Profile" : 'Login'); // Change login to username if not empty, otherwise revert to Login
    $("#signup-button").text(username !== '' ? 'Edit Profile' : 'Signup'); // Change signup to View Profile if username is not empty, otherwise revert to Signup
    $("#logout-button").text(username !== '' ? 'Log Out' : 'Log Out');
    $("#logout-button").show();
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

function updateFilterInput() {
    var filterSelect = document.getElementById("filter");
    var filterInputSelect = document.getElementById("filterinput");
    var selectedOption = filterSelect.value;
    filterInputSelect.innerHTML = ""; // Clear prev options

    if (selectedOption === "rating") {
        // Pfor rating
        var options = ["4 Star +", "3 Star", "2 Star", "1 Star -"];
        options.forEach(function(option) {
            var optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            filterInputSelect.appendChild(optionElement);
        });
    } else if (selectedOption === "price") {
        // for rent price
        var options = ["P10000 Below", "P15000 - P20000", "P20001 - P25000", "Above P25000"];
        options.forEach(function(option) {
            var optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            filterInputSelect.appendChild(optionElement);
        });
    } else if (selectedOption === "location") {
        // for locations
        var options = ["Taft", "Espana", "Katipunan", "Other"];
        options.forEach(function(option) {
            var optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            filterInputSelect.appendChild(optionElement);
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    updateFilterInput(); // DO NOT DELETE(For Filter)
});