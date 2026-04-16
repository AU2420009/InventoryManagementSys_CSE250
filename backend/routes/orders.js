import express from "express";
import { createOrder, getCustomerOrders, deleteOrder } from "../controllers/ordersController.js";

const router = express.Router();

router.post("/", createOrder);

export default router;
