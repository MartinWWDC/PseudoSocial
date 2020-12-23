"use strict";

window.onload = function setup() {
    const searchedUsername = localStorage.getItem("storageName");
    document.getElementById('resultsForLabel').innerHTML = 'Results for "'+searchedUsername+'":';
    printAccounts(searchedUsername);
}

function navigateBack() {
    location.href = 'dashboard.html';
}

function moveToProfilePage(profileId) {
    let currentUserId = firebase.auth().currentUser.uid;
    
    if(currentUserId == profileId) {
        window.location.href = "profile.html";
    } else {
        localStorage.setItem("idForProfilePage", profileId);
        window.location.href = "foreignProfile.html";
    }
}

async function printAccounts(searchedUsername) {
    const snapshot = await firebase.firestore().collection("users").get();
    let usernames = snapshot.docs.map(doc => { return doc.data().username; });
    let ids = snapshot.docs.map(doc => { return doc.id; });
    let lowercaseSearchedUsername = searchedUsername.toLowerCase();
    lowercaseSearchedUsername = lowercaseSearchedUsername.trim();

    for(let i=0; i<ids.length; i++) {
        const lowerCaseUsername = usernames[i].toLowerCase();
        if (lowerCaseUsername.includes(lowercaseSearchedUsername)) {
            const id = ids[i];
            let storageRef = firebase.storage().ref('users').child(ids[i]+'/profile.jpg');

            storageRef.getDownloadURL().then(function(url) {
                document.getElementById('postsList').innerHTML +=
                `<div class='card mb-4' style="background-color: #D3D7E5;">
                    <button onclick="moveToProfilePage('`+id+`')">
                        <div class='card-body text-left'>
                            <div class="row">
                                <div class="col-md-1">
                                    <img src="`+url+`" class="account-avatar" alt="Account Image">
                                </div>
                                <div class="col-md-11">
                                    <h5 class="account-text">`+usernames[i]+`</h5>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>`;
            }).catch(function(error) {
                console.log("l'errore sopra indica che l'utente non ha un'immagine di profilo. Ingorare.")
                document.getElementById('postsList').innerHTML +=
                    `<div class='card mb-4' style="background-color: #D3D7E5;">
                        <button onclick="moveToProfilePage('`+id+`')">
                            <div class='card-body text-left'>
                                <div class="row">
                                    <div class="col-md-1">
                                        <img src="https://www.flaticon.com/svg/static/icons/svg/64/64572.svg" class="account-avatar" alt="Account Image">
                                    </div>
                                    <div class="col-md-11">
                                        <h5 class="account-text">`+usernames[i]+`</h5>
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>`;
            });
        }
    }
}