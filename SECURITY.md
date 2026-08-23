# Seguridad de AjedrezPro

## Controles incluidos

- La V1 funciona localmente y no admite cargas de archivos ni instala contenido descargado.
- Los enlaces salientes están limitados por código a una lista cerrada de destinos HTTPS.
- Android bloquea cámara, micrófono, ubicación y contactos porque la aplicación no los necesita.
- La copia de seguridad de datos de Android está desactivada para reducir la extracción o restauración no controlada del progreso local.
- No hay claves privadas ni secretos de servicio incluidos en el cliente.

## Firma, integridad y protección frente a copias

- Publicar el AAB con Google Play App Signing y conservar la clave de subida fuera del repositorio.
- Activar Play Integrity después de crear la ficha de Play y disponer de un backend que valide los veredictos. La validación debe comprobar como mínimo `PLAY_RECOGNIZED` y `LICENSED` antes de proteger acciones de valor.
- No existe un mecanismo que impida por completo la ingeniería inversa de una aplicación móvil. La firma, la distribución oficial, la minimización del bundle y Play Integrity dificultan la manipulación y permiten detectar copias no reconocidas.

## Alcance del término «antivirus»

AjedrezPro no es un antivirus: no recibe archivos, no escanea el dispositivo y no solicita permisos de seguridad invasivos. Su protección consiste en reducir la superficie de ataque, restringir enlaces y permisos, y preparar controles de firma e integridad adecuados para Google Play.

## Verificación antes de publicar

1. Generar un AAB de producción firmado.
2. Revisar el manifiesto final y confirmar que no contiene los permisos bloqueados.
3. Subir primero a una prueba interna de Google Play.
4. Activar Play App Signing.
5. Probar instalación, enlaces, partidas y persistencia en un dispositivo físico.
6. No anunciar «antivirus» en la ficha de tienda.

## Auditoría de dependencias (23 de agosto de 2026)

Se aplicaron las actualizaciones compatibles propuestas por `npm audit fix`, manteniendo Expo SDK 57. La auditoría aún señala incidencias transitivas en el procesador de imágenes de Metro y en `uuid` a través de las herramientas de configuración de Xcode. Afectan al proceso de compilación con archivos de entrada manipulados, no a una función expuesta al usuario dentro de AjedrezPro. No se aplicó `--force` porque propone cambiar a versiones incompatibles con SDK 57. Hasta que React Native/Expo publiquen la corrección compatible, los builds deben usar únicamente los recursos versionados y revisados del proyecto.
