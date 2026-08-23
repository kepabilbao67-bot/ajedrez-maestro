# AjedrezPro

Aplicación de ajedrez y entrenamiento construida con Expo SDK 57, React Native y TypeScript.

## V1

- Partidas para dos jugadores en el mismo dispositivo.
- Rivales automáticos y estilos de juego.
- Pistas, revisión de partidas y entrenamiento táctico.
- Puzzle Rush, progreso y estadísticas locales.
- Temas de tablero y juegos de piezas.
- Sin cuenta, anuncios ni compras en la V1.

El motor usa Stockfish.js en web y un motor local compatible en Android e iOS. El progreso y las preferencias permanecen en el dispositivo.

## Desarrollo

Requisitos: Node.js 22.13 o posterior y npm.

```bash
npm ci
npm start
```

Comprobaciones:

```bash
npx tsc --noEmit
npm test
npm run lint
npx expo export --platform android
npx expo export --platform ios
```

## Publicación

La configuración de la aplicación está en `app.json` y los perfiles EAS en `eas.json`. Los textos y recursos iniciales de tienda están en `store-assets/`.

Las medidas de protección, firma e integridad están documentadas en `SECURITY.md`.

Antes de enviar una versión deben completarse las pruebas en dispositivos físicos, los builds firmados, las capturas reales, la URL pública de privacidad y la revisión de licencias indicada en la ficha de tienda.
