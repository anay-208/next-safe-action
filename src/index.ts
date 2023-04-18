import { z } from "zod";

// This utility creates an output validator that has
// { type: "success", data: successData }
// or
// { type: "error", data: errorData }
export const createMutationOutputValidator = <
	SuccessData extends z.AnyZodObject,
	ErrorData extends z.AnyZodObject
>({
	successData,
	errorData,
}: {
	successData: SuccessData;
	errorData: ErrorData;
}) =>
	z
		.object({ type: z.literal("success"), data: successData })
		.or(z.object({ type: z.literal("error"), data: errorData }));

// The type for client mutation, which is called by components.
// You pass the input data here, and it's all typesafe.
type ClientMutation<
	IV extends z.ZodTypeAny,
	OV extends ReturnType<typeof createMutationOutputValidator>
> = (input: z.infer<IV>) => Promise<{
	success?: Extract<z.infer<OV>, { type: "success" }>["data"];
	error?: Extract<z.infer<OV>, { type: "error" }>["data"];
	serverError?: true;
	inputValidationErrorFields?: Partial<Record<keyof z.infer<IV>, string[]>>;
}>;

// We need to overload the `safeMutation` function, because some mutations
// need authentication, and others don't, so you can pass the `withAuth: true` property
// in the `opts` arg, to get back both `parsedInput` and `authArgs` in the server
// mutation function definition.
// `authArgs` comes from the previously defined `getAuthUserId` function.
type SafeMutationOverload<AuthData extends object> = {
	<
		const IV extends z.ZodTypeAny,
		const OV extends ReturnType<typeof createMutationOutputValidator>
	>(
		opts: {
			inputValidator: IV;
			outputValidator: OV;
			withAuth?: false;
		},
		mutationDefinitionFunc: (parsedInput: z.infer<IV>, authArgs: undefined) => Promise<z.infer<OV>>
	): ClientMutation<IV, OV>;

	<
		const IV extends z.ZodTypeAny,
		const OV extends ReturnType<typeof createMutationOutputValidator>
	>(
		opts: {
			inputValidator: IV;
			outputValidator: OV;
			withAuth: true;
		},
		mutationDefinitionFunc: (parsedInput: z.infer<IV>, authArgs: AuthData) => Promise<z.infer<OV>>
	): ClientMutation<IV, OV>;
};

// This is the safe mutation initializer.
export const createSafeMutationClient = <AuthData extends object>(createOpts?: {
	serverErrorLogFunction?: (e: any) => void | Promise<void>;
	getAuthData?: () => Promise<AuthData>;
}) => {
	// If log function is not provided, default to `console.error` for logging
	// server error messages.
	const serverErrorLogFunction =
		createOpts?.serverErrorLogFunction ||
		((e) => {
			const errMessage = "message" in e && typeof e.message === "string" ? e.message : e;

			console.log("Mutation error:", errMessage);
		});

	// `safeMutation` is the server function that creates a new mutation.
	// It expects input and output validators, an optional `withAuth` property, and
	// a definition function, so the mutation knows what to do on the server when
	// called by the client.
	// It returns a function callable by the client.
	const safeMutation: SafeMutationOverload<AuthData> = (opts, mutationDefinitionFunc) => {
		// This is the function called by client. If `input` fails the `inputValidator`
		// parsing, the function will return an `inputValidationErrorFields` object,
		// containing all the invalid fields provided.
		return async (input) => {
			const parsedInput = opts.inputValidator.safeParse(input);

			if (!parsedInput.success) {
				const fieldErrors = parsedInput.error.flatten().fieldErrors as Partial<
					Record<keyof z.infer<(typeof opts)["inputValidator"]>, string[]>
				>;

				return {
					inputValidationErrorFields: fieldErrors,
				};
			}

			try {
				let serverRes: z.infer<(typeof opts)["outputValidator"]>;

				if (opts.withAuth) {
					if (!createOpts?.getAuthData) {
						throw new Error("`getAuthData` function not provided to `createSafeMutationClient`");
					}

					const authData = await createOpts.getAuthData();

					// @ts-expect-error
					serverRes = await mutationDefinitionFunc(parsedInput.data, authData);
				} else {
					// @ts-expect-error
					serverRes = await mutationDefinitionFunc(parsedInput.data);
				}

				const parsedOutput = opts.outputValidator.safeParse(serverRes);

				if (!parsedOutput.success) {
					throw new Error("output parsing risulted in invalid object");
				}

				return {
					[serverRes.type]: serverRes.data,
				};
			} catch (e: any) {
				// eslint-disable-next-line
				serverErrorLogFunction(e);

				return { serverError: true };
			}
		};
	};

	return safeMutation;
};
