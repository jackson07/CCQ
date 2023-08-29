import { todoRepository } from "@server/repository/todo";
import { z as schema } from "zod";
import { NextApiRequest, NextApiResponse } from "next";
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

async function get(req: NextApiRequest, res: NextApiResponse) {
    const query = req.query;
    const parsedQuery = QueryPageSchema.safeParse(query);

    if (!parsedQuery.success) {
        const errorMessage = parsedQuery.error.issues
            .map((issue) => issue.message)
            .join(", ");
        res.status(400).json({
            error: {
                message: errorMessage,
            },
        });
        return;
    }

    const { page, limit } = parsedQuery.data;
    const parsedPage = page ? Number(page) : undefined;
    const parsedLimit = limit ? Number(limit) : undefined;
    const output = await todoRepository.get({
        page: parsedPage,
        limit: parsedLimit,
    });

    res.status(200).json({
        total: output.total,
        pages: output.pages,
        todos: output.todos,
    });
}

const TodoCreateBodySchema = schema.object({
    content: schema.string(),
});
async function create(req: NextApiRequest, res: NextApiResponse) {
    const body = TodoCreateBodySchema.safeParse(req.body);

    if (!body.success) {
        res.status(400).json({
            error: {
                message: "You need to provide a content to creat a TODO",
                description: body.error.issues,
            },
        });
        return;
    }
    try {
        const createdTodo = await todoRepository.createdByContent(
            body.data.content
        );

        res.status(201).json({
            todo: createdTodo,
        });
    } catch {
        res.status(400).json({
            error: {
                message: "Failed to create todo",
            },
        });
    }
}

async function toggleDone(req: NextApiRequest, res: NextApiResponse) {
    const todoId = req.query.id;

    if (!todoId || typeof todoId !== "string") {
        res.status(400).json({
            error: {
                message: "You must to provide a stringg ID",
            },
        });
        return;
    }

    try {
        const updateTodo = await todoRepository.toggleDone(todoId);

        res.status(200).json({ todo: updateTodo });
    } catch (err) {
        if (err instanceof Error) {
            res.status(404).json({
                error: {
                    message: err.message,
                },
            });
        }
    }
}

async function deleteById(req: NextApiRequest, res: NextApiResponse) {
    const querySchema = schema.object({
        id: schema.string().uuid().nonempty(),
    });
    const parsedQuery = querySchema.safeParse(req.query);

    if (!parsedQuery.success) {
        return res.status(400).json({
            error: {
                message: `You must a provider ID`,
            },
        });
    }

    try {
        const todoId = parsedQuery.data.id;
        await todoRepository.deleteById(todoId);

        res.status(204).end();
    } catch (err) {
        if (err instanceof HttpNotFoundError) {
            res.status(err.status).json({
                error: {
                    message: err.message,
                },
            });
        }

        res.status(500).json({
            error: {
                message: `Internal server error`,
            },
        });
    }
}

export const todoController = {
    get,
    create,
    toggleDone,
    deleteById,
};
