import { Component, ElementRef, Input, OnInit, Output, Renderer2, ViewChild, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-note-card',
  templateUrl: './note-card.component.html',
  styleUrls: ['./note-card.component.scss']
})
export class NoteCardComponent implements OnInit {

  @Input() title: string;
  @Input() body: string;
  @Input() link: string;

  @Output('delete') deleteEvent: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('truncator') truncator: ElementRef<HTMLElement>;
  @ViewChild('bodyText') bodyText: ElementRef<HTMLElement>;
  constructor(private renderer: Renderer2) { }

  ngOnInit() {}
  ngAfterViewInit(): void {
    //work out if their is a text overflow and if not, then hide the truncator
    let style = window.getComputedStyle(this.bodyText.nativeElement, null);
    let veiwableHeight = parseInt(style.getPropertyValue("height"), 10);
    
    if(this.bodyText.nativeElement.scrollHeight > veiwableHeight){
      // if there is a text overflow, show the fadeout trucator
      this.renderer.setStyle(this.truncator.nativeElement, 'display', 'block');
    }else{
      //else (there is a text overflow), hide the fade out truncator
      this.renderer.setStyle(this.truncator.nativeElement, 'display', 'none');
    }
  }


  onXButtonClick(){
    this.deleteEvent.emit();
  }
}
