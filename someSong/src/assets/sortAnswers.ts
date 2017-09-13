/**
 * Created by Lucas on 5/30/2017.
 */
import {Pipe} from '@angular/core';

@Pipe({
  name: 'sortAnswers'
})
export class SortAnswers {
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

    if (args == null) {return arr;}

    return arr.sort((a, b) => {
      if (a.$key == args) return -1;
      if (b.$key == args) return 1;
      return 0;
    });
  }
}
