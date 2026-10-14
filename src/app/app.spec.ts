import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App - Minimal Route Launcher', () => {
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

  it('should render brand and route buttons', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('AURA');
    const links = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.route-btn'));
    expect(links.length).toBe(3);
    expect(compiled.textContent).toContain('AURA Corporativa');
    expect(compiled.textContent).toContain('AURA Ops');
    expect(compiled.textContent).toContain('AURA Employee');
  });

  it('should link to correct app URLs', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const urls = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.route-btn')).map(
      (a) => a.getAttribute('href')
    );

    expect(urls).toContain('https://aura-corporativa.vercel.app');
    expect(urls).toContain('https://aura-ops-five.vercel.app');
    expect(urls).toContain('https://aura-employee.vercel.app');
  });
});
