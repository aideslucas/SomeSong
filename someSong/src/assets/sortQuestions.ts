/**
 * Created by Lucas on 5/30/2017.
 */
import {Pipe} from '@angular/core';

@Pipe({
  name: 'sortQuestions'
})
export class SortQuestions {

  getLocalTime(time) {
    var localTime = new Date();
    localTime.setUTCFullYear(time.year);
    localTime.setUTCMonth(time.month);
    localTime.setUTCDate(time.date);
    localTime.setUTCHours(time.hours);
    localTime.setUTCMinutes(time.minutes);
    localTime.setUTCSeconds(time.seconds);

    return localTime;
  }

  transform(arr, args) {
    if (arr == null) {
      return null;
    }

    if (args == null) {
      return arr.sort((a, b) => {
        if (a.correctAnswer != null &&
          b.correctAnswer == null) {
          return 1;
        }
        if (a.correctAnswer == null &&
          b.correctAnswer != null) {
          return -1;
        }
        if (this.getLocalTime(a.timeUTC) < this.getLocalTime(b.timeUTC)) {
          return 1;
        }

        if (this.getLocalTime(a.timeUTC) > this.getLocalTime(b.timeUTC)) {
          return -1;
        }
        return 0;
      });
    }

    return arr.sort((a, b) => {
      if (args == "Friends") {
        // TODO: Friends
      }

      else if (args == "Resolved") {
        if (a.correctAnswer != null &&
          b.correctAnswer == null) {
          return -1;
        }
        if (a.correctAnswer == null &&
          b.correctAnswer != null) {
          return 1;
        }
      }

      else if (args == "Answers") {
        if (a.answers != null &&
          b.answers == null) {
          return -1;
        }
        if (a.answers == null &&
          b.answers != null) {
          return 1;
        }
        if (a.answers != null &&
          b.answers != null) {
          if (Object.keys(a.answers).length > Object.keys(b.answers).length) {
            return -1;
          }
          else {
            return 1;
          }
        }
      }

      else if (args == "Recent") {
        if (this.getLocalTime(a.timeUTC) < this.getLocalTime(b.timeUTC)) {
          return 1;
        }

        if (this.getLocalTime(a.timeUTC) > this.getLocalTime(b.timeUTC)) {
          return -1;
        }
      }

      else {
        //TODO: Location
        return args[a.$key] - args[b.$key];
      }

      return 0;
    });
  }
}
