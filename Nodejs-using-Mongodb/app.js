const path = require('path');
const express = require('express');
const bodyparser = require('body-parser');

const errorController = require ('./controllers/error')
const mongoConnect = require ('./util/database').mongoConnect
const User = require ('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyparser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById("5f2fcd802274cfa1e5c87ebe")
    .then(user => {
        req.user = new User(user.username, user.email, user.cart, user._id);
        next();
    })
    .catch(err => console.log(err));
})

app.use('/admin',adminRoutes);

app.use(shopRoutes);

app.use(errorController.get404page);

mongoConnect(() => {
    app.listen(3000);
})
        