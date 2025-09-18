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
      nickname: "johnd",
      imageUrl: "http://example.com/images/user.png",

      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateUserDTO: {
      email: "user@example.com",
      nickname: "johnd",
      password: "securePassword123",
      imageUrl: "http://example.com/images/user.png",
    },
    UpdateUserDTO: {
      email: "new_email@example.com",
      nickname: "new_nickname",
      password: "newSecurePassword456",
      imageUrl: "http://example.com/images/new_user.png"
    },
    DeleteUserDTO: {
      id: "uuid"
    },

    // Character definitions
    CharacterDTO: {
      id: "uuid",
      name: "Leena Timestar",
      race: "Human",
      age: 25,
      height: 170,
      money: 1000,
      imageUrl: "http://example.com/images/leena.png",

      userId: "uuid",
      archetypeId: "uuid",

      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateCharacterDTO: {
      name: "Leena Timestar",
      race: "Human",
      age: 25,
      height: 170,
      money: 1000,
      imageUrl: "http://example.com/images/leena.png",

      userId: "uuid",
      archetypeId: "uuid"
    },
    UpdateCharacterDTO: {
      name: "Updated Name",
      race: "Updated Race",
      age: 30,
      height: 175,
      money: 1500,
      imageUrl: "http://example.com/images/updated_leena.png"
    },
    DeleteCharacterDTO: {
      id: "uuid"
    },

    // Archetype definitions
    ArchetypeDTO: {
      id: "uuid",
      name: "Warrior",
      hp: 100,
      mp: 50,
      tp: 20,
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateArchetypeDTO: {
      name: "Warrior",
      hp: 100,
      mp: 50,
      tp: 20
    },
    UpdateArchetypeDTO: {
      name: "Mage"
    },
    DeleteArchetypeDTO: {
      id: "uuid"
    },

    // Abilities definitions

    AbilitiesDTO: {
      id: "uuid",
      name: "Fireball",
      description: "A powerful fire attack.",
      imageURL: "http://example.com/images/fireball.png",
      cost_type: "Mana",
      mp_cost: 20,
      tp_cost: 0,
      cooldown_value: 5,
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateAbilitiesDTO: {
      name: "Fireball",
      description: "A powerful fire attack.",
      imageURL: "http://example.com/images/fireball.png",
      cost_type: "Mana",
      mp_cost: 20,
      tp_cost: 0,
      cooldown_value: 5
    },
    UpdateAbilitiesDTO: {
      name: "Ice Blast",
      description: "A chilling ice attack."
    },
    DeleteAbilitiesDTO: {
      id: "uuid"
    },

  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/router/v1Router.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc).then(() => {
    console.log('Swagger documentation generated successfully.');
});