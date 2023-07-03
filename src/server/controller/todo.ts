import { todoRepository } from "@server/repository/todo";
import { z as schema } from "zod";
import { NextApiRequest, NextApiResponse } from "next";

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
    const output = todoRepository.get({ page: parsedPage, limit: parsedLimit });

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

    const createdTodo = await todoRepository.createdByContent(
        body.data.content
    );

    res.status(201).json({
        todo: createdTodo,
    });
}

export const todoController = {
    get,
    create,
};
