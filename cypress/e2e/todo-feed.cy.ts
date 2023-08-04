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
                        id: "0dac397c-af67-4028-a4f6-1f664e65aac4",
                        date: "2022-02-01T16:38:19.126Z",
                        content: "Test todo",
                        done: false,
                    },
                },
            });
        }).as("createTodo");

        cy.visit(BASE_URL);
        cy.get("input[name='add-todo']").type("Test todo");
        cy.get("[aria-label='Adicionar novo item']").click();

        cy.get("table > tbody").contains("Test todo");

        expect("texto").to.be.equal("texto");
    });
});
