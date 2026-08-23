# AjedrezPro — ficha de tienda (borrador V1)

## Identidad

- Nombre: AjedrezPro
- Subtítulo Apple: Entrena y mejora jugando
- Descripción breve Google Play: Aprende ajedrez con partidas, retos, aperturas y entrenamiento local.
- Categoría propuesta: Juegos de tablero
- Modelo de lanzamiento: gratuito, sin compras ni anuncios en la V1

## Descripción

AjedrezPro te ayuda a comprender el ajedrez y mejorar mediante la práctica.

Juega partidas locales o contra un rival de entrenamiento, resuelve retos tácticos, practica aperturas y revisa tus decisiones con pistas y análisis. El progreso, las estadísticas y las preferencias se guardan en tu dispositivo.

La V1 ofrece acceso completo sin compras dentro de la aplicación. Las funciones de pago solo se activarán en una versión futura cuando existan compras nativas y restauración verificadas.

## Material disponible

- Icono principal: `assets/images/ajedrezpro-icon-v2.png` (1024 × 1024)
- Icono iOS opaco: `assets/images/ajedrezpro-ios-icon-1024.png` (1024 × 1024, RGB sin alfa)
- Icono Google Play: `assets/images/ajedrezpro-play-icon-512.png` (512 × 512)
- Feature graphic: `store-assets/feature-graphic.png` (1024 × 500)

## Capturas reales pendientes

1. Inicio y progreso.
2. Partida contra el motor local.
3. Puzzle táctico.
4. Supervivencia / Puzzle Rush.
5. Aperturas y pistas.
6. Privacidad y licencias.

No usar maquetas como capturas de producto. Deben salir de un build real probado.

## Datos y privacidad — borrador para verificación

- Sin cuenta.
- Sin publicidad.
- Sin analítica integrada.
- Partidas, progreso, estadísticas y preferencias almacenados localmente.
- Sin envío de esos datos a servidores propios en la V1 revisada.
- Borrado de progreso, estadísticas y preferencias disponible dentro de la aplicación.
- Enlaces externos voluntarios para licencia y código fuente de Stockfish.

Antes de rellenar Apple App Privacy o Google Data Safety se debe confirmar este comportamiento en el build firmado y publicar una URL de política de privacidad.

## URLs preparadas, todavía no públicas

- Privacidad: `https://kepa-apps-soporte.kepabilbao67.chatgpt.site/ajedrezpro/privacidad`
- Soporte: `https://kepa-apps-soporte.kepabilbao67.chatgpt.site/soporte`

El portal está validado en modo privado. Falta confirmar un correo público de soporte y habilitar el acceso externo antes de usar estas URLs en las tiendas.

## Bloqueos de envío

- Lint, tests completos y build firmado deben ejecutarse con dependencias instaladas para el sistema operativo actual.
- Pruebas físicas en Android e iOS.
- URL pública de privacidad, correo y web de soporte.
- Capturas reales.
- Cuenta Apple Developer y credenciales EAS/tiendas.
- Revisión legal final de distribución GPL de Stockfish.js.
