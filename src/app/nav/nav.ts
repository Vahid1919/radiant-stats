import { Component } from '@angular/core';
import { NavButtonGroup } from '../nav-button-group/nav-button-group';

@Component({
  selector: 'app-nav',
  imports: [NavButtonGroup],
  templateUrl: './nav.html',
  styles: `
    header {
      font-family: 'Chakra Petch', sans-serif;
      font-weight: 600;
      font-style: normal;

      background: rgba(0, 0, 0, 0.9);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(6.9px);
      -webkit-backdrop-filter: blur(6.9px);
      border: 1px solid rgba(0, 0, 0, 0.14);
    }
  `,
})
export class Nav { }
