import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Note } from 'src/app/shared/note.model';
import { NotesService } from 'src/app/shared/notes.service';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  animations: [
    trigger('itemAnim', [
      // ENTRY ANIMATION
      transition('void => *', [
        // Initial State
        style({
          height: 0,
          opacity: 0,
          transform: 'scale(0.85)',
          'margin-bottom': 0,

          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
        }),
        // we first want to animate the spacing (which includes height and margin)
        animate('50ms', style({
          height: '*',
          'margin-bottom': '*',
          paddingTop: '*',
          paddingBottom: '*',
          paddingRight: '*',
          paddingLeft: '*',
        })),
        animate(68)
      ]),
      transition('* => void', [
        // we first want to scale up
        animate(50, style({
          transform: 'scale(1.05)'
        })),
        // we then scale down back to normal size while beginning to fadeout
        animate(50, style({
          transform: 'scale(1)',
          opacity: 0.75
        })),
        // we scale down and fade out completely
        animate('120ms ease-out', style({
          transform: 'scale(0.68)',
          opacity: 0,
        })),
        // then we animate out the spacing (which includes height, margin and padding)
        animate('150ms ease-out', style({
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
          'margin-bottom': '0',
        }))
      ])
    ]),

    trigger('listAnim', [
      transition('* => *', [
        query(':enter', [
          style({
            opacity: 0,
            height: 0,
          }),
          stagger(100, [
            animate('0.2s ease')
          ])
        ], {
          optional: true
        })
      ])
    ])
  ]
})
export class NotesListComponent implements OnInit {

  notes: Note[] = new Array<Note>();
  filteredNotes: Note[] = new Array<Note>();

  constructor(private notesService: NotesService) { }

  ngOnInit(): void {
    // we want to retrieve all notes from NotesService
    this.notes = this.notesService.getAll();
    this.filteredNotes = this.notes;
  }

  deleteNote(id: number) {
    this.notesService.delete(id);
  }

  filter(query: string) {
    query = query.toLowerCase().trim();

    let allResults: Note[] = new Array<Note>();
    // split up the search Query into individual words
    let terms: string[] = query.split(' '); // split on spaces
    // remove duplicate search terms
    terms = this.removeDuplicates(terms);
    // compile all relevant results into the allResults array
    terms.forEach(term => {
      let results = this.relevantNotes(term);
      // append results to the allResults array
      allResults = [...allResults, ...results]
    });
    // allResults will include duplicate notes
    // because a particular note can be the result of many search terms
    // but we don't want to show thesame note multiple times on the UI
    // so we first must remove the duplicates
    let uniqueResults = this.removeDuplicates(allResults);
    this.filteredNotes = uniqueResults;

    // now sort by relevancy
   // this.sortByRelevancy(allResults);

  }

  removeDuplicates(arr: Array<any>): Array<any> {
    let uniqueResults: Set<any> = new Set<any>();
    // loop through the input array and add the items to the set
    arr.forEach(e => uniqueResults.add(e));

    return Array.from(uniqueResults);
  }

  relevantNotes(query: string) : Array<Note> {
    query = query.toLowerCase().trim();
    let relevantNotes = this.notes.filter(note => {
      if (note.title && note.title.toLowerCase().includes(query)) {
        return true;
      }
      if (note.body && note.body.toLowerCase().includes(query)) {
        return true;
      }
      return false
    })
    return relevantNotes;
  }

  // sortByRelevancy(searchResults: Note[]) {
  //   // this method will calculate the relevancy of a note based on the number of times it appears in the search results

  //   let noteCountObj: Object = {}; // format - key: value => NoteId:number (note object id : count)

  //   searchResults.forEach(note => {
  //     let noteId = this.notesService.getId(note); // get the notes Id

  //     if (noteCountObj[noteId]) {
  //       noteCountObj[noteId] += 1;
  //     } else {
  //       noteCountObj[noteId] = 1;
  //     }
  //   })

  //   this.filteredNotes = this.filteredNotes.sort((a: Note, b: Note) => {
  //     let aId = this.notesService.getId(a);
  //     let bId = this.notesService.getId(b);

  //     let aCount = noteCountObj[aId];
  //     let bCount = noteCountObj[bId];

  //     return bCount - aCount;
  //   })
  // }
}
