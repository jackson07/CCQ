import { todoRepository } from "@server/repository/todo";
import { z as schema } from "zod";
import { HttpNotFoundError } from "@server/infra/errors";

const QueryPageSchema = schema.object({
    page: schema
        .string()
        .optional()
        .refine((value) => value === undefined || !isNaN(Number(value)), {
            message: "'page' must be a number",
        }),
    limit: schema
        .string()
        .optional()
        .refine((value) => value === undefined || !isNaN(Number(value)), {
            message: "'limit' must be a number",
        }),
});

async function get(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = {
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
    };
    const parsedQuery = QueryPageSchema.safeParse(query);

    if (!parsedQuery.success) {
        const errorMessage = parsedQuery.error.issues
            .map((issue) => issue.message)
            .join(", ");
        // res.status(400).json({
        //     error: {
        //         message: errorMessage,
        //     },
        // });
        return new Response(
            JSON.stringify({
                error: {
                    message: errorMessage,
                },
            }),
            {
                status: 400,
            }
        );
    }

    const { page, limit } = parsedQuery.data;
    const parsedPage = page ? Number(page) : undefined;
    const parsedLimit = limit ? Number(limit) : undefined;
    try {
        const output = await todoRepository.get({
            page: parsedPage,
            limit: parsedLimit,
        });
        // res.status(200).json({
        //     total: output.total,
        //     pages: output.pages,
        //     todos: output.todos,
        // });
        return new Response(
            JSON.stringify({
                total: output.total,
                pages: output.pages,
                todos: output.todos,
            }),
            {
                status: 200,
            }
        );
    } catch {
        return new Response(
            JSON.stringify({
                error: {
                    message: "Failed to fetch TODOs",
                },
            }),
            {
                status: 400,
            }
        );
    }
}

const TodoCreateBodySchema = schema.object({
    content: schema.string(),
});
async function create(req: Request) {
    const body = TodoCreateBodySchema.safeParse(await req.json());

    if (!body.success) {
        // res.status(400).json({
        //     error: {
        //         message: "You need to provide a content to creat a TODO",
        //         description: body.error.issues,
        //     },
        // });
        return new Response(
            JSON.stringify({
                error: {
                    message: "You need to provide a content to creat a TODO",
                    description: body.error.issues,
                },
            }),
            {
                status: 400,
            }
        );
    }
    try {
        const createdTodo = await todoRepository.createdByContent(
            body.data.content
        );

        // res.status(201).json({
        //     todo: createdTodo,
        // });
        return new Response(
            JSON.stringify({
                todo: createdTodo,
            }),
            {
                status: 201,
            }
        );
    } catch {
        // res.status(400).json({
        //     error: {
        //         message: "Failed to create todo",
        //     },
        // });
        return new Response(
            JSON.stringify({
                error: {
                    message: "Failed to create todo",
                },
            }),
            {
                status: 400,
            }
        );
    }
}

async function toggleDone(req: Request, id: string) {
    const todoId = id;

    if (!todoId || typeof todoId !== "string") {
        // res.status(400).json({
        //     error: {
        //         message: "You must to provide a stringg ID",
        //     },
        // });
        return new Response(
            JSON.stringify({
                error: {
                    message: "You must to provide a stringg ID",
                },
            }),
            {
                status: 400,
            }
        );
    }

    try {
        const updateTodo = await todoRepository.toggleDone(todoId);

        // res.status(200).json({ todo: updateTodo });
        return new Response(
            JSON.stringify({
                todo: updateTodo,
            }),
            {
                status: 200,
            }
        );
    } catch (err) {
        if (err instanceof Error) {
            // res.status(404).json({
            //     error: {
            //         message: err.message,
            //     },
            // });
            return new Response(
                JSON.stringify({
                    error: {
                        message: err.message,
                    },
                })
            );
        }
    }
}

async function deleteById(req: Request, id: string) {
    const query = {
        id,
    };

    const querySchema = schema.object({
        id: schema.string().uuid().nonempty(),
    });
    const parsedQuery = querySchema.safeParse(query);

    if (!parsedQuery.success) {
        // return res.status(400).json({
        //     error: {
        //         message: `You must a provider ID`,
        //     },
        // });
        return new Response(
            JSON.stringify({
                error: {
                    message: `You must a provider ID`,
                },
            })
        );
    }

    try {
        const todoId = parsedQuery.data.id;
        await todoRepository.deleteById(todoId);

        // res.status(204).end();
        return new Response(null, {
            status: 204,
        });
    } catch (err) {
        if (err instanceof HttpNotFoundError) {
            // res.status(err.status).json({
            //     error: {
            //         message: err.message,
            //     },
            // });
            return new Response(
                JSON.stringify({
                    error: {
                        message: err.message,
                    },
                })
            );
        }

        // res.status(500).json({
        //     error: {
        //         message: `Internal server error`,
        //     },
        // });
        return new Response(
            JSON.stringify({
                error: {
                    message: `Internal server error`,
                },
            })
        );
    }
}

export const todoController = {
    get,
    create,
    toggleDone,
    deleteById,
};
