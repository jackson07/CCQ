import {
    create,
    read,
    update,
    deleteById as dbDeleteById,
} from "@db-crud-todo";
import { HttpNotFoundError } from "@server/infra/errors";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
});

interface TodoRepositoryGetParams {
    page?: number;
    limit?: number;
}

interface TodoRepositoryGetOutput {
    todos: Todo[];
    total: number;
    pages: number;
}

async function get({
    page,
    limit,
}: TodoRepositoryGetParams = {}): Promise<TodoRepositoryGetOutput> {
    const { data, error, count } = await supabase.from("todos").select("*", {
        count: "exact",
    });
    if (error) throw new Error("Failed to fetch data.");

    const todos = data as Todo[];
    const total = count || todos.length;

    return {
        total,
        todos,
        pages: 1,
    };
}

async function createdByContent(content: string): Promise<Todo> {
    const newTodo = create(content);

    return newTodo;
}

async function toggleDone(id: string): Promise<Todo> {
    const ALL_TODOS = read();

    const todo = ALL_TODOS.find((todo) => todo.id === id);

    if (!todo) throw new Error(`Todo with id "${id}" not found`);

    const updateTodo = update(id, {
        done: !todo.done,
    });

    return updateTodo;
}

async function deleteById(id: string) {
    const ALL_TODOS = read();

    const todo = ALL_TODOS.find((todo) => todo.id === id);

    if (!todo) throw new HttpNotFoundError(`Todo with id "${id}" not found`);

    dbDeleteById(id);
}

export const todoRepository = {
    get,
    createdByContent,
    toggleDone,
    deleteById,
};

// Model
interface Todo {
    id: string;
    content: string;
    date: string;
    done: boolean;
}
