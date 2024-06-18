

const isAuthenticated = async (req, res, next) => {
    try {
           if (req.session.user) {
            console.log("kjhgfdsa");
            return next();
        } else {
            console.log("kjhgf");
            res.status(401).send('You are not authenticated');
        }

    } catch (error) {

        res.status(401).json({
            error
        })
    }

}

module.exports = isAuthenticated