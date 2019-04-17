var sessionChecker = (req, res, next) => {
    if (req.session.user || req.cookies.user) {
      next();
    } else {
      res.redirect('/login')
    }
  };
  module.exports=sessionChecker