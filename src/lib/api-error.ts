export class ApiError extends Error {
    constructor(public statusCode: number, public override message: string) {
        super(message);
    }
}