import swaggerAutogen from "swagger-autogen";
import dotenv from "dotenv";

import {
  CostType,
  AttributeKind,
  itemType,
  SkillUseType,
  EquipSlot,
  SourceType,
  charaterType,
  ComponentType,
  OperationType,
  DamageType,
  StackingPolicy,
  CampaignCharacterRole,
  CampaignMemberRole
} from "@prisma/client";

dotenv.config();

const doc = {
  info: {
    title: "RPG Conjunto API",
    description:
      "API for managing users, characters, and campaigns in the RPG Conjunto application."
  },
  servers: [
    {
      url: (process.env.PUBLIC_API_URL || "http://localhost:4000") + "/api",
      description: "Development Server (via Nginx)"
    }
  ],
  definitions: {
    // User definitions
    LoginUserDTO: {
      email: "user@example.com",
      password: "securePassword123"
    },
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
      imageUrl: "http://example.com/images/user.png"
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

      generation: 1,
      type: Object.values(charaterType)[0],

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

      generation: 1,
      type: Object.values(charaterType)[0],

      userId: "uuid",
      archetypeId: "uuid"
    },
    UpdateCharacterDTO: {
      name: "Updated Name",
      race: "Updated Race",
      age: 30,
      height: 175,
      money: 1500,

      generation: 2,
      type: Object.values(charaterType)[1],

      imageUrl: "http://example.com/images/updated_leena.png"
    },
    DeleteCharacterDTO: {
      id: "uuid"
    },

    // Campaign definitions
    CampaignDTO: {
      id: "uuid",
      name: "Campanha das Sombras",
      description: "Uma aventura épica nas terras de Eldoria.",
      imageUrl: "https://example.com/campaign.png",
      isFinished: false,
      creatorId: "uuid",
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateCampaignDTO: {
      name: "Campanha das Sombras",
      description: "Uma aventura épica nas terras de Eldoria.",
      imageUrl: "https://example.com/campaign.png",
      isFinished: false,
      creatorId: "uuid"
    },
    UpdateCampaignDTO: {
      name: "Campanha revisada",
      description: "Atualização na história",
      imageUrl: "https://example.com/new-campaign.png",
      isFinished: true
    },
    DeleteCampaignDTO: {
      id: "uuid"
    },

    CharacterPerCampaignDTO: {
      id: "uuid",
      campaignId: "uuid",
      characterId: "uuid",
      role: Object.values(CampaignCharacterRole)[1],
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateCharacterPerCampaignDTO: {
      campaignId: "uuid",
      characterId: "uuid",
      role: Object.values(CampaignCharacterRole)[0]
    },
    UpdateCharacterPerCampaignDTO: {
      role: Object.values(CampaignCharacterRole)[2]
    },
    DeleteCharacterPerCampaignDTO: {
      id: "uuid"
    },

    CampaignMemberDTO: {
      id: "uuid",
      status: "Ativo",
      role: Object.values(CampaignMemberRole)[0],
      campaignId: "uuid",
      userId: "uuid",
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateCampaignMemberDTO: {
      status: "Ativo",
      role: Object.values(CampaignMemberRole)[1],
      campaignId: "uuid",
      userId: "uuid"
    },
    UpdateCampaignMemberDTO: {
      status: "Suspenso",
      role: Object.values(CampaignMemberRole)[0]
    },
    DeleteCampaignMemberDTO: {
      id: "uuid"
    },

    // characterHasItem definitions
    CharacterHasItemDTO: {
      id: "uuid",
      characterId: "uuid",
      itemId: "uuid",
      quantity: 1,
      value: 100,
      is_equipped: false,
      equipped_slot: Object.values(EquipSlot)[7],
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateCharacterHasItemDTO: {
      characterId: "uuid",
      itemId: "uuid",
      quantity: 1,
      value: 100,
      is_equipped: false,
      equipped_slot: Object.values(EquipSlot)[7]
    },
    UpdateCharacterHasItemDTO: {
      characterId: "uuid",
      itemId: "uuid",
      quantity: 2,
      value: 200,
      is_equipped: true,
      equipped_slot: Object.values(EquipSlot)[0]
    },
    DeleteCharacterHasItemDTO: {
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
      hp_cost: 0,
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
      hp_cost: 0,
      cooldown_value: 5
    },
    UpdateAbilitiesDTO: {
      name: "Devastating Blow",
      description: "An even more powerful attack.",
      imageURL: "http://example.com/images/devastating_blow.png",
      cost_type: Object.values(CostType)[3],
      mp_cost: 0,
      hp_cost: 10,
      tp_cost: 10,
      cooldown_value: 3
    },
    DeleteAbilitiesDTO: {
      id: "uuid"
    },

    // AbilityEffect  definitions
    AbilityEffectDTO: {
      id: "uuid",
      abilityId: "uuid",
      effectId: "uuid",
      formula: "2d6+WPN",
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateAbilityEffectDTO: {
      abilityId: "uuid",
      formula: "2d6+WPN",
      effectId: "uuid"
    },
    UpdateAbilityEffectDTO: {
      abilityId: "uuid",
      formula: "2d6+WPN",
      effectId: "uuid"
    },
    DeleteAbilityEffectDTO: {
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

    // Item Effects definitions
    ItemHasEffectDTO: {
      id: "uuid",
      itemId: "uuid",
      effectsId: "uuid",
      formula: "2d6",
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateItemHasEffectDTO: {
      itemId: "uuid",
      effectsId: "uuid",
      formula: "2d6"
    },
    UpdateItemHasEffectDTO: {
      itemId: "new-uuid",
      effectId: "new-uuid",
      formula: "2d6"
    },
    DeleteItemHasEffectDTO: {
      id: "uuid"
    },

    // Effect definitions
    EffectDTO: {
      id: "uuid",
      name: "Poison",
      description: "Causes damage to the target.",
      imgUrl: "http://example.com/images/poison.png",
      removableBy: "Item",

      damageType: Object.values(DamageType)[0],
      stackingPolicy: Object.values(StackingPolicy)[0],
      baseDuration: 3,

      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateEffectDTO: {
      name: "Poison",
      description: "Causes damage to the target.",
      imgUrl: "http://example.com/images/poison.png",
      removableBy: "Item",
      damageType: Object.values(DamageType)[0],
      stackingPolicy: Object.values(StackingPolicy)[0],
      baseDuration: 3
    },
    UpdateEffectDTO: {
      name: "Bleeding",
      description: "Causes damage to the target.",
      imgUrl: "http://example.com/images/bleeding.png",
      removableBy: "Item",
      damageType: Object.values(DamageType)[1],
      stackingPolicy: Object.values(StackingPolicy)[1],
      baseDuration: 1
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
      useType: Object.values(SkillUseType)[0]
    },
    UpdateSkillDTO: {
      characterId: "new-uuid",
      abilityId: "new-uuid",
      cooldown: 3,
      useType: Object.values(SkillUseType)[1]
    },
    DeleteSkillDTO: {
      id: "uuid"
    },

    // EffectModifier definitions
    EffectModifierDTO: {
      id: "uuid",
      effectId: "uuid",
      componentName: "Strength",
      componentType: Object.values(ComponentType)[0],
      operationType: Object.values(OperationType)[0],
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },
    CreateEffectModifierDTO: {
      effectId: "uuid",
      componentName: "Strength",
      componentType: Object.values(ComponentType)[0],
      operationType: Object.values(OperationType)[0]
    },
    UpdateEffectModifierDTO: {
      effectId: "new-uuid",
      componentName: "Agility",
      componentType: Object.values(ComponentType)[1],
      operationType: Object.values(OperationType)[1]
    },
    DeleteEffectModifierDTO: {
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
      valueExtra: 0
    },
    UpdateCharacterAttributeDTO: {
      characterId: "new-uuid",
      attributeId: "new-uuid",
      valueBase: 15,
      valueInv: 7,
      valueExtra: 2
    },
    DeleteCharacterAttributeDTO: {
      id: "uuid"
    },

    // AppliedEffect definitions
    AppliedEffectDTO: {
      id: "uuid",
      characterId: "uuid",
      effectId: "uuid",
      sourceType: Object.values(SourceType)[0],
      duration: 10,
      startedAt: 5,
      expiresAt: 0,
      stacks: 1,
      createdAt: "2023-10-01T12:00:00Z",
      updatedAt: "2023-10-01T12:00:00Z",
      deletedAt: null
    },

    CreateAppliedEffectDTO: {
      characterId: "uuid",
      effectId: "uuid",
      sourceType: Object.values(SourceType)[0],
      duration: 10,
      startedAt: 5,
      expiresAt: 0,
      stacks: 1
    },
    UpdateAppliedEffectDTO: {
      characterId: "new-uuid",
      effectId: "new-uuid",
      sourceType: Object.values(SourceType)[1],
      duration: 15,
      startedAt: 7,
      expiresAt: 0,
      stacks: 2
    },
    DeleteAppliedEffectDTO: {
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
      valueActual: 100
    },
    UpdateStatusDTO: {
      characterId: "new-uuid",
      name: "Mana",
      valueMax: 50,
      valueBonus: 0,
      valueActual: 50
    },
    DeleteStatusDTO: {
      id: "uuid"
    }
  }
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/router/v1Router.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc).then(
  () => {
    console.log("Swagger documentation generated successfully.");
  }
);
