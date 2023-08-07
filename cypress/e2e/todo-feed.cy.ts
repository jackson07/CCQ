const BASE_URL = "http://localhost:3000";

describe("/ - Todos Feed", () => {
    it("when load, renders the page", () => {
        cy.visit(BASE_URL);
    });
    it("when create a new todo, it must appears in the screen", () => {
        // 0 - Interceptações/Intertecptação
        cy.intercept("POST", `${BASE_URL}/api/todos`, (req) => {
            req.reply({
                statusCode: 201,
                body: {
                    todo: {
                        id: "70905d7e-c969-45b1-99f0-1aa155477204",
                        date: "2023-04-15T19:46:51.109Z",
                        content: "Test todo",
                        done: false,
                    },
                },
            });
        }).as("createTodo");

        cy.visit(BASE_URL);
        cy.get("input[name='add-todo']").type("Correr");
        cy.get("[aria-label='Adicionar novo item']").click();

        cy.get("table > tbody").contains("Correr");

        expect("texto").to.be.equal("texto");
    });
});
