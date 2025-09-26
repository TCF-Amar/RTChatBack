import "dotenv/config";
import { server } from './src/socket.js';
import connectDB from "./src/db/connectDB.js";

const PORT = process.env.PORT || 4000


connectDB().then(() => { 

    
    server.listen(PORT, () => {
        console.log('Server is running on http://localhost:' + PORT);
    });
}).catch((error) => console.log(error));