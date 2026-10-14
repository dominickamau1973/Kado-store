import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    //Get the Authorization header
    const authHeader = req.headers.authorization;

    //Check if the header exists
    if (!authHeader) {
      return res.status(401).json({
        message: "No authentication token provided",
      });
    }

    //Check that it uses Bearer authentication
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authentication format",
      });
    }

    //Extract the token
    const token = authHeader.split(" ")[1];

    //Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Store user information in the request
    req.user = decoded;

    //Continue to the next middleware/route
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
