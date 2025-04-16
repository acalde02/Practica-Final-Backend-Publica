const express = require("express")
const cors = require("cors")
const dbConnect = require("./config/mongo")
require("dotenv").config();

const swaggerUi = require("swagger-ui-express")
const swaggerSpecs = require("./docs/swagger")


const morganBody = require("morgan-body")
const { IncomingWebhook } = require("@slack/webhook")
const loggerStream = require("./utils/handleLogger")

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)




const app = express()

//Le decimos a la app de express() que use cors para evitar el error Cross-Domain (XD)
app.use(cors()) 
app.use(express.json())

//Le digo que directorio es publico
app.use(express.static("storage")) // http://localhost:3000/file.jpg


morganBody(app, {
    noColors: true,
    skip: function (req, res) { return res.statusCode < 500 },
    stream: loggerStream
})


/* Aquí invocamos a las rutas */
//app.use("/api", require("./routes/tracks"))
//app.use("/api", require("./routes/users"))
//app.use("/api", require("./routes/storage"))


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs))


app.use("/api", require("./routes")) //Lee routes/index.js por defecto

// Ruta para el token de autorización
app.get("/", (req, res) => {
    const authCode = req.query.code;
    
    if (!authCode) {
        return res.status(400).send("No se recibió el código de autorización.");
    }

    res.send(`Código recibido: ${authCode}`);
});




const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Servidor escuchando en el puerto " + port);
    dbConnect(); // ¡Ojo! esto debe ir aquí, no en app.js
});
