import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        video: false,
        screenshotOnRunFailure: false,
        setupNodeEvents() {
            // implement node event listeners here
        },
    },
});
