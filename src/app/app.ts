import { Component } from '@angular/core';

export interface EcosystemApp {
  name: string;
  tag: string;
  description: string;
  url: string;
  icon: string;
  tone: 'coral' | 'blue' | 'green';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly apps: EcosystemApp[] = [
    {
      name: 'AURA Corporativa',
      tag: 'Portal Institucional',
      description: 'Sitio web institucional, blog de noticias y servicios corporativos.',
      url: 'https://aura-corporativa.vercel.app',
      icon: 'globe',
      tone: 'coral',
    },
    {
      name: 'AURA Ops',
      tag: 'Gestión Operacional',
      description: 'Centro de control de operaciones, tareas, solicitudes y aprobaciones.',
      url: 'https://aura-ops.vercel.app',
      icon: 'activity',
      tone: 'blue',
    },
    {
      name: 'AURA Employee',
      tag: 'Portal del Colaborador',
      description: 'Espacio de autoservicio para asistencias, boletas de pago y solicitudes.',
      url: 'https://aura-employee.vercel.app',
      icon: 'users',
      tone: 'green',
    },
  ];
}
