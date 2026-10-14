import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App - Ecosystem Cards Launcher', () => {
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

  it('should render brand and site cards with images and descriptions', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('AURA');
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
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const urls = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.site-card')).map(
      (a) => a.getAttribute('href')
    );

    expect(urls).toContain('https://aura-corporativa.vercel.app');
    expect(urls).toContain('https://aura-ops-five.vercel.app');
    expect(urls).toContain('https://aura-employee.vercel.app');
  });
});
