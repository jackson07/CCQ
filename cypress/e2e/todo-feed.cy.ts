describe("/ - Todos Feed", () => {
    const BASE_URL = "http://localhost:3000";
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
                        id: "d78c96b8-89ee-452f-b7f8-6495b57ebd4f",
                        date: "2023-08-01T15:35:14.676Z",
                        content: "Test",
                        done: false,
                    },
                },
            });
        }).as("createTodo");

        cy.visit(BASE_URL);

        cy.get("input[name='add-todo']").type("Test");
        cy.get("button[name='addButton']").click();
        //cy.get("[aria-label=Adicionar novo item']").click();
        cy.get("table > tbody").contains("Test");

        expect("texto").to.be.equal("texto");
    });
});
