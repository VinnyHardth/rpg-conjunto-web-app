import { User } from "@prisma/client";

type CreateUserDTO = Pick<User, "email" | "nickname" | "password" | "imageUrl">;
type UpdateUserDTO = Partial<CreateUserDTO>;
type DeleteUserDTO = Pick<User, "id">;
type UserDTO = Omit<User, "password">;

export { CreateUserDTO, UpdateUserDTO, DeleteUserDTO, UserDTO };
