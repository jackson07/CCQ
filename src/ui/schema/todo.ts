import { z as schema } from "zod";

// // Model
// interface Todo {
//     id: string;
//     content: string;
//     data: Date;
//     done: boolean;
// }

export const TodoSchema = schema.object({
    id: schema.string(),
    content: schema.string(),
    date: schema.string(),
    done: schema.boolean(),
});

export type Todo = schema.infer<typeof TodoSchema>;
