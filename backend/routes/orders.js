import express from "express";
import { createOrder, getCustomerOrders, deleteOrders } from "../controllers/ordersController.js";

const router = express.Router();

router.post("/", createOrder);

export default router;
