import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { App } from './app';

describe('App - Ecosystem Cards Launcher with Intro', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render 3-second intro screen with official logo and welcome text', async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    // Intro is initially visible
    expect(compiled.querySelector('.intro-overlay')).not.toBeNull();
    expect(compiled.querySelector('.intro-title')?.textContent).toContain('Bienvenido a AURA Directorio');
    expect(compiled.querySelector('.intro-logo')?.getAttribute('src')).toBe('/logo_aura.jpg');

    // Advance 2.6s -> fade out class added
    await vi.advanceTimersByTimeAsync(2600);
    fixture.detectChanges();
    expect(compiled.querySelector('.intro-overlay')?.classList).toContain('fade-out');

    // Advance past 3.1s -> intro removed from DOM
    await vi.advanceTimersByTimeAsync(600);
    fixture.detectChanges();
    expect(compiled.querySelector('.intro-overlay')).toBeNull();

    vi.useRealTimers();
  });

  it('should render brand and site cards with images and descriptions', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand-text h2')?.textContent).toContain('AURA');
    const cards = compiled.querySelectorAll('.site-card');
    expect(cards.length).toBe(3);

    // Verify images
    const images = Array.from(compiled.querySelectorAll<HTMLImageElement>('.card-img')).map(
      (img) => img.getAttribute('src')
    );
    expect(images).toContain('/app-corporativa.jpg');
    expect(images).toContain('/app-ops.png');
    expect(images).toContain('/app-employee.png');

    // Verify descriptions
    expect(compiled.textContent).toContain('Plataforma institucional de AURA');
    expect(compiled.textContent).toContain('Control de operaciones en tiempo real');
    expect(compiled.textContent).toContain('Autoservicio para colaboradores');
  });

  it('should link to correct app URLs', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const urls = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.site-card')).map(
      (a) => a.getAttribute('href')
    );

    expect(urls).toContain('https://aura-corporativa.vercel.app');
    expect(urls).toContain('https://aura-ops-five.vercel.app');
    expect(urls).toContain('https://aura-employee.vercel.app');
  });
});
