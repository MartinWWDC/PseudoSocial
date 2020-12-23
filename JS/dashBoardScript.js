"use strict";

window.onload = function setup() {
    document.getElementById("loading-posts-alert").innerHTML="Loading posts...";
    loadPosts();
    getLoggedUserInfo();
}

var mybutton = document.getElementById("myBtn");

function getLoggedUserInfo() {
    firebase.auth().onAuthStateChanged(async function(user) {
      if (user) {
          var loggedUserId = firebase.auth().currentUser.uid;
            
          firebase.firestore().collection("users").doc(loggedUserId).get().then(function(doc) {
            if (doc.exists) {
              document.getElementById("nomeUtente").innerHTML = `<b>`+doc.data().username+`</b>`;
              getUserId();
            } else {
              //console.log("No such document!");
            }
          }).catch(function(error) {
            //console.log("Error getting document:", error);
          });
      } else {
        window.location.href = "signUp.html";
        }
    });
}

function getUserId(){
  let id = firebase.auth().currentUser.uid;

  getProfileImgUrl(id,"userImage");
}

function getProfileImgUrl(idUser, idHTML){

  firebase.storage().ref('users/'+idUser+'/profile.jpg').getDownloadURL().then(imgUrl =>{
      let img = document.getElementById(idHTML);
      img.src = imgUrl;
  }, function(error) {
    //console.log(error)
  }).catch(function(error){
    //console.log(error);
  });
}

// Carica tutti i posts presenti nel database da tutti gli utenti:
async function loadPosts() {
    let users = firebase.firestore().collection("users");
    let postsArray = [];

    const snapshotUsers = await users.get();
    //devo convertire in docs
    let listaUtenti = snapshotUsers.docs;

    for (let i=0; i<snapshotUsers.size; i++) //forse si può usare anche size di lsitaUtenti? Not sure, though
    {
        let ref = users.doc(listaUtenti[i].id).collection("posts");
        if (ref)
        {
            let postsSnapshot;
            let username = listaUtenti[i].data().username;
            let userId=listaUtenti[i].id;
            //Snapshot lo converto in un array di docs, a cui è più facile accedere
            //+ ordino già i post dell'utente[i]
            postsSnapshot = (await ref.orderBy("publicationTime").get()).docs;
            postsSnapshot.forEach(function(postDoc) {
                postsArray.push([username, postDoc.data().content, postDoc.data().publicationTime.toDate(), postDoc.data().nLike, postDoc.data().gifId, postDoc.id, userId, listaUtenti[i].data().isVerified]);
                                  //0,            1,                              2                               3                   4                     5           6
              });
        }
    }

    postsArray.sort(function(a, b)
    {
        let posData = 2;
        let data1 = a[posData];
        let data2 = b[posData];
        return data2 - data1; //devo ordinare da data più recente a più vecchia
    });

    //printPosts(postsArray);
    DisplayList(postsArray, list_element, rows, current_page);
    SetupPagination(postsArray, pagination_element, rows);
}

async function addLike(idPost, userCreator, id) {
  let button = document.getElementById(id);
  let counterLikes = document.getElementById("numberOfLikes" + id);
  let numLikes = counterLikes.innerHTML;

  if (button.name == "unclicked") //todo: aggiungi la condizione che impedisce ad un utente di mettere mi piace a se stesso??
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

function logout(){
  firebase.auth().signOut()
  .then(function() {
  })
  .catch(function(error) {});
}

function sendUsernameToSearchPage() {
  // define form:
  const form = document.getElementById('searchUsers');
  const username = form[0].value;
  localStorage.setItem("storageName",username);
}

var mybutton = document.getElementById("myBtn");

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function SetupPagination (items, wrapper, rows_per_page) {
	wrapper.innerHTML = "";

	let page_count = Math.ceil(items.length / rows_per_page);
	for (let i = 1; i < page_count + 1; i++) {
		let btn = PaginationButton(i, items);
		wrapper.appendChild(btn);
	}
}

function PaginationButton (page, items) {
	let button = document.createElement('button');
	button.innerText = page;

	if (current_page == page) button.classList.add('active');

	button.addEventListener('click', function () {
		current_page = page;
		DisplayList(items, list_element, rows, current_page);

		let current_btn = document.querySelector('.pagenumbers button.active');
		current_btn.classList.remove('active');

    button.classList.add('active');
    button.onclick(topFunction());
	});

	return button;
}

const list_element = document.getElementById('list');
const pagination_element = document.getElementById('pagination');

let current_page = 1;
let rows = 5;

function DisplayList (items, wrapper, rows_per_page, page) {
	wrapper.innerHTML = "";
	page--;

	let start = rows_per_page * page;
	let end = start + rows_per_page;
  let paginatedItems = items.slice(start, end);
  let gifHtml,postTool;
  
	for (let i = 0; i < paginatedItems.length; i++) {

    let verifiedIcon = "";
    let item = paginatedItems[i];
    
    if (item[7] == true){
      verifiedIcon = " ☑️";
    }

		let item_element = document.createElement('div');
    item_element.classList.add('item');

    if (item[4] != null) {
      gifHtml = `
                <div class="row mb-4">
                  <div class="col-md-12">
                    <div class="card">
                      <img class="card-img-top" src="`+item[4]+`" alt="Gif del post"/>
                    </div>
                  </div>
                </div>
                `;
    } else {
      gifHtml = '';
      
    }

    if (firebase.auth().currentUser.uid==item[6]) {
      postTool= 
        `
        <div class="row">
          <div class="col-md-12 text-right">
            <div id="deletePost`+item[5]+`">
              <div class="btn-group" role="group" aria-label="Basic example">
                <button onclick="showDeleteConfirmation('`+item[5]+`')" type="button" class="btn btn-secondary">X</button>
              </div>
            </div>
          </div>
        </div>
        `;
    } else {
      postTool='';
    }

    item_element.innerHTML+=
      `
      <div class='card mb-4' style="background-color: whitesmoke;">
        <div class='card-body text-left'>
          <!-- user info -->
          <div class="row">
            <div class="col-md-12">
              <div class="row">
                <div class="col-md-1">
                  <img id="`+i+`g" src="https://www.flaticon.com/svg/static/icons/svg/64/64572.svg" class="account-avatar" alt="Account Image">
                </div>
                <div class="col-md-9">
                  <h5 class="account-text">`+item[0]+ verifiedIcon + `</h5>
                </div>
                <div class="col-md-2">
                  `+postTool+`
                </div>
              </div>
            </div>
          </div>
          <!-- post content -->
          <div class="row align-items-center text-left mt-4 mb-4">
            <div class="col-md-12">`+ item[1] +`</div>
          </div>
          <!-- GIF -->
          `+gifHtml+`
          <!-- Post stats -->
          <div class="row">
            <div class="col-md-9">
              <div class="text-muted">
                <b>Posted on `+item[2].toLocaleDateString()+`</b>
              </div>
            </div>
            <div class="col-md-3">
              <div class="row">
                <div class="col-md-7 text-right">
                  <b id="numberOfLikes`+ i + `">`+item[3]+`</b>
                </div>
                <div class="col-md-5">
                  <img class="img-fluid float-left" src="assets/heart.png" id="`+i+`" name ="unclicked" onclick="addLike('`+item[5]+`','`+item[6]+`', ` + i + `)">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      `;
      getProfileImgUrl(item[6], (i+"g"));
		
    wrapper.appendChild(item_element);
    document.getElementById("loading-posts-alert").innerHTML="";
	}
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