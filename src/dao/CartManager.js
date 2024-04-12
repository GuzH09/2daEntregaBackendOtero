import * as fs from 'fs';

export default class CartManager {
    #nextId;

    constructor () {
        this.path = './src/carts.json';
        this.#nextId = 0

        // Initialize nextId based on existing products
        this._initializeNextId();
    }

    async getCarts() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw error;
        }
    }

    async getCartById(id) {
        let fileCarts = await this.getCarts();
        const cart = fileCarts.find(cart => cart.id === id);
        if (cart) {
            return cart;
        } else {
            return {error: "That cart doesn't exists."};
        }
    }

    async addCart() {
        let fileCarts = await this.getCarts();
        // Add new cart with id
        const newCart = {
            id: this.#nextId,
            products: []
        };
        this.#nextId++
        fileCarts.push(newCart);
        await this._saveCartsToFile(fileCarts);
        return {success: "Cart added."};
    }

    async AddProductToCart(cartId, productId) {
        let fileCarts = await this.getCarts();
        // Validates if cart exists
        const cartIndex = fileCarts.findIndex(cart => cart.id === cartId);
        if (cartIndex === -1) {
            return {error: `Cart with id ${cartId} not found.`};
        }

        const productIndex = fileCarts[cartIndex]['products'].findIndex(product => product.product === productId);
        // If product doesn't exist on the cart, and its a valid product
        if (productIndex === -1) {
            // Add the product to the cart
            const newProduct = {
                product: productId,
                quantity: 1
            }
            fileCarts[cartIndex]['products'].push(newProduct)
        } else {
            // If it already exists, quantity should go up by 1
            fileCarts[cartIndex]['products'][productIndex]['quantity']++;
        }

        await this._saveCartsToFile(fileCarts);
        return {success: `Product ${productId} added on cart ${cartId}.`};
    }

    async _saveCartsToFile(cartData) {
        const data = JSON.stringify(cartData, null, "\t");
        await fs.promises.writeFile(this.path, data);
    }

    async _initializeNextId() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf8');
            const carts = JSON.parse(data);

            // Find the maximum ID from existing products
            if (carts.length === 0) {
                // If there are no existing products, start with ID 0
                this.#nextId = 0;
            } else {
                const maxId = carts.reduce((max, cart) => (cart.id > max ? cart.id : max), 0);
                this.#nextId = maxId + 1;
            }

        } catch (error) {
            // If the file doesn't exist or there is an error reading it, leave nextId as 0
            console.error(`Error initializing nextId: ${error.message}`);
        }
    }
}