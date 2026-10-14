import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { demoAdminCredentials } from './demo-credentials';
import { firebaseAuth } from './firebase-auth';

export type AppCategory = 'todos' | 'corporativo' | 'operaciones' | 'rrhh' | 'infraestructura' | 'personalizado';

export interface QuickLink {
  label: string;
  path: string;
}

export interface EcosystemApp {
  id: string;
  name: string;
  subtitle: string;
  category: AppCategory;
  categoryLabel: string;
  description: string;
  icon: string;
  tone: 'coral' | 'blue' | 'green' | 'purple' | 'amber';
  urlProd: string;
  urlLocal: string;
  techStack: string;
  status: 'Operativo' | 'En desarrollo' | 'Próximamente';
  quickLinks: QuickLink[];
  isCustom?: boolean;
}

interface UserSession {
  name: string;
  email: string;
  role: 'Administrador' | 'Usuario';
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly sessionStorageKey = 'aura.session';
  private readonly customAppsStorageKey = 'aura.hub.custom_apps';
  private readonly envStorageKey = 'aura.hub.env';

  protected readonly currentUser = signal<UserSession | null>(this.readSessionUser());
  protected readonly demoEmail = demoAdminCredentials.email;
  protected readonly demoPassword = demoAdminCredentials.password;
  protected readonly isAuthenticated = computed(() => this.currentUser() !== null);
  protected readonly authMode = signal<'login' | 'register'>('login');
  protected readonly authMessage = signal('');
  protected readonly isSigningOut = signal(false);
  protected readonly isProfileMenuOpen = signal(false);
  protected readonly isProfileDetailsOpen = signal(false);

  // Estados del Directorio
  protected readonly environment = signal<'prod' | 'local'>(this.readSavedEnv());
  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal<AppCategory>('todos');
  protected readonly isAddModalOpen = signal(false);
  protected readonly toastMessage = signal<string | null>(null);

  // Formulario de nueva dirección
  protected newAppName = '';
  protected newAppSubtitle = '';
  protected newAppCategory: AppCategory = 'personalizado';
  protected newAppUrlProd = '';
  protected newAppUrlLocal = '';
  protected newAppDescription = '';
  protected newAppTechStack = '';

