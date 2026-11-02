import cds from '@sap/cds';

export default class NorthwindService extends cds.ApplicationService {
    async init() {
        const { ImportedProducts } = this.entities;
        const { SELECT, INSERT } = cds.ql;

        this.on('importNextProduct', async (req) => {
            // Find the highest product ID already imported.
            const latest = await SELECT.one
                .from(ImportedProducts)
                .columns('productID')
                .orderBy('productID desc');

            const lastProductID = latest?.productID ?? 0;

            // Ask Northwind for the next available product.
            const url = new URL(
                'Products',
                'https://services.odata.org/V4/Northwind/Northwind.svc/'
            );

            url.searchParams.set('$filter',`ProductID gt ${lastProductID}`);
            url.searchParams.set('$orderby', 'ProductID asc');
            url.searchParams.set('$top', '1');

            const response = await fetch(url);

            if (!response.ok) {
                return req.reject(
                    502,
                    `Northwind returned HTTP ${response.status}`
                );
            }

            const result = await response.json();
            const product = result.value?.[0];

            if (!product) {
                return req.reject(404, 'No more products to import.');
            }

            // Map Northwind's field names to our CDS entity.
            const record = {
                productID: product.ProductID,
                productName: product.ProductName,
                supplierID: product.SupplierID ?? null,
                categoryID: product.CategoryID ?? null,
                quantityPerUnit: product.QuantityPerUnit ?? null,
                unitPrice: product.UnitPrice ?? null,
                unitsInStock: product.UnitsInStock ?? null,
                unitsOnOrder: product.UnitsOnOrder ?? null,
                reorderLevel: product.ReorderLevel ?? null,
                discontinued: product.Discontinued ?? false,
                importedAt: new Date().toISOString()
            };

            // Insert one product into the CAP database.
            await INSERT.into(ImportedProducts).entries(record);

            return await SELECT.from(ImportedProducts).orderBy('productID asc');
        });

        return super.init();
    }
}