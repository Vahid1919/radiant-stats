import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Nav } from './nav/nav';
import { Hero } from './hero/hero';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Nav, Hero],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('radiant-stats');
}
