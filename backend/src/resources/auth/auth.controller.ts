import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { createUser, getUserById, getUserByEmail } from "../user/user.services";
import { verifyCredentials } from "./auth.services";

const register = async (req: Request, res: Response): Promise<void> => {
    /*
        #swagger.summary = 'Register a new user'
        #swagger.description = 'Endpoint to register a new user.'

        #swagger.requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/definitions/CreateUserDTO' }
            }
          }
        }

        #swagger.responses[201] = {
          description: 'User created successfully.',
          schema: { $ref: '#/definitions/UserDTO' }
        }

        #swagger.responses[400] = { description: 'Bad Request' }
        #swagger.responses[422] = { description: 'Unprocessable Entity|User already exists' }
        #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    const userData = req.body;

    try {
        // Check if user already exists
        const existingUser = await getUserByEmail(userData.email);

        if (existingUser) {
            res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
                message: 'User already exists'
            });
            return;
        }

        const newUser = await createUser(userData);
        res.status(StatusCodes.CREATED).json(newUser);
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: ReasonPhrases.BAD_REQUEST
        })
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    /*
        #swagger.summary = 'Login a user'
        #swagger.description = 'Endpoint to login a user.'

        #swagger.requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/definitions/LoginUserDTO' }
            }
          } 
        }

        #swagger.responses[200] = {
          description: 'User logged in successfully.',
          schema: { $ref: '#/definitions/UserDTO' }
        }

        #swagger.responses[400] = { description: 'Bad Request' }
        #swagger.responses[422] = { description: 'Unprocessable Entity' }
        #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    const loginData = req.body;
  
    try {
        const user = await verifyCredentials(loginData);
        
        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                message: ReasonPhrases.UNAUTHORIZED
            });
            return;
        }

        req.session.userId = user.id;
        res.status(StatusCodes.OK).json(user);
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: ReasonPhrases.BAD_REQUEST
        })    
    }
};

const logout = async (req: Request, res: Response): Promise<void> => {
    /*
        #swagger.summary = 'Logout a user'
        #swagger.description = 'Endpoint to logout a user.'

        #swagger.responses[200] = {
          description: 'User logged out successfully.',
          schema: { $ref: '#/definitions/UserDTO' }
        }

        #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    if (req.session.userId) {
        req.session.destroy(() => {
            res.status(StatusCodes.OK).json({
                message: ReasonPhrases.OK
            });
        });
    } else {
        res.status(StatusCodes.UNAUTHORIZED).json({
            message: ReasonPhrases.UNAUTHORIZED
        });
    }
};

const getProfile = async (req: Request, res: Response): Promise<void> => {
    /*
        #swagger.summary = 'Get user profile'
        #swagger.description = 'Endpoint to retrieve the profile of the logged-in user.'

        #swagger.responses[200] = {
          description: 'User profile retrieved successfully.',
          schema: { $ref: '#/definitions/UserDTO' }
        }

        #swagger.responses[401] = { description: 'Unauthorized' }
        #swagger.responses[500] = { description: 'Internal Server Error' }
    */

    if (req.session.userId) {
        const user = await getUserById(req.session.userId);
        res.status(StatusCodes.OK).json(user);
    } else {
        res.status(StatusCodes.UNAUTHORIZED).json({
            message: ReasonPhrases.UNAUTHORIZED
        });
    }
};

export default { register, login, logout, getProfile };