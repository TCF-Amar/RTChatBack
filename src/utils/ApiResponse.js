class ApiResponse {
    constructor(
        statusCode = 200,
        message = "Request successful",
        data = null
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = true;
    }

    toJSON() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data
        };
    }
}

export { ApiResponse };