  // Aplicaciones base del Ecosistema
  private readonly baseApps: EcosystemApp[] = [
    {
      id: 'aura-corporativa',
      name: 'AURA Corporativa',
      subtitle: 'Portal Institucional & CMS',
      category: 'corporativo',
      categoryLabel: 'Corporativo',
      description: 'Plataforma oficial institucional de AURA: sitio corporativo, presentación de soluciones, blog oficial y centro de noticias empresariales.',
      icon: 'globe',
      tone: 'coral',
      urlProd: 'https://aura-corporativa.vercel.app',
      urlLocal: 'http://localhost:5173',
      techStack: 'React • Vite • Tailwind • Supabase',
      status: 'Operativo',
      quickLinks: [
        { label: 'Inicio', path: '/' },
        { label: 'Nosotros', path: '/nosotros' },
        { label: 'Blog', path: '/blog' },
        { label: 'Admin Blog', path: '/admin/blog' },
      ],
    },
    {
      id: 'aura-ops',
      name: 'AURA Ops',
      subtitle: 'Control Operacional & SOP',
      category: 'operaciones',
      categoryLabel: 'Operaciones',
      description: 'Centro de mando operativo en vivo: tablero Kanban de tareas, cumplimiento de procedimientos estándar (SOP), solicitudes internas, autorizaciones ejecutivas y plazos críticos.',
      icon: 'activity',
      tone: 'blue',
      urlProd: 'https://aura-ops.vercel.app',
      urlLocal: 'http://localhost:4200',
      techStack: 'Angular 22 • Firebase Auth',
      status: 'Operativo',
      quickLinks: [
        { label: 'Dashboard', path: '/' },
        { label: 'Tareas Kanban', path: '/#tasks' },
        { label: 'Solicitudes', path: '/#requests' },
        { label: 'Aprobaciones', path: '/#approvals' },
        { label: 'Plazos & SLA', path: '/#deadlines' },
      ],
    },
    {
      id: 'aura-employee',
      name: 'AURA Employee',
      subtitle: 'Portal del Colaborador & RRHH',
      category: 'rrhh',
      categoryLabel: 'Recursos Humanos',
      description: 'Portal de autoservicio para el colaborador: registro y marcación de asistencias, descarga de recibos/boletas de pago, perfil y trámites laborales.',
      icon: 'users',
      tone: 'green',
      urlProd: 'https://aura-employee.vercel.app',
      urlLocal: 'http://localhost:4201',
      techStack: 'Angular 22 • Tailwind CSS',
      status: 'Operativo',
      quickLinks: [
        { label: 'Mi Perfil', path: '/profile' },
        { label: 'Asistencias', path: '/attendance' },
        { label: 'Boletas de Pago', path: '/paystubs' },
        { label: 'Solicitudes', path: '/requests' },
      ],
    },
    {
      id: 'aura-cloud',
      name: 'AURA Cloud & Supabase',
      subtitle: 'Infraestructura & Datos',
      category: 'infraestructura',
      categoryLabel: 'Servicios TI',
      description: 'Capa de infraestructura central: base de datos relacional PostgreSQL, autenticación de usuarios, buckets de almacenamiento y APIs de integración.',
      icon: 'database',
      tone: 'purple',
      urlProd: 'https://iwsgtqodxbdtwosfmnhj.supabase.co',
      urlLocal: 'http://127.0.0.1:54321',
      techStack: 'Supabase • PostgreSQL • REST API',
      status: 'Operativo',
      quickLinks: [
        { label: 'Consola Supabase', path: '/project/default' },
        { label: 'Base de Datos', path: '/project/default/editor' },
        { label: 'Auth & Usuarios', path: '/project/default/auth/users' },
      ],
    },
  ];

  protected readonly customApps = signal<EcosystemApp[]>(this.readCustomApps());

  // Lista combinada de todas las aplicaciones
  protected readonly allApps = computed(() => {
    return [...this.baseApps, ...this.customApps()];
  });

  // Categorías disponibles con conteo dinámico
  protected readonly categories = computed(() => {
    const apps = this.allApps();
    return [
      { id: 'todos' as AppCategory, label: 'Todas las Apps', count: apps.length },
      { id: 'corporativo' as AppCategory, label: 'Corporativo', count: apps.filter((a) => a.category === 'corporativo').length },
      { id: 'operaciones' as AppCategory, label: 'Operaciones', count: apps.filter((a) => a.category === 'operaciones').length },
      { id: 'rrhh' as AppCategory, label: 'Recursos Humanos', count: apps.filter((a) => a.category === 'rrhh').length },
      { id: 'infraestructura' as AppCategory, label: 'Servicios TI', count: apps.filter((a) => a.category === 'infraestructura').length },
      { id: 'personalizado' as AppCategory, label: 'Personalizadas', count: apps.filter((a) => a.category === 'personalizado').length },
    ];
  });

  // Aplicaciones filtradas por término de búsqueda y categoría
  protected readonly filteredApps = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const cat = this.selectedCategory();
    let list = this.allApps();

    if (cat !== 'todos') {
      list = list.filter((app) => app.category === cat);
    }

    if (term) {
      list = list.filter((app) =>
        app.name.toLowerCase().includes(term) ||
        app.subtitle.toLowerCase().includes(term) ||
        app.description.toLowerCase().includes(term) ||
        app.techStack.toLowerCase().includes(term) ||
        app.quickLinks.some((q) => q.label.toLowerCase().includes(term))
      );
    }

