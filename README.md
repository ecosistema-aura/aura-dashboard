# AURA Hub — Directorio de Aplicaciones del Ecosistema

> Portal centralizado y lanzador de aplicaciones del **Ecosistema AURA**. Diseñado para acceder de forma rápida e intuitiva a todas las plataformas, portales de autoservicio y servicios de infraestructura del ecosistema.

---

## 🚀 Aplicaciones Centrales del Directorio

1. **AURA Corporativa**
   - **Categoría:** Corporativo / Institucional
   - **Descripción:** Portal oficial institucional de AURA, presentación de servicios, blog empresarial y administración de contenidos.
   - **Producción:** `https://aura-corporativa.vercel.app`
   - **Local:** `http://localhost:5173`
   - **Accesos Rápidos:** Inicio, Nosotros, Blog, Panel Administrador.

2. **AURA Ops**
   - **Categoría:** Operaciones / Control
   - **Descripción:** Centro de control operacional en tiempo real: monitoreo de tareas Kanban, procedimientos estándar (SOP), solicitudes internas, autorizaciones y plazos críticos.
   - **Producción:** `https://aura-ops.vercel.app`
   - **Local:** `http://localhost:4200`
   - **Accesos Rápidos:** Dashboard, Tareas Kanban, Solicitudes, Aprobaciones, Plazos & SLA.

3. **AURA Employee**
   - **Categoría:** Recursos Humanos / Autoservicio
   - **Descripción:** Portal de autoservicio para colaboradores: registro de asistencias, boletas y recibos de pago, solicitudes de permisos y perfil laboral.
   - **Producción:** `https://aura-employee.vercel.app`
   - **Local:** `http://localhost:4201`
   - **Accesos Rápidos:** Mi Perfil, Asistencias, Boletas de Pago, Solicitudes.

4. **AURA Cloud & Supabase**
   - **Categoría:** Servicios TI / Infraestructura
   - **Descripción:** Capa de servicios backend: PostgreSQL, autenticación compartida, buckets de almacenamiento y APIs.
   - **Producción:** `https://iwsgtqodxbdtwosfmnhj.supabase.co`
   - **Local:** `http://127.0.0.1:54321`

---

## ⚡ Características Principales del Hub

- **Selector de Entornos en 1 Clic:** Alterna instantáneamente entre URLs de **Producción (Cloud/Vercel)** y puertos de **Desarrollo (Localhost)**.
- **Buscador en Tiempo Real:** Filtra aplicaciones, funciones y submódulos al escribir.
- **Filtros por Categoría:** Filtra entre *Todas*, *Corporativo*, *Operaciones*, *Recursos Humanos*, *Servicios TI* y *Personalizados*.
- **Registro de Enlaces Personalizados:** Permite a los usuarios y administradores añadir nuevas direcciones (Figma, Jira, Power BI, Google Drive, etc.) persistidas en `localStorage`.
- **Copiado Rápido de Enlaces:** Botón integrado con feedback inmediato para compartir y depurar URLs.
- **Autenticación Unificada:** Soporta sesión de administrador de prueba (`admin@aura.local` / `12345678!`) y autenticación Firebase.

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Ejecutar pruebas unitarias
npm test

# Compilar para producción
npm run build
```
