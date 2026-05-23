import Product from "../../models/product.model.js";

const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
}

const getProductById = async (req, res) => {
    try {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
        const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };
        const product = await Product.findOne(query);
        if (!product) {
            return res.status(404).json({ message: "Product not found!" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }
}

const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };
        delete productData._id;
        delete productData.__v;
        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: "Error creating product", error: error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.__v;
        delete updateData.id;

        const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
        const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };
        const updatedProduct = await Product.findOneAndUpdate(
            query,
            updateData,
            { returnDocument: "after" }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: "Error updating product", error: error.message });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
        const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };
        const deletedProduct = await Product.findOneAndDelete(query);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
}

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct }
