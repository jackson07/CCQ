interface TodoRepositoryGetParams {
    page: number;
    limit: number;
}
interface TodoRepositoryGetOutput {
    todos: Todo[];
    total: number;
    pages: number;
}

function get({
    page,
    limit,
}: TodoRepositoryGetParams): Promise<TodoRepositoryGetOutput> {
    return fetch(`/api/todos?page=${page}&limit=${limit}`).then(
        async (serverAnswer) => {
            const todosString = await serverAnswer.text();
            const responseParsed = parseTodosFromServer(
                JSON.parse(todosString)
            );

            return {
                total: responseParsed.total,
                todos: responseParsed.todos,
                pages: responseParsed.pages,
            };
        }
    );
}

export const todoRepository = {
    get,
};

// Model
interface Todo {
    id: string;
    content: string;
    data: Date;
    done: boolean;
}

function parseTodosFromServer(responseBody: unknown): {
    total: number;
    pages: number;
    todos: Array<Todo>;
} {
    if (
        responseBody !== null &&
        typeof responseBody === "object" &&
        "todos" in responseBody &&
        "total" in responseBody &&
        "pages" in responseBody &&
        Array.isArray(responseBody.todos)
    ) {
        return {
            total: Number(responseBody.total),
            pages: Number(responseBody.pages),
            todos: responseBody.todos.map((todo: unknown) => {
                if (todo === null && typeof todo !== "object") {
                    throw new Error("Invalid todo from API");
                }

                const { id, content, data, done } = todo as {
                    id: string;
                    content: string;
                    data: string;
                    done: string;
                };

                return {
                    id,
                    content,
                    data: new Date(data),
                    done: String(done).toLowerCase() === "true",
                };
            }),
        };
    }

    return {
        pages: 1,
        total: 0,
        todos: [],
    };
}
