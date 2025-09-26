import "dotenv/config";
import { server } from './socket.js';
import connectDB from "./db/connectDB.js";

const PORT = process.env.PORT || 4000


connectDB().then(() => { 

    
    server.listen(PORT, () => {
        console.log('Server is running on http://localhost:' + PORT);
    });
}).catch((error) => console.log(error));