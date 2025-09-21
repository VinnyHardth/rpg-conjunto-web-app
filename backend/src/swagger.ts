import swaggerAutogen from 'swagger-autogen';
import dotenv from 'dotenv';

import { CostType, AttributeKind, itemType, SkillUseType, TargetType } from '@prisma/client';

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
      cost_type: Object.values(CostType)[0],
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
      cost_type: Object.values(CostType)[0],
      mp_cost: 20,
      tp_cost: 0,
      cooldown_value: 5
    },
    UpdateAbilitiesDTO: {
      name: "Devastating Blow",
      description: "An even more powerful attack.",
      imageURL: "http://example.com/images/devastating_blow.png",
      cost_type: Object.values(CostType)[1],
      mp_cost: 0,
      tp_cost: 10,
      cooldown_value: 3
    },
    DeleteAbilitiesDTO: {
      id: "uuid"
    },

    // Attributes definitions
    AttributesDTO: {
      id: "uuid",
      name: "Strength",
      kind: Object.values(AttributeKind)[0],
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateAttributesDTO: {
      name: "Strength",
      kind: Object.values(AttributeKind)[0]
    },
    UpdateAttributesDTO: {
      name: "Dexterity",
      kind: Object.values(AttributeKind)[1]
    },
    DeleteAttributesDTO: {
      id: "uuid"
    }, 

    // Items definitions
    ItemsDTO: {
      id: "uuid",
      name: "Health Potion",
      description: "Restores 50 HP.",
      imageURL: "http://example.com/images/health_potion.png",
      value: 50,
      itemType: Object.values(itemType)[0],
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateItemsDTO: {
      name: "Health Potion",
      description: "Restores 50 HP.",
      imageURL: "http://example.com/images/health_potion.png",
      value: 50,
      itemType: Object.values(itemType)[0]
    },
    UpdateItemsDTO: {
      name: "Mana Potion",
      description: "Restores 30 MP.",
      imageURL: "http://example.com/images/mana_potion.png",
      value: 30,
      itemType: Object.values(itemType)[1]
    },
    DeleteItemsDTO: {
      id: "uuid"
    },

    // ItemSkill definitions
    ItemSkillsDTO: {
      id: "uuid",
      itemId: "uuid",
      skillId: "uuid",
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateItemSkillsDTO: {
      itemId: "uuid",
      skillId: "uuid",
      cooldown: 0
    },
    UpdateItemSkillsDTO: {
      itemId: "new-uuid",
      skillId: "new-uuid",
      cooldown: 5
    },
    DeleteItemSkillsDTO: {
      id: "uuid"
    },

    // Effect definitions
    EffectDTO: {
      id: "uuid",
      name: "Poison",
  },
    CreateEffectDTO: {
      name: "Poison",
      imgUrl: "http://example.com/images/poison.png",
    },
    UpdateEffectDTO: {
      name: "Burn",
      imgUrl: "http://example.com/images/burn.png",
    },
    DeleteEffectDTO: {
      id: "uuid"
    },

    // Skill definitions
    SkillDTO: {
      id: "uuid",
      characterId: "uuid",
      abilityId: "uuid",
      cooldown: 5,
      useType: Object.values(SkillUseType)[0],
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateSkillDTO: {
      characterId: "uuid",
      abilityId: "uuid",
      cooldown: 5,
      useType: Object.values(SkillUseType)[0],
    },
    UpdateSkillDTO: {
      characterId: "new-uuid",
      abilityId: "new-uuid",
      cooldown: 3,
      useType: Object.values(SkillUseType)[1],
    },
    DeleteSkillDTO: {
      id: "uuid"
    },

    // EffectTarget definitions
    EffectTargetDTO: {
      id: "uuid",
      effectId: "uuid",
      targetCode: Object.values(TargetType)[0],
      targetType: "Strength",
      value: 10,
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateEffectTargetDTO: {
      effectId: "uuid",
      targetCode: Object.values(TargetType)[0],
      targetType: "Strength",
      value: 10,
    },
    UpdateEffectTargetDTO: {
      effectId: "new-uuid",
      targetCode: Object.values(TargetType)[1],
      targetType: "Dexterity",
      value: 15,
    },
    DeleteEffectTargetDTO: {
      id: "uuid"
    },

    // CharacterAttribute definitions
    CharacterAttributeDTO: {
      id: "uuid",
      characterId: "uuid",
      attributeId: "uuid",
      valueBase: 10,
      valueInv: 5,
      valueExtra: 0,
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateCharacterAttributeDTO: {
      characterId: "uuid",
      attributeId: "uuid",
      valueBase: 10,
      valueInv: 5,
      valueExtra: 0,
    },
    UpdateCharacterAttributeDTO: {
      characterId: "new-uuid",
      attributeId: "new-uuid",
      valueBase: 15,
      valueInv: 7,
      valueExtra: 2,
    },
    DeleteCharacterAttributeDTO: {
      id: "uuid"
    },

    // Status definitions
    StatusDTO: {
      id: "uuid",
      characterId: "uuid",
      name: "Health",
      valueMax: 100,
      valueBonus: 0,
      valueActual: 100,
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateStatusDTO: {
      characterId: "uuid",
      name: "Health",
      valueMax: 100,
      valueBonus: 0,
      valueActual: 100,
    },
    UpdateStatusDTO: {
      characterId: "new-uuid",
      name: "Mana",
      valueMax: 50,
      valueBonus: 0,
      valueActual: 50,
    },
    DeleteStatusDTO: {
      id: "uuid"
    },  

   
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/router/v1Router.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc).then(() => {
    console.log('Swagger documentation generated successfully.');
});