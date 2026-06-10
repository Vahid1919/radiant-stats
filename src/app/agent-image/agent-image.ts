import { Component, input, computed } from '@angular/core';
import { AgentName, agentImageUrl } from '../models/agent';

export type { AgentName };

@Component({
  selector: 'app-agent-image',
  imports: [],
  templateUrl: './agent-image.html',
  styles: ``,
  host: { class: 'block h-full w-full' },
})
export class AgentImage {
  agentName = input.required<AgentName>();
  protected url = computed(() => agentImageUrl(this.agentName()));
}
