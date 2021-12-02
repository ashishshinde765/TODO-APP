import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Note } from 'src/app/shared/note.model';
import { NotesService } from 'src/app/shared/notes.service';
import { RouterModule } from '@angular/router';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { setClassMetadata } from '@angular/core/src/r3_symbols';


@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  template: '<input (keyup)="filter(target($event).value)">',
  animations: [
    trigger('itemAnime', [
      //ENTRY ANIMATION
      transition('void => *', [
        //INITAL STATE
        style({
          height: 0,
          opacity: 0,
          transform: 'scale(0.85)',
          'margin-bottom': 0,

          //WE HAVE TO EXPAND OUT THE PADDING PROPERTY
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
        }),
        // WE FIRST WANT TO ANNIMATE THE SPACING(WHICH INCLUDES HEIGHT AND MARGIN)
        animate('50ms', style({
          height: '*',
          'margin-bottom': '*',

          //WE HAVE TO EXPAND OUT THE PADDING PROPERTY
          paddingTop: '*', 
          paddingBottom: '*',
          paddingLeft: '*',
          paddingRight: '*',
        })),
        animate(68)
      ]),
      transition('* => void',[
        // first scale up
        animate(50, style({
          transform: 'scale(1.05)'
        })),
        // then scale down back to normal size while beginning to fade out
        animate(50, style({
          transform: 'scale(1)',
          opacity: 0.75
        })),
        // Scale down and fade out completely
        animate('120ms ease-out', style({
          transform: 'scale(0.68)',
          opacity: 0,
        })),
        // then animate the spacing(Which includes the height and margin and padding)
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
          optional:true
        })
      ])
    ])
  ]
})
export class NotesListComponent implements OnInit {

  notes: Note[] = new Array<Note>();
  filteredNotes: Note[] = new Array<Note>();

  @ViewChild('filterInput') filterInputElRef: ElementRef<HTMLInputElement>

  constructor(private notesService: NotesService) { }

  ngOnInit(): void {
    //we wAnt to retrieve All the notes from NotesService
    this.notes = this.notesService.getAll();
   // this.filteredNotes = this.notesService.getAll();
   this.filter(' ');
  }

  deleteNote(note: Note){
    let noteId = this.notesService.getId(note);
    this.notesService.delete(noteId);
    this.filter(this.filterInputElRef.nativeElement.value);
  }

  generateNoteURL(note: Note){
    let noteId = this.notesService.getId(note);
    return noteId;
  }

  filter(query: string){
    
    query = query.toLowerCase().trim();

    let allResults: Note[] = new Array<Note>();
    // Split up the search query into individual  qords
    let terms: string[] = query.split(' '); // split on spaces
    // Remove Duplicate Search terms
    terms = this.removeDuplicate(terms);
    // Compile all relevant results into the allResults array
    terms.forEach(term => {
      let results: Note[] = this.relevantNotes(term);
      //Append results to the Allresults Array
      allResults = [...allResults, ...results]
    });

    // allresults will include duplicate notes
    // because a particular note can be the result of many search terms
    // but we don't want to show the same note multiples times on the UI
    // so we first must remove the duplicates
    let uniqueResults = this.removeDuplicate(allResults);
    this.filteredNotes = uniqueResults;

    // now sort by relevancy
    this.sortByRelevancy(allResults);
  }

  removeDuplicate(arr: Array<any>) : Array<any> {
    let uniqueResults: Set<any> = new Set<any>();
    // loop through the input array and add the items to the set
    arr.forEach(e => uniqueResults.add(e));

    return Array.from(uniqueResults);
  }

  relevantNotes(query: string) : Array<Note>{
    query = query.toLowerCase().trim();
    let relevantNotes = this.notes.filter(note => {
      if(note.title && note.title.toLowerCase().includes(query)){
        return true;
      }
      if(note.body && note.body.toLowerCase().includes(query)){
        return true
      }
        return false;
    })

    return relevantNotes;
  }

  sortByRelevancy(searchResults: Note[]){
    // This method will calculate the relevancy of a note based on the number of times it appears in
    // the search results
    
    let noteCountObj: {[noteId: string]: number} = {}; // format - key:value -> NoteId:number (note object id : count)

    searchResults.forEach(note => {
      let noteId = this.notesService.getId(note); // get the notes id

     if (noteCountObj[noteId]) {
       noteCountObj[noteId] += 1;
     } else {
       noteCountObj[noteId] = 1;
     }
    })

    this.filteredNotes = this.filteredNotes.sort((a: Note, b:Note) => {
      let aId = this.notesService.getId(a);
      let bId = this.notesService.getId(b);

      let aCount = noteCountObj[aId];
      let bCount = noteCountObj[bId];

      return bCount - aCount;
    })
  }
}
