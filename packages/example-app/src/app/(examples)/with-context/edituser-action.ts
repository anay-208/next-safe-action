"use server";

import { authAction } from "@/lib/safe-action";
import { maxLength, minLength, object, string } from "valibot";

const schema = object({
	fullName: string([minLength(3, "Too short"), maxLength(20, "Too long")]),
	age: string([minLength(2, "Too young"), maxLength(3, "Too old")]),
});

export const editUser = authAction
	.metadata({ actionName: "editUser" })
	.schema(schema)
	.action(
		// Here you have access to `userId`, and `sessionId which comes from middleware functions
		// defined before.
		//                                              \\\\\\\\\\\\\\\\\\
		async ({ parsedInput: { fullName, age }, ctx: { userId, sessionId } }) => {
			if (fullName.toLowerCase() === "john doe") {
				return {
					error: {
						cause: "forbidden_name",
					},
				};
			}

			const intAge = parseInt(age);

			if (Number.isNaN(intAge)) {
				return {
					error: {
						reason: "invalid_age", // different key in `error`, will be correctly inferred
					},
				};
			}

			return {
				success: {
					newFullName: fullName,
					newAge: intAge,
					userId,
					sessionId,
				},
			};
		}
	);