import { Router } from "express";
import ProductManagerDB from "../dao/ProductManagerDB.js";
import { uploader } from "../utils/multerUtil.js";
import productModel from "../dao/models/productModel.js";

const productsRouter = Router();
const PM = new ProductManagerDB();

// Get All Products - Get All Products With Limit
productsRouter.get('/', async (req, res) => {
    try {
        // Con base en nuestra implementación actual de productos, modificar el método GET / 
        // para que cumpla con los siguientes puntos: ✅

        //     * Deberá poder recibir por query params un 
        //         - limit (opcional), 
        //         - una page (opcional), 
        //         - un sort (opcional) 
        //         - y un query (opcional)
        let { page = 1, limit = 10, sort } = req.query;
        
        //     * limit permitirá devolver sólo el número de elementos solicitados al 
        //          momento de la petición, en caso de no recibir limit, éste será de 10.
        //     * page permitirá devolver la página que queremos buscar, en caso de 
        //          no recibir page, ésta será de 1
        //     * sort: asc/desc, para realizar ordenamiento ascendente o descendente por precio, 
        //          en caso de no recibir sort, no realizar ningún ordenamiento
        //     * query, el tipo de elemento que quiero buscar (es decir, qué filtro aplicar), 
        //          en caso de no recibir query, realizar la búsqueda general
        page = parseInt(page);
        limit = parseInt(limit);

        const options = {
            page,
            limit,
            lean: true
        };

        // Se deberá poder buscar productos por categoría o por disponibilidad, 
        // y se deberá poder realizar un ordenamiento de estos productos de 
        // manera ascendente o descendente por precio. 
        const sortOptions = {};
        if (sort === 'asc') {
            sortOptions.price = 1;
        } else if (sort === 'desc') {
            sortOptions.price = -1;
        }
        const queryOptions = {};
        if (req.query.category) {
            queryOptions.category = req.query.category;
        } else if (req.query.stock) {
            queryOptions.stock = parseInt(req.query.stock);
        }
        options.sort = sortOptions;

        const result = await productModel.paginate(queryOptions, options);

        const baseURL = "http://localhost:8080/api/products";
        if (result.hasPrevPage) {
            let strURLprev = `${baseURL}?page=${result.prevPage}`;
            for (const itemQueryKey in req.query) {
                if (itemQueryKey != 'page') {
                    strURLprev = strURLprev + '&' + itemQueryKey + '=' + req.query[itemQueryKey]
                }
            }
            result.prevLink = strURLprev;
        } else {
            result.prevLink = "";
        }

        if (result.hasNextPage) {
            let strURLprev = `${baseURL}?page=${result.nextPage}`;
            for (const itemQueryKey in req.query) {
                if (itemQueryKey != 'page') {
                    strURLprev = strURLprev + '&' + itemQueryKey + '=' + req.query[itemQueryKey]
                }
            }
            result.nextLink = strURLprev;
        } else {
            result.nextLink = "";
        }
        result.isValid = !(page <= 0 || page > result.totalPages);

        // El método GET deberá devolver un objeto con el siguiente formato:
        // {
        // 	status:success/error
        //  payload: Resultado de los productos solicitados
        //  totalPages: Total de páginas
        //  prevPage: Página anterior
        //  nextPage: Página siguiente
        //  page: Página actual
        //  hasPrevPage: Indicador para saber si la página previa existe
        //  hasNextPage: Indicador para saber si la página siguiente existe.
        //  prevLink: Link directo a la página previa (null si hasPrevPage=false)
        //  nextLink: Link directo a la página siguiente (null si hasNextPage=false)
        // }
        const response = {
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.prevLink,
            nextLink: result.nextLink,
            isValid: result.isValid
        };

        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get Product By Id
productsRouter.get('/:pid', async (req, res) => {
    let productId = req.params.pid;
    const products = await PM.getProductById(productId);
    products['error'] ? res.status(400).send(products) : res.send({...products, _id: products._id.toString()});
});

// Create New Product
productsRouter.post('/', uploader.array('thumbnails'), async (req, res) => {
    if (!req.files) {
        return res.status(400).send({error: "Error uploading image."})
    }

    const thumbnails = req.files.map(file => file.path);

    // Get Product Data from Body
    let { title, description, code, price, stock, category } = req.body;

    // Status is true by default
    // Thumbnails is not required, [] by default
    const newObjectData = {title, description, code, price, stock, category, thumbnails};
    const result = await PM.addProduct(newObjectData);
    result['success'] ? res.status(201).send(result) : res.status(400).send(result);
});

// Update Existing Product
productsRouter.put('/:pid', async (req, res) => {
    // Get Product Data from Body
    let { title, description, code, price, stock, category, thumbnails } = req.body;
    // Get Product Id from Params
    let productId = req.params.pid;

    const newObjectData = {title, description, code, price, stock, category, thumbnails};
    const result = await PM.updateProduct( productId, newObjectData );
    result['success'] ? res.status(201).send(result) : res.status(400).send(result);
});

// Delete Existing Product
productsRouter.delete('/:pid', async (req, res) => {
    // Get Product Id from Params
    let productId = req.params.pid;
    const result = await PM.deleteProduct(productId);
    result['success'] ? res.status(201).send(result) : res.status(400).send(result);
});

export default productsRouter;