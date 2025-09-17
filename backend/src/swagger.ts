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

    // User definitions
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

    // Character definitions
    CharacterDTO: {
      id: "uuid",
      name: "Leena Timestar",
      nickname: "leena",
      description: "A Rogue with time-manipulation abilities.",
      userId: "uuid",
      imageUrl: "http://example.com/images/leena.png",
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateCharacterDTO: {
      name: "Leena Timestar",
      nickname: "leena",
      description: "A Rogue with time-manipulation abilities.",
      imageUrl: "http://example.com/images/leena.png",
      userId: "uuid"
    },
    UpdateCharacterDTO: {
      name: "Updated Name",
      nickname: "updated_nickname",
      description: "Updated description.",
      imageUrl: "http://example.com/images/updated_image.png"
    },
    DeleteCharacterDTO: {
      id: "uuid"
    },

    // Stats definitions
    StatsDTO: {
      id: "uuid",
      strength: 10,
      dexterity: 14,
      constitution: 12,
      intelligence: 16,
      wisdom: 11,
      charisma: 13,
      destiny: 5,
      characterId: "uuid",
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
    },
    CreateStatsDTO: {
      strength: 10,
      dexterity: 14,
      constitution: 12,
      intelligence: 16,
      wisdom: 11,
      charisma: 13,
      destiny: 5,
      characterId: "uuid"
    },
    UpdateStatsDTO: {
      strength: 12,
      dexterity: 15
    },
    DeleteStatsDTO: {
      id: "uuid"
    },

    // CharState definitions
    CharStateDTO: {
      id: "uuid",
      characterId: "uuid",
      currentHP: 35,
      maxHP: 50,
      currentMP: 20,
      maxMP: 30,
      currentTP: 5,
      maxTP: 10,
      magicRes: 14,
      fisicalRes: 12,
      perception: 13,
      intimidation: 11,
      faith: 15,
      inspiration: 10,
      determination: 12,
      bluff: 14,
      reflexes: 13,
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateCharStateDTO: {
      characterId: "uuid"
    },
    UpdateCharStateDTO: {
      currentHP: 40,
      currentMP: 25
    },
    DeleteCharStateDTO: {
      id: "uuid"
    },

  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/router/v1Router.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc).then(() => {
    console.log('Swagger documentation generated successfully.');
});