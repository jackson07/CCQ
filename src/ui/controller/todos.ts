import { todoRepository } from "@ui/repository/todos";
import { Todo } from "@ui/schema/todo";

interface TodoControllerGetParams {
    page: number;
}

async function get({ page }: TodoControllerGetParams) {
    return todoRepository.get({ page: page || 1, limit: 2 });
}

function filterTodosByContent<Todo>(
    search: string,
    todos: Array<Todo & { content: string }>
): Todo[] {
    const homeTodos = todos.filter((todo) => {
        const searchNormalized = search.toLowerCase();
        const contentNormalized = todo.content.toLowerCase();
        return contentNormalized.includes(searchNormalized);
    });

    return homeTodos;
}

interface TodoControllerCreateParams {
    content?: string;
    onError: (errorMessage?: string) => void;
    onSuccess: (todo: Todo) => void;
}
async function create({
    content,
    onError,
    onSuccess,
}: TodoControllerCreateParams) {
    if (!content) {
        onError("Todo sem conteúdo");
        return;
    }

    todoRepository
        .createByContent(content)
        .then((newTodo) => {
            onSuccess(newTodo);
        })
        .catch(() => {
            onError();
        });
}

export const todoController = {
    get,
    filterTodosByContent,
    create,
};
