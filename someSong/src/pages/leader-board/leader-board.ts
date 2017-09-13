import {Component} from '@angular/core';
import {Score} from "../../providers/score";
import {User} from "../../providers/user";


@Component({
  selector: 'page-leader-board',
  templateUrl: 'leader-board.html'
})
export class LeaderboardPage {
  scores = {};
  user: any;
  userPosition: any;
  userPoints: any;
  leaderboardLoading = true;

  constructor(private _score: Score,
              private _user: User) {
    this._user.currentUser.first().subscribe(data => {
      this.user = data;
      this._score.getScoreDetails(this.user.userID).first().subscribe((scoreDetail) => {
        this.userPoints = scoreDetail;
        this._score.getPosition(data.userID).then(data => {
          this.userPosition = data;
        });
      });
    });

    let loaded = 0;

    this._score.getAllScores().orderByValue().on('child_added', (data) => {
      this._user.getUserNew(data.key).first().subscribe(user => {

          if (user) {
            this.scores[data.key] = {
              'user': user.displayName,
              'score': data.val()
            };
          } else {
            this.scores[data.key] = {'user': data.key, 'score': data.val()}
          }


        loaded++;
        if (loaded == 5) {
          this.leaderboardLoading = false;
        }
      });
    });
  }


  userInTopFive() {
    return (this.userPosition <= 5);
  }
}
