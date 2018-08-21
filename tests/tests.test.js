const backend = require("../backend");
const common = require("../../common-code/common");
const C = common.CONSTANTS;
const request = require("supertest");
const app = require("../app");

jest.setTimeout(60000);

describe("API", () => {
    test("Authentication works", async () => {
        // prepare

        // test
        let response = await request(app).post("/select-seat");
        // assert
        expect(response.statusCode).toBe(401);
    });
});
