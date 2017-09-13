import { Injectable } from '@angular/core';
import { Facebook } from  '@ionic-native/facebook';
import firebase from 'firebase';
import { Platform } from 'ionic-angular';
import {AngularFireAuth} from "angularfire2/auth";

@Injectable()
export class Auth {
  authenticatedUser;

  constructor(public facebook: Facebook, public platform: Platform, private afAuth: AngularFireAuth) {
    afAuth.authState.subscribe(user => {
      if (!user) {
        this.authenticatedUser = null;
        return;
      }

      this.authenticatedUser = user;
    });
  }

  get authState() {
    return this.afAuth.authState;
  }

  createUserWithEmail(email: string, password: string) : firebase.Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  signInWithEmail(email:string, password: string): firebase.Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  signInWithFacebook(): firebase.Promise<any> {
    if (this.platform.is('cordova'))
    {
      this.facebook.login(['email']).then((response) => {
        const facebookCredential = firebase.auth.FacebookAuthProvider
          .credential(response.authResponse.accessToken);

        return this.afAuth.auth.signInWithCredential(facebookCredential).catch(error => { console.log(error)});
      }).catch((error) => { console.log(error) });
    }
    else
    {
      var provider = new firebase.auth.FacebookAuthProvider();
      provider.addScope('email');
      provider.setCustomParameters({
        'display': 'popup'
      });

      return this.afAuth.auth.signInWithPopup(provider).catch(function(error) {
        console.log(error);
      });
    }
  }

  signOut(): void {
    this.afAuth.auth.signOut().then(() => console.log("signed out"));
  }
}
