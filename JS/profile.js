var file = {};

window.onload = function setup() {
  hideChangeProfileInformationsForm();
  firebase.auth().onAuthStateChanged(async function (user) {
    if (!user) {
      window.location.href = "logIn.html";
    } else {
      loadPosts();
      var loggedUserId = firebase.auth().currentUser.uid;
      setProfileImage(loggedUserId);

      firebase.firestore().collection("users").doc(loggedUserId).get().then(function (doc) {
        if (doc.exists) {
          document.getElementById("userName").innerHTML += doc.data().username;
          document.getElementById("user-mail").innerHTML += firebase.auth().currentUser && firebase.auth().currentUser.email;
        } else {

        }
      }).catch(function (error) {
        //console.log("Error getting document:", error);
      });
    }
  });
}

function navigateBack() {
  location.href = 'dashboard.html';
}

function setProfileImage(userId) {
  let storageRef = firebase.storage().ref('users').child(userId+'/profile.jpg');
  storageRef.getDownloadURL().then(function(url) {
    document.getElementById('profileImage').src = url;
  })
}

var dataCreazione;
function chooseFile(e) {
  file = e.target.files[0];
}

function getUser() {
  return firebase.auth().currentUser;
}

async function loadPosts() {
  let loggedUser = firebase.auth().currentUser.uid; //id User a cui appartiene il profilo
  let postsArray = [];
  let docUser = firebase.firestore().collection("users").doc(loggedUser);

  let refPosts = docUser.collection("posts");

  if (refPosts) {
    let postsSnapshot;
    let username = await docUser.get();
    dataCreazione = username.data().creationData.toDate();
    username = username.data().username;
    //Snapshot lo converto in un array di docs, a cui è più facile accedere
    //+ ordino già i post dell'utente[i]
    postsSnapshot = (await refPosts.orderBy("publicationTime").get()).docs;
    postsSnapshot.forEach(function (postDoc) {
      postsArray.push([username, postDoc.data().content, postDoc.data().publicationTime.toDate(), postDoc.data().nLike, postDoc.data().gifId, postDoc.id, loggedUser]);
                        //0,            1,                              2                               3                 4                     5                 
    });
  }

  postsArray.sort(function (a, b) {
    let posData = 2;
    let data1 = a[posData];
    let data2 = b[posData];
    return data2 - data1; //devo ordinare da data più recente a più vecchia
  });

  printPosts(postsArray);
}

function printPosts(posts) {
  let i = 0;
  let likesCount = 0;
  let postTool;

  posts.forEach(post => {
    i++;
    likesCount += parseInt(post[3]);

    if (post[4] != null) {
      gifHtml = `
                  <div class="row mb-4">
                    <div class="col-md-12">
                      <div class="card">
                        <img class="card-img-top" src="`+ post[4] + `" alt="Gif del post"/>
                      </div>
                    </div>
                  </div>
                  `;
    } else {
      gifHtml = '';
    }

    if (firebase.auth().currentUser.uid==post[6]) {
      postTool= 
        `
        <div class="row">
          <div class="col-md-12 text-right">
            <div id="deletePost`+post[5]+`">
              <div class="btn-group" role="group" aria-label="Basic example">
                <button onclick="showDeleteConfirmation('`+post[5]+`')" type="button" class="btn btn-secondary">X</button>
              </div>
            </div>
          </div>
        </div>
        `;
    } else {
      postTool='';
    }

    document.getElementById("dashboard").innerHTML +=
      `
            <div class='card mb-4' style="background-color: #D3D7E5;">
              <div class='card-body text-left'>
                <!-- user info -->
                <div class="row">
                  <div class="col-md-12">
                    <div class="row">
                      <div class="col-md-1">
                        <img id="`+ i + `g" src="https://www.flaticon.com/svg/static/icons/svg/64/64572.svg" class="account-avatar" alt="Account Image">
                      </div>
                      <div class="col-md-9">
                        <h5 class="account-text">`+ post[0] + `</h5>
                      </div>
                      <div class="col-md-2">
                        `+postTool+`
                      </div>
                    </div>
                  </div>
                </div>
                <!-- post content -->
                <div class="row align-items-center text-left mt-4 mb-4">
                  <div class="col-md-12">`+ post[1] + `</div>
                </div>
                <!-- GIF -->
                `+ gifHtml + `
                <!-- Post stats -->
                <div class="row">
                  <div class="col-md-9">
                    <div class="text-muted">
                      <b>Posted on `+ post[2].toLocaleDateString() + `</b>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="row">
                      <div class="col-md-7 text-right">
                        <b id="numberOfLikes`+ i + `">` + post[3] + `</b>
                      </div>
                      <div class="col-md-5">
                        <img class="img-fluid float-left" src="assets/heart.png" id="`+ i + `" name ="unclicked" onclick="addLike('` + post[5] + `','` + post[6] + `', ` + i + `)">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            `;

  }
  );

  document.getElementById("statisticheUser").innerHTML += 

  `
    <p> Posts: ` + i + `</p>
    <p> Likes: ` + likesCount + `</p>
    <p> Joined: ` + dataCreazione.toDateString() +`</p>`;
}

