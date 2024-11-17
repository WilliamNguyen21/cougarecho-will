const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080']

const corsOptions = {
    origin: (origin, callback) => {
        console.log('Request from origin:', origin);
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}

export default corsOptions;