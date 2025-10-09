import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import {
  CreateUserDTO,
  DeleteUserDTO,
  UpdateUserDTO,
  UserDTO,
} from "./user.types";
import * as userServices from "./user.services";

const create = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.summary = 'Create a new user'
    #swagger.description = 'Endpoint to create a new user.'

    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/CreateUserDTO' }
        }
      }
    }

    #swagger.responses[201] = {
      description: 'User created successfully.',
      schema: { $ref: '#/definitions/UserDTO' }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[422] = { description: 'Unprocessable Entity (validation failed or user already exists)' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
  */

  const userData: CreateUserDTO = req.body;

  try {
    // Checa se o usuário já existe
    const existingUserByEmail = await userServices.getUserByEmail(
      userData.email,
    );

    if (existingUserByEmail) {
      res.status(422).json({
        message: "User with the provided email already exists",
      });
      return;
    }

    const newUser: UserDTO = await userServices.createUser(userData);
    res.status(StatusCodes.CREATED).json(newUser);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  /*
      #swagger.summary = 'Get user by ID'
      #swagger.description = 'Endpoint to retrieve a user by their ID.'

      #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the user to retrieve.',
        required: true,
        type: 'string'
      }

      #swagger.responses[200] = {
        description: 'User retrieved successfully.',
        schema: { $ref: '#/definitions/UserDTO' }
      }

      #swagger.responses[404] = { description: 'User not found' }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */

  const { id } = req.params;

  try {
    const user: UserDTO | null = await userServices.getUserById(id);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
  }
};

const getByEmail = async (req: Request, res: Response): Promise<void> => {
  /*
      #swagger.summary = 'Get user by email'
      #swagger.description = 'Endpoint to retrieve a user by their email.'

      #swagger.parameters['email'] = {
        in: 'path',
        description: 'Email of the user to retrieve.',
        required: true,
        type: 'string'
      }

      #swagger.responses[200] = {
        description: 'User retrieved successfully.',
        schema: { $ref: '#/definitions/UserDTO' }
      }

      #swagger.responses[404] = { description: 'User not found' }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */

  const { email } = req.params as { email: string };

  try {
    const user: UserDTO | null = await userServices.getUserByEmail(email);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  /*
      #swagger.summary = 'Get all users'
      #swagger.description = 'Endpoint to retrieve all users.'

      #swagger.responses[200] = {
        description: 'Users retrieved successfully.',
        schema: { 
          type: 'array',
          items: { $ref: '#/definitions/UserDTO' }
        }
      }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */

  try {
    const users: UserDTO[] = await userServices.getUsers();
    res.status(StatusCodes.OK).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  /*
      #swagger.summary = 'Update a user'
      #swagger.description = 'Endpoint to update an existing user.'

      #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the user to update.',
        required: true,
        type: 'string'
      }

      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/UpdateUserDTO' }
          }
        }
      }

      #swagger.responses[200] = {
        description: 'User updated successfully.',
        schema: { $ref: '#/definitions/UserDTO' }
      }
      #swagger.responses[400] = { description: 'Bad Request' }
      #swagger.responses[404] = { description: 'User not found' }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */

  const { id } = req.params;
  const userData: UpdateUserDTO = req.body;

  try {
    // Check if user exists
    const existingUser = await userServices.getUserById(id);
    if (!existingUser) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    const updatedUser: UserDTO = await userServices.updateUser(id, userData);
    res.status(StatusCodes.OK).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  /*
      #swagger.summary = 'Delete a user'
      #swagger.description = 'Endpoint to delete a user.'

      #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the user to delete.',
        required: true,
        type: 'string'
      }

      #swagger.responses[200] = {
        description: 'User deleted successfully.',
        schema: { $ref: '#/definitions/UserDTO' }
      }
      #swagger.responses[404] = { description: 'User not found' }
      #swagger.responses[500] = { description: 'Internal Server Error' }
    */

  const { id } = req.params;
  const userData: DeleteUserDTO = { id };

  try {
    // Check if user exists
    const existingUser = await userServices.getUserById(id);
    if (!existingUser) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    const deletedUser: UserDTO = await userServices.deleteUser(userData);
    res.status(StatusCodes.OK).json(deletedUser);
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
  }
};

export default { create, getById, getByEmail, getAll, update, remove };
