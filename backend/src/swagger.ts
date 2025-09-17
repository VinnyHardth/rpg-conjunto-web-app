import swaggerAutogen from 'swagger-autogen';
import dotenv from 'dotenv';

dotenv.config();

const doc = {
  info: {
    title: 'RPG Conjunto API',
    description: 'API for managing users, characters, and campaigns in the RPG Conjunto application.',
  },
  servers: [
    {
      url: `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`,
      description: 'Local server',
    },
  ],
  definitions: {
    UserDTO: {
      id: "uuid",
      email: "user@example.com",
      name: "John Doe",
      nickname: "johnd",
    },
    CreateUserDTO: {
      email: "user@example.com",
      name: "John Doe",
      nickname: "johnd",
      password: "securePassword123"
    },
    UpdateUserDTO: {
      email: "new_email@example.com",
      name: "New Name",
      nickname: "new_nickname",
      password: "newSecurePassword456"
    },
    DeleteUserDTO: {
      id: "uuid"
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/router/v1Router.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc).then(() => {
    console.log('Swagger documentation generated successfully.');
});