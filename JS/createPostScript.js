  
let apiEndPoint = 'https://api.giphy.com/v1/gifs/search';
let publicKey = 'dc6zaTOxFJmzC';
let gif_select = null;
let testo=null;

function setup(){
  //getLoggedUserInfo();
  firebase.auth().onAuthStateChanged(async function(user) {
      if(!user){
        window.location.href = "signUp.html";
      }
  });
  testo=select("#contenuto");

}

function goBackToDashboard() {
    window.location.href = 'dashboard.html';
}

function getLoggedUserInfo() {
  firebase.auth().onAuthStateChanged(async function(user) {
      if (user) {
          let loggedUserId = firebase.auth().currentUser.uid;
          
          firebase.firestore().collection("users").doc(loggedUserId).get().then(function(doc) {
              if (doc.exists) {
                  //console.log("Document data:", doc.data());
              } else {
                  //console.log("No such document!");
              }
          }).catch(function(error) {
              //onsole.log("Error getting document:", error);
          });
      } else {
          window.location.replace = 'signUp.html';
      }
    });
}

function post(){
  let loggedUserId = firebase.auth().currentUser.uid;
  if(testo!=null){
  let time  = new firebase.firestore.Timestamp.now();
    firebase.firestore().collection("users").doc(loggedUserId).collection("posts").add({
        content: testo.value(),
        publicationTime: time,
        nLike:0,
        gifId:gif_select
        

    }).then(function(docRef) {
        window.location.href = "dashboard.html";
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
  }

}



function includeHTML() {
    let z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
      elmnt = z[i];
      /*search for elements with a certain atrribute:*/
      file = elmnt.getAttribute("w3-include-html");
      if (file) {
        /* Make an HTTP request using the attribute value as the file name: */
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {elmnt.innerHTML = this.responseText;}
            if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
            /* Remove the attribute, and call this function once more: */
            elmnt.removeAttribute("w3-include-html");
            includeHTML();
          }
        }
        xhttp.open("GET", file, true);
        xhttp.send();
        /* Exit the function: */
        return;
      }
    }
  
  }



new Vue({
    el: '#app',
    //setto le varuabili
    data: {
        query: '',
        results: false,
        current_gif: false
    },
    methods: {
        //quando premo il bottone
        searchGIFs: function () {
            let self = this;
            //faccio la chiamate alla api(?)
            axios.get(apiEndPoint, {
                params: {
                    api_key: publicKey,
                    q: self.query.split(' ').join('+'),
                    limit: 10000
                }
            })
            //se non trovo risultati
            .then(function (response) {
                self.results = response.data.data;
                self.current_gif = false;
            })
            //se ci sono errori
            .catch(function (error) {
                //console.log(error);
            });
        },
        //per visualizzare la gif quando viene cliccata
        viewGIF: function (gif) {
            this.current_gif = gif.images.original.url;
            gif_select=gif.images.original.url;
        }
    }
});