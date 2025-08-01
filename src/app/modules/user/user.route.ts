import { Router } from "express";
import { UserControllers } from "./user.controller";
import { User } from "./user.model";


const router = Router();

router.post("/register", UserControllers.createUser);
router.get("/all-users", UserControllers.getAllUsers);

export const UserRoutes = router;