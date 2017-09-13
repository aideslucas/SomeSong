import {Injectable} from '@angular/core';
import firebase from 'firebase';
import {AngularFireDatabase, FirebaseObjectObservable} from "angularfire2/database";
import {Auth} from "./auth";

@Injectable()
export class User {
  currentUser: FirebaseObjectObservable<any>;

  constructor(private afDB: AngularFireDatabase,
              private auth: Auth) {
  }

  get CurrentUser() {
    return this.currentUser;
  }

  logIn() {
    this.currentUser = this.afDB.object('/users/' + this.auth.authenticatedUser.uid);
  }

  logOut() {
    this.currentUser.first().subscribe(data => {
      var user = data;
      user.token = "";
      this.updateUser(user);

      this.currentUser = null;
    });
  }

  getUserNew(userID: string) {
    try {
      return this.afDB.object('/users/' + userID);
    }
    catch (err){
      console.log(err);
      return null;
    }
  }

  createUser(userID: string, displayName: string, email: string, image: string) {
    return firebase.database().ref('/users/' + userID).set({
      userID: userID,
      displayName: displayName,
      email: email,
      image: image
    });
  }

  updateUser(user) {
    firebase.database().ref('/users/' + user.userID).update(user);
  }

  getUserQuestionsNew(userID) {
    return this.afDB.list('/users/' + userID + '/questions/');
  }

  getUserAnswersNew(userID) {
    return this.afDB.list('/users/' + userID + '/answers/');
  }

  getUserImage(userID) {
    return firebase.storage().ref().child('images/' + userID + '/profile.png').getDownloadURL();
  }
}
