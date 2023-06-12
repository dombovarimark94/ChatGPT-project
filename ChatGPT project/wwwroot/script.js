function sendMessage() {
  var messageInput = document.getElementById('messageInput');
  var message = messageInput.value;

  if (message.trim() !== '') {
    displayMessage('You', message, 'user');
    messageInput.value = '';

    showTypingIndicator(); 

    processMessage(message)
      .then(response => {
        hideTypingIndicator(); 
        displayMessage('Bot', response, 'bot');
      })
      .catch(error => {
        hideTypingIndicator(); 
        console.error('Error:', error);
      });
  }
}

function showTypingIndicator() {
  var chatbox = document.getElementById('chatbox');
  var typingElement = document.createElement('div');
  typingElement.classList.add('message', 'typing');
  typingElement.textContent = '...is typing';

  chatbox.insertBefore(typingElement, chatbox.firstChild);
}

function hideTypingIndicator() {
  var chatbox = document.getElementById('chatbox');
  var typingElement = chatbox.querySelector('.typing');

  if (typingElement) {
    typingElement.remove();
  }
}

function processMessage(inputMessage) {
  return new Promise((resolve, reject) => {
    fetch(`https://localhost:7021/ChatGPT/UseChatGPT?query=${encodeURIComponent(inputMessage)}`)
      .then(response => response.text())
      .then(outputMessage => {
        resolve(outputMessage);
      })
      .catch(error => {
        reject(error);
      });
  });
}


function displayMessage(sender, message, messageType) {
  var chatbox = document.getElementById('chatbox');
  var messageElement = document.createElement('div');
  messageElement.classList.add('message', messageType);

  var profilePicElement = document.createElement('img');
  profilePicElement.classList.add('profile-pic');
  profilePicElement.src = getProfilePicURL(sender);

  var messageContentElement = document.createElement('p');
  messageContentElement.textContent = message;

  messageElement.appendChild(profilePicElement);
  messageElement.appendChild(messageContentElement);

  chatbox.insertBefore(messageElement, chatbox.firstChild);
}


function getProfilePicURL(sender) {
  var userPicURL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHkTduHjhR4K5ZcAn1UEDtB6UnPdffS2gEvp7cmSWFrQ&s';
  var botPicURL = 'https://picsum.photos/200';

  if (sender === 'You') {
      return userPicURL;
  } else if (sender === 'Bot') {
      return botPicURL;
  } else {
      return '';
  }
}

