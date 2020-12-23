'use strict';

function getLogInElements() {
    const form = document.getElementById("form-login");
    const mail = form[0].value;
    const password = form[1].value;

    logIn(mail, password);
}

function logIn(mail, password) {
    firebase.auth().signInWithEmailAndPassword(mail, password)
  .then((user) => {
      window.location.href = "dashboard.html";

  })
  .catch((error) => {

    var errorMessage = error.message;

    document.getElementById("passER").innerHTML = errorMessage;
  })
}