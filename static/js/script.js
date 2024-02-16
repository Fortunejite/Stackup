$(document).ready(function() {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const token = params.get('x-token');
  $('#news-feed').show();
  $('.navbar li a').click(function() {
      $('.navbar li a').removeClass('active');
      $(this).addClass('active');

      const target = $(this).attr('href');
      $('.tab-content').hide();
      $(target).show();

      return false;
  });

  $('#profile-link').click(function() {
      $('#profile-section').show();
      return false;
  });
  $('#logout').click(function() {
      $.ajax({
          url: `/logout?x-token=${token}`,
          type: 'GET',
          success: function(response) {
              // Handle successful logout
              alert('Logout successful');
              window.location.href = '/';
          }
      });
  });

  const scrollContainer = $('.friends');
  const content = $('.friend');
  const scrollAmount = scrollContainer.width(); // Scroll amount equals the width of the container
  const currentPosition = 0;
  
      // Set initial scroll position to the leftmost side
  scrollContainer.scrollLeft(0);

  $('.next').click(function() {
      currentPosition += scrollAmount;
      scrollContainer.animate({ scrollLeft: currentPosition }, 1000);
  });

  $('.add').click(function () {
      const friend = $(this).closest('div').prev('h3').text();
      $.ajax({
        url: `/api/v1/sendRequest?x-token=${token}`,
        type: 'POST',
        data: { friend },
        success: () => {
          alert('Request Sent');
          window.location.href = `/users?x-token=${token}`;
          }

      });
  });

  $('.profile').click(function (event) {
      window.location.href = '/profile/' + $(this).closest('div').prev('h3').text() + `?x-token=${token}`;
  });

});