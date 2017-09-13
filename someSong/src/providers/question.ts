import {Injectable} from '@angular/core';
import {User} from "./user";
import firebase from 'firebase';
import {Observable} from "rxjs/Observable";
import {Score} from "./score";
import {Answer} from "./answer";
import {AngularFireDatabase} from "angularfire2/database";

@Injectable()
export class Question {
  private date: any = new Date();

  constructor(private _user: User,
              private _score: Score,
              private afDB: AngularFireDatabase) {
  }

  getQuestions() {
    return this.afDB.list('/questions/');
  }

  getQuestionDetailsNew(questionID: string): Observable<any> {
    return this.afDB.object('/questions/' + questionID);
  }

  getNewQuestionID() {
    return firebase.database().ref().child('unresolvedQuestions').push().key;
  }

  writeNewQuestion(questionID: string, genres: {}, languages: {}, record: string, userID: string, title: string, cordinates: any) {
    var time = new Date();

    this._user.getUserNew(userID).first().subscribe(data => {
      var user = data;
      if (user.questions == null) {
        user.questions = {};
      }

      user.questions[questionID] = true;
      this._score.updateScore(4, userID);
      this._user.updateUser(user);
    });

    let coords = {};
    if (cordinates != null) {
      if (cordinates.latitude != null && cordinates.longitude != null){
        coords = {
          latitude: cordinates.latitude,
          longitude: cordinates.longitude
        };
      }
    }

    return firebase.database().ref('/questions/' + questionID).set({
      languages: languages,
      genres: genres,
      timeUTC: {
        date: time.getUTCDate(),
        month: time.getUTCMonth(),
        year: time.getUTCFullYear(),
        hours: time.getUTCHours(),
        minutes: time.getUTCMinutes(),
        seconds: time.getUTCSeconds()
      },
      questionID: questionID,
      record: record,
      user: userID,
      title: title,
      coordinates: coords
    });
  }

  updateQuestion(question) {
    return this.afDB.object('/questions/' + question.questionID).set(question);
  }

  getQuestionAnswersNew(questionID) {
    return this.afDB.list('/questions/' + questionID + '/answers/');
  }
}
