const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(product => {
            res.render('shop/index', {
                path: '/',
                pageTitle: 'Shop',
                prods: product,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(product => {
            res.render('shop/product-list', {
                path: '/products',
                pageTitle: 'Shop',
                prods: product,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-detail', {
                path: '/products',
                pageTitle: product.title,
                product: product,
                isAuthenticated: req.session.isLoggedIn
            });
        }).catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err))
}

exports.postOrders = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } }
            });
            const order = new Order({
                user: {
                    name: req.user.name,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err))
}

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            console.log(user);
            console.log(user.cart.items);
            const products = user.cart.items;
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products,
                isAuthenticated: req.session.isLoggedIn
            });
        }).catch(err => console.log(err));
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        }).then(result => {
            console.log(result);
            res.redirect('/cart');
        }).catch(err => {
            console.log(err);
        })
};

exports.postCartDeleteItem = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .removeFromCart(prodId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err))
}


