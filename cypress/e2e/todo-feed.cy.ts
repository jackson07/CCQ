const BASE_URL = "http://localhost:3000";

describe("/ - Todos Feed", () => {
    it("when load, renders the page", () => {
        cy.visit(BASE_URL);
    });
    it("when create a new todo, it must appears in the screen", () => {
        // 0 - Interceptações/Intertecptação
        cy.intercept("POST", `${BASE_URL}/api/todos`, (request) => {
            request.reply({
                statusCode: 201,
                body: {
                    todos: {
                        id: "23458947-856f-469d-83e3-75e66f6ce6hg",
                        date: "2023-08-01T15:35:14.676Z",
                        content: "Jantar",
                        done: false,
                    },
                },
            });
        }).as("createTodo");

        cy.visit(BASE_URL);

        cy.get("input[name='add-todo']").type("Jantar");
        cy.get("[aria-label='Adicionar novo item']").click();

        cy.get("table > tbody").contains("Jantar");

        expect("texto").to.be.equal("texto");
    });
});
