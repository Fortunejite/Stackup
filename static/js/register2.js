$(document).ready(function() {
    const signUpButton = $('#signUp');
    const signInButton = $('#signIn');
    const container = $('#container');
    
    $('#profile').click(function() {
        $("#file").click();
    });

    $("#file").change(function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            $('#profile').attr('src', e.target.result);
            $('#profile').css('border', '2px solid #343A40');
        };

        reader.readAsDataURL(file);
    });

    signUpButton.click(function() {
        container.addClass("right-panel-active");
    });

    signInButton.click(function() {
        container.removeClass("right-panel-active");
    });
});
