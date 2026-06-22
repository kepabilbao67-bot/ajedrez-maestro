# ♞ Ajedrez Maestro

App de ajedrez para **jugar, aprender y mejorar**, con IA integrada, pistas tipo
profesor, estrategias reales (estilo Karpov y Kasparov) explicadas de forma sencilla,
modo 2 jugadores, reloj de partida, varios tableros (incluidos con textura de imagen)
y piezas, interfaz en 13 idiomas y sonidos. **Funciona sin conexión.**
Pensada también para uso escolar.

## ✨ Qué incluye

- **Jugar contra la IA** con 6 niveles (de principiante a experto).
- **Modo 2 jugadores** en el mismo dispositivo (sin IA).
- **Reloj de partida** con varios controles de tiempo (1', 3', 3'+2", 5', 10', 15'+10" o sin reloj).
- **Pistas "del profesor"**: te dice la mejor jugada y por qué, en lenguaje sencillo.
- **Sección Aprender**: 13 lecciones (piezas, apertura, tácticas, finales, aperturas
  famosas, estructura de peones, mates básicos, cálculo, estilo Karpov, Kasparov,
  Capablanca, Tal y Fischer).
- **11 temas de tablero**: 8 de color + 3 con **textura de imagen** (madera, mármol,
  pizarra). **4 juegos de piezas** (formas): clásicas, modernas en SVG, contorno y
  letras. Casillas cuadradas o redondeadas.
- **13 idiomas**: español, inglés, francés, portugués, alemán, italiano, ruso, chino,
  japonés, árabe (con soporte derecha-a-izquierda), neerlandés, turco y polaco.
- **Sonidos**: levantar y mover pieza, captura, enroque, jaque y fanfarria de
  campeón al ganar.
- **PWA**: se instala como una app en Android e iOS y funciona sin internet.

## 🚀 Probarla (sin instalar nada)

Necesita servirse por HTTP (no abras `index.html` con doble clic, porque los
módulos y el Web Worker requieren un servidor).

```bash
# Con Python (incluido en casi todos los sistemas)
python3 -m http.server 8000
# Luego abre http://localhost:8000 en el navegador
```

## 📱 Instalar en el móvil (modo app)

1. Sube esta carpeta a un hosting con HTTPS (por ejemplo **GitHub Pages**, Netlify
   o Vercel — todos tienen plan gratuito).
2. Abre la URL en **Chrome (Android)** o **Safari (iPhone)**.
3. Menú del navegador → **"Añadir a pantalla de inicio" / "Instalar app"**.
4. Se instalará con su icono y funcionará a pantalla completa y sin conexión.

## 📦 Generar el archivo APK (Android)

La forma más sencilla, sin instalar Android Studio:

1. Publica la app con HTTPS (paso anterior).
2. Entra en **https://www.pwabuilder.com**, pega la URL y pulsa *Start*.
3. Elige **Android** → *Generate Package*. Descargarás un `.apk` (y un `.aab`
   para subir a Google Play si quieres).

Alternativa para desarrolladores (con Android SDK instalado): usar **Bubblewrap**
o **Capacitor** para envolver la PWA en un proyecto Android y compilar el APK.

## 🗂️ Estructura

```
index.html              Pantalla principal
manifest.webmanifest    Configuración PWA (instalación)
sw.js                   Service Worker (funciona sin conexión)
css/styles.css          Estilos
js/engine.js            Motor de ajedrez (reglas, verificado con perft)
js/ai-worker.js         IA (minimax + poda alfa-beta) en un Web Worker
js/pieces.js            Juegos de piezas y temas de tablero
js/i18n.js              Textos en 7 idiomas
js/lessons.js           Lecciones de estrategia
js/sounds.js            Efectos de sonido (Web Audio)
js/app.js               Lógica de la interfaz
icons/                  Iconos de la app
```

## ✅ Calidad

- El motor pasa los tests **perft** estándar (posición inicial y "Kiwipete"),
  lo que valida reglas, enroques, capturas al paso y coronaciones.
- La IA encuentra mates en uno, captura material colgado y se defiende.
