/* eslint-disable no-undef */
function login() {
  const email = $('#name1').val();
  const password = $('#pass1').val();
  const user = btoa(`${email}:${password}`);
  $.ajax({
    url: '/signin',
    type: 'GET',
    headers: { Authorization: `Basic ${user}` },
    success(response, text, jqXHR) {
      if (jqXHR.status === 200) {
        window.location.href = `/?x-token=${response.success}`;
      } else if (jqXHR.status === 401) {
        $('#uname').show();
        $('#uname').text(response.error);
        $('#name1').css('border', '2px solid red');
      } else if (jqXHR.status === 401) {
        $('#upass').show();
        $('#upass').text(response.error);
        $('#pass1').css('border', '2px solid red');
      }
      $('#sign').show();
      $('#loadingSpinner').hide();
    },
    error(xhr) {
      const response = JSON.parse(xhr.responseText);

      if (xhr.status === 401) {
        $('#uname').show();
        $('#uname').text(response.error);
        $('#name1').css('border', '2px solid red');
      }
      if (xhr.status === 401) {
        $('#upass').show();
        $('#upass').text(response.error);
        $('#pass1').css('border', '2px solid red');
      }
      $('#sign').show();
      $('#loadingSpinner').hide();
    },
  });
}

$(document).ready(() => {
  $('#sign').click((event) => {
    event.preventDefault();
    $('#name1').css('border', 'none');
    $('#pass1').css('border', 'none');
    $('#uname').hide();
    $('#upass').hide();
    if ($('#name1').val() && $('#pass1').val()) {
      login();
      $('#sign').hide();
      $('#loadingSpinner').show();
    } else if (!$('#name1').val()) {
      $('#uname').show();
      $('#uname').text('Please enter username');
      $('#name1').css('border', '2px solid red');
    } else if (!$('#pass1').val()) {
      $('#upass').show();
      $('#upass').text('Please enter password');
      $('#pass1').css('border', '2px solid red');
    }
  });
});
