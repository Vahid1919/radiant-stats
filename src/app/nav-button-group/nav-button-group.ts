import { Component } from '@angular/core';
import { HlmButtonImports } from '../libs/ui/button/src';

@Component({
  selector: 'app-nav-button-group',
  imports: [HlmButtonImports],
  templateUrl: './nav-button-group.html',
  styles: `
    button {
      font-family: 'Space Mono', monospace;
      font-weight: 400;
      font-style: normal;
      color: lightgrey;
    }
  `,
})
export class NavButtonGroup { }