function showDeleteConfirmation(postId) {
  let deletePostDiv = document.getElementById('deletePost'+postId);
  deletePostDiv.innerHTML =
  `
  <div class="btn-group" role="group" aria-label="Basic example">
    <button onclick="confirmDelete('`+postId+`')" type="button" class="btn btn-secondary">Confirm</button>
    <button onclick="undoDeleteConfirmation('`+postId+`')" type="button" class="btn btn-secondary">Back</button>
  </div>
  `;
}

function confirmDelete(postId) {
  firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).collection("posts").doc(postId).delete().then(function() {
    location.reload();
  });
}

function undoDeleteConfirmation(postId) {
  document.getElementById("deletePost"+postId).innerHTML=
  `
  <div class="btn-group" role="group" aria-label="Basic example">
    <button onclick="showDeleteConfirmation('`+postId+`')" type="button" class="btn btn-secondary">X</button>
  </div>
  `;
}

async function addLike(idPost, userCreator, id) {
  let button = document.getElementById(id);
  let counterLikes = document.getElementById("numberOfLikes" + id);
  let numLikes = counterLikes.innerHTML;

  if (button.name == "unclicked")
  {
    //button.value = parseInt(button.value) + 1;
    numLikes = parseInt(numLikes) + 1;
    
    button.name = "clicked";
    //button.src = [cuore pieno]
  }
  else {
    //button.value = parseInt(button.value) - 1;
    numLikes = parseInt(numLikes) - 1;
    button.name = "unclicked";
    //button.src= "assets/heart.png";

  }
  counterLikes.innerHTML = numLikes;
  
  await firebase.firestore().collection("users").doc(userCreator).collection("posts").doc(idPost).update({
    nLike: parseInt(numLikes)
  });
}

async function changeName(){
  const form = document.getElementById("form-change");
  let user = firebase.auth().currentUser.uid;
  const newName = form[0].value;
  if (newName.length > 2) {
    await firebase.firestore().collection("users").doc(user).update({
      username: newName
    }).then(function () {
        //console.log("update")
        location.reload()
    }).catch(error => {
      //console.log(error.message);
    });
  } else {
    document.getElementById("errorMessage").innerHTML = "Username troppo corto";
  }
}

async function changeImage() {
  let user = firebase.auth().currentUser.uid;
  if (document.getElementById("imageSelect").files.length == 0) {
    //console.log("no files selected");
  } else {
    await firebase.storage().ref('users/' + user + '/profile.jpg').put(file).then(function () {
      location.reload()
    }).catch(error => {
      //console.log(error.message);
    });
  }
}

function changePass() {
  var auth = firebase.auth();
  var emailAddress = auth.currentUser.email;

  auth.sendPasswordResetEmail(emailAddress).then(function() {
    showEmailAlert();
  }).catch(function(error) {
    //console.log(error.message);
  });
}

function changeEmail(){
  var auth = firebase.auth();
  var emailAddress = auth.currentUser.email;

  auth.sendPasswordResetEmail(emailAddress).then(function() {
    showEmailAlert();
  }).catch(function(error) {
    // An error happened.
  });
}

function hideEmailAlert() {
  document.getElementById('emailAlert').innerHTML = '';
}

function showEmailAlert() {
  document.getElementById('emailAlert').innerHTML =
        `
        <div class="alert alert-info alert-dismissible mt-4">
          <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
          <strong>Hey!</strong> A confirmation email has been sent to your email address. Check it out!
        </div>`;
}

function hideChangeProfileInformationsForm() {
  const formDiv = document.getElementById("changeProfileInfo");
  formDiv.style.display = "none";
  hideEmailAlert();
}

function toggleChangeProfileInformationsForm() {
  document.getElementById('errorMessage').innerHTML = '';
  const formDiv = document.getElementById("changeProfileInfo");
  if (formDiv.style.display === "none") {
    formDiv.style.display = "block";
  } else {
    formDiv.style.display = "none";
    hideEmailAlert();
  }
}