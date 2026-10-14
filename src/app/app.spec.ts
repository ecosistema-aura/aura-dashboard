import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { App } from './app';
import { demoAdminCredentials } from './demo-credentials';

describe('App - AURA Ecosystem Hub', () => {
  beforeEach(async () => {
    sessionStorage.setItem('aura.session', JSON.stringify({ name: 'Andre Zapata', email: 'admin@aura.local', role: 'Administrador' }));
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  afterEach(() => {
    sessionStorage.removeItem('aura.session');
    localStorage.removeItem('aura.hub.custom_apps');
    localStorage.removeItem('aura.hub.env');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the AURA Ecosystem directory and applications', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand-title')?.textContent).toContain('AURAHUB');
    expect(compiled.querySelector('h1')?.textContent).toContain('Portal del Ecosistema AURA');
    expect(compiled.textContent).toContain('AURA Corporativa');
    expect(compiled.textContent).toContain('AURA Ops');
    expect(compiled.textContent).toContain('AURA Employee');
    expect(compiled.textContent).toContain('AURA Cloud & Supabase');
  });

  it('should switch between Cloud (Production) and Localhost environments', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    // Default is prod
    expect(compiled.textContent).toContain('https://aura-corporativa.vercel.app');

    // Click local button
    const localBtn = compiled.querySelectorAll<HTMLButtonElement>('.env-button')[1];
    localBtn.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('http://localhost:5173');
    expect(compiled.textContent).toContain('http://localhost:4200');
    expect(compiled.textContent).toContain('http://localhost:4201');
  });

  it('should filter applications by category and search term', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    // Filter by Operaciones category tab
    const tabs = compiled.querySelectorAll<HTMLButtonElement>('.tab-button');
    const opsTab = Array.from(tabs).find((t) => t.textContent?.includes('Operaciones'));
    opsTab?.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('AURA Ops');
    expect(compiled.textContent).not.toContain('AURA Corporativa');

    // Search query
    const searchInput = compiled.querySelector<HTMLInputElement>('.search-box input')!;
    searchInput.value = 'Employee';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Since category is Operaciones, Employee won't show
    expect(compiled.querySelector('.empty-state')).not.toBeNull();

    // Reset to Todas las Apps
    const allTab = Array.from(tabs).find((t) => t.textContent?.includes('Todas'));
    allTab?.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('AURA Employee');
  });

  it('should allow adding and removing custom apps in directory', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance;
    const compiled = fixture.nativeElement as HTMLElement;

    // Open add app modal
    compiled.querySelector<HTMLButtonElement>('.add-app-button')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.modal-dialog')).not.toBeNull();

    // Fill form and save via component
    (app as any).newAppName = 'AURA Analytics';
    (app as any).newAppUrlProd = 'https://analytics.aura.com';
    (app as any).saveCustomApp();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('AURA Analytics');

    // Delete custom app
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deleteBtn = compiled.querySelector<HTMLButtonElement>('.delete-app-btn');
    deleteBtn?.click();
    fixture.detectChanges();

    expect(Array.from(compiled.querySelectorAll('.app-card h3')).map(h => h.textContent)).not.toContain('AURA Analytics');
  });

  it('should keep only email-based sign-in and registration options', async () => {
    sessionStorage.removeItem('aura.session');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.provider-actions')).toBeNull();
    expect(compiled.textContent).not.toContain('Google / Gmail');
    expect(compiled.textContent).not.toContain('Facebook');
    expect(compiled.querySelector('.auth-switch')?.textContent).toContain('Registrarme');
  });

  it('should require the configured demo administrator credentials', async () => {
    sessionStorage.removeItem('aura.session');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const email = compiled.querySelector<HTMLInputElement>('input[name="email"]')!;
    const password = compiled.querySelector<HTMLInputElement>('input[name="password"]')!;
    const form = compiled.querySelector<HTMLFormElement>('.auth-form')!;

    email.value = demoAdminCredentials.email;
    password.value = demoAdminCredentials.password;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(compiled.querySelector('.profile-copy strong')?.textContent).toBe('Andre Zapata');
    expect(compiled.querySelector('.profile-copy small')?.textContent).toBe('Administrador');
    expect(sessionStorage.getItem('aura.session')).not.toContain(demoAdminCredentials.password);
  });

  it('should keep Firebase accounts as regular users after restoring a session', async () => {
    sessionStorage.setItem('aura.session', JSON.stringify({
      name: 'Lucia Torres',
      email: 'lucia@example.com',
      role: 'Usuario',
    }));
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.profile-copy small')?.textContent).toBe('Usuario');
  });

  it('should show the required fields for Firebase email registration', async () => {
    sessionStorage.removeItem('aura.session');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.auth-switch button:last-child')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('input[name="name"]')).not.toBeNull();
    expect(compiled.querySelector('input[name="confirmPassword"]')).not.toBeNull();
  });

  it('should wait before returning to the login screen on sign out', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    vi.useFakeTimers();
    compiled.querySelector<HTMLButtonElement>('.account-trigger')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.logout-action')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.signout-overlay')).not.toBeNull();
    expect(compiled.querySelector('.auth-screen')).toBeNull();
    await vi.advanceTimersByTimeAsync(1600);
    fixture.detectChanges();
    vi.useRealTimers();

    expect(compiled.querySelector('.signout-overlay')).toBeNull();
    expect(compiled.querySelector('.auth-screen')).not.toBeNull();
  });
});
