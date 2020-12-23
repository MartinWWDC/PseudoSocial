var file = {};

window.onload = function setup() {
  const userId = localStorage.getItem("idForProfilePage");
  setProfileName(userId);
  loadPosts(userId);
  setProfileImage(userId);
}

function navigateBack() {
  location.href = 'dashboard.html';
}



function setProfileName(userId) {
  firebase.firestore().collection('users').doc(userId).get().then(function(doc) {
    document.getElementById('userName').innerHTML = doc.data().username;
  })
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

async function loadPosts(userId) {
  let postsArray = [];
  let docUser = firebase.firestore().collection("users").doc(userId);
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
      postsArray.push([username, postDoc.data().content, postDoc.data().publicationTime.toDate(), postDoc.data().nLike, postDoc.data().gifId, postDoc.id, userId]);
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

  if (posts.length == 0) {
    document.getElementById("dashboard").innerHTML = `
      <div class="row align-self-center">
        <h5 class="text-color text-muted">This user has no posts :(</h5>
      </div>
    `;
  }

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
                      <div class="col-md-10">
                        <h5 class="account-text">`+ post[0] + `</h5>
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
  ` <p> Posts: ` + i + `</p>
    <p> Likes: ` + likesCount + `</p>
    <p> Joined: ` + dataCreazione.toDateString() +`</p>`;
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