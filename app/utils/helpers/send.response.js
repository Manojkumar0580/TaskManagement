module.exports = {
    out: function (request, response, data) {
        if (data.statusCode === 401) {
            response.status(data.statusCode).json({
                message: 'Unauthorized user'
            });
        } else if (data.statusCode === 500) {
            response.status(data.statusCode).json({
                message: 'Internal server error Or Invalid data'
            });
        } else if (data.statusCode === 400) {
            response.status(data.statusCode).json({
                message: 'Bad request',
                fields: data
            });
        } else if (data.statusCode === 300) {
            response.status(data.statusCode).json({
                message: data
            });
        } else if (data.statusCode === 404) {
            response.status(data.statusCode).json({
                message: data.message
            });
        } else {
            /*200*/
            if (typeof data === 'object' && data && (data.message || data.data)) {
                /*with data or messgae */
                response.status(data.statusCode).json(data);
            } else if (typeof data === 'object' && data) {
                /*only object without data prop*/
                response.status(data.statusCode).json({
                    data: data
                });
            } else {
                /*only string */
                response.status(data.statusCode).json({
                    message: data ? resultData : 'success'
                });
            }
        }
    },
}