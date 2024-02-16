/* eslint-disable no-alert */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-undef */
/* eslint-disable func-names */
$(document).ready(function () {
  const queryString = window.location.search;
  // Parse the query string into an object
  const params = new URLSearchParams(queryString);

  // Example: Get the value of a specific parameter named 'paramName'
  const token = params.get('x-token');

  const join = () => {
    $.ajax({
      url: `/api/v1/joingroup?x-token=${token}`,
      type: 'POST',
      data: {
        groupId: $('#name1').val(),
      },
      success(response, text, jqXHR) {
        if (jqXHR.status === 200) {
          alert('Already a member');
          window.location.href = `/api/v1/groupChat/${response.groupId}?x-token=${token}`;
          $('#sign').show();
          $('#loadingSpinner').hide();
        } else {
          alert('Group successfully joined!');
          window.location.href = `/api/v1/groupChat/${response.groupId}?x-token=${token}`;
          $('#sign').show();
          $('#loadingSpinner').hide();
        }
      },
      error(xhr) {
        const response = JSON.parse(xhr.responseText);
        $('#uname').show();
        $('#uname').text(response.error);
        $('#name1').css('border', '2px solid red');
        $('#sign').show();
        $('#loadingSpinner').hide();
      },
    });
  };

  $('#sign').click((event) => {
    event.preventDefault();
    $('#name1').css('border', 'none');
    $('#uname').hide();
    if ($('#name1').val()) {
      join();
      $('#sign').hide();
      $('#loadingSpinner').show();
    } else {
      $('#uname').show();
      $('#uname').text('Please enter group id');
      $('#name1').css('border', '2px solid red');
    }
  });
});
