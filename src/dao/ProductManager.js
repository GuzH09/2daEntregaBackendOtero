import * as fs from 'fs';

export default class ProductManager {
    #nextId;

    constructor () {
        this.path = './src/products.json';
        this.#nextId = 0

        // Initialize nextId based on existing products
        this._initializeNextId();
    }

    async getProducts() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw error;
        }
    }

    async getProductById(id) {
        let fileProducts = await this.getProducts();
        const product = fileProducts.find(product => product.id === id);
        if (product) {
            return product;
        } else {
            return {error: "That product doesn't exists."};
        }
    }

    async addProduct(productObj) {
        // Validates field "code" doesn't appear twice
        let fileProducts = await this.getProducts();
        if (fileProducts.some(product => product.code === productObj.code)) {
            return {error: `Error: code ${productObj.code} already exists.`};
        }

        // Add new product with id
        const newProduct = {
            id: this.#nextId,
            status: true,
            thumbnails: productObj.thumbnails ? productObj.thumbnails : [],
            ...productObj
        };
        this.#nextId++
        fileProducts.push(newProduct);
        await this._saveProductsToFile(fileProducts);
        return {success: "Product added."};
    }

    async updateProduct(id, productData) {
        let fileProducts = await this.getProducts();
        const productIndex = fileProducts.findIndex(product => product.id === id);
        if (productIndex === -1) {
            return {error: `Product with id ${id} not found.`};
        }

        const updatedProduct = { ...fileProducts[productIndex], ...productData };
        fileProducts[productIndex] = updatedProduct;
        await this._saveProductsToFile(fileProducts);
        return {success: "Product updated."};
    }

    async deleteProduct(id) {
        let fileProducts = await this.getProducts();
        const productIndex = fileProducts.findIndex(product => product.id === id);
        if (productIndex === -1) {
            return {error: `Product with id ${id} not found.`};
        }
        fileProducts.splice(productIndex, 1);
        await this._saveProductsToFile(fileProducts);
        return {success: "Product deleted."};
    }

    async _saveProductsToFile(productData) {
        const data = JSON.stringify(productData, null, "\t");
        await fs.promises.writeFile(this.path, data);
    }

    async _initializeNextId() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf8');
            const products = JSON.parse(data);

            // Find the maximum ID from existing products
            if (products.length === 0) {
                // If there are no existing products, start with ID 0
                this.#nextId = 0;
            } else {
                const maxId = products.reduce((max, product) => (product.id > max ? product.id : max), 0);
                this.#nextId = maxId + 1;
            }

        } catch (error) {
            // If the file doesn't exist or there is an error reading it, leave nextId as 0
            console.error(`Error initializing nextId: ${error.message}`);
        }
    }
}