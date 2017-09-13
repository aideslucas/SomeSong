/**
 * Created by Lucas on 5/30/2017.
 */
import {Pipe} from '@angular/core';

@Pipe({
  name: 'filterQuestions',
  pure: false
})
export class FilterQuestions {
  transform(arr, args) {
    if(arr == null){return null;}

    if (args == null) {return arr;}

    return arr.filter((item) => {
      // Title Filter
      if (args.selectedTitle) {
        if (item.title.toLowerCase().indexOf(args.selectedTitle.toLowerCase()) == -1) {
          return false;
        }
      }

      // Answers Filter
      if (args.selectedAnswers) {
        if (args.selectedAnswers == "Resolved" && item.correctAnswer == null) {
          return false;
        }
        if (args.selectedAnswers == "Unresolved" && item.correctAnswer != null) {
          return false;
        }
        if (args.selectedAnswers == "WithAnswers" && !item.answers) {
          return false;
        }
      }

      // Friends Filter
      if (args.selectedFriends) {}

      // Language Filter
      if (args.selectedLanguages) {
        let found = false;
        let itemLanguages = Object.keys(item.languages);
        let selectedLanguages = Object.keys(args.selectedLanguages);

        for (let i = 0; i < itemLanguages.length && !found; i++) {
          for (let j = 0; j < selectedLanguages.length && !found; j++) {
            found = itemLanguages[i] == selectedLanguages[j];
          }
        }

        if (!found)
          return false;
      }

      // Genre Filter
      if (args.selectedGenres) {
        let found = false;
        let itemGenres = Object.keys(item.genres);
        let selectedGenres = Object.keys(args.selectedGenres);

        for (let i = 0; i < itemGenres.length && !found; i++) {
          for (let j = 0; j < selectedGenres.length && !found; j++) {
            found = itemGenres[i] == selectedGenres[j];
          }
        }

        if (!found)
          return false;
      }

      if (args.selectedLocation) {
        if (args.selectedLocation.max) {
          if (args.selectedLocation.max == "10") {
            if (args.selectedLocation.dist[item.$key] > 10) {
              return false
            }
          }

          if (args.selectedLocation.max == "50") {
            if (args.selectedLocation.dist[item.$key] > 50) {
              return false
            }
          }

          if (args.selectedLocation.max == "100") {
            if (args.selectedLocation.dist[item.$key] > 100) {
              return false
            }
          }

          if (args.selectedLocation.max == "1000") {
            if (args.selectedLocation.dist[item.$key] > 100) {
              return false
            }
          }
        }
      }

      return true;
    });
  }
}
