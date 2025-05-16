import { Request, Response, NextFunction } from "express";

// Add a dedicated authentication check endpoint
export const setupAuthCheckEndpoint = (app: any) => {
  app.get("/api/check-auth", (req: Request, res: Response) => {
    console.log("Auth check request received");
    console.log("Is authenticated:", req.isAuthenticated());
    console.log("Session ID:", req.sessionID);
    
    if (req.isAuthenticated()) {
      res.json({
        authenticated: true,
        message: "User is authenticated",
        sessionID: req.sessionID,
        user: {
          id: req.user.id,
          username: req.user.username,
          isProvider: req.user.isProvider
        }
      });
    } else {
      res.json({
        authenticated: false,
        message: "Not authenticated",
        sessionID: req.sessionID
      });
    }
  });
};