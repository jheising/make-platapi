import { Get } from "platapi";

export default class SampleAPI {
    @Get
    static async getUserByID(userID: string) {
        return {
            id: userID,
            firstName: "Jill",
            lastName: "Johnson"
        };
    }
}
