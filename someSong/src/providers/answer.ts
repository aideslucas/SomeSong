import { Injectable } from '@angular/core';
import firebase from 'firebase';
import {User} from "./user";
import {Question} from "./question";
import 'rxjs/add/operator/first'
import {Observable} from "rxjs/Observable";
import {Deletes} from "./deletes";
import {AngularFireDatabase} from "angularfire2/database";

@Injectable()
export class Answer {

  constructor(private _user: User,
              private _question: Question,
              private afDB: AngularFireDatabase) {
  }

  getLocalTime(time) {
    var localTime = new Date();
    localTime.setUTCFullYear(time.year);
    localTime.setUTCMonth(time.month);
    localTime.setUTCDate(time.date);
    localTime.setUTCHours(time.hours);
    localTime.setUTCMinutes(time.minutes);
    localTime.setUTCSeconds(time.seconds);

    return this.formatNum(localTime.getDate()) + "/" +
           this.formatNum(localTime.getMonth()+1) + "/" +
           this.formatNum(localTime.getFullYear()) + " " +
           this.formatNum(localTime.getHours()) + ":" +
           this.formatNum(localTime.getMinutes());
  }

  formatNum(num) {
    if (num < 10)
    {
      return "0"+num;
    }

    return num
  }

  getAnswerDetailsNew(answerID: string): Observable<any> {
    return this.afDB.object('/answers/' + answerID);
  }

  updateAnswer(answer) {
    if (answer.user.userID != null)
    {
      answer.user = answer.user.userID;
    }

    return firebase.database().ref('/answers/' + answer.answerID).set(answer);
  }

  writeNewAnswer(content: string, userID: string, questionID: string)
  {
    var ansKey = firebase.database().ref().child('answers').push().key;
    var time = new Date();

    firebase.database().ref('/answers/' + ansKey).set({
      content: content,
      question: questionID,
      timeUTC: {
        date: time.getUTCDate(),
        month: time.getUTCMonth(),
        year: time.getUTCFullYear(),
        hours: time.getUTCHours(),
        minutes: time.getUTCMinutes(),
        seconds: time.getUTCSeconds()
      },
      user: userID,
      votes: 0,
      answerID: ansKey
    });


    this._question.getQuestionDetailsNew(questionID).first().subscribe(data => {
      var question = data;

      if (question.answers == null)
      {
        question.answers = {};
      }

      question.answers[ansKey] = true;

      this._question.updateQuestion(question);
    });

    this._user.getUserNew(userID).first().subscribe(data => {
      var user = data;

      if (user.answers == null)
      {
        user.answers = {};
      }

      user.answers[ansKey] = true;

      this._user.updateUser(user);
    });

    return ansKey;
  }
}
