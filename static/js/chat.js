/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
// Get the URL query string

const queryString = window.location.search;
// Parse the query string into an object
const params = new URLSearchParams(queryString);

// Example: Get the value of a specific parameter named 'paramName'
const token = params.get('x-token');
function getMessages(name) {
  $.ajax({
    url: `/api/v1/chat/${name}?x-token=${token}`,
    type: 'GET',
    success: function (response) {
      const messages = response.msg;
      $('#friend').text(name);
      if (response.isActive) {
        $('#stats').text('Online');
      } else {
        $('#stats').text('Offline');
      }
      $('.dp').attr('src', `/image/${name}`);
      $('.dp').attr('alt', name);

      const parent = $('.chat-container');
      parent.empty();
      if (messages) {
        for (let i = 0; i < messages.length; i += 1) {
          const msg = messages[i];
          const text = msg.message;
          const date = msg.time;
          const owner = msg.sent_by;
          if (owner === name) {
            const newMessage = $(
              '<div class=\'message-box friend-message\'></div>',
            );
            newMessage.append(`<p>${text}<br><span>${date}</span></p>`);
            parent.append(newMessage);
          } else {
            const newMessage = $('<div class=\'message-box my-message\'></div>');
            newMessage.append(`<p>${text}<br><span>${date}</span></p>`);
            parent.append(newMessage);
          }
        }
        const div = $('.chat-container');
        div.scrollTop(div[0].scrollHeight);
      }
    },
  });
}

function sendMessage(name, socket) {
  const date = new Date();
  const data = {
    message: $('#message').val(),
    time: date.toDateString(),
    to: $('#friend').text(),
    sender: name,
  };
  $.ajax({
    url: `/api/v1/chat/${$('#friend').text()}/send?x-token=${token}`,
    type: 'POST',
    data,
    success: function (response) {
      $('#message').val('');
      const parent = $('.chat-container');
      const newMessage = $('<div class=\'message-box my-message\'></div>');
      newMessage.append(
        `<p>${response.message}<br><span>${response.time}</span></p>`,
      );
      parent.append(newMessage);
      const div = $('.chat-container');
      div.scrollTop(div[0].scrollHeight);
      socket.emit('send-msg', data);
    },
  });
}

$(document).ready(function () {
  const name = $('h6').text();

  // Check if the "activeTab" parameter is set to 2
  if (params.get('activeTab') === '2') {
    // Activate content2
    switchTab(1); // Assuming your switchTab function accepts tab indices starting from 0
  }

  const socket = io('https://cryptnex.tech', { secure: true });
  socket.emit('add-user', name);
  socket.on('msg-recieved', (data) => {
    console.log(data.sender);
    console.log($('#friend').text());
    console.log(data.sender === $('#friend').text());
    if (data.sender === $('#friend').text()) {
      const parent = $('.chat-container');
      const newMessage = $('<div class=\'message-box friend-message\'></div>');
      newMessage.append(`<p>${data.message}<br><span>${data.time}</span></p>`);
      parent.append(newMessage);
      const div = $('.chat-container');
      div.scrollTop(div[0].scrollHeight);
    }
  });
  // eslint-disable-next-line no-unused-consts
  $('.chat-box').click(function (event) {
    if ($(window).width() < 800) {
      $('.right-container').css('display', 'block');
      $('.left-container').css('display', 'none');
    } else {
      $('.right-container').css('display', 'block');
    }
    getMessages($(this).find('#ffriend').text());
  });

  $('.group-box').click(function (event) {
    event.preventDefault();
    window.location.href = `/api/v1/groupChat/${$(this)
      .find('img.img-cover')
      .attr('alt')}?x-token=${token}`;
  });
  $('#send').click(function (event) {
    event.preventDefault();
    if ($('#message').val()) {
      sendMessage(name, socket);
    } else {
      alert('Pls type your message');
    }
  });

  $('#posts').click(function () {
    $.ajax({
      url: '/logout',
      type: 'POST',
      success: () => {
        // Handle successful logout
        alert('Logout successful');
        window.location.href = '/';
      },
    });
  });

  $('#back').click(function () {
    if ($(window).width() < 800) {
      // Execute code for small screens
      $('.right-container').css('display', 'none');
      $('.left-container').css('display', 'block');
    } else {
      // Execute code for larger screens
      const rightContainer = $('.right-container');
      rightContainer.empty();
      rightContainer.append('<h2>Click on a friend to chat</h2>');
      rightContainer.css('display', 'block');
    }
  });

  $('.user-img').click(function () {
    window.location.href = `/profile/${$('h6').text()}?x-token=${token}`;
  });
  $('.user-imgg').click(function () {
    window.location.href = `/profile/${$('#friend').text()}?x-token=${token}`;
  });

  $('img-box').click(function () {
    window.location.href = `/profile/${$(this).attr('alt')}`;
  });

  $('#notif').click(function () {
    window.location.href = `/notifications?x-token=${token}`;
  });

  $('#users').click(function () {
    window.location.href = `/users?x-token=${token}`;
  });

  $('#joinGroup').click(function (event) {
    event.preventDefault();
    window.location.href = `/joingroup?x-token=${token}`;
  });

  $('#createGroup').click(function (event) {
    event.preventDefault();
    window.location.href = `/creategroup?x-token=${token}`;
  });

  $('.right-container').css('display', 'none');
});
