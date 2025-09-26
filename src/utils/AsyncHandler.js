const asyncHandler = (requestHandler) => {
    return function asyncMiddleware(req, res, next) {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    };
};

export { asyncHandler };