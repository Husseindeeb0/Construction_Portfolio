import { UserResponseDto } from "./userResponse.dto.js";

export interface AuthResponseDto {
  user: UserResponseDto;
  message: string;
}
