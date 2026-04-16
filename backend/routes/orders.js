import express from "express";
import { createOrder, getCustomerOrders, getAllOrders, deleteOrder } from "../controllers/ordersController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/customer/:customerId", getCustomerOrders);
router.get("/", getAllOrders);
router.delete("/:orderId", deleteOrder);

export default router;
