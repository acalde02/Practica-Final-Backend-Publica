
# Practica Final - Backend de Albaranes

Backend completo en Node.js + Express + MongoDB para la gestión digital de albaranes de horas o materiales, con generación de PDFs firmados, subida de imágenes a IPFS, autenticación segura y documentación Swagger.

---

## Tecnologías utilizadas

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Swagger (API Docs)
- IPFS (Pinata)
- PDFKit + Sharp
- Nodemailer (envío de correos)
- Slack Webhook para errores
- Jest + Supertest para testing

---

## Requisitos y configuración

### Paso 1: Clonar y configurar

```bash
git clone https://github.com/acalde02/Practica-Final-Backend-Publica.git
cd Practica-Final-Backend-Publica
npm install
```

### Paso 2: Crear archivo `.env`

Crea un archivo `.env` en la raíz con este contenido:

```env
PORT=3000
DB_HOST=mongodb://localhost:27017/albaranes
JWT_SECRET=supersecret123

EMAIL=tu_correo@outlook.com
CLIENT_ID=tu_client_id
REFRESH_TOKEN=tu_refresh_token
PUBLIC_IRL=https://tudominio.com

SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

PINATA_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
PINATA_KEY=tu_pinata_key
PINATA_SECRET=tu_pinata_secret
PINATA_JWT=Bearer tu_pinata_jwt
```

### Paso 3: Configurar envío de correos

- Para Gmail, se recomienda usar una **contraseña de aplicación**.
- También puedes usar servicios SMTP como Mailtrap o SendGrid.
- Los campos `CLIENT_ID` y `REFRESH_TOKEN` se usan para OAuth si aplicas Gmail OAuth2.

---

## Documentación Swagger

Disponible en:
```
http://localhost:3000/api-docs
```

Incluye todos los endpoints de usuarios, proyectos, clientes y albaranes.

---

## Scripts disponibles

```bash
npm start       # Inicia el servidor con nodemon
npm test        # Ejecuta los tests con Jest
```

---

## Funcionalidades principales

### Usuarios
- Registro con verificación por código
- Login seguro
- Recuperación de contraseña
- Actualización de datos personales y empresa
- Subida de logo (se guarda en IPFS)
- Borrado lógico/físico de cuenta
- Envío de errores a Slack

### Albaranes
- Creación de albaranes por proyecto (horas o materiales)
- Generación de PDF con PDFKit (incluye firma si existe)
- Subida del PDF firmado a IPFS
- Recuperación de PDF desde IPFS si ya fue generado
- Restricciones para borrar si ya está firmado

### Clientes y Proyectos
- CRUD completo
- Protección por usuario o compañía
- Soft delete y recuperación

---

## Testing

Tests automatizados con `Jest` y `Supertest`.

```bash
npm test
```

---

## Estructura del proyecto

```
.
├── app.js
├── server.js
├── config/
├── controllers/
├── routes/
├── models/
├── middleware/
├── utils/
├── validators/
├── tests/
└── docs/          # Swagger
```

---

## Subida de imágenes y PDF

- Imágenes de firma y logos se suben a IPFS vía Pinata.
- El albarán firmado se convierte a PDF y también se sube.

---

## Autor

Adrián Calderón de Amat  
[GitHub](https://github.com/acalde02)

---

## Estado del proyecto

✔ Proyecto completo que cumple con todos los requisitos de la práctica intermedia y final:

- Autenticación, verificación, recuperación
- CRUD para todas las entidades
- Documentación Swagger
- PDF firmado con IPFS
- Testing
- Seguridad, validaciones, errores controlados
