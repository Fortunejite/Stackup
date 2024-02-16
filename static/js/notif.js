$(document).ready(function() {
    const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const token = params.get('x-token');
    $('#accept').click(function(event) {
        const message = $(this).siblings('#message').text();
        const name = message.split(' ')[0];
        // closest('.notification').find('img').attr('alt');
        event.preventDefault();
        $.ajax({
            url: `/api/v1/acceptFriend?x-token=${token}`,
            type: 'POST',
            data: { 'friend': name },
            success: function(response) {
                alert('accepted');
                window.location.href = `/notifications?x-token=${token}`;
            }
        });
    });

    $('#reject').click(function(event) {
        const message = $(this).siblings('#message').text();
        const name = message.split(' ')[0];
        event.preventDefault();
        $.ajax({
            url: `/api/v1/rejectFriend?x-token=${token}`,
            type: 'POST',
            data: { 'friend': name },
            success: function(response) {
                alert('Request rejected');
                window.location.href = `/notifications?x-token=${token}`;
            }
        });
    });

});