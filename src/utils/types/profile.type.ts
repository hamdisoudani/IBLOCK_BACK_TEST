import { Profile } from "src/users/schemas/users.schema";

export interface UserProfile extends Profile {
    _id: string
}