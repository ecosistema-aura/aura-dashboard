import { Component, OnInit, signal } from '@angular/core';

export interface EcosystemApp {
  name: string;
  tag: string;
  description: string;
  url: string;
  image: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly showIntro = signal<boolean>(true);
  protected readonly isIntroFading = signal<boolean>(false);

  protected readonly apps: EcosystemApp[] = [
    {
      name: 'AURA Corporativa',
      tag: 'Sitio Web & Blog',
      description: 'Plataforma institucional de AURA, presentación de servicios y blog oficial.',
      url: 'https://aura-corporativa.vercel.app',
      image: '/app-corporativa.jpg',
    },
    {
      name: 'AURA Ops',
      tag: 'Gestión Operativa',
      description: 'Control de operaciones en tiempo real, tareas, procedimientos SOP y aprobaciones.',
      url: 'https://aura-ops-five.vercel.app',
      image: '/app-ops.png',
    },
    {
      name: 'AURA Employee',
      tag: 'Portal del Colaborador',
      description: 'Autoservicio para colaboradores: registro de asistencias, boletas de pago y solicitudes.',
      url: 'https://aura-employee.vercel.app',
      image: '/app-employee.png',
    },
  ];

  ngOnInit(): void {
    setTimeout(() => {
      this.isIntroFading.set(true);
    }, 2500);

    setTimeout(() => {
      this.showIntro.set(false);
    }, 3100);
  }
}
