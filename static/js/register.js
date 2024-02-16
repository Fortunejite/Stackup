/* eslint-disable no-alert */
/* eslint-disable no-undef */
function createUser() {
  const formData = new FormData();
  formData.append('email', $('#email').val());
  formData.append('username', $('#name2').val());
  formData.append('password', $('#pass2').val());

  const fileInput = $('#file')[0];
  if (fileInput.files.length > 0) {
    const imageFile = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function () {
      // After reading the file, add it to the FormData
      formData.append('image', new Blob([reader.result]));
      
      // Now, make the AJAX request
      $.ajax({
        url: '/signup',
        type: 'POST',
        data: formData,
        dataType: 'json',
        contentType: false, // Let jQuery set it automatically
        processData: false, // Prevent jQuery from processing the data
        success: (response, text, jqXHR) => {
          if (jqXHR.status === 201) {
            window.location.href = `/?x-token=${response.success}`;
          } else {
            alert(response.error);
          }
        },
        error: (xhr) => {
          const response = JSON.parse(xhr.responseText);
          alert(response.error);
          $('#up').show();
          $('#loadingSpinner').hide();
        },
      });
    };

    reader.readAsArrayBuffer(imageFile);
  } else {
    // Handle the case when no file is selected
    alert('Please select an image file');
  }
}

$(document).ready(() => {
  $('#up').click((event) => {
    event.preventDefault();
    $('#name2').css('border', 'none');
    $('#email').css('border', 'none');
    $('#pass2').css('border', 'none');
    $('#pass3').css('border', 'none');
    $('#unames').hide();
    $('#uemail').hide();
    $('#upass2').hide();
    $('#upass3').hide();
    $('#prop').css('color', 'white');
    if ($('#name2').val() && $('#email').val() && $('#pass2').val() && $('#pass3').val() && $('#file')[0].files[0]) {
      if ($('#pass2').val() === $('#pass3').val()) {
        createUser();
        $('#up').hide();
        $('#loadingSpinner').show();
      } else {
        $('#upass3').show();
        $('#upass3').text('Passwords do not match');
        $('#pass3').css('border', '2px solid red');
      }
    } else if (!$('#name2').val()) {
      $('#unames').show();
      $('#unames').text('Please enter username');
      $('#name2').css('border', '2px solid red');
    } else if (!$('#email').val()) {
      $('#uemail').show();
      $('#uemail').text('Please enter email');
      $('#email').css('border', '2px solid red');
    } else if (!$('#pass2').val()) {
      $('#upass2').show();
      $('#upass2').text('Please enter password');
      $('#pass2').css('border', '2px solid red');
    } else if (!$('#pass3').val()) {
      $('#upass3').show();
      $('#upass3').text('Please confirm password');
      $('#pass3').css('border', '2px solid red');
    } else if (!$('#file')[0].files[0]) {
      // eslint-disable-next-line no-undef
      $('#prop').css('color', 'red');
    }
  });
});
