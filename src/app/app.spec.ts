import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App - AURA Launcher', () => {
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

  it('should render the ecosystem launcher with access cards', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand-title')?.textContent).toContain('AURA');
    expect(compiled.textContent).toContain('AURA Corporativa');
    expect(compiled.textContent).toContain('AURA Ops');
    expect(compiled.textContent).toContain('AURA Employee');
  });

  it('should have direct URLs to the applications', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const links = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.app-card')).map(
      (a) => a.getAttribute('href')
    );

    expect(links).toContain('https://aura-corporativa.vercel.app');
    expect(links).toContain('https://aura-ops-five.vercel.app');
    expect(links).toContain('https://aura-employee.vercel.app');
  });
});
