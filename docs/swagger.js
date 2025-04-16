const swaggerJsdoc = require("swagger-jsdoc")

const options = {
    definition: {
      openapi: "3.0.3",
      info: {
        title: "Practica Final Backend Documentacion (OpenAPI 3.0)",
        version: "0.1.0",
        description:
          "Documentación de la API del proyecto de Practica Final Backend para Programación Web 2 Servidor.",
        license: {
          name: "Licenced under MIT",
          url: "https://spdx.org/licenses/MIT.html",
        },
        contact: {
          name: "Adrián Calderón de Amat",
          url: "https://u-tad.com",
          email: "adrian.calderon@live.u-tad.com",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer"
          }
        },
        schemas: {
          User: {
            type: "object",
            required: ["name", "email", "password", "role"],
            properties: {
              name: { type: "string" },
              surnames: { type: "string" },
              nif: { type: "string" },
              age: { type: "integer" },
              email: { type: "string" },
              password: { type: "string" },
              role: {
                type: "string",
                enum: ["user", "admin", "guest"]
              },
              isVerified: { type: "boolean" },
              company: { type: "string" },
              code: { type: "number" },
              recoveryAttempts: { type: "number" }
            }
          },
          UserUpdateInput: {
            type: "object",
            properties: {
              name: { type: "string" },
              surnames: { type: "string" },
              nif: { type: "string" },
              email: { type: "string" }
            }
          },
          UserRegisterInput: {
            type: "object",
            required: ["email", "password", "name"],
            properties: {
              name: { type: "string" },
              surnames: { type: "string" },
              nif: { type: "string" },
              email: { type: "string" },
              password: { type: "string" }
            }
          },
          Login: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string" },
              password: { type: "string" }
            }
          },
          CompanyInput: {
            type: "object",
            required: ["name", "cif", "street", "number", "postal", "city", "province"],
            properties: {
              name: { type: "string" },
              cif: { type: "string" },
              street: { type: "string" },
              number: { type: "integer" },
              postal: { type: "integer" },
              city: { type: "string" },
              province: { type: "string" },
              clients: {
                type: "array",
                items: { type: "string" }
              },
              logo: { type: "string" }
            }
          },
          ClientInput: {
            type: "object",
            required: ["name", "street", "number", "postal", "city", "province", "phone", "email", "role"],
            properties: {
              name: { type: "string" },
              street: { type: "string" },
              number: { type: "integer" },
              postal: { type: "integer" },
              city: { type: "string" },
              province: { type: "string" },
              phone: { type: "string" },
              email: { type: "string" },
              role: { type: "string" }
            }
          },
          ProjectInput: {
            type: "object",
            required: ["name", "description", "startDate", "endDate", "client"],
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              startDate: { type: "string", format: "date" },
              endDate: { type: "string", format: "date" },
              client: { type: "string" },
              company: { type: "string" },
              user: { type: "string" }
            }
          },
          DeliveryNoteInput: {
            type: "object",
            required: ["clientId", "company", "projectId", "format"],
            properties: {
              userId: { type: "string" },
              clientId: { type: "string" },
              company: { type: "string" },
              projectId: { type: "string" },
              format: {
                type: "string",
                enum: ["hours", "material"]
              },
              hours: { type: "number" },
              material: { type: "string" },
              quantity: { type: "number" },
              description: { type: "string" },
              sign: { type: "string" },
              pending: { type: "boolean" },
              pdf: { type: "string" }
            },
          },
        },
      },      
    },
    apis: ["./routes/*.js"],
  };
  
module.exports = swaggerJsdoc(options)