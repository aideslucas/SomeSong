import { Injectable } from '@angular/core';
import firebase from 'firebase';
import {User} from "./user";
import {Question} from "./question";
import 'rxjs/add/operator/first'
import {Answer} from "./answer";
import {Record} from "./record";

@Injectable()
export class Deletes {

  constructor(private _user: User,
              private _question: Question,
              private _answer: Answer,
              private _record: Record) {
  }

  deleteAnswer(answer: any)
  {
    let userID = answer.user.userID ? answer.user.userID : answer.user;
    firebase.database().ref('/users/' + userID + '/answers/' + answer.answerID).set(null);

    let questionID = answer.question.questionID ? answer.question.questionID : answer.question;
    firebase.database().ref('/questions/' + questionID + '/answers/' + answer.answerID).set(null);
    firebase.database().ref('/questions/' + questionID + '/correctAnswer').once('value').then((data) => {
      if (data.val() && data.val() == answer.answerID) {
        firebase.database().ref('/questions/' + questionID + '/correctAnswer').set(null);
      }
    });

    firebase.database().ref('/answers/' + answer.answerID).set(null);
  }


  deleteQuestion(question: any) {
    let userID = question.user.userID ? question.user.userID : question.user;
    firebase.database().ref('/users/' + userID + '/questions/' + question.questionID).set(null);

    this._question.getQuestionAnswersNew(question.questionID).first().subscribe(questionAnswer => {
      if (questionAnswer) {
        for (let ansKey of Object.keys(questionAnswer))
        {
          this._answer.getAnswerDetailsNew(ansKey).first().subscribe((answerDetail) => {
            if (answerDetail) {
              this.deleteAnswer(answerDetail);
            }
          });
        }
      }
    });

    this._record.deleteRecord(question.record);

    return firebase.database().ref('/questions/' + question.questionID).set(null);
  }
}