    return list;
  });

  // Métricas del ecosistema
  protected readonly metrics = computed(() => {
    const total = this.allApps().length;
    const prodMode = this.environment() === 'prod';
    return [
      { label: 'Aplicaciones Registradas', value: String(total), note: 'Ecosistema central', icon: 'grid', tone: 'coral' },
      { label: 'Entorno Activo', value: prodMode ? 'Producción (Cloud)' : 'Localhost (Dev)', note: prodMode ? 'Vercel + Supabase' : 'Puertos locales', icon: 'terminal', tone: 'blue' },
      { label: 'Estado del Ecosistema', value: '100% Operativo', note: 'Servicios en línea', icon: 'check-circle', tone: 'green' },
    ];
  });

  protected readonly greetingName = computed(() => this.currentUser()?.name.trim().split(/\s+/)[0] || 'Usuario');
  protected readonly currentDateLabel = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  protected readonly userInitials = computed(() => (this.currentUser()?.name ?? 'Admin')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase('es'))
    .join(''));

  constructor() {
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        this.setFirebaseSession(user);
      } else if (!this.readSessionUser()) {
        this.currentUser.set(null);
      }
    }, (error) => {
      this.authMessage.set(this.getAuthErrorMessage(error));
    });
  }

  // Métodos de URL y Entornos
  protected getAppUrl(app: EcosystemApp, subpath: string = ''): string {
    const baseUrl = this.environment() === 'prod' ? app.urlProd : app.urlLocal;
    if (!subpath || subpath === '/') {
      return baseUrl;
    }
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanSub = subpath.startsWith('/') ? subpath : `/${subpath}`;
    return `${cleanBase}${cleanSub}`;
  }

  protected setEnvironment(env: 'prod' | 'local'): void {
    this.environment.set(env);
    try {
      localStorage.setItem(this.envStorageKey, env);
    } catch {
      // Ignorar restricciones en sandbox
    }
    this.showToast(`Entorno cambiado a ${env === 'prod' ? 'Producción (Cloud)' : 'Localhost (Dev)'}`);
  }

  protected setCategory(category: AppCategory): void {
    this.selectedCategory.set(category);
  }

  protected copyLink(url: string, label: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.showToast(`Enlace de ${label} copiado`);
    }).catch(() => {
      this.showToast(`Enlace: ${url}`);
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 2500);
  }

  // Métodos de Apps Personalizadas
  protected openAddModal(): void {
    this.newAppName = '';
    this.newAppSubtitle = '';
    this.newAppCategory = 'personalizado';
    this.newAppUrlProd = '';
    this.newAppUrlLocal = '';
    this.newAppDescription = '';
    this.newAppTechStack = '';
    this.isAddModalOpen.set(true);
  }

  protected closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  protected saveCustomApp(): void {
    if (!this.newAppName.trim() || !this.newAppUrlProd.trim()) {
      alert('Por favor indica al menos el nombre y la dirección URL.');
      return;
    }

    const newApp: EcosystemApp = {
      id: `custom-${Date.now()}`,
      name: this.newAppName.trim(),
      subtitle: this.newAppSubtitle.trim() || 'Herramienta de Equipo',
      category: this.newAppCategory,
      categoryLabel: this.newAppCategory === 'personalizado' ? 'Personalizado' : this.newAppCategory,
      description: this.newAppDescription.trim() || 'Enlace externo registrado en el Ecosistema AURA.',
      icon: 'external-link',
      tone: 'amber',
      urlProd: this.newAppUrlProd.trim(),
      urlLocal: this.newAppUrlLocal.trim() || this.newAppUrlProd.trim(),
      techStack: this.newAppTechStack.trim() || 'Servicio Externo',
      status: 'Operativo',
      quickLinks: [
        { label: 'Abrir Enlace', path: '/' },
      ],
      isCustom: true,
    };

    const updated = [...this.customApps(), newApp];
    this.customApps.set(updated);
    this.persistCustomApps(updated);
    this.closeAddModal();
    this.showToast(`Aplicación "${newApp.name}" agregada con éxito`);
  }

  protected deleteCustomApp(id: string, name: string): void {
    if (confirm(`¿Deseas eliminar "${name}" del directorio?`)) {
      const updated = this.customApps().filter((a) => a.id !== id);
      this.customApps.set(updated);
      this.persistCustomApps(updated);
      this.showToast(`"${name}" fue eliminada del directorio`);
    }
  }

  private readSavedEnv(): 'prod' | 'local' {
    try {
      const saved = localStorage.getItem(this.envStorageKey);
      if (saved === 'local' || saved === 'prod') {
        return saved;
      }
    } catch {
      // Ignorar
    }
    return 'prod';
  }

  private readCustomApps(): EcosystemApp[] {
    try {
      const raw = localStorage.getItem(this.customAppsStorageKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
    return [];
  }

  private persistCustomApps(apps: EcosystemApp[]): void {
    try {
      localStorage.setItem(this.customAppsStorageKey, JSON.stringify(apps));
    } catch {
      // Fallback
    }
  }

  // Métodos de Autenticación
  protected toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((open) => !open);
  }

  protected closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  protected openProfileDetails(): void {
    this.isProfileMenuOpen.set(false);
    this.isProfileDetailsOpen.set(true);
  }

  protected closeProfileDetails(): void {
    this.isProfileDetailsOpen.set(false);
  }

  protected switchAuthMode(mode: 'login' | 'register'): void {
    this.authMode.set(mode);
    this.authMessage.set('');
  }

  protected async handleAuthSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '').trim();

    if (this.authMode() === 'login') {
      if (email === this.demoEmail && password === this.demoPassword) {
        this.saveSessionUser({
          name: 'Andre Zapata',
          email,
          role: 'Administrador',
        });
        return;
      }

      try {
        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        this.setFirebaseSession(credential.user);
      } catch (error) {
        this.authMessage.set(this.getAuthErrorMessage(error));
      }
      return;
    }

    const name = String(formData.get('name') || '').trim();
    const confirmPassword = String(formData.get('confirmPassword') || '').trim();

    if (!name) {
      this.authMessage.set('Indica tu nombre completo para el registro.');
      return;
    }

    if (password !== confirmPassword) {
      this.authMessage.set('Las contraseñas ingresadas no coinciden.');
      return;
    }

    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(credential.user, { displayName: name });
      this.setFirebaseSession(credential.user, name);
    } catch (error) {
      this.authMessage.set(this.getAuthErrorMessage(error));
    }
  }

  protected async signOut(): Promise<void> {
    this.isSigningOut.set(true);
    this.closeProfileMenu();
    this.closeProfileDetails();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      await firebaseSignOut(firebaseAuth);
    } catch {
      // Ignorar errores de Firebase en logout
    }

    sessionStorage.removeItem(this.sessionStorageKey);
    this.currentUser.set(null);
    this.authMessage.set('');
    this.isSigningOut.set(false);
  }

  private readSessionUser(): UserSession | null {
    try {
      const raw = sessionStorage.getItem(this.sessionStorageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private saveSessionUser(user: UserSession): void {
    sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(user));
    this.currentUser.set(user);
    this.authMessage.set('');
  }

  private setFirebaseSession(user: FirebaseUser, preferredName?: string): void {
    const existing = this.readSessionUser();
    this.saveSessionUser({
      name: preferredName || user.displayName || user.email?.split('@')[0] || 'Usuario',
      email: user.email || 'usuario@aura.local',
      role: existing?.role || 'Usuario',
    });
  }

  private getAuthErrorMessage(error: unknown): string {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Credenciales inválidas. Revisa el correo y la contraseña ingresados.';
      case 'auth/email-already-in-use':
        return 'El correo ya se encuentra registrado. Inicia sesión en su lugar.';
      case 'auth/weak-password':
        return 'La contraseña debe tener un mínimo de 6 caracteres.';
      case 'auth/invalid-email':
        return 'El correo ingresado tiene un formato no válido.';
      default:
        return 'No se pudo completar la autenticación. Intenta nuevamente.';
    }
  }
}
