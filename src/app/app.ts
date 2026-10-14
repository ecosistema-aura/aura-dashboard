import { Component } from '@angular/core';

export interface EcosystemLink {
  name: string;
  url: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly links: EcosystemLink[] = [
    { name: 'AURA Corporativa', url: 'https://aura-corporativa.vercel.app' },
    { name: 'AURA Ops', url: 'https://aura-ops-five.vercel.app' },
    { name: 'AURA Employee', url: 'https://aura-employee.vercel.app' },
  ];
}
