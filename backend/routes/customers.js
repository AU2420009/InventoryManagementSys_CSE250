import express from "express";
import { getCustomers, createCustomer, deleteCustomer } from "../controllers/customersController.js";

const router = express.Router();

router.get("/", getCustomers);
router.post("/", createCustomer);
router.delete("/:customerId", deleteCustomer);

export default router;
