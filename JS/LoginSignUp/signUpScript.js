'use strict';
let file={}

function getSignUpElements() {
    const form = document.getElementById("form-signup");
    const mail = form[0].value;
    const username = form[1].value;
    const password = form[2].value;
    const passwordConfirmation = form[3].value;

    if (password == passwordConfirmation) {
        signUp(mail, username, password);
    } else {
        document.getElementById("error-message").innerHTMl = "Le due passoword non corrispondono.";
    }
}

function chooseFile(e){
    file = e.target.files[0];
}

function signUp(mail, uName, password) {
    firebase.auth().createUserWithEmailAndPassword(mail, password)
    .then((user) => {
        //var user = firebase.auth().currentUser;

          firebase.auth().onAuthStateChanged(async function(user) {
            if (user) {
            console.log(user.uid);
            let time = new firebase.firestore.Timestamp.now();
            await firebase.firestore().collection("users").doc(user.uid).set({
                username:uName,
                creationData:time
            });

            let defaultImg;
            if(document.getElementById("imageSelect").files.length == 0 ) { //non è stata caricato nessun file;
                console.log("Non hai caricato immagini");
                /*await storageRef.child('default/profile_img.jpg').getDownloadURL().then(function(url) {
                defaultImg= url;
            }
            ).catch(function(error) {
                document.getElementById("errorMessage").innerHTML = error.message;
              });*/
                /*await firebase.storage().ref('users/'+user.uid+'/profile.jpg').put('https://www.flaticon.com/svg/static/icons/svg/561/561169.svg').then(function() {
                }).catch(error =>{
                    document.getElementById("errorMessage").innerHTML = error.message;
                });*/
            }else{
                await firebase.storage().ref('users/'+user.uid+'/profile.jpg').put(file).then(function() {
                }).catch(error =>{
                    document.getElementById("errorMessage").innerHTML = error.message;
                });
            }
            window.location.href = "dashboard.html";
            
            } else {
            // User not logged in or has just logged out.
            }
        });

    }).catch((error) => {
        document.getElementById("errorMessage").innerHTML = error.message;

    });
}