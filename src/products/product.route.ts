import express, { Request, Response, NextFunction } from "express";
import { Product, UnitProduct } from "./product.interface";
import * as database from "./product.databases";
import { StatusCodes } from "http-status-codes";

// Create asyncHandler function
const asyncHandler = (fn: Function) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);  // Automatically handle errors
    };

export const productRouter = express.Router();

// Get all products
productRouter.get('/products', asyncHandler(async (req: Request, res: Response) => {
    const allProducts = await database.findAll();
    
    if (!allProducts) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: "No Products Found..." });
    }

    return res.status(StatusCodes.OK).json({ total: allProducts.length, allProducts });
}));

// Get a specific product by ID
productRouter.get("/product/:id", asyncHandler(async (req: Request, res: Response) => {
    const product = await database.findOne(req.params.id);

    if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: "Product does not exist..." });
    }

    return res.status(StatusCodes.OK).json({ product });
}));

// Create a new product
productRouter.post("/product", asyncHandler(async (req: Request, res: Response) => {
    const { name, price, quantity, image } = req.body;

    if (!name || !price || !quantity || !image) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters." });
    }

    const newProduct = await database.create({ ...req.body });
    return res.status(StatusCodes.CREATED).json({ newProduct });
}));

// Update an existing product
productRouter.put("/product/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const newProduct = req.body;

    const findProduct = await database.findOne(id);

    if (!findProduct) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: "Product does not exist." });
    }

    const updatedProduct = await database.update(id, newProduct);
    return res.status(StatusCodes.OK).json({ updatedProduct });
}));

// Delete a product by ID
productRouter.delete("/product/:id", asyncHandler(async (req: Request, res: Response) => {
    const getProduct = await database.findOne(req.params.id);

    if (!getProduct) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: "No Product with ID ${req.params.id} found" });
    }

    await database.remove(req.params.id);
    return res.status(StatusCodes.OK).json({ msg: "Product Deleted" });
}));