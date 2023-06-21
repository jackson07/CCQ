async function get() {
    return fetch("/api/todos").then(async (serverAnswer) => {
        const todosString = await serverAnswer.text();
        return JSON.parse(todosString).todos;
    });
}

export const todoController = {
    get,
};
