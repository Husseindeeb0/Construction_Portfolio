import { ReorderRequestDto, ReorderDirection } from "./reorder/reorder.dto.js";

export const validateReorder = (
  body: unknown,
): {
  valid: boolean;
  errors?: Record<string, string>;
  data?: ReorderRequestDto;
} => {
  const errors: Record<string, string> = {};

  if (typeof body !== "object" || body === null) {
    return {
      valid: false,
      errors: { body: "Request body must be a valid JSON object" },
    };
  }

  const record = body as Record<string, unknown>;

  if (!record.direction || typeof record.direction !== "string") {
    errors.direction = "Direction is required and must be a string";
  } else {
    const dir = record.direction.trim().toLowerCase();
    if (dir !== "up" && dir !== "down") {
      errors.direction = 'Direction must be either "up" or "down"';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      direction: (record.direction as string)
        .trim()
        .toLowerCase() as ReorderDirection,
    },
  };
};
