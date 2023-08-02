const base_URL = "http://localhost:3000";

describe("/ - Todos Feed", () => {
    it("when load, renders the page,", () => {
        cy.visit(base_URL);
    });
    
    it("when crate a new todo, it must appers in the screen", () => {
        cy.intercept("POST", `${base_URL}/api/todos`, (request) => {
            request.reply({
                statusCode: 201,
                body: {
                    todo: {
                        id: "0dac397c-af67-4028-a4f6-1f664e65aac4",
                        date: "2023-07-14T01:33:13.636Z",
                        content: "Test todo",
                        done: false,
                    },
                },
            });
        }).as("createTodo");

        cy.visit(base_URL);
        cy.get("input[name='add-todo']").type("Test todo");
        cy.get("[aria-label='Adicionar novo item']").click();
        cy.get("table > tbody").contains("Test todo");
    });
});
