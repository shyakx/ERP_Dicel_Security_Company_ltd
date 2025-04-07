import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dicel Security Company ERP API',
      version: version,
      description: 'API documentation for Dicel Security Company ERP System',
      contact: {
        name: 'API Support',
        email: 'support@dicelsecurity.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
    './src/schemas/*.ts',
    './dist/routes/*.js',
    './dist/controllers/*.js',
    './dist/models/*.js',
    './dist/schemas/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 