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

  const create = () => {
    $.ajax({
      url: `/api/v1/creategroup?x-token=${token}`,
      type: 'POST',
      data: {
        name: $('#name1').val(),
        description: $('#name2').val(),
      },
      success(response) {
        alert('Group successfully created!');
        window.location.href = `/api/v1/groupChat/${response.groupId}?x-token=${token}`;
        $('#sign').show();
        $('#loadingSpinner').hide();
      },
      error() {
        $('#sign').show();
        $('#loadingSpinner').hide();
      },
    });
  };

  $('#sign').click((event) => {
    event.preventDefault();
    $('#name1').css('border', 'none');
    $('#uname').hide();
    if ($('#name1').val() && $('#name2').val()) {
      create();
      $('#sign').hide();
      $('#loadingSpinner').show();
    } else if (!$('#name1').val()) {
      $('#uname').show();
      $('#uname').text('Enter group name');
      $('#name1').css('border', '2px solid red');
    } else if (!$('#name2').val()) {
      $('#upass').show();
      $('#upass').text('Enter group description');
      $('#pass1').css('border', '2px solid red');
    }
  });
});
