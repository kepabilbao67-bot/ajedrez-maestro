# Entrega final para Google Play — AjedrezPro 1.0

Fecha de preparación: 23 de agosto de 2026

## Hecho verificado

- Nombre de la aplicación: **AjedrezPro**
- Identificador Android: **com.kepabilbao.ajedrezpro**
- Versión visible: **1.0.0**
- Código de versión local inicial: **1**
- Tipo: **Juego**
- Categoría recomendada: **Juegos de mesa**
- Precio de lanzamiento: **Gratis**
- Compras integradas: **No**
- Anuncios: **No**
- Cuenta o inicio de sesión: **No**
- Acceso restringido: **No**
- Target Android generado por Expo SDK 57: **API 36**
- El perfil EAS `production` genera un Android App Bundle y aumenta el código de versión de forma remota.

## Datos para crear la aplicación

| Campo de Play Console | Valor preparado |
| --- | --- |
| Nombre | AjedrezPro |
| Idioma predeterminado | Español (España) |
| Aplicación o juego | Juego |
| Gratis o de pago | Gratis |
| Categoría | Juegos de mesa |
| Contiene anuncios | No |
| Acceso a la aplicación | Todas las funciones están disponibles sin acceso especial |

## Ficha principal

### Descripción breve

Aprende ajedrez con partidas, retos, aperturas y entrenamiento local.

### Descripción completa

AjedrezPro te ayuda a comprender el ajedrez y mejorar mediante la práctica.

Juega partidas locales o contra un rival de entrenamiento, resuelve retos tácticos, practica aperturas y revisa tus decisiones con pistas y análisis. El progreso, las estadísticas y las preferencias se guardan en tu dispositivo.

La primera versión ofrece acceso completo, sin cuenta, anuncios ni compras dentro de la aplicación.

### Novedades

- Partidas locales y contra rivales automáticos.
- Entrenamiento táctico y modo Puzzle Rush.
- Pistas y revisión de partidas.
- Progreso, estadísticas y personalización local.
- Borrado de los datos guardados en el dispositivo.

## Recursos disponibles

- Icono de Play: `assets/images/ajedrezpro-play-icon-512.png`
- Gráfico de funciones 1024 × 500: `store-assets/feature-graphic.png`
- Plan de seis capturas: `store-assets/SCREENSHOT_PLAN_ES.md`

## Seguridad de datos — borrador para el binario firmado

Respuestas propuestas:

- ¿La aplicación recopila o comparte datos obligatorios?: **No**
- Datos recopilados: **Ninguno**
- Datos compartidos: **Ninguno**
- Creación de cuenta: **No**
- Solicitud de eliminación de cuenta: **No aplicable; no existen cuentas**
- Eliminación de datos locales: **Disponible dentro de Ajustes y al desinstalar**

No confirmar estas respuestas hasta revisar permisos y tráfico de red del AAB firmado exacto.

## Audiencia y contenido — recomendación

- Audiencia recomendada: **13–15, 16–17 y 18 o más**
- No declarar menores de 13 años como público objetivo en esta V1.
- Violencia: juego abstracto de ajedrez, sin sangre, lesiones ni representación gráfica.
- Contenido sexual, lenguaje ofensivo, drogas, apuestas y miedo: **No**
- Interacción entre usuarios, chat y contenido generado por usuarios: **No**
- Compras aleatorias o apuestas con dinero: **No**

Las respuestas finales deben completarse dentro del cuestionario IARC de Play Console, respetando exactamente la redacción que aparezca.

## Archivos y datos todavía pendientes

- `AjedrezPro-1.0.0.aab` firmado.
- Capturas reales de Android.
- URL de privacidad pública.
- Correo público de soporte.
- Nombre o razón social y datos legales del titular.

No usar las URLs privadas actuales en Play Console.

## Secuencia exacta de cierre

1. Instalar EAS CLI y ejecutar `eas whoami`.
2. Desde la raíz del proyecto ejecutar `npm ci`, `npm run lint` y `npm test`.
3. Ejecutar `eas build --platform android --profile production`.
4. Permitir que EAS genere y custodie el keystore si no existe uno anterior.
5. Descargar el AAB y probar previamente un APK de vista previa en un Android físico.
6. Crear AjedrezPro en Play Console con los campos de este documento.
7. Subir el AAB primero a pruebas internas.
8. Completar ficha, privacidad, seguridad de datos, audiencia y clasificación.
9. Compartir el enlace de pruebas con los testers.
10. Promover a prueba cerrada o producción cuando la cuenta lo permita.

## Condición de prueba cerrada

Si la cuenta es una cuenta personal nueva sujeta a la política de Google, se necesitan al menos 12 testers inscritos continuamente durante 14 días antes de solicitar acceso a producción. El tipo y la fecha de creación de la cuenta todavía no están verificados.

