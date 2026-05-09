# Generador de PDF de Lista de Canciones de Ultrastar

Esta aplicación Node.js genera un PDF con canciones de una biblioteca de Ultrastar.

## Idiomas

- English: `README.md`
- Español (predeterminado): este archivo
- Deutsch: `README.de.md`
- Historial de cambios: `CHANGELOG.md`

## Resumen

Funciona de dos maneras:

- Modo de línea de comandos para el flujo original basado en scripts
- Modo navegador con un frontend HTML estático y un backend Node.js pequeño

## Inicio rápido

1. Instala Node.js:
   - Descárgalo e instálalo desde: https://nodejs.org/en/download/

2. Descarga este proyecto desde GitHub:
	 - Opción A (recomendada para principiantes, sin usar Git):
		 1. Abre: https://github.com/jaimeoka/US_list
		 2. Haz clic en el botón verde `Code`.
		 3. Haz clic en `Download ZIP`.
		 4. Extrae el archivo ZIP en una carpeta de tu ordenador.
	 - Opción B (si ya usas Git):

```bash
git clone https://github.com/jaimeoka/US_list.git
cd US_list
```

3. Abre la carpeta del proyecto en una terminal.

4. Instala las dependencias:

```bash
npm install
```

5. Inicia el modo navegador:

```bash
npm run gui
```

Después abre:

```text
http://localhost:3000
```

6. O ejecuta el modo de script original:

```bash
npm run cli
```

## Estructura del proyecto

- `src/index.ts`: punto de entrada principal del CLI
- `src/configuration.ts`: valores de configuración por defecto usados por el CLI y el backend GUI
- `src/server.ts`: servidor Node.js pequeño para el modo navegador
- `src/song.ts`: lógica de escaneo, análisis y ordenación de canciones
- `src/db.ts`: carga de puntuaciones desde SQLite de Ultrastar
- `src/jobs.ts`: lógica de generación de PDF
- `public/index.html`: marcado de la interfaz web
- `public/style.css`: estilos de la interfaz web
- `public/app.js`: comportamiento de la interfaz web

## Qué hace

- Lee datos de canciones desde la carpeta configurada en `src/configuration.ts`
- Genera un PDF con la lista de canciones
- Soporta formato de salida, ordenación, filtrado y diseño de página personalizados
- Opcionalmente puede leer puntuaciones altas desde `Ultrastar.db`

## Configuración

Todas las opciones disponibles están documentadas directamente en `src/configuration.ts`.

Puedes configurar:

- Nombre del archivo de salida
- Tamaño de página, márgenes y diseño
- Tamaños de fuente
- Ruta de la carpeta de canciones
- Formato de cada línea de canción
- Opciones de ordenación y filtrado
- Si se deben leer puntuaciones desde la base de datos de Ultrastar
- Ruta de la base de datos

## Uso

### Opción 1: modo de línea de comandos

Usa esto si quieres el flujo de trabajo original basado en scripts.

1. Edita `src/configuration.ts` y define las opciones que quieras.
2. Ejecuta:

```bash
npm run cli
```

Esto compila los archivos TypeScript de `src` a `dist` y luego ejecuta el JavaScript generado.

El PDF generado se guardará usando el nombre definido en `src/configuration.ts`.

### Opción 2: modo navegador

Usa esto si quieres seleccionar opciones desde una página HTML.

1. Ejecuta:

```bash
npm run gui
```

2. Abre esta dirección en tu navegador:

```text
http://localhost:3000
```

El frontend se sirve desde la carpeta `public` y el backend de Node.js ejecuta la lógica existente de generación.

Este modo no reemplaza el modo script; solo añade una segunda forma de proporcionar las mismas opciones.

## Cómo funciona la configuración

El proyecto mantiene `src/configuration.ts` como fuente de valores por defecto.

- En modo CLI, esos valores se usan directamente.
- En modo navegador, el formulario HTML envía las opciones seleccionadas al backend.
- El backend pasa esos valores al generador mediante variables de entorno.

Esto te permite mantener valores sensatos por defecto en `src/configuration.ts` y sobrescribirlos desde el navegador cuando sea necesario.

## Puntuaciones altas desde Ultrastar.db

Si quieres incluir la puntuación más alta de cada canción, habilita la comprobación de base de datos en `src/configuration.ts` y define la ruta correcta a `Ultrastar.db`.

En Windows, la base de datos suele estar en el perfil roaming del usuario, por ejemplo:

```text
C:\Users\<tu-usuario>\AppData\Roaming\ultrastardx\Ultrastar.db
```

La ubicación exacta puede variar según el sistema operativo y la instalación.

## Releases automatizados

Este proyecto está configurado para versionado semántico automático y GitHub Releases usando `semantic-release`.

### Cómo funciona

- Cada push a `main` o `master` activa `.github/workflows/release.yml`.
- `semantic-release` lee los mensajes de commit desde la última etiqueta y decide si debe publicar una nueva release.
- Las reglas de versionado siguen Conventional Commits:
	- `fix: ...` -> release patch
	- `feat: ...` -> release minor
	- `feat!: ...` o `BREAKING CHANGE:` -> release major
- En cada release, el pipeline actualiza:
	- `CHANGELOG.md`
	- `package.json`
	- `package-lock.json`
	- etiqueta Git y notas de GitHub Release

### Validación de mensajes de commit

Los pull requests ejecutan `.github/workflows/commitlint.yml` para validar mensajes de commit con Conventional Commits.

### Comandos locales

- Simulación (sin publicar):

```bash
npm run release:dry
```

- Ejecución manual de release (normalmente debe hacerlo CI):

```bash
npm run release
```

### Ejemplos de mensajes de commit

```text
feat(gui): show app version badge in header
fix(server): return better message when db path is invalid
feat!: drop Node 18 support
```

## Contacto

Sugerencias: jaimeoka@gmail.com
