require('dotenv').config();         // read environment variables from .env file
const express = require('express'); 
const cors = require('cors');       // middleware to enable CORS (Cross-Origin Resource Sharing)

const app = express();
const port = process.env.PORT;	 	
const host = process.env.HOST;

app.use(cors()); //enable ALL CORS requests (client requests from other domain)
app.use(express.json()); //enable parsing JSON body data

// root route -- /api/
app.get('/', function (req, res) {
    res.status(200).json({ message: 'home -- AUTME api' });
});

// routing middleware (mounted on /autme route)
app.use('/users', require('./routes/users.routes.js'))
app.use('/achievements', require('./routes/achievements.routes.js'))
app.use('/appointments', require('./routes/appointments.routes.js'))
app.use('/emotions', require('./routes/emotions.routes.js'))
app.use('/notes', require('./routes/notes.routes.js'))
app.use('/images', require('./routes/images.routes.js'))


// handle invalid routes
app.get('*', function (req, res) {
	res.status(404).json({ message: 'WHAT???' });
})
app.listen(port, host, () => console.log(`App listening at http://${host}:${port}/`));
