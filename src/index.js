const express = require('express')
const { engine } = require('express-handlebars');
const app = express();
const port = 8080;

//Sets handlebars configurations (we will go through them later on)
app.engine('handlebars', engine());

//Sets our app to use the handlebars engine
app.set('view engine', 'handlebars');
app.set("views", "./src/views");

app.use(express.static('./src/public'));
app.use(express.static('./dist'));

app.get('/', (req, res) => {
    // res.render('home');
    res.render('about');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/projects/habitTracker', (req, res) => {
    res.render('habitTracker');
});

app.get('/projects/brainWebGL', (req, res) => {
    res.render('brainWebGL');
});

app.use(function(req, res) {
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(port, () => console.log(`App listening to port ${port}`));
