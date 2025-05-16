import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Use the session store from storage.ts with more secure settings
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "snaptrade-session-secret-key-12345",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: false, // set to true in production with HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      path: '/',
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  
  // Set up session middleware
  app.use(session(sessionSettings));
  
  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Debug middleware to log session and auth state on each request
  app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.path}`);
    console.log(`Session ID: ${req.sessionID || 'none'}`);
    console.log(`Is Authenticated: ${req.isAuthenticated()}`);
    if (req.user) {
      console.log(`User ID: ${req.user.id}`);
    }
    next();
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false); // User not found
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }

      if (req.body.email) {
        const existingUserByEmail = await storage.getUserByEmail(req.body.email);
        if (existingUserByEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }

      // Generate a more readable unique referral code based on username
      let referralCode;
      let isUnique = false;
      
      // Loop until we generate a unique referral code
      while (!isUnique) {
        const userPart = req.body.username.slice(0, 5).toLowerCase();
        const randomPart = nanoid(5).toLowerCase();
        referralCode = `${userPart}-${randomPart}`;
        
        // Check if this referral code already exists
        const existingUser = await storage.getUserByReferralCode(referralCode);
        
        // Also check if it matches any custom names
        const existingUserCustomName = await storage.getUserByCustomName(referralCode);
        
        // If no conflicts, we have a unique code
        if (!existingUser && !existingUserCustomName) {
          isUnique = true;
        }
      }
      
      // Create new user with hashed password and referral code
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        referralCode,
        referralCustomName: null,
        referralBonusBalance: 0
      });

      // Check if user was referred
      const { referredBy } = req.body;
      if (referredBy) {
        try {
          // First check if the user has already been referred (this should never happen, but just in case)
          const existingReferrals = await storage.getUserReferrals(user.id);
          if (existingReferrals.length === 0) {
            // This is the user's first referral - proceed
            const referrer = await storage.getUserByReferralCode(referredBy);
            
            if (referrer) {
              // Check if referrer has an active subscription - only active subscribers can refer
              const referrerSubscriptionStatus = await storage.getUserSubscriptionStatus(referrer.id);
              
              if (referrerSubscriptionStatus.active) {
                // Create a referral record
                await storage.createReferral({
                  referrerId: referrer.id,
                  referredId: user.id,
                  bonusAwarded: false,
                  subscriptionPurchased: false
                });
                console.log(`User ${user.username} referred by ${referrer.username} with active subscription`);
              } else {
                console.log(`Referral not processed: Referrer ${referrer.username} does not have an active subscription`);
              }
            }
          } else {
            console.log(`User ${user.username} already has been referred - ignoring referral`);
          }
        } catch (error) {
          console.error("Error processing referral:", error);
          // Continue with registration even if referral fails
        }
      }

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for username:", req.body.username);
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Authentication failed:", info?.message);
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      
      console.log("User authenticated, establishing session for user ID:", user.id);
      
      req.login(user, (err) => {
        if (err) {
          console.error("Session establishment error:", err);
          return next(err);
        }
        
        console.log("Session established successfully, user logged in");
        console.log("Session ID:", req.sessionID);
        console.log("Is authenticated:", req.isAuthenticated());
        console.log("User in session:", req.user);
        
        return res.json(user);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).json({ error: "Not authenticated" });
  });
}